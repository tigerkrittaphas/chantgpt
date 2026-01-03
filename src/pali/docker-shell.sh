#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
IMAGE_NAME="${IMAGE_NAME:-pali-api}"
SECRETS_DIR="${SECRETS_DIR:-$SCRIPT_DIR/../../secrets}"

if [ ! -f "$SECRETS_DIR/ai-user.json" ]; then
  echo "Missing secrets file: $SECRETS_DIR/ai-user.json" >&2
  exit 1
fi

docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
docker run --rm -it \
  -p 8081:8081 \
  -v "$SECRETS_DIR":/app/secrets \
  -e GOOGLE_APPLICATION_CREDENTIALS="/app/secrets/ai-user.json" \
  -e GOOGLE_CLOUD_PROJECT="chantgpt-480017" \
  -w /app \
  --name pali-api-dev  \
  "$IMAGE_NAME"
