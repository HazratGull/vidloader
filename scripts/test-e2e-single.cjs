const { chromium } = require('playwright');

async function testE2ESingle() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  console.log('Page loaded');
  
  const inputEl = await page.$('.downloader-input');
  const submitBtn = await page.$('.btn-download-primary');
  console.log('Found input:', !!inputEl, 'Found submit:', !!submitBtn);
  
  if (inputEl && submitBtn) {
    await inputEl.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('Filled input');
    await submitBtn.click();
    console.log('Clicked download');
    
    try {
      await page.waitForSelector('.savefrom-format-table', { timeout: 15000 });
      console.log('SUCCESS: .savefrom-format-table appeared!');
      
      const firstBtn = await page.$('.savefrom-btn-green');
      if (firstBtn) {
        console.log('Found format download button. Clicking...');
        await firstBtn.click();
        await page.waitForTimeout(1000);
        const progressCard = await page.$('.download-progress-card');
        console.log('Download progress card appeared:', !!progressCard);
      }
    } catch (err) {
      console.log('Timeout or error waiting for format table:', err.message);
      // Let's check if error banner appeared
      const errorBanner = await page.$('.error-alert, .error-banner, .downloader-error');
      if (errorBanner) {
        console.log('Error banner text:', await errorBanner.textContent());
      }
    }
  }
  
  await browser.close();
}

testE2ESingle();
