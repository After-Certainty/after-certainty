# After Certainty

This repository holds **several independent books** as parallel projects under [`books/`](books/): each publishable manuscript folder includes an `index.md` plus a `book.yml` spec. They share **one publishing pipeline**—local Make targets and a GitHub Actions workflow—that assembles each enabled book into **DOCX**, **EPUB**, and **PDF** for distribution.

## Publishing pipeline

- **Locally:** from the repo root, [`Makefile`](Makefile) targets such as `make export-docx DIR=books/…` and `make export-kindle-epub DIR=books/…` combine each book’s `index.md` with its linked chapters (same assembly rules everywhere). `make export-all-docx` now reads publish-enabled `book.yml` files and only exports books where `build.formats.docx.enabled` is `true`.
- **Validation:** `book.yml` files are validated against [`schema/book.schema.json`](schema/book.schema.json) via `make validate-book-specs` and during CI detection (strict keys per section; only documented top-level properties). Install Python helpers with `pip install -r requirements.txt` (includes **Jinja2** for front matter).
- **Authors:** `book` metadata supports either a single `author` object or an `authors` array for multi-author books.
- **CI:** [`.github/workflows/book-export-release.yml`](.github/workflows/book-export-release.yml) installs Pandoc and Python YAML/schema tooling, rebuilds only manuscripts touched by the change set (with **longest-path** matching and multi-edition fan-out where one folder holds several pipelines, e.g. `books/when-others-look-to-you/v1` and `v2`), and uses each book’s `build.formats.<format>.enabled` and `publishing.enabled` to decide which artifacts to build.
- **Manifest artifact:** each CI export also generates `<stem>.manifest.json` with book metadata (`title`, `author`, built `formats`, `word_count`, `chapters`, `build_date`) and uploads it as part of the per-book artifact.

Orchestration lives under [`scripts/`](scripts/) (`build.py`, per-format exporters); shared helpers remain under [`tools/`](tools/) (Kindle flatten, EPUB post-process, diagram rasterize, validation).

### Optional `book.yml`: diagrams and front matter

