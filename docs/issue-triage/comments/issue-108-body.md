## Context

Prerequisite satisfied: [`docs/series-guide.md`](https://github.com/ksteffe/after-certainty/blob/main/docs/series-guide.md) defines reading order and clusters. `companionOf` / `companionBooks` already ship in the manifest via `book.yml`.

## Scope

- Extend [`schema/books-manifest.schema.json`](https://github.com/ksteffe/after-certainty/blob/main/schema/books-manifest.schema.json)
- Populate from `docs/series-guide.md` in [`tools/generate_books_manifest.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/generate_books_manifest.py) via [`tools/series_order.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/series_order.py)
- Validate in CI

## Deliverables

**Manifest root:**
- `readingOrders.core` — 8-book suggested arc
- `readingOrders.trust` — trust cluster arc

**Per book (when applicable):**
- `readingOrder` — 1-based position in core arc
- `relatedSlugs` — cluster and reading-order peers from series guide

## Status

Implementation in progress (see linked PR). Close when merged and CI green.

## References

Portfolio audit follow-up #19.
