# Rollback notes (Phase 0–2)

Production must remain on **`ksteffe/after-certainty-site`** until Phase 5. Phase 0 makes no production changes. These notes cover how to undo early monorepo work if needed.

## Phase 0 (this preparation PR)

| If… | Then… |
|-----|-------|
| Phase 0 docs/tests are wrong or unwanted | Revert the Phase 0 PR on `after-certainty` |
| Baseline JSON is stale after a new release | Re-fetch `latest` semantic-manifest identity into `baselines/` and refresh site intended-release copy; do **not** change production |

**Data at risk:** none (documentation + tests only).

## Phase 1 (site history import under `apps/site/`)

| If… | Then… |
|-----|-------|
| Import merge is broken | `git revert` of the merge commit on `after-certainty`, or reset the feature branch before merge to `main` |
| Workspace lockfile is unusable | Revert root `package.json` / `package-lock.json` / `turbo.json`; site continues to live only in `after-certainty-site` |
| Preview Vercel project misconfigured | Delete or disconnect the preview project; leave production project on the old site repo |

**Keep available:**

- Full `after-certainty-site` repository (do **not** archive)
- Existing production Vercel Git connection to `after-certainty-site`
- Corpus release tag `latest` and `CACHE_REVALIDATE_SECRET` flow

## Phase 2 (CI consolidation, still remote manifest)

| If… | Then… |
|-----|-------|
| Monorepo CI breaks corpus publishing | Restore prior workflow YAML from git history on `after-certainty` |
| Site CI in monorepo is wrong | Keep relying on `after-certainty-site` CI until fixed; production deploy path unchanged |

## Production rollback (later phases — do not execute yet)

Documented here so Phase 0 inventories include the recovery path:

1. In Vercel, redeploy the last known-good production deployment **or** reconnect the project to `ksteffe/after-certainty-site` `main`.
2. Ensure `SEMANTIC_MANIFEST_URL` / remote-first loading is active (unset offline mode in production).
3. Confirm `CACHE_REVALIDATE_SECRET` still matches corpus → site revalidate.
4. Hit smoke URLs in [`baselines/production-smoke-urls.json`](baselines/production-smoke-urls.json).
5. Confirm What’s New / explore pages load from the release manifest (`sourceCommit` near [`baselines/release-manifest-identity.json`](baselines/release-manifest-identity.json) or newer intentional release).

## What must stay backed up before Phase 5

- Vercel settings export ([`checklist.md`](checklist.md))
- Production deployment ID/URL
- Secret name inventory
- This directory’s baselines (in git)

## Stability window

Do not archive `after-certainty-site` until Phase 7 criteria in the roadmap are met. Recommended minimum: **14 days** of production on local-manifest builds after Phase 5 with no rollback.
