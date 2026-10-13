const { chromium } = require('playwright');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'Small Phone (320x568)', width: 320, height: 568 },
  { name: 'Small Phone (375x667)', width: 375, height: 667 },
  { name: 'Large Phone (390x844)', width: 390, height: 844 },
  { name: 'Large Phone (414x896)', width: 414, height: 896 },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024 },
  { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Laptop (1366x768)', width: 1366, height: 768 },
  { name: 'Laptop (1440x900)', width: 1440, height: 900 },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080 },
  { name: '2K Display (2560x1440)', width: 2560, height: 1440 },
  { name: '4K Display (3840x2160)', width: 3840, height: 2160 },
];

const PAGES = [
  { name: 'Home', url: 'http://localhost:5173/' },
  { name: 'Platform-YouTube', url: 'http://localhost:5173/youtube-downloader' },
  { name: 'Tool-MP4', url: 'http://localhost:5173/youtube-to-mp4' },
  { name: 'Shorts-Reels', url: 'http://localhost:5173/youtube-shorts-downloader' },
  { name: 'Guides', url: 'http://localhost:5173/guides' },
  { name: 'FAQ', url: 'http://localhost:5173/faq' },
  { name: 'Contact', url: 'http://localhost:5173/contact' },
];

(async () => {
  console.log('Starting Playwright Audit on Chromium...');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`Auditing viewport: ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    const vpPages = [];

    for (const pg of PAGES) {
      const consoleErrors = [];
      const errHandler = msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };
      page.on('console', errHandler);

      try {
        await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasHorizontalOverflow = scrollWidth > clientWidth;

          // Check overflowing elements
          const overflows = [];
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const r = el.getBoundingClientRect();
            if (r.right > clientWidth + 1 && r.width > 0 && r.height > 0) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className ? '.' + String(el.className).trim().replace(/\s+/g, '.') : '';
              overflows.push({
                selector: `${tag}${cls}`,
                right: Math.round(r.right),
                width: Math.round(r.width),
                excess: Math.round(r.right - clientWidth),
              });
            }
          }

          // Check touch targets (< 44px)
          const smallTargets = [];
          const interactives = document.querySelectorAll('button, a, input, select');
          for (const el of interactives) {
            const r = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
              if (r.width < 44 || r.height < 44) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? '.' + String(el.className).trim().replace(/\s+/g, '.') : '';
                const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 25).trim();
                smallTargets.push({
                  selector: `${tag}${cls}`,
                  text,
                  size: `${Math.round(r.width)}x${Math.round(r.height)}`,
                });
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            hasHorizontalOverflow,
            overflowCount: overflows.length,
            overflowSample: overflows.slice(0, 5),
            smallTargetCount: smallTargets.length,
            smallTargetSample: smallTargets.slice(0, 5),
          };
        });

        vpPages.push({
          page: pg.name,
          ...metrics,
          consoleErrors,
        });
      } catch (e) {
        vpPages.push({ page: pg.name, error: e.message });
      }
      page.off('console', errHandler);
    }

    results.push({ viewport: vp.name, width: vp.width, height: vp.height, pages: vpPages });
    await context.close();
  }

  // Interactive UI Checks on Small Phone (320px)
  console.log('Testing interactive modals and menus on 320px...');
  const ctx320 = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const p320 = await ctx320.newPage();
  await p320.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await p320.waitForTimeout(300);

  let mobileMenuCheck = null;
  let tutorialCheck = null;
  let webappCheck = null;
  let reviewCheck = null;

  try {
    await p320.click('.mobile-menu-toggle');
    await p320.waitForTimeout(200);
    mobileMenuCheck = await p320.evaluate(() => {
      const drawer = document.querySelector('.mobile-nav-drawer');
      const r = drawer?.getBoundingClientRect();
      return {
        isOpen: !!drawer,
        width: r?.width,
        overflows: r ? r.right > window.innerWidth : false,
      };
    });
    await p320.click('.mobile-menu-toggle');
    await p320.waitForTimeout(200);
  } catch (err) {
    mobileMenuCheck = { error: err.message };
  }

  try {
    await p320.click('.how-to-download-trigger-btn');
    await p320.waitForTimeout(300);
    tutorialCheck = await p320.evaluate(() => {
      const card = document.querySelector('.tutorial-modal-card');
      const r = card?.getBoundingClientRect();
      const pills = [...document.querySelectorAll('.step-nav-pill')].map(p => {
        const pr = p.getBoundingClientRect();
        return { text: p.innerText, right: pr.right, width: pr.width };
      });
      return {
        cardWidth: r?.width,
        overflows: r ? r.right > window.innerWidth : false,
        pills,
      };
    });
    await p320.click('.tutorial-close-btn');
    await p320.waitForTimeout(200);
  } catch (err) {
    tutorialCheck = { error: err.message };
  }

  try {
    await p320.click('.webapp-download-pill-btn');
    await p320.waitForTimeout(300);
    webappCheck = await p320.evaluate(() => {
      const card = document.querySelector('.webapp-modal-card');
      const r = card?.getBoundingClientRect();
      return {
        cardWidth: r?.width,
        overflows: r ? r.right > window.innerWidth : false,
      };
    });
    await p320.click('.webapp-close-btn');
    await p320.waitForTimeout(200);
  } catch (err) {
    webappCheck = { error: err.message };
  }

  try {
    await p320.click('.downloader-reviews-rating-bar button');
    await p320.waitForTimeout(300);
    reviewCheck = await p320.evaluate(() => {
      const card = document.querySelector('.review-modal-card');
      const r = card?.getBoundingClientRect();
      const btn = document.querySelector('.review-close-btn');
      const br = btn?.getBoundingClientRect();
      return {
        cardWidth: r?.width,
        cardHeight: r?.height,
        cardTop: r?.top,
        closeBtnTop: br?.top,
        closeBtnVisible: br ? br.top >= 0 && br.bottom <= window.innerHeight : false,
        overflows: r ? r.right > window.innerWidth : false,
      };
    });
    // Try click with force or escape
    await p320.keyboard.press('Escape');
    await p320.waitForTimeout(200);
  } catch (err) {
    reviewCheck = { error: err.message };
  }

  await ctx320.close();
  await browser.close();

  const finalOutput = {
    results,
    interactive320: {
      mobileMenuCheck,
      tutorialCheck,
      webappCheck,
      reviewCheck,
    },
  };

  fs.mkdirSync('scratch', { recursive: true });
  fs.writeFileSync('scratch/audit_results.json', JSON.stringify(finalOutput, null, 2));
  console.log('AUDIT_COMPLETE');
})();
