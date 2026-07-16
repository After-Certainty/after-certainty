# Phase 5 — Promote to `books/`

**Book:** *The Game We Think We Saw*  
**Date:** 2026-07-16  
**Branch:** `cursor/the-game-we-think-we-saw-draft-ff5b`

## Decision

Author instruction “Next phase” treated as go-ahead for promote packaging. Length band locked as **practice/mid** (~26.5k body, excl. footnotes) per Phase 4 recommendation.

## Done

- Moved `upcoming/the-game-we-think-we-saw/` → `books/the-game-we-think-we-saw/`
- Replaced `upcoming.yml` with `book.yml` (`publishing.enabled: true`; docx + epub + pdf; `interior_finish: true`; About the Series generated to `back-matter/`)
- Cover + OG assets retained (`book-cover.png`, `open-graph.png`)
- Updated `index.md` Related books paths for `books/` layout
- Catalog updates: series guide, reader map, upcoming portfolio dashboard / README, book status docs

## Validation targets

- `make validate-book-specs`
- `make validate-publication-manuscript DIR=books/the-game-we-think-we-saw`
- `make export-docx DIR=books/the-game-we-think-we-saw`
