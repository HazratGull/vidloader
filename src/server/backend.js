import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const activeJobs = new Map();
const downloadsDir = path.resolve(process.cwd(), 'temp_downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Zero server storage: purge any leftover media files on startup
try {
  const existingFiles = fs.readdirSync(downloadsDir);
  for (const f of existingFiles) {
    if (f !== 'support_messages.json') {
      try { fs.unlinkSync(path.join(downloadsDir, f)); } catch {}
    }
  }
} catch {}

// Purge media jobs immediately after transfer or if older than 10 minutes
const purgeInterval = setInterval(() => {
  const now = Date.now();
  for (const [jobId, job] of activeJobs.entries()) {
    if (now - job.createdAt > 10 * 60 * 1000) {
      if (job.actualPath && fs.existsSync(job.actualPath)) {
        try { fs.unlinkSync(job.actualPath); } catch {}
      }
      activeJobs.delete(jobId);
    }
  }
  // Also clean unreferenced temporary media fragments
  try {
    const files = fs.readdirSync(downloadsDir);
    for (const f of files) {
      if (f !== 'support_messages.json') {
        const full = path.join(downloadsDir, f);
        const stat = fs.statSync(full);
        if (now - stat.mtimeMs > 2 * 60 * 1000) {
          try { fs.unlinkSync(full); } catch {}
        }
      }
    }
  } catch {}
}, 60 * 1000);
if (purgeInterval && typeof purgeInterval.unref === 'function') {
  purgeInterval.unref();
}

/**
 * Locates the YouTube cookies.txt file across standard local and cloud secret mount paths:
 * 1. process.env.COOKIES_PATH
 * 2. /etc/secrets/cookies.txt (Render default Secret File mount path)
 * 3. /etc/secrets/Vidloader/cookies.txt (Render Environment Group mount path)
 * 4. /etc/secrets/vidloader/cookies.txt
 * 5. process.cwd() + '/cookies.txt' (Local or Docker /app root)
 * 6. Relative directory paths
 */
export function getCookieFilePath() {
  const candidates = [
    process.env.COOKIES_PATH,
    '/etc/secrets/cookies.txt',
    '/etc/secrets/Vidloader/cookies.txt',
    '/etc/secrets/vidloader/cookies.txt',
    path.resolve(process.cwd(), 'cookies.txt'),
    path.resolve(__dirname, '../../cookies.txt'),
    path.resolve(__dirname, 'cookies.txt'),
  ].filter(Boolean);

  for (const cPath of candidates) {
    try {
      if (fs.existsSync(cPath)) {
        const stat = fs.statSync(cPath);
        if (stat.isFile() && stat.size > 0) {
          try { fs.chmodSync(cPath, 0o600); } catch {}
          return cPath;
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Validates that an incoming URL is a public, safe HTTP or HTTPS media URL,
 * mitigating Server-Side Request Forgery (SSRF) against internal resources.
 */
export function isValidPublicMediaUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    return false;
  }

  // Strictly require http: or https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject empty hostname or credentials embedded in URL
  if (!hostname || parsed.username || parsed.password) {
    return false;
  }

  // Block localhost and standard loopback hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]'
  ) {
    return false;
  }

  // Block AWS / cloud metadata endpoints
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return false;
  }

  // Block private IPv4 ranges:
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8, 0.0.0.0/8
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);
  if (ipMatch) {
    const p1 = parseInt(ipMatch[1], 10);
    const p2 = parseInt(ipMatch[2], 10);
    const p3 = parseInt(ipMatch[3], 10);
    const p4 = parseInt(ipMatch[4], 10);

    if (p1 > 255 || p2 > 255 || p3 > 255 || p4 > 255) return false;
    if (p1 === 127 || p1 === 10 || p1 === 0) return false;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return false;
    if (p1 === 192 && p2 === 168) return false;
    if (p1 === 169 && p2 === 254) return false;
  }

  // Block private IPv6 ranges
  if (
    hostname.startsWith('[fc') ||
    hostname.startsWith('[fd') ||
    hostname.startsWith('[fe80:') ||
    hostname.startsWith('[::')
  ) {
    return false;
  }

  return true;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

let cachedHasFfmpeg = null;
export function checkFfmpeg() {
  if (cachedHasFfmpeg !== null) return cachedHasFfmpeg;
  const ffmpegCmd = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    const res = spawnSync(ffmpegCmd, ['-version'], { timeout: 2000, windowsHide: true });
    cachedHasFfmpeg = res.status === 0;
  } catch {
    cachedHasFfmpeg = false;
  }
  return cachedHasFfmpeg;
}

let cachedYtDlpCmd = null;

export function detectYtDlpCommand() {
  if (cachedYtDlpCmd) return cachedYtDlpCmd;

  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    try {
      const res = spawnSync(process.env.YTDLP_PATH, ['--version'], { timeout: 4000 });
      if (res.status === 0) {
        const v = res.stdout?.toString()?.trim();
        console.log('[VidLoader] Using custom YTDLP_PATH:', process.env.YTDLP_PATH, v);
        cachedYtDlpCmd = { cmd: process.env.YTDLP_PATH, prefixArgs: [], version: v };
        return cachedYtDlpCmd;
      }
    } catch {}
  }

  const isLinux = process.platform === 'linux';
  const isWin = process.platform === 'win32';

  if (isLinux) {
    const linuxCandidates = [
      path.resolve(process.cwd(), 'yt-dlp_linux'),
      path.resolve(__dirname, '../../yt-dlp_linux'),
      path.resolve(__dirname, 'yt-dlp_linux'),
      path.resolve(process.cwd(), 'yt-dlp'),
      path.resolve(__dirname, '../../yt-dlp'),
    ];
    for (const bin of linuxCandidates) {
      if (fs.existsSync(bin)) {
        try { fs.chmodSync(bin, 0o755); } catch {}
        try {
          const res = spawnSync(bin, ['--version'], { timeout: 4000 });
          if (res.status === 0) {
            const v = res.stdout?.toString()?.trim();
            console.log('[VidLoader] Using working Linux standalone binary:', bin, v);
            cachedYtDlpCmd = { cmd: bin, prefixArgs: [], version: v };
            return cachedYtDlpCmd;
          } else {
            console.warn('[VidLoader] Candidate binary failed --version:', bin, res.stderr?.toString() || res.error?.message);
          }
        } catch (e) {
          console.warn('[VidLoader] Candidate test error:', bin, e.message);
        }
      }
    }
  }

  if (isWin) {
    const winCandidates = [
      path.resolve(process.cwd(), 'yt-dlp.exe'),
      path.resolve(__dirname, '../../yt-dlp.exe'),
      path.resolve(__dirname, 'yt-dlp.exe'),
    ];
    for (const bin of winCandidates) {
      if (fs.existsSync(bin)) {
        try {
          const res = spawnSync(bin, ['--version'], { timeout: 4000, windowsHide: true });
          if (res.status === 0) {
            const v = res.stdout?.toString()?.trim();
            console.log('[VidLoader] Using Windows binary:', bin, v);
            cachedYtDlpCmd = { cmd: bin, prefixArgs: [], version: v };
            return cachedYtDlpCmd;
          }
        } catch {}
      }
    }
  }

  // Probe runtime candidates with spawnSync
  const projRoot = process.cwd();
  const probeCandidates = [
    { cmd: 'yt-dlp', prefixArgs: [] },
    { cmd: '/usr/local/bin/yt-dlp', prefixArgs: [] },
    { cmd: '/usr/bin/yt-dlp', prefixArgs: [] },
    { cmd: 'python3', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: 'python', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: '/usr/bin/python3', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: '/opt/alt/python311/bin/python3', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: '/opt/alt/python312/bin/python3', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: '/opt/alt/python310/bin/python3', prefixArgs: ['-u', '-m', 'yt_dlp'] },
    { cmd: 'py', prefixArgs: ['-u', '-m', 'yt_dlp'] },
  ];

  for (const c of probeCandidates) {
    try {
      const res = spawnSync(c.cmd, [...c.prefixArgs, '--version'], {
        timeout: 4000,
        windowsHide: true,
        cwd: projRoot,
        env: { ...process.env, PYTHONPATH: projRoot },
      });
      if (res.status === 0) {
        const v = res.stdout?.toString()?.trim();
        console.log(`[VidLoader] Detected working yt-dlp via: ${c.cmd} ${c.prefixArgs.join(' ')} (${v})`);
        cachedYtDlpCmd = { ...c, version: v };
        return cachedYtDlpCmd;
      }
    } catch {}
  }

  // Safe default fallback
  cachedYtDlpCmd = isLinux
    ? { cmd: '/opt/alt/python311/bin/python3', prefixArgs: ['-u', '-m', 'yt_dlp'] }
    : { cmd: 'python', prefixArgs: ['-u', '-m', 'yt_dlp'] };
  return cachedYtDlpCmd;
}

