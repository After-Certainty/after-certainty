# Phase 0 checklist

Legend: **[auto]** done by this PR’s code/docs · **[manual]** requires a human with dashboard access · **[before Phase 1]** blocking for structure import · **[before Phase 5]** blocking for production cutover

## Required before Phase 1

- [x] **[auto]** Migration plan merged (`docs/roadmaps/monorepo-migration-plan.md`)
- [x] **[auto]** Target structure and history strategy recorded (see README)
- [x] **[auto]** Workflow inventory for both repositories written ([`inventory.md`](inventory.md))
- [x] **[auto]** Rollback notes for Phase 0–2 written ([`rollback.md`](rollback.md))
- [x] **[auto]** Baseline release manifest identity captured ([`baselines/release-manifest-identity.json`](baselines/release-manifest-identity.json))
- [x] **[auto]** Baseline site fallback / intended-release identity captured
- [x] **[auto]** Baseline production smoke URL list captured ([`baselines/production-smoke-urls.json`](baselines/production-smoke-urls.json))
- [x] **[auto]** Public-contract pytest covering representative entities
- [x] **[manual]** Confirm no open PRs on `after-certainty-site` that must merge before import — confirmed 2026-07-23 (maintainer: no open site MRs)
- [ ] **[manual]** Skim [`inventory.md`](inventory.md) and note any private workflows/apps not listed

## Required before Phase 5 (start collecting now)

- [ ] **[manual]** Export Vercel project settings: root directory, install command, build command, output directory, Node version, ignored build step
- [ ] **[manual]** Export Vercel env var names for Production and Preview (values stay in dashboard; record names + which envs)
- [ ] **[manual]** Record current production deployment ID/URL for rollback
- [ ] **[manual]** Confirm domain assignment (`www.after-certainty.com` / apex) and DNS host
- [ ] **[manual]** List GitHub Actions secrets on **both** repos (expect at least `CACHE_REVALIDATE_SECRET` on corpus; confirm site)
- [ ] **[manual]** Snapshot branch protection on both `main` branches
- [ ] **[manual]** Inventory GitHub Apps / webhooks (Vercel, Dependabot, etc.)
- [ ] **[manual]** Agree stability window length (plan recommends ≥14 days after Phase 5)

## Nice to have during Phase 0

- [ ] **[manual]** Paste redacted Vercel/settings notes into `docs/migrations/monorepo-phase-0/manual-settings.md` (create when exporting)
- [ ] **[auto/local]** Run `make compare-site-discovery` and keep `docs/migrations/parity-report.md` current
- [ ] **[manual]** Confirm GA4 / Search Console admins (no URL change expected)

## Verification commands (local / CI)

```bash
make lint
python3 -m pytest tests/test_monorepo_phase0_public_contract.py tests/test_discovery_manifest.py -q
make compare-site-discovery
```
