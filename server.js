import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vidloaderBackendPlugin } from './src/server/backend.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT, 10) || 5173;
const DIST_DIR = path.resolve(__dirname, 'dist');

const plugin = vidloaderBackendPlugin();
const mockServer = {
  middlewares: {
    use(fn) {
      this.handler = fn;
    },
  },
};
plugin.configureServer(mockServer);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.dmg': 'application/x-apple-diskimage',
  '.appimage': 'application/x-executable',
  '.apk': 'application/vnd.android.package-archive',
  '.mobileconfig': 'application/x-apple-aspen-config',
};

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.google.com https://*.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://www.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "connect-src 'self' https: https://*.googleapis.com",
  "frame-src 'self' https://*.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const server = http.createServer((req, res) => {
  // Apply standard HTTP security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Content-Security-Policy', CSP_HEADER);
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Allow Cross-Origin Requests (CORS) from any frontend (e.g. vidloader.online)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Health check endpoint for cloud monitoring (Render, etc.)
  if (req.url === '/health' || req.url === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', service: 'VidLoader Backend', timestamp: new Date().toISOString() }));
  }

  // Security guard: block access to sensitive credentials, cookies, or env files
  if (req.url.toLowerCase().includes('cookies') || req.url.toLowerCase().includes('.env')) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Access Denied');
  }

  // Let the backend API handler process /api/*
  mockServer.middlewares.handler(req, res, () => {
    // Explicit path traversal probe rejection
    if (req.url.includes('..') || decodeURIComponent(req.url).includes('..')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('Access Denied');
    }

    // Serve static files from dist or public
    let rawPath = req.url.split('?')[0];
    if (rawPath === '/') rawPath = '/index.html';

    const safeRelPath = path.normalize(rawPath).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(DIST_DIR, safeRelPath);

    // Ensure path cannot escape root
    if (!filePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      return res.end('Access Denied');
    }

    if (!fs.existsSync(filePath)) {
      const publicPath = path.join(__dirname, 'public', safeRelPath);
      if (publicPath.startsWith(path.resolve(__dirname, 'public')) && fs.existsSync(publicPath)) {
        filePath = publicPath;
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');

      // Efficient Cache-Control and Attachment headers
      if (safeRelPath.includes('downloads') || ext === '.exe' || ext === '.dmg' || ext === '.appimage' || ext === '.apk' || ext === '.mobileconfig') {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (safeRelPath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }

      return fs.createReadStream(filePath).pipe(res);
    }

    // Do NOT fall back to index.html for missing static files / extensions
    const fileExt = path.extname(safeRelPath).toLowerCase();
    if (fileExt && fileExt !== '.html') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('File Not Found');
    }

    // SPA fallback for HTML page routes
    const indexHtml = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return fs.createReadStream(indexHtml).pipe(res);
    }

    if (rawPath === '/' || rawPath === '/index.html') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        status: 'ok',
        service: 'VidLoader Backend API Engine',
        version: '2.4.1',
        message: 'Backend is active. Connect your frontend to this service.',
        endpoints: ['/health', '/api/system-status', '/api/resolve', '/api/stream', '/api/process']
      }));
    }

    res.statusCode = 404;
    res.end('Not Found');
  });
});

if (process.env.NODE_ENV === 'production' || process.env.PORT || process.argv.includes('--start')) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`VidLoader production server running at http://0.0.0.0:${PORT}/`);
  });
}

export default server;
