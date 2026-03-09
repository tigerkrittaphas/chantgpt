import os

import pulumi
from pulumi import Output
from pulumi_gcp import cloudrun, projects, storage

gcp_config = pulumi.Config("gcp")
project = gcp_config.require("project")
region = gcp_config.require("region")

config = pulumi.Config()
app_name = config.get("app_name") or "chantgpt"
images_stack = config.get("images_stack")
images_organization = (
    config.get("images_organization") or os.getenv("PULUMI_ORGANIZATION") or "organization"
)
frontend_bucket_name = config.get("frontend_bucket_name")
cors_allow_origins = config.get("cors_allow_origins")
manage_runtime_iam = config.get_bool("manage_runtime_iam")
if manage_runtime_iam is None:
    manage_runtime_iam = False

min_scale = config.get_int("min_scale") or 0
max_scale = config.get_int("max_scale") or 2
cpu_throttling = config.get_bool("cpu_throttling")
if cpu_throttling is None:
    cpu_throttling = True

llm_api_image = config.get("llm_api_image")
bff_api_image = config.get("bff_api_image")
llm_service_account_email = config.require_secret("llm_service_account_email")
bff_service_account_email = config.get_secret("bff_service_account_email") or llm_service_account_email
gemini_model = config.get("gemini_model") or "gemini-2.0-flash"
google_location = config.get("google_location") or "global"
vertex_location = config.get("vertex_location") or region

stack_ref = None
if not llm_api_image or not bff_api_image:
    stack_ref_name = images_stack or f"{images_organization}/deploy-images/{pulumi.get_stack()}"
    stack_ref = pulumi.StackReference(stack_ref_name)

if not llm_api_image:
    llm_api_image = stack_ref.get_output("llm-api-image")
if not bff_api_image:
    bff_api_image = stack_ref.get_output("bff-api-image")

bucket_name = (
    frontend_bucket_name
    or f"{app_name}-{project}-{pulumi.get_stack()}".lower().replace("_", "-")
)
frontend_bucket = storage.Bucket(
    "frontend-bucket",
    name=bucket_name,
    location=region,
    uniform_bucket_level_access=True,
    website=storage.BucketWebsiteArgs(
        main_page_suffix="index.html",
        not_found_page="index.html",
    ),
)

storage.BucketIAMMember(
    "frontend-bucket-public",
    bucket=frontend_bucket.name,
    role="roles/storage.objectViewer",
    member="allUsers",
)

frontend_origin = Output.format(
    "https://storage.googleapis.com/{0}", frontend_bucket.name
)
cors_origins = cors_allow_origins or Output.format(
    "https://storage.googleapis.com,https://{0}.storage.googleapis.com",
    frontend_bucket.name,
)

if manage_runtime_iam:
    projects.IAMMember(
        "llm-api-vertex",
        project=project,
        role="roles/aiplatform.user",
        member=llm_service_account_email.apply(lambda email: f"serviceAccount:{email}"),
    )
    projects.IAMMember(
        "llm-api-translate",
        project=project,
        role="roles/cloudtranslate.user",
        member=llm_service_account_email.apply(lambda email: f"serviceAccount:{email}"),
    )

llm_service = cloudrun.Service(
    "llm-api",
    location=region,
    template=cloudrun.ServiceTemplateArgs(
        metadata=cloudrun.ServiceTemplateMetadataArgs(
            annotations={
                "autoscaling.knative.dev/minScale": str(min_scale),
                "autoscaling.knative.dev/maxScale": str(max_scale),
                "run.googleapis.com/cpu-throttling": "true" if cpu_throttling else "false",
            }
        ),
        spec=cloudrun.ServiceTemplateSpecArgs(
            service_account_name=llm_service_account_email,
            container_concurrency=config.get_int("llm_concurrency") or 20,
            timeout_seconds=config.get_int("llm_timeout_seconds") or 300,
            containers=[
                cloudrun.ServiceTemplateSpecContainerArgs(
                    image=llm_api_image,
                    resources=cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                        limits={
                            "cpu": config.get("llm_cpu") or "1",
                            "memory": config.get("llm_memory") or "1Gi",
                        }
                    ),
                    envs=[
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="GOOGLE_CLOUD_PROJECT",
                            value=project,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="GOOGLE_PROJECT_ID",
                            value=project,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="GOOGLE_LOCATION",
                            value=google_location,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="VERTEX_PROJECT",
                            value=project,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="VERTEX_LOCATION",
                            value=vertex_location,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="CORS_ALLOW_ORIGINS",
                            value=cors_origins,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="GEMINI_MODEL",
                            value=gemini_model,
                        ),
                    ],
                )
            ],
        ),
    ),
    traffics=[cloudrun.ServiceTrafficArgs(percent=100, latest_revision=True)],
)

cloudrun.IamMember(
    "llm-api-bff-invoker",
    service=llm_service.name,
    location=region,
    role="roles/run.invoker",
    member=bff_service_account_email.apply(lambda email: f"serviceAccount:{email}"),
)

llm_url = llm_service.statuses.apply(lambda statuses: statuses[0].url)
bff_service = cloudrun.Service(
    "bff-api",
    location=region,
    template=cloudrun.ServiceTemplateArgs(
        metadata=cloudrun.ServiceTemplateMetadataArgs(
            annotations={
                "autoscaling.knative.dev/minScale": str(config.get_int("bff_min_scale") or 0),
                "autoscaling.knative.dev/maxScale": str(config.get_int("bff_max_scale") or 5),
                "run.googleapis.com/cpu-throttling": "true",
            }
        ),
        spec=cloudrun.ServiceTemplateSpecArgs(
            service_account_name=bff_service_account_email,
            container_concurrency=config.get_int("bff_concurrency") or 80,
            timeout_seconds=config.get_int("bff_timeout_seconds") or 120,
            containers=[
                cloudrun.ServiceTemplateSpecContainerArgs(
                    image=bff_api_image,
                    resources=cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                        limits={
                            "cpu": config.get("bff_cpu") or "1",
                            "memory": config.get("bff_memory") or "512Mi",
                        }
                    ),
                    envs=[
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="LLM_API_URL",
                            value=llm_url,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="CORS_ALLOW_ORIGINS",
                            value=cors_origins,
                        ),
                        cloudrun.ServiceTemplateSpecContainerEnvArgs(
                            name="GEMINI_MODEL",
                            value=gemini_model,
                        ),
                    ],
                )
            ],
        ),
    ),
    traffics=[cloudrun.ServiceTrafficArgs(percent=100, latest_revision=True)],
)

cloudrun.IamMember(
    "bff-api-invoker",
    service=bff_service.name,
    location=region,
    role="roles/run.invoker",
    member="allUsers",
)

bff_url = bff_service.statuses.apply(lambda statuses: statuses[0].url)

pulumi.export("frontend-bucket", frontend_bucket.name)
pulumi.export("frontend-origin", frontend_origin)
pulumi.export("llm-api-url", llm_url)
pulumi.export("bff-api-url", bff_url)
pulumi.export("public-api-url", bff_url)
