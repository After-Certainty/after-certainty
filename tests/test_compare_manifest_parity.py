"""Unit tests for Stage B local-vs-remote semantic manifest parity."""

from __future__ import annotations

import json
from pathlib import Path

from compare_manifest_parity import compare


def _minimal_manifest(
    *, schema: str = "2.4", books: int = 2, extra_book: dict | None = None
) -> dict:
    book_rows = [
        {"slug": "after-certainty", "contentType": "nonfiction"},
        {"slug": "boundary-conditions", "contentType": "fiction"},
        {"slug": "observer-patterns", "contentType": "poetry"},
        {"slug": "how-meaning-moves", "contentType": "nonfiction"},
    ]
    if extra_book:
        book_rows.append(extra_book)
    # Pad books list if needed
    while len(book_rows) < books:
        book_rows.append({"slug": f"pad-{len(book_rows)}", "contentType": "nonfiction"})

    def rows(n: int, prefix: str) -> list[dict]:
        return [{"id": f"{prefix}-{i}", "slug": f"{prefix}-{i}"} for i in range(n)]

    return {
        "manifestVersion": 2,
        "schemaVersion": schema,
        "generatedAt": "2026-07-24T00:00:00+00:00",
        "sourceCommit": "localsha",
        "repository": "ksteffe/after-certainty",
        "ref": "main",
        "releaseTag": "latest",
        "books": book_rows[: max(books, len(book_rows))],
        "glossary": rows(1, "g"),
        "patterns": rows(1, "p"),
        "situations": rows(1, "s"),
        "sources": rows(1, "src"),
        "relationships": rows(1, "r"),
        "thinkers": rows(1, "t"),
        "works": rows(1, "w"),
        "editions": rows(1, "e"),
        "questions": [{"id": "trust-survives-disagreement"}],
        "trails": [{"id": "judgment-before-certainty"}],
        "shelves": rows(1, "sh"),
        "changeEvents": rows(1, "c"),
        "searchAliases": [{"terms": ["x"]}],
        "parts": rows(1, "part"),
        "chapters": rows(1, "ch"),
    }


def test_compare_accepts_equal_or_larger_local() -> None:
    remote = _minimal_manifest(books=4)
    local = _minimal_manifest(books=4)
    local["glossary"].append({"id": "g-extra"})
    local["sourceCommit"] = "newer"
    report, errors = compare(local, remote)
    assert not errors
    assert report["compatible"] is True
    assert report["sourceCommitDiffer"] is True
    assert report["countDeltas"]["glossary"]["delta"] == 1


def test_compare_rejects_schema_regression_and_count_regression() -> None:
    remote = _minimal_manifest(schema="2.3", books=4)
    remote["glossary"] = [{"id": f"g-{i}"} for i in range(5)]
    local = _minimal_manifest(schema="2.2", books=4)
    local["glossary"] = [{"id": "g-0"}]  # regression vs remote
    report, errors = compare(local, remote)
    assert report["compatible"] is False
    assert any("schemaVersion" in e for e in errors)
    assert any("count regression for glossary" in e for e in errors)


def test_compare_allows_additive_local_schema_ahead_of_remote() -> None:
    """PRs may bump schemaVersion before the published release asset catches up."""
    remote = _minimal_manifest(schema="2.3", books=4)
    local = _minimal_manifest(schema="2.4", books=4)
    local["patterns"].append({"id": "p-extra", "slug": "p-extra"})
    report, errors = compare(local, remote)
    assert not errors, errors
    assert report["compatible"] is True
    assert report["local"]["schemaVersion"] == "2.4"
    assert report["remote"]["schemaVersion"] == "2.3"


def test_compare_requires_representative_slugs() -> None:
    remote = _minimal_manifest(books=4)
    local = _minimal_manifest(books=4)
    local["books"] = [b for b in local["books"] if b["slug"] != "observer-patterns"]
    _report, errors = compare(local, remote)
    assert any("observer-patterns" in e for e in errors)


def test_compare_ignores_docs_source_path_chapters_in_floor() -> None:
    """Stale release chapters under docs/ must not block reader-facing TOC cleanup."""
    remote = _minimal_manifest(books=4)
    remote["chapters"] = [
        {"id": "ch-1", "sourcePath": "manuscript/chapter-01.md"},
        {
            "id": "ch-docs",
            "sourcePath": "docs/00-design-handbook-overview.md",
            "title": "Design handbook",
        },
        {"id": "ch-outline", "sourcePath": "docs/chapter-outline.md"},
    ]
    local = _minimal_manifest(books=4)
    local["chapters"] = [
        {"id": "ch-1", "sourcePath": "manuscript/chapter-01.md"},
    ]
    report, errors = compare(local, remote)
    assert not errors, errors
    assert report["compatible"] is True
    assert report["countDeltas"]["chapters"]["remote"] == 1
    assert report["countDeltas"]["chapters"]["local"] == 1
    assert report["countDeltas"]["chapters"]["delta"] == 0


def test_cli_writes_reports(tmp_path: Path, monkeypatch) -> None:  # type: ignore[no-untyped-def]
    import compare_manifest_parity as cmp

    remote = _minimal_manifest(books=4)
    local = json.loads(json.dumps(remote))
    local["sourceCommit"] = "abc"
    local_path = tmp_path / "local.json"
    remote_path = tmp_path / "remote.json"
    local_path.write_text(json.dumps(local), encoding="utf-8")
    remote_path.write_text(json.dumps(remote), encoding="utf-8")
    json_out = tmp_path / "parity.json"
    md_out = tmp_path / "parity.md"

    code = cmp.main(
        [
            "--local",
            str(local_path),
            "--remote-file",
            str(remote_path),
            "--json-out",
            str(json_out),
            "--md-out",
            str(md_out),
        ]
    )
    assert code == 0
    assert json_out.is_file()
    assert md_out.is_file()
    data = json.loads(json_out.read_text(encoding="utf-8"))
    assert data["compatible"] is True
