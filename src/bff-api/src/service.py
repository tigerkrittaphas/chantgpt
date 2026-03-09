import logging
import os
from functools import lru_cache
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import id_token
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
DEFAULT_TIMEOUT_SECONDS = float(os.getenv("UPSTREAM_TIMEOUT_SECONDS", "60"))


class GenerateRequest(BaseModel):
    name: str = Field(..., description="User name for personalization")
    wishes: list[str] = Field(..., description="List of user wishes")
    retrieve: bool = Field(True, description="Enable semantic/similarity retrieval")
    model: Optional[str] = Field(None, description="Gemini model name")


class GenerateResponse(BaseModel):
    model: str
    output: str


class SearchResult(BaseModel):
    pali_thai: str
    pali_roman: str
    definition: Optional[str] = None
    score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]


app = FastAPI(title="Chant BFF API")


def _cors_allow_origins() -> list[str]:
    raw = os.getenv("CORS_ALLOW_ORIGINS", "")
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache
def _upstream_base_url() -> str:
    raw = os.getenv("LLM_API_URL", "").strip().rstrip("/")
    if not raw:
        raise RuntimeError("LLM_API_URL is not set.")
    return raw


@lru_cache
def _auth_request() -> GoogleAuthRequest:
    return GoogleAuthRequest()


def _bearer_token() -> str:
    audience = _upstream_base_url()
    return id_token.fetch_id_token(_auth_request(), audience)


def _authorized_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_bearer_token()}"}


def _proxy(method: str, path: str, *, params: dict | None = None, body: dict | None = None) -> dict:
    url = f"{_upstream_base_url()}{path}"
    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
            response = client.request(
                method=method,
                url=url,
                params=params,
                json=body,
                headers=_authorized_headers(),
            )
    except Exception as exc:
        logger.exception("Upstream request failed method=%s path=%s", method, path)
        raise HTTPException(status_code=502, detail="Upstream request failed") from exc

    if response.status_code >= 400:
        detail = f"Upstream error ({response.status_code})"
        try:
            payload = response.json()
            if isinstance(payload, dict) and isinstance(payload.get("detail"), str):
                detail = payload["detail"]
        except Exception:
            if response.text:
                detail = response.text[:500]
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        return response.json()
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Upstream returned invalid JSON") from exc


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest) -> GenerateResponse:
    data = _proxy("POST", "/generate", body=request.model_dump(exclude_none=True))
    return GenerateResponse(**data)


@app.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., description="Thai word to search for"),
    limit: int = Query(5, ge=1, le=50, description="Number of results to return"),
    score_cutoff: int = Query(0, ge=0, le=100, description="Minimum similarity score"),
) -> SearchResponse:
    data = _proxy(
        "GET",
        "/search",
        params={"q": q, "limit": str(limit), "score_cutoff": str(score_cutoff)},
    )
    return SearchResponse(**data)


@app.get("/search/semantic", response_model=SearchResponse)
def semantic_search(
    q: str = Query(..., description="Free-text meaning to search definitions by"),
    limit: int = Query(5, ge=1, le=50, description="Number of results to return"),
) -> SearchResponse:
    data = _proxy("GET", "/search/semantic", params={"q": q, "limit": str(limit)})
    return SearchResponse(**data)
