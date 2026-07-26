"""Generated front-matter must stay in sync with templates for production packages."""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

_REPO = Path(__file__).resolve().parents[1]
_SCRIPTS = _REPO / "scripts"
_TOOLS = _REPO / "tools"
for _p in (_SCRIPTS, _TOOLS):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from book_specs import load_any_book_spec  # noqa: E402
from frontmatter_gen import render_repo_template, template_context_from_book  # noqa: E402
from path_safety import PathSafetyError, ensure_book_relative  # noqa: E402


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

        spec = load_any_book_spec(book_yml)
        book = spec.get("book") or {}
        ctx = template_context_from_book(book if isinstance(book, dict) else {})
        book_dir = book_yml.parent

        for key in ("title_page", "copyright", "about_the_series"):
            block = gen.get(key)
            if not isinstance(block, dict):
                continue
            tmpl_rel = str(block.get("repo_template", "")).strip()
            out_rel = str(block.get("output", "")).strip()
            if not tmpl_rel or not out_rel:
                continue
            rendered = render_repo_template(_REPO, tmpl_rel, ctx)
            if not rendered.endswith("\n"):
                rendered += "\n"
            try:
                out_path = ensure_book_relative(book_dir, out_rel, description="frontmatter output")
            except PathSafetyError as exc:
                raise AssertionError(str(exc)) from exc
            if not out_path.is_file():
                drifted.append(f"{out_rel} (missing)")
                continue
            if out_path.read_text(encoding="utf-8") != rendered:
                drifted.append(out_path.relative_to(_REPO).as_posix())

    assert not drifted, (
        "Committed front-matter drifts from templates; regenerate and commit before "
        f"immutable release: {drifted}"
    )
