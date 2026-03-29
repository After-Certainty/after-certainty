#!/usr/bin/env python3
"""
Compute readability metrics for *When Others Look to You* manuscript sources.

Writes docs/readability-scores.md (book root = parent of scripts/).

Metrics: Flesch–Kincaid grade level, SMOG, Coleman–Liau, Flesch reading ease.
Pure stdlib; safe to run in CI or before editorial passes.
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

BOOK_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = BOOK_ROOT / "docs" / "readability-scores.md"

# Book order: front matter → parts → back matter
ORDERED: list[tuple[str, str, str]] = [
    ("Front matter", "Title page", "front-matter/title-page.md"),
    ("Front matter", "Copyright", "front-matter/copyright.md"),
    ("Front matter", "Author's note", "front-matter/authors-note.md"),
    ("Front matter", "Preface", "front-matter/preface.md"),
    ("Front matter", "Acknowledgements", "front-matter/acknowledgements.md"),
    (
        "Front matter",
        "Introduction",
        "front-matter/introduction-attention-finds-a-focus.md",
    ),
    (
        "Front matter",
        "Typographical conventions",
        "front-matter/typographical-conventions.md",
    ),
    ("Part I", "Bridge", "parts/part-1-attention-and-early-formation/bridge.md"),
    (
        "Part I",
        "Ch 1 — The Weight of Being Looked To",
        "parts/part-1-attention-and-early-formation/chapter-1-the-weight-of-being-looked-to.md",
    ),
    (
        "Part I",
        "Ch 2 — Renewal and Erosion",
        "parts/part-1-attention-and-early-formation/chapter-2-renewal-and-erosion.md",
    ),
    (
        "Part I",
        "Ch 3 — Why We Misjudge Leaders",
        "parts/part-1-attention-and-early-formation/chapter-3-why-we-misjudge-leaders.md",
    ),
    ("Part II", "Bridge", "parts/part-2-legitimacy-harm-and-circulation/bridge.md"),
    (
        "Part II",
        "Ch 4 — Harm Under Influence",
        "parts/part-2-legitimacy-harm-and-circulation/chapter-4-harm-under-influence.md",
    ),
    (
        "Part II",
        "Ch 5 — Effectiveness and Its Illusions",
        "parts/part-2-legitimacy-harm-and-circulation/chapter-5-effectiveness-and-its-illusions.md",
    ),
    (
        "Part II",
        "Ch 6 — Legitimacy Over Time",
        "parts/part-2-legitimacy-harm-and-circulation/chapter-6-legitimacy-over-time.md",
    ),
    ("Part III", "Bridge", "parts/part-3-scale-tradeoffs-and-what-happens-next/bridge.md"),
    (
        "Part III",
        "Ch 7 — Scale and Drift",
        "parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-7-scale-and-drift.md",
    ),
    (
        "Part III",
        "Ch 8 — Tradeoffs Under Pressure",
        "parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-8-tradeoffs-under-pressure.md",
    ),
    (
        "Part III",
        "Ch 9 — What Happens Next",
        "parts/part-3-scale-tradeoffs-and-what-happens-next/chapter-9-what-happens-next.md",
    ),
    ("Back matter", "Epilogue", "back-matter/epilogue.md"),
    (
        "Back matter",
        "Appendix A — Legitimacy transfer",
        "back-matter/appendix-a-legitimacy-transfer.md",
    ),
    (
        "Back matter",
        "Appendix B — Leadership patterns",
        "back-matter/appendix-b-leadership-patterns.md",
    ),
    ("Back matter", "Bibliography", "back-matter/bibliography.md"),
]

MIN_WORDS = 15


def strip_md(text: str) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`[^`]+`", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[\^[^\]]+\]", " ", text)
    text = re.sub(r"^#+\s*.+$", " ", text, flags=re.MULTILINE)
    text = re.sub(r"^:::.*?^:::\s*$", " ", text, flags=re.MULTILINE | re.DOTALL)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"[_~]{1,2}([^_~]+)[_~]{1,2}", r"\1", text)
    text = re.sub(r"^\s*[-*+]\s+", " ", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+\.\s+", " ", text, flags=re.MULTILINE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\\newpage", " ", text)
    text = re.sub(r"[^\w\s'.,;:!?\-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def syllables(word: str) -> int:
    w = re.sub(r"[^a-zA-Z']", "", word).lower()
    if not w:
        return 0
    if w.endswith("e") and len(w) > 2 and not w.endswith("le"):
        w = w[:-1]
    vowels = "aeiouy"
    n = 0
    prev = False
    for c in w:
        v = c in vowels
        if v and not prev:
            n += 1
        prev = v
    if w.endswith("le") and len(w) > 2 and w[-3] not in vowels:
        n += 1
    return max(1, n)


def word_count_alpha(plain: str) -> int:
    return sum(
        1
        for t in plain.split()
        if any(c.isalpha() for c in t)
    )


def readability_stats(plain: str) -> tuple[float, float, float, float, int, int] | None:
    if not plain or word_count_alpha(plain) < MIN_WORDS:
        return None
    raw_sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", plain) if s.strip()]
    n_s = max(1, len(raw_sents))
    words: list[str] = []
    for s in raw_sents:
        for t in s.split():
            w = re.sub(r"^['\"(]+|['\").,;:!?]+$", "", t)
            if any(c.isalpha() for c in w):
                words.append(w)
    n_w = len(words)
    if n_w < MIN_WORDS:
        return None
    syl = sum(syllables(w) for w in words)
    poly = sum(1 for w in words if syllables(w) >= 3)
    fk = 0.39 * (n_w / n_s) + 11.8 * (syl / n_w) - 15.59
    fre = 206.835 - 1.015 * (n_w / n_s) - 84.6 * (syl / n_w)
    smog = 1.043 * math.sqrt(poly * (30.0 / n_s) + 3.1291)
    L = sum(len(re.sub(r"[^a-zA-Z]", "", w)) for w in words) / n_w * 100
    S = n_s / n_w * 100
    cli = 0.0588 * L - 0.296 * S - 15.8
    return fk, smog, cli, fre, n_w, n_s


def collect_rows() -> list[
    tuple[str, str, str, tuple[float, float, float, float, int, int] | None, str | None]
]:
    rows: list[
        tuple[str, str, str, tuple[float, float, float, float, int, int] | None, str | None]
    ] = []
    for bucket, label, rel in ORDERED:
        path = BOOK_ROOT / rel
        if not path.exists():
            rows.append((bucket, label, rel, None, "missing file"))
            continue
        plain = strip_md(path.read_text(encoding="utf-8"))
        st = readability_stats(plain)
        if st is None:
            n = word_count_alpha(plain)
            rows.append((bucket, label, rel, None, f"insufficient text ({n} words)"))
        else:
            rows.append((bucket, label, rel, st, None))
    return rows


def render_markdown(rows: list, generated_iso: str) -> str:
    lines = [
        "# Readability scores (manuscript sources)",
        "",
        "> **Generated file.** Do not edit by hand. Regenerate with:",
        "> `python3 scripts/readability_scores.py`",
        "",
        f"**Last generated:** {generated_iso} UTC",
        "",
        "## Method",
        "",
        "- **Scope:** `front-matter/`, `parts/`, and `back-matter/` Markdown listed in `scripts/readability_scores.py`, in book order.",
        "- **Preprocessing:** Remove fenced code, footnote markers, headings, `::: … :::` blocks (including pattern/vignette bodies), and most punctuation except sentence endings (`.?!`). Keeps metrics closer to body prose than raw Markdown.",
        "- **Flesch–Kincaid grade (F–K):** U.S. grade-level formula (not a certification of audience).",
        "- **SMOG / Coleman–Liau:** Secondary grade estimates.",
        "- **Flesch reading ease (FRE):** 0–100, higher = easier (very rough).",
        "",
        "**Limits:** Syllable counting is heuristic; sentence splits mishandle some abbreviations and citations. Short files (copyright, bridges) yield noisy ratios. Bibliography and appendices are not comparable to narrative chapters.",
        "",
        "## Scores",
        "",
        "| Section | Document | F–K grade | SMOG | Coleman–Liau | Flesch ease | Sentences | Words |",
        "|---|---|--:|--:|--:|--:|--:|--:|",
    ]
    for bucket, label, rel, st, note in rows:
        if note:
            esc = note.replace("|", "\\|")
            lines.append(
                f"| {bucket} | {label} | — | — | — | — | — | *{esc}* |"
            )
        else:
            assert st is not None
            fk, smog, cli, fre, nw, ns = st
            lines.append(
                f"| {bucket} | {label} | {fk:.1f} | {smog:.1f} | {cli:.1f} | {fre:.1f} | {ns} | {nw} |"
            )
    lines.extend(
        [
            "",
            "## Source paths",
            "",
            "| Document | Relative path |",
            "|---|---|",
        ]
    )
    for bucket, label, rel, st, note in rows:
        lines.append(f"| {label} | `{rel}` |")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Write manuscript readability scores.")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output markdown path (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Print markdown to stdout instead of writing a file",
    )
    args = parser.parse_args()
    rows = collect_rows()
    iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    body = render_markdown(rows, iso)
    if args.stdout:
        sys.stdout.write(body)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(body, encoding="utf-8")
        print(f"Wrote {args.output}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
