#!/usr/bin/env python3
"""Split all upcoming import.md files into v1 manuscript layout."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

RE_IMAGE = re.compile(r"!\[[^\]]*\]\(media/image[^)]+\)\s*\n?", re.IGNORECASE)
RE_HTML_TABLE = re.compile(r"<table>.*?</table>\s*", re.DOTALL | re.IGNORECASE)
RE_WORD_RULE = re.compile(r"^\\[=\\-]\s*$", re.MULTILINE)
RE_EMPTY_H2 = re.compile(r"^##\s*$\n?", re.MULTILINE)
RE_INTERNAL_LINK = re.compile(r"\[([^\]]+)\]\(#[^)]+\)")
RE_TOC = re.compile(
    r"^\[\*\*Author's Note.*?(?=^# Author's Note|^# Preface)",
    re.MULTILINE | re.DOTALL,
)
RE_STRAY = re.compile(r"^### \\\s*$", re.MULTILINE)


def clean(text: str) -> str:
    text = RE_HTML_TABLE.sub("", text)
    text = RE_IMAGE.sub("", text)
    text = RE_WORD_RULE.sub("", text)
    text = RE_EMPTY_H2.sub("", text)
    text = RE_INTERNAL_LINK.sub(r"\1", text)
    text = RE_TOC.sub("", text)
    text = RE_STRAY.sub("", text)
    return text


def slug(s: str) -> str:
    s = re.sub(r"\*+", "", s).strip()
    s = re.sub(r"^(Part\s+[IVXLC]+|Chapter\s+\d+)\s*[—:–-]\s*", "", s, flags=re.I)
    s = re.sub(
        r"^(Introduction|Preface|Conclusion|Appendix\s+[A-Z])\s*[—:–-]\s*", "", s, flags=re.I
    )
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "section"


def strip_bold(s: str) -> str:
    return re.sub(r"\*+", "", s).strip()


def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    c = content.strip()
    if c:
        path.write_text(c + "\n", encoding="utf-8")
    else:
        path.write_text("\n", encoding="utf-8")


def write_index(book_dir: Path, title: str, subtitle: str, entries: list[tuple[str, str, str]]):
    lines = [f"# **{title}**", "", f"## **{subtitle}**", "", "### **Contents**", ""]
    group = None
    for g, label, rel in entries:
        if g != group:
            if group is not None:
                lines.append("")
            group = g
            lines.extend([f"## {g}", ""])
        lines.append(f"- [{label}]({rel})")
    lines.append("")
    write(book_dir / "index.md", "\n".join(lines))


BOOK_YML_INSERT = """
paths:
  manuscript: "./index.md"
  output: "."

frontmatter:
  generate:
    enabled: true
    title_page:
      repo_template: templates/title_page.md.j2
      output: front-matter/title-page.md
    copyright:
      repo_template: templates/copyright.md.j2
      output: front-matter/copyright.md