/**
 * Spawns yt-dlp using detected available binary or Python module.
 */
export function spawnYtDlp(args) {
  const nodeDir = path.dirname(process.execPath || process.argv[0]);
  const customEnv = {
    ...process.env,
    PATH: `${nodeDir}${path.delimiter}${process.env.PATH || ''}`,
    PYTHONPATH: process.cwd(),
    PYTHONUNBUFFERED: '1',
    NODE_OPTIONS: '',
  };

  const detected = detectYtDlpCommand();
  const allArgs = [...detected.prefixArgs, ...args];
  return spawn(detected.cmd, allArgs, { cwd: process.cwd(), env: customEnv });
}

export function runCommandAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', d => { stdout += d; });
    proc.stderr?.on('data', d => { stderr += d; });
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || `Command ${cmd} exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

function cleanYtDlpError(rawStderr) {
  if (!rawStderr) return null;
  const lines = rawStderr.split('\n');
  const errorLine = lines.reverse().find(l => l.includes('ERROR:'));
  if (errorLine) {
    let msg = errorLine.replace(/^ERROR:\s*(?:\[[^\]]+\]\s*)?/, '').trim();
    msg = msg.replace(/^[^:]+:\s*/, '');
    msg = msg.replace(/;\s*please report this issue on.*$/i, '').trim();
    msg = msg.replace(/Confirm you are on the latest version.*$/i, '').trim();
    if (msg.toLowerCase().includes('no video formats found')) {
      return 'No downloadable media streams found for this video. The content may be private or restricted by the platform.';
    }
    if (msg.toLowerCase().includes('needs to be reloaded') || msg.toLowerCase().includes('unplayable')) {
      return 'YouTube security verification triggered on this specific stream. Try another resolution, or use the Desktop App.';
    }
    if (msg.toLowerCase().includes('sign in to confirm') || msg.toLowerCase().includes('bot')) {
      return 'YouTube security challenge triggered for this video on the server. Please try a different video or quality format.';
    }
    return msg;
  }
  return null;
}

/**
 * Resolve video metadata using yt-dlp
 */
export async function resolveVideo(url, platform = null) {
  return new Promise((resolve) => {
    // Check for optional cookies.txt in workspace, server root, or Render secret files
    const activeCookiePath = getCookieFilePath();
    const cookieArgs = activeCookiePath ? ['--cookies', activeCookiePath] : [];
    if (activeCookiePath) {
      console.log('[VidLoader Resolve] Using cookies file for YouTube auth:', activeCookiePath);
    }

    const nodeExec = process.execPath || 'node';
    const extractorArgs = cookieArgs.length > 0
      ? ['--extractor-args', 'youtube:player_client=web,web_embedded']
      : ['--extractor-args', 'youtube:player_client=android,ios,visionos,web'];

    const args = [
      '--js-runtimes', `node:${nodeExec}`,
      '--remote-components', 'ejs:github',
      '--dump-single-json',
      '--no-warnings',
      '--no-playlist',
      '--no-check-certificates',
      ...cookieArgs,
      ...extractorArgs,
      url
    ];

    let stdoutData = '';
    let stderrData = '';
    let proc;
    try {
      proc = spawnYtDlp(args);
    } catch {
      return resolve(null);
    }

    const timer = setTimeout(() => {
      try { proc.kill(); } catch {}
      resolve(null);
    }, 25000);

    proc.stdout.on('data', chunk => {
      stdoutData += chunk;
    });

    proc.stderr.on('data', chunk => {
      stderrData += chunk;
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && stdoutData) {
        try {
          const info = JSON.parse(stdoutData);
          
          const rawFormats = info.formats || [];
          const videoFormats = [];
          const audioFormats = [];

          const isPortrait = Boolean(info.width && info.height && info.height > info.width);
          const duration = (info.duration && info.duration > 0) ? Math.round(info.duration) : null;

          // Map available video heights
          const availableHeights = new Set();
          for (const f of rawFormats) {
            if (f.height && f.height > 0) {
              availableHeights.add(f.height);
            }
          }

          const targetHeights = [2160, 1440, 1080, 720, 480, 360];
          for (const targetH of targetHeights) {
            const hasMatch = Array.from(availableHeights).some(h => h >= targetH);
            if (hasMatch) {
              const calcW = isPortrait
                ? Math.round(targetH * 9 / 16)
                : Math.round(targetH * 16 / 9);
              const label = targetH >= 2160 ? '4K 2160p'
                : targetH >= 1440 ? '2K 1440p'
                : targetH >= 1080 ? '1080p FHD'
                : targetH >= 720 ? '720p HD'
                : targetH >= 480 ? '480p SD'
                : `${targetH}p`;

              const bytesPerSec = targetH >= 2160 ? 900000
                : targetH >= 1440 ? 550000
                : targetH >= 1080 ? 320000
                : targetH >= 720 ? 160000
                : targetH >= 480 ? 80000
                : 45000;

              videoFormats.push({
                id: `mp4-${targetH}p`,
                type: 'video',
                container: 'MP4',
                quality: label,
                resolution: `${calcW}x${targetH}`,
                sizeBytes: duration ? Math.round(duration * bytesPerSec) : null,
                fps: targetH >= 1080 ? 60 : 30,
                hasAudio: true,
              });
            }
          }

          // If no tiered heights found, provide native best stream and SD fallback
          if (videoFormats.length === 0) {
            const nativeH = info.height || 720;
            const nativeW = info.width || (isPortrait ? Math.round(nativeH * 9 / 16) : Math.round(nativeH * 16 / 9));
            videoFormats.push(
              { id: 'mp4-best', type: 'video', container: 'MP4', quality: `${nativeH}p`, resolution: `${nativeW}x${nativeH}`, sizeBytes: duration ? Math.round(duration * 180000) : null, fps: 30, hasAudio: true }
            );
            if (nativeH > 480) {
              videoFormats.push(
                { id: 'mp4-480p', type: 'video', container: 'MP4', quality: '480p SD', resolution: isPortrait ? '270x480' : '854x480', sizeBytes: duration ? Math.round(duration * 75000) : null, fps: 30, hasAudio: true }
              );
            }
          }

          // Audio formats
          audioFormats.push(
            { id: 'mp3-320', type: 'audio', container: 'MP3', quality: '320', bitrate: '320kbps', sizeBytes: duration ? Math.round(duration * 40000) : null, sampleRate: '48kHz' },
            { id: 'mp3-192', type: 'audio', container: 'MP3', quality: '192', bitrate: '192kbps', sizeBytes: duration ? Math.round(duration * 24000) : null, sampleRate: '44.1kHz' },
            { id: 'mp3-128', type: 'audio', container: 'MP3', quality: '128', bitrate: '128kbps', sizeBytes: duration ? Math.round(duration * 16000) : null, sampleRate: '44.1kHz' },
            { id: 'm4a-128', type: 'audio', container: 'M4A', quality: '128', bitrate: '128kbps AAC', sizeBytes: duration ? Math.round(duration * 16000) : null, sampleRate: '44.1kHz' }
          );

          let thumb = info.thumbnail || '';
          if (!thumb && Array.isArray(info.thumbnails) && info.thumbnails.length > 0) {
            thumb = info.thumbnails[info.thumbnails.length - 1]?.url || '';
          }

          resolve({
            success: true,
            source: info.extractor_key || platform || 'Web',
            title: info.title || 'Online Video',
            author: info.uploader || info.channel || info.creator || info.uploader_id || 'Creator',
            thumbnail: thumb,
            duration: duration,
            originalUrl: url,
            formats: [...videoFormats, ...audioFormats],
          });
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Fallback metadata resolver using public OpenGraph / HTML metadata
 */
export async function resolvePageMetadata(url, platform = null) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();

    const getMeta = (prop) => {
      const match = html.match(new RegExp(`<meta\\s+(?:property|name)=["'](?:og:|twitter:)?${prop}["']\\s+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["'](?:og:|twitter:)?${prop}["']`, 'i'));
      return match ? match[1] : null;
    };

    const ogTitle = getMeta('title');
    const ogImage = getMeta('image');
    const ogSite = getMeta('site_name') || platform;
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const rawTitle = ogTitle || (titleTagMatch ? titleTagMatch[1] : null);
    let cleanTitle = rawTitle ? rawTitle.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim() : null;
    let cleanAuthor = ogSite || 'Creator';
    let thumbnail = ogImage || '';

    // Check for YouTube oEmbed fallback if HTML returned generic or blocked title
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if ((!cleanTitle || cleanTitle === 'YouTube' || cleanTitle === '- YouTube') && (ytMatch || url.includes('youtube.com') || url.includes('youtu.be'))) {
      const vId = ytMatch ? ytMatch[1] : '';
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (oembedRes.ok) {
          const oData = await oembedRes.json();
          if (oData.title) cleanTitle = oData.title;
          if (oData.author_name) cleanAuthor = oData.author_name;
          if (oData.thumbnail_url) thumbnail = oData.thumbnail_url;
        }
      } catch {}
      if (!thumbnail && vId) {
        thumbnail = `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
      }
    }

    if (cleanTitle && cleanTitle.trim()) {
      const lowerTitle = cleanTitle.toLowerCase();

      // Ignore generic 404 error pages or missing video titles
      if (
        cleanTitle === 'YouTube' ||
        cleanTitle === '- YouTube' ||
        lowerTitle.includes('page not found') ||
        lowerTitle.includes('404 not found') ||
        lowerTitle.includes('video unavailable') ||
        lowerTitle === 'instagram' ||
        lowerTitle === 'tiktok' ||
        lowerTitle === 'reddit'
      ) {
        return null;
      }

      // Extract authentic duration from HTML metadata if available
      let detectedDuration = null;
      const lengthSecMatch = html.match(/"lengthSeconds"\s*:\s*"?(\d+)"?/i) || html.match(/"approxDurationMs"\s*:\s*"?(\d+)"?/i);
      if (lengthSecMatch) {
        detectedDuration = lengthSecMatch[0].includes('approxDurationMs')
          ? Math.round(parseInt(lengthSecMatch[1], 10) / 1000)
          : parseInt(lengthSecMatch[1], 10);
      } else {
        const isoMatch = html.match(/itemprop=["']duration["']\s+content=["']PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?["']/i);
        if (isoMatch) {
          const h = parseInt(isoMatch[1] || '0', 10);
          const m = parseInt(isoMatch[2] || '0', 10);
          const s = parseInt(isoMatch[3] || '0', 10);
          detectedDuration = (h * 3600) + (m * 60) + s;
        } else {
          const ogDurMatch = html.match(/(?:property|name)=["'](?:og:)?video:duration["']\s+content=["'](\d+)["']/i);
          if (ogDurMatch) {
            detectedDuration = parseInt(ogDurMatch[1], 10);
          }
        }
      }

      return {
        success: true,
        source: platform ? (platform.charAt(0).toUpperCase() + platform.slice(1)) : 'Online Video',
        title: cleanTitle,
        author: cleanAuthor,
        thumbnail,
        duration: detectedDuration || null,
        originalUrl: url,
        formats: [
          { id: 'mp4-1080p', type: 'video', container: 'MP4', quality: '1080p FHD', resolution: '1920x1080', sizeBytes: detectedDuration ? Math.round(detectedDuration * 320000) : null, fps: 60, hasAudio: true },
          { id: 'mp4-720p',  type: 'video', container: 'MP4', quality: '720p HD',   resolution: '1280x720',  sizeBytes: detectedDuration ? Math.round(detectedDuration * 160000) : null, fps: 30, hasAudio: true },
          { id: 'mp4-480p',  type: 'video', container: 'MP4', quality: '480p SD',   resolution: '854x480',   sizeBytes: detectedDuration ? Math.round(detectedDuration * 80000) : null, fps: 30, hasAudio: true },
          { id: 'mp4-360p',  type: 'video', container: 'MP4', quality: '360p',      resolution: '640x360',   sizeBytes: detectedDuration ? Math.round(detectedDuration * 45000) : null, fps: 30, hasAudio: true },
          { id: 'mp3-320',   type: 'audio', container: 'MP3', quality: '320',       bitrate: '320kbps',      sizeBytes: detectedDuration ? Math.round(detectedDuration * 40000) : null, sampleRate: '48kHz' },
          { id: 'mp3-192',   type: 'audio', container: 'MP3', quality: '192',       bitrate: '192kbps',      sizeBytes: detectedDuration ? Math.round(detectedDuration * 24000) : null, sampleRate: '44.1kHz' },
          { id: 'mp3-128',   type: 'audio', container: 'MP3', quality: '128',       bitrate: '128kbps',      sizeBytes: detectedDuration ? Math.round(detectedDuration * 16000) : null, sampleRate: '44.1kHz' },
          { id: 'm4a-128',   type: 'audio', container: 'M4A', quality: '128',       bitrate: '128kbps AAC',  sizeBytes: detectedDuration ? Math.round(detectedDuration * 16000) : null, sampleRate: '44.1kHz' },
        ],
      };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Vite plugin exposing the VidLoader backend API endpoints:
 * - POST /api/resolve
 * - POST /api/process
 * - GET  /api/process/:jobId
 * - GET  /api/download/:jobId
 */
export function vidloaderBackendPlugin() {
  return {
    name: 'vidloader-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        // Security guard: block access to sensitive credentials, cookies, or env files
        if (url.toLowerCase().includes('cookies') || url.toLowerCase().includes('.env')) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'text/plain');
          return res.end('Access Denied');
        }

        if (!url.startsWith('/api')) {
          return next();
        }

        if (res.headersSent) {
          return;
        }

        // 1. POST /api/resolve
        if (url === '/api/resolve' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const targetUrl = (body.url || '').trim();
            const platform = body.platform || null;

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: 'URL is required' }));
            }

            if (!isValidPublicMediaUrl(targetUrl)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: false,
                message: 'Invalid URL. Please enter a valid, public HTTP or HTTPS video link.',
              }));
            }

            // 1. Attempt yt-dlp resolution
            const resolved = await resolveVideo(targetUrl, platform);
            if (resolved) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(resolved));
            }

            // 2. Attempt lightweight HTML OpenGraph / Meta tag resolution
            const ogResolved = await resolvePageMetadata(targetUrl, platform);
            if (ogResolved) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(ogResolved));
            }

            // 3. Inform user clearly if URL cannot be fetched
            res.statusCode = 422;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              success: false,
              message: 'Could not fetch media information from this URL. Please verify the URL is public, accessible, and not private or age-restricted.',
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // 2. POST /api/process
        if (url === '/api/process' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const { url: targetUrl, format = 'mp4', quality = '720p HD', title = 'video', formatId = '' } = body;

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: 'URL is required' }));
            }

            if (!isValidPublicMediaUrl(targetUrl)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: false,
                message: 'Invalid URL. Please enter a valid, public HTTP or HTTPS video link.',
              }));
            }

            const isM4A = format.toLowerCase() === 'm4a' || formatId.includes('m4a');
            const isAudio = isM4A || format.toLowerCase() === 'mp3' || formatId.includes('audio') || formatId.includes('mp3');
            const ext = isM4A ? 'm4a' : isAudio ? 'mp3' : 'mp4';
            const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

            const cleanTitle = (title || 'video')
              .replace(/[^a-zA-Z0-9\s_-]/g, '')
              .trim()
              .replace(/\s+/g, '_')
              .slice(0, 40) || 'Video';
            const cleanQuality = (quality || 'HD').replace(/[^a-zA-Z0-9]/g, '_');
            const downloadFilename = `VidLoader_${cleanTitle}_${cleanQuality}.${ext}`;
            const targetOutputFile = path.join(downloadsDir, `${jobId}.${ext}`);

            const job = {
              id: jobId,
              url: targetUrl,
              format: ext,
              quality,
              title,
              filename: downloadFilename,
              targetOutputFile,
              actualPath: null,
              fileSize: 0,
              status: 'queued',
              progress: 0,
              stage: 'Connecting to media source...',
              speed: null,
              eta: null,
              downloadedBytes: 0,
              totalBytes: null,
              error: null,
              createdAt: Date.now(),
            };

            activeJobs.set(jobId, job);

            // Respond immediately with jobId
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              jobId,
              message: 'Processing started',
            }));

            // Launch background download task outside response lifecycle
            setTimeout(() => {
              try {
                startBackgroundDownload(job);
              } catch (bgErr) {
                console.error(`[VidLoader Job ${jobId}] Start error:`, bgErr);
              }
            }, 10);
            return;
          } catch (err) {
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: err.message }));
            }
          }
        }

        // 3. GET /api/process/:jobId
        if (url.startsWith('/api/process/') && req.method === 'GET') {
          const jobId = url.replace('/api/process/', '').split('?')[0];
          const job = activeJobs.get(jobId);

          if (res.headersSent) return;

          if (!job) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ status: 'failed', message: 'Job not found' }));
          }

          if (res.headersSent) return;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            status: job.status,
            progress: job.progress,
            stage: job.stage || (job.status === 'completed' ? 'Download ready!' : 'Processing stream...'),
            speed: job.speed || null,
            eta: job.eta || null,
            downloadedBytes: job.downloadedBytes || null,
            totalBytes: job.totalBytes || null,
            jobId: job.id,
            downloadUrl: job.status === 'completed' ? `/api/download/${job.id}` : null,
            fileInfo: {
              filename: job.filename,
              format: job.format,
              quality: job.quality,
              sizeBytes: job.fileSize,
            },
            error: job.error,
            diagLogs: job.diagLogs || null,
          }));
        }

        // 4. GET /api/download/:jobId (Direct to User Device, Zero Server Storage)
        if (url.startsWith('/api/download/') && req.method === 'GET') {
          const jobId = url.replace('/api/download/', '').split('?')[0];
          const job = activeJobs.get(jobId);

          if (!job || !job.actualPath || !fs.existsSync(job.actualPath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            return res.end('File already transferred to device.');
          }

          const filePath = job.actualPath;
          const stat = fs.statSync(filePath);
          const mimeType = job.format === 'mp3' ? 'audio/mpeg' : job.format === 'm4a' ? 'audio/mp4' : 'video/mp4';
          const safeFilename = (job.filename || 'video.mp4')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_');

          res.statusCode = 200;
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(job.filename || safeFilename)}`);

          const readStream = fs.createReadStream(filePath);
          readStream.pipe(res);

          // Zero Server Storage: erase media from server disk immediately after delivery to user's device!
          let hasCleaned = false;
          const cleanImmediately = () => {
            if (hasCleaned) return;
            hasCleaned = true;
            setTimeout(() => {
              try {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`[VidLoader Zero-Storage] File permanently deleted from server: ${filePath}`);
                }
                activeJobs.delete(jobId);
              } catch {}
            }, 600);
          };

          res.on('finish', cleanImmediately);
          res.on('close', cleanImmediately);
          return;
        }

        // 5. GET /api/thumbnail
        if (url.startsWith('/api/thumbnail') && req.method === 'GET') {
          try {
            const parsed = new URL(req.url, 'http://localhost');
            const imgUrl = parsed.searchParams.get('url');
            const customTitle = parsed.searchParams.get('title') || 'Thumbnail';

            if (!imgUrl || !isValidPublicMediaUrl(imgUrl)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, message: 'A valid public HTTP/HTTPS image URL is required' }));
            }

            let imageBuffer;
            let contentType = 'image/jpeg';
            try {
              const response = await fetch(imgUrl);
              if (response.ok) {
                contentType = response.headers.get('content-type') || 'image/jpeg';
                const arrayBuffer = await response.arrayBuffer();
                imageBuffer = Buffer.from(arrayBuffer);
              }
            } catch (fetchErr) {
              console.warn('[VidLoader Thumbnail] Remote fetch failed, using fallback cover:', fetchErr.message);
            }

            if (!imageBuffer) {
              const fallbackCover = path.resolve(process.cwd(), 'public', 'demo-thumb.jpg');
              if (fs.existsSync(fallbackCover)) {
                imageBuffer = fs.readFileSync(fallbackCover);
                contentType = 'image/jpeg';
              } else {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, message: 'Failed to fetch thumbnail image' }));
              }
            }

            const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
            const cleanTitle = customTitle.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_') || 'Thumbnail';
            const filename = `VidLoader_Thumbnail_${cleanTitle}.${ext}`;

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
            return res.end(imageBuffer);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // 6. POST /api/contact
        if (url === '/api/contact' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const { name, email, category, subject, message } = body;
            const cleanName = (name || '').trim().slice(0, 100);
            const cleanEmail = (email || '').trim().slice(0, 150);
            const cleanCategory = (category || 'Support').trim().slice(0, 50);
            const cleanSubject = (subject || 'General Inquiry').trim().slice(0, 200);
            const cleanMessage = (message || '').trim().slice(0, 5000);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!cleanName || !cleanEmail || !cleanMessage || !emailRegex.test(cleanEmail)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: false,
                message: 'Please provide a valid name, email address, and message.',
              }));
            }

            const inquiry = {
              id: `msg_${Date.now()}`,
              name: cleanName,
              email: cleanEmail,
              category: cleanCategory,
              subject: cleanSubject,
              message: cleanMessage,
              receivedAt: new Date().toISOString()
            };
            const contactLogPath = path.join(downloadsDir, 'support_messages.json');
            let messages = [];
            if (fs.existsSync(contactLogPath)) {
              try { messages = JSON.parse(fs.readFileSync(contactLogPath, 'utf8')); } catch {}
            }
            messages.push(inquiry);
            fs.writeFileSync(contactLogPath, JSON.stringify(messages, null, 2));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, message: 'Message recorded successfully', id: inquiry.id }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // 7. GET /api/download-pc-launcher
        if (url === '/api/download-pc-launcher' && req.method === 'GET') {
          const launcherPath = path.resolve(process.cwd(), 'VidLoader-PC-Launcher.bat');
          if (fs.existsSync(launcherPath)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/x-bat');
            res.setHeader('Content-Disposition', 'attachment; filename="VidLoader-PC-Launcher.bat"');
            return fs.createReadStream(launcherPath).pipe(res);
          }
          res.statusCode = 404;
          return res.end('Launcher file not found');
        }

        // 7b. GET /api/download-installer?platform=windows|mac|linux|android|ios
        if (url.startsWith('/api/download-installer') && req.method === 'GET') {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const platform = (parsedUrl.searchParams.get('platform') || 'windows').toLowerCase();
          const installerMap = {
            windows: { file: 'VidLoader-Setup.exe', type: 'application/vnd.microsoft.portable-executable' },
            mac: { file: 'VidLoader-macOS.dmg', type: 'application/x-apple-diskimage' },
            macos: { file: 'VidLoader-macOS.dmg', type: 'application/x-apple-diskimage' },
            linux: { file: 'VidLoader-Linux.AppImage', type: 'application/x-executable' },
            android: { file: 'VidLoader-v2.4.apk', type: 'application/vnd.android.package-archive' },
            ios: { file: 'VidLoader-iOS.mobileconfig', type: 'application/x-apple-aspen-config' },
          };
          const target = installerMap[platform] || installerMap.windows;
          const targetPath = path.resolve(process.cwd(), 'public', 'downloads', target.file);

          if (fs.existsSync(targetPath)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', target.type);
            res.setHeader('Content-Disposition', `attachment; filename="${target.file}"`);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return fs.createReadStream(targetPath).pipe(res);
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: false, error: 'Installer file not found' }));
        }

        // 8. GET /api/system-status
        if (url.startsWith('/api/system-status') && req.method === 'GET') {
          const detected = detectYtDlpCommand();

          // Check python candidate paths
          const pythonCandidates = [
            'python3',
            'python',
            '/usr/bin/python3',
            '/usr/local/bin/python3',
            '/opt/alt/python312/bin/python3',
            '/opt/alt/python311/bin/python3',
            '/opt/alt/python310/bin/python3',
            '/opt/alt/python39/bin/python3',
            '/opt/alt/python38/bin/python3',
            '/usr/bin/python',
          ];
          let workingPython = null;
          for (const py of pythonCandidates) {
            try {
              const pRes = spawnSync(py, ['--version'], { timeout: 2000, windowsHide: true });
              if (pRes.status === 0) {
                workingPython = { cmd: py, version: pRes.stdout?.toString()?.trim() || pRes.stderr?.toString()?.trim() };
                break;
              }
            } catch {}
          }

          // Check linux binary diagnostics
          const linuxCandidates = [
            path.resolve(process.cwd(), 'yt-dlp_linux'),
            path.resolve(__dirname, '../../yt-dlp_linux'),
            path.resolve(__dirname, 'yt-dlp_linux'),
            path.resolve(process.cwd(), 'yt-dlp'),
          ];
          const linuxBinDetails = linuxCandidates.map(bin => {
            const exists = fs.existsSync(bin);
            let error = null;
            let stdout = null;
            if (exists) {
              try { fs.chmodSync(bin, 0o755); } catch (e) { error = 'chmod: ' + e.message; }
              try {
                const res = spawnSync(bin, ['--version'], { timeout: 3000 });
                if (res.status === 0) {
                  stdout = res.stdout?.toString()?.trim();
                } else {
                  error = `code ${res.status}: ` + (res.stderr?.toString() || res.error?.message || 'failed');
                }
              } catch (e) {
                error = e.message;
              }
            }
            return { bin, exists, stdout, error };
          });

          let ffmpegCheck = false;
          try {
            const fRes = spawnSync('ffmpeg', ['-version'], { timeout: 2000, windowsHide: true });
            ffmpegCheck = fRes.status === 0;
          } catch {}

          const activeCookiePath = getCookieFilePath();
          let diag = null;
          const parsed = new URL(req.url, 'http://localhost');
          if (parsed.searchParams.get('diag') === '1') {
            const testUrl = parsed.searchParams.get('url') || 'https://www.youtube.com/watch?v=2smi1gjBBIw';
            const nodeExec = process.execPath || 'node';
            const hasC = Boolean(activeCookiePath);
            const dRes = spawnSync(detected.cmd, [
              ...detected.prefixArgs,
              '--js-runtimes', `node:${nodeExec}`,
              '--remote-components', 'ejs:github',
              '--no-warnings',
              '--no-playlist',
              ...(hasC ? ['--cookies', activeCookiePath] : []),
              '--extractor-args', hasC ? 'youtube:player_client=web,web_embedded' : 'youtube:player_client=android,web',
              '-v',
              '-F', testUrl
            ], {
              timeout: 15000,
              cwd: process.cwd(),
              env: {
                ...process.env,
                PATH: `${path.dirname(nodeExec)}:${process.env.PATH || ''}`,
                PYTHONPATH: process.cwd(),
                NODE_OPTIONS: '',
              }
            });
            diag = {
              status: dRes.status,
              stdout: dRes.stdout?.toString(),
              stderr: dRes.stderr?.toString(),
              nodeExec,
              hasCookies: hasC,
              cookiePath: activeCookiePath,
            };
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            ok: true,
            server: 'VidLoader Production Engine',
            port: process.env.PORT || 5173,
            version: '2.4.2',
            os: process.platform,
            cookies: {
              detected: Boolean(activeCookiePath),
              path: activeCookiePath,
            },
            ytdlp: detected,
            python: workingPython,
            ffmpeg: ffmpegCheck,
            linuxBinDetails,
            diag,
          }));
        }

        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: false, error: 'API endpoint not found', path: url }));
      });
    },
  };
}

