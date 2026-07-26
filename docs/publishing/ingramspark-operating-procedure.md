# IngramSpark operating procedure

How to opt a book into IngramSpark packaging and submit it. Use this for **new** titles; the three initial pilots (Everyone Knows Love, Observer Patterns, When Others Become Leaders) are already `production-approved`.

**Authority:** design and gates live in [`docs/roadmaps/ingramspark-distribution-target.md`](../roadmaps/ingramspark-distribution-target.md).  
**Cover mechanics:** [`docs/publishing/ingramspark-raster-wrap.md`](ingramspark-raster-wrap.md).  
**Profile:** [`schema/profiles/ingramspark/ingramspark-2026-07.yml`](../../schema/profiles/ingramspark/ingramspark-2026-07.yml).

IngramSpark is an opt-in `publishing.targets.ingramspark` path. It does **not** become a website download format. There is **no** in-repo account upload — you download the ZIP and upload in the IngramSpark portal.

---

## 1. Decide the edition shape

| Mode | When to use | Pilots |
|------|-------------|--------|
| Print + ebook | Standard Pandoc prose books with a public EPUB path | EKL, WOBL |
| Print only | Poetry / Typst (or any book without an Ingram ebook exporter yet) | Observer Patterns |

Do **not** invent placeholder ISBNs. Assign real edition ISBNs before a submission kit:

- Paperback ISBN → `print.isbn` and `{isbn}_txt.pdf` / `{isbn}_cvr.pdf`
- Ebook ISBN → `ebook.isbn` (must differ from print) when ebook is enabled
- List them under `book.isbns` as well

Initial schema is **paperback only** (6×9 perfect-bound cream, B&W interior, no bleed is the house default). Hardcover is out of scope until the schema grows multi-edition print.

---

## 2. Lifecycle (do not skip)

```
planning  →  package / proof / account upload  →  production-approved
```

| Status | Use for | Release flags |
|--------|---------|---------------|
| `planning` | Assets, cover preview, local/CI kits, account dry-runs | Keep `github_release` and `immutable_release` **false** until you mean it |
| `production-approved` | Human attested after account acceptance | Turn on `github_release` / `immutable_release` as desired |

| Flag | Effect on `main` |
|------|------------------|
| `github_release: true` | Attach `{book.id}-ingramspark.zip` to the rolling GitHub `latest` release |
| `immutable_release: true` | Also publish tag `ingramspark/<book-id>/<print-isbn>` (requires `production-approved` + clean tree) |

Preview ZIPs (`*-ingramspark-preview.zip`, planning without print ISBN) never attach to releases.

---

## 3. Minimal `book.yml` skeleton

Start disabled-by-default patterns from an existing pilot, then customize. Print + ebook:

```yaml
publishing:
  targets:
    ingramspark:
      enabled: true
      specification_profile: ingramspark-2026-07
      status: planning
      package:
        github_release: false
        immutable_release: false
      ebook:
        enabled: true
        isbn: "YOUR_EBOOK_ISBN"
        format: reflowable
        cover_source: assets/ingramspark/ebook-front.png
      print:
        enabled: true
        edition: paperback
        isbn: "YOUR_PRINT_ISBN"
        binding: perfect-bound
        trim:
          width_inches: 6.0
          height_inches: 9.0
        interior:
          color_mode: black-and-white
          paper: cream
          bleed: false
        cover:
          strategy: assembled-raster-wrap
          template_metadata: assets/ingramspark/template-meta.yml
          template_page_count: 0   # replace with measured even page count
          barcode_mode: ingram-generated
          assets:
            back: assets/ingramspark/back.png
            spine: assets/ingramspark/spine.png
            front: assets/ingramspark/front.png
```

Print-only: set `ebook.enabled: false` and omit ebook ISBN / `cover_source`.

Cover-preview before ISBNs: keep `status: planning`, omit `print.isbn`, force both release flags false. Package writes a preview ZIP only.

Validate:

```bash
make validate-book-specs
```

---

