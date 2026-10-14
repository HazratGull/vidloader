# =======================================================
# VidLoader - Render Docker Production Container
# Multi-stage build: compiles React frontend + installs
# Node 20, Python 3, yt-dlp, and ffmpeg
# =======================================================

# Stage 1: Build React Frontend
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production API & Media Processing Engine
FROM node:20-slim

# Install system dependencies: Python 3, pip, ffmpeg, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp media extraction engine
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Install production dependencies only (fast, lightweight install)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Ephemeral scratch directory for active streaming jobs
RUN mkdir -p temp_downloads && chmod 777 temp_downloads

# Environment variables
ENV NODE_ENV=production \
    PORT=10000 \
    PYTHONUNBUFFERED=1

EXPOSE 10000

# Health check probe for Render
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Start production API server
CMD ["node", "server.js"]
