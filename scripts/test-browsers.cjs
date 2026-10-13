const { chromium, firefox, webkit } = require('playwright');

async function testBrowsers() {
  const results = {};
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    try {
      const browser = await engine.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
      results[name] = { success: true, title: await page.title() };
      await browser.close();
    } catch (err) {
      results[name] = { success: false, error: err.message };
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

testBrowsers();
