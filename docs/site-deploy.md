# Site deployment (GitHub Actions → Vercel prebuilt)

GitHub Actions is the authoritative CI/build pipeline for [`apps/site`](../apps/site/).
Vercel receives a **prebuilt** artifact via the CLI; it does not run a second
Git-triggered build for the same push.

## Pipeline shape

```text
PR
├── Preview deployment     ← starts immediately (inspectable artifact)
├── Code quality           ← lint + unit tests + validates + npm audit
└── E2E                    ← waits for preview URL, then Playwright remotely
    └── site-ci            ← merge gate (quality + e2e; preview is NOT the gate)

main
├── Code quality
└── Production deployment  ← needs quality; local e2e; then deploy --prod
    └── site-ci
```

| Stage | Where | Notes |
|-------|--------|--------|
| Preview deploy | GitHub Actions → `vercel build` + `vercel deploy --prebuilt` | Same-repo PRs; **does not wait** for lint/tests |
| Preview URL on PR | Sticky GitHub PR comment + job summary | Posted as soon as preview deploy succeeds |
| Lint, unit tests, corpus validates, `npm audit` | `Code quality` job | Parallel with preview on PRs |
| Playwright e2e (PR) | `E2E` job against deployed preview URL | `PLAYWRIGHT_BASE_URL`; no local `webServer` |
| Playwright e2e (main) | Inside `Production deployment` | Against the production-shaped build via `npm run start` |
| Production deploy | `vercel deploy --prebuilt --prod` | Only after quality **and** local e2e succeed |
| Aggregate gate | Job name **`site-ci`** | Prefer this as the required status check |

Path filters on Site CI decide **whether** the workflow runs. Automatic Vercel Git
builds are disabled (`"git": { "deploymentEnabled": false }` in
[`apps/site/vercel.json`](../apps/site/vercel.json)). Keep the project **linked**
to the GitHub repo for metadata; do not rely on Vercel to decide builds.

### What is intentionally *not* a merge gate

A successful **Preview deployment** means the commit produced an inspectable
URL. It does **not** mean lint, tests, or corpus validation passed. Merge and
production remain gated by **`site-ci`** (quality + e2e / production).

### Duplicate setup removed

The previous serial job ran `npm ci`, `uv sync`, and semantic-manifest
generate/install **before** `vercel build`, then `vercel_install.sh` /
`vercel_build.sh` repeated that work. Preview and production jobs now let the
Vercel install/build scripts own that preparation. Quality still generates and
installs the local manifest because lint/tests/validates need it without a
Vercel build.

Shared link/pull/LFS/env sanitize lives in
[`scripts/ci_vercel_prepare.sh`](../scripts/ci_vercel_prepare.sh).

### Next.js incremental cache

Preview and production restore/save `apps/site/.next/cache` via `actions/cache`
(keyed by OS + lockfile + ref + SHA, with restore-keys for partial hits). Only
the incremental cache is cached — not deployable `.next` output.

## Required GitHub configuration

| Name | Type | Purpose |
|------|------|---------|
| `VERCEL_TOKEN` | Repository **secret** | Vercel API token for CLI pull/build/deploy |
| `VERCEL_ORG_ID` | Repository **variable** | Team/org id from `apps/site/.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | Repository **variable** | Project id from the same file |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Repository **secret** (optional) | Deployment Protection bypass for Playwright against protected previews |

Create the token under Vercel → Account/Team → Tokens. Never commit token values.

If preview Deployment Protection blocks automated browsers, create a bypass
secret in the Vercel project (Deployment Protection → Protection Bypass for
Automation) and store the same value as `VERCEL_AUTOMATION_BYPASS_SECRET`.
Do **not** disable protection globally. Playwright sends
`x-vercel-protection-bypass` only when that secret is present.

Site CI also needs workflow permission `pull-requests: write` (set in
[`site-ci.yml`](../.github/workflows/site-ci.yml)) so the sticky preview-URL
comment can be created or updated.

Vercel project **runtime** env (still set in the Vercel dashboard) includes
`SEMANTIC_MANIFEST_USE_LOCAL=1`, `SEMANTIC_MANIFEST_OFFLINE=1`,
`NEXT_PUBLIC_SITE_URL`, podcast/GA settings, and `CACHE_REVALIDATE_SECRET`.
`vercel pull` downloads those into the Actions build.

## Branch protection / required checks

After this restructure, the old single check name
`Lint, test, vercel build, e2e, deploy` no longer exists.

**Prefer requiring the aggregate job `site-ci`.** That job succeeds only when:

- PR: `Code quality` and `E2E` both succeed
- `main`: `Code quality` and `Production deployment` both succeed

Do **not** require `Preview deployment` alone as a merge gate.

Updating required checks is a GitHub settings / ruleset change outside the
repository files.

## Fork PRs

- Site CI still runs when paths match.
- Fork workflows do **not** receive `VERCEL_TOKEN`.
- Preview skips Vercel deploy (`use_vercel=false`); E2E falls back to
  `npm run site:build` and the local Playwright `webServer`.
- Do **not** use `pull_request_target` to work around this.

## Local Playwright

Without `PLAYWRIGHT_BASE_URL`, Playwright keeps the previous local behavior
(`npm run start` on `http://127.0.0.1:3000`). Set `PLAYWRIGHT_BASE_URL` only
when targeting a remote deployment (CI does this for PR previews).

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

## Future optimizations (not in this change)

- Staged production / `vercel promote` / `--skip-domain`
- Playwright runner matrix sharding
- Lockfile-only or nightly-only `npm audit`
- Uploading `.vercel/output` artifacts to overlap main build with quality

## Manual troubleshooting

1. **Preview deploy skipped / fallback e2e**  
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
   `ci_vercel_prepare.sh` / `vercel_build.sh` run
   [`ensure_git_lfs_audio.sh`](../scripts/ensure_git_lfs_audio.sh).
   In Actions, `GITHUB_TOKEN` is provided. Residual Vercel-side builds (if any)
   still need `CHAPTER_AUDIO_GITHUB_TOKEN` on the Vercel project.

5. **E2E 401/403 against preview**  
   Set `VERCEL_AUTOMATION_BYPASS_SECRET` to the Vercel Protection Bypass for
   Automation value, or adjust Deployment Protection Trusted Sources for GitHub
   Actions — without disabling protection globally.

6. **Unexpected second Vercel build on push**  
   Confirm `apps/site/vercel.json` has `"git": { "deploymentEnabled": false }`
   and that the Vercel project Root Directory is `apps/site`.

7. **Inspect a failed prebuilt deploy**  
   Open the Site CI run → Preview/Production job summary (deployment URL when
   successful) and the `vercel build` / `vercel deploy --prebuilt` step logs.
   The prebuilt output lives under `apps/site/.vercel/output` on the runner
   (not committed).
