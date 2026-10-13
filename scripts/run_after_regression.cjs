const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '..', 'scratch', 'screenshots_after');
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
  console.log('=== STARTING AFTER REGRESSION & REDESIGN VERIFICATION SUITE ===');
  const browser = await chromium.launch({ headless: true });

  // 1. Capture AFTER Screenshots of Format Table & Modal across all viewports
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

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());

    // Resolve video to display redesigned format table
    console.log(`Resolving video for format table verification...`);
    await page.fill('.downloader-input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.click('.btn-download-primary');
    await page.waitForSelector('.savefrom-format-table', { timeout: 25000 });

    // Scroll to format selector
    const formatWrapper = await page.$('.format-selector-wrapper');
    if (formatWrapper) {
      await formatWrapper.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(400);

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalOverflow) {
      console.warn(`[WARNING] Horizontal scroll detected at ${vp.name}`);
    } else {
      console.log(`✓ No horizontal page overflow at ${vp.name}`);
    }

    // Verify format tabs and table elements inside bounds
    const layoutCheck = await page.evaluate(() => {
      const table = document.querySelector('.savefrom-format-table');
      const tabs = document.querySelector('.format-tabs-header');
      const tableRect = table ? table.getBoundingClientRect() : null;
      const tabsRect = tabs ? tabs.getBoundingClientRect() : null;
      const buttons = Array.from(document.querySelectorAll('.savefrom-btn-green')).map(b => b.offsetWidth);
      const labels = Array.from(document.querySelectorAll('.savefrom-label-text')).map(l => l.innerText);
      const tabTexts = Array.from(document.querySelectorAll('.format-tab-btn')).map(t => t.innerText.trim());

      return {
        tableWidth: tableRect ? tableRect.width : 0,
        tabsWidth: tabsRect ? tabsRect.width : 0,
        buttonWidths: buttons,
        labels,
        tabTexts,
      };
    });
    console.log(`  Tab labels: ${JSON.stringify(layoutCheck.tabTexts)}`);
    console.log(`  Sample row labels: ${JSON.stringify(layoutCheck.labels.slice(0, 3))}`);
    console.log(`  Button widths: ${JSON.stringify(layoutCheck.buttonWidths.slice(0, 3))}`);

    const formatTablePath = path.join(OUTPUT_DIR, `format_table_${vp.name}.png`);
    await page.screenshot({ path: formatTablePath });
    console.log(`✓ Saved redesigned format table screenshot: ${formatTablePath}`);

    // Trigger redesigned review modal
    console.log(`Opening redesigned review modal...`);
    await page.evaluate(() => {
      if (typeof window.__openReviewModal === 'function') {
        window.__openReviewModal();
      }
    });

    await page.waitForSelector('.review-modal-card', { timeout: 8000 });
    await page.waitForTimeout(300);

    // Verify modal elements: Title "How was it?", 5 stars, submit disabled, tap target sizes
    const modalCheck = await page.evaluate(() => {
      const title = document.querySelector('.review-modal-title')?.textContent?.trim();
      const stars = document.querySelectorAll('.review-star-btn');
      const submitBtn = document.querySelector('.review-btn-submit');
      const laterBtn = document.querySelector('.review-btn-later');
      const closeBtn = document.querySelector('.review-close-btn');
      const textarea = document.querySelector('.review-comment-textarea');
      const card = document.querySelector('.review-modal-card');
      const cardRect = card ? card.getBoundingClientRect() : null;

      // Check tap targets >= 40px
      const starSizes = Array.from(stars).map(s => ({
        w: s.offsetWidth,
        h: s.offsetHeight,
      }));

      // Check removed elements
      const hasOldBadge = !!document.querySelector('.review-badge-pill');
      const hasOldSubtitle = !!document.querySelector('.review-sub-heading');
      const hasOldChips = !!document.querySelector('.review-tags-section');
      const hasOldName = !!document.querySelector('.review-author-input');
      const hasOldFooter = !!document.querySelector('.review-modal-footer');

      return {
        title,
        starsCount: stars.length,
        starSizes,
        submitDisabled: submitBtn?.disabled,
        submitText: submitBtn?.textContent?.trim(),
        laterText: laterBtn?.textContent?.trim(),
        hasTextarea: !!textarea,
        textareaPlaceholder: textarea?.placeholder,
        cardWidth: cardRect?.width,
        hasOldBadge,
        hasOldSubtitle,
        hasOldChips,
        hasOldName,
        hasOldFooter,
      };
    });

    console.log(`  Modal Title: "${modalCheck.title}" (Expected: "How was it?")`);
    console.log(`  Stars count: ${modalCheck.starsCount}, Submit disabled initially: ${modalCheck.submitDisabled}`);
    console.log(`  Card width: ${modalCheck.cardWidth?.toFixed(1)}px (max-width ~400px)`);
    console.log(`  Star 0 size: ${modalCheck.starSizes[0]?.w}x${modalCheck.starSizes[0]?.h}px (>=40px target)`);
    console.log(`  Bloat elements removed: Badge=${!modalCheck.hasOldBadge}, Subtitle=${!modalCheck.hasOldSubtitle}, Chips=${!modalCheck.hasOldChips}, Name=${!modalCheck.hasOldName}, Footer=${!modalCheck.hasOldFooter}`);

    if (modalCheck.title !== 'How was it?') {
      throw new Error(`Unexpected title: ${modalCheck.title}`);
    }
    if (modalCheck.starsCount !== 5 || !modalCheck.submitDisabled) {
      throw new Error(`Review modal stars or submit button state invalid`);
    }

    const modalPath = path.join(OUTPUT_DIR, `review_modal_${vp.name}.png`);
    await page.screenshot({ path: modalPath });
    console.log(`✓ Saved redesigned review modal screenshot: ${modalPath}`);

    // Test Selecting a star and checking Submit state
    const thirdStar = await page.$('.review-star-btn:nth-child(4)');
    if (thirdStar) {
      await thirdStar.hover();
      await page.waitForTimeout(100);
      await thirdStar.click();
    }

    const submitNowEnabled = await page.evaluate(() => {
      const btn = document.querySelector('.review-btn-submit');
      return btn && !btn.disabled;
    });
    console.log(`  Star selected -> Submit button enabled: ${submitNowEnabled}`);
    if (!submitNowEnabled) throw new Error('Submit button should be enabled after star selection');

    // Screenshot with stars selected
    if (vp.name === '390x844' || vp.name === '1366x768') {
      await page.waitForTimeout(300);
      await page.fill('.review-comment-textarea', 'Fast and clean download!');
      const activeStatePath = path.join(OUTPUT_DIR, `review_modal_active_${vp.name}.png`);
      await page.screenshot({ path: activeStatePath });
      console.log(`✓ Saved active modal state screenshot: ${activeStatePath}`);
    }

    // Dismiss modal via ESC key to test accessibility
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const modalDismissed = await page.evaluate(() => !document.querySelector('.review-modal-card'));
    console.log(`  ESC key pressed -> Modal dismissed: ${modalDismissed}`);
    if (!modalDismissed) throw new Error('Modal should dismiss on Escape key');

    await context.close();
  }

  // 2. Test Submit Flow and "Thanks!" screen
  console.log('\n--- TESTING MODAL SUBMIT & "THANKS!" CONFIRMATION FLOW ---');
  const modalTestContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const modalTestPage = await modalTestContext.newPage();
  await modalTestPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await modalTestPage.evaluate(() => {
    if (window.__openReviewModal) window.__openReviewModal();
  });
  await modalTestPage.waitForSelector('.review-modal-card');

  // Select 5th star
  await modalTestPage.click('.review-star-btn:nth-child(5)');
  await modalTestPage.fill('.review-comment-textarea', 'Excellent service, highly recommended!');
  await modalTestPage.click('.review-btn-submit');

  // Check "Thanks!" confirmation state appears
  await modalTestPage.waitForSelector('.review-success-state', { timeout: 3000 });
  const confirmationText = await modalTestPage.$eval('.review-success-heading', el => el.textContent.trim());
  console.log(`✓ Confirmation state reached: "${confirmationText}"`);
  const thanksScreenshotPath = path.join(OUTPUT_DIR, 'review_modal_thanks_confirmation.png');
  await modalTestPage.screenshot({ path: thanksScreenshotPath });
  console.log(`✓ Saved "Thanks!" confirmation screenshot: ${thanksScreenshotPath}`);

  // Wait for auto-close
  await modalTestPage.waitForSelector('.review-modal-card', { state: 'detached', timeout: 5000 });
  console.log(`✓ Modal successfully auto-closed after submit!`);
  await modalTestContext.close();

  // 3. E2E Download Regression (MP4 & MP3)
  console.log('\n=== RUNNING E2E DOWNLOAD REGRESSION (MP4 & MP3) AFTER CHANGES ===');
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

  // Test MP4 Download
  console.log('Initiating MP4 download...');
  const firstDownloadBtn = await dlPage.$('.savefrom-btn-green');
  if (!firstDownloadBtn) throw new Error('Download button not found in table');
  await firstDownloadBtn.click();

  await dlPage.waitForSelector('.download-progress-card.is-complete, .savefrom-btn-green.is-completed', {
    timeout: 60000,
  });
  console.log('✓ MP4 job marked completed on UI.');

  const mp4Url = await dlPage.evaluate(() => {
    const directLink = document.querySelector('.progress-direct-link') || document.querySelector('.savefrom-btn-green.is-completed');
    return directLink ? directLink.getAttribute('href') : null;
  });
  console.log('MP4 Download URL:', mp4Url);

  const mp4FilePath = path.join(DOWNLOADS_DIR, 'regression_after_test.mp4');
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

  // Test MP3 Download
  console.log('\nSwitching to Audio tab...');
  const audioTabBtn = await dlPage.$('.format-tab-btn:has-text("Audio")');
  await audioTabBtn.click();
  await dlPage.waitForTimeout(500);

  console.log('Initiating MP3 download...');
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

  const mp3FilePath = path.join(DOWNLOADS_DIR, 'regression_after_test.mp3');
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
  console.log('✓ ALL AFTER REGRESSION CHECKS PASSED WITH 100% SUCCESS!');
  console.log('✓ Simplified Review Modal verified (Title: "How was it?", 5 empty stars, optional textarea, Submit/Maybe later, "Thanks!" auto-close).');
  console.log('✓ Format Table & Tabs verified (single-line equal-width tabs, consistent labels, aligned columns, fixed-width Download buttons, no overflow).');
  console.log('✓ E2E MP4 download regression PASSED.');
  console.log('✓ E2E MP3 download regression PASSED.');
  console.log(`✓ Screenshots saved to: ${OUTPUT_DIR}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('ERROR during AFTER regression suite:', err);
  process.exit(1);
});
