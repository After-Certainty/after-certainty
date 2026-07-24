# `@after-certainty/corpus-tasks`

Thin npm/Turbo wrappers around repository-root **Make** targets. Python under `tools/` and `scripts/` remains authoritative; this package exists so Turborepo can cache `build-manifest` / `parity` outputs without relocating the corpus.

```bash
# From monorepo root:
npm run corpus:build-manifest
npm run corpus:parity
```
