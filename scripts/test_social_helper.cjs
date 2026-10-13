const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(`${BASE_URL}${urlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 45000,
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timed out')); });
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${urlPath}`, { timeout: 30000 }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timed out')); });
  });
}

function getBinary(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${urlPath}`, { timeout: 30000 }, (res) => {
      let totalBytes = 0;
      res.on('data', chunk => { totalBytes += chunk.length; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          bytes: totalBytes,
          contentType: res.headers['content-type'],
          contentDisposition: res.headers['content-disposition'],
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timed out')); });
  });
}

async function testPlatformEndToEnd(testCase) {
  console.log(`\n============================================================`);
  console.log(`[TESTING] ${testCase.platform} - ${testCase.name}`);
  console.log(`URL: ${testCase.url}`);
  console.log(`Requested Target: ${testCase.format} (${testCase.quality})`);
  console.log(`============================================================`);

  const report = {
    platform: testCase.platform,
    name: testCase.name,
    url: testCase.url,
    format: testCase.format,
    quality: testCase.quality,
    resolveSuccess: false,
    resolveTitle: null,
    resolveFormatsCount: 0,
    jobStartSuccess: false,
    jobId: null,
    downloadCompleted: false,
    downloadSizeBytes: 0,
    downloadContentType: null,
    durationMs: 0,
    error: null,
  };

  const startTime = Date.now();

  try {
    // 1. Resolve endpoint
    console.log(`  -> Step 1: Calling POST /api/resolve...`);
    const resolveRes = await postJson('/api/resolve', { url: testCase.url });
    if (resolveRes.status !== 200 || !resolveRes.data?.success) {
      report.error = `Resolution failed (${resolveRes.status}): ${JSON.stringify(resolveRes.data || resolveRes.raw)}`;
      console.log(`  ✗ ${report.error}`);
      report.durationMs = Date.now() - startTime;
      return report;
    }

    report.resolveSuccess = true;
    report.resolveTitle = resolveRes.data.title;
    report.resolveFormatsCount = (resolveRes.data.formats || []).length;
    console.log(`  ✓ Resolved: "${report.resolveTitle}" (${report.resolveFormatsCount} formats detected)`);

    // Pick format
    const formatItem = (resolveRes.data.formats || []).find(f => {
      if (testCase.format === 'mp3') return f.type === 'audio' || f.container === 'MP3';
      return f.type === 'video' || f.container === 'MP4';
    }) || resolveRes.data.formats[0];

    // 2. Process endpoint
    console.log(`  -> Step 2: Calling POST /api/process (format: ${testCase.format}, quality: ${testCase.quality})...`);
    const processRes = await postJson('/api/process', {
      url: testCase.url,
      format: testCase.format,
      quality: testCase.quality,
      title: resolveRes.data.title,
      formatId: formatItem?.id || '',
    });

    if (processRes.status !== 200 || !processRes.data?.jobId) {
      report.error = `Job start failed (${processRes.status}): ${JSON.stringify(processRes.data || processRes.raw)}`;
      console.log(`  ✗ ${report.error}`);
      report.durationMs = Date.now() - startTime;
      return report;
    }

    report.jobStartSuccess = true;
    report.jobId = processRes.data.jobId;
    console.log(`  ✓ Job initiated: ID ${report.jobId}`);

    // 3. Poll job status
    console.log(`  -> Step 3: Polling GET /api/process/${report.jobId}...`);
    let pollAttempts = 0;
    const maxPolls = 60; // Up to 60 seconds
    let finalJobStatus = null;

    while (pollAttempts < maxPolls) {
      pollAttempts++;
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await getJson(`/api/process/${report.jobId}`);
      if (statusRes.data) {
        if (statusRes.data.status === 'completed') {
          finalJobStatus = statusRes.data;
          break;
        } else if (statusRes.data.status === 'failed') {
          report.error = statusRes.data.error || 'Job failed on server';
          console.log(`  ✗ Job failed: ${report.error}`);
          report.durationMs = Date.now() - startTime;
          return report;
        } else {
          process.stdout.write(`    [Poll #${pollAttempts}] Status: ${statusRes.data.status} (${statusRes.data.progress}%)\r`);
        }
      }
    }
    console.log('');

    if (!finalJobStatus || finalJobStatus.status !== 'completed') {
      report.error = 'Job timed out waiting for completion';
      console.log(`  ✗ ${report.error}`);
      report.durationMs = Date.now() - startTime;
      return report;
    }

    console.log(`  ✓ Job marked completed on server: ${finalJobStatus.downloadUrl}`);

    // 4. Download file from server
    console.log(`  -> Step 4: Fetching actual media payload from ${finalJobStatus.downloadUrl}...`);
    const downloadRes = await getBinary(finalJobStatus.downloadUrl);
    if (downloadRes.status !== 200 || downloadRes.bytes === 0) {
      report.error = `Media fetch failed: status ${downloadRes.status}, bytes: ${downloadRes.bytes}`;
      console.log(`  ✗ ${report.error}`);
      report.durationMs = Date.now() - startTime;
      return report;
    }

    report.downloadCompleted = true;
    report.downloadSizeBytes = downloadRes.bytes;
    report.downloadContentType = downloadRes.contentType;
    report.durationMs = Date.now() - startTime;
    console.log(`  ✓ MEDIA DOWNLOADED TO CLIENT: ${(downloadRes.bytes / 1024 / 1024).toFixed(2)} MB (${downloadRes.contentType}) in ${(report.durationMs / 1000).toFixed(1)}s`);

  } catch (err) {
    report.error = err.message;
    console.log(`  ✗ Exception: ${err.message}`);
    report.durationMs = Date.now() - startTime;
  }

  return report;
}

module.exports = { testPlatformEndToEnd };
