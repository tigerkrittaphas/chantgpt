#!/bin/bash

set -euo pipefail

# Define some environment variables
export IMAGE_NAME="chantgpt-deployment"
export BASE_DIR=$(pwd)
export REPO_ROOT=$(cd "$BASE_DIR/../.." && pwd)
export SECRETS_DIR=$(pwd)/../../secrets/
export SSH_DIR=$(pwd)/../../secrets/
export GCP_PROJECT="chantgpt-480017" # Change to your GCP Project
export GCP_REGION="us-central1"
export GCP_ZONE="us-central1-a"
export GOOGLE_APPLICATION_CREDENTIALS=/secrets/deployment.json
export PULUMI_BUCKET="gs://$GCP_PROJECT-pulumi-state-bucket"

# Create local Pulumi plugins directory if it doesn't exist
mkdir -p "$BASE_DIR/pulumi-plugins" "$BASE_DIR/docker_config.json"

# Check if container is already running
if docker ps --format "table {{.Names}}" | grep -q "^${IMAGE_NAME}$"; then
    echo "Container '${IMAGE_NAME}' is already running. Shelling into existing container..."
    docker exec -it "$IMAGE_NAME" /bin/bash ./docker-entrypoint.sh
else
    echo "Container '${IMAGE_NAME}' is not running. Building and starting new container..."

    # Build the image based on the Dockerfile
    #docker build -t $IMAGE_NAME -f Dockerfile .
    docker build -t "$IMAGE_NAME" --platform=linux/amd64 -f Dockerfile .

    # Run the container
    docker run --rm --name $IMAGE_NAME -ti \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$BASE_DIR":/app \
    -v "$REPO_ROOT":/repo \
    -v "$SECRETS_DIR":/secrets \
    -v "$SSH_DIR/.ssh":/home/app/.ssh:ro \
    -v "$BASE_DIR/docker_config.json":/root/.docker \
    -v "$(pwd)/pulumi-plugins":/root/.pulumi/plugins \
    -v "$BASE_DIR/../llm-api":/llm-api \
    -v "$BASE_DIR/../frontend":/frontend \
    -v "$BASE_DIR/../models":/models \
    -e REPO_ROOT=/repo \
    -e GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS \
    -e USE_GKE_GCLOUD_AUTH_PLUGIN=True \
    -e GCP_PROJECT=$GCP_PROJECT \
    -e GCP_REGION=$GCP_REGION \
    -e GCP_ZONE=$GCP_ZONE \
    -e PULUMI_BUCKET=$PULUMI_BUCKET \
    $IMAGE_NAME
fi
