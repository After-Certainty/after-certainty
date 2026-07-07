## Issue audit (Jul 2026)

**Status:** Partially done — v1.5 source metadata shipped

**Evidence:**
- PR #253 backfilled ~411 sources with `creatorNames`, `title`, `year`, `publisher`, `citation`, `sourceKind`
- Schema in [`schema/semantic-manifest.schema.json`](https://github.com/ksteffe/after-certainty/blob/main/schema/semantic-manifest.schema.json) `sourceEntry`
- See [`docs/semantic-thinkers-sources-migration.md`](https://github.com/ksteffe/after-certainty/blob/main/docs/semantic-thinkers-sources-migration.md)

**Remaining work:**
- Structured `isbn`, `doi`, `sameAs[]` fields
- `url` field (0/411 populated; DOIs embedded in citation strings only)

**Recommended action:** Issue body updated to narrow scope; labeled `partial`.
