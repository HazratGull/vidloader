# =======================================================
# VidLoader - Production Engine Container
# Multi-stage build: compiles React frontend + installs
# Node 20, Python 3, yt-dlp, curl-cffi, Deno, and ffmpeg
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

# Install system dependencies: Python 3, pip, ffmpeg, curl, unzip, git
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    unzip \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Deno JS runtime (required by yt-dlp for native YouTube cipher solving)
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Install latest yt-dlp media extraction engine, curl-cffi for TLS impersonation, and POT provider plugin
RUN pip3 install --no-cache-dir --break-system-packages \
    yt-dlp \
    curl-cffi \
    bgutil-ytdlp-pot-provider

WORKDIR /app

# Build local background Proof-of-Origin (POT) server for YouTube bot verification bypass
RUN git clone --depth 1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /app/pot-provider && \
    cd /app/pot-provider/server && \
    npm ci && \
    npx tsc && \
    mv /app/pot-provider/server/build /app/pot-provider/build 2>/dev/null || true

# Install production dependencies only (fast, lightweight install)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Copy compiled frontend from builder stage
COPY --from=builder /app/dist ./dist

# Ephemeral scratch directory for active streaming jobs
RUN mkdir -p temp_downloads && chmod 777 temp_downloads

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Environment variables
ENV NODE_ENV=production \
    PORT=10000 \
    PYTHONUNBUFFERED=1

EXPOSE 10000

# Health check probe for Render
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

# Start production API server
CMD ["node", "server.js"]
