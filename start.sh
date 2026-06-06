#!/usr/bin/env bash
set -e

PORT="${PORT:-8000}"

echo "Starting Study Tracker on 0.0.0.0:${PORT}"
exec python3 -m http.server "${PORT}" --bind 0.0.0.0
