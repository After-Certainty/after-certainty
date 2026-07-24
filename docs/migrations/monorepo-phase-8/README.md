# Monorepo Phase 8 — Optimize DX / Turbo / affected detection

**Status:** Complete (merged).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 8  
**Predecessor:** [`../monorepo-phase-7/`](../monorepo-phase-7/)

## Goal

DX and build-graph polish only — **no production behavior change**. Wire a clearer Turbo task graph (manifest → install → site build), local watch mode, finer Vercel ignore rules, and document Turbo remote cache.

## What changed

| Change | Notes |
|--------|--------|
| [`turbo.json`](../../../turbo.json) | `install-for-site` task; site `build`/`validate:*` depend on it; richer `inputs`/`env` |
| Root [`package.json`](../../../package.json) | `site:dev:local`, `site:dev:watch`, `site:build:local`, `corpus:watch-manifest`, `corpus:sync-semantic`, filtered turbo build/lint/test |
| [`scripts/watch_local_manifest.mjs`](../../../scripts/watch_local_manifest.mjs) | Debounced regenerate+install on corpus path changes |
| [`scripts/dev_site_with_manifest_watch.sh`](../../../scripts/dev_site_with_manifest_watch.sh) | Watcher + `site:dev` together |
| [`scripts/vercel_ignore_build.sh`](../../../scripts/vercel_ignore_build.sh) | Skip `docs/**` and `semantic/_drafts/**` |
| `make sync-semantic` / `npm run corpus:sync-semantic` | `uv sync --frozen --only-group semantic` |

## Local DX

```bash
# One-shot local site build (Turbo: build-manifest → install-for-site → next build)
npm run site:build:local

# Dev with local manifest env (regenerate manually when YAML changes)
npm run corpus:build-manifest && npm run site:install-local-manifest
npm run site:dev:local

# Or watch corpus paths while Next runs
npm run site:dev:watch
```

## Turbo remote cache (manual)

Vercel Remote Caching works when the project is linked to this monorepo:

1. Locally (optional): `npx turbo login` then `npx turbo link`
2. On Vercel: Remote Caching is available for the linked Git project — no extra install command required for Next builds that go through `vercel_build.sh`
3. For CI that runs `turbo run …`, set `TURBO_TOKEN` + `TURBO_TEAM` (or rely on Vercel OIDC when running on Vercel)

Site production/preview installs still use [`scripts/vercel_build.sh`](../../../scripts/vercel_build.sh) (generate → install → `site:build`) so deploy SHA checks stay intact. Local Turbo caching speeds `build-manifest` / `install-for-site` when inputs are unchanged.

## Affected / ignore detection

| Mechanism | Role |
|-----------|------|
| `scripts/vercel_ignore_build.sh` | Vercel Ignored Build Step — corpus + site paths; skips docs and semantic drafts |
| `npm run site:turbo-ignore` | Optional `turbo-ignore after-certainty-site` for package-graph skips |
| Site CI path filters | Unchanged; still generate+install before lint/test/build |

## uv groups (polish)

| Command | Use |
|---------|-----|
| `uv sync --frozen` | Full corpus CI/dev |
| `uv sync --frozen --only-group semantic` / `make sync-semantic` | Manifest-only (Vercel install) |
| `uv sync --frozen --group semantic --group test` | Manifest + pytest/ruff |
| `uv sync --frozen --group dev` | semantic + test + publishing helpers |

## What did **not** change

- Vercel install/build entrypoints (`vercel.json` → shell scripts)
- Production runtime (still local-manifest / offline)
- Public release publishing
- Deleting committed `apps/site/data/semantic-manifest.json`

## Verify

```bash
make lint
python3 -m pytest tests/test_vercel_ignore_build.py -q
npm run corpus:sync-semantic
GITHUB_REPOSITORY=ksteffe/after-certainty npm run site:build:local
```

## Next

Migration phases **0–8 are complete**. Optional follow-ups (not blocking):

- Enable Turbo remote cache tokens in GitHub Actions if desired
- Delete committed `apps/site/data/semantic-manifest.json` once tests use local install only
- Remote Turbo cache / watch polish beyond what Phase 8 shipped

See also the phase notes under [`docs/migrations/`](../).
