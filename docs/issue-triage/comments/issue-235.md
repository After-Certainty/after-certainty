## Issue audit (Jul 2026)

**Status:** Not done — straightforward for agent

**Evidence:**
- `book.language` exists in every [`book.yml`](https://github.com/ksteffe/after-certainty/blob/main/schema/book.schema.json) but not emitted to semantic manifest
- No per-book `license` in manifest; site uses site-wide CC BY-SA 4.0 today

**Recommended action:** Labeled `agent-ready`. Wire `inLanguage` from `book.yml`; default license CC BY-SA 4.0 with optional override.
