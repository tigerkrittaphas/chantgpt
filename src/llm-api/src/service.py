import logging
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from .prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


def _find_repo_root(start: Path) -> Path | None:
    for parent in [start, *start.parents]:
        if (parent / "pyproject.toml").exists():
            return parent
    return None


def _load_environment() -> None:
    repo_root = _find_repo_root(Path(__file__).resolve().parent)
    if repo_root:
        load_dotenv(repo_root / ".env")
        credentials_path = repo_root / "secrets" / "ai-user.json"
        if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS") and credentials_path.exists():
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path)
    else:
        load_dotenv()


_load_environment()

DEFAULT_MODEL = "gemini-3-flash-preview"


class GenerateRequest(BaseModel):
    name: str = Field(..., description="User name for personalization")
    wishes: list[str] = Field(..., description="List of user wishes")
    retrieve: bool = Field(True, description="Enable semantic/similarity retrieval")
    model: str = Field(DEFAULT_MODEL, description="Gemini model name")


class GenerateResponse(BaseModel):
    model: str
    output: str


app = FastAPI(title="Chant LLM Generator")



@lru_cache
def _client(project: str, location: str) -> genai.Client:
    return genai.Client(vertexai=True, project=project, location=location)


def _get_client() -> genai.Client:
    project = os.getenv("GOOGLE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project:
        raise RuntimeError("GOOGLE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is not set.")
    location = os.getenv("GOOGLE_LOCATION", "global")
    return _client(project, location)


def generate_chant(name: str, wishes: list[str], retrieve: bool, model: str) -> str:
    user_prompt = build_user_prompt(name, wishes, retrieve=retrieve)
    client = _get_client()
    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    )
    return response.text


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest) -> GenerateResponse:
    name = request.name.strip()
    wishes = [wish.strip() for wish in request.wishes if wish.strip()]
    if not name:
        raise HTTPException(status_code=400, detail="name is required")
    if not wishes:
        raise HTTPException(status_code=400, detail="wishes must contain at least one non-empty item")
    try:
        output = generate_chant(name, wishes, request.retrieve, request.model)
    except RuntimeError as exc:
        logger.error("LLM configuration error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        logger.exception("LLM generation failed")
        raise HTTPException(status_code=500, detail="LLM generation failed") from exc
    return GenerateResponse(model=request.model, output=output)
