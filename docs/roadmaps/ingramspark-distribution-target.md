# IngramSpark distribution target

**Status:** Active — authoritative plan for opt-in IngramSpark packaging  
**Created:** 2026-07-25  
**Repository:** [`ksteffe/after-certainty`](https://github.com/ksteffe/after-certainty)  
**Planning inspection commit:** repository state as of this document’s creation (mainline audit)

**Scope of this document:** Design an opt-in build mode that produces a submission-kit ZIP for IngramSpark ebook and/or print upload. This document is the single authoritative plan unless a future dated requirements profile needs its own file under `schema/profiles/ingramspark/`.

**Out of scope for this document’s creation / updates:** Implementing exporters, changing `book.yml`, generating publishing files, altering GitHub Actions, or changing the website. No production code or book configuration was changed to produce or revise this plan.

**Related roadmaps:** [`remaining-product-roadmap.md`](remaining-product-roadmap.md) remains authoritative for cross-layer product backlog; this document owns IngramSpark packaging specifically.

---

## 1. Executive summary

The monorepo already ships public digital exports (DOCX / EPUB / PDF) to a rolling GitHub `latest` release and surfaces those formats on the site via semantic-manifest download URLs. It has **no** print-on-demand pipeline, no edition-specific production ISBNs, no IngramSpark preflight, and no full-wrap cover workflow.

An IngramSpark target should be an **opt-in production distribution target** under `publishing.targets.ingramspark`, not a public reading format under `build.formats`. When enabled and fully configured, CI and local tooling produce:

```text
<book-slug>-ingramspark.zip
```

containing the separate files IngramSpark expects for upload (EPUB + JPG; interior PDF + cover PDF), plus preflight reports, checksums, and reproducibility metadata. The ZIP is a **submission kit**, not a single title-upload input.

Official IngramSpark sources conflict on several ebook limits and on ICC vs PDF/X handling. Those conflicts are recorded in dated profile **`ingramspark-2026-07`** with safe defaults; they are not silently resolved. EPUB **3.0/3.0.0 content compliance** is separate from the pinned **current EPUBCheck tool** version.

**Recommended first pilot:** *Everyone Knows Love* (`everyone-knows-love`) — **complete (2026-07)**. Chosen for the standard Pandoc EPUB/PDF path, existing export polish, and low interior complexity. Sequence was an early **ebook rehearsal (INGRAM-009A)** then a **full production pilot (INGRAM-009B)** with IngramSpark account upload/preflight. *Observer Patterns* print-only title is also **account-uploaded (2026-07)** (`status: production-approved`; ebook still out of scope / Typst poetry EPUB). *When Others Become Leaders* print + ebook is also **account-uploaded (2026-07)** (`status: production-approved`).

**Ready for:** schema + profile skeleton implementation (INGRAM-002), after this decision-resolution update.  
**Not ready for:** enabling any book or shipping production packages until human ISBN/manufacturing/cover decisions land.

---

## 2. User goal

Design an opt-in build mode that produces a single GitHub Release ZIP containing the production files needed to submit both the ebook and print editions of a book to IngramSpark.

The package must:

- Be explicitly enabled per book through `book.yml`
- Remain disabled by default
- Support ebook and print enablement independently
- Produce files specialized for IngramSpark rather than merely renaming ordinary exports
- Validate all required assets before packaging
- Fail clearly when required production metadata or cover assets are missing
- Be attached to GitHub Releases
- Be available as a CI workflow artifact for testing
- Not appear in the website book manifest
- Not appear in website download controls
- Not be treated as a public reading format
- Preserve reproducible evidence of exactly what was built and submitted

GitHub Releases in this public repository are themselves publicly accessible. The requirement is that the package not be surfaced or linked by the website—not that the release asset be private.

---

## 3. Scope

In scope for eventual implementation (guided by this plan):

- Opt-in `book.yml` configuration and schema validation
- Dated specification profile `ingramspark-2026-07`
- Specialized ebook EPUB + front-cover JPG
- Specialized print interior PDF (`*_txt.pdf`) and print cover PDF (`*_cvr.pdf`)
- Preflight (human + machine-readable)
- Deterministic ZIP packaging with manifests and checksums
- CI PR artifacts and GitHub Release attachment
- Structural website/manifest exclusion
- Pilot enablement path for three books after human blockers clear
- Operating procedure and agent-ready task catalog

Initial books for planning and eventual enablement:

1. Observer Patterns — `books/observer-patterns/`
2. Everyone Knows Love — `books/everyone-knows-love/`
3. When Others Become Leaders — `books/when-others-become-leaders/`

---

## 4. Non-goals

- Automating IngramSpark account login, API upload, or Cover Template Generator requests
- Storing IngramSpark credentials in the repository or CI secrets for upload
- Treating the ZIP as a single IngramSpark title-upload file
- Making IngramSpark packages a public reading format or site download
- Inventing placeholder ISBNs in production `book.yml`
- Generating full-wrap print covers from front-cover-only web assets in the first implementation
- Hardcover support in the first pilot; the future multi-edition model is documented but no hardcover fields are included in the initial schema
- Changing public DOCX/EPUB/PDF naming or site download URLs
- Replacing the rolling `latest` digital release workflow
- Editorial typesetting redesign unrelated to IngramSpark constraints

---

## 5. Existing repository architecture

### 5.1 Book sources

| Path | Role |
|------|------|
| `books/<slug>/` | Publishable manuscripts; each has `book.yml` |
| `books/<slug>/vN/` | Multi-edition nesting (e.g. When Others Look to You); **not used** by the three initial books |
| `upcoming/` | Metadata-only / promote path |
| `semantic/` | Glossary, patterns, sources, thinkers |
| `templates/` | Jinja2 front-matter templates |

Typical book tree: `book.yml`, `index.md`, `book-cover.png` / `BookCover.png`, `open-graph.png`, `front-matter/`, `parts/` or `manuscript/`, `back-matter/`, optional `docs/export/`, optional `export-assets/diagrams/`.

### 5.2 `book.yml` schema and validation

| Layer | Path |
|-------|------|
| JSON Schema | [`schema/book.schema.json`](../../schema/book.schema.json) |
| Loader | [`tools/book_specs.py`](../../tools/book_specs.py) |
| CLI | [`tools/validate_book_specs.py`](../../tools/validate_book_specs.py) → `make validate-book-specs` |
| Site Zod (manifest consumer) | [`apps/site/lib/graph/schemas.ts`](../../apps/site/lib/graph/schemas.ts) |

Required top-level keys today: `version` (const `1`), `publishing`, `book`, `paths`, `build`, `frontmatter`, `github`.

`publishing` currently allows only:

- `enabled` (boolean)
- `validate_boundary` (optional boolean)

`build.formats` allows `docx`, `epub`, `pdf`, `html` with per-format `enabled` and PDF options (`page_size`, `margins`, `pdf_engine`). **No book currently sets `page_size` / `margins` in YAML** for Pandoc PDF; Observer Patterns sets Typst `paper: "us-trade"` in code.

ISBN today: undifferentiated `book.isbns: string[]` (ISBN-10/13 pattern). Only `when-others-look-to-you-v1` uses it. No ebook/paperback/hardcover discrimination.

### 5.3 Export pipelines

| Format | Script | Notes |
|--------|--------|-------|
| Orchestrator | [`scripts/build.py`](../../scripts/build.py) | Front matter → publication validate → export → `{stem}.manifest.json` |
| DOCX | [`scripts/export_docx.py`](../../scripts/export_docx.py) | Pandoc; optional interior finish |
| EPUB | [`scripts/export_epub.py`](../../scripts/export_epub.py) | Kindle-flatten → Pandoc → [`tools/epub-postprocess.py`](../../tools/epub-postprocess.py) |
| PDF (XeLaTeX) | [`scripts/export_pdf.py`](../../scripts/export_pdf.py) | Default public PDF path |
| PDF (Typst) | [`scripts/export_typst_pdf.py`](../../scripts/export_typst_pdf.py) | Poetry (`observer-patterns`) |
| Assemble / front matter | [`scripts/assemble.py`](../../scripts/assemble.py), [`scripts/frontmatter_gen.py`](../../scripts/frontmatter_gen.py) | Shared prep |
| Diagrams | [`tools/diagram_rasterize.py`](../../tools/diagram_rasterize.py) | `rsvg-convert` or ImageMagick |

### 5.4 Covers, images, fonts

- Source covers: `book.title_page_cover` (typically `book-cover.png`)
- Web derivatives: [`packages/corpus-tasks/scripts/generate-book-cover-assets.mjs`](../../packages/corpus-tasks/scripts/generate-book-cover-assets.mjs) → WebP for site cards/detail/thumb
- OG: [`tools/generate_open_graph.py`](../../tools/generate_open_graph.py)
- Fonts: XeLaTeX/system; Typst Libertinus for Observer Patterns; optional per-book `docs/export/epub.css` / `pdf-header.tex`

### 5.5 Build orchestration

- Turbo: `build-web-covers`, `build-manifest`, `install-for-site`, validate/parity tasks ([`turbo.json`](../../turbo.json))
- Makefile: export targets, `validate-book-specs`, semantic/books manifests, cover assets
- Root npm scripts wrap corpus-tasks; Python publishing via `uv`

### 5.6 Release workflow

Primary workflow: [`.github/workflows/book-export-release.yml`](.github/workflows/book-export-release.yml)

1. Validate book specs + semantic YAML
2. Detect affected books (`tools/ci_affected_books.py`)
3. Export matrix → CI artifact `book-${slug}`
4. Download prior `latest` → [`tools/merge_release_assets.py`](../../tools/merge_release_assets.py) (suffix allowlist: `.docx`, `.epub`, `.pdf`, `.manifest.json`)
5. Regenerate aggregate manifests + `SHA256SUMS`
6. [`scripts/publish_latest_release.sh`](../../scripts/publish_latest_release.sh): **delete and recreate** tag `latest`

**Rolling only.** No immutable versioned book-export release workflow. `book.yml` `github.release` / `release_tag` / `artifacts` are schema-present but not driving publish routing in Python today.

### 5.7 Website manifests and downloads

- Runtime truth: `semantic-manifest.json` installed locally for site builds
- Format URLs built only for `docx|epub|pdf` in [`tools/manifest_books.py`](../../tools/manifest_books.py)
- Download CTAs: [`apps/site/lib/books/semantic-book-action-links.ts`](../../apps/site/lib/books/semantic-book-action-links.ts)
- Availability flags: [`tools/discovery_manifest.py`](../../tools/discovery_manifest.py) (`download_*`, `available_in_print` from purchase links)
- Site does **not** copy release DOCX/EPUB/PDF into `apps/site/public`; it links to GitHub release URLs

### 5.8 Validation and reproducibility today

Existing: schema validation, publication manuscript hygiene, optional `validate_boundary`, editorial preservation, cover asset validate, secret scan, per-book `{stem}.manifest.json` (`title`, `author`, `formats`, `word_count`, `chapters`, `build_date`), release `SHA256SUMS`, semantic `sourceCommit`.

Absent: IngramSpark preflight, tool-versions object for print tools, PDF/X checks, edition ISBN checks.

### 5.9 Naming conventions

Stem from [`tools/book_output_stem.py`](../../tools/book_output_stem.py): path under `books/` with `/` → `-`.

Examples: `everyone-knows-love.epub`, `observer-patterns.pdf`, `when-others-become-leaders.pdf`.

IngramSpark filenames (official): `{isbn}.epub`, `{isbn}.jpg`, `{isbn}_txt.pdf` / `{isbn}txt.pdf`, `{isbn}_cvr.pdf` / `{isbn}cvr.pdf` (File Creation Guide). Package ZIP: `{book.id}-ingramspark.zip`.

### 5.10 Where IngramSpark belongs

| Belongs | Does not belong |
|---------|-----------------|
| `publishing.targets.ingramspark` | `build.formats.*` |
| Specialized exporters + intermediate dirs | Silent mutation of public `{stem}.epub` / `{stem}.pdf` |
| Release ZIP via merge allowlist extension | `books-manifest` / `semantic-manifest` format entries |
| Preflight Make/uv commands | Site download CTAs / JSON-LD encodings |

---

## 6. Official-source audit

Retrieval date for all fetches in this planning pass: **2026-07-25** unless a source document carries its own publication date.

### 6.1 Sources inspected

| Source | URL / artifact | Publication / label | Notes |
|--------|----------------|---------------------|-------|
| Plan your ebook | https://www.ingramspark.com/plan-your-book/ebooks | Live marketing/FAQ page | Cover FAQ text appears to repeat interior bullets (page QA smell) |
| Ebook file requirements blog | https://www.ingramspark.com/blog/file-requirements-for-ebooks | 2021-04-28 | Clear cover pixel rule (2560/1600) |
| Ebook conversion blog | https://www.ingramspark.com/blog/ingramspark-ebook-conversion | Live | Aligns with 2560 cover; wording about “EPUB Check 3.0.0” refers to **content compliance**, not a pinned validator release |
| Print file requirements blog | https://www.ingramspark.com/blog/file-requirements-for-print-books | 2017-01-31 | Checklist; unique ISBN reminder |
| Print Book File Guidelines PDF | https://www.ingramspark.com/hubfs/downloads/Print-Book-File-Guidelines.pdf | Undated short checklist | Common rejection causes |
| File Creation Guide PDF | https://www.ingramspark.com/hubfs/downloads/file-creation-guide.pdf | Label **5.11.26** (treated as 2026-05-11 guide revision) | Deepest print + ebook technical source |
| User Guide PDF | https://www.ingramspark.com/hubfs/downloads/user-guide.pdf | **Version 3.2 — May 15, 2026** | Current policy/user doc; ebook section |
| Cover Template Generator | https://myaccount.ingramspark.com/Portal/Tools/CoverTemplateGenerator | Account portal | Email delivery; not CI-automatable |
| Title processing blog | https://www.ingramspark.com/blog/understanding-ingramspark-title-processing | Live | Template/page-count mismatch failures |

Third-party summaries were not used as requirements authorities. Where they flagged conflicts, those conflicts were re-checked against official PDFs/pages above.

### 6.2 Ebook requirements (condensed)

| Requirement | Applies to | Stated as | Sources | Auto? | Human? | Upload verify? |
|-------------|------------|-----------|---------|-------|--------|----------------|
| EPUB interior + separate JPG cover | ebook | Required | Blog 2021; FCG; User Guide 3.2; plan-your-book | Yes (presence) | No | Yes |
| Unique ebook ISBN-13 | ebook metadata | Required | Blog 2021; print blog 2017 | Yes (presence/format) | Assign ISBN | Account |
| EPUB ≤ 100MB | ebook interior | Required | All ebook sources | Yes | No | Account |
| EPUB 2 or 3 | ebook interior | Required (older/marketing) | Blog 2021; plan-your-book | Partial | No | Account |
| EPUB 3.0 / 3.0.0 **content** compliance | ebook interior | Required (newer) | FCG 5.11.26 (“EPUB 3.0”); User Guide 3.2 (“EPUB 3.0.0 compliant”); conversion blog (same sense) | Yes (structure/metadata) | No | Account |
| Validate with current EPUB checker | ebook interior | Required / strongly recommended | FCG (“most up-to-date validation”); User Guide (Pagina EPUB checker) | Yes | No | Account |
| Image ≤ 5.6M pixels | ebook interior | Required | Blog; User Guide | Yes | No | Account |
| Image ≤ 3.2M pixels | ebook interior | Required | FCG 5.11.26 | Yes | No | Account |
| Internal cover in EPUB | ebook interior | Required | All ebook sources | Partial | Visual | Account |
| No page numbers / TOC page refs | ebook interior | Required | Blog; User Guide | Heuristic | Visual | Account |
| Metadata match cover title/author | ebook | Required | Blog; User Guide | Partial | Visual | Account |
| Front-cover-only JPG (no wrap) | ebook cover | Required | Blog; FCG; User Guide | Partial (aspect/dims) | Visual | Account |
| Cover RGB | ebook cover | Required | All ebook cover sources | Yes | No | Account |
| Cover ≥2560 longest, ≥1600 shortest | ebook cover | Required | Blog 2021; conversion blog | Yes | No | Account |
| Cover ≥1873 longest, ≥1600 shortest | ebook cover | Required | FCG; User Guide 3.2 | Yes | No | Account |
| Reflowable preferred for novels/text | ebook | Recommendation / distribution note | plan-your-book | Config | Editorial | Account |
| Fixed-layout limited retailers | ebook | Informational | plan-your-book; blog | Config | Decision | Account |
| Pagina / up-to-date validation recommended | ebook | Recommendation | User Guide; FCG; plan-your-book | Yes | No | Account |
| Calibre not recommended for creation | ebook | Recommendation | plan-your-book | N/A | Process | N/A |

**EPUB terminology (do not conflate):**

| Concept | Meaning in this plan |
|---------|----------------------|
| Content requirement | Interior must be **EPUB 3.0 / 3.0.0 compliant** (specification / content conformance per FCG + User Guide 3.2) |
| Validation requirement | Package must **pass a separately pinned, current EPUBCheck release** (or equivalent current checker such as Pagina) recorded in `tool-versions.json` |
| Non-inference rule | **Do not** treat “EPUB 3.0.0” in IngramSpark docs as requiring obsolete **EPUBCheck tool version 3.0.0** |

Profile fields in INGRAM-002 must keep `epub_content_version` (or equivalent) separate from `epubcheck_tool_version`.

### 6.3 Print interior requirements (condensed)

| Requirement | Applies to | Stated as | Sources | Auto? | Human? | Upload verify? |
|-------------|------------|-----------|---------|-------|--------|----------------|
| Separate interior PDF from cover | print interior | Required | Print blog; guidelines; FCG | Yes | No | Account |
| Single-page (1-up), not spreads | print interior | Required | Guidelines; upload-failing blog | Heuristic | Visual | Account |
| No crop/registration/printer marks | print interior | Required | Guidelines; FCG | Heuristic | Visual | Account |
| All fonts embedded | print interior | Required | FCG; guidelines; title-processing | Yes (`pdffonts`) | No | Account |
| PDF/X-1a:2001 or PDF/X-3:2002 | print interior | Required | FCG | Partial (veraPDF) | No | Account |
| Filename `isbn_txt.pdf` / `isbntxt.pdf` | print interior | Required (naming) | FCG | Yes | No | Account |
| Margins ≥ 0.5" recommended | print interior | Recommended | Guidelines; FCG | Partial | Visual | Proof |
| Bleed 0.125" on three trim edges if bleed used; none on gutter | print interior | Required when bleed | FCG; guidelines | Partial | Visual | Account |
| B&W images → grayscale | print interior B&W | Required / strongly stated | Guidelines; FCG | Partial | Visual | Account |
| Color interiors → CMYK images | print interior color | Required | FCG | Partial | Visual | Account |
| No spot colors; no registration black | print interior | Required | Guidelines; FCG | Partial | Visual | Account |
| Do not include ICC profiles | print interior | Required (stated) | Guidelines; FCG | Partial | No | Account |
| Continuous tone ~300 ppi; line art ~600 ppi | print interior | Recommended | FCG | Partial | Visual | Proof |
| Images < 72 ppi may be rejected | print interior | Required threshold | FCG color section | Partial | No | Account |
| Body text ≤24 pt → 100% black only | print interior | Recommended / best practice | Guidelines; FCG | Hard | Visual | Proof |
| Ingram adds barcode page; page count stored mod 2 | print interior | Informational process | Guidelines; print blog | Informational | Aware for spine | Account |
| Unique print ISBN ≠ ebook ISBN | print metadata | Required | Print blog 2017 | Yes | Assign | Account |

### 6.4 Print cover requirements (condensed)

| Requirement | Applies to | Stated as | Sources | Auto? | Human? | Upload verify? |
|-------------|------------|-----------|---------|-------|--------|----------------|
| Full wrap PDF (front + spine + back; flaps if jacket) | print cover | Required | Print blog; FCG | Partial (media box) | Visual | Account |
| Use Cover Template Generator | print cover | Strongly recommended | FCG; guidelines; title-processing | No (manual request) | Yes | Account |
| Filename `isbn_cvr.pdf` / variants | print cover | Required (naming) | FCG | Yes | No | Account |
| CMYK; ~300 ppi | print cover | Required / recommended | Guidelines; FCG | Partial | Visual | Account |
| Bleed 0.125" (case laminate wrap differs) | print cover | Required | Guidelines; FCG | Partial | Visual | Account |
| Type safety ≥0.25" from trim | print cover | Required / recommended | Guidelines | Hard | Visual | Proof |
| Barcode mandatory; or reserve 1.75"×1" | print cover | Required | Guidelines; FCG | Partial | Visual | Account |
| Barcode 100% K on white if supplied | print cover | Required | Guidelines; FCG | Hard | Visual | Account |
| Spine text forbidden if page count < 48 (paperback) | print cover | Required | Guidelines; FCG | Config + page count | Visual | Account |
| Spine safety by spine width thresholds | print cover | Required | FCG | Hard | Visual | Proof |
| Template page count / trim / bind must match title metadata | print cover | Required | Title-processing blog; FCG | Yes (metadata) | Yes | Account |
| Pink/blue guide layers must not print (PDF templates) | print cover | Required | FCG | Partial | Visual | Account |
| Total ink ≤ 240% CMYK | print cover / color | Recommended / may reject | FCG | Partial | Visual | Account |
| No spot colors / RGB preferred converted | print cover | Required | FCG | Partial | Visual | Account |

---

## 7. Requirements confidence matrix

Confidence states used below:

| State | Meaning |
|-------|---------|
| `confirmed-current` | Stated consistently in current official materials (2026 User Guide and/or FCG 5.11.26 and checklist PDFs) without material conflict |
| `official-but-conflicting` | Two or more official IngramSpark sources disagree |
| `official-recommendation` | Explicitly recommended, not hard-required |
| `account-verification-needed` | Depends on account settings, manufacturing choices, or live ingestion behavior |
| `human-production-decision` | Kevin must choose; automation cannot invent |
| `not-automatically-verifiable` | Requires visual proof or account upload |

### 7.1 Conflict and confidence rows

| Topic | Confidence | Notes / safe default for `ingramspark-2026-07` |
|-------|------------|-----------------------------------------------|
| Separate EPUB + JPG; separate interior PDF + cover PDF | `confirmed-current` | Package as kit with four upload files when both modes enabled |
| Unique ISBN per edition (ebook ≠ paperback ≠ hardcover) | `confirmed-current` | Edition ISBNs under target config |
| EPUB ≤ 100MB | `confirmed-current` | Blocking |
| EPUB content version | `official-but-conflicting` | **Default EPUB 3.0 / 3.0.0 content compliance** (FCG + User Guide 3.2); record blog “2 or 3” as conflict |
| EPUB validator tool version | `official-recommendation` + repo policy | **Pin a current EPUBCheck release** separately; User Guide recommends Pagina; FCG asks for up-to-date validation — never equate tool version to “3.0.0” from the content wording |
| Interior image pixel cap | `official-but-conflicting` | **Default 3.2M** (stricter FCG); also satisfy 5.6M |
| Ebook cover minimum pixels | `official-but-conflicting` | **Default ≥2560 longest and ≥1600 shortest** (meets blog and exceeds 1873 rule) |
| No page-number refs in ebook TOC/nav | `confirmed-current` | Heuristic + human review |
| Front-cover-only RGB JPG | `confirmed-current` | Blocking |
| Internal cover in EPUB | `confirmed-current` | Blocking |
| Reflowable for text monographs/poetry | `official-recommendation` + `human-production-decision` | Default `reflowable` |
| PDF/X-1a:2001 or PDF/X-3:2002 | `confirmed-current` (stated) | Tooling + account confirmation |
| “Do not include ICC profiles” vs PDF/X output intent | `official-but-conflicting` + `account-verification-needed` | Strip per-object/raster ICC where practical; treat PDF/X **output intent** as a distinct question; **INGRAM-004 starts with an isolated PDF/X proof upload** before any blocking rule is locked in the profile |
| B&W interior grayscale (not CMYK) | `confirmed-current` | Do not force CMYK interiors for B&W titles |
| Color interior CMYK | `confirmed-current` | Only when `color_mode: color` |
| Fonts embedded | `confirmed-current` | Blocking |
| No crop/registration marks | `confirmed-current` | Blocking |
| 0.5" margins | `official-recommendation` | Warning if below; human proof |
| Cover template match page count / trim / bind | `confirmed-current` | Blocking |
| Barcode supplied vs Ingram-placed | `account-verification-needed` + `human-production-decision` | Default `ingram-generated` with reserved clear area |
| Spine width / paper / color affecting spine | `account-verification-needed` | Template metadata + Ingram calculators |
| Trim/binding/paper choices | `human-production-decision` | Required before print packaging |
| Actual ingestion acceptance | `not-automatically-verifiable` | Pilot gate includes account preflight/upload |

---

## 8. Proposed dated specification profile

### 8.1 Name

**`ingramspark-2026-07`**

### 8.2 Format and location

**Schema-backed YAML profile** (primary) + thin Python loader (secondary):

```text
schema/profiles/ingramspark/ingramspark-2026-07.yml
schema/profiles/ingramspark/profile.schema.json   # validates profile documents
tools/ingramspark/profile.py                      # load + resolve checks
```

Rationale:

- YAML matches repository conventions (`book.yml`, semantic YAML)
- JSON Schema validation fits existing `jsonschema` toolchain
- Python loader keeps exporters and preflight in one language
- TypeScript is **not** required for packaging (site must not consume this profile)
- Future profiles (`ingramspark-2027-xx`) are additive files; books pin by name

### 8.3 Profile contents (conceptual)

Top-level profile constants must include at least:

- `epub_content_version` — e.g. `3.0` / `3.0.0` **content** requirement (not a tool version)
- `epubcheck_tool_version` — separately pinned current EPUBCheck (or documented equivalent)
- Ebook cover pixel thresholds, interior image pixel cap, EPUB max bytes
- Print PDF/X construction notes filled after the INGRAM-004 proof (initially `account-verification-needed`)

Each check entry should declare:

- `id`, `applies_to` (`ebook-interior` | `ebook-cover` | `print-interior` | `print-cover` | `package`)
- `severity`: `blocking` | `warning` | `human-review` | `informational`
- `confidence` (states from §7)
- `sources[]` (URLs + retrieval/publication dates)
- `conflict_group` (optional; for official disagreements)
- `default_value` / `threshold`
- `account_override_allowed` (bool)

Hard-coded magic numbers must not scatter across exporters; exporters read the active profile.

### 8.4 How a book records the profile

```yaml
publishing:
  targets:
    ingramspark:
      specification_profile: ingramspark-2026-07
```

Package echoes:

- `package-manifest.json` → `specification_profile`
- `metadata/tool-versions.json` → profile id + profile file sha256 + `epubcheck_tool_version`
- `ebook/preflight.json` / `print/preflight.json` → same

### 8.5 Account-verified overrides

Rare overrides (e.g. accepting a PDF/X packaging detail confirmed by IngramSpark support) belong under:

```yaml
publishing:
  targets:
    ingramspark:
      overrides:
        - check_id: pdfx-output-intent-embedding
          confirmed_at: 2026-08-01
          confirmed_by: kevin
          note: "IngramSpark account preflight accepted DeviceCMYK without OutputIntent"
```

Overrides never silence missing ISBN, wrong trim, or stale template page count. The INGRAM-004 isolated proof is the preferred path to promote PDF/X/ICC rules from advisory to blocking inside the profile itself.

---

## 9. Current export gap analysis

| Area | Current state | Gap for IngramSpark |
|------|---------------|---------------------|
| Public EPUB | Pandoc + postprocess; Kindle-oriented flatten | Need production ISBN metadata, page-number audit, image-pixel caps, RGB cover JPG export, EPUBCheck gate |
| Public PDF | XeLaTeX or Typst; reader-oriented | Need trim-locked media box, PDF/X path, grayscale/CMYK policy, no marks, font embed proof, ISBN naming |
| Covers | 1024×1536 RGB PNG for site/title page; WebP derivatives | Ebook JPG minima unmet; no full-wrap print cover |
| ISBN | Optional undifferentiated array | Edition-specific production ISBNs missing for pilot books |
| Release | Rolling `latest` digital formats | ZIP attach + immutable production tag path |
| Site | Auto-links enabled formats with URLs | Must never learn about IngramSpark formats |
| Preflight | Publication leak / schema / covers | No IngramSpark checklist |
| Color | Assumed RGB for digital | Print CMYK/grayscale conversion + ICC policy absent |
| CI tools | Pandoc, ImageMagick, rsvg, TeX, Typst | Need EPUBCheck, poppler, Ghostscript/qpdf (and optional veraPDF); Pillow in uv group |

---

## 10. Proposed target architecture

```text
authoritative manuscript and source images
                 ↓
         normal shared preparation
         (assemble, front matter, diagrams)
                 ↓
      ┌──────────┴──────────┐
      │                     │
public-reader outputs   IngramSpark outputs
      │                     │
site EPUB/PDF/DOCX     production EPUB/PDF/JPG
      │                     │
semantic/books         <slug>-ingramspark.zip
manifests              (release + CI artifact)
```

Principles:

1. Shared prep may be reused.
2. Public artifacts must not be silently mutated for IngramSpark.
3. Target-specific intermediate directory, e.g. `build/ingramspark/<book-id>/`.
4. Specialization is mandatory for: ISBN filenames/metadata, ebook cover JPG sizing, print trim/PDF/X/color, full-wrap cover validation.
5. Byte-identity with public exports is **not** a goal; accidental identity is allowed only if preflight still passes.

Architectural home: **`publishing.targets.ingramspark`**, orchestrated by new `scripts/package_ingramspark.py` (name aligned with repo scripts), not by extending `spec_formats()`.

---

## 11. Proposed `book.yml` schema

### 11.1 Design constraints

- Backward compatible: absent `targets` ⇒ unchanged behavior
- Separate from `build.formats`
- Independent ebook/print enablement
- camelCase vs snake_case: existing schema is **snake_case** (`validate_boundary`, `title_page_cover`, `page_size`). Prefer **snake_case** in YAML for consistency with `book.schema.json`, even if exploratory sketches used camelCase.

### 11.2 Recommended shape (initial: paperback-only print)

Keep INGRAM-002 small. One active print edition object; no hardcover ISBN field yet.

```yaml
publishing:
  enabled: true
  targets:
    ingramspark:
      enabled: false
      specification_profile: ingramspark-2026-07
      status: planning                 # planning | production-approved
      package:
        github_release: true
        immutable_release: false
      ebook:
        enabled: false
        isbn: "9780000000000"         # required when enabled
        format: reflowable            # reflowable | fixed-layout
        cover_source: book-cover.png
      print:
        enabled: false
        edition: paperback            # initial implementation; hardcover later
        isbn: "9780000000001"         # ISBN for this print edition only
        binding: perfect-bound
        trim:                         # authoritative manufacturing trim
          width_inches: 6.0
          height_inches: 9.0
        interior:
          color_mode: black-and-white # black-and-white | color
          paper: cream                # cream | white | ...
          bleed: false
        cover:
          strategy: supplied-wrap     # supplied-wrap | template-generated | hybrid
          source: assets/ingramspark/cover-wrap.pdf
          template_source: assets/ingramspark/template.pdf
          template_page_count: 250    # must match interior; compared to template-meta.yml
          barcode_mode: ingram-generated  # ingram-generated | supplied
      overrides: []                   # optional account-confirmed check overrides
```

**Hardcover later (not in initial schema):** evolve to keyed editions such as `print.editions.paperback` / `print.editions.hardcover`, or a list of independently configured print editions—each with its own ISBN, binding, spine, template, and cover. Do **not** add `hardcover_isbn` beside a single `binding` field.

**Trim authority:** configured trim lives only under `print.trim`. Observed template trim/spine/media-box values live in `assets/ingramspark/template-meta.yml` and are **compared** to `print.trim` at preflight—not duplicated as a second hand-maintained `template_trim` in `book.yml`.

### 11.3 Validation rules (schema + semantic)

- Default: target absent or `enabled: false` → no packaging, no CI IngramSpark jobs for that book
- If `ebook.enabled`: require ebook ISBN, cover source exists, profile known
- If `print.enabled`: require `edition`, print ISBN, trim, binding, interior color/paper/bleed, cover strategy fields
- Ebook ISBN ≠ print ISBN when both enabled
- `status: production-approved` required to attach immutable production release (rolling PR/main kit may allow `planning` for testing with loud warnings)
- `template_page_count` (and template-meta page count) must equal measured interior page count at package time (runtime check, not only schema)
- Template-meta trim must match configured `print.trim`

### 11.4 Package naming

Artifact name is **derived**: `{book.id}-ingramspark.zip`. Do not expose a freely configurable `artifact_name` unless a concrete use case appears later.

---

## 12. Edition and ISBN model

### 12.1 Current model

`book.isbns: string[]` — no edition role. Used for site commerce / JSON-LD when present. Only WOLTY v1 populated today among published books.

### 12.2 Required discrimination

| Edition | Field (initial model) | Interchangeable? |
|---------|----------------------|------------------|
| Ebook | `publishing.targets.ingramspark.ebook.isbn` | No |
| Paperback | `publishing.targets.ingramspark.print.isbn` with `print.edition: paperback` | No |
| Hardcover | **Not in initial schema** — future keyed/list print editions | No |

Filenames and embedded metadata must use the edition ISBN for that artifact. Public `book.isbns` may later list commerce ISBNs but must not be read as a fallback for missing production ISBNs.

### 12.3 Initial books

| Book | Ebook ISBN | Paperback ISBN | Hardcover |
|------|------------|----------------|-----------|
| Observer Patterns | Disabled (print-only; poetry EPUB later) | `9798256208776` | Out of scope for initial schema |
| Everyone Knows Love | `9798256206956` | `9798256206949` | Out of scope for initial schema |
| When Others Become Leaders | `9798256208929` | `9798256208912` | Out of scope for initial schema |

Do **not** invent placeholders in implemented configuration.

---

## 13. Ebook production design

### 13.1 Outputs

```text
ebook/<ebook-isbn>.epub
ebook/<ebook-isbn>.jpg
ebook/preflight.json
```

### 13.2 Pipeline

1. Reuse shared assemble + publication staging.
2. Run EPUB export with **IngramSpark flags** (dedicated function or `--target ingramspark`):
   - Set dc:identifier / ISBN metadata to ebook ISBN
   - Ensure language, title, subtitle, author match `book.yml`
   - Include internal cover from configured `cover_source`
   - Target **EPUB 3.0 / 3.0.0 content compliance**
   - Validate with a **separately pinned current EPUBCheck** (version recorded in `tool-versions.json`; not inferred from “3.0.0”)
3. Build separate RGB JPG:
   - Front cover only
   - Resize/export from high-resolution source (≥2560×1600 policy)
   - Fail if source pixels insufficient without upscaling policy approval (default: **fail**; do not invent detail by naive upscale)
4. Write preflight JSON; block package on failures

### 13.3 Validation matrix (ebook)

| Check | Class |
|-------|-------|
| EPUB 3.0/3.0.0 content compliance + pinned current EPUBCheck pass | Automatable blocking |
| EPUB ≤ 100MB | Automatable blocking |
| No image > 3.2M pixels | Automatable blocking |
| RGB images (not CMYK) | Automatable blocking |
| Internal cover present | Automatable blocking |
| External JPG exists; RGB; dims ≥2560 longest & ≥1600 shortest | Automatable blocking |
| Front-cover-only heuristic (aspect ~2:3; reject ultra-wide wraps) | Automatable warning + human review |
| ISBN/title/author/language metadata match | Automatable blocking / partial |
| Nav/TOC without print page numbers | Heuristic warning + human review |
| Fixed-layout not used unless configured | Automatable blocking |
| Alt text / accessibility metadata | Warning + human review |
| Font licensing for embedded fonts | Human review |
| Diagrams legible on small screens | Human review |
| Account ingestion | Account upload verification |

### 13.4 Current EPUB vs requirements

- Public EPUB exists for EKL and WOBL; disabled for Observer Patterns → ebook packaging requires new poetry EPUB path or explicit ebook disable until available.
- Covers are 1024×1536 — **below** both 1873 and 2560 longest-side rules.
- No EPUBCheck in CI today.
- Kindle-flatten may be acceptable if EPUBCheck passes; verify rather than assume.

Passing EPUBCheck does **not** guarantee IngramSpark ingestion.

---

## 14. Print-interior production design

### 14.1 Output

```text
print/<print-isbn>_txt.pdf
print/preflight.json
```

### 14.2 Pipeline

1. Shared prep.
2. **Isolated PDF/X and color proof (first gate of INGRAM-004 — before production exporter rules harden):**
   1. Produce one minimal grayscale PDF/X candidate (fixture, not a full book).
   2. Inspect fonts, media box, color spaces, output intent, and embedded profiles.
   3. Run the proposed validators (`pdffonts`, `pdfinfo`, qpdf, Ghostscript ink/color probes, optional veraPDF).
   4. Upload through the IngramSpark account preflight when possible.
   5. Record the **accepted construction** in `ingramspark-2026-07.yml` (what is blocking vs advisory).
3. Only after that proof: target-specific PDF export for real books:
   - Exact trim media box (e.g. 6×9 in) from authoritative `print.trim`
   - One-up pages
   - Margins ≥ 0.5" target (warning if short)
   - Bleed off by default for text monographs; if on, three-edge bleed only
   - Embed all fonts
   - No crop/registration marks
   - B&W: grayscale image derivatives; Color: CMYK derivatives
   - PDF/X construction as proven in step 2
4. Record final page count for cover coupling.
5. Do **not** convert B&W interiors to CMYK merely because the cover is CMYK.

### 14.3 Engine notes

| Book type | Likely engine | Specialization |
|-----------|---------------|----------------|
| EKL / WOBL | Pandoc + XeLaTeX (or future Typst prose) | New geometry + color pipeline |
| Observer Patterns | Typst (`us-trade` already) | Closest trim; still needs PDF/X/grayscale/font/embed proof and ISBN naming |

### 14.4 Interior complexity handling

For the three pilots, manuscripts are text-forward with title-page cover images and essentially no body diagrams/screenshots. Still specify:

- Title-page / cover image inside interior: convert per color mode; ensure effective ppi
- Future diagrams: grayscale or CMYK derivatives in target intermediate dir; never mutate public `export-assets/` in place if that would change site/reader assets
- Tables: keep within type safety; avoid full-bleed unless bleed enabled
- Hyperlinks: print PDF may keep links; human decision whether to neutralize
- Blank pages / recto chapter starts: preserve intentional blanks; page count includes blanks

### 14.5 Validation (print interior)

| Check | Class |
|-------|-------|
| File exists; name matches ISBN | Blocking |
| PDF opens; page count recorded | Blocking |
| Media box == trim (or trim+bleed when bleed) | Blocking |
| Fonts embedded | Blocking |
| No crop/registration marks (heuristic) | Blocking / warning |
| Color space matches config (gray vs CMYK; no unintended RGB) | Blocking |
| No spot / registration black (best-effort) | Blocking / warning |
| PDF/X conformance | Blocking when tool available; else warning + account verify |
| Image resolution thresholds | Warning (<300); blocking (<72) |
| Margins | Warning |
| Ink coverage (color) | Warning / advisory |

---

## 15. Color-management design

### 15.1 Distinctions (do not collapse)

1. **Source asset color profile** — e.g. RGB PNG cover without ICC
2. **Conversion working profile** — named, versioned (e.g. GRACoL/SWOP or Ghostscript default CMYK) recorded in `tool-versions.json`
3. **Resulting image color space** — DeviceGray / DeviceCMYK / RGB
4. **PDF output intent** — PDF/X metadata
5. **Whether ICC is embedded in final assets** — rasters vs PDF
6. **What IngramSpark accepts** — docs say no ICC profiles; also require PDF/X
7. **What PDF/X requires** — typically an output intent
8. **What CI can verify** — color space of images; font embed; approximate ink; PDF/X validator when installed

### 15.2 Recommendations

| Topic | Recommendation |
|-------|----------------|
| Ebook images/cover | Stay RGB; never CMYK |
| B&W interior rasters | DeviceGray; strip embedded ICC |
| Color interior rasters | Convert via pinned working profile → DeviceCMYK; strip per-image ICC |
| Print cover rasters | Same CMYK policy |
| PDF output intent | Distinct from per-object ICC; resolve via INGRAM-004 isolated proof before locking blocking rules |
| Total ink coverage | Advisory check ≤240% where measurable |
| Tools | Ghostscript + Pillow + ImageMagick for conversion; `pdfinfo`/`pdffonts`/qpdf inspect; veraPDF advisory until proven in CI |
| Visual proofing | Soft-proof locally; order physical proof after account acceptance |

Official print guidance both requires PDF/X-1a or PDF/X-3 and warns against including ICC profiles. That ambiguity is specifically about **per-object / embedded image profiles** versus a PDF/X **output intent**. The isolated INGRAM-004 proof must decide what IngramSpark’s account preflight actually accepts before the production exporter treats one interpretation as blocking.

### 15.3 Blocking vs advisory

- Wrong color space for configured mode → **blocking**
- PDF/X / output-intent / ICC embedding rules → **advisory or experimental** until the INGRAM-004 proof records an accepted construction in the profile; then promote to blocking as documented
- Ink >240% → **warning** (FCG: may or may not reject)
- ICC embedded in rasters → severity per profile after the proof (likely strip + warn/block)

---

## 16. Print-cover and template design

### 16.1 First implementation strategy

**`supplied-wrap`**: human-designed full-wrap PDF matching an IngramSpark template, validated by CI.

Not first:

- Template-driven generated cover (needs back copy, spine rules, design system)
- Hybrid generation from front cover alone (would invent back/spine)

### 16.2 Template integration workflow

1. Kevin chooses manufacturing metadata (trim, bind, paper, interior color).
2. Interior build reaches stable page count (mod-2 awareness for Ingram’s added barcode page — document whether template page count should be pre- or post-Ingram adjustment; **account-verification-needed**; default: template ordered for **PDF page count as submitted**).
3. Request template manually from Cover Template Generator (email).
4. Store under book tree, e.g.:

   ```text
   books/<slug>/assets/ingramspark/
     template-meta.yml      # observed: page_count, trim, binding, paper, color, media_box, spine_width_in
     template.pdf           # optional; licensing review before commit
     cover-wrap.pdf         # supplied final wrap
   ```

   `template-meta.yml` is the comparison source for observed template geometry. Authoritative manufacturing trim remains `print.trim` in `book.yml` only.

5. Production cover validated against `template-meta.yml` + configured `print.trim` + interior page count.
6. Page-count change → fail package with actionable error:

   > Print cover template was generated for 238 pages, but the interior now has 242 pages. Request or generate a new IngramSpark cover template before packaging.

7. Never silently scale, stretch, crop, or reuse a stale wrap.

### 16.3 What to commit

| Artifact | Commit? |
|----------|---------|
| Extracted machine-readable template metadata | **Yes** |
| Final supplied wrap PDF | **Yes** (production asset) |
| Original Ingram PDF/IDML template | **Maybe** — review Ingram terms; prefer metadata + final wrap if templates are account-restricted |
| Derived editable source (InDesign/Affinity) | Optional private/design repo; not required in monorepo |

### 16.4 Cover readiness of initial books

| Asset | Observer Patterns | Everyone Knows Love | When Others Become Leaders |
|-------|-------------------|---------------------|----------------------------|
| Front cover source | `book-cover.png` 1024×1536 RGB | same | same |
| Back-cover design/copy | Missing | Missing | Missing (deferred in book docs) |
| Spine design | Missing | Missing | Missing |
| Full-wrap PDF | Missing | Missing | Missing |
| Ingram template | Missing | Missing | Missing |
| Barcode area plan | Missing | Missing | Missing |
| Editable vector/layout source | Not in repo | Not in repo | Not in repo |

### 16.5 Cover preflight failures (blocking)

- Template page count ≠ interior page count
- Trim/binding/paper mismatch vs config
- Media box ≠ template dimensions
- Missing wrap or barcode strategy invalid
- Non-CMYK when required
- Spot/registration black detected (best-effort)

---

## 17. Preflight design

### 17.1 Command shape (repo conventions)

Prefer Make + uv:

```bash
make package-ingramspark BOOK_DIR=books/everyone-knows-love
make preflight-ingramspark BOOK_DIR=books/everyone-knows-love
uv run python scripts/package_ingramspark.py books/everyone-knows-love
uv run python scripts/package_ingramspark.py books/everyone-knows-love --preflight-only
uv run python scripts/package_ingramspark.py books/everyone-knows-love --ebook-only
uv run python scripts/package_ingramspark.py books/everyone-knows-love --print-only
uv run python scripts/package_ingramspark.py books/everyone-knows-love --validate-cover
```

### 17.2 Reports

- Human-readable: `preflight-report.txt` (also summarized in ZIP README warnings section)
- Machine-readable: `ebook/preflight.json`, `print/preflight.json`, root rolled into `package-manifest.json`
- Fields: blocking failures, warnings, manual-review checklist, profile version, tool versions, input/output checksums

### 17.3 Check classification summary

See §§13–16. Preflight framework (INGRAM-006) centralizes severity from the dated profile rather than hardcoding per script.

---

## 18. Package contents

### 18.1 ZIP layout

```text
<book-slug>-ingramspark.zip
├── README-UPLOAD.txt
├── package-manifest.json
├── checksums.sha256
├── ebook/                    # omitted if ebook.enabled false
│   ├── <ebook-isbn>.epub
│   ├── <ebook-isbn>.jpg
│   └── preflight.json
├── print/                    # omitted if print.enabled false
│   ├── <print-isbn>_txt.pdf
│   ├── <print-isbn>_cvr.pdf
│   └── preflight.json
└── metadata/
    ├── book-yml-snapshot.yml
    ├── production-metadata.json
    ├── source-commit.txt
    └── tool-versions.json
```

### 18.2 `README-UPLOAD.txt`

Must explain, for a human who did not run the build:

- Which file → ebook interior field
- Which file → ebook cover field
- Which file → print interior field
- Which file → print cover field
- ISBNs, trim, binding, paper, color mode, bleed, page count, barcode strategy
- Specification profile
- Known warnings
- Remaining manual checks

### 18.3 `package-manifest.json`

Record: book id/slug, title, subtitle, author, edition labels, ISBNs, source commit, dirty-tree flag, build timestamp, tool versions, profile version, input/output hashes, final page count, cover template page count, trim/binding/paper/color/bleed, barcode strategy, preflight result, human-review items, release tag if known.

---

## 19. Release integration

### 19.1 Current behavior

Rolling mutable `latest`; merge allowlist excludes `.zip`; publish deletes and recreates release.

### 19.2 Proposed behavior

| Context | Behavior |
|---------|----------|
| PR / non-main | Build opted-in books; upload `{slug}-ingramspark.zip` + preflight as **workflow artifacts**; do not publish release |
| Main, target enabled | Build + preflight; merge ZIP into staging; attach to `latest` |
| `immutable_release: true` + `status: production-approved` | Also publish versioned/production tag (e.g. `ingramspark/<book-id>/<isbn-or-date>`) retaining the exact ZIP |

### 19.3 Merge/publish changes (future)

- Extend prior `gh release download` patterns to include `*-ingramspark.zip`
- Extend [`merge_release_assets.py`](../../tools/merge_release_assets.py) allowlist for that suffix **without** treating ZIP as a books-manifest format
- Keep `spec_formats()` ignorant of IngramSpark

### 19.4 Recommendation

Support **both**:

- Rolling kit on `latest` for continuous testing
- Immutable production package when submitting under an ISBN

A package actually submitted under an ISBN should remain recoverable after `latest` rotates.

### 19.5 Credentials

No IngramSpark credentials or upload automation in this design.

---

## 20. Website-exclusion guarantees

### 20.1 Path from export to UI

```text
book.yml build.formats
  → book_specs.spec_formats()
  → build.py / CI matrix
  → merge_release_assets (docx/epub/pdf)
  → generate_*_manifest format_entry URLs
  → discovery availability download_* flags
  → semantic-book-action-links / catalog / JSON-LD
```

### 20.2 Structural exclusion

IngramSpark configuration under `publishing.targets` never enters `spec_formats()`. Therefore it cannot gain download URLs, availability flags, badges, or JSON-LD encodings without an explicit (forbidden) generator change.

Additional guardrails in implementation tasks:

- Unit tests: manifest builders omit ingramspark
- Site tests: action links unchanged for opted-in fixture
- Do not copy ZIP into `apps/site/public`
- Do not add sitemap entries for packages
- Do not add format chips for IngramSpark

Prefer structural omission over CSS hiding.

---

## 21. Reproducibility design

| Field | Source |
|-------|--------|
| Source commit SHA | `git rev-parse HEAD` → `metadata/source-commit.txt` |
| Dirty tree | `git status --porcelain` → manifest flag; warn/fail for `production-approved` |
| Tool versions | Pandoc, TeX/Typst, Ghostscript, EPUBCheck, Python, ImageMagick, profile id → `tool-versions.json` |
| Spec profile | Name + sha256 of profile file |
| Input hashes | Manuscript units, cover sources, template meta, book.yml snapshot |
| Output hashes | Each packaged file in `checksums.sha256` |
| ZIP determinism | Sorted members; normalized timestamps where practical (`SOURCE_DATE_EPOCH`) |
| Stable filenames | ISBN-based as specified |
| Page count / template meta | In manifest |
| Build timestamp | Recorded (may prevent byte-identical ZIP across runs) |
| Release tag | When published |

**Likely byte-reproducible:** individual PDFs/EPUBs if tools cooperate and timestamps stripped.  
**Likely not byte-identical across runs:** ZIP central directory times, some PDF IDs, manifest `generatedAt` unless pinned.

Goal: **evidence-reproducible** (same inputs + tools → same substantive outputs + matching checksums recorded), not perfect bit-identical ZIP forever.

---

## 22. Initial three-book readiness matrix

### 22.1 Observer Patterns

| Area | Finding |
|------|---------|
| Path | `books/observer-patterns/` |
| Slug / id | `observer-patterns` |
| Version dirs | None |
| `book.yml` | `books/observer-patterns/book.yml` |
| Title / author | *Observer Patterns* · Kevin Steffensen (no subtitle) |
| Kind | Poetry (`kind: poetry`, Typst) |
| Publication | `publishing.enabled: true` |
| DOCX / EPUB / PDF | Off / Off / On (`pdf_engine: typst`) |
| Release | `latest`, artifacts `[pdf]` |
| Cover | `book-cover.png` + assembled-raster-wrap panels under `assets/ingramspark/` |
| ISBNs | Paperback `9798256208776` (ebook disabled) |
| Trim | 6×9 perfect-bound cream; Typst `us-trade` print entry without jacket art |
| Binding / paper / bleed / barcode | Perfect-bound / cream / no bleed / Ingram-generated barcode |
| Interior complexity | Poetry; Typst DeviceGray interior; low |
| Print wrap / template | Assembled-raster-wrap + `template-meta.yml` (32 cream pages provisional→measured) |
| Readiness | **Print account-uploaded (2026-07)** — `status: production-approved`; ebook still `requires-exporter-change` |

### 22.2 Everyone Knows Love

| Area | Finding |
|------|---------|
| Path | `books/everyone-knows-love/` |
| Slug / id | `everyone-knows-love` |
| Version dirs | None |
| `book.yml` | `books/everyone-knows-love/book.yml` |
| Title / subtitle / author | *Everyone Knows Love* · *Why Is It So Hard to Explain?* · Kevin Steffensen |
| Kind | Nonfiction monograph |
| Publication | `publishing.enabled: true` |
| DOCX / EPUB / PDF | On / On / On (Pandoc/xelatex) |
| Export polish | `docs/export/epub.css`, `pdf-header.tex`, `reference.docx` |
| Release | `latest`, `[docx, epub, pdf]` |
| Cover | `book-cover.png` 1024×1536 RGB; below ebook minima |
| ISBNs | None |
| Trim / binding / paper / bleed / barcode | Unknown |
| Interior complexity | Text; no body diagrams; low |
| Print wrap / template | Missing |
| Readiness | `ready-after-metadata` + `ready-after-cover-work` |

### 22.3 When Others Become Leaders

| Area | Finding |
|------|---------|
| Path | `books/when-others-become-leaders/` |
| Slug / id | `when-others-become-leaders` |
| Version dirs | None |
| `book.yml` | `books/when-others-become-leaders/book.yml` |
| Title / subtitle / author | *When Others Become Leaders* · *What Enduring Influence Leaves Behind* · Kevin Steffensen |
| Kind | Nonfiction monograph |
| Publication | `publishing.enabled: true`, `validate_boundary: true` |
| DOCX / EPUB / PDF | On / On / On |
| Release | `latest`, `[docx, epub, pdf]` |
| Cover | `book-cover.png` + assembled-raster-wrap panels under `assets/ingramspark/` (+ `ebook-front.png`) |
| ISBNs | Paperback `9798256208912`; ebook `9798256208929` |
| Trim | 6×9 perfect-bound cream; Pandoc/XeLaTeX interior |
| Binding / paper / bleed / barcode | Perfect-bound / cream / no bleed / Ingram-generated barcode |
| Interior complexity | Longer (~51k words); text + bibliography; low image complexity |
| Print wrap / template | Assembled-raster-wrap + labeled dark-brown spine + `template-meta.yml` (128 cream pages) |
| Readiness | **Print + ebook account-uploaded (2026-07)** — `status: production-approved` |

### 22.4 Shared production gaps

- No edition ISBNs
- No IngramSpark assets directories
- Ebook cover pixel shortfall (1024 < 1600 shortest / 2560 longest policies)
- No recorded print page counts
- Public PDFs not verified as PDF/X / grayscale / trim-locked for POD

---

## 23. Recommended first pilot

**Everyone Knows Love** (`everyone-knows-love`) — **pilot complete (2026-07)**

Why it was chosen:

1. Standard Pandoc EPUB + PDF path already enabled (no Typst/poetry EPUB gap)
2. Existing `docs/export/` polish reduces unknown EPUB/PDF variance
3. Low interior complexity (no diagrams)
4. Medium length vs WOBL
5. Print not explicitly deferred in book docs (unlike WOBL)
6. Observer Patterns would force ebook exporter invention before pilot learning

Pilot sequence (aligned with the task graph in §26–§27):

1. **INGRAM-009A — ebook rehearsal** — **done** (ebook ISBN + hi-res crop; local/CI packaging; account ebook path exercised with the full pilot).
2. **INGRAM-009B — full production pilot** — **done** (ebook + paperback print package packaged in CI/local; IngramSpark account upload/preflight accepted for interior + cover + ebook after cover ICC/LZW fix).

**Account outcome:** Title files accepted; cover warnings for per-object ICC and LZW were cleared by DeviceCMYK + Flate conversion (`strip_per_object_icc`). `book.yml` status is `production-approved` with `package.github_release` and `package.immutable_release` enabled for rolling + immutable kit attach.

---

## 24. Book-specific blockers

| Book | Blockers |
|------|----------|
| Everyone Knows Love | **Cleared** — ISBNs, manufacturing metadata, wrap assets, packaging, and account upload/preflight complete; `status: production-approved` |
| Observer Patterns | **Print cleared (2026-07)** — paperback ISBN, wrap, Typst interior, account upload; `status: production-approved`. Remaining: poetry EPUB / ebook ISBN if an ebook edition is desired later |
| When Others Become Leaders | **Cleared (2026-07)** — print/ebook ISBNs, wrap, packaging, and account upload complete; `status: production-approved` |

---

## 25. Human production decisions

| Decision | Recommendation | Tradeoffs | Latest point required | Blocks |
|----------|-----------------|-----------|----------------------|--------|
| First print edition | Paperback perfect-bound | Hardcover later adds case laminate wrap rules | Before print packaging | Print, cover |
| Trim | 6×9 in (matches Observer Typst us-trade; common trade) | Other trims need new templates | Before interior freeze | Print, cover |
| Paper | Cream for B&W text | Affects spine width / template | Before template request | Cover |
| Interior color | Black-and-white | Color cost/complexity | Before interior export | Print color path |
| Bleed | `false` for these text books | Full-bleed art would need true bleed | Before interior export | Print geometry |
| Ebook ISBN | Obtain unique ISBN-13 | Cost/process | Before ebook packaging | Ebook |
| Paperback ISBN | Obtain unique ISBN-13 ≠ ebook | Cost/process | Before print packaging | Print, cover, barcode |
| Hardcover | Defer entirely from initial schema | Avoid misleading `hardcover_isbn` on a paperback object | Only when multi-edition print model lands | Future hardcover work |
| Barcode | `ingram-generated` with reserved clear area | Less control; simpler first pass | Before final wrap | Cover |
| Back/spine copy | Write and design | Editorial + design time | Before wrap supply | Cover |
| Cover strategy | `supplied-wrap` first | Slower design; safer than auto-generate | Before INGRAM-005 use on real books | Cover |
| Commit Ingram templates | Prefer metadata + final wrap; templates only if licensing OK | Binary weight; license | Before committing binaries | Repo policy |
| Immutable releases | Required when submitting under ISBN | Extra tag hygiene | Before real submission (009B) | Release recovery |
| `production-approved` flag | Yes — minimal lifecycle | Slight ceremony | Before immutable publish | Accidental submit |
| Pilot book | Everyone Knows Love | Delays poetry-specific learning | Before INGRAM-009A | Pilot |

---

## 26. Agent-ready task catalog

### INGRAM-001 — Official specification and repository gap audit

- **Purpose:** Capture official requirements, conflicts, repo architecture, readiness matrix (this document).
- **Files:** `docs/roadmaps/ingramspark-distribution-target.md`
- **Dependencies:** None
- **Exclusions:** No production code, no `book.yml` enablement
- **Acceptance:** Document merged; conflicts recorded; pilot recommended
- **Tests:** N/A
- **Human review:** Approve safe defaults in §7–§8
- **Rollback:** Delete/revert doc
- **Size:** M (audit); XS remaining once merged

### INGRAM-002 — Configuration and schema design

- **Purpose:** Add opt-in `publishing.targets.ingramspark` + profile skeleton YAML/schema; validation; defaults disabled
- **Files likely:** `schema/book.schema.json`, `schema/profiles/ingramspark/*`, `tools/book_specs.py`, `tools/validate_book_specs.py`, `tests/test_validate_book_specs.py`
- **Dependencies:** INGRAM-001 (profile decisions)
- **Exclusions:** No exporters, no CI release ZIP, no book opt-in
- **Acceptance:** Invalid configs fail; absent target unchanged; ebook/print independent enable rules enforced in tests
- **Tests:** Schema unit tests; default-disabled; missing ISBN; duplicate ISBN
- **Human review:** Field naming (snake_case) sign-off
- **Rollback:** Revert schema; no books depend on it yet
- **Size:** S–M

### INGRAM-003 — Ebook production target

- **Purpose:** Specialized EPUB 3.0/3.0.0-compliant EPUB + RGB JPG; validate with pinned **current** EPUBCheck; exclude from website/manifests
- **Files likely:** `scripts/export_epub.py` or `scripts/export_ingramspark_epub.py`, `tools/epub-postprocess.py`, ebook preflight helpers, `Makefile`, CI install for pinned EPUBCheck, tests
- **Dependencies:** INGRAM-002
- **Exclusions:** Print PDF/cover; do not alter public EPUB bytes in place; do not pin EPUBCheck to obsolete 3.0.0 because of content wording
- **Acceptance:** Fixture book produces ISBN-named EPUB/JPG; preflight blocks on pixel/ISBN/EPUBCheck failures; manifests unchanged; profile separates content version from tool version
- **Tests:** Ebook-only opt-in; invalid EPUB; oversized image; missing covers; website-manifest exclusion
- **Human review:** Visual cover/front-matter
- **Rollback:** Feature-flag via target enabled false
- **Size:** M–L

### INGRAM-004 — Print-interior production target

- **Purpose:** (1) Isolated grayscale PDF/X color proof and account preflight; (2) then trim-aware interior PDF, grayscale/CMYK policy, page count, font/PDF checks
- **Files likely:** proof fixture + notes in profile YAML; new export script or flags on `export_pdf.py` / Typst path; color helpers; Makefile; tests
- **Dependencies:** INGRAM-002; profile color policy from INGRAM-001
- **Exclusions:** Cover generation; website formats; locking blocking PDF/X/ICC rules before the proof records an accepted construction
- **Acceptance:** Proof uploaded/inspected and profile updated; then `{isbn}_txt.pdf` with configured trim; page count emitted; B&W stays gray
- **Tests:** Wrong trim; RGB in grayscale interior; missing fonts; page count snapshot; proof inspection helpers
- **Human review:** Account preflight of the proof; printed/PDF proof of margins and gray conversion
- **Rollback:** Disable print.enabled
- **Size:** L (proof first, then exporter)

### INGRAM-005 — Print-cover workflow

- **Purpose:** Validate supplied wrap + `template-meta.yml`; page-count coupling; compare observed template trim to authoritative `print.trim`; barcode mode checks
- **Files likely:** `tools/ingramspark/cover_validate.py`, package script integration, fixture PDFs
- **Dependencies:** INGRAM-004 (page count + PDF/X proof gate complete enough for real interiors)
- **Exclusions:** Auto-generating wrap from front cover; Cover Template Generator automation; `template_trim` in `book.yml`
- **Acceptance:** Stale template page count fails with actionable message; trim mismatch vs `print.trim` / template-meta fails
- **Tests:** Wrong dimensions; stale page count; missing wrap; barcode mode
- **Human review:** Visual wrap proof
- **Rollback:** N/A beyond disabling print
- **Size:** M–L

**Raster full-wrap follow-on:** `print.cover.strategy: raster-wrap` converts a flattened PNG to `{isbn}_cvr.pdf` with exact pixel matching (no scaling). See [`docs/publishing/ingramspark-raster-wrap.md`](../publishing/ingramspark-raster-wrap.md).

### INGRAM-006 — Unified preflight framework

- **Purpose:** Profile-driven blocking/warning/manual report (JSON + text); ebook checks usable before print checks exist
- **Files likely:** `tools/ingramspark/preflight.py`, report schemas, tests
- **Dependencies:** INGRAM-003 for ebook path; INGRAM-004/005 checks integrated as they land (stubs OK early)
- **Exclusions:** Packaging ZIP (can emit reports without zip)
- **Acceptance:** Single preflight entrypoint; severities from profile; `--ebook-only` works without print assets
- **Tests:** Mixed fail/warn fixtures; ebook-only preflight
- **Human review:** Checklist wording
- **Rollback:** Revert tool; exporters still usable offline
- **Size:** M

### INGRAM-007 — Package assembly

- **Purpose:** ZIP layout, README-UPLOAD, package-manifest, checksums, determinism helpers; support ebook-only packages early
- **Files likely:** `scripts/package_ingramspark.py`, templates for README, tests
- **Dependencies:** Ebook path needs INGRAM-003 + ebook portion of INGRAM-006; full print path needs 004–006
- **Exclusions:** CI publish to GitHub Releases (that is INGRAM-008)
- **Acceptance:** Structure matches §18; derived `{book.id}-ingramspark.zip` name; checksums verify; README maps upload fields; ebook-only ZIP omits `print/`
- **Tests:** Deterministic manifest fields; checksum file; ebook-only/print-only contents
- **Human review:** README clarity
- **Rollback:** N/A
- **Size:** S–M

### INGRAM-008 — GitHub Release integration

- **Purpose:** PR artifacts; main `latest` ZIP attach; optional immutable tag; preserve website exclusion
- **Files likely:** `.github/workflows/book-export-release.yml`, `merge_release_assets.py`, `prepare_release_staging.sh`, `ci_affected_books.py`, tests
- **Dependencies:** INGRAM-007 (at least ebook-only packaging; full ZIP when print enabled)
- **Exclusions:** IngramSpark account automation; site changes beyond exclusion tests
- **Acceptance:** Opted-in book ZIP on release; manifests lack format; PR artifact present
- **Tests:** Merge allowlist; manifest exclusion; release inclusion
- **Human review:** Release asset naming
- **Rollback:** Revert workflow; ZIPs stop publishing
- **Size:** M

### INGRAM-009A — Everyone Knows Love ebook rehearsal

- **Purpose:** Early real-book feedback on metadata, EPUB ingestion, cover sizing, and ebook-only packaging—before PDF/X and wrap work
- **Files likely:** `books/everyone-knows-love/book.yml` (ebook target only), hi-res cover source, rehearsal notes
- **Dependencies:** INGRAM-002, INGRAM-003, ebook portion of INGRAM-006, minimal ebook-only INGRAM-007; human ebook ISBN + cover meeting pixel policy
- **Exclusions:** Print interior/cover; GitHub Release publication; immutable tags; enabling other books; `production-approved` for print
- **Acceptance:** Local or CI-artifact ZIP with EPUB, RGB JPG, reports, and metadata; automated ebook preflight + human visual review; optional ebook account upload/preflight
- **Status:** **Complete (2026-07)** — ebook ISBN `9798256206956`, `ebook-front.png` crop, packaging + account path exercised with 009B
- **Tests:** EKL ebook fixture assertions as applicable
- **Human review:** **Required** — ebook ISBN, hi-res cover, device/visual check
- **Rollback:** Set ebook.enabled false / status planning
- **Size:** M (engineering) + human-heavy for ebook assets

### INGRAM-009B — Everyone Knows Love full production pilot

- **Purpose:** Complete package (ebook + paperback print) and IngramSpark account upload/preflight
- **Files likely:** EKL `book.yml` print block, `assets/ingramspark/*`, production notes
- **Dependencies:** INGRAM-009A learning incorporated; INGRAM-004 (incl. PDF/X proof); INGRAM-005; full INGRAM-006/007; INGRAM-008; human manufacturing + wrap decisions
- **Exclusions:** Enabling other books until this gate passes
- **Acceptance:** Full ZIP passes automated preflight + human visual review; account upload/preflight for ebook and print as applicable; immutable release when submitting under ISBN
- **Status:** **Complete (2026-07)** — paperback ISBN `9798256206949`; assembled-raster-wrap cover accepted after ICC strip + Flate/Zip; interior DeviceGray package accepted; `status: production-approved` with `github_release` + `immutable_release` enabled.
- **Tests:** EKL full-package assertions as applicable
- **Human review:** **Required** — print manufacturing, wrap, account
- **Rollback:** Set print.enabled false / status planning
- **Size:** M (engineering) + human-heavy
### INGRAM-010 — Remaining two initial books

- **Purpose:** Opt in Observer Patterns and When Others Become Leaders after their distinct blockers
- **Dependencies:** INGRAM-009B pilot gate
- **Exclusions:** New exporter architecture beyond known poetry/Typst needs
- **Acceptance:** Explicit readiness status per book; packages when unblocked
- **Status:** **Complete (2026-07)** — Observer Patterns print-only package uploaded (`9798256208776`; `status: production-approved`; poetry EPUB optional). When Others Become Leaders print + ebook uploaded (`9798256208912` / `9798256208929`; `status: production-approved`).
- **Tests:** Per-book fixtures where automated
- **Human review:** Required per book
- **Size:** L

### INGRAM-011 — Documentation and operating procedure

- **Purpose:** Local workflow, proofing checklist, template refresh, release/submission process (including 009A vs 009B)
- **Files:** [`docs/publishing/ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md)
- **Dependencies:** INGRAM-009B (full procedure); draft notes may start after 009A
- **Exclusions:** Code changes
- **Acceptance:** Another book can be opted in without production code changes
- **Status:** **Complete (2026-07)** — operating procedure covers lifecycle, assets, page-count sync, package/upload, release flags, and gotchas for new opt-ins
- **Size:** S

---

## 27. Dependencies and parallelism

```text
INGRAM-001
    ↓
INGRAM-002
    ↓
INGRAM-003
    ↓
ebook preflight + ebook-only package (006/007 partial)
    ↓
INGRAM-009A  (EKL ebook rehearsal — local/CI artifact)
    ↓
INGRAM-004  (PDF/X proof first, then print interior) ── may start after 002;
    ↓         preferred after 009A so ebook lessons land first
INGRAM-005
    ↓
full preflight + package (006/007 complete)
    ↓
INGRAM-008
    ↓
INGRAM-009B  (EKL full production pilot + account upload)
    ↓
INGRAM-010
    ↓
INGRAM-011
```

**Safe parallel:** After INGRAM-002 and a shared frozen profile, early **INGRAM-004 proof scaffolding** may proceed beside **INGRAM-003**, but the production print exporter should not lock ICC/PDF/X blocking rules until the isolated proof completes. Prefer running **009A before deep print work** so metadata/EPUB/cover-sizing issues surface early.

**Do not parallelize invention of:** configuration schema, requirements constants, package layout, color-management policy, release naming.

INGRAM-005 depends on stable page count from INGRAM-004. Ebook-only packaging must not wait for INGRAM-005 or INGRAM-008.

---

## 28. Review gates

### Specification gate (before schema/implementation beyond skeleton)

- Current official sources recorded
- Conflicts documented
- Dated profile approved (safe defaults)
- Hard requirements separated from recommendations
- EPUB **content** version distinguished from pinned EPUBCheck **tool** version
- Initial print schema is paperback-only (`edition: paperback`); no `hardcover_isbn`
- Package name derived from `book.id`; template trim observed in `template-meta.yml` only

### Ebook gate (feeds INGRAM-009A)

- EPUB 3.0/3.0.0 content compliance + current pinned EPUBCheck pass
- RGB cover passes dimensions/metadata
- No website exposure
- Ebook-only package metadata reproducible

### PDF/X proof gate (first gate inside INGRAM-004)

- Minimal grayscale PDF/X candidate produced and inspected
- Proposed validators run
- Account preflight attempted when possible
- Accepted construction recorded in `ingramspark-2026-07.yml` before blocking exporter rules

### Print-interior gate (before cover production)

- Trim final; page count stable
- Fonts embedded; color mode correct
- PDF conformance understood per proven construction
- No crop/registration marks

### Cover gate (before full packaging)

- Template matches page count and manufacturing choices
- Observed template trim matches configured `print.trim`
- Full-wrap dimensions exact; CMYK verified
- Barcode plan valid
- Human visual proof approved

### Pilot gate A (ebook rehearsal — before deep print dependence)

- [x] EKL ebook-only ZIP generated (local or CI artifact)
- [x] Ebook automated preflight + human visual review passed
- [x] Optional ebook account preflight/upload lessons folded into profile/validators

### Pilot gate B (before other books)

- [x] One complete ebook+print package generated
- [x] Automated preflight + human visual review passed
- [x] IngramSpark account test upload/preflight passed (ideally)
- [x] Account rejections converted into profile/validator updates (cover ICC/LZW → DeviceCMYK + Flate; page-count sync)
---

## 29. Testing strategy

| Layer | Examples |
|-------|----------|
| Unit | Schema defaults; ISBN uniqueness; profile load; filename builders; color-space classifiers |
| Integration | Ebook-only / print-only / full package; merge_release_assets ZIP allowlist; manifest builders ignore target |
| Snapshot | `package-manifest.json` stable fields; preflight JSON shape; README sections |
| End-to-end | Tiny fixture books under `tests/fixtures/ingramspark/` — **not** the three full production books as sole fixtures |
| CI | Opt-in matrix flag; artifact upload path; exclusion tests on site action links |

Required cases from the prompt checklist are in scope: missing ISBN, duplicate ISBN, wrong cover dimensions, wrong page-count template, RGB in grayscale interior, RGB in CMYK cover, invalid EPUB, oversized EPUB image, missing internal/external cover, missing embedded fonts, wrong trim, website exclusion, release inclusion, checksums, stale template failure, successful package for pilot fixtures.

---

## 30. Risks and mitigations

| Risk | Mitigation | Detection |
|------|------------|-----------|
| Official requirements change | Dated profiles; re-audit on User Guide/FCG updates | Periodic source fetch; failed account upload |
| Conflicting official docs | Record conflicts; safer default; account verify | Profile `conflict_group` |
| PDF/X tool support weak in CI | Start with advisory veraPDF; pin Ghostscript; pilot upload | Preflight + account |
| Font embedding/licensing | `pdffonts` gate; license review for embeds | CI + human |
| Inconsistent color conversion | Pinned working profile; golden fixtures | Checksums + visual |
| ICC vs PDF/X confusion | Explicit policy in profile; pilot confirmation | Account preflight |
| Total ink coverage | Advisory measurement | GS inkcov / similar |
| Stale cover templates | Blocking page-count coupling | Preflight error string |
| Page-count drift | Interior freeze before template; fail on drift | Preflight |
| Barcode placement | Reserved area + visual checklist | Human + account |
| Incorrect ISBN use | Edition fields; equality checks | Schema + preflight |
| Public release exposure | Accept public GitHub assets; no site links | Manifest tests |
| Website leakage | Structural exclusion + tests | Site CI |
| Non-reproducible builds | tool-versions + input hashes + dirty detection | Manifest fields |
| Diagrams illegible in grayscale | Human proof; warn on complex images | Checklist |
| EPUB images over limits | 3.2M blocking | Preflight |
| False confidence from automation | Pilot upload gate; human review severities | Gates §28 |
| Docs ≠ ingestion | Convert rejections into validators | Pilot gate |
| CI runtime / tool install cost | Pin minimal tools; cache; optional veraPDF | Workflow timing |
| Large binary templates in Git | Prefer metadata + final wrap; Git LFS only if necessary | Repo size review |

---

## 31. Rollout strategy

1. Merge this plan; approve specification gate (including EPUB terminology, paperback-only schema, pilot split, PDF/X proof gate).
2. Implement INGRAM-002 (schema + profile skeleton) with no books enabled.
3. Land ebook pipeline (INGRAM-003) + ebook preflight/package; human ebook ISBN + hi-res cover for EKL.
4. **INGRAM-009A** ebook rehearsal (local/CI artifact) → fold lessons into profile/validators.
5. INGRAM-004 isolated PDF/X proof → record accepted construction → then print interior exporter.
6. Print-cover validation, full preflight/package, release integration.
7. Human manufacturing + wrap for EKL → **INGRAM-009B** full package → account upload/preflight.
8. Mark `production-approved` + immutable release when submitting.
9. Unblock Observer Patterns (EPUB/Typst) and WOBL (editorial print decisions) separately.
10. Publish operating procedure; opt in further books without code changes.

---

## 32. Operating procedure

(High level; INGRAM-011 expands.)

1. **Readiness audit** — `make preflight-ingramspark` (or audit mode) on book dir.
2. **Obtain ebook ISBN** — configure `ebook.isbn`; never reuse across formats.
3. **Produce ebook assets** — ensure cover meets pixel policy from true hi-res art.
4. **Ebook rehearsal (009A)** — ebook-only package (local/CI artifact); visual check; optional ebook account preflight.
5. **Freeze print interior** — finalize copy; generate print interior; note page count (after PDF/X proof gate exists).
6. **Obtain paperback ISBN + manufacturing choices** — `print.edition: paperback`, trim, paper, color, bleed, binding.
7. **Request Ingram template** — dashboard tool; save observed geometry in `template-meta.yml` (compare to `print.trim`).
8. **Design/supply wrap** — place `cover-wrap.pdf`; validate.
9. **Full package (009B)** — `make package-ingramspark`; inspect README and preflight.
10. **PR artifact / release review** — download ZIP from CI; confirm no website exposure.
11. **Human visual checklist** — ebook devices; print PDF; wrap safety/barcode area.
12. **Account upload rehearsal** — fix validators from failures.
13. **Production approve** — set status; immutable release; upload for real distribution.
14. **After revisions** — any interior page-count change invalidates template/wrap; re-run from step 5.

---

## 33. Definition of done (eventual implementation)

1. Existing books remain unaffected by default.
2. A book can opt into ebook, print, or both.
3. Schema distinguishes edition-specific ISBNs.
4. Ebook output satisfies the approved profile.
5. Ebook cover is front-only and RGB.
6. EPUB images remain RGB and within limits.
7. Print interior uses configured grayscale or CMYK mode.
8. Print cover is a valid full wrap in CMYK.
9. Cover dimensions match trim, binding, paper, and page count.
10. A stale cover template stops the build.
11. Fonts are embedded.
12. Required PDF checks pass.
13. Preflight emits JSON and human-readable reports.
14. ZIP includes every required file for enabled modes.
15. README maps files to IngramSpark upload fields.
16. Checksums and source commit are included.
17. Packages are available as PR artifacts.
18. Approved packages are attached to GitHub Releases.
19. Packages never appear on the website.
20. At least one pilot package passes an actual IngramSpark account upload or preflight. **Done (EKL, 2026-07).**
21. All three initial books have an explicit readiness status.
22. Observer Patterns can be packaged once its blockers are resolved. **Done for print (2026-07) — account-uploaded; `status: production-approved`. Ebook deferred.**
23. Everyone Knows Love can be packaged once its blockers are resolved. **Done — packaged and account-accepted; `status: production-approved`.**
24. When Others Become Leaders can be packaged once its blockers are resolved. **Done (2026-07) — print + ebook account-uploaded; `status: production-approved`.**
25. Process documented well enough to opt in another book without changing production code. **Done (2026-07) — [`docs/publishing/ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md).**

---

## 34. Implementation-readiness assessment

| Question | Answer |
|----------|--------|
| Is the plan ready for implementation? | **Yes** — core exporters/packaging shipped; initial books production-approved; operating procedure in [`docs/publishing/ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md) |
| Can any book be enabled now? | **Yes — all three initial books** are `production-approved` (EKL print+ebook; OP print; WOBL print+ebook). OP ebook/poetry EPUB still deferred. New house-default paperbacks follow the operating procedure |
| Highest technical risk | PDF/X ↔ ICC / output-intent conflict for interiors still advisory; cover DeviceCMYK-without-ICC path **account-accepted** on EKL, OP, and WOBL |
| Highest production risk | Stale cover templates / page-count drift after ISBN submission (mitigated by package-time cover page-count sync) |
| Spec gate | Approved; paperback-only schema and pilot split in use |
| Separate profile file needed now? | Profile lives at `schema/profiles/ingramspark/ingramspark-2026-07.yml` |

---

## 35. Recommended first implementation task

**INGRAM-002 — Configuration and schema design**

Add `publishing.targets.ingramspark` to [`schema/book.schema.json`](../../schema/book.schema.json) using the **paperback-only** print shape in §11.2, add `schema/profiles/ingramspark/ingramspark-2026-07.yml` skeleton with conflict-annotated thresholds from §7–§8 (including separate `epub_content_version` vs `epubcheck_tool_version` fields), extend validators/tests, keep every book disabled by default. Derive package artifact names from `book.id`; do not add configurable `artifact_name` or `hardcover_isbn` or `template_trim` in `book.yml`.

Do **not** start exporters until the schema/profile land and the specification gate is explicitly accepted.

---

## Appendix A — Approval states

Opt-in `enabled: true` alone is insufficient for production submission.

Minimal lifecycle (avoid a complex state machine):

| Status | Meaning |
|--------|---------|
| `planning` | Config/experiments; CI artifacts OK; loud warnings; no immutable production tag |
| `production-approved` | Human attested; allows immutable release path |

Optional future enrichments (`ebook-ready`, `cover-ready`, …) are **not** required if preflight already blocks incomplete packages. Prefer preflight truth over duplicated workflow states in `book.yml`.

---

## Appendix B — Working assumptions verification

| Assumption | Verdict |
|------------|---------|
| One reflowable EPUB + separate front JPG | **Confirmed** |
| RGB ebook images/cover; not CMYK | **Confirmed** |
| Internal cover in EPUB | **Confirmed** |
| Matching title/author/language/ISBN metadata | **Confirmed** |
| No print page numbers in ebook nav | **Confirmed** |
| File-size and image-pixel limits | **Confirmed** (pixel limit conflicting — see §7) |
| EPUB validation recommended/required language | **Confirmed** (tooling recommendation strong) |
| Interior PDF + separate full-wrap cover PDF | **Confirmed** |
| One-up pages; embedded fonts; no marks | **Confirmed** |
| Exact trim/bleed geometry | **Confirmed** |
| Grayscale for B&W; CMYK for color interiors; CMYK cover | **Confirmed** |
| PDF/X-compatible output | **Confirmed** (stated) |
| Page-count-dependent cover dimensions | **Confirmed** |
| Barcode or reserved area | **Confirmed** |
| Cover-template compatibility | **Confirmed** (strongly recommended / practically required) |

---

## Appendix C — Local developer ergonomics (command sketch)

```bash
# Readiness / preflight
make preflight-ingramspark BOOK_DIR=books/everyone-knows-love

# Partial builds
uv run python scripts/package_ingramspark.py books/everyone-knows-love --ebook-only
uv run python scripts/package_ingramspark.py books/everyone-knows-love --print-only
uv run python scripts/package_ingramspark.py books/everyone-knows-love --validate-cover

# Full package
make package-ingramspark BOOK_DIR=books/everyone-knows-love

# Inspect
unzip -l build/ingramspark/everyone-knows-love/everyone-knows-love-ingramspark.zip
sha256sum -c checksums.sha256

# Compare to prior release asset (future helper)
uv run python scripts/compare_ingramspark_packages.py a.zip b.zip
```

Errors must be actionable (page-count mismatch example in §16), never generic “Cover validation failed.”

---

## Appendix D — Confirmation of planning-only change

This document is the sole intended repository change for the planning task. No production exporters, `book.yml` opt-ins, GitHub Actions, or website code were modified as part of producing this plan.
