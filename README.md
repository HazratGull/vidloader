<<<<<<< HEAD
# VidLoader — High-Performance Universal Video & Audio Downloader

VidLoader (`vidloader.online`) is a modern, responsive web application for resolving, streaming, and converting videos and audio from public social media platforms (YouTube, TikTok, Instagram Reels, Facebook, Reddit, Twitter/X, and Dailymotion) into high-definition MP4 and 320kbps MP3 formats.

---

## Key Features

- **Multi-Platform Support**: YouTube, Shorts, TikTok (watermark-free), Instagram Reels, Facebook, Reddit, and more.
- **Flexible Formats**: 4K UHD, 1080p FHD, 720p HD MP4 video plus high-bitrate MP3 (320kbps, 192kbps) and M4A audio.
- **Direct-to-Device Streaming**: Zero server storage policy. Files are buffered ephemerally during active download transfers and purged immediately upon delivery.
- **Responsive & Mobile-First**: Optimized for 320px smartphones, foldables, tablets, laptops, and 4K displays.
- **Progressive Web App (PWA)**: Installable on Android, iOS, Windows, and macOS with offline-ready service worker caching.
- **Zero Third-Party Paid APIs**: Powered by an open-source extraction engine with zero paid dependencies.

---

## Architecture Overview

- **Frontend**: React 18, Vite 8, Lucide Icons, Vanilla CSS design system with custom HSL theme tokens.
- **Routing**: Lightweight zero-dependency HTML5 client-side router with deep linking and clean URL history.
- **Backend / Engine**: Node.js HTTP streaming engine interfacing with `yt-dlp` and `ffmpeg`.
- **Security & Privacy**:
  - Comprehensive Server-Side Request Forgery (SSRF) validation blocking private IPs and loopback addresses.
  - Hardened HTTP security headers (Content Security Policy, X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy).
  - Sanitized inputs and contact form submission logging.
  - Zero permanent server-side retention.

---

## Prerequisites

1. **Node.js**: v18.0.0 or higher
2. **Python**: v3.9+ with `yt-dlp` (`pip install -U yt-dlp`)
3. **FFmpeg**: Installed and accessible in system PATH (required for stream remuxing and MP3 conversion)

---

## Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd vidloader
npm install
```

### 2. Development Mode
```bash
npm run dev
```
The development server will start at `http://localhost:5173/` with hot module reloading (HMR) and backend API routing enabled.

### 3. Production Build
```bash
npm run build
```
Compiles and bundles frontend assets into `dist/` with optimized chunk hashing and gzip compression.

### 4. Running Production Server
```bash
node server.js --start
```
Runs the standalone production server serving static assets with immutable cache-control headers alongside the media streaming backend on port 5173 (or `PORT` environment variable).

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resolve` | Inspects target media URL and returns title, thumbnail, duration, and format options. |
| `POST` | `/api/process` | Queues video/audio download and remux job for the selected quality/format. |
| `GET`  | `/api/process/:jobId` | Polls progress and status for an ongoing processing job. |
| `GET`  | `/api/download/:jobId` | Streams completed media directly to the user's browser, then purges the temporary server buffer. |
| `GET`  | `/api/thumbnail` | Proxies and downloads high-resolution thumbnail images. |
| `POST` | `/api/contact` | Submits support inquiries and bug reports to `temp_downloads/support_messages.json`. |
| `GET`  | `/api/system-status` | Health-check endpoint verifying Node runtime, yt-dlp, and ffmpeg availability. |

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5173` | Production HTTP listening port. |
| `NODE_ENV` | `development` | Environment mode (`production` enables production optimizations). |

---

## License

This project is licensed under the MIT License.
=======
# vidloader
>>>>>>> 1e351ba16a4317a7731b0d76323d366e0ab86ea8
