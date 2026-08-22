# Site deployment (GitHub Actions → Vercel prebuilt)

GitHub Actions is the authoritative CI/build pipeline for [`apps/site`](../apps/site/).
Vercel receives a **prebuilt** artifact via the CLI; it does not run a second
Git-triggered build for the same push.

## Where things run

| Stage | Where | Notes |
|-------|--------|--------|
| Lint, unit tests, corpus validates | GitHub Actions ([`site-ci.yml`](../.github/workflows/site-ci.yml)) | Path-filtered |
| Install + production-shaped Next build | GitHub Actions via `vercel build` | Runs [`vercel_install.sh`](../scripts/vercel_install.sh) + [`vercel_build.sh`](../scripts/vercel_build.sh) from [`apps/site/vercel.json`](../apps/site/vercel.json) |
| Playwright e2e | GitHub Actions | Against the `.next` from that build (`npm run start`) |
| Preview deploy | GitHub Actions → `vercel deploy --prebuilt` | Same-repo PRs after CI |
| Preview URL on PR | Sticky GitHub PR comment | Same-repo PRs after a successful preview deploy (updates in place on later pushes) |
| Production deploy | GitHub Actions → `vercel deploy --prebuilt --prod` | Pushes to `main` after CI |

Path filters on Site CI decide **whether** the workflow runs. Automatic Vercel Git
builds are disabled (`git.deploymentEnabled: false` in `vercel.json`). Keep the
project **linked** to the GitHub repo for metadata; do not rely on Vercel to
decide builds.

## Required GitHub configuration

| Name | Type | Purpose |
|------|------|---------|
| `VERCEL_TOKEN` | Repository **secret** | Vercel API token for CLI pull/build/deploy |
| `VERCEL_ORG_ID` | Repository **variable** | Team/org id from `apps/site/.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | Repository **variable** | Project id from the same file |

Create the token under Vercel → Account/Team → Tokens. Never commit token values.

Site CI also needs workflow permission `pull-requests: write` (set in
[`site-ci.yml`](../.github/workflows/site-ci.yml)) so the sticky preview-URL
comment can be created or updated. No extra secrets are required beyond the
default `GITHUB_TOKEN`.

Vercel project **runtime** env (still set in the Vercel dashboard) includes
`SEMANTIC_MANIFEST_USE_LOCAL=1`, `SEMANTIC_MANIFEST_OFFLINE=1`,
`NEXT_PUBLIC_SITE_URL`, podcast/GA settings, and `CACHE_REVALIDATE_SECRET`.
`vercel pull` downloads those into the Actions build.

## Fork PRs

- Site CI still runs when paths match (lint/test/build/e2e).
- Fork workflows do **not** receive `VERCEL_TOKEN`.
- Without credentials (or when the PR head is not this repository), CI falls back
  to `npm run site:build` and **skips** `vercel deploy` (and the sticky preview
  comment).
- Do **not** use `pull_request_target` to work around this.

## SHA / provenance check

[`scripts/vercel_build.sh`](../scripts/vercel_build.sh) sets
`SEMANTIC_MANIFEST_USE_LOCAL=1` / `OFFLINE=1`, pulls chapter audio via Git LFS,
generates the local semantic manifest, and when `VERCEL_GIT_COMMIT_SHA` is set
passes `--require-deploy-sha` to
[`install_local_manifest_for_site.py`](../scripts/install_local_manifest_for_site.py).

Site CI sets `VERCEL_GIT_COMMIT_SHA=${{ github.sha }}` so
`manifest.sourceCommit` must equal the commit being built/deployed.

## Vercel CLI version

Site CI pins the CLI (see `VERCEL_CLI_VERSION` in `site-ci.yml`). Do not switch
to `vercel@latest` in CI.

## Manual troubleshooting

1. **Deploy job skipped / fallback build**  
   Confirm `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` exist and that
   the PR is from this repository (not a fork).

2. **`vercel pull` / `deploy` auth errors**  
   Rotate or recreate `VERCEL_TOKEN`; confirm org/project IDs match the linked
   project (Root Directory `apps/site`).

3. **`sourceCommit` does not match deploy SHA**  
   Ensure `VERCEL_GIT_COMMIT_SHA` is set to the same commit as the Actions
   checkout (`github.sha`). Inspect the build log for
   `Deploy SHA matches manifest sourceCommit=…`.

4. **Git LFS / missing chapter audio**  
   `vercel_build.sh` runs [`ensure_git_lfs_audio.sh`](../scripts/ensure_git_lfs_audio.sh).
   In Actions, `GITHUB_TOKEN` is provided. Residual Vercel-side builds (if any)
   still need `CHAPTER_AUDIO_GITHUB_TOKEN` on the Vercel project.

5. **Unexpected second Vercel build on push**  
   Confirm `apps/site/vercel.json` has `"git": { "deploymentEnabled": false }`
   and that the Vercel project Root Directory is `apps/site`. Domains, env, and
   instant rollback remain on the Vercel project; only automatic Git builds are
   disabled.

6. **Inspect a failed prebuilt deploy**  
   Open the Site CI run → job summary (deployment URL when successful) and the
   `vercel build` / `vercel deploy --prebuilt` step logs. The prebuilt output
   lives under `apps/site/.vercel/output` on the runner (not committed).
