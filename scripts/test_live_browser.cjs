const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LIVE_FRONTEND_URL = 'https://vidloader.online';
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'scratch', 'live_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const DEVICE_VIEWPORTS = [
  { name: 'live-iphone-se-320', width: 320, height: 568, isMobile: true, hasTouch: true, label: 'Small Phone (iPhone SE 320px)' },
  { name: 'live-iphone-13-390', width: 390, height: 844, isMobile: true, hasTouch: true, label: 'Standard Phone (iPhone 13 390px)' },
  { name: 'live-ipad-portrait-768', width: 768, height: 1024, isMobile: true, hasTouch: true, label: 'Tablet Portrait (iPad 768px)' },
  { name: 'live-desktop-fhd-1920', width: 1920, height: 1080, isMobile: false, hasTouch: false, label: 'Desktop Monitor (1080p FHD)' },
];

async function testLiveDeviceUI(browser, device) {
  console.log(`\n============================================================`);
  console.log(`[LIVE FRONTEND TEST] ${device.label} (${device.width}x${device.height})`);
  console.log(`URL: ${LIVE_FRONTEND_URL}`);
  console.log(`============================================================`);

  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));
  page.on('requestfailed', req => {
    const u = req.url();
    if (!u.includes('analytics') && !u.includes('doubleclick')) {
      networkErrors.push(`${req.method()} ${u} - ${req.failure()?.errorText}`);
    }
  });

  const result = {
    device: device.name,
    label: device.label,
    viewport: `${device.width}x${device.height}`,
    initialLoad: false,
    horizontalOverflow: false,
    scrollWidth: 0,
    clientWidth: 0,
    liveConfigDetected: false,
    apiUrlConfigured: null,
    resolveSuccess: false,
    formatTableVisible: false,
    downloadTriggered: false,
    consoleErrors: [],
    networkErrors: [],
    screenshot: null,
  };

  try {
    // 1. Initial Page Load from Hostinger
    console.log(`  -> Navigating to ${LIVE_FRONTEND_URL}...`);
    await page.goto(LIVE_FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(600);
    result.initialLoad = true;

    // 2. Measure Horizontal Overflow
    const overflowMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientW = doc.clientWidth;
      return {
        scrollW,
        clientW,
        hasOverflow: scrollW > clientW + 1,
        apiUrl: window.__VIDLOADER_API_URL__ || null
      };
    });
    result.scrollWidth = overflowMetrics.scrollW;
    result.clientWidth = overflowMetrics.clientW;
    result.horizontalOverflow = overflowMetrics.hasOverflow;
    result.liveConfigDetected = !!overflowMetrics.apiUrl;
    result.apiUrlConfigured = overflowMetrics.apiUrl;
    console.log(`  -> Overflow: scrollWidth=${overflowMetrics.scrollW}px, clientWidth=${overflowMetrics.clientW}px (Overflow: ${overflowMetrics.hasOverflow ? 'YES' : 'NO'})`);
    console.log(`  -> Config: Live Backend API = ${result.apiUrlConfigured}`);

    // 3. Test URL Resolution via Live Render Backend
    console.log('  -> Testing Live URL Resolution on https://vidloader.online...');
    const inputEl = await page.$('.downloader-input');
    const submitBtn = await page.$('.btn-download-primary');

    if (inputEl && submitBtn) {
      await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.waitForTimeout(400);

      const isBtnDisabled = await submitBtn.evaluate(el => el.disabled);
      if (!isBtnDisabled) {
        await submitBtn.click().catch(() => {});
      }

      // Wait for format table from live Render API
      try {
        await page.waitForSelector('.savefrom-format-table, .format-options-table-container', { timeout: 25000 });
        result.resolveSuccess = true;
        result.formatTableVisible = true;
        console.log('  ✓ Live format table rendered successfully via Render backend!');

        // Click first format download button
        const downloadBtn = await page.$('.savefrom-btn-green');
        if (downloadBtn) {
          await downloadBtn.click();
          await page.waitForTimeout(1000);
          const progressCard = await page.$('.download-progress-card');
          result.downloadTriggered = !!progressCard;
          console.log(`  ✓ Format download trigger: ${result.downloadTriggered ? 'PASS (Live Progress Card Active)' : 'Triggered'}`);
        }
      } catch (tErr) {
        console.log(`  ✗ Live format table timeout: ${tErr.message}`);
      }
    }

    // Capture screenshot
    const shotPath = path.join(SCREENSHOTS_DIR, `${device.name}_live.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    result.screenshot = shotPath;

  } catch (err) {
    result.error = err.message;
    console.log(`  ✗ Live test error: ${err.message}`);
  } finally {
    result.consoleErrors = consoleErrors;
    result.networkErrors = networkErrors;
    await context.close();
  }

  return result;
}

async function runLiveDeviceSuite() {
  console.log('========================================================================');
  console.log('LIVE PRODUCTION QA: HTTPS://VIDLOADER.ONLINE FRONTEND SUITE');
  console.log('========================================================================');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const dev of DEVICE_VIEWPORTS) {
    const res = await testLiveDeviceUI(browser, dev);
    results.push(res);
  }

  await browser.close();

  console.log('\n\n========================================================================');
  console.log('LIVE PRODUCTION DEVICE QA MATRIX');
  console.log('========================================================================');
  console.table(results.map(r => ({
    Device: r.label.slice(0, 28),
    Viewport: r.viewport,
    'Overflow': r.horizontalOverflow ? 'FAIL (overflow)' : 'PASS (0px)',
    'Live API': r.apiUrlConfigured ? 'CONNECTED' : 'MISSING',
    'Resolve': r.resolveSuccess ? 'PASS' : 'FAIL',
    'Download UI': r.downloadTriggered ? 'PASS' : 'FAIL',
    'Console Errs': r.consoleErrors.length,
  })));

  const outPath = path.resolve(__dirname, '..', 'scratch', 'live_device_qa_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nLive device QA results written to: ${outPath}`);

  return results;
}

runLiveDeviceSuite().catch(err => console.error('Live device QA failed:', err));
