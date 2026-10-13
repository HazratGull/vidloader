# VidLoader — Hostinger Production Deployment Guide

This guide explains how to deploy **VidLoader** on your **Hostinger Web App / Node.js Server** or **Hostinger VPS**.

The zip file `vidloader-hostinger-production.zip` contains **production-only files** formatted specifically for Hostinger's environment, with zero development overhead.

---

## What Is Included In The Production Package

| File / Folder | Purpose on Hostinger |
|---|---|
| `app.js` | Hostinger hPanel startup entry alias (delegates to `server.js`). |
| `server.js` | Production HTTP server & API handler (serves static files, handles `/api/*`). |
| `package.json` | Lean production manifest with 0 heavy devDependencies (fast `npm install`). |
| `.htaccess` | Pre-configured for Hostinger LiteSpeed/Apache (caching, compression, HTTPS, security headers). |
| `.env.example` | Template for environment variables (`PORT`, `NODE_ENV`, `YTDLP_PATH`). |
| `ecosystem.config.cjs` | Ready-to-use PM2 configuration for Hostinger VPS deployments. |
| `dist/` | Complete compiled React frontend (HTML, hashed CSS/JS, icons, PWA manifest, service worker). |
| `public/` | Public asset fallbacks and metadata files. |
| `src/server/backend.js` | Direct media extraction engine and streaming logic. |
| `temp_downloads/` | Ephemeral scratch directory for active streaming jobs (auto-purged). |

---

## Deployment Option A: Hostinger Web / Cloud Hosting (hPanel Node.js)

Hostinger Cloud Hosting and Business Web Hosting plans include a built-in **Node.js Application Manager** in hPanel.

### Step 1: Upload and Extract Files
1. Log in to your **Hostinger Control Panel (hPanel)**.
2. Navigate to **Websites** and click **Manage** on your domain.
3. Open **Files** &rarr; **File Manager**.
4. Navigate into your site directory (usually `public_html` or your subdomain folder).
5. Upload `vidloader-hostinger-production.zip`.
6. Right-click the uploaded zip file and click **Extract**. Select the current folder so the contents extract directly into `public_html`.
7. (Optional) Delete the `.zip` file to save disk space.

### Step 2: Configure Node.js in hPanel
1. In hPanel, use the search bar or go to **Advanced / Web Applications** &rarr; **Node.js**.
2. Click **Create Application** (or configure existing):
   - **Node.js version**: Choose `20.x` or `18.x` (Recommended: `20.x`).
   - **Application mode**: `Production`.
   - **Application root**: `public_html` (or your subdomain folder).
   - **Application startup file**: `server.js` (or `app.js` — both work identically).
3. Save the settings.

### Step 3: Run npm install & Start Application
1. In the Node.js dashboard, click **Run npm install** (or **Install Dependencies**).
   *(Because the production package has zero heavy devDependencies, this will finish in seconds).*
2. Click **Start Application** (or **Restart**).
3. Visit your website: `https://yourdomain.com/`!

### Step 4: Verify Health
Open in your browser:
`https://yourdomain.com/api/system-status`

You should receive a `200 OK` response confirming the engine is active:
```json
{"ok": true, "server": "VidLoader Production Engine", "ytdlp": true, "ffmpeg": true, ...}
```

---

## Deployment Option B: Hostinger VPS (Ubuntu / Debian)

If you have a Hostinger KVM VPS, this provides the highest performance and unlimited bandwidth for video processing.

### Step 1: Connect to VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install System Prerequisites
```bash
# Update packages
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs python3 python3-pip ffmpeg unzip

# Install yt-dlp & PM2
pip3 install -U yt-dlp
npm install -g pm2
```

### Step 3: Upload and Extract the Production Package
```bash
mkdir -p /var/www/vidloader
cd /var/www/vidloader

# Upload the zip using SCP from your local computer:
# scp vidloader-hostinger-production.zip root@YOUR_SERVER_IP:/var/www/vidloader/

# Unzip in /var/www/vidloader
unzip vidloader-hostinger-production.zip
```

### Step 4: Start the Server with PM2
```bash
# Start cluster mode using the provided ecosystem config
pm2 start ecosystem.config.cjs

# Make PM2 restart automatically on VPS reboot
pm2 save
pm2 startup
```

### Step 5: (Optional) Nginx Reverse Proxy with SSL
To point your custom domain (e.g., `vidloader.online`) to the Node.js port:

```nginx
# /etc/nginx/sites-available/vidloader
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

Enable site and install free SSL certificate:
```bash
ln -s /etc/nginx/sites-available/vidloader /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Environment Variables Configuration

If you need custom configurations, create a `.env` file in the root directory (copied from `.env.example`):

```bash
cp .env.example .env
```

Available variables:
- `PORT`: Listening port (default: 5173 or assigned by Hostinger Passenger).
- `NODE_ENV`: Set to `production`.
- `YTDLP_PATH`: (Optional) Specify the exact path to `yt-dlp` binary if it is located in a custom virtual environment (e.g. `/home/uXXXX/.local/bin/yt-dlp`).
- `FFMPEG_PATH`: (Optional) Specify custom path to `ffmpeg` binary if not in default system PATH.

---

## Key Troubleshooting Tips for Hostinger

1. **"503 Service Unavailable" or "Application Failed to Start"**:
   - Verify that your **Application Startup File** in hPanel is set to either `server.js` or `app.js`.
   - Ensure you ran **Run npm install** in hPanel.
   - Check the error log in hPanel under **Node.js** &rarr; **Logs**.

2. **Video resolution fails or shows error**:
   - Ensure `yt-dlp` or `python3` is available on the server.
   - On Hostinger Cloud hosting, enable SSH access from hPanel and run `pip3 install --user yt-dlp` or `pip install --user yt-dlp`.
   - If installed in `~/.local/bin/yt-dlp`, add `YTDLP_PATH=/home/username/.local/bin/yt-dlp` in `.env`.

3. **Storage usage**:
   - VidLoader has a **Zero Permanent Storage Policy**. All media downloaded during conversion is stored in `temp_downloads/` and purged immediately upon streaming completion or after 2 minutes. Your Hostinger disk quota will remain clean.
