import pandas as pd
import os
from tqdm import tqdm

"""
Prepare Ready-to-Use Pali Dictionary Data
source: https://github.com/digitalpalidictionary/dpd-db/releases/tag/v0.3.20251205

1. read the data and store it in csv format
2. Translate the Pali Roman transcript to Thai version
"""

RAW_DICT = "data/raw/dpd.txt"

import re
import csv
from pathlib import Path

HEADER_RE = re.compile(
    r"""^
    (?P<headword>[^\s,]+)                 # first token (headword)
    (?:\s+(?P<sense>\d+(?:\.\d+)?))?      # optional sense like 1.1
    ,\s*
    (?P<pos>[^.]+)\.\s*                   # part of speech up to first period
    (?P<definition>.*?)(?:\s+(?P<status>[✔✘◑]))?\s*$  # definition + optional status
    """,
    re.VERBOSE
)

FIELD_RE = re.compile(r"^(?P<key>[A-Za-z][A-Za-z ]*):\s*(?P<val>.*)\s*$")

def parse_dictionary_txt(dict_path):

    with open(dict_path, "r", encoding="utf-8") as f:
        text = f.read()

    rows = []
    current = None

    def flush():
        nonlocal current
        if current is not None:
            rows.append(current)
            current = None

    for raw_line in text.splitlines():
        line = raw_line.rstrip()

        # blank line -> end of entry
        if not line.strip():
            flush()
            continue

        # header line?
        m = HEADER_RE.match(line.strip())
        if m:
            flush()
            current = {
                "headword": m.group("headword") or "",
                "sense": m.group("sense") or "",
                "pos": (m.group("pos") or "").strip(),
                "definition": (m.group("definition") or "").strip(),
                "status": m.group("status") or "",
            }
            continue

        # field line (IPA, Grammar, Sanskrit, ID, etc.)
        fm = FIELD_RE.match(line.strip())
        if fm and current is not None:
            key = fm.group("key").strip().lower().replace(" ", "_")
            val = fm.group("val").strip()
            # store; if repeats, concatenate
            if key in current and current[key]:
                current[key] = f"{current[key]} | {val}"
            else:
                current[key] = val
            continue

        # fallback: if it's neither header nor field, append to definition/notes
        if current is None:
            # ignore stray lines before first header
            continue
        current["definition"] = (current.get("definition", "") + " " + line.strip()).strip()

    flush()
    return rows

def write_csv(rows, out_csv_path):
    # collect all keys across rows for consistent columns
    all_keys = set()
    for r in rows:
        all_keys.update(r.keys())

    # put common columns first
    preferred = ["headword", "sense", "pos", "definition", "status", "ipa", "grammar", "id", "sanskrit"]
    cols = preferred + sorted(k for k in all_keys if k not in preferred)

    with open(out_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        for r in rows:
            writer.writerow({c: r.get(c, "") for c in cols})

def main():
    dict_path = RAW_DICT
    out_csv_path = "data/processed/pali_dictionary.csv"

    print("Parsing dictionary...")
    rows = parse_dictionary_txt(dict_path)

    print(f"Writing to CSV: {out_csv_path}")
    write_csv(rows, out_csv_path)
    print("Done.")

if __name__ == "__main__":
    main()
