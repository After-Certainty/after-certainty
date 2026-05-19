#!/usr/bin/env python3
"""Phase 0: realign when-interpretation-no-longer-matters chapter files to index.md."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BOOK = REPO / "upcoming" / "when-interpretation-no-longer-matters"

TITLES = {
    1: "The Boundary We Could Not Cross",
    2: "What It Means for Interpretation to Stop Working",
    3: "Alignment Versus Interpretation",
    4: "Identity Saturation",
    5: "Coercion, Consent, and Performative Legitimacy",
    6: "Narrative Enclosure",
    7: "Alignment-Based Authority",
    8: "Identity-Saturated Political Authority",
    9: "Total Authority and the End of Public Interpretation",
    10: "Transitional and Borderline Cases",
    11: "Why Judgment Feels Impossible",
    12: "What Cannot Be Repaired",
    13: "Recognizing the Shift Early",
}

CHAPTER_FILES = {
    1: BOOK / "parts/part-1-where-interpretation-ends/chapter-1-the-boundary-we-could-not-cross.md",
    2: BOOK
    / "parts/part-1-where-interpretation-ends/chapter-2-what-it-means-for-interpretation-to-stop-working.md",
    3: BOOK
    / "parts/part-2-authority-without-interpretation/chapter-3-alignment-versus-interpretation.md",
    4: BOOK / "parts/part-2-authority-without-interpretation/chapter-4-identity-saturation.md",
    5: BOOK
    / "parts/part-2-authority-without-interpretation/chapter-5-coercion-consent-and-performative-legitimacy.md",
    6: BOOK / "parts/part-2-authority-without-interpretation/chapter-6-narrative-enclosure.md",
    7: BOOK / "parts/part-3-cases-beyond-interpretation/chapter-7-alignment-based-authority.md",
    8: BOOK
    / "parts/part-3-cases-beyond-interpretation/chapter-8-identity-saturated-political-authority.md",
    9: BOOK
    / "parts/part-3-cases-beyond-interpretation/chapter-9-total-authority-and-the-end-of-public-interpretation.md",
    10: BOOK
    / "parts/part-3-cases-beyond-interpretation/chapter-10-transitional-and-borderline-cases.md",
    11: BOOK / "parts/part-4-after-interpretation/chapter-11-why-judgment-feels-impossible.md",
    12: BOOK / "parts/part-4-after-interpretation/chapter-12-what-cannot-be-repaired.md",
    13: BOOK / "parts/part-4-after-interpretation/chapter-13-recognizing-the-shift-early.md",
}

EMBEDDED_CH = re.compile(r"\n# Chapter \d+:[^\n]*\n", re.MULTILINE)
HEADER = re.compile(r"^# \*\*Chapter \d+\*\*\s*\n\n## \*\*[^*]+\*\*\s*\n\n", re.MULTILINE)
APPENDIX_START = re.compile(r"\n\\?\s*\n=\s*\n\n# Appendix A:", re.MULTILINE)


def strip_header(text: str) -> str:
    return HEADER.sub("", text, count=1)


def split_embedded(text: str) -> tuple[str, str]:
    parts = EMBEDDED_CH.split(text, maxsplit=1)
    before = parts[0].strip()
    after = parts[1].strip() if len(parts) > 1 else ""
    return before, after


def peel_orphan(body: str) -> tuple[str, str]:
    if not body or body.lstrip().startswith("##"):
        return "", body
    parts = re.split(r"\n(?=## )", body, maxsplit=1)
    if len(parts) == 2 and not parts[0].strip().startswith("##"):
        return parts[0].strip(), parts[1].strip()
    return "", body


def join_parts(*parts: str) -> str:
    return "\n\n".join(p.strip() for p in parts if p and p.strip())


def format_chapter(num: int, body: str) -> str:
    title = TITLES[num]
    body = body.strip()
    return (
        f"# **Chapter {num}**\n\n## **{title}**\n\n{body}\n"
        if body
        else f"# **Chapter {num}**\n\n## **{title}**\n\n"
    )


def extract_how_to_read_ch1() -> str:
    path = BOOK / "front-matter/how-to-read-this-book.md"
    text = path.read_text(encoding="utf-8")
    m = re.search(
        r"# Chapter 1: The Boundary We Could Not Cross\s*\n\n(.*?)(?=\n## The Event in Brief)",
        text,
        re.DOTALL,
    )
    intro = m.group(1).strip() if m else ""
    m2 = re.search(r"## The Event in Brief\s*\n\n(.*)\Z", text, re.DOTALL)
    event = m2.group(1).strip() if m2 else ""
    return join_parts(intro, f"## **The Event in Brief**\n\n{event}" if event else "")


def trim_how_to_read() -> str:
    path = BOOK / "front-matter/how-to-read-this-book.md"
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"^unfamiliar at first\.\s*\n\n", "", text)
    for pat in (r"\n\\?\s*\n=\s*\n\n# Part I", r"\n# Part I — Where Interpretation Ends"):
        cut = re.search(pat, text)
        if cut:
            text = text[: cut.start()].rstrip() + "\n"
            break
    if not text.startswith("# **How to Read"):
        text = "# **How to Read This Book**\n\n" + text.lstrip()
    return text


def main() -> None:
    carry = ""
    bodies: dict[int, str] = {}

    for n in range(1, 14):
        raw = strip_header(CHAPTER_FILES[n].read_text(encoding="utf-8"))
        before_embed, after_embed = split_embedded(raw)
        orphan, main = peel_orphan(before_embed)
        bodies[n] = join_parts(carry, orphan, main)
        carry = after_embed

    if carry:
        bodies[13] = join_parts(bodies[13], carry)

    bodies[13] = APPENDIX_START.split(bodies[13])[0].strip()

    htr = extract_how_to_read_ch1()
    bodies[1] = join_parts(htr, bodies[1])

    for n, path in CHAPTER_FILES.items():
        path.write_text(format_chapter(n, bodies[n]), encoding="utf-8")
        h2_ok = TITLES[n] in path.read_text(encoding="utf-8")
        print(f"Ch{n}: {len(bodies[n])} chars, title_ok={h2_ok}")

    (BOOK / "front-matter/how-to-read-this-book.md").write_text(
        trim_how_to_read(), encoding="utf-8"
    )
    print("Trimmed how-to-read-this-book.md")


if __name__ == "__main__":
    main()
