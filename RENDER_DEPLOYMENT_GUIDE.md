# VidLoader — Render.com Docker Deployment Guide

This guide provides a step-by-step workflow to deploy **VidLoader** as a Docker Web Service on **Render.com** and connect it to your **Hostinger frontend** (or run it as a standalone full-stack web service).

---

## 1. Honest Facts & Architecture Overview

Before deploying, here is what you need to know about Render:

| Plan | Pricing | Cold Starts (Sleep) | RAM / CPU | Best For |
|---|---|---|---|---|
| **Free** | $0 / mo | Spins down after 15 min of inactivity (~50s delay on first download) | 512 MB RAM / 0.1 vCPU | Testing & development |
| **Starter** | $7 / mo | **Always On (0s delay)** | 512 MB – 1 GB RAM / 0.5 vCPU | Production & continuous use |

### How It Works With Your Hostinger Plan:
* **Frontend on Hostinger (`vidloader.online`):** Hostinger serves the static HTML/CSS/JS with fast LiteSpeed CDN caching.
* **Backend on Render (`https://vidloader-backend.onrender.com`):** Render runs the Docker container with Node 20, Python 3, `yt-dlp`, and `ffmpeg` to download and convert videos.
* **The Connection:** In Hostinger's File Manager, you simply edit `config.js` to point to your Render backend URL. **No rebuild required!**

---

## 2. Pre-Configured Files in This Repository

The repository is pre-configured for Render:

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage Docker build: compiles React frontend + installs Node 20, Python 3, `ffmpeg`, and `yt-dlp`. |
| `render.yaml` | Render Blueprint configuration (specifies Docker runtime, Port 10000, and `/health` probe). |
| `.dockerignore` | Excludes heavy local zips and node_modules for fast deployment. |
| `server.js` | Express/HTTP server listening on `0.0.0.0:${PORT}` with CORS headers enabled. |
| `public/config.js` | One-line configuration file to link Hostinger to Render. |

---

## 3. Step-by-Step Deployment on Render.com

### Step 1: Push Project to GitHub / GitLab
Render pulls code directly from your Git repository.
1. Initialize git and commit your files if not already done:
   ```bash
   git add .
   git commit -m "Configure VidLoader for Render Docker deployment"
   git push origin main
   ```

---

### Step 2: Create Web Service on Render

You can deploy using either of two methods:

#### Method A: Using Render Blueprints (Fastest - 1 Click)
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** &rarr; **Blueprint**.
3. Select your GitHub repository (`vidloader`).
4. Render will automatically detect `render.yaml`.
5. Click **Apply**. Render will automatically build and start the Docker container!

#### Method B: Manual Web Service Setup
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** &rarr; **Web Service**.
3. Connect your Git repository.
4. Fill in the service details:
   * **Name:** `vidloader-backend` (or your preferred name)
   * **Region:** Choose closest to your target audience (e.g., `Oregon`, `Frankfurt`)
   * **Language / Runtime:** **Docker**
   * **Branch:** `main`
   * **Instance Type:** **Free** (or **Starter** for 24/7 uptime without sleep)
5. Under **Advanced**:
   * **Health Check Path:** `/health`
   * **Environment Variables:**
     * `NODE_ENV` = `production`
     * `PORT` = `10000`
6. Click **Create Web Service**.

---

### Step 3: Monitor Build & Verify Deployment

1. Render will pull the image, install `python3`, `ffmpeg`, and `yt-dlp`, build the React frontend, and boot `server.js`.
2. Once the log displays:
   ```text
   VidLoader production server running at http://0.0.0.0:10000/
   ==> Your service is live 🎉
   ```
3. Copy your live Render URL (e.g. `https://vidloader-backend.onrender.com`).
4. Test the health endpoint in your browser:
   ```
   https://vidloader-backend.onrender.com/health
   ```
   You should see:
   ```json
   {"status":"ok","service":"VidLoader Backend","timestamp":"..."}
   ```
5. Test the engine status:
   ```
   https://vidloader-backend.onrender.com/api/system-status
   ```
   Confirm `ytdlp` and `ffmpeg` are both detected and marked `true`.

---

## 4. Connecting Your Hostinger Frontend to Render

If you are hosting your frontend on Hostinger:

1. Log in to **Hostinger hPanel**.
2. Go to **Websites** &rarr; **Manage** &rarr; **Files** &rarr; **File Manager**.
3. Open your `public_html` directory (where your frontend files live).
4. Find and edit the file named `config.js` (inside `public_html/config.js`).
5. Change the URL to your live Render backend URL:
   ```javascript
   // Hostinger public_html/config.js
   window.__VIDLOADER_API_URL__ = "https://vidloader-backend.onrender.com/api";
   ```
6. Save the file.
7. Open `https://yourdomain.com/` in your browser.
8. Paste any video link (YouTube, TikTok, Instagram, Twitter, etc.) and hit **Download**!
   * The frontend on Hostinger sends requests to `https://vidloader-backend.onrender.com/api/resolve`.
   * Render processes the video using `yt-dlp` and `ffmpeg`.
   * The file downloads directly to the user's device.

---

## 5. Bypassing Social Media Bot Blocks (Important!)

Social media platforms (especially YouTube and Instagram) frequently flag datacenter IPs from Render, AWS, and GCP with security checks (*"Sign in to confirm you're not a bot"*).

VidLoader includes two built-in solutions for this:

### Solution 1: Upload `cookies.txt` to Render (Server-Side)
1. Use a browser extension (like *Get cookies.txt LOCALLY*) to export cookies from YouTube while logged in.
2. In Render Dashboard &rarr; Your Service &rarr; **Environment** &rarr; **Secret Files**:
   * **Filename:** `cookies.txt`
   * **Contents:** Paste the contents of your exported `cookies.txt`.
3. Render automatically saves this in the root directory. VidLoader will detect it automatically and pass `--cookies cookies.txt` to `yt-dlp`.

### Solution 2: Built-in 1-Click Desktop App (Zero Cloud Blocks)
If a specific video triggers YouTube's cloud verification, VidLoader automatically displays:
> *"Download via Free PC App (Zero Blocks)"*

This uses `VidLoader-PC-Launcher.bat`, executing `yt-dlp` directly on the user's home residential IP where social media blocks do not exist.

---

## 6. Keeping the Free Render Plan Awake (Optional)

On the **Free** plan, Render spins down after 15 minutes of inactivity. To keep it awake 24/7 without paying $7/month:

1. Create a free account at [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/).
2. Create an HTTP monitor hitting your health check endpoint every 10 minutes:
   ```
   https://vidloader-backend.onrender.com/health
   ```
3. This sends an HTTP ping every 10 minutes, preventing Render from going to sleep.
