const { testPlatformEndToEnd } = require('./test_social_helper.cjs');
const fs = require('fs');
const path = require('path');

const VERIFIED_TEST_CASES = [
  // 1. YouTube Standard
  {
    platform: 'YouTube',
    name: 'YouTube Standard Web Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp4',
    quality: '720p HD',
  },
  // 2. YouTube Mp4
  {
    platform: 'YouTube Mp4',
    name: 'YouTube to MP4 FHD Remux',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp4',
    quality: '1080p FHD',
  },
  // 3. YouTube Shorts
  {
    platform: 'YouTube Shorts',
    name: 'YouTube Shorts Vertical Stream',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    format: 'mp4',
    quality: '720p HD',
  },
  // 4. YouTube Mp3
  {
    platform: 'YouTube Mp3',
    name: 'YouTube to MP3 High Bitrate Extraction',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    format: 'mp3',
    quality: '320',
  },
  // 5. TikTok
  {
    platform: 'TikTok',
    name: 'TikTok Video Stream',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    format: 'mp4',
    quality: 'HD (No Watermark)',
  },
  // 6. Facebook
  {
    platform: 'Facebook',
    name: 'Facebook Watch Video',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
    format: 'mp4',
    quality: 'HD 1080p',
  },
  // 7. Dailymotion
  {
    platform: 'Dailymotion',
    name: 'Dailymotion News Video',
    url: 'https://www.dailymotion.com/video/xa0za8o',
    format: 'mp4',
    quality: '720p HD',
  },
  // 8. Twitter (X)
  {
    platform: 'Twitter',
    name: 'Twitter / X Media Post',
    url: 'https://x.com/historyinmemes/status/1790637656616943991',
    format: 'mp4',
    quality: '720p HD',
  },
  // 9. Reddit
  {
    platform: 'Reddit',
    name: 'Reddit Native Video with Merged Audio',
    url: 'https://www.reddit.com/r/SPFootballLife/s/E1kP0fP3FF',
    format: 'mp4',
    quality: '720p MP4 (Merged Audio)',
  },
];

async function main() {
  console.log('############################################################');
  console.log('VIDLOADER 9-PLATFORM FULL VERIFICATION SUITE');
  console.log('############################################################\n');

  const results = [];

  for (const tc of VERIFIED_TEST_CASES) {
    const res = await testPlatformEndToEnd(tc);
    results.push(res);
  }

  console.log('\n\n============================================================');
  console.log('VERIFICATION RESULTS (ALL 9 SOCIAL MEDIA TARGETS)');
  console.log('============================================================');
  console.table(results.map(r => ({
    Platform: r.platform,
    'Resolve': r.resolveSuccess ? '✓' : '✗',
    'Formats': r.resolveFormatsCount,
    'Job Start': r.jobStartSuccess ? '✓' : '✗',
    'Download': r.downloadCompleted ? '✓' : '✗',
    'Size (MB)': r.downloadSizeBytes ? (r.downloadSizeBytes / 1024 / 1024).toFixed(2) : '0',
    'Time (s)': (r.durationMs / 1000).toFixed(1),
    Status: r.downloadCompleted ? 'SUCCESS' : (r.error ? r.error.slice(0, 35) : 'FAILED'),
  })));

  const outPath = path.join(__dirname, '..', 'scratch', 'verified_9_socials_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to: ${outPath}`);
}

main().catch(err => {
  console.error('Test suite failed:', err);
});
