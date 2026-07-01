# Legacy Book Structure Audit

**Date:** 2026-07-01  
**Scope:** All published manuscripts under `books/` (25 `index.md` hubs including `when-others-look-to-you/v1` and `v2`)  
**Automation:** [`tools/audit_book_structure.py`](../../tools/audit_book_structure.py)  
**Canonical reference:** [`books/after-certainty/index.md`](../../books/after-certainty/index.md)

This audit identifies books that predate the house layout (`front-matter/`, `parts/` or `manuscript/act-*`, `back-matter/`, and `## Part` / `## Act` headings in `index.md`). It proposes part structures and migration checklists for six legacy titles. Restructuring is tracked in follow-up PRs (one book per PR where possible).

---

## House standard

`index.md` is the source of truth. [`scripts/assemble.py`](../../scripts/assemble.py) treats only `## Part …` and `## Act …` as per-section export boundaries—not `### Part` subheadings or `## Sections`.

| Criterion | Organized | Legacy |
|-----------|-----------|--------|
| `index.md` uses `## Front Matter` | Yes | Flat bullet list or mixed |
| Body uses `## Part I — …` (or `## Act I — …` for fiction) | Yes | `## Sections` or `### Part` subheadings |
| Chapters under `parts/part-N-slug/` (nonfiction) or `manuscript/act-N-slug/` (fiction) | Yes | Numbered `NN-*.md` at book root |
| Closing material under `back-matter/` with `## Back Matter` | When applicable | At book root or inline in flat TOC |
| Part openers as `bridge.md` beside chapters | Yes | Separate `NN-part-i-*.md` dividers or none |

Fiction (`the-relay`, `boundary-conditions`, `velorum`) uses `manuscript/act-N-slug/` with Part or Act headings and is already organized.

---

## Full portfolio matrix

Run: `python3 tools/audit_book_structure.py`