## 4. Cover assets

Preferred strategy: **`assembled-raster-wrap`** (separate panels).

```
books/<book-id>/assets/ingramspark/
├── back.png
├── spine.png
├── spine-source.png    # wider master; required for page-count sync
├── front.png
├── ebook-front.png     # print+ebook only (bleed-free 6×9 @ 300 ppi)
├── template-meta.yml
└── README.md           # optional but useful
```

Assembly order is always **back → spine → front**. Pixel sizes must match `template-meta.yml` exactly (converter never scales).

### Generate from `book-cover.png` (common path)

Measure (or estimate) an even cream page count first, then:

```bash
# Print + ebook
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/<book-id> --page-count <N> --ebook-front

# Optional labeled spine (title/author); default is cover-pattern strip
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/<book-id> --page-count <N> --ebook-front --spine-style labeled

# Print only
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/<book-id> --page-count <N>
```

Then build the cover PDF:

```bash
make build-ingramspark-print-cover DIR=books/<book-id>
make validate-ingramspark-print-cover DIR=books/<book-id>
```

Details (bleed ownership, barcode reserve, inspection overlay): [`ingramspark-raster-wrap.md`](ingramspark-raster-wrap.md).

**Barcode:** house default is `ingram-generated` — leave a clear ≈1.75″×1″ reserve on the back; do not draw a barcode in the PNG.

**Spine text:** Ingram forbids spine text on paperbacks under 48 pages. Keep `spine_text: false` below that threshold.

---

## 5. Build, measure, sync page count

```bash
make export-ingramspark-print DIR=books/<book-id>
# If ebook enabled:
make export-ingramspark-epub DIR=books/<book-id>
```

Notes:

- Odd interiors are padded with one blank page so the submitted count is **even** (Ingram range 18–1050).
- Use the **post-pad** page count for spine width and `template_page_count`.
- Local XeLaTeX and CI can differ by a page or two. Prefer the **CI-measured** count before freezing production.

At package time, if `assembled-raster-wrap` and the measured interior disagree with `template_page_count`, packaging rewrites `book.yml`, `template-meta.yml`, and center-crops `spine.png` from `spine-source.png`. That dirties the git tree.

**Before immutable release:** commit the measured page count / spine / template-meta so packaging is a no-op and `dirty_tree` stays false.

Cream spine rule of thumb (also used by the generator/sync): **0.0025 in per page** at 300 ppi.

---

## 6. Preflight and package

```bash
make preflight-ingramspark DIR=books/<book-id>
make package-ingramspark DIR=books/<book-id>

# Modes when only one edition is ready:
make package-ingramspark DIR=books/<book-id> EBOOK_ONLY=1
make package-ingramspark DIR=books/<book-id> PRINT_ONLY=1
```

Outputs under `build/ingramspark/<book-id>/`:

| Artifact | Role |
|----------|------|
| `{book.id}-ingramspark.zip` | Submission kit (or `*-preview.zip` without print ISBN) |
| `README-UPLOAD.txt` | Maps kit files → IngramSpark upload fields |
| Preflight JSON/text | Blocking / warning / human-review lists |

Open the ZIP and walk `README-UPLOAD.txt` before uploading.

---

## 7. Human proofing checklist

Local preflight passing is necessary, not sufficient. Account ingestion can still reject files.

### Ebook (when enabled)

- [ ] EPUB opens; title/author match the cover JPG
- [ ] Cover JPG is front-only (no wrap, no spine)
- [ ] EPUBCheck clean via preflight (`make install-epubcheck` if needed)
- [ ] Spot-check TOC / front matter on a device or reader

### Print

- [ ] Interior PDF: trim, margins, grayscale, intentional blank pages look right
- [ ] Cover PDF: wrap reads back→spine→front; spine title orientation OK
- [ ] Barcode reserve on the back is empty (Ingram will place the barcode)
- [ ] No inspection guides / template pink-blue layers in the production PDF
- [ ] Soft-proof; order a physical proof after account acceptance

### Portal / manufacturing

