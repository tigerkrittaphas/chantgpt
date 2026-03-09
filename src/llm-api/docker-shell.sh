#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
IMAGE_NAME="${IMAGE_NAME:-llm-api}"
SECRETS_DIR="${SECRETS_DIR:-$REPO_ROOT/secrets}"
DATA_DIR="${DATA_DIR:-$REPO_ROOT/src/llm-api/data/processed}"

mkdir -p "$DATA_DIR"

docker build -t "$IMAGE_NAME" -f "$SCRIPT_DIR/Dockerfile" "$REPO_ROOT"
docker run --rm -it \
  -p 8080:8080 \
  -v "$SECRETS_DIR":/app/secrets \
  -v "$DATA_DIR":/app/data/processed \
  -e GOOGLE_APPLICATION_CREDENTIALS="/app/secrets/ai-user.json" \
  -e GOOGLE_CLOUD_PROJECT="chantgpt-480017" \
  -w /app \
  "$IMAGE_NAME"
