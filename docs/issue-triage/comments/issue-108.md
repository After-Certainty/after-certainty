## Issue audit (Jul 2026)

**Status:** In progress — prerequisite satisfied; implementation underway

**Evidence:**
- [`docs/series-guide.md`](https://github.com/ksteffe/after-certainty/blob/main/docs/series-guide.md) exists (portfolio audit #6 done)
- `companionOf` / `companionBooks` already emitted via [`tools/manifest_books.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/manifest_books.py)
- `readingOrder` / `relatedSlugs` not yet in schema or generator

**Implementation:** PR adds [`tools/series_order.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/series_order.py), extends [`schema/books-manifest.schema.json`](https://github.com/ksteffe/after-certainty/blob/main/schema/books-manifest.schema.json), and wires [`tools/generate_books_manifest.py`](https://github.com/ksteffe/after-certainty/blob/main/tools/generate_books_manifest.py).

**Recommended action:** Labeled `agent-ready` + `partial` until PR merges; close on merge.
