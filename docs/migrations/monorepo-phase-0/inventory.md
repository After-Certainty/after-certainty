# Phase 0 inventory

Captured 2026-07-23 from public GitHub metadata, workflow files, and repository code. Items marked **Unresolved** need a human dashboard export.

## Repositories

| | after-certainty | after-certainty-site |
|--|-----------------|----------------------|
| Visibility | public | public |
| Default branch | `main` | `main` |
| GitHub Pages | no | no |
| Archived | no | no |
| Approx. git size (API) | ~123 MB | ~23 MB |
| Open issues (Phase 0 start) | 8 | 0 |
| Package managers | uv + Make | npm |
| Node | none | 20 (CI) |
| Python | ≥3.11 / CI 3.12.3 | none |

## Corpus workflows (`.github/workflows/`)

| File | Triggers | Role | Secrets referenced in YAML |
|------|----------|------|----------------------------|
| `book-export-release.yml` | push/PR `main`, `workflow_dispatch` | Validate, export books, publish `latest`, revalidate site | `CACHE_REVALIDATE_SECRET`, `GITHUB_TOKEN`/`GH_TOKEN` |
| `python-tests.yml` | push/PR `main` | Ruff, ontology, pytest, Gitleaks, pip-audit | none (uses `github.token` patterns / installers) |
| `semantic-enrichment.yml` | `workflow_dispatch` | Enrichment draft PR | `github.token` in publish step only |
| `how-meaning-moves-typography.yml` | path-filtered push/PR | Typography checks | none |
| `codeql.yml` | push/PR + schedule | CodeQL | none |
| `scorecards.yml` | push + schedule + branch protection | Scorecard | none |

## Site workflows

| File | Triggers | Role | Secrets in YAML |
|------|----------|------|-----------------|
| `ci.yml` | push/PR `main` | lint, test, validate fallback/public corpus, build offline, Playwright | none — sets `SEMANTIC_MANIFEST_OFFLINE=1` |

Site Dependabot: `.github/dependabot.yml` (npm `/`, GitHub Actions).

## Secrets and cross-repo coupling (from code)

| Name | Where used | Purpose |
|------|------------|---------|
| `CACHE_REVALIDATE_SECRET` | Corpus `scripts/revalidate_site_cache.sh` + site `/api/cache/revalidate` + Vercel | Bearer for on-demand cache refresh (`podcast`, `semantic`) |
| `GH_TOKEN` / `GITHUB_TOKEN` | Corpus release + enrichment publish | Create/update GitHub release `latest`, open PRs |
| `SEMANTIC_MANIFEST_URL` | Site (optional env) | Override remote manifest URL |
| `SEMANTIC_MANIFEST_OFFLINE` | Site CI/dev | Force bundled fallback |
| `NEXT_PUBLIC_SITE_URL` | Site / Vercel | Canonical site URL |
| `PODCAST_RSS_URL` | Site (optional) | Podcast ISR source |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Site (optional; default in code) | Analytics |

**Unresolved:** exact secret *names present* in each GitHub repo and Vercel project (API returned 403 from this environment).

## Release / production identity baseline

See [`baselines/release-manifest-identity.json`](baselines/release-manifest-identity.json) and [`baselines/site-intended-manifest-release.json`](baselines/site-intended-manifest-release.json).

At capture time:

- Public release URL: `https://github.com/ksteffe/after-certainty/releases/download/latest/semantic-manifest.json`
- `schemaVersion`: `2.3`
- `sourceCommit`: `e9dc01725aab8411d9f6a8e75175f2953b504d69`
- Site intended release matched that commit/generatedAt after sync

## Production site behavior (code-level)

| Concern | Behavior |
|---------|----------|
| Manifest source | Remote-first from GitHub `latest`; fallback `data/semantic-manifest.json` |
| ISR | `SEMANTIC_MANIFEST_REVALIDATE_SECONDS` default 3600; tag `semantic-graph` |
| On-demand revalidate | `POST https://www.after-certainty.com/api/cache/revalidate` |
| Search index | Runtime `GET /api/search/index` (not a committed static file) |
| Smoke routes | [`baselines/production-smoke-urls.json`](baselines/production-smoke-urls.json) (26 URLs) |

## Vercel (**Unresolved** — not in git)

No `vercel.json` in the site repo. Maintainers must export:

1. Project name and team/scope
2. Connected Git repository (`after-certainty-site` today)
3. Root directory / install / build / output
4. Node version
5. Ignored build step / monorepo settings
6. Env vars (Production vs Preview)
7. Domains (`www.after-certainty.com`, apex)
8. Deployment protection
9. Current production deployment ID

Paste into `manual-settings.md` when available (file intentionally not created until a human export exists).

## GitHub settings (**partially Unresolved**)

| Item | Status |
|------|--------|
| Environments | API reported `total_count: 0` for corpus (may lack permission to see private envs) |
| Branch protection | API 403 — export manually |
| Apps / webhooks | Export manually |
| CODEOWNERS | Check both repos before Phase 7 |

## Path assumptions to preserve in Phase 1

**Corpus (do not move):** `books/`, `semantic/`, `schema/`, `tools/`, `scripts/`, `Makefile`, `tests/`, `pyproject.toml`

**Site (will move to `apps/site/`):** entire site tree; scripts that assume site repo root will need cwd/`apps/site` awareness in Phase 1–2
