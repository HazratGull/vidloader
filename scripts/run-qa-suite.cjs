const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'scratch', 'qa_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'small-phone-320', width: 320, height: 568, isMobile: true, hasTouch: true, label: 'Small Phone (iPhone SE 1st gen)' },
  { name: 'small-phone-375', width: 375, height: 667, isMobile: true, hasTouch: true, label: 'Small Phone (iPhone SE 2nd gen)' },
  { name: 'large-phone-390', width: 390, height: 844, isMobile: true, hasTouch: true, label: 'Large Phone (iPhone 13/14)' },
  { name: 'large-phone-414', width: 414, height: 896, isMobile: true, hasTouch: true, label: 'Large Phone (iPhone XR/11)' },
  { name: 'tablet-portrait-768', width: 768, height: 1024, isMobile: true, hasTouch: true, label: 'Tablet Portrait (iPad 768px)' },
  { name: 'tablet-landscape-1024', width: 1024, height: 768, isMobile: false, hasTouch: false, label: 'Tablet Landscape (iPad 1024px)' },
  { name: 'laptop-1366', width: 1366, height: 768, isMobile: false, hasTouch: false, label: 'Laptop HD (1366x768)' },
  { name: 'laptop-1440', width: 1440, height: 900, isMobile: false, hasTouch: false, label: 'Laptop Retina (1440x900)' },
  { name: 'desktop-1920', width: 1920, height: 1080, isMobile: false, hasTouch: false, label: 'Full HD Desktop (1920x1080)' },
  { name: '2k-display-2560', width: 2560, height: 1440, isMobile: false, hasTouch: false, label: '2K QHD Display (2560x1440)' },
  { name: '4k-display-3840', width: 3840, height: 2160, isMobile: false, hasTouch: false, label: '4K UHD Display (3840x2160)' },
];

const CHANNELS = [
  { name: 'chromium', label: 'Chromium (Playwright Engine)', options: {} },
  { name: 'chrome', label: 'Google Chrome (System Channel)', options: { channel: 'chrome' } },
  { name: 'msedge', label: 'Microsoft Edge (System Channel)', options: { channel: 'msedge' } }
];

