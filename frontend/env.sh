#!/bin/sh
set -eu

# Vygeneruje runtime config pro frontend (čte env z App Service)
cat <<EOF > /usr/share/nginx/html/config.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:8000}"
};
EOF

exec "$@"
