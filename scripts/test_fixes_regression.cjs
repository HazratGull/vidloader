const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\c8347450-d54b-4da0-9cb7-a9597e445053';

async function runTest() {
  console.log('=== STARTING REGRESSION TEST FOR DOWNLOAD FIXES & UI UX ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('1. Page loaded successfully.');

  // Paste test video URL
  const inputEl = await page.$('.downloader-input');
  const submitBtn = await page.$('.btn-download-primary');
  await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await submitBtn.click();
  console.log('2. Submitted video URL for format extraction...');

  await page.waitForSelector('.savefrom-format-table', { timeout: 15000 });
  console.log('3. Format table appeared!');

  // Check 1: Verify Video tab formats are strictly unique and sorted descending
  const videoFormatLabels = await page.$$eval('.savefrom-row .savefrom-label-text', els => els.map(e => e.textContent.trim()));
  console.log('Video Tab format labels found:', videoFormatLabels);

  const uniqueVideoLabels = new Set(videoFormatLabels);
  if (uniqueVideoLabels.size !== videoFormatLabels.length) {
    throw new Error(`Duplicate formats detected in Video tab! Found: ${JSON.stringify(videoFormatLabels)}`);
  }
  console.log('PASS: All Video tab format labels are strictly unique (no duplicate 1080p or 720p)!');

  // Verify descending sort
  const heights = videoFormatLabels.map(l => {
    const m = l.match(/(\d+)p/);
    return m ? parseInt(m[1], 10) : 0;
  });
  for (let i = 1; i < heights.length; i++) {
    if (heights[i] > heights[i - 1]) {
      throw new Error(`Formats not sorted descending! Found ${heights[i - 1]}p before ${heights[i]}p`);
    }
  }
  console.log('PASS: Video formats are strictly sorted descending by resolution!');

  // Verify no audio labels exist in the video tab
  const hasAudioInVideoTab = videoFormatLabels.some(l => l.includes('MP3') || l.includes('M4A') || l.includes('kbps'));
  if (hasAudioInVideoTab) {
    throw new Error(`Audio formats found mixed in Video tab! ${JSON.stringify(videoFormatLabels)}`);
  }
  console.log('PASS: Video tab contains ONLY video formats (audio separated into Audio tab)!');

  // Check 2: Verify Audio tab formats
  const audioTabBtn = await page.$('.format-tab-btn:has-text("Audio")');
  await audioTabBtn.click();
  await page.waitForTimeout(300);

  const audioFormatLabels = await page.$$eval('.savefrom-row .savefrom-label-text', els => els.map(e => e.textContent.trim()));
  console.log('Audio Tab format labels found:', audioFormatLabels);

  const uniqueAudioLabels = new Set(audioFormatLabels);
  if (uniqueAudioLabels.size !== audioFormatLabels.length) {
    throw new Error(`Duplicate formats detected in Audio tab! Found: ${JSON.stringify(audioFormatLabels)}`);
  }
  console.log('PASS: All Audio tab format labels are strictly unique!');

  // Switch back to Video tab
  const videoTabBtn = await page.$('.format-tab-btn:has-text("Video")');
  await videoTabBtn.click();
  await page.waitForTimeout(300);

  // Check 3: Test single MP4 download (Must NOT download twice)
  console.log('\n--- Testing Single MP4 Download (Checking for duplicate download bug) ---');
  let mp4DownloadsCount = 0;
  page.on('download', (d) => {
    mp4DownloadsCount++;
    console.log(`[EVENT] Browser download triggered #${mp4DownloadsCount}: ${d.suggestedFilename()}`);
  });

  // Track progress numbers to verify monotonicity (percentage never comes down!)
  const progressNumbers = [];
  const progressCheckInterval = setInterval(async () => {
    try {
      const pill = await page.$('.progress-percentage-pill');
      if (pill) {
        const text = await pill.textContent();
        const num = parseInt(text.replace('%', '').trim(), 10);
        if (!isNaN(num)) progressNumbers.push(num);
      }
    } catch {}
  }, 100);

  const firstDownloadBtn = await page.$('.savefrom-btn-green');
  await firstDownloadBtn.click();
  console.log('Clicked first format download button...');

  // Wait for completed state
  await page.waitForSelector('.download-progress-card.is-complete', { timeout: 60000 });
  clearInterval(progressCheckInterval);

  console.log(`Recorded progress sequence:`, progressNumbers);
  for (let i = 1; i < progressNumbers.length; i++) {
    if (progressNumbers[i] < progressNumbers[i - 1]) {
      throw new Error(`Progress percentage came down! Decreased from ${progressNumbers[i - 1]}% to ${progressNumbers[i]}%`);
    }
  }
  console.log('PASS: Progress percentage is strictly monotonic (NEVER decreased)!');

  // Immediately capture screenshots across viewports while card is complete
  console.log('\n--- Capturing Screenshots and checking layout across Viewports ---');
  const viewports = [
    { width: 360, height: 640, name: '360x640' },
    { width: 390, height: 844, name: '390x844' },
    { width: 768, height: 1024, name: '768x1024' },
    { width: 1366, height: 768, name: '1366x768' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);

    // Check bounds of progress card and pill
    const cardRect = await page.$eval('.download-progress-card', el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });
    const pillRect = await page.$eval('.progress-percentage-pill', el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });

    console.log(`[Viewport ${vp.name}] Card right: ${cardRect.right.toFixed(1)}, Pill right: ${pillRect.right.toFixed(1)}`);
    if (pillRect.right > cardRect.right + 2) {
      throw new Error(`Overflow in ${vp.name}: pill right (${pillRect.right}) > card right (${cardRect.right})!`);
    }

    const shotPath = path.join(ARTIFACTS_DIR, `fixed_progress_card_${vp.name}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot -> ${shotPath}`);
  }

  // Wait 2 seconds to confirm no second download was triggered
  await page.waitForTimeout(2000);
  console.log(`Total MP4 downloads triggered: ${mp4DownloadsCount}`);
  if (mp4DownloadsCount !== 1) {
    throw new Error(`FAIL: Expected exactly 1 download, but received ${mp4DownloadsCount} downloads!`);
  }
  console.log('PASS: Exactly 1 download occurred (Duplicate MP4 download bug FIXED)!');

  // Check 5: Audio Download test (Must NOT download twice)
  console.log('\n--- Testing Audio Download (Checking for duplicate download bug on Audio) ---');
  // Dismiss review modal if shown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  const audioTab = await page.$('.format-tab-btn:has-text("Audio")');
  await audioTab.click();
  await page.waitForTimeout(400);

  let audioDownloadsCount = 0;
  const audioListener = (d) => {
    audioDownloadsCount++;
    console.log(`[EVENT] Audio download triggered: ${d.suggestedFilename()}`);
  };
  page.on('download', audioListener);

  const firstAudioDownloadBtn = await page.$('.savefrom-btn-green');
  await firstAudioDownloadBtn.click();

  await page.waitForSelector('.download-progress-card.is-complete', { timeout: 60000 });
  await page.waitForTimeout(2000);

  console.log(`Total Audio downloads triggered: ${audioDownloadsCount}`);
  if (audioDownloadsCount !== 1) {
    throw new Error(`FAIL: Expected exactly 1 audio download, but received ${audioDownloadsCount}!`);
  }
  console.log('PASS: Exactly 1 audio download occurred (Duplicate audio download bug FIXED)!');

  await browser.close();
  console.log('\n=== ALL REGRESSION AND FIX TESTS PASSED 100% ===');
}

runTest().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
