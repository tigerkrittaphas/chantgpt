import os
from datetime import UTC, datetime
from pathlib import Path

import pulumi
import pulumi_docker_build as docker_build
from pulumi import CustomTimeouts, ResourceOptions
from pulumi_gcp import artifactregistry

gcp_config = pulumi.Config("gcp")
project = gcp_config.require("project")
region = gcp_config.require("region")

config = pulumi.Config()
app_name = config.get("app_name") or "chantgpt"
repository_name = config.get("repository_name") or f"{app_name}-repo"
image_tag = config.get("image_tag") or datetime.now(UTC).strftime("%Y%m%d%H%M%S")

repo = artifactregistry.Repository(
    repository_name,
    format="DOCKER",
    location=region,
    repository_id=repository_name,
)

registry_url = f"{region}-docker.pkg.dev/{project}/{repository_name}"


def resolve_repo_root() -> Path:
    env_repo_root = os.environ.get("REPO_ROOT")
    if env_repo_root:
        candidate = Path(env_repo_root).resolve()
        if (candidate / "src" / "llm-api" / "Dockerfile").exists() and (
            candidate / "src" / "bff-api" / "Dockerfile"
        ).exists():
            return candidate
        raise ValueError(
            f"REPO_ROOT is set to {candidate}, but src/llm-api/Dockerfile or src/bff-api/Dockerfile was not found."
        )

    start = Path(__file__).resolve().parent
    for candidate in [start, *start.parents]:
        if (candidate / "src" / "llm-api" / "Dockerfile").exists() and (
            candidate / "src" / "bff-api" / "Dockerfile"
        ).exists():
            return candidate

    default_repo_mount = Path("/repo")
    if (default_repo_mount / "src" / "llm-api" / "Dockerfile").exists() and (
        default_repo_mount / "src" / "bff-api" / "Dockerfile"
    ).exists():
        return default_repo_mount.resolve()

    raise ValueError(
        "Unable to resolve repository root. Set REPO_ROOT to the repo path that contains "
        "src/llm-api/Dockerfile and src/bff-api/Dockerfile."
    )


repo_root = resolve_repo_root()


def build_image(image_suffix: str, context_path: Path, dockerfile_path: Path) -> docker_build.Image:
    image_name = f"{app_name}-{image_suffix}"
    return docker_build.Image(
        f"build-{image_name}",
        tags=[pulumi.Output.concat(registry_url, "/", image_name, ":", image_tag)],
        context=docker_build.BuildContextArgs(location=str(context_path)),
        dockerfile={"location": str(dockerfile_path)},
        platforms=[docker_build.Platform.LINUX_AMD64],
        push=True,
        opts=ResourceOptions(
            custom_timeouts=CustomTimeouts(create="30m"),
            retain_on_delete=True,
            depends_on=[repo],
        ),
    )


llm_api_image = build_image(
    "llm-api",
    repo_root,
    repo_root / "src" / "llm-api" / "Dockerfile",
)
bff_api_image = build_image(
    "bff-api",
    repo_root,
    repo_root / "src" / "bff-api" / "Dockerfile",
)
pulumi.export("llm-api-image", llm_api_image.ref)
pulumi.export("llm-api-tags", llm_api_image.tags)
pulumi.export("bff-api-image", bff_api_image.ref)
pulumi.export("bff-api-tags", bff_api_image.tags)

pulumi.export("image-tag", image_tag)
pulumi.export("registry-url", registry_url)
