#!/bin/sh
# entrypoint.sh

# Inject UPLOAD_PASS into the frontend HTML at container start
if [ -n "$UPLOAD_PASS" ]; then
  sed -i "s/__UPLOAD_PASS__/${UPLOAD_PASS}/g" /app/public/index.html
fi

# Fix ownership of the data directory using PUID/PGID env vars (default 1000)
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting with UID=${PUID} GID=${PGID}"

chown -R "${PUID}:${PGID}" /data

# Drop privileges and run node as the target user
exec su-exec "${PUID}:${PGID}" node server.js