async function runDeviceQA(browser, device, channelName) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    deviceScaleFactor: device.width >= 2560 ? 1 : 2
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  page.on('requestfailed', req => {
    const url = req.url();
    if (!url.includes('google-analytics') && !url.includes('doubleclick')) {
      networkErrors.push(`${req.method()} ${url} - ${req.failure()?.errorText}`);
    }
  });

  const report = {
    device: device.name,
    label: device.label,
    viewport: `${device.width}x${device.height}`,
    channel: channelName,
    overflowPassed: false,
    scrollWidth: 0,
    clientWidth: 0,
    overflowPx: 0,
    consoleErrors: [],
    networkErrors: [],
    e2eFlowPassed: false,
    e2eDetails: {},
    modalChecksPassed: false,
    modalDetails: {},
    touchTargetsPassed: true,
    touchTargetViolations: [],
    screenshotPath: '',
    e2eScreenshotPath: ''
  };

  try {
    // 1. Initial Page Load
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(400);

    // 2. Measure Horizontal Overflow
    const overflowMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const innerWidth = window.innerWidth;
      return {
        scrollWidth,
        clientWidth,
        innerWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth + 1
      };
    });

    report.scrollWidth = overflowMetrics.scrollWidth;
    report.clientWidth = overflowMetrics.clientWidth;
    report.overflowPx = Math.max(0, overflowMetrics.scrollWidth - overflowMetrics.clientWidth);
    report.overflowPassed = !overflowMetrics.hasHorizontalOverflow;

    // 3. Take Baseline Homepage Screenshot
    const screenshotName = `${channelName}_${device.name}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    report.screenshotPath = screenshotPath;

    // 4. Test Touch Targets on Mobile Viewports
    if (device.isMobile) {
      const touchChecks = await page.evaluate(() => {
        const interactiveSelectors = [
          '.savefrom-btn-green',
          '.clear-btn',
          '.paste-btn',
          '.btn-download-primary',
          '.format-tab-btn',
          '.how-to-download-trigger-btn',
          '.reviews-rating-btn',
          '.mobile-menu-toggle',
          '.lang-btn',
          '.webapp-download-pill-btn',
          '.review-close-btn',
          '.tutorial-close-btn',
          '.webapp-close-btn',
          '.footer-column-heading-btn'
        ];

        const violations = [];
        for (const sel of interactiveSelectors) {
          const els = document.querySelectorAll(sel);
          els.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < 40 || rect.height < 40) {
                violations.push({
                  selector: sel,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  text: (el.textContent || '').trim().slice(0, 30)
                });
              }
            }
          });
        }
        return violations;
      });

      if (touchChecks.length > 0) {
        report.touchTargetsPassed = false;
        report.touchTargetViolations = touchChecks;
      }
    }

    // 5. Test Modals Layout & Bounds (Review Modal, Tutorial Modal)
    try {
      const modalChecks = {};

      // 5a. Review Modal
      const reviewBtn = await page.$('.reviews-rating-btn');
      if (reviewBtn && await reviewBtn.isVisible()) {
        await reviewBtn.click();
        await page.waitForTimeout(300);
        const reviewModalCard = await page.$('.review-modal-card');
        if (reviewModalCard) {
          const bounding = await reviewModalCard.boundingBox();
          const closeBtn = await page.$('.review-close-btn');
          const closeVisible = closeBtn ? await closeBtn.isVisible() : false;
          modalChecks.reviewModal = {
            cardVisible: !!bounding,
            cardTop: bounding ? Math.round(bounding.y) : null,
            cardHeight: bounding ? Math.round(bounding.height) : null,
            viewportHeight: device.height,
            closeVisible,
            fitsInViewport: bounding ? bounding.y >= 0 && (bounding.y + bounding.height) <= device.height + 20 : false
          };
          if (closeBtn && closeVisible) {
            await closeBtn.click();
            await page.waitForTimeout(200);
          }
        }
      }

      // 5b. Tutorial Modal
      const tutorialBtn = await page.$('.how-to-download-trigger-btn');
      if (tutorialBtn && await tutorialBtn.isVisible()) {
        await tutorialBtn.click();
        await page.waitForTimeout(300);
        const tutorialCard = await page.$('.tutorial-modal-card');
        if (tutorialCard) {
          const bounding = await tutorialCard.boundingBox();
          const closeBtn = await page.$('.tutorial-close-btn');
          const closeVisible = closeBtn ? await closeBtn.isVisible() : false;
          modalChecks.tutorialModal = {
            cardVisible: !!bounding,
            cardTop: bounding ? Math.round(bounding.y) : null,
            cardHeight: bounding ? Math.round(bounding.height) : null,
            viewportHeight: device.height,
            closeVisible,
            fitsInViewport: bounding ? bounding.y >= 0 && (bounding.y + bounding.height) <= device.height + 20 : false
          };
          if (closeBtn && closeVisible) {
            await closeBtn.click();
            await page.waitForTimeout(200);
          }
        }
      }

      report.modalDetails = modalChecks;
      report.modalChecksPassed = true;
    } catch (mErr) {
      report.modalDetails.error = mErr.message;
    }

    // 6. Test End-to-End User Flow (Input URL -> Resolve -> Select Format -> Download Progress)
    try {
      const inputEl = await page.$('.downloader-input');
      const submitBtn = await page.$('.btn-download-primary');

      if (inputEl && submitBtn) {
        await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.waitForTimeout(100);
        await submitBtn.click();

        // Wait for format options table
        await page.waitForSelector('.savefrom-format-table, .format-options-table-container', { timeout: 15000 });
        const formatTableVisible = await page.isVisible('.savefrom-format-table');

        // Check if format row buttons are interactive
        const firstDownloadBtn = await page.$('.savefrom-btn-green');
        let downloadTriggered = false;
        if (firstDownloadBtn) {
          const btnBox = await firstDownloadBtn.boundingBox();
          report.e2eDetails.buttonWidth = btnBox ? Math.round(btnBox.width) : 0;
          report.e2eDetails.buttonHeight = btnBox ? Math.round(btnBox.height) : 0;

          await firstDownloadBtn.click();
          await page.waitForTimeout(800);

          // Verify progress card or processing state
          const progressCard = await page.$('.download-progress-card');
          downloadTriggered = !!progressCard;
          report.e2eDetails.progressCardAppeared = downloadTriggered;
        }

        report.e2eFlowPassed = formatTableVisible && downloadTriggered;
        report.e2eDetails.formatTableVisible = formatTableVisible;

        // Take screenshot of resolved table state
        const e2eScreenshotPath = path.join(SCREENSHOTS_DIR, `${channelName}_${device.name}_resolved.png`);
        await page.screenshot({ path: e2eScreenshotPath, fullPage: false });
        report.e2eScreenshotPath = e2eScreenshotPath;
      }
    } catch (flowErr) {
      report.e2eDetails.error = flowErr.message;
      report.e2eFlowPassed = false;
    }

  } catch (err) {
    report.error = err.message;
  } finally {
    report.consoleErrors = consoleErrors;
    report.networkErrors = networkErrors;
    await context.close();
  }

  return report;
}

async function runFullQASuite() {
  console.log('================================================================');
  console.log('STARTING AUTOMATED PLAYWRIGHT MULTI-DEVICE QA TEST SUITE');
  console.log('================================================================');

  const allResults = [];

  for (const channel of CHANNELS) {
    console.log(`\nTesting browser channel: ${channel.label}...`);
    let browser;
    try {
      browser = await chromium.launch({ ...channel.options, headless: true });
    } catch (launchErr) {
      console.log(`Could not launch ${channel.name}: ${launchErr.message}`);
      continue;
    }

    for (const dev of VIEWPORTS) {
      process.stdout.write(`  [${channel.name}] ${dev.label} (${dev.width}x${dev.height})... `);
      const res = await runDeviceQA(browser, dev, channel.name);
      allResults.push(res);

      const pass = res.overflowPassed && res.e2eFlowPassed && res.touchTargetsPassed && res.consoleErrors.length === 0;
      if (pass) {
        console.log(`PASS (Overflow: 0px, Touch: OK, E2E: OK)`);
      } else {
        console.log(`FAIL (Overflow: ${res.overflowPx}px, Touch: ${res.touchTargetsPassed ? 'OK' : 'FAIL'}, E2E: ${res.e2eFlowPassed ? 'OK' : 'FAIL'}, Errors: ${res.consoleErrors.length})`);
      }
    }

    await browser.close();
  }

  const outputPath = path.join(__dirname, '..', 'scratch', 'qa_suite_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log(`QA SUITE COMPLETED! Results saved to ${outputPath}`);
  console.log('================================================================');

  const total = allResults.length;
  const passed = allResults.filter(r => r.overflowPassed && r.e2eFlowPassed && r.touchTargetsPassed && r.consoleErrors.length === 0).length;
  console.log(`Total Device Runs: ${total} | Fully Passed: ${passed} | Failures: ${total - passed}`);
}

runFullQASuite();
