const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';

function postJson(urlPath, data, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(`${BASE_URL}${urlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: timeoutMs,
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`POST ${urlPath} timed out after ${timeoutMs}ms`));
    });
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${urlPath}`, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`GET ${urlPath} timed out after ${timeoutMs}ms`));
    });
  });
}

function getBinary(urlPath, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const client = fullUrl.startsWith('https') ? https : http;
    const req = client.get(fullUrl, { timeout: timeoutMs }, (res) => {
      let totalBytes = 0;
      const startTime = Date.now();
      res.on('data', chunk => { totalBytes += chunk.length; });
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          bytes: totalBytes,
          contentType: res.headers['content-type'],
          contentDisposition: res.headers['content-disposition'],
          durationMs,
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Binary download timed out after ${timeoutMs}ms`));
    });
  });
}

const ALL_PLATFORM_TEST_CASES = [
  // 1. YouTube Standard HD
  {
    category: 'YouTube',
    name: 'YouTube Standard (720p HD MP4)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp4',
    quality: '720p HD',
  },
  // 2. YouTube 1080p FHD Remux (video+audio DASH merge)
  {
    category: 'YouTube Mp4',
    name: 'YouTube FHD Remux (1080p FHD MP4)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp4',
    quality: '1080p FHD',
  },
  // 3. YouTube Shorts Vertical Stream
  {
    category: 'YouTube Shorts',
    name: 'YouTube Shorts (Vertical 720p HD)',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    format: 'mp4',
    quality: '720p HD',
  },
  // 4. YouTube MP3 Audio Extraction
  {
    category: 'YouTube Mp3',
    name: 'YouTube to MP3 (320kbps High Bitrate)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp3',
    quality: '320',
  },
  // 5. TikTok Watermark-free Video
  {
    category: 'TikTok',
    name: 'TikTok Clean Video Stream',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    format: 'mp4',
    quality: 'HD (No Watermark)',
  },
  // 6. Facebook Watch / Video Stream
  {
    category: 'Facebook',
    name: 'Facebook Watch Video',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
    format: 'mp4',
    quality: 'HD 1080p',
  },
  // 7. Dailymotion Hosted Web Video
  {
    category: 'Dailymotion',
    name: 'Dailymotion News Stream',
    url: 'https://www.dailymotion.com/video/xa0za8o',
    format: 'mp4',
    quality: '720p HD',
  },
  // 8. Twitter / X Video Tweet
  {
    category: 'Twitter (X)',
    name: 'Twitter / X Media Post',
    url: 'https://x.com/historyinmemes/status/1790637656616943991',
    format: 'mp4',
    quality: '720p HD',
  },
  // 9. Reddit Video
  {
    category: 'Reddit',
    name: 'Reddit Native Video Post',
    url: 'https://www.reddit.com/r/SPFootballLife/s/E1kP0fP3FF',
    format: 'mp4',
    quality: '720p MP4 (Merged Audio)',
  },
  // 10. Instagram Reel
  {
    category: 'Instagram',
    name: 'Instagram Reel Video Post',
    url: 'https://www.instagram.com/reel/Cw9xyz123/',
    format: 'mp4',
    quality: '1080p Full HD',
  },
  // 11. Thumbnail Downloader Endpoint
  {
    category: 'Thumbnail Tool',
    name: 'Video Cover Art Proxy',
    url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    isThumbnailOnly: true,
  },
];

async function testSingleTarget(tc) {
  console.log(`\n============================================================`);
  console.log(`[TESTING] ${tc.category} :: ${tc.name}`);
  console.log(`Target URL: ${tc.url}`);
  if (!tc.isThumbnailOnly) {
    console.log(`Target Format: ${tc.format} | Quality: ${tc.quality}`);
  }
  console.log(`============================================================`);

  const report = {
    category: tc.category,
    name: tc.name,
    url: tc.url,
    format: tc.format || 'img',
    quality: tc.quality || 'N/A',
    resolveSuccess: false,
    resolveTimeMs: 0,
    formatsCount: 0,
    jobStarted: false,
    jobStartTimeMs: 0,
    jobId: null,
    processTimeMs: 0,
    downloadSuccess: false,
    downloadSizeBytes: 0,
    downloadThroughputMBps: 0,
    downloadTimeMs: 0,
    totalDurationMs: 0,
    status: 'PENDING',
    error: null,
  };

  const overallStart = Date.now();

  try {
    // A. Special handling for Thumbnail Tool
    if (tc.isThumbnailOnly) {
      console.log('  -> Fetching /api/thumbnail?url=...');
      const thumbRes = await getBinary(`/api/thumbnail?url=${encodeURIComponent(tc.url)}`, 15000);
      report.totalDurationMs = Date.now() - overallStart;
      if (thumbRes.status === 200 && thumbRes.bytes > 0) {
        report.resolveSuccess = true;
        report.downloadSuccess = true;
        report.downloadSizeBytes = thumbRes.bytes;
        report.downloadTimeMs = thumbRes.durationMs;
        report.downloadThroughputMBps = Number(((thumbRes.bytes / 1024 / 1024) / (thumbRes.durationMs / 1000 || 1)).toFixed(2));
        report.status = 'SUCCESS';
        console.log(`  ✓ Thumbnail successfully proxied: ${(thumbRes.bytes / 1024).toFixed(1)} KB in ${(report.totalDurationMs / 1000).toFixed(2)}s`);
      } else {
        report.status = 'FAILED';
        report.error = `Thumbnail proxy returned HTTP ${thumbRes.status} (bytes: ${thumbRes.bytes})`;
        console.log(`  ✗ ${report.error}`);
      }
      return report;
    }

    // B. Standard Video / Audio Platform E2E Flow
    // Step 1: POST /api/resolve (capped at 20s)
    const resolveStart = Date.now();
    console.log('  -> Step 1: POST /api/resolve (timeout 20s)...');
    let resolveRes;
    try {
      resolveRes = await postJson('/api/resolve', { url: tc.url }, 20000);
    } catch (e) {
      report.resolveTimeMs = Date.now() - resolveStart;
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Resolve request timeout or connection error: ${e.message}`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }
    report.resolveTimeMs = Date.now() - resolveStart;

    if (resolveRes.status !== 200 || !resolveRes.data?.success) {
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Resolve failed (HTTP ${resolveRes.status}): ${JSON.stringify(resolveRes.data?.message || resolveRes.data?.error || resolveRes.raw)}`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }

    report.resolveSuccess = true;
    report.formatsCount = (resolveRes.data.formats || []).length;
    console.log(`  ✓ Resolved in ${(report.resolveTimeMs / 1000).toFixed(2)}s: "${resolveRes.data.title}" (${report.formatsCount} formats available)`);

    // Select format
    const formatItem = (resolveRes.data.formats || []).find(f => {
      if (tc.format === 'mp3') return f.type === 'audio' || f.container === 'MP3';
      return f.type === 'video' || f.container === 'MP4';
    }) || resolveRes.data.formats[0];

    // Step 2: POST /api/process (capped at 10s)
    console.log(`  -> Step 2: POST /api/process [${tc.format} · ${tc.quality}]...`);
    const jobStart = Date.now();
    let processRes;
    try {
      processRes = await postJson('/api/process', {
        url: tc.url,
        format: tc.format,
        quality: tc.quality,
        title: resolveRes.data.title,
        formatId: formatItem?.id || '',
      }, 10000);
    } catch (e) {
      report.jobStartTimeMs = Date.now() - jobStart;
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Job start request timeout: ${e.message}`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }
    report.jobStartTimeMs = Date.now() - jobStart;

    if (processRes.status !== 200 || !processRes.data?.jobId) {
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Job start rejected (HTTP ${processRes.status}): ${JSON.stringify(processRes.data || processRes.raw)}`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }

    report.jobStarted = true;
    report.jobId = processRes.data.jobId;
    console.log(`  ✓ Job queued: ${report.jobId}`);

    // Step 3: Poll GET /api/process/:jobId (capped at 50s max polls)
    console.log(`  -> Step 3: Polling job status (max 50s)...`);
    const procStart = Date.now();
    let pollCount = 0;
    const maxPolls = 50;
    let finalJob = null;

    while (pollCount < maxPolls) {
      pollCount++;
      await new Promise(r => setTimeout(r, 1000));
      try {
        const st = await getJson(`/api/process/${report.jobId}`, 5000);
        if (st.data?.status === 'completed') {
          finalJob = st.data;
          break;
        } else if (st.data?.status === 'failed') {
          report.error = st.data.error || 'Server reported job failure';
          break;
        } else {
          process.stdout.write(`    [Poll #${pollCount}] Status: ${st.data?.status || 'unknown'} (${st.data?.progress || 0}%)\r`);
        }
      } catch (pollErr) {
        // If single poll failed, log and continue
      }
    }
    console.log('');
    report.processTimeMs = Date.now() - procStart;

    if (!finalJob || finalJob.status !== 'completed') {
      report.totalDurationMs = Date.now() - overallStart;
      report.error = report.error || `Job processing timed out after ${maxPolls}s without completion`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }

    console.log(`  ✓ Transcoded / Remuxed on server in ${(report.processTimeMs / 1000).toFixed(1)}s: ${finalJob.downloadUrl}`);

    // Step 4: Stream binary media payload to client
    console.log(`  -> Step 4: Streaming media file payload...`);
    const dlStart = Date.now();
    let dlRes;
    try {
      dlRes = await getBinary(finalJob.downloadUrl, 20000);
    } catch (dlErr) {
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Binary payload stream error: ${dlErr.message}`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }
    report.downloadTimeMs = Date.now() - dlStart;

    if (dlRes.status !== 200 || dlRes.bytes === 0) {
      report.totalDurationMs = Date.now() - overallStart;
      report.error = `Media fetch failed with HTTP ${dlRes.status} (bytes: ${dlRes.bytes})`;
      report.status = 'FAILED';
      console.log(`  ✗ ${report.error} (proceeding to next target)`);
      return report;
    }

    report.downloadSuccess = true;
    report.downloadSizeBytes = dlRes.bytes;
    const mb = dlRes.bytes / (1024 * 1024);
    const secs = report.downloadTimeMs / 1000 || 0.1;
    report.downloadThroughputMBps = Number((mb / secs).toFixed(2));
    report.totalDurationMs = Date.now() - overallStart;
    report.status = 'SUCCESS';

    console.log(`  ✓ COMPLETED: ${mb.toFixed(2)} MB (${dlRes.contentType}) transferred at ${report.downloadThroughputMBps} MB/s in ${(report.totalDurationMs / 1000).toFixed(1)}s total.`);

  } catch (err) {
    report.totalDurationMs = Date.now() - overallStart;
    report.error = `Unexpected exception: ${err.message}`;
    report.status = 'FAILED';
    console.log(`  ✗ Exception: ${err.message} (proceeding to next target)`);
  }

  return report;
}

async function runComprehensiveSuite() {
  console.log('========================================================================');
  console.log('VIDLOADER UNIVERSAL ALL-PLATFORM E2E TEST & EFFICIENCY BENCHMARK');
  console.log('========================================================================\n');

  const results = [];

  for (const tc of ALL_PLATFORM_TEST_CASES) {
    const res = await testSingleTarget(tc);
    results.push(res);
  }

  console.log('\n\n========================================================================');
  console.log('FINAL BENCHMARK & STATUS REPORT: ALL SOCIAL PLATFORMS');
  console.log('========================================================================');

  console.table(results.map(r => ({
    Platform: r.category,
    Target: r.name.slice(0, 32),
    Resolve: r.resolveSuccess ? 'PASS' : 'FAIL',
    'Res Time': `${(r.resolveTimeMs / 1000).toFixed(1)}s`,
    Transcode: r.processTimeMs ? `${(r.processTimeMs / 1000).toFixed(1)}s` : 'N/A',
    Payload: r.downloadSizeBytes ? `${(r.downloadSizeBytes / 1024 / 1024).toFixed(2)} MB` : '0 MB',
    'Rate (MB/s)': r.downloadThroughputMBps || 'N/A',
    'Total (s)': `${(r.totalDurationMs / 1000).toFixed(1)}s`,
    Status: r.status,
    Error: r.error ? r.error.slice(0, 42) : 'None',
  })));

  const outDir = path.resolve(__dirname, '..', 'scratch');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'comprehensive_test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed structured metrics written to: ${outPath}`);

  return results;
}

runComprehensiveSuite().catch(err => {
  console.error('Test suite execution failed:', err);
});