"""


def update_book_yml(book_dir: Path, author: str = "Kevin Steffensen"):
    p = book_dir / "book.yml"
    text = p.read_text(encoding="utf-8")
    if "paths:" not in text:
        text = re.sub(r"\nbuild:", BOOK_YML_INSERT + "\nbuild:", text, count=1)
    text = text.replace("Contributors TBD", author)
    p.write_text(text, encoding="utf-8")


def gen_frontmatter(book_dir: Path):
    import sys

    scripts = REPO / "scripts"
    if str(scripts) not in sys.path:
        sys.path.insert(0, str(scripts))
    from frontmatter_gen import generate_frontmatter_for_book  # noqa: E402

    rel = book_dir.relative_to(REPO).as_posix()
    written = generate_frontmatter_for_book(REPO, rel)
    if not written:
        raise RuntimeError(f"frontmatter generation wrote no files for {rel}")


def split_ranges(
    book_dir: Path, title: str, subtitle: str, ranges: list[dict], author: str = "Kevin Steffensen"
):
    """ranges: {start, end, path, label, group} line numbers 1-based inclusive, end None = EOF"""
    raw = (book_dir / "import.md").read_text(encoding="utf-8")
    lines = clean(raw).splitlines()
    entries = [
        ("Front Matter", "Title Page", "front-matter/title-page.md"),
        ("Front Matter", "Copyright", "front-matter/copyright.md"),
    ]
    for r in ranges:
        s = r["start"] - 1
        e = r["end"] if r["end"] else len(lines)
        body = "\n".join(lines[s:e])
        if r.get("normalize"):
            body = r["normalize"](body, r)
        rel = r["path"]
        write(book_dir / rel, body)
        if r.get("index", True):
            entries.append((r["group"], r["label"], rel))
    write_index(book_dir, title, subtitle, entries)
    update_book_yml(book_dir, author)
    gen_frontmatter(book_dir)
    (book_dir / "import.md").unlink(missing_ok=True)


def norm_chapter(body: str, r: dict) -> str:
    n = r["num"]
    title = r.get("ch_title", "")
    if body.lstrip().startswith("# **Chapter"):
        out = body
    elif title:
        out = (
            f"# **Chapter {n}**\n\n## **{title}**\n\n"
            + re.sub(r"^#+\s+.*\n+", "", body, count=1).lstrip()
        )
    else:
        out = f"# **Chapter {n}**\n\n" + body.lstrip()
    if title:
        dup = re.compile(rf"^### \*\*{re.escape(title)}\*\*\s*\n+", re.MULTILINE | re.IGNORECASE)
        out = dup.sub("", out, count=1)
    return out


def norm_intro(body: str, r: dict) -> str:
    if body.lstrip().startswith("# **Introduction"):
        return body
    t = r.get("ch_title", "Introduction")
    return (
        f"# **Introduction**\n\n## **{t}**\n\n" + re.sub(r"^#+\s+.*\n+", "", body, count=1).lstrip()
    )


def norm_section(body: str, r: dict) -> str:
    t = r.get("ch_title", strip_bold(r.get("label", "Section")))
    level = r.get("level", 1)
    h = "#" * level
    if re.match(r"^#+\s+\*\*", body.lstrip()):
        return body
    return f"{h} **{t}**\n\n" + re.sub(r"^#+\s+.*\n+", "", body, count=1).lstrip()


def norm_intro_sections(body: str, r: dict) -> str:
    body = re.sub(r"^# Introduction\s*$", "# **Introduction**", body, flags=re.M)
    body = re.sub(r"^## ([^*].*)$", r"## **\1**", body, flags=re.M)
    return body.strip() + "\n"


def norm_interp_chapter(body: str, r: dict) -> str:
    n = r["num"]
    m = re.search(r"Chapter\s+(\d+):\s*(.+)", body, re.I)
    title = strip_bold(m.group(2).split("\n")[0]) if m else r.get("ch_title", "")
    rest = re.sub(r"^# Chapter\s+\d+:[^\n]*\n?", "", body, count=1, flags=re.I).lstrip()
    # normalize ## sections to bold
    rest = re.sub(r"^## ([^*].*)$", r"## **\1**", rest, flags=re.M)
    return f"# **Chapter {n}**\n\n## **{title}**\n\n{rest}"


def norm_bridge(body: str, r: dict) -> str:
    t = r.get("ch_title", "Bridge")
    return f"# **Bridge**\n\n## **{t}**\n\n" + re.sub(r"^#+\s+.*\n+", "", body, count=1).lstrip()


def norm_preface(body: str, r: dict) -> str:
    if body.lstrip().startswith("# **Preface"):
        return body
    return "# **Preface**\n\n" + re.sub(r"^# Preface\s*\n?", "", body, count=1).lstrip()


def norm_authors_note(body: str, r: dict) -> str:
    if body.lstrip().startswith("# **Author"):
        return body
    return (
        "# **Author's Note**\n\n"
        + re.sub(r"^# Author.*\n?", "", body, count=1, flags=re.I).lstrip()
    )


# --- Book-specific split line numbers (from import.md analysis) ---


def split_discipline(d: Path):
    raw = clean((d / "import.md").read_text(encoding="utf-8"))
    lines = raw.splitlines()
    # framing note
    write(d / "docs/framing-note.md", "\n".join(lines[4:11]))
    ranges = [
        {
            "start": 12,
            "end": 33,
            "path": "front-matter/introduction-when-certainty-stops-working.md",
            "label": "Introduction — When Certainty Stops Working",
            "group": "Front Matter",
            "normalize": norm_intro,
            "ch_title": "When Certainty Stops Working",
        },
        {
            "start": 36,
            "end": 49,
            "path": "parts/part-1-why-we-crave-absolutes/chapter-1-the-psychological-comfort-of-certainty.md",
            "label": "Chapter 1 — The Psychological Comfort of Certainty",
            "group": "Part I — Why We Crave Absolutes",
            "normalize": norm_chapter,
            "num": 1,
            "ch_title": "The Psychological Comfort of Certainty",
        },
        {
            "start": 50,
            "end": 63,
            "path": "parts/part-1-why-we-crave-absolutes/chapter-2-abstraction-and-the-seduction-of-clean-answers.md",
            "label": "Chapter 2 — Abstraction and the Seduction of Clean Answers",
            "group": "Part I — Why We Crave Absolutes",
            "normalize": norm_chapter,
            "num": 2,
            "ch_title": "Abstraction and the Seduction of Clean Answers",
        },
        {
            "start": 66,
            "end": 79,
            "path": "parts/part-2-what-patterns-actually-are/chapter-3-patterns-as-warnings-not-verdicts.md",
            "label": "Chapter 3 — Patterns as Warnings, Not Verdicts",
            "group": "Part II — What Patterns Actually Are",
            "normalize": norm_chapter,
            "num": 3,
            "ch_title": "Patterns as Warnings, Not Verdicts",
        },
        {
            "start": 80,
            "end": 93,
            "path": "parts/part-2-what-patterns-actually-are/chapter-4-when-pattern-recognition-turns-fatalistic.md",
            "label": "Chapter 4 — When Pattern Recognition Turns Fatalistic",
            "group": "Part II — What Patterns Actually Are",
            "normalize": norm_chapter,
            "num": 4,
            "ch_title": "When Pattern Recognition Turns Fatalistic",
        },
        {
            "start": 96,
            "end": 106,
            "path": "parts/part-3-probabilistic-truth-and-moral-seriousness/chapter-5-why-the-world-refuses-absolutes.md",
            "label": "Chapter 5 — Why the World Refuses Absolutes",
            "group": "Part III — Probabilistic Truth and Moral Seriousness",
            "normalize": norm_chapter,
            "num": 5,
            "ch_title": "Why the World Refuses Absolutes",
        },
        {
            "start": 107,
            "end": 120,
            "path": "parts/part-3-probabilistic-truth-and-moral-seriousness/chapter-6-probabilistic-reasoning-is-not-moral-relativism.md",
            "label": "Chapter 6 — Probabilistic Reasoning Is Not Moral Relativism",
            "group": "Part III — Probabilistic Truth and Moral Seriousness",
            "normalize": norm_chapter,
            "num": 6,
            "ch_title": "Probabilistic Reasoning Is Not Moral Relativism",
        },
        {
            "start": 123,
            "end": 136,
            "path": "parts/part-4-institutions-authority-and-drift/chapter-7-warning-systems-that-incriminate-their-own-success.md",
            "label": "Chapter 7 — Warning Systems That Incriminate Their Own Success",
            "group": "Part IV — Institutions, Authority, and Drift",
            "normalize": norm_chapter,
            "num": 7,
            "ch_title": "Warning Systems That Incriminate Their Own Success",
        },
        {
            "start": 137,
            "end": 150,
            "path": "parts/part-4-institutions-authority-and-drift/chapter-8-individuals-structures-and-the-collapse-into-absolutes.md",
            "label": "Chapter 8 — Individuals, Structures, and the Collapse into Absolutes",
            "group": "Part IV — Institutions, Authority, and Drift",
            "normalize": norm_chapter,
            "num": 8,
            "ch_title": "Individuals, Structures, and the Collapse into Absolutes",
        },
        {
            "start": 153,
            "end": 162,
            "path": "parts/part-5-leadership-without-prophecy/chapter-9-why-leaders-are-pressured-into-certainty.md",
            "label": "Chapter 9 — Why Leaders Are Pressured Into Certainty",
            "group": "Part V — Leadership Without Prophecy",
            "normalize": norm_chapter,
            "num": 9,
            "ch_title": "Why Leaders Are Pressured Into Certainty",
        },
        {
            "start": 163,
            "end": 174,
            "path": "parts/part-5-leadership-without-prophecy/chapter-10-the-discipline-of-uncertainty-as-leadership-practice.md",
            "label": "Chapter 10 — The Discipline of Uncertainty as Leadership Practice",
            "group": "Part V — Leadership Without Prophecy",
            "normalize": norm_chapter,
            "num": 10,
            "ch_title": "The Discipline of Uncertainty as Leadership Practice",
        },
        {
            "start": 177,
            "end": 186,
            "path": "parts/part-6-living-without-guarantees/chapter-11-responsibility-after-certainty.md",
            "label": "Chapter 11 — Responsibility After Certainty",
            "group": "Part VI — Living Without Guarantees",
            "normalize": norm_chapter,
            "num": 11,
            "ch_title": "Responsibility After Certainty",
        },
        {
            "start": 187,
            "end": 196,
            "path": "parts/part-6-living-without-guarantees/chapter-12-meaning-that-survives-uncertainty.md",
            "label": "Chapter 12 — Meaning That Survives Uncertainty",
            "group": "Part VI — Living Without Guarantees",
            "normalize": norm_chapter,
            "num": 12,
            "ch_title": "Meaning That Survives Uncertainty",
        },
        {
            "start": 197,
            "end": 215,
            "path": "back-matter/conclusion-uncertainty-as-a-discipline.md",
            "label": "Conclusion — Uncertainty as a Discipline",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **Uncertainty as a Discipline**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
        {
            "start": 216,
            "end": None,
            "path": "back-matter/appendix-ideas.md",
            "label": "Optional Appendix Ideas",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Appendix Ideas**\n\n" + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
    ]
    split_ranges(
        d, "The Discipline of Uncertainty", "Why Maturity Begins Where Certainty Ends", ranges
    )


def split_economy(d: Path):
    ranges = [
        {
            "start": 9,
            "end": 51,
            "path": "front-matter/introduction-the-economy-we-argue-about.md",
            "label": "Introduction — The Economy We Argue About Isn't the One We Experience",
            "group": "Front Matter",
            "normalize": norm_intro,
            "ch_title": "The Economy We Argue About Isn't the One We Experience",
        },
        {
            "start": 54,
            "end": 76,
            "path": "parts/part-1-the-economy-we-describe/chapter-1-the-compression-problem.md",
            "label": "Chapter 1 — The Compression Problem",
            "group": "Part I — The Economy We Describe",
            "normalize": norm_chapter,
            "num": 1,
            "ch_title": "The Compression Problem",
        },
        {
            "start": 77,
            "end": 101,
            "path": "parts/part-1-the-economy-we-describe/chapter-2-the-forecast-era-that-didnt-break.md",
            "label": "Chapter 2 — The Forecast Era That Didn't Break",
            "group": "Part I — The Economy We Describe",
            "normalize": norm_chapter,
            "num": 2,
            "ch_title": "The Forecast Era That Didn't Break",
        },
        {
            "start": 102,
            "end": 124,
            "path": "parts/part-1-the-economy-we-describe/chapter-3-the-economy-we-experience.md",
            "label": "Chapter 3 — The Economy We Experience",
            "group": "Part I — The Economy We Describe",
            "normalize": norm_chapter,
            "num": 3,
            "ch_title": "The Economy We Experience",
        },
        {
            "start": 127,
            "end": 152,
            "path": "parts/part-2-why-pain-travels-farther/chapter-4-why-pain-always-scales.md",
            "label": "Chapter 4 — Why Pain Always Scales",
            "group": "Part II — Why Pain Travels Farther",
            "normalize": norm_chapter,
            "num": 4,
            "ch_title": "Why Pain Always Scales",
        },
        {
            "start": 153,
            "end": 176,
            "path": "parts/part-2-why-pain-travels-farther/chapter-5-resonance-without-understanding.md",
            "label": "Chapter 5 — Resonance Without Understanding",
            "group": "Part II — Why Pain Travels Farther",
            "normalize": norm_chapter,
            "num": 5,
            "ch_title": "Resonance Without Understanding",
        },
        {
            "start": 179,
            "end": 201,
            "path": "parts/part-3-leadership-under-compression/chapter-6-leadership-under-interpretive-stress.md",
            "label": "Chapter 6 — Leadership Under Interpretive Stress",
            "group": "Part III — Leadership Under Compression",
            "normalize": norm_chapter,
            "num": 6,
            "ch_title": "Leadership Under Interpretive Stress",
        },
        {
            "start": 202,
            "end": 224,
            "path": "parts/part-3-leadership-under-compression/chapter-7-elections-without-shared-understanding.md",
            "label": "Chapter 7 — Elections Without Shared Understanding",
            "group": "Part III — Leadership Under Compression",
            "normalize": norm_chapter,
            "num": 7,
            "ch_title": "Elections Without Shared Understanding",
        },
        {
            "start": 227,
            "end": 249,
            "path": "parts/part-4-stability-memory-and-fragility/chapter-8-resilience-reform-and-forgotten-guardrails.md",
            "label": "Chapter 8 — Resilience, Reform, and Forgotten Guardrails",
            "group": "Part IV — Stability, Memory, and Fragility",
            "normalize": norm_chapter,
            "num": 8,
            "ch_title": "Resilience, Reform, and Forgotten Guardrails",
        },
        {
            "start": 252,
            "end": 280,
            "path": "back-matter/conclusion-leadership-after-explanation-stops-scaling.md",
            "label": "Conclusion — Leadership After Explanation Stops Scaling",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **Leadership After Explanation Stops Scaling**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=2).lstrip()
            ),
        },
        {
            "start": 283,
            "end": None,
            "path": "back-matter/appendix-a-why-just-tell-the-truth.md",
            "label": "Appendix A — Why \"Just Tell the Truth\" Isn't a Strategy",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Appendix A**\n\n## **Why \"Just Tell the Truth\" Isn't a Strategy**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=2).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "The Economy We Don't Experience",
        "Leadership, Communication, and the Credibility Crisis in Economics and Politics",
        ranges,
    )


def split_collaboration(d: Path):
    raw = clean((d / "import.md").read_text(encoding="utf-8"))
    lines = raw.splitlines()
    write(d / "docs/notes-on-tone.md", "\n".join(lines[347:]))
    ranges = [
        {
            "start": 5,
            "end": 27,
            "path": "front-matter/core-reframe.md",
            "label": "Core Reframe",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "Core Reframe",
        },
        {
            "start": 28,
            "end": 53,
            "path": "front-matter/what-this-book-is.md",
            "label": "What This Book Is",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "What This Book Is",
        },
        {
            "start": 54,
            "end": 63,
            "path": "front-matter/organizing-question.md",
            "label": "Organizing Question",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "Organizing Question",
        },
        {
            "start": 64,
            "end": 80,
            "path": "parts/part-1-contribution/chapter-1-what-no-one-owns-alone.md",
            "label": "Chapter 1 — What No One Owns Alone",
            "group": "Part I — Contribution",
            "normalize": norm_chapter,
            "num": 1,
            "ch_title": "What No One Owns Alone",
        },
        {
            "start": 81,
            "end": 95,
            "path": "parts/part-1-contribution/chapter-2-why-shared-work-feels-unstable.md",
            "label": "Chapter 2 — Why Shared Work Feels Unstable",
            "group": "Part I — Contribution",
            "normalize": norm_chapter,
            "num": 2,
            "ch_title": "Why Shared Work Feels Unstable",
        },
        {
            "start": 96,
            "end": 111,
            "path": "parts/part-1-contribution/chapter-3-alignment-without-full-understanding.md",
            "label": "Chapter 3 — Alignment Without Full Understanding",
            "group": "Part I — Contribution",
            "normalize": norm_chapter,
            "num": 3,
            "ch_title": "Alignment Without Full Understanding",
        },
        {
            "start": 112,
            "end": 128,
            "path": "parts/part-1-contribution/chapter-4-contribution-moves-unevenly.md",
            "label": "Chapter 4 — Contribution Moves Unevenly",
            "group": "Part I — Contribution",
            "normalize": norm_chapter,
            "num": 4,
            "ch_title": "Contribution Moves Unevenly",
        },
        {
            "start": 134,
            "end": 155,
            "path": "parts/part-2-stabilizing-collaboration/chapter-5-the-structures-that-hold-collaboration-together.md",
            "label": "Chapter 5 — The Structures That Hold Collaboration Together",
            "group": "Part II — Stabilizing Collaboration",
            "normalize": norm_chapter,
            "num": 5,
            "ch_title": "The Structures That Hold Collaboration Together",
        },
        {
            "start": 156,
            "end": 174,
            "path": "parts/part-2-stabilizing-collaboration/chapter-6-legibility-and-trust.md",
            "label": "Chapter 6 — Legibility and Trust",
            "group": "Part II — Stabilizing Collaboration",
            "normalize": norm_chapter,
            "num": 6,
            "ch_title": "Legibility and Trust",
        },
        {
            "start": 175,
            "end": 190,
            "path": "parts/part-2-stabilizing-collaboration/chapter-7-stable-collaboration.md",
            "label": "Chapter 7 — Stable Collaboration",
            "group": "Part II — Stabilizing Collaboration",
            "normalize": norm_chapter,
            "num": 7,
            "ch_title": "Stable Collaboration",
        },
        {
            "start": 195,
            "end": 212,
            "path": "parts/part-3-when-collaboration-collapses/chapter-8-when-clarity-becomes-control.md",
            "label": "Chapter 8 — When Clarity Becomes Control",
            "group": "Part III — When Collaboration Collapses",
            "normalize": norm_chapter,
            "num": 8,
            "ch_title": "When Clarity Becomes Control",
        },
        {
            "start": 213,
            "end": 233,
            "path": "parts/part-3-when-collaboration-collapses/chapter-9-when-efficiency-becomes-coercion.md",
            "label": "Chapter 9 — When Efficiency Becomes Coercion",
            "group": "Part III — When Collaboration Collapses",
            "normalize": norm_chapter,
            "num": 9,
            "ch_title": "When Efficiency Becomes Coercion",
        },
        {
            "start": 234,
            "end": 252,
            "path": "parts/part-3-when-collaboration-collapses/chapter-10-when-disagreement-becomes-threat.md",
            "label": "Chapter 10 — When Disagreement Becomes Threat",
            "group": "Part III — When Collaboration Collapses",
            "normalize": norm_chapter,
            "num": 10,
            "ch_title": "When Disagreement Becomes Threat",
        },
        {
            "start": 253,
            "end": 272,
            "path": "parts/part-3-when-collaboration-collapses/chapter-11-residue.md",
            "label": "Chapter 11 — Residue",
            "group": "Part III — When Collaboration Collapses",
            "normalize": norm_chapter,
            "num": 11,
            "ch_title": "Residue",
        },
        {
            "start": 278,
            "end": 315,
            "path": "parts/part-4-seeing-collaboration-more-clearly/chapter-12-diagnostic-lenses.md",
            "label": "Chapter 12 — Diagnostic Lenses",
            "group": "Part IV — Seeing Collaboration More Clearly",
            "normalize": norm_chapter,
            "num": 12,
            "ch_title": "Diagnostic Lenses",
        },
        {
            "start": 316,
            "end": 329,
            "path": "parts/part-4-seeing-collaboration-more-clearly/chapter-13-fragility-is-not-failure.md",
            "label": "Chapter 13 — Fragility Is Not Failure",
            "group": "Part IV — Seeing Collaboration More Clearly",
            "normalize": norm_chapter,
            "num": 13,
            "ch_title": "Fragility Is Not Failure",
        },
        {
            "start": 330,
            "end": 346,
            "path": "parts/part-4-seeing-collaboration-more-clearly/chapter-14-why-the-effort-still-matters.md",
            "label": "Chapter 14 — Why the Effort Still Matters",
            "group": "Part IV — Seeing Collaboration More Clearly",
            "normalize": norm_chapter,
            "num": 14,
            "ch_title": "Why the Effort Still Matters",
        },
    ]
    split_ranges(d, "Why Collaboration Is So Hard", "And Why the Effort Still Matters", ranges)


def split_incentives(d: Path):
    ranges = [
        {
            "start": 5,
            "end": 105,
            "path": "front-matter/introduction-why-judgment-no-longer-coordinates-action.md",
            "label": "Introduction — Why Judgment No Longer Coordinates Action",
            "group": "Front Matter",
            "normalize": norm_intro,
            "ch_title": "Why Judgment No Longer Coordinates Action",
        },
        {
            "start": 131,
            "end": 213,
            "path": "front-matter/interlude-what-this-book-is-not.md",
            "label": "Interlude — What This Book Is Not",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "What This Book Is Not",
            "level": 1,
        },
        {
            "start": 214,
            "end": 372,
            "path": "parts/part-1-incentive-domains/chapter-1-care-without-caring.md",
            "label": "Chapter 1 — Care Without Caring",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 1,
            "ch_title": "Care Without Caring",
        },
        {
            "start": 373,
            "end": 537,
            "path": "parts/part-1-incentive-domains/chapter-2-engagement-as-a-theory-of-value.md",
            "label": "Chapter 2 — Engagement as a Theory of Value",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 2,
            "ch_title": "Engagement as a Theory of Value",
        },
        {
            "start": 538,
            "end": 566,
            "path": "parts/part-1-incentive-domains/chapter-3-publishing-as-truth.md",
            "label": "Chapter 3 — Publishing as Truth",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 3,
            "ch_title": "Publishing as Truth",
        },
        {
            "start": 567,
            "end": 595,
            "path": "parts/part-1-incentive-domains/chapter-4-targets-without-judgment.md",
            "label": "Chapter 4 — Targets Without Judgment",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 4,
            "ch_title": "Targets Without Judgment",
        },
        {
            "start": 596,
            "end": 624,
            "path": "parts/part-1-incentive-domains/chapter-5-fairness-by-formula.md",
            "label": "Chapter 5 — Fairness by Formula",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 5,
            "ch_title": "Fairness by Formula",
        },
        {
            "start": 625,
            "end": 652,
            "path": "parts/part-1-incentive-domains/chapter-6-attention-as-importance.md",
            "label": "Chapter 6 — Attention as Importance",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 6,
            "ch_title": "Attention as Importance",
        },
        {
            "start": 653,
            "end": 680,
            "path": "parts/part-1-incentive-domains/chapter-7-polling-as-moral-signal.md",
            "label": "Chapter 7 — Polling as Moral Signal",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 7,
            "ch_title": "Polling as Moral Signal",
        },
        {
            "start": 681,
            "end": 708,
            "path": "parts/part-1-incentive-domains/chapter-8-formation-without-formation.md",
            "label": "Chapter 8 — Formation Without Formation",
            "group": "Part I — Incentive Domains",
            "normalize": norm_chapter,
            "num": 8,
            "ch_title": "Formation Without Formation",
        },
        {
            "start": 709,
            "end": 727,
            "path": "back-matter/conclusion-living-inside-incentive-systems.md",
            "label": "Conclusion — Living Inside Incentive Systems Without Becoming One",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **Living Inside Incentive Systems Without Becoming One**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
        {
            "start": 728,
            "end": None,
            "path": "back-matter/appendix-method-and-sources.md",
            "label": "Appendix — A Note on Method and Sources",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Appendix**\n\n## **A Note on Method and Sources**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "When Incentives Become the Moral Language",
        "How Systems Decide for Us When Judgment No Longer Scales",
        ranges,
    )


def split_after_certainty(d: Path):
    def ch(n, title):
        return {"normalize": norm_chapter, "num": n, "ch_title": title}

    ranges = [
        {
            "start": 5,
            "end": 216,
            "path": "front-matter/introduction.md",
            "label": "Introduction",
            "group": "Front Matter",
            "normalize": norm_intro_sections,
        },
        {
            "start": 222,
            "end": 386,
            "path": "parts/part-1-letting-go/chapter-1-the-end-of-correctness.md",
            "label": "Chapter 1 — The End of Correctness",
            "group": "Part I — Letting Go",
            **ch(1, "The End of Correctness"),
        },
        {
            "start": 387,
            "end": 570,
            "path": "parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md",
            "label": "Chapter 2 — The Cost of Explanation",
            "group": "Part I — Letting Go",
            **ch(2, "The Cost of Explanation"),
        },
        {
            "start": 571,
            "end": 739,
            "path": "parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md",
            "label": "Chapter 3 — Releasing the Need for Heroes and Villains",
            "group": "Part I — Letting Go",
            **ch(3, "Releasing the Need for Heroes and Villains"),
        },
        {
            "start": 745,
            "end": 899,
            "path": "parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md",
            "label": "Chapter 4 — Judgment Without Finality",
            "group": "Part II — What Can Still Be Practiced",
            **ch(4, "Judgment Without Finality"),
        },
        {
            "start": 900,
            "end": 1085,
            "path": "parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md",
            "label": "Chapter 5 — Responsibility Without Control",
            "group": "Part II — What Can Still Be Practiced",
            **ch(5, "Responsibility Without Control"),
        },
        {
            "start": 1086,
            "end": 1258,
            "path": "parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md",
            "label": "Chapter 6 — Speech That Does Less Harm",
            "group": "Part II — What Can Still Be Practiced",
            **ch(6, "Speech That Does Less Harm"),
        },
        {
            "start": 1264,
            "end": 1416,
            "path": "parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md",
            "label": "Chapter 7 — The Discipline of Not Knowing",
            "group": "Part III — Living With Limits",
            **ch(7, "The Discipline of Not Knowing"),
        },
        {
            "start": 1417,
            "end": 1589,
            "path": "parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md",
            "label": "Chapter 8 — Staying Human at Scale",
            "group": "Part III — Living With Limits",
            **ch(8, "Staying Human at Scale"),
        },
        {
            "start": 1590,
            "end": 1767,
            "path": "parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md",
            "label": "Chapter 9 — When to Stop Interpreting",
            "group": "Part III — Living With Limits",
            **ch(9, "When to Stop Interpreting"),
        },
        {
            "start": 1768,
            "end": None,
            "path": "back-matter/conclusion-enough.md",
            "label": "Conclusion — Enough",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **Enough**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "After Certainty",
        "How to Live and Judge When Understanding Is Not Enough",
        ranges,
    )


def split_before_certainty(d: Path):
    def ch(n, title, part, part_title):
        return {
            "normalize": norm_chapter,
            "num": n,
            "ch_title": title,
            "group": f"Part {part} — {part_title}",
            "label": f"Chapter {n} — {title}",
        }

    ranges = [
        {
            "start": 6,
            "end": 49,
            "path": "front-matter/authors-note.md",
            "label": "Author's Note",
            "group": "Front Matter",
            "normalize": norm_authors_note,
        },
        {
            "start": 50,
            "end": 120,
            "path": "front-matter/how-to-read-this-history.md",
            "label": "How to Read This History",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "How to Read This History",
        },
        {
            "start": 121,
            "end": 191,
            "path": "front-matter/introduction-the-moment-before-things-feel-obvious.md",
            "label": "Introduction — The Moment Before Things Feel Obvious",
            "group": "Front Matter",
            "normalize": norm_intro,
            "ch_title": "The Moment Before Things Feel Obvious",
        },
        {
            "start": 213,
            "end": 339,
            "path": "parts/part-1-constraint-before-choice/chapter-1-life-under-constraint.md",
            **ch(1, "Life Under Constraint", "I", "Constraint Before Choice"),
        },
        {
            "start": 340,
            "end": 496,
            "path": "parts/part-1-constraint-before-choice/chapter-2-order-before-truth.md",
            **ch(2, "Order Before Truth", "I", "Constraint Before Choice"),
        },
        {
            "start": 497,
            "end": 618,
            "path": "parts/part-1-constraint-before-choice/chapter-3-from-power-to-moral-legitimacy.md",
            **ch(3, "From Power to Moral Legitimacy", "I", "Constraint Before Choice"),
        },
        {
            "start": 640,
            "end": 765,
            "path": "parts/part-2-compression-under-scale/chapter-4-population-growth-and-social-density.md",
            **ch(4, "Population Growth and Social Density", "II", "Compression Under Scale"),
        },
        {
            "start": 766,
            "end": 915,
            "path": "parts/part-2-compression-under-scale/chapter-5-shared-conditions-not-shared-revelation.md",
            **ch(5, "Shared Conditions, Not Shared Revelation", "II", "Compression Under Scale"),
        },
        {
            "start": 916,
            "end": 1071,
            "path": "parts/part-2-compression-under-scale/chapter-6-writing-as-moral-stabilizer.md",
            **ch(6, "Writing as Moral Stabilizer", "II", "Compression Under Scale"),
        },
        {
            "start": 1086,
            "end": 1236,
            "path": "parts/part-3-inherited-certainty/chapter-7-medieval-re-adaptation.md",
            **ch(7, "Medieval Re-Adaptation", "III", "Inherited Certainty"),
        },
        {
            "start": 1237,
            "end": 1383,
            "path": "parts/part-3-inherited-certainty/chapter-8-renaissance-exploration-and-fracture.md",
            **ch(8, "Renaissance, Exploration, and Fracture", "III", "Inherited Certainty"),
        },
        {
            "start": 1384,
            "end": 1564,
            "path": "parts/part-3-inherited-certainty/chapter-9-industrial-scale-and-institutional-certainty.md",
            **ch(9, "Industrial Scale and Institutional Certainty", "III", "Inherited Certainty"),
        },
        {
            "start": 1565,
            "end": 1707,
            "path": "parts/part-3-inherited-certainty/chapter-10-the-moment-before-failure.md",
            **ch(10, "The Moment Before Failure", "III", "Inherited Certainty"),
        },
        {
            "start": 1708,
            "end": 1801,
            "path": "back-matter/conclusion-recognition-without-instruction.md",
            "label": "Conclusion — Recognition Without Instruction",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **Recognition Without Instruction**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
        {
            "start": 1802,
            "end": None,
            "path": "back-matter/endnotes.md",
            "label": "Endnotes",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Endnotes**\n\n" + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "Before Certainty Arrives",
        "A Structural History of Moral Compression",
        ranges,
    )


def split_accountability(d: Path):
    def ch(n, title, group):
        return {
            "normalize": norm_chapter,
            "num": n,
            "ch_title": title,
            "group": group,
            "label": f"Chapter {n} — {title}",
        }

    ranges = [
        {
            "start": 9,
            "end": 40,
            "path": "front-matter/authors-note.md",
            "label": "Author's Note",
            "group": "Front Matter",
            "normalize": norm_authors_note,
        },
        {
            "start": 41,
            "end": 224,
            "path": "front-matter/preface-why-this-book-exists.md",
            "label": "Preface — Why This Book Exists",
            "group": "Front Matter",
            "normalize": lambda b, r: (
                "# **Preface**\n\n## **Why This Book Exists**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
        {
            "start": 225,
            "end": 412,
            "path": "front-matter/introduction-the-puzzle-of-moral-persistence.md",
            "label": "Introduction — The Puzzle of Moral Persistence",
            "group": "Front Matter",
            "normalize": norm_intro,
            "ch_title": "The Puzzle of Moral Persistence",
        },
        {
            "start": 438,
            "end": 619,
            "path": "parts/part-1-permanence-of-legitimacy/chapter-1-authority-without-an-expiration-date.md",
            **ch(
                1, "Authority Without an Expiration Date", "Part I — The Permanence of Legitimacy"
            ),
        },
        {
            "start": 620,
            "end": 806,
            "path": "parts/part-1-permanence-of-legitimacy/chapter-2-sacralization-and-inheritance.md",
            **ch(2, "Sacralization and Inheritance", "Part I — The Permanence of Legitimacy"),
        },
        {
            "start": 841,
            "end": 1030,
            "path": "parts/part-2-harm-after-accountability/chapter-3-harm-without-villains.md",
            **ch(3, "Harm Without Villains", "Part II — Harm After Accountability"),
        },
        {
            "start": 1031,
            "end": 1215,
            "path": "parts/part-2-harm-after-accountability/chapter-4-the-distribution-of-suffering.md",
            **ch(4, "The Distribution of Suffering", "Part II — Harm After Accountability"),
        },
        {
            "start": 1216,
            "end": 1400,
            "path": "parts/part-2-harm-after-accountability/chapter-5-moral-drift-without-collapse.md",
            **ch(5, "Moral Drift Without Collapse", "Part II — Harm After Accountability"),
        },
        {
            "start": 1401,
            "end": 1526,
            "path": "parts/part-3-learning-without-resolution/bridge.md",
            "label": "Bridge — Learning Without Resolution",
            "group": "Part III — Learning Without Resolution",
            "normalize": norm_bridge,
            "ch_title": "Learning Without Resolution",
        },
        {
            "start": 1527,
            "end": 1716,
            "path": "parts/part-3-learning-without-resolution/chapter-6-adaptation-is-not-renewal.md",
            **ch(6, "Adaptation Is Not Renewal", "Part III — Learning Without Resolution"),
        },
        {
            "start": 1717,
            "end": 1897,
            "path": "parts/part-3-learning-without-resolution/chapter-7-correction-without-consequence.md",
            **ch(7, "Correction Without Consequence", "Part III — Learning Without Resolution"),
        },
        {
            "start": 1898,
            "end": 2103,
            "path": "parts/part-3-learning-without-resolution/chapter-8-why-this-feels-like-wisdom-from-the-inside.md",
            **ch(
                8,
                "Why This Feels Like Wisdom From the Inside",
                "Part III — Learning Without Resolution",
            ),
        },
        {
            "start": 2104,
            "end": 2295,
            "path": "parts/part-3-learning-without-resolution/chapter-9-warning-is-not-learning.md",
            **ch(9, "Warning Is Not Learning", "Part III — Learning Without Resolution"),
        },
        {
            "start": 2296,
            "end": 2480,
            "path": "parts/part-3-learning-without-resolution/chapter-10-the-stable-equilibrium.md",
            **ch(10, "The Stable Equilibrium", "Part III — Learning Without Resolution"),
        },
        {
            "start": 2481,
            "end": 2651,
            "path": "front-matter/interlude-why-this-is-hard-to-see.md",
            "label": "Interlude — Why This Is So Hard to See From the Inside",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "Why This Is So Hard to See From the Inside",
            "level": 1,
        },
        {
            "start": 2652,
            "end": 2774,
            "path": "parts/part-4-beyond-any-one-institution/bridge.md",
            "label": "Bridge — Beyond Any One Institution",
            "group": "Part IV — Beyond Any One Institution",
            "normalize": norm_bridge,
            "ch_title": "Beyond Any One Institution",
        },
        {
            "start": 2775,
            "end": 2920,
            "path": "parts/part-4-beyond-any-one-institution/chapter-11-the-pattern-across-domains.md",
            **ch(11, "The Pattern Across Domains", "Part IV — Beyond Any One Institution"),
        },
        {
            "start": 2921,
            "end": 3084,
            "path": "parts/part-4-beyond-any-one-institution/chapter-12-why-these-patterns-are-not-inevitable.md",
            **ch(
                12, "Why These Patterns Are Not Inevitable", "Part IV — Beyond Any One Institution"
            ),
        },
        {
            "start": 3085,
            "end": 3250,
            "path": "back-matter/conclusion-what-it-would-mean-for-legitimacy-to-expire.md",
            "label": "Conclusion — What It Would Mean for Legitimacy to Expire",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **What It Would Mean for Legitimacy to Expire**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
        {
            "start": 3251,
            "end": None,
            "path": "back-matter/appendix-a-accountability-is-not-blame.md",
            "label": "Appendix A — Accountability Is Not Blame",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Appendix A**\n\n## **Accountability Is Not Blame**\n\n"
                + re.sub(r"^#+\s+.*\n+", "", b, count=1).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "When Accountability No Longer Expires",
        "How Legitimate Authority Learns to Survive Harm",
        ranges,
    )


def split_interpretation(d: Path):
    def ch(n, title, group):
        return {
            "normalize": norm_interp_chapter,
            "num": n,
            "ch_title": title,
            "group": group,
            "label": f"Chapter {n} — {title}",
        }

    ranges = [
        {
            "start": 35,
            "end": 48,
            "path": "front-matter/authors-note.md",
            "label": "Author's Note",
            "group": "Front Matter",
            "normalize": norm_authors_note,
        },
        {
            "start": 49,
            "end": 165,
            "path": "front-matter/preface.md",
            "label": "Preface",
            "group": "Front Matter",
            "normalize": norm_preface,
        },
        {
            "start": 166,
            "end": 256,
            "path": "front-matter/introduction-the-question-this-book-asks.md",
            "label": "Introduction — The Question This Book Asks",
            "group": "Front Matter",
            "normalize": lambda b, r: norm_intro(
                re.sub(r"^# Introduction:", "# Introduction —", b, count=1),
                {**r, "ch_title": "The Question This Book Asks"},
            ),
        },
        {
            "start": 257,
            "end": 317,
            "path": "front-matter/how-to-read-this-book.md",
            "label": "How to Read This Book",
            "group": "Front Matter",
            "normalize": norm_section,
            "ch_title": "How to Read This Book",
        },
        {
            "start": 332,
            "end": 528,
            "path": "parts/part-1-where-interpretation-ends/chapter-1-the-boundary-we-could-not-cross.md",
            **ch(1, "The Boundary We Could Not Cross", "Part I — Where Interpretation Ends"),
        },
        {
            "start": 529,
            "end": 713,
            "path": "parts/part-1-where-interpretation-ends/chapter-2-what-it-means-for-interpretation-to-stop-working.md",
            **ch(
                2,
                "What It Means for Interpretation to Stop Working",
                "Part I — Where Interpretation Ends",
            ),
        },
        {
            "start": 739,
            "end": 918,
            "path": "parts/part-2-authority-without-interpretation/chapter-3-alignment-versus-interpretation.md",
            **ch(
                3, "Alignment Versus Interpretation", "Part II — Authority Without Interpretation"
            ),
        },
        {
            "start": 919,
            "end": 1093,
            "path": "parts/part-2-authority-without-interpretation/chapter-4-identity-saturation.md",
            **ch(4, "Identity Saturation", "Part II — Authority Without Interpretation"),
        },
        {
            "start": 1094,
            "end": 1263,
            "path": "parts/part-2-authority-without-interpretation/chapter-5-coercion-consent-and-performative-legitimacy.md",
            **ch(
                5,
                "Coercion, Consent, and Performative Legitimacy",
                "Part II — Authority Without Interpretation",
            ),
        },
        {
            "start": 1264,
            "end": 1440,
            "path": "parts/part-2-authority-without-interpretation/chapter-6-narrative-enclosure.md",
            **ch(6, "Narrative Enclosure", "Part II — Authority Without Interpretation"),
        },
        {
            "start": 1467,
            "end": 1640,
            "path": "parts/part-3-cases-beyond-interpretation/chapter-7-alignment-based-authority.md",
            **ch(7, "Alignment-Based Authority", "Part III — Cases Beyond Interpretation"),
        },
        {
            "start": 1641,
            "end": 1820,
            "path": "parts/part-3-cases-beyond-interpretation/chapter-8-identity-saturated-political-authority.md",
            **ch(
                8,
                "Identity-Saturated Political Authority",
                "Part III — Cases Beyond Interpretation",
            ),
        },
        {
            "start": 1821,
            "end": 1988,
            "path": "parts/part-3-cases-beyond-interpretation/chapter-9-total-authority-and-the-end-of-public-interpretation.md",
            **ch(
                9,
                "Total Authority and the End of Public Interpretation",
                "Part III — Cases Beyond Interpretation",
            ),
        },
        {
            "start": 1989,
            "end": 2158,
            "path": "parts/part-3-cases-beyond-interpretation/chapter-10-transitional-and-borderline-cases.md",
            **ch(10, "Transitional and Borderline Cases", "Part III — Cases Beyond Interpretation"),
        },
        {
            "start": 2176,
            "end": 2342,
            "path": "parts/part-4-after-interpretation/chapter-11-why-judgment-feels-impossible.md",
            **ch(11, "Why Judgment Feels Impossible", "Part IV — After Interpretation"),
        },
        {
            "start": 2343,
            "end": 2512,
            "path": "parts/part-4-after-interpretation/chapter-12-what-cannot-be-repaired.md",
            **ch(12, "What Cannot Be Repaired", "Part IV — After Interpretation"),
        },
        {
            "start": 2513,
            "end": 2685,
            "path": "parts/part-4-after-interpretation/chapter-13-recognizing-the-shift-early.md",
            **ch(13, "Recognizing the Shift Early", "Part IV — After Interpretation"),
        },
        {
            "start": 2686,
            "end": 2762,
            "path": "back-matter/appendix-a-structural-map-of-cases.md",
            "label": "Appendix A — A Structural Map of the Cases",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Appendix A**\n\n## **A Structural Map of the Cases**\n\n"
                + re.sub(r"^# Appendix A:[^\n]*\n?", "", b, count=1, flags=re.I).lstrip()
            ),
        },
        {
            "start": 2763,
            "end": 2840,
            "path": "back-matter/glossary.md",
            "label": "Glossary",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Glossary**\n\n"
                + re.sub(r"^# Glossary\s*\n?", "", b, count=1, flags=re.I).lstrip()
            ),
        },
        {
            "start": 2841,
            "end": None,
            "path": "back-matter/conclusion-after-interpretation.md",
            "label": "Conclusion — After Interpretation",
            "group": "Back Matter",
            "normalize": lambda b, r: (
                "# **Conclusion**\n\n## **After Interpretation**\n\n"
                + re.sub(r"^# Conclusion:[^\n]*\n?", "", b, count=1, flags=re.I).lstrip()
            ),
        },
    ]
    split_ranges(
        d,
        "When Interpretation No Longer Matters",
        "Authority After Understanding Collapses",
        ranges,
    )


def main():
    books = [
        ("the-discipline-of-uncertainty", split_discipline),
        ("the-economy-we-dont-experience", split_economy),
        ("why-collaboration-is-so-hard", split_collaboration),
        ("when-incentives-become-the-moral-language", split_incentives),
        ("after-certainty", split_after_certainty),
        ("before-certainty-arrives", split_before_certainty),
        ("when-accountability-no-longer-expires", split_accountability),
        ("when-interpretation-no-longer-matters", split_interpretation),
    ]
    for slug, fn in books:
        d = REPO / "upcoming" / slug
        if (d / "import.md").exists():
            print(f"Splitting {slug}...")
            fn(d)
            print(f"  Done {slug}")
        elif (d / "index.md").exists():
            print(f"  Skip {slug} (already split)")


if __name__ == "__main__":
    main()
