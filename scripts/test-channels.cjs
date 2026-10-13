const { chromium } = require('playwright');

async function testChannels() {
  const channels = ['chromium', 'msedge', 'chrome'];
  for (const ch of channels) {
    try {
      const opts = ch === 'chromium' ? {} : { channel: ch };
      const browser = await chromium.launch({ ...opts, headless: true });
      const page = await browser.newPage();
      await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
      console.log(`Channel ${ch}: SUCCESS - ${await page.title()}`);
      await browser.close();
    } catch (err) {
      console.log(`Channel ${ch}: FAILED - ${err.message}`);
    }
  }
}

testChannels();
