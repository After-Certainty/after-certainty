"""Generated front-matter must stay in sync with templates for production packages."""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

_REPO = Path(__file__).resolve().parents[1]
_SCRIPTS = _REPO / "scripts"
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from frontmatter_gen import generate_frontmatter_for_book  # noqa: E402


def test_production_approved_ingramspark_frontmatter_is_template_synced() -> None:
    """
    CI builds regenerate front-matter before packaging. If committed outputs drift
    from templates, package-manifest dirty_tree becomes true and immutable release
    staging fails for production-approved titles.
    """
    drifted: list[str] = []
    for book_yml in sorted((_REPO / "books").glob("*/book.yml")):
        data = yaml.safe_load(book_yml.read_text(encoding="utf-8")) or {}
        ingram = ((data.get("publishing") or {}).get("targets") or {}).get("ingramspark") or {}
        if ingram.get("enabled") is not True:
            continue
        if ingram.get("status") != "production-approved":
            continue
        gen = (data.get("frontmatter") or {}).get("generate") or {}
        if gen.get("enabled") is not True:
            continue
        book_rel = book_yml.parent.relative_to(_REPO).as_posix()
        written = generate_frontmatter_for_book(_REPO, book_rel)
        if written:
            drifted.extend(p.relative_to(_REPO).as_posix() for p in written)

    assert not drifted, (
        "Regenerating front-matter rewrote tracked files; commit the outputs or "
        f"update templates before immutable release: {drifted}"
    )