/**
 * Executes yt-dlp to download and convert the requested video/audio directly from the EXACT URL.
 * Automatically retries with universal streams and remuxes container when needed.
 * Never serves fake sample files.
 */
function startBackgroundDownload(job) {
  const isAudio = job.format === 'mp3' || job.format === 'm4a';
  const targetExt = isAudio ? (job.format === 'm4a' ? 'm4a' : 'mp3') : 'mp4';
  const templatePath = path.join(downloadsDir, `${job.id}.%(ext)s`);

  // Parse target height from quality label
  let height = null;
  const matchH = (job.quality || '').match(/(\d{3,4})p?/i);
  if (matchH) {
    height = parseInt(matchH[1], 10);
  } else if ((job.quality || '').includes('2160') || (job.quality || '').includes('4K')) {
    height = 2160;
  } else if ((job.quality || '').includes('1440') || (job.quality || '').includes('2K')) {
    height = 1440;
  } else if ((job.quality || '').includes('1080') || (job.quality || '').includes('FHD')) {
    height = 1080;
  } else if ((job.quality || '').includes('720') || (job.quality || '').includes('HD')) {
    height = 720;
  } else if ((job.quality || '').includes('480')) {
    height = 480;
  } else if ((job.quality || '').includes('360')) {
    height = 360;
  }

  // Check for optional cookies.txt in workspace, server root, or Render secret files
  const activeCookiePath = getCookieFilePath();
  const cookieArgs = activeCookiePath ? ['--cookies', activeCookiePath] : [];
  if (activeCookiePath) {
    console.log('[VidLoader Download] Using cookies file for YouTube auth:', activeCookiePath);
  }

  const nodeExec = process.execPath || 'node';
  const extractorArgs = cookieArgs.length > 0
    ? ['--extractor-args', 'youtube:player_client=web,web_embedded']
    : ['--extractor-args', 'youtube:player_client=android,ios,visionos,web'];

  const baseArgs = [
    '--js-runtimes', `node:${nodeExec}`,
    '--remote-components', 'ejs:github',
    '--no-playlist',
    '--no-check-certificates',
    '--no-warnings',
    '--newline',
    '--concurrent-fragments', '5',
    ...cookieArgs,
    ...extractorArgs,
  ];

  const hasFfmpeg = checkFfmpeg();

  let initialArgs = [];
  if (isAudio) {
    if (hasFfmpeg) {
      let audioQualityArg = '0';
      const bitrateMatch = (job.quality || '').match(/(\d+)\s*(?:kbps|k)?/i);
      if (bitrateMatch) {
        audioQualityArg = `${bitrateMatch[1]}K`;
      }

      initialArgs = [
        ...baseArgs,
        '-x',
        '--audio-format', targetExt,
        '--audio-quality', audioQualityArg,
        '-o', templatePath,
        job.url,
      ];
    } else {
      initialArgs = [
        ...baseArgs,
        '-f', 'ba[ext=m4a]/ba[ext=mp3]/ba',
        '-o', templatePath,
        job.url,
      ];
    }
  } else {
    let formatSpec = hasFfmpeg
      ? (height
          ? `best[height<=?${height}][ext=mp4]/best[height<=?${height}]/bestvideo[height<=?${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=?${height}]+bestaudio/best`
          : 'best[ext=mp4]/bestvideo+bestaudio/best')
      : (height
          ? `b[height<=?${height}][ext=mp4]/b[height<=?${height}]/b[ext=mp4]/b/best[height<=?${height}]/best`
          : 'b[ext=mp4]/b/best[ext=mp4]/best');

    const mergeArgs = hasFfmpeg ? ['--merge-output-format', 'mp4'] : [];

    initialArgs = [
      ...baseArgs,
      '-f', formatSpec,
      ...mergeArgs,
      '-o', templatePath,
      job.url,
    ];
  }

  job.status = 'downloading';
  job.progress = 0;
  job.stage = 'Connecting to media stream...';
  job.speed = null;
  job.eta = null;
  job.downloadedBytes = 0;
  job.totalBytes = null;

  console.log(`[VidLoader Job ${job.id}] Starting download: ${job.url} (${job.format}, ${job.quality})`);

  function executeDownload(args, isRetry = false) {
    console.log(`[VidLoader Job ${job.id}] Executing with args:`, JSON.stringify(args));
    let proc;
    try {
      proc = spawnYtDlp(args);
    } catch (spawnErr) {
      console.error(`[VidLoader Job ${job.id}] Spawn error:`, spawnErr);
      job.status = 'failed';
      job.error = 'Download engine process could not be launched on the system.';
      return;
    }

    let downloadStreamsCount = 0;
    let stderrData = '';
    let hasReceivedStreamData = false;
    let lastActivity = Date.now();
    const startTime = Date.now();

    // Fail-fast handshake watchdog: detect bot challenge or connection stall early (12-18 seconds)
    const handshakeWatchdog = setTimeout(() => {
      if (!hasReceivedStreamData && job.status === 'downloading') {
        const isBot = stderrData.toLowerCase().includes('sign in to confirm') || stderrData.toLowerCase().includes('bot');
        if (isBot) {
          clearInterval(watchdog);
          try { proc.kill(); } catch {}
          job.status = 'failed';
          job.error = 'YouTube security verification triggered on cloud datacenter IP. This specific video requires authentication on cloud servers. Use the 1-Click Desktop App (runs on your home IP with zero blocks), or try another quality.';
          return;
        }
        if (stderrData.toLowerCase().includes('http error 429')) {
          clearInterval(watchdog);
          try { proc.kill(); } catch {}
          job.status = 'failed';
          job.error = 'Remote platform rate limit triggered (HTTP 429). Please try again in a few moments or use the PC App.';
          return;
        }
        // If 18s passed with 0 stream bytes, abort cleanly
        if ((Date.now() - startTime) >= 18000) {
          clearInterval(watchdog);
          try { proc.kill(); } catch {}
          job.status = 'failed';
          job.error = 'Connection timed out while negotiating media stream with the remote server. Please retry or choose another quality format.';
        }
      }
    }, 12000);

    // Watchdog: 60s without any incoming data chunk (stalled network), or 15 minute absolute hard timeout
    const watchdog = setInterval(() => {
      const now = Date.now();
      const isStalled = (now - lastActivity) > 60000;
      const isHardTimeout = (now - startTime) > 15 * 60 * 1000;

      if (isStalled || isHardTimeout) {
        clearInterval(watchdog);
        clearTimeout(handshakeWatchdog);
        try { proc.kill(); } catch {}
        if (job.status !== 'completed') {
          job.status = 'failed';
          job.error = isStalled
            ? 'Download stalled: no stream data received for over 60 seconds. Please try again or select another format.'
            : 'Download exceeded maximum time limit (15 minutes).';
        }
      }
    }, 5000);

    // Disk-based real progress tracker: inspect physical media bytes directly on disk
    const diskTracker = setInterval(() => {
      if (job.status !== 'downloading') return;
      try {
        const files = fs.readdirSync(downloadsDir).filter(f => f.startsWith(job.id));
        if (files.length > 0) {
          let currentBytes = 0;
          for (const f of files) {
            try {
              const stat = fs.statSync(path.join(downloadsDir, f));
              currentBytes += stat.size;
            } catch {}
          }
          if (currentBytes > 1000) {
            hasReceivedStreamData = true;
            clearTimeout(handshakeWatchdog);
            job.downloadedBytes = currentBytes;
            if (job.totalBytes && job.totalBytes > 0) {
              const pct = Math.min(96, Math.max(5, Math.round((currentBytes / job.totalBytes) * 94)));
              job.progress = Math.max(job.progress || 0, pct);
            }
          }
        }
      } catch {}
    }, 1000);

    proc.stdout.on('data', (data) => {
      lastActivity = Date.now();
      const text = data.toString();

      // Detect stream transitions
      if (text.includes('Destination:') || text.includes('[download] Destination:')) {
        hasReceivedStreamData = true;
        clearTimeout(handshakeWatchdog);
        downloadStreamsCount++;
        if (isAudio) {
          job.stage = 'Downloading audio track...';
        } else if (downloadStreamsCount === 1) {
          job.stage = `Downloading video stream (${job.quality || 'HD'})...`;
        } else {
          job.stage = 'Downloading audio stream...';
        }
      }

      // Extract speed (most recent)
      const allSpeeds = [...text.matchAll(/at\s+([\d.]+\s*[KMG]?i?B\/s)/gi)];
      if (allSpeeds.length > 0) {
        job.speed = allSpeeds[allSpeeds.length - 1][1];
      }

      // Extract ETA (most recent)
      const allEtas = [...text.matchAll(/ETA\s+([\d:]+)/gi)];
      if (allEtas.length > 0) {
        job.eta = allEtas[allEtas.length - 1][1];
      }

      // Extract downloaded and total bytes from stdout e.g. [download]  12.5% of 100.50MiB
      const allBytes = [...text.matchAll(/\[download\]\s+([\d.]+\s*[KMG]?i?B)\s+of\s+(~?[\d.]+\s*[KMG]?i?B)/gi)];
      if (allBytes.length > 0) {
        const lastByte = allBytes[allBytes.length - 1];
        const parseToBytes = (str) => {
          const m = str.replace('~', '').trim().match(/([\d.]+)\s*([KMG]?i?B)/i);
          if (!m) return null;
          const val = parseFloat(m[1]);
          const unit = m[2].toUpperCase();
          if (unit.startsWith('G')) return Math.round(val * 1024 * 1024 * 1024);
          if (unit.startsWith('M')) return Math.round(val * 1024 * 1024);
          if (unit.startsWith('K')) return Math.round(val * 1024);
          return Math.round(val);
        };
        const currBytes = parseToBytes(lastByte[1]);
        const totBytes = parseToBytes(lastByte[2]);
        if (currBytes) job.downloadedBytes = currBytes;
        if (totBytes) job.totalBytes = totBytes;
      }

      // Extract percentage (most recent)
      const allPcts = [...text.matchAll(/\[download\]\s+(\d+(?:\.\d+)?)%/g)];
      if (allPcts.length > 0) {
        hasReceivedStreamData = true;
        clearTimeout(handshakeWatchdog);
        const lastPct = allPcts[allPcts.length - 1];
        const rawPct = parseFloat(lastPct[1]);
        let calculatedPct = 5;

        if (isAudio) {
          // Audio only: maps 5% -> 94%
          calculatedPct = Math.round(5 + (rawPct * 0.89));
        } else if (hasFfmpeg) {
          if (downloadStreamsCount > 1) {
            // Stream 2 (audio): maps 75% -> 94%
            calculatedPct = Math.min(94, Math.round(75 + (rawPct * 0.19)));
          } else {
            // Stream 1 (video): maps 5% -> 75%
            calculatedPct = Math.min(75, Math.max(5, Math.round(5 + (rawPct * 0.70))));
          }
        } else {
          // Progressive single stream (video + audio in one file): maps 5% -> 96%
          calculatedPct = Math.min(96, Math.max(5, Math.round(5 + (rawPct * 0.91))));
        }

        job.progress = Math.max(job.progress || 0, calculatedPct);
        job.status = 'downloading';
      } else if (text.includes('[Merger]')) {
        hasReceivedStreamData = true;
        clearTimeout(handshakeWatchdog);
        job.status = 'processing';
        job.stage = 'Merging video and audio streams...';
        job.progress = Math.max(job.progress || 0, 96);
        job.speed = null;
        job.eta = null;
      } else if (text.includes('[ExtractAudio]')) {
        hasReceivedStreamData = true;
        clearTimeout(handshakeWatchdog);
        job.status = 'processing';
        job.stage = 'Extracting and encoding audio...';
        job.progress = Math.max(job.progress || 0, 96);
        job.speed = null;
        job.eta = null;
      }
    });

    proc.stderr.on('data', (data) => {
      lastActivity = Date.now();
      const text = data.toString();
      stderrData += text;
      if (!job.diagLogs) job.diagLogs = '';
      job.diagLogs = (job.diagLogs + '\nERR: ' + text.trim()).slice(-1500);
    });

    proc.on('close', async (code) => {
      clearInterval(diskTracker);
      clearTimeout(handshakeWatchdog);
      clearInterval(watchdog);

      if (code === 0) {
        try {
          const files = fs.readdirSync(downloadsDir).filter(f => f.startsWith(job.id));
          const validFiles = files.filter(f => !f.endsWith('.part') && !f.endsWith('.ytdl') && !f.endsWith('.temp') && !f.endsWith('.aria2'));

          if (validFiles.length > 0) {
            const exactMatch = validFiles.find(f => f.endsWith(`.${targetExt}`)) || validFiles[0];
            let currentPath = path.join(downloadsDir, exactMatch);

            // If requested video is not .mp4, remux cleanly using ffmpeg (if available)
            if (hasFfmpeg && !isAudio && !exactMatch.endsWith('.mp4')) {
              const destMp4 = path.join(downloadsDir, `${job.id}.mp4`);
              try {
                job.status = 'processing';
                job.stage = 'Packaging MP4 container...';
                job.progress = 98;
                await runCommandAsync('ffmpeg', [
                  '-y',
                  '-i', currentPath,
                  '-c', 'copy',
                  destMp4
                ]);
                if (fs.existsSync(destMp4) && fs.statSync(destMp4).size > 1000) {
                  try { fs.unlinkSync(currentPath); } catch {}
                  currentPath = destMp4;
                }
              } catch (remuxErr) {
                console.warn(`[VidLoader Job ${job.id}] Remux copy warning, trying ultrafast transcode:`, remuxErr.message);
                try {
                  await runCommandAsync('ffmpeg', [
                    '-y',
                    '-i', currentPath,
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast',
                    '-c:a', 'aac',
                    destMp4
                  ]);
                  if (fs.existsSync(destMp4) && fs.statSync(destMp4).size > 1000) {
                    try { fs.unlinkSync(currentPath); } catch {}
                    currentPath = destMp4;
                  }
                } catch (transcodeErr) {
                  console.error(`[VidLoader Job ${job.id}] Transcode failed:`, transcodeErr.message);
                }
              }
            }

            job.actualPath = currentPath;
            job.fileSize = fs.statSync(currentPath).size;
            job.status = 'completed';
            job.stage = 'Download ready!';
            job.progress = 100;
            job.speed = null;
            job.eta = null;
            console.log(`[VidLoader Job ${job.id}] Successfully completed: ${job.fileSize} bytes at ${currentPath}`);
            return;
          }
        } catch (postErr) {
          console.error(`[VidLoader Job ${job.id}] Post-download error:`, postErr);
        }
      }

      // Detect YouTube bot challenges immediately so we don't stall the user in a hopeless 60-second retry loop
      const isBotChallenge = stderrData.toLowerCase().includes('sign in to confirm') || stderrData.toLowerCase().includes('bot');
      if (isBotChallenge) {
        console.warn(`[VidLoader Job ${job.id}] YouTube datacenter bot challenge encountered.`);
        job.status = 'failed';
        job.error = 'YouTube security verification triggered on cloud datacenter IP. This specific video requires authentication on cloud servers. Use the 1-Click Desktop App (runs on your home IP with zero blocks), or try another quality.';
        return;
      }

      // If initial format-specific download fails for reasons OTHER than bot challenge, retry once with universal best stream
      if (!isRetry) {
        console.warn(`[VidLoader Job ${job.id}] Initial download attempt exited with code ${code}:`, stderrData, `retrying with universal stream...`);
        job.stage = 'Optimizing stream selection...';
        const retryArgs = isAudio
          ? (hasFfmpeg
              ? [
                  ...baseArgs,
                  '-x',
                  '--audio-format', targetExt,
                  '-o', templatePath,
                  job.url,
                ]
              : [
                  ...baseArgs,
                  '-f', 'ba[ext=m4a]/ba',
                  '-o', templatePath,
                  job.url,
                ])
          : (hasFfmpeg
              ? [
                  ...baseArgs,
                  '-f', 'best[ext=mp4]/bestvideo+bestaudio/best',
                  '--merge-output-format', 'mp4',
                  '-o', templatePath,
                  job.url,
                ]
              : [
                  ...baseArgs,
                  '-f', 'b/best',
                  '-o', templatePath,
                  job.url,
                ]);
        return executeDownload(retryArgs, true);
      }

      console.warn(`[VidLoader Job ${job.id}] Download failed with code ${code}:`, stderrData);
      job.status = 'failed';
      job.error = cleanYtDlpError(stderrData) || 'Failed to download video. The content may be private, age-restricted, or removed by the platform.';
    });

    proc.on('error', (err) => {
      clearInterval(diskTracker);
      clearTimeout(handshakeWatchdog);
      clearInterval(watchdog);
      console.error(`[VidLoader Job ${job.id}] Process error:`, err);
      job.status = 'failed';
      job.error = err.message || 'Error occurred during media download.';
    });
  }

  executeDownload(initialArgs);
}
