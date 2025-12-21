from pathlib import Path
from typing import Dict, List

import pandas as pd
from rapidfuzz import fuzz, process

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DICTIONARY_FILE_PATH = PROJECT_ROOT / "data" / "processed" / "pali_dictionary_with_thai.csv"

# Load once so lookups are fast.
_dictionary = pd.read_csv(DICTIONARY_FILE_PATH)

# Filter only relevant columns to save memory
_dictionary = _dictionary[
    ["headword", "headword_thai", "definition"]
].dropna(subset=["headword"])


def character_similarity(word: str, limit: int = 5, score_cutoff: int = 0) -> List[Dict[str, object]]:
    """
    Return the top-k Pali entries whose Thai spelling best matches the given Thai word.

    Args:
        word: Thai word to search for.
        limit: Number of results to return.
        score_cutoff: Minimum RapidFuzz score (0-100) to include a match.

    Returns:
        A list of dictionaries with Thai spelling, Roman spelling, definition and match score.
    """
    if not isinstance(word, str) or not word.strip():
        return []

    candidates = _dictionary
    choices = candidates["headword_thai"].tolist()

    matches = process.extract(
        query=word,
        choices=choices,
        scorer=fuzz.WRatio,
        limit=limit,
        score_cutoff=score_cutoff,
    )

    results: List[Dict[str, object]] = []
    for _, score, idx in matches:
        row = candidates.iloc[idx]
        results.append(
            {
                "pali_thai": row["headword_thai"],
                "pali_roman": row["headword"],
                "definition": row.get("definition"),
                "score": score,
            }
        )

    return results
    
