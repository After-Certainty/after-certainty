# After Certainty — Metadata pass (post pass 2)

**Branch:** `after-certainty/metadata-from-manuscript`  
**Prerequisite:** Editorial feedback pass 2 merged (PR #113).

## Goal

Align publishing metadata, portfolio manifests, and status docs with the **current manuscript** in `books/after-certainty/`—not the stale `upcoming/` snapshot or pre–pass 2 word bands.

## Source of truth

| Field | Derive from |
|-------|-------------|
| Description / subtitle | Introduction, how-to-read, conclusion, pattern-language |
| Edition band | Word count of `books/after-certainty/**/*.md` (exclude `docs/`, generated title/copyright) |
| Structure | `index.md` (three parts, bridges, Appendix A) |
| Patterns | `docs/pattern-language.md`, Appendix A |

## Checklist

### Canonical book (`books/after-certainty/`)

- [x] `book.yml` — `book.description` and edition band in description
- [x] `docs/status.md` — phase, branch, unit notes, word counts
- [x] `docs/drafting-process.md` — current phase pointer

### Portfolio / site feeds

- [x] Regenerate `docs/portfolio-audit/data/books-manifest.json`
- [x] Regenerate `docs/portfolio-audit/data/semantic-manifest.json`
- [x] `docs/portfolio-reader-map.md` — link to `books/after-certainty`, post–pass 2 status
- [x] `upcoming/docs/portfolio-status.md` — word count + pass 2 note for After Certainty row

### Deferred (separate PRs)

- [ ] Remove or archive `upcoming/after-certainty/` duplicate (manifest currently lists both `books` and `upcoming` entries)
- [ ] Promote book-local patterns from `docs/pattern-language.md` into `semantic/patterns/` if site ontology should expose them
- [ ] Author read-through gate sign-off → release tag + export artifacts on GitHub
- [ ] `after-certainty.com` copy aligned with refreshed description (issue #18 in portfolio audit)

## Word count reference (May 2026)

Rough markdown token count (all manuscript `.md` under `books/after-certainty/`, excluding `docs/`):

| Scope | ~Words |
|-------|--------|
| Full manuscript (incl. bibliography, index hub) | 13,870 |
| Readable prose (excl. bibliography) | 13,405 |
| Chapters + bridges + front/back (excl. bib, index) | ~13,235 |

**Edition band (locked for metadata):** ~13–14k words (expanded essay with Appendix A and part bridges).

## Description draft (canonical)

> Practice capstone for living and judging after understanding stops delivering relief—three movements from letting go, through what can still be practiced, to living with limits, with a shared vocabulary of stabilizers that drift, counter-disciplines, and environmental pressures. Read after the portfolio's diagnostic volumes; orientation without closure.