- [ ] IngramSpark title metadata matches ISBN, trim, paper, binding, interior color
- [ ] Cover Template Generator page count / trim / bind matches the **submitted** PDF page count  
  ([Cover Template Generator](https://myaccount.ingramspark.com/Portal/Tools/CoverTemplateGenerator))
- [ ] Template page count is for the PDF **as submitted** (not a post-Ingram barcode page)

---

## 8. Account upload and approval flip

1. Upload interior + cover (+ ebook EPUB/JPG if enabled) from the ZIP.
2. Resolve any account warnings. Known cover construction (already accepted on pilots): DeviceCMYK + Flate/Zip after working-ICC conversion and per-object ICC strip — see profile `print.cover_raster`.
3. When the title is accepted and you are ready for release attach:

```yaml
status: production-approved
package:
  github_release: true
  immutable_release: true   # optional; requires clean tree
```

4. Commit measured cover page counts so CI packaging does not rewrite tracked files.
5. Merge to `main`. Rolling `latest` picks up the ZIP when `github_release` is true; immutable tags follow the planner when `immutable_release` + `production-approved` + clean tree.

Interior PDF/X / output-intent rules remain **advisory** in the profile (`account-verification-needed`). Production interiors ship as DeviceGray. Optional experiment: `APPLY_PDFX=1 make export-ingramspark-print DIR=…`.

---

## 9. CI behavior (what you get without local work)

| Workflow | When | What |
|----------|------|------|
| `book-export-release.yml` | PR + `main` for affected opted-in books | Builds public formats, packages IngramSpark ZIP, uploads workflow artifact `ingramspark-<slug>` |
| Same, on `main` only | Release jobs | Attaches ZIP to `latest` if `github_release`; publishes immutable tags per plan |
| `ingramspark-preview.yml` | Planning print **without** ISBN | Preview ZIP artifact only (not a submission kit) |

---

## 10. End-to-end command cheat sheet

```bash
# 1) Specs
make validate-book-specs

# 2) Assets (from book-cover.png)
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/<book-id> --page-count <N> --ebook-front

# 3) Cover PDF
make build-ingramspark-print-cover DIR=books/<book-id>

# 4) Interiors
make export-ingramspark-print DIR=books/<book-id>
make export-ingramspark-epub DIR=books/<book-id>    # if ebook.enabled

# 5) Kit
make preflight-ingramspark DIR=books/<book-id>
make package-ingramspark DIR=books/<book-id>

# 6) After account acceptance: flip status + release flags, commit
#    measured template_page_count / spine / template-meta, merge to main
```

Outputs: `build/ingramspark/<book-id>/`.

---

## 11. Gotchas (read once)

| Issue | What to do |
|-------|------------|
| Page count drift (local vs CI) | Prefer CI-measured even count; commit it before immutable release |
| `dirty_tree` blocks immutable tag | Commit sync rewrites; packaging uses `git status --untracked-files=no` |
| Missing / narrow `spine-source.png` | Package-time spine recrop fails when page count changes |
| Wrong panel pixels | Hard fail — fix PNG or template-meta; never silent resample |
| Spine text &lt; 48 pages | Keep `spine_text: false` |
| Poetry / Typst ebook | Keep `ebook.enabled: false` until a poetry EPUB path exists |
| EPUBCheck vs “EPUB 3.0” | Content must be 3.0-compliant; tool version is pinned separately |
| Placeholder ISBNs | Forbidden — omit print ISBN only for planning preview |

---

## 12. When you need production code changes

You should **not** need exporter work for another 6×9 cream paperback on the Pandoc path with `assembled-raster-wrap`.

You **do** need engineering if:

- Trim, paper, color interior, hardcover, or jacket/case laminate differs from the house default
- The book needs a new ebook exporter (e.g. Typst poetry EPUB)
- Account rejection implies a profile rule change (record it in `ingramspark-2026-07.yml` with confidence notes)

Otherwise: ISBNs + assets + `book.yml` + this procedure.
