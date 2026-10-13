const http = require('http');
const assert = require('assert');
const { chromium } = require('playwright');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';

async function fetchHttp(url, options = {}) {
  const parsed = new URL(url);
  const pathToSend = options.rawPath || (parsed.pathname + parsed.search);
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: pathToSend,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('RUNNING VIDLOADER PRODUCTION READINESS TEST SUITE');
  console.log('Target Server:', BASE_URL);
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function record(title, passed, detail = '') {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`  ✓ [PASS] ${title}`);
    } else {
      console.error(`  ✗ [FAIL] ${title}: ${detail}`);
    }
  }

  // 1. Security Headers Verification
  console.log('--- 1. Security Headers & Static Serving ---');
  try {
    const rootRes = await fetchHttp(`${BASE_URL}/`);
    record('Homepage returns 200 OK', rootRes.status === 200);
    record('X-Content-Type-Options: nosniff present', rootRes.headers['x-content-type-options'] === 'nosniff');
    record('X-Frame-Options: SAMEORIGIN present', rootRes.headers['x-frame-options'] === 'SAMEORIGIN');
    record('Referrer-Policy present', !!rootRes.headers['referrer-policy']);
    record('Content-Security-Policy present', !!rootRes.headers['content-security-policy']);
    record('HTML Cache-Control is no-cache', (rootRes.headers['cache-control'] || '').includes('no-cache'));
  } catch (err) {
    record('Homepage accessible', false, err.message);
  }

  // 2. Path Traversal & Security Sandbox
  console.log('\n--- 2. Path Traversal & Security Probes ---');
  try {
    const traversalRes = await fetchHttp(BASE_URL, { rawPath: '/../../server.js' });
    record('Directory traversal rejected with 403 Forbidden', traversalRes.status === 403);

    const nonExistentFile = await fetchHttp(BASE_URL, { rawPath: '/non-existent-secret.env' });
    record('Missing static file returns 404 (not HTML fallback)', nonExistentFile.status === 404);
  } catch (err) {
    record('Directory traversal protection', false, err.message);
  }

  // 3. SSRF Protection Tests
  console.log('\n--- 3. Server-Side Request Forgery (SSRF) Guards ---');
  const ssrfTargets = [
    'http://localhost:8080/admin',
    'http://127.0.0.1:3000/internal',
    'http://169.254.169.254/latest/meta-data/',
    'http://192.168.1.1/router',
    'http://10.0.0.1/',
    'ftp://example.com/file.txt',
    'file:///etc/passwd'
  ];

  for (const badUrl of ssrfTargets) {
    try {
      const res = await fetchHttp(`${BASE_URL}/api/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: badUrl })
      });
      record(`SSRF attempt blocked (${badUrl.split('/')[2] || badUrl})`, res.status === 400);
    } catch (err) {
      record(`SSRF attempt blocked (${badUrl})`, false, err.message);
    }
  }

  // 4. API Health & Contact Verification
  console.log('\n--- 4. API Endpoints & Zero-Retention Architecture ---');
  try {
    const statusRes = await fetchHttp(`${BASE_URL}/api/system-status`);
    const statusData = JSON.parse(statusRes.body);
    record('System status reports ok: true', statusData.ok === true);
    record('System status detects ytdlp engine', statusData.ytdlp === true);
    record('System status detects ffmpeg engine', statusData.ffmpeg === true);
  } catch (err) {
    record('System status endpoint', false, err.message);
  }

  try {
    const contactRes = await fetchHttp(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pre-Deployment QA',
        email: 'qa@vidloader.online',
        category: 'Support',
        subject: 'Final Release Validation',
        message: 'Validating production build contact pipeline.'
      })
    });
    const contactData = JSON.parse(contactRes.body);
    record('Contact API accepts valid submission', contactData.success === true && !!contactData.id);
  } catch (err) {
    record('Contact API endpoint', false, err.message);
  }

  // 5. Playwright Browser Automation & UI Tests
  console.log('\n--- 5. Playwright Browser UI & Responsiveness ---');
  try {
    const browser = await chromium.launch({ headless: true });
    
    // Viewports to test
    const testViewports = [
      { name: 'Mobile (320px)', width: 320, height: 568 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1920px)', width: 1920, height: 1080 }
    ];

    for (const vp of testViewports) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Check overflow
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      record(`No horizontal scroll on ${vp.name}`, !overflow);
      record(`Zero console errors on ${vp.name}`, consoleErrors.length === 0, consoleErrors.join(' | '));

      await ctx.close();
    }

    // End-to-end interactive flow on Desktop
    const e2ePage = await browser.newPage();
    await e2ePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    const input = await e2ePage.$('.downloader-input');
    const submitBtn = await e2ePage.$('.btn-download-primary');

    record('Downloader URL input found on page', !!input);
    record('Downloader submit button found on page', !!submitBtn);

    if (input && submitBtn) {
      await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await submitBtn.click();
      await e2ePage.waitForSelector('.savefrom-format-table', { timeout: 15000 });
      const hasTable = await e2ePage.isVisible('.savefrom-format-table');
      record('Real URL resolved and format options table rendered', hasTable);

      const downloadBtn = await e2ePage.$('.savefrom-btn-green');
      record('Format download CTA button interactive', !!downloadBtn);
    }

    await browser.close();
  } catch (browserErr) {
    record('Playwright browser test suite', false, browserErr.message);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed unexpectedly:', err);
  process.exit(1);
});
