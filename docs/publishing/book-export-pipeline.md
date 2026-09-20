# Book export pipeline

How manuscripts under [`books/`](../../books/) become **DOCX**, **EPUB**, and **PDF** for distribution. For IngramSpark day-to-day packaging, see [`ingramspark-operating-procedure.md`](ingramspark-operating-procedure.md).

## Overview

Each publishable manuscript folder includes an `index.md` plus a `book.yml` spec. They share **one publishing pipeline**—local Make targets and a GitHub Actions workflow—that assembles each enabled book into export artifacts.

Orchestration lives under [`scripts/`](../../scripts/) (`build.py`, per-format exporters). Shared helpers remain under [`tools/`](../../tools/) (Kindle flatten, EPUB post-process, diagram rasterize, validation). Templates for generated front matter live under [`templates/`](../../templates/).

## Prerequisites

```bash
uv sync --frozen          # Python helpers (incl. Jinja2 for front matter)
# Pandoc is required for export targets:
sudo apt-get install -y pandoc   # or equivalent on your OS
```

Optional: Typst and epubcheck via `scripts/install_typst.sh` and `scripts/install_epubcheck.sh`.

## Local export

From the repository root:

```bash
make validate-book-specs
make export-docx DIR=books/how-meaning-moves
make export-kindle-epub DIR=books/how-meaning-moves
make export-pdf DIR=books/how-meaning-moves
```

- `make export-docx` / related targets combine each book’s `index.md` with its linked chapters (same assembly rules everywhere).
- `make export-all-docx` reads publish-enabled `book.yml` files and only exports books where `build.formats.docx.enabled` is `true`.
- Export basenames omit the leading `books/` prefix (e.g. `how-meaning-moves.docx`, `velorum.docx`).

## Validation and authors

- **`book.yml`** is validated against [`schema/book.schema.json`](../../schema/book.schema.json) via `make validate-book-specs` and during CI detection (strict keys per section; only documented top-level properties).
- Book metadata supports either a single `author` object or an `authors` array for multi-author books.

## CI

[`.github/workflows/book-export-release.yml`](../../.github/workflows/book-export-release.yml) installs Pandoc and Python YAML/schema tooling, rebuilds only manuscripts touched by the change set (with **longest-path** matching and multi-edition fan-out where one folder holds several pipelines, e.g. `books/when-others-look-to-you/v1` and `v2`), and uses each book’s `build.formats.<format>.enabled` and `publishing.enabled` to decide which artifacts to build.

Each CI export also generates `<stem>.manifest.json` with book metadata (`title`, `author`, built `formats`, `word_count`, `chapters`, `build_date`) and uploads it as part of the per-book artifact.

Changes under `scripts/`, `schema/`, `templates/`, or `tools/` (and the workflow itself) trigger a **full** CI rebuild of all books.

## Optional `book.yml`: diagrams and front matter

### Diagram rasterization (`assets.diagrams`)

DOCX, PDF, and Kindle flows invoke [`tools/diagram_rasterize.py`](../../tools/diagram_rasterize.py) before Pandoc. Each publishable book lists **`assets.diagrams`** explicitly:

- optional **`entries`** (`svg`, `png`, optional `width`)
- optional **`default_width`**
- **`auto_discover`**

Use **`auto_discover: false`** with no **`entries`** when a book has no diagrams. When **`auto_discover`** is not false, any `docs/diagrams/*.svg` not already listed is rasterized to `export-assets/diagrams/<stem>.png`. If `book.yml` omits **`assets`** entirely (legacy trees), a small built-in catalog still seeds jobs when those SVG paths exist on disk.

### Front matter generation (`frontmatter.generate`)

[`scripts/build.py`](../../scripts/build.py) calls [`scripts/frontmatter_gen.py`](../../scripts/frontmatter_gen.py) before each export when `frontmatter.generate.enabled` is true. Configure `title_page`, `copyright`, and/or `about_the_series` blocks with `repo_template` (path relative to the repo, often under [`templates/`](../../templates/)) and `output` (path relative to the book folder).

Templates are **[Jinja2](https://jinja.palletsprojects.com/)** (`.md.j2`): use `{{ title }}`, `{% if subtitle %}…{% endif %}`, `{% include "templates/partials/foo.md.j2" %}`, and other Jinja features. `template_context_from_book` in [`scripts/frontmatter_gen.py`](../../scripts/frontmatter_gen.py) supplies `title`, `subtitle`, `subtitle_line` (legacy spacing for older copyright templates), `author`, `year`, optional **`title_page_cover`** (image reference for the title page; use a **basename** at the book root such as `BookCover.png` so Pandoc’s `--resource-path=<book_dir>` resolves it for DOCX/PDF—avoid `../…` paths, which Pandoc does not fetch correctly in multi-file builds), **`title_page_footer`** (extra markdown after the byline), and **`title_page_newpage_after`** (boolean; inserts `\newpage` after the title block for PDF-style exports). The shared **`about_the_series`** template (`templates/about_the_series.md.j2`) produces a portfolio-wide series page for every published book.

Run `make validate-book-specs` after edits.

### Standalone front-matter render

[`scripts/generate_frontmatter.py`](../../scripts/generate_frontmatter.py) uses the same Jinja environment and `book.yml` metadata rules as [`scripts/frontmatter_gen.py`](../../scripts/frontmatter_gen.py). Pass **`--book-dir`** (relative to **`--repo`**) to load `book.yml`, or omit it and set **`--title`**, **`--subtitle`**, **`--author`**, and **`--year`** manually.

## Entrypoints

| Path | Role |
|------|------|
| `scripts/build.py` | Primary export orchestration |
| `scripts/assemble.py` | Manuscript assembly |
| `scripts/export_docx.py` / `export_epub.py` / `export_pdf.py` | Format exporters |
| `scripts/generate_frontmatter.py` | Standalone front-matter render |
| `schema/book.schema.json` | Spec validation |
| `templates/*.md.j2` | Front-matter starters |

## Related

- Cover web assets: [`../book-cover-assets.md`](../book-cover-assets.md)
- IngramSpark packaging: [`ingramspark-operating-procedure.md`](ingramspark-operating-procedure.md)
- Raster print covers: [`ingramspark-raster-wrap.md`](ingramspark-raster-wrap.md)
- Task orchestration map: [`../task-orchestration.md`](../task-orchestration.md)
