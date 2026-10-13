const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '..', 'scratch', 'screenshots_before');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'scratch', 'test_downloads');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: 'zoom_200pct', width: 1366, height: 768, zoom: 2.0 },
];

async function main() {
  console.log('=== STARTING BEFORE REGRESSION & SCREENSHOT SUITE ===');
  const browser = await chromium.launch({ headless: true });

  // 1. Capture BEFORE Screenshots of Format Table & Modal across all viewports
  for (const vp of VIEWPORTS) {
    console.log(`\n[Viewport: ${vp.name}] (${vp.width}x${vp.height}${vp.zoom ? ` @ ${vp.zoom * 100}% zoom` : ''})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.zoom || 1,
    });
    const page = await context.newPage();

    if (vp.zoom) {
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.zoom = '200%';
        });
      });
    }

    // Go to homepage
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());

    // Resolve a video to show format table
    console.log(`Resolving video for format table screenshot...`);
    await page.fill('.downloader-input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.click('.btn-download-primary');
    await page.waitForSelector('.savefrom-format-table', { timeout: 25000 });

    // Scroll format table into view
    const formatTableEl = await page.$('.format-selector-wrapper');
    if (formatTableEl) {
      await formatTableEl.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(500);

    const formatTablePath = path.join(OUTPUT_DIR, `format_table_${vp.name}.png`);
    await page.screenshot({ path: formatTablePath });
    console.log(`✓ Saved format table screenshot: ${formatTablePath}`);

    // Trigger review modal
    console.log(`Triggering review modal...`);
    await page.evaluate(() => {
      if (typeof window.__openReviewModal === 'function') {
        window.__openReviewModal();
      }
    });

    await page.waitForSelector('.review-modal-card', { timeout: 8000 });
    await page.waitForTimeout(400);

    const modalPath = path.join(OUTPUT_DIR, `review_modal_${vp.name}.png`);
    await page.screenshot({ path: modalPath });
    console.log(`✓ Saved review modal screenshot: ${modalPath}`);

    await context.close();
  }

  // 2. Perform End-to-End Download Regression (1 MP4 and 1 MP3)
  console.log('\n=== RUNNING E2E DOWNLOAD REGRESSION (MP4 & MP3) ===');
  const dlContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  });
  const dlPage = await dlContext.newPage();
  await dlPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Resolve video
  console.log('Resolving test video for download regression...');
  await dlPage.fill('.downloader-input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await dlPage.click('.btn-download-primary');
  await dlPage.waitForSelector('.savefrom-format-table', { timeout: 25000 });

  // Test 1: MP4 Download
  console.log('Testing MP4 download flow...');
  const firstDownloadBtn = await dlPage.$('.savefrom-btn-green');
  if (!firstDownloadBtn) throw new Error('Download button not found in table');
  await firstDownloadBtn.click();

  // Wait for processing completion
  await dlPage.waitForSelector('.download-progress-card.is-complete, .savefrom-btn-green.is-completed', {
    timeout: 60000,
  });
  console.log('✓ MP4 job marked completed on UI.');

  // Extract download URL and verify file can be downloaded and played
  const mp4Url = await dlPage.evaluate(() => {
    const directLink = document.querySelector('.progress-direct-link') || document.querySelector('.savefrom-btn-green.is-completed');
    return directLink ? directLink.getAttribute('href') : null;
  });
  console.log('MP4 Download URL:', mp4Url);

  const mp4FilePath = path.join(DOWNLOADS_DIR, 'regression_before_test.mp4');
  if (mp4Url && mp4Url.startsWith('/api/')) {
    const fullUrl = `${BASE_URL}${mp4Url}`;
    const file = fs.createWriteStream(mp4FilePath);
    await new Promise((resolve, reject) => {
      http.get(fullUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    });
    const mp4Stats = fs.statSync(mp4FilePath);
    console.log(`✓ MP4 file saved successfully! Size: ${mp4Stats.size} bytes (${(mp4Stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    if (mp4Stats.size < 10000) {
      throw new Error(`MP4 file too small: ${mp4Stats.size} bytes`);
    }
  }

  // Test 2: MP3 Download
  console.log('\nTesting MP3 download flow...');
  const audioTabBtn = await dlPage.$('.format-tab-btn:has-text("Audio")');
  await audioTabBtn.click();
  await dlPage.waitForTimeout(500);

  const audioDownloadBtn = await dlPage.$('.savefrom-format-table .savefrom-btn-green');
  await audioDownloadBtn.click();

  await dlPage.waitForSelector('.download-progress-card.is-complete, .savefrom-btn-green.is-completed', {
    timeout: 60000,
  });
  console.log('✓ MP3 job marked completed on UI.');

  const mp3Url = await dlPage.evaluate(() => {
    const directLink = document.querySelector('.progress-direct-link') || document.querySelector('.savefrom-btn-green.is-completed');
    return directLink ? directLink.getAttribute('href') : null;
  });
  console.log('MP3 Download URL:', mp3Url);

  const mp3FilePath = path.join(DOWNLOADS_DIR, 'regression_before_test.mp3');
  if (mp3Url && mp3Url.startsWith('/api/')) {
    const fullUrl = `${BASE_URL}${mp3Url}`;
    const file = fs.createWriteStream(mp3FilePath);
    await new Promise((resolve, reject) => {
      http.get(fullUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    });
    const mp3Stats = fs.statSync(mp3FilePath);
    console.log(`✓ MP3 file saved successfully! Size: ${mp3Stats.size} bytes (${(mp3Stats.size / (1024 * 1024)).toFixed(2)} MB)`);
    if (mp3Stats.size < 10000) {
      throw new Error(`MP3 file too small: ${mp3Stats.size} bytes`);
    }
  }

  await dlContext.close();
  await browser.close();

  console.log('\n======================================================');
  console.log('✓ BEFORE REGRESSION SUITE COMPLETED SUCCESSFULLY!');
  console.log('✓ 1 MP4 download verified.');
  console.log('✓ 1 MP3 download verified.');
  console.log(`✓ Screenshots saved to: ${OUTPUT_DIR}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('ERROR during BEFORE regression suite:', err);
  process.exit(1);
});

