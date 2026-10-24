"""Temporary deterministic editorial migration for the Phase 16 source batch.

The three manifest JSON files are branch-only review fixtures and are removed
after the full renderer audit. This script is deliberately fail-closed.
"""

from __future__ import annotations

import json
import pprint
import re
import textwrap
from datetime import UTC, datetime
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports/reader-passage-links"
FILES = (
    "phase16-work-a.json",
    "phase16-work-b.json",
    "phase16-work-c.json",
)
UPDATED_AT = datetime.now(UTC).isoformat(timespec="seconds")


def all_docs() -> list[dict]:
    out = []
    for name in FILES:
        out.extend(json.loads((REPORTS / name).read_text(encoding="utf-8"))["docs"])
    assert len(out) == 14, f"Expected 14 chapters, received {len(out)}"
    return out


def replace_exact(text: str, old: str, new: str, reference: str) -> str:
    occurrences = text.count(old)
    assert occurrences == 1, f"{reference}: expected exactly one occurrence, found {occurrences}"
    return text.replace(old, new, 1)


def apply_manuscript(spec: dict) -> None:
    path = ROOT / spec["path"]
    original = path.read_text(encoding="utf-8")
    content = original
    for old, new in spec["edits"]:
        if old != new:
            content = replace_exact(content, old, new, str(path))
    for identifier, text in spec["footnotes"].items():
        pattern = re.compile(rf"(?m)^\[\^{re.escape(identifier)}\]:[^\n]*$")
        matches = list(pattern.finditer(content))
        assert len(matches) == 1, f"{path}: missing/duplicate old definition {identifier}"
        content = pattern.sub(lambda _: f"[^{identifier}]: {text}", content, count=1)
    for identifier, text in spec["newFootnotes"].items():
        assert f"[^{identifier}]:" not in content, f"{path}: duplicate new {identifier}"
        content = content.rstrip() + f"\n\n[^{identifier}]: {text}\n"
    for _, identifier, _ in spec["sources"]:
        assert (
            len(re.findall(rf"(?m)^\[\^{re.escape(identifier)}\]:", content)) == 1
        ), f"{path}: expected exactly one definition for {identifier}"
        without_defs = re.sub(r"(?m)^\[\^[^]]+\]:.*$", "", content)
        assert f"[^{identifier}]" in without_defs, f"{path}: orphan {identifier}"
    assert content != original, f"{path} was not changed"
    path.write_text(content, encoding="utf-8")


def add_metadata(spec: dict, slug: str, note: str, rationale: str) -> str:
    source_path = ROOT / "semantic/sources" / f"{slug}.yml"
    content = source_path.read_text(encoding="utf-8")
    source = yaml.safe_load(content)
    assert not source.get("readerPassagePath"), f"{slug}: source already has reader path"
    assert not source.get("whyThisMatters"), f"{slug}: source already has why text"
    assert len(rationale) >= 120, f"{slug}: weak rationale"
    book = spec["path"].split("/")[1]
    route = spec["path"].split("/", 2)[-1].removesuffix(".md").replace("/", "-")
    dest = f"/explore/books/{book}/chapters/{route}#user-content-fnref-{note}"
    wrapped = textwrap.fill(
        rationale, width=84, initial_indent="  ", subsequent_indent="  ",
        break_long_words=False, break_on_hyphens=False,
    )
    insertion = f"whyThisMatters: >-\n{wrapped}\nreaderPassagePath: {dest}\n"
    content = replace_exact(content, "\ntitle:", "\n" + insertion + "title:", slug)
    source_path.write_text(content, encoding="utf-8")
    parsed = yaml.safe_load(content)
    assert parsed["readerPassagePath"] == dest
    assert len(parsed["whyThisMatters"]) >= 120
    return dest


