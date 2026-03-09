FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential curl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

COPY src/bff-api/pyproject.toml ./pyproject.toml
RUN uv pip install --system --no-cache .

COPY src/bff-api/src ./src

EXPOSE 8080
CMD ["uvicorn", "src.service:app", "--host", "0.0.0.0", "--port", "8080"]
