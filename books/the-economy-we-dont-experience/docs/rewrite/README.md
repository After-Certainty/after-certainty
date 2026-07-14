# Parallel Rewrite Workspace

**Book:** *The Economy We Don't Experience*  
**Status:** Planning / stubs only — **not** for publication  
**Branch family:** `cursor/economy-parallel-rewrite-*`

This directory holds a **parallel rewrite** of the published manuscript. The production source of truth remains:

- [`../../index.md`](../../index.md)
- [`../../front-matter/`](../../front-matter/)
- [`../../parts/`](../../parts/)
- [`../../back-matter/`](../../back-matter/)
- [`../../book.yml`](../../book.yml)

## Non-publication guarantee

- There is **no** `book.yml` or `index.md` in this folder.
- These files are **not** linked from the production `index.md`.
- Export assembly ([`scripts/assemble.py`](../../../../scripts/assemble.py)) only follows links from `index.md`.
- Publication validation forbids `docs/` paths in the manuscript TOC.
- Do **not** move rewrite prose into `parts/`, `front-matter/`, or `back-matter/` until every section is **Approved** and migration is explicitly authorized.

Parent-book CI may rebuild when any file under this book changes. That rebuild does **not** include rewrite stubs in DOCX/EPUB/PDF.

## Contents

| File | Role |
|------|------|
| [`rewrite-plan.md`](rewrite-plan.md) | Full rewrite architecture, voice, gates, migration |
| [`citation-audit.md`](citation-audit.md) | Citation map from current units → new destinations |
| [`migration-map.md`](migration-map.md) | Section-by-section preserve / move / condense |
| [`status.md`](status.md) | Stub → Migrated tracker |
| `introduction.md` … `appendix.md` | Chapter stubs (planning metadata; not polished prose) |

## Incoming chapter intake (author-provided prose)

When the author provides a chapter (or bridge) draft for this workspace, apply these edits before marking the unit Drafted:

1. **Pandoc citations** — Convert any inline parenthetical, bracketed, or prose-style sources to repository Pandoc footnotes: `[^unit-slug]` at the factual hinge, with matching definitions at the bottom of the unit (Chicago-ish note text). Sync new works into the citation audit / eventual bibliography. Do not leave `(BLS 2023)`-style or hyperlink-only citations in body prose. Prefer chapter-scoped IDs (`intro-…`, `c1-…`, etc.). See production [`docs/agents/05-citation-pass.md`](../agents/05-citation-pass.md).
2. **No single-sentence staccato** — Merge stacks of one-sentence paragraphs into flowing multi-sentence paragraphs. Keep an occasional short paragraph only when it earns emphasis; do not default to a telegram rhythm. Source Markdown: one flowing line per paragraph, blank line between paragraphs.
3. Preserve the chapter’s argument and examples; do not replace production files.

## Drafting order (after stubs)

Reading order (bridges open each part after the preceding unit):

1. Introduction — The Chart and the Receipt  
2. Part I Bridge — The Economy We Describe  
3. Chapters 1–3  
4. Part II Bridge — What Travels  
5. Chapters 4–5  
6. Part III Bridge — Leadership in a Compressed World  
7. Chapters 6–7  
8. Part IV Bridge — What Holds  
9. Chapter 8  
10. Conclusion  

Bridges target **~500–900 words**: shift attention; do not summarize the prior part or preview every chapter.

1. Confirm migration map + citation audit cover every production unit.
2. Draft **Introduction** first; treat it as the voice model.
3. Review and revise the Introduction before drafting further.
4. Draft **Part I bridge**, then **Chapter 1**; review Introduction + bridge + Chapter 1 together.
5. Draft remaining units in reading order (insert each part bridge before that part’s chapters); update `status.md` after each step.
6. Do **not** bulk-rewrite the whole book in one pass.
7. Production manuscript stays unchanged until the migration gate.
8. For every author-supplied chapter, run the **Incoming chapter intake** checks above.

## Migration gate

Replace production chapters only when:

- every required section is **Approved**
- citation audit is resolved
- bibliography is reconciled
- consecutive read-through passes
- `make build-book` (or equivalent) succeeds for the migrated manuscript
- the author explicitly authorizes migration

Until then, treat this folder as a sandbox.
