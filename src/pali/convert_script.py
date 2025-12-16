from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Iterable, List

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
CONVERTER_JS = BASE_DIR / "js" / "pali_converter.js"
INPUT_CSV = BASE_DIR / "data" / "processed" / "pali_dictionary.csv"
OUTPUT_CSV = BASE_DIR / "data" / "processed" / "pali_dictionary_with_thai.csv"


def convert_to_thai(texts: Iterable[str]) -> List[str]:
    js_snippet = f"""
import {{ convert, Script }} from 'file://{CONVERTER_JS.as_posix()}';
const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {{
  const inputs = JSON.parse(Buffer.concat(chunks).toString());
  const outputs = inputs.map(s => convert(String(s ?? ''), Script.THAI, Script.LATN));
  process.stdout.write(JSON.stringify(outputs));
}});
"""
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", js_snippet],
        input=json.dumps(list(texts)).encode(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    return json.loads(completed.stdout.decode() or "[]")


def main() -> None:
    df = pd.read_csv(INPUT_CSV)

    df["headword_thai"] = convert_to_thai(df["headword"].fillna("").astype(str).tolist())
    df["antonym_thai"] = convert_to_thai(df["antonym"].fillna("").astype(str).tolist())

    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Wrote translated CSV to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