- **Diagram rasterization (`assets.diagrams`).** DOCX, PDF, and Kindle flows invoke [`tools/diagram_rasterize.py`](tools/diagram_rasterize.py) before Pandoc. Each publishable book lists **`assets.diagrams`** explicitly: optional **`entries`** (`svg`, `png`, optional `width`), optional **`default_width`**, and **`auto_discover`**. Use **`auto_discover: false`** with no **`entries`** when a book has no diagrams. When **`auto_discover`** is not false, any `docs/diagrams/*.svg` not already listed is rasterized to `export-assets/diagrams/<stem>.png`. If `book.yml` omits **`assets`** entirely (legacy trees), a small built-in catalog still seeds jobs when those SVG paths exist on disk.
- **Front matter generation (`frontmatter.generate`).** [`scripts/build.py`](scripts/build.py) calls [`scripts/frontmatter_gen.py`](scripts/frontmatter_gen.py) before each export when `frontmatter.generate.enabled` is true. Configure `title_page` and/or `copyright` blocks with `repo_template` (path relative to the repo, often under [`templates/`](templates/)) and `output` (path relative to the book folder). Templates are **[Jinja2](https://jinja.palletsprojects.com/)** (`.md.j2`): use `{{ title }}`, `{% if subtitle %}…{% endif %}`, `{% include "templates/partials/foo.md.j2" %}`, and other Jinja features. `template_context_from_book` in [`scripts/frontmatter_gen.py`](scripts/frontmatter_gen.py) supplies `title`, `subtitle`, `subtitle_line` (legacy spacing for older copyright templates), `author`, `year`, optional **`title_page_cover`** (path relative to `front-matter/title-page.md`, e.g. `../BookCover.png` for a cover file at the book root), **`title_page_footer`** (extra markdown after the byline), and **`title_page_newpage_after`** (boolean; inserts `\newpage` after the title block for PDF-style exports).

The shape of these blocks is validated by [`schema/book.schema.json`](schema/book.schema.json); run `make validate-book-specs` after edits.

## Build layout migration

**Done**

- [`scripts/`](scripts/) entrypoints: `build.py`, `assemble.py`, `export_docx.py`, `export_epub.py`, `export_pdf.py`, `generate_frontmatter.py`.
- CI calls `python3 scripts/build.py` and uploads from a single output directory per matrix row.
- [`schema/book.schema.json`](schema/book.schema.json) validates `book.yml`; changes under `scripts/`, `schema/`, or `templates/` trigger a **full** CI rebuild of all books (same as `tools/` / workflow edits).
- [`templates/`](templates/) holds starter `*.md.j2` files for generated front matter (optional for each book).
- **Standalone render:** [`scripts/generate_frontmatter.py`](scripts/generate_frontmatter.py) uses the same Jinja environment and `book.yml` metadata rules as [`scripts/frontmatter_gen.py`](scripts/frontmatter_gen.py). Pass **`--book-dir`** (relative to **`--repo`**) to load `book.yml`, or omit it and set **`--title`**, **`--subtitle`**, **`--author`**, and **`--year`** manually.

Publishable manuscripts live under [`books/`](books/) (for example [`books/coupling/`](books/coupling/), [`books/how-meaning-moves/`](books/how-meaning-moves/)). Export basenames omit the `books/` prefix (e.g. `how-meaning-moves.docx` under `books/how-meaning-moves/`). Future manuscripts are scaffolded under [`upcoming/`](upcoming/) until they are ready to promote into `books/`.

## License

Unless otherwise noted, original content in this repository is licensed under [**Creative Commons Attribution-ShareAlike 4.0 International** (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) — you may share and adapt the material provided you give appropriate credit and distribute derivatives under the same license. See [`LICENSE`](LICENSE) for the full legal terms.

## Books

| Book | Index | What it’s about |
| --- | --- | --- |
| **Coupling** — *Cohesion, Consequence, and the Architecture of Responsibility* | [`books/coupling/index.md`](books/coupling/index.md) | Coupling and cohesion as a grammar for responsibility—from software and delivery practices to AI and structural entropy. |
| **Curiosity Before Certainty** — *How Curiosity Helps Us Understand a Complex World* | [`books/curiosity-before-certainty/index.md`](books/curiosity-before-certainty/index.md) | Staying curious when certainty fails: patterns, systems, and human dynamics without pretending the world is simple. |
| **How Meaning Moves** — *Signal, Compression, Restraint, and the Pace of Understanding* | [`books/how-meaning-moves/index.md`](books/how-meaning-moves/index.md) | Why communication fails before anyone is “wrong”: signal, compression, and restraint between speakers and listeners. |
| **How Serious Systems Learn** — *Disciplines for Acting Without Certainty* | [`books/how-serious-systems-learn/index.md`](books/how-serious-systems-learn/index.md) | Operating disciplines for domains where knowing no longer governs outcomes—constraints, probes, and preserving correction. |
| **Velorum** — *A Tragic Mythic Fantasy Novel* | [`books/velorum/index.md`](books/velorum/index.md) | Mythic land, contemporary voice: Cael and Riven, the bond, Greyhaven, and what holding the world together costs. |
| **When Authority Is Misread** | [`books/when-authority-is-misread/index.md`](books/when-authority-is-misread/index.md) | How communication, constraint, and moral legitimacy drift from human scale into history—read through named leaders and episodes. |
| **When Authority Outlives Accountability** — *A Lens for Moral Leadership* | [`books/when-authority-outlives-accountability/index.md`](books/when-authority-outlives-accountability/index.md) | A structured lens for leadership evaluation: harm, effectiveness, legitimacy transfer, and use at human scale. |
| **When Moral Seriousness Scales** — *Judgment Under Distance and Pressure* | [`books/when-moral-seriousness-scales/index.md`](books/when-moral-seriousness-scales/index.md) | What happens to moral judgment when distance, asymmetry, and pressure replace face-to-face accountability. |
| **When Others Look to You** (edition 1) — *Renewal and Erosion in Leadership* | [`books/when-others-look-to-you/v1/index.md`](books/when-others-look-to-you/v1/index.md) | Influence, renewal and erosion, harm, effectiveness, legitimacy, and why we misjudge leaders who carry others’ attention. |
| **When Others Look to You** (edition 2) — *Forming, Renewing, Eroding, Repeating* | [`books/when-others-look-to-you/v2/index.md`](books/when-others-look-to-you/v2/index.md) | A parallel manuscript structure: forming leadership, renewal, erosion, and how leadership reproduces itself. |

Together these manuscripts are part of the broader **After Certainty** thread: thinking clearly when simple answers stop working.
