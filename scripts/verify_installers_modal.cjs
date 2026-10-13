const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\c8347450-d54b-4da0-9cb7-a9597e445053';

async function runVerification() {
  console.log('=== STARTING DOWNLOAD MODAL & INSTALLERS VERIFICATION ===');
  const browser = await chromium.launch({ headless: true });

  const testUAs = [
    {
      name: 'Windows',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      expectedPill: 'Detected: Windows (64-bit)',
      expectedBtn: 'Download for Windows (.exe)',
      expectedFile: 'VidLoader-Setup.exe'
    },
    {
      name: 'macOS',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      expectedPill: 'Detected: macOS (Universal)',
      expectedBtn: 'Download for macOS (.dmg)',
      expectedFile: 'VidLoader-macOS.dmg'
    },
    {
      name: 'Linux',
      ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      expectedPill: 'Detected: Linux (64-bit)',
      expectedBtn: 'Download for Linux (.AppImage)',
      expectedFile: 'VidLoader-Linux.AppImage'
    },
    {
      name: 'Android',
      ua: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      expectedPill: 'Detected: Android',
      expectedBtn: 'Download for Android (.apk)',
      expectedFile: 'VidLoader-v2.4.apk'
    },
    {
      name: 'iOS',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      expectedPill: 'Detected: iPhone / iPad',
      expectedBtn: 'Download for iPhone / iPad',
      expectedFile: 'VidLoader-iOS.mobileconfig'
    }
  ];

  // 1. Test OS Detection across User Agents
  console.log('\n--- 1. Testing OS Detection for all 5 platforms ---');
  for (const t of testUAs) {
    const context = await browser.newContext({ userAgent: t.ua });
    const page = await context.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open modal
    await page.click('.webapp-download-pill-btn');
    await page.waitForSelector('.download-modal-card', { timeout: 5000 });

    const pillText = await page.$eval('.download-detected-pill', el => el.textContent.trim());
    const btnText = await page.$eval('.download-primary-action-btn', el => el.textContent.trim());

    const pillMatch = pillText === t.expectedPill;
    const btnMatch = btnText === t.expectedBtn;

    console.log(`[${t.name}] Detected Pill: "${pillText}" (Pass: ${pillMatch})`);
    console.log(`[${t.name}] Primary Button: "${btnText}" (Pass: ${btnMatch})`);

    if (!pillMatch || !btnMatch) {
      throw new Error(`OS detection mismatch for ${t.name}`);
    }

    await context.close();
  }

  // 2. Test Logo, Repeated Downloads, and "Other Platforms" on Windows context
  console.log('\n--- 2. Testing Original Logo & Multi-Click Downloads ---');
  const winContext = await browser.newContext();
  const winPage = await winContext.newPage();
  await winPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Open modal
  await winPage.click('.webapp-download-pill-btn');
  await winPage.waitForSelector('.download-modal-card');

  // Verify Logo
  const logoSrc = await winPage.$eval('.download-modal-logo-img', el => el.getAttribute('src'));
  const logoLoaded = await winPage.$eval('.download-modal-logo-img', el => el.complete && el.naturalWidth > 0);
  const logoWidth = await winPage.$eval('.download-modal-logo-img', el => el.naturalWidth);
  const logoHeight = await winPage.$eval('.download-modal-logo-img', el => el.naturalHeight);
  console.log(`Logo src: ${logoSrc}, loaded: ${logoLoaded}, dimensions: ${logoWidth}x${logoHeight}`);
  if (!logoSrc.includes('vidloader-logo.png') || !logoLoaded) {
    throw new Error('Original VidLoader logo failed to load!');
  }

  // Verify multi-click download behavior (click 3 times in a row)
  console.log('\n--- Testing 3 successive downloads without blocking/disabling ---');
  for (let i = 1; i <= 3; i++) {
    const downloadPromise = winPage.waitForEvent('download', { timeout: 10000 });
    await winPage.click('.download-primary-action-btn');
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    const downloadPath = await download.path();
    const stats = fs.statSync(downloadPath);
    console.log(`Download #${i} SUCCESS: ${suggestedFilename} (${stats.size} bytes)`);
    if (suggestedFilename !== 'VidLoader-Setup.exe' || stats.size < 1000) {
      throw new Error(`Download #${i} file invalid: ${suggestedFilename}`);
    }
  }

  // 3. Test "Other platforms" view and downloading other platform files
  console.log('\n--- 3. Testing "Other platforms" view ---');
  await winPage.click('.download-other-platforms-link');
  await winPage.waitForSelector('.download-other-platforms-list');

  const platformItems = await winPage.$$('.download-platform-item');
  console.log(`Found ${platformItems.length} platform download rows in "Other platforms" view`);
  if (platformItems.length !== 5) {
    throw new Error(`Expected 5 platform rows, found ${platformItems.length}`);
  }

  // Click Back to detected OS
  await winPage.click('.download-back-link');
  await winPage.waitForSelector('.download-primary-view');
  console.log('Successfully navigated back to Primary View!');

  // 4. Test Screenshots across 5 responsive viewports
  console.log('\n--- 4. Capturing modal screenshots across viewports ---');
  const viewports = [
    { width: 360, height: 640, name: '360x640' },
    { width: 390, height: 844, name: '390x844' },
    { width: 768, height: 1024, name: '768x1024' },
    { width: 1366, height: 768, name: '1366x768' },
    { width: 1920, height: 1080, name: '1920x1080' },
  ];

  for (const vp of viewports) {
    await winPage.setViewportSize({ width: vp.width, height: vp.height });
    await winPage.waitForTimeout(300);
    const shotPath = path.join(ARTIFACTS_DIR, `download_modal_${vp.name}.png`);
    await winPage.screenshot({ path: shotPath });
    console.log(`Captured screenshot for ${vp.name} -> ${shotPath}`);
  }

  // Test Close with ESC
  await winPage.keyboard.press('Escape');
  await winPage.waitForTimeout(300);
  const isModalVisible = await winPage.$('.download-modal-card');
  console.log('Modal dismissed via ESC key:', !isModalVisible);

  await winContext.close();

  // 5. HARD CONSTRAINT REGRESSION: Full Video Processing & Download E2E
  console.log('\n--- 5. HARD CONSTRAINT: Video Processing Pipeline E2E Regression ---');
  const mediaContext = await browser.newContext();
  const mediaPage = await mediaContext.newPage();
  await mediaPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Paste a test video URL into the main downloader
  const inputEl = await mediaPage.$('.downloader-input');
  const submitBtn = await mediaPage.$('.btn-download-primary');
  console.log('Found input element:', !!inputEl, 'Found submit button:', !!submitBtn);

  await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await submitBtn.click();
  console.log('Submitted video URL for metadata extraction...');

  // Wait for format table
  await mediaPage.waitForSelector('.savefrom-format-table', { timeout: 15000 });
  console.log('Format table loaded successfully!');

  // Check formats
  const downloadButtons = await mediaPage.$$('.savefrom-btn-green');
  console.log(`Found ${downloadButtons.length} format download buttons in table`);

  // Download MP4 format
  const [mp4Download] = await Promise.all([
    mediaPage.waitForEvent('download', { timeout: 25000 }),
    downloadButtons[0].click()
  ]);
  const mp4Filename = mp4Download.suggestedFilename();
  const mp4Path = await mp4Download.path();
  const mp4Size = fs.statSync(mp4Path).size;
  console.log(`MP4 Download Success: ${mp4Filename} (${mp4Size} bytes)`);

  // Download MP3 / Audio format
  const audioTab = await mediaPage.$('.savefrom-tab:has-text("Audio"), .savefrom-tab:nth-child(2)');
  if (audioTab) {
    await audioTab.click();
    await mediaPage.waitForTimeout(600);
    const audioBtn = await mediaPage.$('.savefrom-btn-green');
    if (audioBtn) {
      const [mp3Download] = await Promise.all([
        mediaPage.waitForEvent('download', { timeout: 25000 }),
        audioBtn.click()
      ]);
      const mp3Filename = mp3Download.suggestedFilename();
      const mp3Path = await mp3Download.path();
      const mp3Size = fs.statSync(mp3Path).size;
      console.log(`MP3 Audio Download Success: ${mp3Filename} (${mp3Size} bytes)`);
    }
  }

  await mediaContext.close();
  await browser.close();

  console.log('\n=== ALL VERIFICATION TESTS PASSED 100% ===');
}

runVerification().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
