#!/bin/sh

PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting with UID=${PUID} GID=${PGID}"

chown -R "${PUID}:${PGID}" /data

exec su-exec "${PUID}:${PGID}" node server.js