| Slug | Status | Front Matter | Part/Act (##) | parts/ | manuscript/ | back-matter/ | Notes |
|------|--------|:------------:|:-------------:|:------:|:-----------:|:------------:|-------|
| after-certainty | organized | ✓ | 3 | ✓ | | ✓ | |
| before-certainty-arrives | organized | ✓ | 3 | ✓ | | ✓ | |
| boundary-conditions | organized | ✓ | 5 | | ✓ | | Fiction |
| coupling | **legacy-partial** | ✓ | 5 | | | | `part-NN-*` at root; back files at root |
| curiosity-before-certainty | organized | ✓ | 5 | ✓ | | ✓ | |
| how-meaning-moves | **legacy-partial** | | 0 | ✓ | | ✓ | Flat `### Contents` TOC |
| how-serious-systems-learn | **legacy-flat** | ✓ | 0 | | | | `### Part` only; 22 numbered root files |
| how-trust-forms | organized | ✓ | 3 | ✓ | | ✓ | |
| living-in-sediment | organized | ✓ | 4 | ✓ | | ✓ | |
| the-discipline-of-uncertainty | organized | ✓ | 6 | ✓ | | ✓ | |
| the-economy-we-dont-experience | organized | ✓ | 4 | ✓ | | ✓ | |
| the-relay | organized | ✓ | 5 | | ✓ | | No back matter yet (WIP) |
| trust-beyond-similarity | organized | ✓ | 3 | ✓ | | ✓ | |
| velorum | organized | ✓ | 5 | | ✓ | | Fiction |
| when-accountability-no-longer-expires | organized | ✓ | 4 | ✓ | | ✓ | |
| when-authority-is-misread | **legacy-flat** | | 0 | | | | `## Sections`; 15 root files |
| when-authority-outlives-accountability | **legacy-flat** | | 0 | | | | `## Sections`; 17 root files |
| when-incentives-become-the-moral-language | organized | ✓ | 2 | ✓ | | ✓ | |
| when-interpretation-no-longer-matters | organized | ✓ | 4 | ✓ | | ✓ | |
| when-moral-seriousness-scales | **legacy-flat** | | 0 | | | | `## Sections`; part dividers at root |
| when-others-look-to-you/v1 | organized | ✓ | 5 | ✓ | | ✓ | |
| when-others-look-to-you/v2 | organized | ✓ | 4 | ✓ | | ✓ | |
| when-trust-stops-tracking-reality | organized | ✓ | 3 | ✓ | | ✓ | |
| why-collaboration-is-so-hard | organized | ✓ | 4 | ✓ | | ✓ | |
| why-diversity-matters | organized-minor | ✓ | 3 | ✓ | | | No `## Back Matter` (essay length) |

**Summary:** 18 organized, 1 minor gap, 6 legacy (3 flat imports + 3 partial).

---

## Recommended fix order

1. **Tier A — flat imports** (authority cluster): `when-authority-outlives-accountability` → `when-authority-is-misread` → `when-moral-seriousness-scales`
2. **Tier B — partial:** `how-meaning-moves` (index only) → `how-serious-systems-learn` → `coupling`

---

## Proposed structures (Tier A)

### 1. When Authority Outlives Accountability

**Front matter** (`front-matter/`):

| Source (root) | Target |
|---------------|--------|
| `01-authors-note.md` | `front-matter/authors-note.md` |
| `02-preface.md` | `front-matter/preface.md` |
| `03-introduction.md` | `front-matter/introduction.md` |
| `04-how-to-read-this-book.md` | `front-matter/how-to-read-this-book.md` |

**Part I — The Three Dimensions** → `parts/part-1-the-three-dimensions/`

- `bridge.md` (new stub)
- `chapter-1-why-leadership-evaluation-fails.md` ← `05-chapter-1-*.md`
- `chapter-2-moral-posture-toward-harm.md` ← `06-chapter-2-*.md`
- `chapter-3-effectiveness.md` ← `07-chapter-3-*.md`
- `chapter-4-legitimacy-transfer.md` ← `08-chapter-4-*.md`

**Part II — Integration and Use** → `parts/part-2-integration-and-use/`

- `bridge.md` ← `09-interlude.md`
- `chapter-5-the-integrated-model.md` ← `10-chapter-5-*.md`
- `chapter-6-leadership-at-human-scale.md` ← `11-chapter-6-*.md`
- `chapter-7-deferred-effectiveness.md` ← `12-chapter-7-*.md`
- `chapter-8-using-the-lens.md` ← `13-chapter-8-*.md`

**Back matter** (`back-matter/`):

| Source | Target |
|--------|--------|
| `14-afterword.md` | `back-matter/afterword.md` |
| `15-appendix-a.md` | `back-matter/appendix-a.md` |
| `16-acknowledgements.md` | `back-matter/acknowledgements.md` |
| `17-notes.md` | `back-matter/notes.md` |

---

### 2. When Authority Is Misread

**Front matter:**

| Source | Target |
|--------|--------|
| `01-authors-note.md` | `front-matter/authors-note.md` |
| `02-introduction-why-leaders-are-misread.md` | `front-matter/introduction.md` |

**Part I — How Authority Gets Misread** → `parts/part-1-how-authority-gets-misread/`

- `bridge.md` (new stub)
- Ch 1–4 ← `03`–`06-chapter-*.md`

**Part II — Leaders Under Two Lenses** → `parts/part-2-leaders-under-two-lenses/`

- `bridge.md` (new stub)
- Ch 5–11 ← `07`–`13-chapter-*.md`

**Part III — Looking Twice** → `parts/part-3-looking-twice/`

- `bridge.md` (new stub)
- Ch 12–13 ← `14`–`15-chapter-*.md`

No back matter files today; omit `## Back Matter` until bibliography is drafted.

---

### 3. When Moral Seriousness Scales

**Front matter:** `01-authors-note`, `02-preface`, `03-introduction` → `front-matter/`

| Part | Folder | Bridge source | Chapters |
|------|--------|---------------|----------|
| Part I — The Human-Scale Model | `parts/part-1-the-human-scale-model/` | `04-part-i-*.md` | `05`–`07` |
| Part II — What Scale Changes | `parts/part-2-what-scale-changes/` | `08-part-ii-*.md` | `09`–`11` |
| Part III — The Pressure Point | `parts/part-3-the-pressure-point/` | `12-part-iii-*.md` | `13`–`14` |
| Part IV — What Remains Possible | `parts/part-4-what-remains-possible/` | `15-part-iv-*.md` | `16`–`17` |

**Back matter:** `18-conclusion.md` → `back-matter/conclusion.md`

---

## Proposed structures (Tier B)

### 4. How Meaning Moves

Index restructure + bridge rename only (`parts/` already exists):

- Add `## Front Matter`, four `## Part I–IV` sections, `## Back Matter`
- Rename `part-i-the-three-forces.md` (etc.) → `bridge.md` in each part folder

| Part | Chapters |
|------|----------|
| Part I — The Three Forces | 1–3 |
| Part II — Speaking and Listening Under Pressure | 4–6 |
| Part III — Familiar Situations | 7–10 |
| Part IV — What This Lens Changes | 11–14 |

---

### 5. How Serious Systems Learn

| Part | Bridge source | Chapters (root → `parts/`) |
|------|---------------|----------------------------|
| Part I — Why Knowing No Longer Governs Outcomes | `01-part-i-bridge-*.md` | `02`–`04` |
| Part II — Disciplines That Survived Reality | `05-part-ii-bridge-*.md` | `06`–`10` |
| Part III — What These Disciplines Share | `11-part-iii-bridge-*.md` | `12`–`14` |
| Part IV — When Disciplines Fail | `15-part-iv-bridge-*.md` | `16`–`18` |
| Part V — After Certainty | `19-part-v-bridge-*.md` | `20`–`21` |

**Front matter:** `acknowledgments.md`, `about-the-author.md` → `front-matter/`  
**Back matter:** `reader-guide.md`, `22-coda-operating-commitments.md`, `bibliography.md` → `back-matter/`  
**Out of index:** `export-order.md`, `manuscript-order.md`, `proposal.md` → `docs/`

---

### 6. Coupling

**Front matter (root → `front-matter/`):** `authors-note`, `preface`, `typographical-conventions`, `introduction`, `prologue`

**Parts (root `part-NN-*` → `parts/part-N-slug/`):**

| Current | Target |
|---------|--------|
| `part-01-the-structural-grammar/` | `parts/part-1-the-structural-grammar/` |
| `part-02-software-as-early-laboratory/` | `parts/part-2-software-as-early-laboratory/` |
| `part-03-ai-and-structural-entropy/` | `parts/part-3-ai-and-structural-entropy/` |
| `part-04-institutions-under-drift/` | `parts/part-4-institutions-under-drift/` |
| `part-05-oscillation-and-design/` | `parts/part-5-oscillation-and-design/` |

**Interlude:** keep `## Interlude` section; `interlude-coherence-under-scale.md` at book root or under `parts/`

**Back matter:** `epilogue-stay-cohesive-stay-close.md`, `glossary.md`, `bibliography.md` → `back-matter/`

---

## Per-book migration checklist

For each legacy title:

1. `git mv` files per tables above
2. Rewrite `index.md` using [`after-certainty/index.md`](../../books/after-certainty/index.md) as template
3. Add minimal `docs/book-rules.md` for Tier A authority books (missing today)
4. Grep repo for stale paths: `rg "books/<slug>/"` and numbered root filenames
5. Smoke test: `python3 scripts/assemble.py books/<slug>` (or book build script)
6. Re-run: `python3 tools/audit_book_structure.py --legacy-only` (expect zero legacy)

---

## Out of scope

- Fiction back matter for incomplete manuscripts (`the-relay`)
- `why-diversity-matters` back matter unless author confirms closing artifacts
- Prose rewrites or substantive new bridge copy (stubs only where missing)
