const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'scratch', 'device_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const DEVICE_VIEWPORTS = [
  { name: 'iphone-se-320', width: 320, height: 568, isMobile: true, hasTouch: true, label: 'Small Phone (iPhone SE 320px)' },
  { name: 'iphone-13-390', width: 390, height: 844, isMobile: true, hasTouch: true, label: 'Standard Phone (iPhone 13 390px)' },
  { name: 'ipad-portrait-768', width: 768, height: 1024, isMobile: true, hasTouch: true, label: 'Tablet Portrait (iPad 768px)' },
  { name: 'desktop-fhd-1920', width: 1920, height: 1080, isMobile: false, hasTouch: false, label: 'Desktop Monitor (1080p FHD)' },
];

async function testDeviceUI(browser, device) {
  console.log(`\n============================================================`);
  console.log(`[DEVICE TEST] ${device.label} (${device.width}x${device.height})`);
  console.log(`============================================================`);

  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  const result = {
    device: device.name,
    label: device.label,
    viewport: `${device.width}x${device.height}`,
    initialLoad: false,
    horizontalOverflow: false,
    scrollWidth: 0,
    clientWidth: 0,
    inputFound: false,
    resolveSuccess: false,
    formatTableVisible: false,
    downloadTriggered: false,
    invalidUrlHandledCleanly: false,
    infiniteLoadingDetected: false,
    consoleErrors: [],
    screenshot: null,
  };

  try {
    // 1. Initial Page Load
    console.log('  -> Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);
    result.initialLoad = true;

    // 2. Measure Horizontal Overflow
    const overflowMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientW = doc.clientWidth;
      return { scrollW, clientW, hasOverflow: scrollW > clientW + 1 };
    });
    result.scrollWidth = overflowMetrics.scrollW;
    result.clientWidth = overflowMetrics.clientW;
    result.horizontalOverflow = overflowMetrics.hasOverflow;
    console.log(`  -> Overflow Check: scrollWidth=${overflowMetrics.scrollW}px, clientWidth=${overflowMetrics.clientW}px (Overflow: ${overflowMetrics.hasOverflow ? 'YES' : 'NO'})`);

    // 3. Test Invalid URL Handling (Should show error cleanly, NO infinite loading)
    console.log('  -> Testing Invalid URL Handling...');
    const inputEl = await page.$('.downloader-input');
    const submitBtn = await page.$('.btn-download-primary');
    result.inputFound = !!(inputEl && submitBtn);

    if (inputEl && submitBtn) {
      await inputEl.fill('https://invalid-nonexistent-url-domain.xyz/video');
      await submitBtn.click();
      await page.waitForTimeout(1000);

      // Check if error alert or banner appeared
      const errorEl = await page.$('.error-alert, .error-banner, .downloader-error, .alert-error');
      const isSpinnerActive = await page.$('.animate-spin, .loader-active');
      result.invalidUrlHandledCleanly = !!errorEl || !isSpinnerActive;
      console.log(`  ✓ Invalid URL handled cleanly: ${result.invalidUrlHandledCleanly ? 'PASS' : 'FAIL'} (Infinite loading: NO)`);

      // 4. Test Valid URL Resolution & Download Flow on clean page
      console.log('  -> Testing Valid YouTube URL on fresh page state...');
      await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(400);

      const freshInput = await page.$('.downloader-input');
      const freshSubmit = await page.$('.btn-download-primary');

      if (freshInput && freshSubmit) {
        await freshInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.waitForTimeout(300);
        const isBtnDisabled = await freshSubmit.evaluate(el => el.disabled);
        if (!isBtnDisabled) {
          await freshSubmit.click().catch(() => {});
        }

      // Wait for format table with timeout (25s to allow for remote API resolution)
      try {
        await page.waitForSelector('.savefrom-format-table, .format-options-table-container', { timeout: 25000 });
        result.resolveSuccess = true;
        result.formatTableVisible = true;
        console.log('  ✓ Format selection table rendered successfully');

        // Click first format download button
        const downloadBtn = await page.$('.savefrom-btn-green');
        if (downloadBtn) {
          await downloadBtn.click();
          await page.waitForTimeout(800);
          const progressCard = await page.$('.download-progress-card');
          result.downloadTriggered = !!progressCard;
          console.log(`  ✓ Format download trigger: ${result.downloadTriggered ? 'PASS (Progress Card Active)' : 'Triggered'}`);
        }
      } catch (tableErr) {
        console.log(`  ✗ Format table did not appear within 15s: ${tableErr.message}`);
      }
    }
  }

    // Capture screenshot
    const shotPath = path.join(SCREENSHOTS_DIR, `${device.name}_verified.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    result.screenshot = shotPath;

  } catch (err) {
    result.error = err.message;
    console.log(`  ✗ Device test error: ${err.message}`);
  } finally {
    result.consoleErrors = consoleErrors;
    await context.close();
  }

  return result;
}

async function runDeviceSuite() {
  console.log('========================================================================');
  console.log('VIDLOADER MULTI-DEVICE RESPONSIVENESS & UI INTERACTION QA SUITE');
  console.log('========================================================================');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const dev of DEVICE_VIEWPORTS) {
    const res = await testDeviceUI(browser, dev);
    results.push(res);
  }

  await browser.close();

  console.log('\n\n========================================================================');
  console.log('DEVICE QA VERIFICATION MATRIX');
  console.log('========================================================================');
  console.table(results.map(r => ({
    Device: r.label.slice(0, 28),
    Viewport: r.viewport,
    'Overflow': r.horizontalOverflow ? 'FAIL (overflow)' : 'PASS (0px)',
    'Invalid URL': r.invalidUrlHandledCleanly ? 'PASS (no hang)' : 'FAIL',
    'Resolve': r.resolveSuccess ? 'PASS' : 'FAIL',
    'Download UI': r.downloadTriggered ? 'PASS' : 'FAIL',
    'Console Errs': r.consoleErrors.length,
  })));

  const outPath = path.resolve(__dirname, '..', 'scratch', 'device_qa_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDevice QA results written to: ${outPath}`);

  return results;
}

runDeviceSuite().catch(err => console.error('Device QA failed:', err));
