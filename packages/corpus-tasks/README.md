# `@after-certainty/corpus-tasks`

Thin npm/Turbo wrappers around repository-root **Make** targets. Python under `tools/` and `scripts/` remains authoritative for YAML/manifest work; Node/Sharp owns deterministic web cover derivatives.

```bash
# From monorepo root:
npm run corpus:build-web-covers
npm run corpus:build-manifest
npm run corpus:parity
npm run validate:book-cover-assets
```

Cover pipeline details: [`docs/book-cover-assets.md`](../../docs/book-cover-assets.md).
