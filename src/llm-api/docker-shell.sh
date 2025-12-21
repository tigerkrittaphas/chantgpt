#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
IMAGE_NAME="${IMAGE_NAME:-llm-api}"

docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
docker run --rm -it \
  -p 8080:8080 \
  -v ../../secrets:/app/secrets \
  -e GOOGLE_APPLICATION_CREDENTIALS="/app/secrets/ai-user.json" \
  -e GOOGLE_CLOUD_PROJECT="chantgpt-480017" \
  -w /app \
  "$IMAGE_NAME"
