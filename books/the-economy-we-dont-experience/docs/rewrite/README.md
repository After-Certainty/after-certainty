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

## Drafting order (after stubs)

1. Confirm migration map + citation audit cover every production unit.
2. Draft **Introduction** first; treat it as the voice model.
3. Review and revise the Introduction before drafting further.
4. Draft **Chapter 1**; review Introduction + Chapter 1 together.
5. Draft remaining units in reading order; update `status.md` after each step.
6. Do **not** bulk-rewrite the whole book in one pass.
7. Production manuscript stays unchanged until the migration gate.

## Migration gate

Replace production chapters only when:

- every required section is **Approved**
- citation audit is resolved
- bibliography is reconciled
- consecutive read-through passes
- `make build-book` (or equivalent) succeeds for the migrated manuscript
- the author explicitly authorizes migration

Until then, treat this folder as a sandbox.
