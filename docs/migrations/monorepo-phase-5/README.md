# Monorepo Phase 5 — Production uses local manifest (Stage D)

**Status:** Complete (merged). Phase 6: [`../monorepo-phase-6/`](../monorepo-phase-6/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 5  
**Predecessor:** [`../monorepo-phase-4/`](../monorepo-phase-4/)

## Goal

**First production behavior change:** the site deployment builds from a same-checkout `semantic-manifest.json` and **does not** fetch the GitHub `latest` release at runtime. Public release artifacts remain published. The former `after-certainty-site` Vercel Git connection is replaced by this monorepo (manual cutover below).

## What changed (in repo)

| Change | Notes |
|--------|--------|
| [`apps/site/vercel.json`](../../../apps/site/vercel.json) | Install/build commands for Root Directory `apps/site` |
| [`scripts/vercel_install.sh`](../../../scripts/vercel_install.sh) | `npm ci` + `uv sync --frozen --only-group semantic` |
| [`scripts/vercel_build.sh`](../../../scripts/vercel_build.sh) | Generate → install local → `next build` with `USE_LOCAL=1` + `OFFLINE=1`; assert `sourceCommit == VERCEL_GIT_COMMIT_SHA` |
| [`apps/site/lib/site-config.ts`](../../../apps/site/lib/site-config.ts) | `SEMANTIC_MANIFEST_USE_LOCAL=1` implies offline (remote fetch disabled) |
| npm | `site:build:production` / `site:vercel:*` wrappers |

> **Later change:** Vercel Ignored Build Step / `scripts/vercel_ignore_build.sh` were
> removed when Site CI took over deploys (`vercel build` + `vercel deploy --prebuilt`).
> See [`docs/site-deploy.md`](../../site-deploy.md).

## Env contract (after cutover)

| Variable | Production / Preview (monorepo) |
|----------|----------------------------------|
| `SEMANTIC_MANIFEST_USE_LOCAL` | `1` (set by `vercel_build.sh`; also set in Vercel project env for runtime) |
| `SEMANTIC_MANIFEST_OFFLINE` | `1` (same) |
| `SEMANTIC_MANIFEST_URL` | removed as a site runtime knob in Phase 6 |
| Committed `data/semantic-manifest.json` | Emergency fallback only; not SoT |
| Public GitHub `latest` manifest | Still published by book-export release |

**Runtime:** set both flags on the Vercel project (Production + Preview) so serverless/ISR paths never hit the remote URL even if a code path forgets build-time defaults.

## Suggested Vercel project settings

| Setting | Value |
|---------|--------|
| Git repository | `ksteffe/after-certainty` |
| Root Directory | `apps/site` |
| Framework | Next.js (from `vercel.json`) |
| Install Command | from `vercel.json` → `scripts/vercel_install.sh` |
| Build Command | from `vercel.json` → `scripts/vercel_build.sh` |
| Git automatic deployments | Disabled later (`git.deploymentEnabled: false`); see [`docs/site-deploy.md`](../../site-deploy.md) |
| Node | 20.x |
| Python | 3.12 available at build (used via uv) |

Also keep existing `NEXT_PUBLIC_SITE_URL`, podcast, GA, and `CACHE_REVALIDATE_SECRET` (podcast-only revalidate in Phase 6).

## Manual cutover checklist

Do **not** move DNS until a monorepo production deployment is validated.

1. [ ] Export current Vercel settings + env (prod + preview) and note production deployment ID (rollback target).
2. [ ] Create or reconnect a Vercel project to `ksteffe/after-certainty` with Root Directory `apps/site` (preview first if using a second project).
3. [ ] Confirm install/build/ignore pick up `apps/site/vercel.json` (or paste the same commands).
4. [ ] Set Production + Preview env: `SEMANTIC_MANIFEST_USE_LOCAL=1`, `SEMANTIC_MANIFEST_OFFLINE=1`.
5. [ ] Deploy preview; confirm build logs show local install + `Deploy SHA matches manifest sourceCommit=…`.
6. [ ] Spot-check smoke URLs ([Phase 0 baselines](../monorepo-phase-0/baselines/production-smoke-urls.json)): schema/content parity, search, sitemap, canonicals.
7. [ ] Promote / switch production Git source to the monorepo project (or promote the preview project).
8. [ ] Confirm production `sourceCommit` equals the deploying git SHA (build log + optional build lock).
9. [ ] Confirm domain still on the intended Vercel project; no DNS change if same project.
10. [ ] Leave `after-certainty-site` repo online until Phase 7 (do not archive yet).
11. [ ] Keep book-export release publishing `semantic-manifest.json` (external consumers).

## Local / CI verification

```bash
make lint
python3 -m pytest tests/test_install_local_manifest_for_site.py -q
npm run site:test -- --run lib/site-config.test.ts lib/graph/manifest.test.ts lib/graph/offline-manifest.test.ts
# Optional full production-shaped build (needs uv semantic group + generate):
# npm run site:build:production
```

Site CI (Phase 4) already exercises local-manifest generate/install/build.

## What did **not** change

- Removal of remote fetch code / sync skill / semantic revalidate path (Phase 6)
- Archiving `after-certainty-site` (Phase 7)
- Book DOCX/PDF/EPUB pipeline
- Public release artifact publication

## Rollback

1. Redeploy the previous Vercel deployment (saved deployment ID), **or**
2. Reconnect Vercel Git to `after-certainty-site` and unset `SEMANTIC_MANIFEST_USE_LOCAL` / `OFFLINE` so remote fetch resumes.
3. Revert this PR if in-repo scripts/config need to roll back.

## Next

**Phase 6:** Remove obsolete sync machinery (remote fetch, semantic ISR revalidate target, fallback sync skill).
