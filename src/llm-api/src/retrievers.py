import logging
import os

import requests
from google.cloud import translate
from dotenv import load_dotenv
load_dotenv()

PALI_API_URL = "http://0.0.0.0:8081"
THAI_BLOCK_START = "\u0e00"
THAI_BLOCK_END = "\u0e7f"

_translate_client: translate.TranslationServiceClient | None = None

logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


def fetch_words_simiarlity(word: str, top_k: int = 5) -> list[str]:
    url = f"{PALI_API_URL}/search"
    params = {"q": word, "top_k": top_k}
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])


def _looks_thai(text: str) -> bool:
    return any(THAI_BLOCK_START <= ch <= THAI_BLOCK_END for ch in text)


def _translate_thai_to_english(text: str) -> str:
    """
    Translate Thai text to English using Google Cloud Translation (v3).
    Falls back to the original text on any failure.
    """
    if not text:
        return text

    project_id = os.getenv("GOOGLE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        logger.warning("GOOGLE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is not set; skipping translation.")
        return text

    global _translate_client
    try:
        if _translate_client is None:
            _translate_client = translate.TranslationServiceClient()

        parent = f"projects/{project_id}/locations/global"
        resp = _translate_client.translate_text(
            request={
                "parent": parent,
                "contents": [text],
                "mime_type": "text/plain",
                "source_language_code": "th",
                "target_language_code": "en",
            }
        )
        translated = "".join(t.translated_text for t in resp.translations)
        return translated or text
    except Exception as exc:
        logger.warning("Thai->English translation failed; using original text.", exc_info=exc)
        return text


def fetch_words_semantics(word: str, top_k: int = 5) -> list[str]:
    """
    Semantic search only work in English, so translate Thai to English first.
    """
    query = _translate_thai_to_english(word) if _looks_thai(word) else word
    url = f"{PALI_API_URL}/search/semantic"
    params = {"q": query, "top_k": top_k}
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])


if __name__ == "__main__":
    test_word = "ธรรม"
    similar_words = fetch_words_simiarlity(test_word, top_k=5)
    print(f"Similar words to '{test_word}': {similar_words}\n\n")

    semantic_words = fetch_words_semantics(test_word, top_k=5)
    print(f"Semantically related words to '{test_word}': {semantic_words}\n\n")

    test_word_en = "dhamma"
    similar_words_en = fetch_words_simiarlity(test_word_en, top_k=5)
    print(f"Similar words to '{test_word_en}': {similar_words_en}\n\n")

    semantic_words_en = fetch_words_semantics(test_word_en, top_k=5)
    print(f"Semantically related words to '{test_word_en}': {semantic_words_en}\n\n")
