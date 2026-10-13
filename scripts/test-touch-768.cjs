const { chromium } = require('playwright');

async function testTouch768() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  const violations = await page.evaluate(() => {
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

    const viols = [];
    for (const sel of interactiveSelectors) {
      const els = document.querySelectorAll(sel);
      els.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 40 || rect.height < 40) {
            viols.push({
              selector: sel,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: (el.textContent || '').trim().slice(0, 30)
            });
          }
        }
      });
    }
    return viols;
  });
  
  console.log('Violations on 768px:', JSON.stringify(violations, null, 2));
  await browser.close();
}

testTouch768();
