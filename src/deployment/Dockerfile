# Use the official Python image as the base with Python 3.13
FROM python:3.13-slim-bullseye

# Set the environment variable for non-interactive installations
ENV DEBIAN_FRONTEND=noninteractive
ENV UV_PROJECT_ENVIRONMENT=/home/app/.venv
ENV VIRTUAL_ENV=/home/app/.venv
ENV PATH="/home/app/.venv/bin:/root/.pulumi/bin:/root/.local/bin:$PATH"

# Install system dependencies + Google Cloud SDK + Docker CLI
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      gnupg \
      lsb-release \
      openssh-client \
      jq \
      build-essential && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
      gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
      > /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | \
      gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      google-cloud-sdk \
      google-cloud-sdk-gke-gcloud-auth-plugin \
      docker-ce-cli \
      docker-buildx-plugin && \
    rm -rf /var/lib/apt/lists/*

# Kubernetes
ARG K8S_MINOR=1.34
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL "https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/deb/Release.key" \
    | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg \
    && chmod 0644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${K8S_MINOR}/deb/ /" \
    | tee /etc/apt/sources.list.d/kubernetes.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends kubectl \
    && rm -rf /var/lib/apt/lists/*

# Helm
RUN curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Pulumi
RUN curl -fsSL https://get.pulumi.com | sh
# Disable Pulumi passphrase prompts
ENV PULUMI_CONFIG_PASSPHRASE=""

# Install UV (Python package installer)
RUN pip install --no-cache-dir uv

# Create user
RUN getent group docker >/dev/null || groupadd -r docker && \
    useradd -ms /bin/bash app -d /home/app -u 1000 && \
    usermod -aG docker app && \
    mkdir -p /app && \
    chown app:app /app

# Set the working directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY --chown=app:app pyproject.toml uv.lock* ./

# Install Python dependencies
RUN uv sync

# Copy and configure entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use our entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/bin/bash"]

# Start a new shell to use the installed SDK
# ENTRYPOINT ["/bin/bash","docker-entrypoint.sh"]
