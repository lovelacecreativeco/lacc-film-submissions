#!/bin/sh
# entrypoint.sh
# Injects UPLOAD_PASS into the bundled HTML at container start
# so the frontend can attach it to XHR requests automatically.

if [ -n "$UPLOAD_PASS" ]; then
  sed -i "s/__UPLOAD_PASS__/${UPLOAD_PASS}/g" /app/public/index.html
fi

exec node server.js