def update_review_log(mappings: list[tuple[str, str, str, str]]) -> None:
    path = REPORTS / "review-log.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = data["entries"]
    for slug, dest, note, book in mappings:
        key = f"source:{slug}:{dest}"
        for existing_key, existing_entry in list(entries.items()):
            if existing_key == key or not existing_key.startswith(f"source:{slug}:"):
                continue
            assert existing_entry.get("status") != "applied", (
                f"{slug}: attempted to replace an already-applied link"
            )
            if existing_entry.get("status") in ("deferred", "proposed"):
                entries[existing_key] = {
                    **existing_entry,
                    "status": "skipped",
                    "supersededBy": dest,
                    "note": (
                        f"Phase 16: superseded by a separately reviewed claim-specific "
                        f"citation at {dest}. Earlier shared source attribution was not "
                        f"promoted automatically."
                    ),
                    "updatedAt": UPDATED_AT,
                }
        prior = entries.get(key, {})
        entries[key] = {
            **prior,
            "entityKind": "source",
            "slug": slug,
            "candidatePath": dest,
            "routeKey": dest.split("#")[0],
            "status": "applied",
            "evidenceLevel": "A",
            "note": (
                f"Phase 16: editorially scoped {book} [{note}] to this source's "
                f"own historical, empirical or interpretive claim. Verified HTML "
                f"fragment and unique work attribution required before merge."
            ),
            "updatedAt": UPDATED_AT,
        }
    data["entries"] = dict(sorted(entries.items()))
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_tests(cases: list[tuple[str, str, str]]) -> None:
    path = ROOT / "tests/test_reader_passage_phase16.py"
    assert not path.exists()
    test_text = '''"""Phase 16: preserve 47 claim-specific, invoked reader-passage citations."""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]

'''
    test_text += "CASES = " + pprint.pformat(tuple(cases), width=88, sort_dicts=False) + "\n\n"
    test_text += '''
def _chapter(path: str) -> str:
    match = re.fullmatch(
        r"/explore/books/([^/]+)/chapters/([^#]+)#user-content-fnref-([^#]+)",
        path,
    )
    assert match is not None, path
    book, route, _ = match.groups()
    manuscripts = [
        candidate
        for candidate in (ROOT / "books" / book).rglob("*.md")
        if candidate.relative_to(ROOT / "books" / book).with_suffix("")
        .as_posix().replace("/", "-") == route
    ]
    assert len(manuscripts) == 1, (path, manuscripts)
    return manuscripts[0].read_text(encoding="utf-8")


def test_all_47_links_are_invoked_with_independent_note_definitions() -> None:
    reviews = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    assert len(CASES) == 47
    assert len({slug for slug, _, _ in CASES}) == len(CASES)
    for slug, expected_note, expected_path in CASES:
        source = yaml.safe_load(
            (ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8")
        )
        path = source["readerPassagePath"]
        assert path == expected_path
        assert path.endswith(f"#user-content-fnref-{expected_note}")
        assert len(source["whyThisMatters"]) >= 120
        text = _chapter(path)
        pattern = rf"(?m)^\\[\\^{re.escape(expected_note)}\\]:.*$"
        defs = re.findall(pattern, text)
        assert len(defs) == 1, (slug, expected_note, defs)
        assert len(defs[0]) >= 60, slug
        text_without_definitions = re.sub(r"(?m)^\\[\\^[^]]+\\]:.*$", "", text)
        assert f"[^{expected_note}]" in text_without_definitions, slug
        result = reviews[f"source:{slug}:{path}"]
        assert result["status"] == "applied"
        assert result["evidenceLevel"] == "A"


def test_shared_review_history_is_preserved() -> None:
    entries = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    for slug, _, path in CASES:
        earlier = [
            entry for key, entry in entries.items()
            if key.startswith(f"source:{slug}:") and key != f"source:{slug}:{path}"
        ]
        for entry in earlier:
            if entry["status"] == "skipped" and entry.get("supersededBy"):
                assert entry["supersededBy"] == path


def test_no_duplicate_note_ids_in_revised_chapters() -> None:
    for _, _, path in CASES:
        text = _chapter(path)
        defined = re.findall(r"(?m)^\\[\\^([^]]+)\\]:", text)
        assert len(defined) == len(set(defined)), path
'''
    path.write_text(test_text, encoding="utf-8")


def write_worksheet(docs: list[dict]) -> None:
    path = REPORTS / "editorial-batch-phase-16.md"
    parts = [
        "# Reader passage editorial coverage — Phase 16 (47-work batch)",
        "",
        "Continuing the merged Phase 15 work (#729), this batch reviews **47 existing source "
        "profiles** across **14 published manuscript chapters**. It separates individually "
        "attributable claims from multi-work citation notes. The merged baseline is "
        "**449 / 714 linked sources** with **188** footnote-cited sources lacking links.",
        "",
        "The examples below are source-to-passage evidence, not proof that any source "
        "endorses the manuscript's philosophical conclusions. Co-citations still "
        "supporting indivisible claims remain deferred. The manuscript's fiction and "
        "illustrative dialogue are not presented as independently reported events.",
        "",
    ]
    for number, spec in enumerate(docs, 1):
        parts += [
            f"## {number}. {spec['path']}",
            "",
            "| Work/source | Scoped citation | Basis for editorial application |",
            "|---|---|---|",
        ]
        for slug, note, why in spec["sources"]:
            safe = why.replace("|", "/")
            parts.append(f"| `{slug}` | `{note}` | {safe} |")
        parts.append("")
    parts += [
        "## Audit and preservation requirements",
        "",
        "- All 47 source IDs must resolve to distinct **invoked** reader footnote fragments.",
        "- Existing shared-note deferrals are retained in the review log with replacement "
        "paths; these are not retroactively reclassified as uniquely attributed.",
        "- Metadata rationale is source-specific and explains what the work can and "
        "cannot establish about the surrounding narrative.",
        "- Run Ruff and the core/Phase 10–16 tests, then the full rendered-HTML reader "
        "audit (without skipping fragment checks).",
        "- Commit both regenerated audit snapshots in the same PR, leaving no invalid, "
        "unverified or existing linked-source editorial-review paths.",
        "",
        "**Results:** Recorded after the full renderer-backed validation.",
        "",
    ]
    path.write_text("\n".join(parts), encoding="utf-8")


def main() -> None:
    docs = all_docs()
    assert len({d["path"] for d in docs}) == len(docs)
    all_cases = [(spec, slug, note, why) for spec in docs for slug, note, why in spec["sources"]]
    assert len(all_cases) == 47
    assert len({slug for _, slug, _, _ in all_cases}) == 47
    for spec in docs:
        apply_manuscript(spec)
    mappings = []
    for spec, slug, note, why in all_cases:
        dest = add_metadata(spec, slug, note, why)
        mappings.append((slug, dest, note, spec["path"].split("/")[1]))
    update_review_log(mappings)
    write_tests([(slug, note, dest) for slug, dest, note, _ in mappings])
    write_worksheet(docs)
    print(f"Applied {len(docs)} manuscript edits and {len(mappings)} uniquely scoped links")


if __name__ == "__main__":
    main()
