#!/bin/sh
set -e

# 1. Staging writable cookies: Render mounts secrets at /etc/secrets as read-only.
# Staging to /tmp prevents Python yt-dlp cookiejar from throwing OSError: [Errno 30] Read-only file system.
if [ -f /etc/secrets/cookies.txt ]; then
  mkdir -p /tmp/secrets
  cp /etc/secrets/cookies.txt /tmp/secrets/cookies.txt
  chmod 600 /tmp/secrets/cookies.txt
  export COOKIES_PATH="/tmp/secrets/cookies.txt"
  echo "[VidLoader Entrypoint] Successfully staged cookies to /tmp/secrets/cookies.txt"
elif [ -f /app/cookies.txt ]; then
  mkdir -p /tmp/secrets
  cp /app/cookies.txt /tmp/secrets/cookies.txt
  chmod 600 /tmp/secrets/cookies.txt
  export COOKIES_PATH="/tmp/secrets/cookies.txt"
fi

# 2. Start local Proof-of-Origin (POT) server for YouTube botguard solving on port 4416
if [ -d "/app/pot-provider" ]; then
  echo "[VidLoader Entrypoint] Launching local bgutil-pot daemon on 127.0.0.1:4416..."
  if [ -f "/app/pot-provider/build/main.js" ]; then
    node /app/pot-provider/build/main.js &
  elif [ -f "/app/pot-provider/src/main.ts" ] && command -v deno >/dev/null 2>&1; then
    deno run --allow-net --allow-read --allow-env /app/pot-provider/src/main.ts &
  fi
fi

# 3. Hand over execution to the main application container process
exec "$@"
