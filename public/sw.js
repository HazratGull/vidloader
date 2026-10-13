// VidLoader Progressive Web App (PWA) Resilient Service Worker
const CACHE_NAME = 'vidloader-pwa-v3';

const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon.png',
  '/favicon-32.png',
  '/vidloader-logo.png',
  '/vidloader-icon-192.png',
  '/vidloader-icon-512.png',
  '/vidloader-icon-maskable-192.png',
  '/vidloader-icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Never intercept API requests or non-GET requests
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Navigation requests (HTML pages): Network-First, with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;

          // Return friendly offline recovery HTML
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>VidLoader - Connecting...</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; padding: 20px; }
                .card { max-width: 480px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { font-size: 24px; margin-bottom: 12px; color: #38bdf8; }
                p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 15px; }
                .btn:hover { background: #1d4ed8; }
                .tip { margin-top: 20px; font-size: 13px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Connecting to VidLoader PC Service</h1>
                <p>The VidLoader local application service is booting up or reconnecting. Click below to reconnect.</p>
                <button class="btn" onclick="window.location.reload()">Reconnect Now</button>
                <div class="tip">Tip: You can also double-click <strong>VidLoader</strong> on your Desktop to start the service.</div>
              </div>
              <script>
                setTimeout(() => window.location.reload(), 3000);
              </script>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
