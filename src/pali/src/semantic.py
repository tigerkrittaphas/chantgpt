"""
Semantic search over Pali definitions using Vertex AI embeddings and FAISS.
"""
from __future__ import annotations

import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import faiss
import numpy as np
import pandas as pd
from vertexai import init as vertex_init
from vertexai.preview.language_models import TextEmbeddingModel

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DICTIONARY_FILE_PATH = PROJECT_ROOT / "data" / "processed" / "pali_dictionary_with_thai.csv"
INDEX_PATH = PROJECT_ROOT / "data" / "processed" / "definition_faiss.index"
METADATA_PATH = PROJECT_ROOT / "data" / "processed" / "definition_faiss_meta.json"

# Ensure we emit INFO logs even if the root logger is at WARNING.
_root_logger = logging.getLogger()
if not _root_logger.handlers:
    logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

_model_cache: Tuple[Tuple[str, str, str], TextEmbeddingModel] | None = None
_index_cache: faiss.Index | None = None
_metadata_cache: List[Dict[str, str]] | None = None


def _resolve_vertex(project: str | None, location: str | None) -> Tuple[str, str]:
    project_id = project or os.getenv("VERTEX_PROJECT") or os.getenv("GOOGLE_CLOUD_PROJECT")
    region = location or os.getenv("VERTEX_LOCATION") or "us-central1"
    if not project_id:
        raise ValueError("Vertex AI project is required (set VERTEX_PROJECT or GOOGLE_CLOUD_PROJECT).")
    return project_id, region


def _load_model(project: str, location: str, model_name: str) -> TextEmbeddingModel:
    global _model_cache
    key = (project, location, model_name)
    if _model_cache and _model_cache[0] == key:
        return _model_cache[1]

    vertex_init(project=project, location=location)
    model = TextEmbeddingModel.from_pretrained(model_name)
    try:
        model.get_embeddings(["test"])
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Vertex AI model '{model_name}': {e}") from e
    _model_cache = (key, model)
    return model


def _normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


def _embed_texts(
    texts: Sequence[str],
    model: TextEmbeddingModel,
    batch_size: int = 32,
) -> np.ndarray:
    embeddings: List[List[float]] = []
    total = len(texts)
    logger.info("Embedding %d definition(s) with Vertex AI in batches of %d", total, batch_size)
    for start in range(0, len(texts), batch_size):
        batch = texts[start : start + batch_size]
        responses = model.get_embeddings(batch)
        for emb in responses:
            embeddings.append(emb.values)
        logger.info(
            "Embedded %d/%d definitions (%.1f%%)",
            min(start + batch_size, total),
            total,
            100 * min(start + batch_size, total) / total,
        )
    return np.array(embeddings, dtype="float32")


def build_definition_index(
    *,
    project: str | None = None,
    location: str | None = None,
    model_name: str = "gemini-embedding-001",
    batch_size: int = 32,
    index_path: Path = INDEX_PATH,
    metadata_path: Path = METADATA_PATH,
) -> Tuple[faiss.Index, List[Dict[str, str]]]:
    """
    Build and persist a FAISS index over definition embeddings.
    """
    project_id, region = _resolve_vertex(project, location)
    model = _load_model(project_id, region, model_name)

    logger.info("Using model %s in project %s at location %s", model_name, project_id, region)

    df = pd.read_csv(DICTIONARY_FILE_PATH)
    df = df[["headword", "headword_thai", "definition"]].dropna(subset=["definition"])
    definitions = df["definition"].astype(str).tolist()

    logger.info("Building FAISS index for %d definition(s)", len(definitions))
    vectors = _embed_texts(definitions, model=model, batch_size=batch_size)
    vectors = _normalize(vectors)

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, str(index_path))
    logger.info("Saved FAISS index to %s", index_path)

    metadata: List[Dict[str, str]] = []
    for row in df.itertuples():
        metadata.append(
            {
                "pali_roman": row.headword,
                "pali_thai": row.headword_thai,
                "definition": row.definition,
            }
        )

    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False))

    global _index_cache, _metadata_cache
    _index_cache = index
    _metadata_cache = metadata
    return index, metadata


def _ensure_index(
    *,
    project: str | None,
    location: str | None,
    model_name: str,
    index_path: Path,
    metadata_path: Path,
) -> Tuple[faiss.Index, List[Dict[str, str]]]:
    global _index_cache, _metadata_cache

    if _index_cache is not None and _metadata_cache is not None:
        return _index_cache, _metadata_cache

    if not index_path.exists() or not metadata_path.exists():
        logger.info("FAISS index or metadata missing; building new index.")
        return build_definition_index(
            project=project,
            location=location,
            model_name=model_name,
            index_path=index_path,
            metadata_path=metadata_path,
        )

    logger.info("Loading FAISS index from %s", index_path)
    _index_cache = faiss.read_index(str(index_path))
    logger.info("Loading FAISS metadata from %s", metadata_path)
    _metadata_cache = json.loads(metadata_path.read_text())
    return _index_cache, _metadata_cache


def semantic_definition_search(
    query: str,
    *,
    k: int = 5,
    project: str | None = None,
    location: str | None = None,
    model_name: str = "text-embedding-004",
    index_path: Path = INDEX_PATH,
    metadata_path: Path = METADATA_PATH,
) -> List[Dict[str, object]]:
    """
    Search for entries whose definitions are semantically closest to the query.
    """
    if not isinstance(query, str) or not query.strip():
        return []

    project_id, region = _resolve_vertex(project, location)
    model = _load_model(project_id, region, model_name)
    index, metadata = _ensure_index(
        project=project_id,
        location=region,
        model_name=model_name,
        index_path=index_path,
        metadata_path=metadata_path,
    )

    logger.info("Embedding semantic query for search")
    query_vec = _normalize(_embed_texts([query], model=model, batch_size=1))
    scores, idxs = index.search(query_vec, k)

    results: List[Dict[str, object]] = []
    for score, idx in zip(scores[0], idxs[0]):
        if idx == -1:
            continue
        entry = metadata[idx]
        results.append(
            {
                "pali_thai": entry.get("pali_thai"),
                "pali_roman": entry.get("pali_roman"),
                "definition": entry.get("definition"),
                "score": float(score),
            }
        )

    return results
