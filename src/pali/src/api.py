import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from .lookup import character_similarity
from .semantic import semantic_definition_search

app = FastAPI(title="Pali Dictionary Lookup")
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class SearchResult(BaseModel):
    pali_thai: str
    pali_roman: str
    definition: Optional[str] = None
    score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]


@app.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., description="Thai word to search for"),
    limit: int = Query(5, ge=1, le=50, description="Number of results to return"),
    score_cutoff: int = Query(0, ge=0, le=100, description="Minimum similarity score"),
) -> SearchResponse:
    """
    Fuzzy search Pali entries by Thai spelling.
    """
    query = q.strip()
    matches = character_similarity(query, limit=limit, score_cutoff=score_cutoff) if query else []
    return SearchResponse(query=query, results=matches)


@app.get("/search/semantic", response_model=SearchResponse)
def semantic_search(
    q: str = Query(..., description="Free-text meaning to search definitions by"),
    limit: int = Query(5, ge=1, le=50, description="Number of results to return"),
    project: Optional[str] = Query(None, description="Vertex AI project ID (falls back to env)"),
    location: Optional[str] = Query(None, description="Vertex AI region (falls back to env or us-central1)"),
) -> SearchResponse:
    """
    Semantic search against Pali definitions using Vertex AI embeddings + FAISS.
    """
    query = q.strip()
    if not query:
        return SearchResponse(query=query, results=[])
    logger.info("Semantic search requested query=%r limit=%d project=%s location=%s", query, limit, project, location)
    try:
        matches = semantic_definition_search(query=query, k=limit, project=project, location=location)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    logger.info("Semantic search completed query=%r returned=%d", query, len(matches))
    return SearchResponse(query=query, results=matches)
