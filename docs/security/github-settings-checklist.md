# GitHub settings checklist (manual)

These protections cannot be fully enforced by repository files alone.
**Verify in the GitHub UI** — this document does not claim they are enabled.

## Secret and dependency protections

- [ ] Secret scanning enabled
- [ ] Push protection enabled
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled
- [ ] Private vulnerability reporting enabled (if appropriate for this public repo)

## Branch / repository rulesets (`main`)

- [ ] Pull requests required before merge
- [ ] Required status checks configured (lint, pytest, secret-scan, book-export as appropriate)
- [ ] Force pushes prohibited
- [ ] Branch deletion prohibited
- [ ] Rules apply to administrators where supported
- [ ] CODEOWNERS review required for security-sensitive paths (optional but recommended)

## GitHub Actions

- [ ] Default `GITHUB_TOKEN` permissions set to **read-only**
- [ ] Workflows **not** allowed to create and approve pull requests unless deliberately required
  - Prefer: human opens PR from compare URL after `semantic-agent/*` push
  - If Actions may create PRs, still require human approval/merge (never auto-approve)
- [ ] Release and tag protection where available

## Account / recovery

- [ ] Multifactor authentication or passkeys on the owning account
- [ ] Recovery methods documented and tested
- [ ] Domain/account protections reviewed

## Secrets present in this repository’s workflows

Confirm these exist only as Actions secrets/variables as intended:

- `CACHE_REVALIDATE_SECRET` (Actions secret)
- `ELEVENLABS_API_KEY` (Actions secret; **optional**) — only for manual
  `Chapter audio generate` (`chapter-audio-generate.yml`) when `dry_run=false`.
  Never add this secret to `python-tests`, `site-ci`, Vercel, or Cursor cloud agents.
  Laptop path remains gitignored root `.env.local` (see `.env.example`).
- Default `GITHUB_TOKEN` (automatic)

Chapter audio Git LFS ops (Phase 4):

- Root `.gitattributes` tracks `books/*/audio/*.mp3` with Git LFS; receipts and
  alignment JSON stay in ordinary Git.
- The generate workflow checks out with `lfs: true` and pushes LFS objects on the
  review PR branch. Confirm the repo has Git LFS enabled and that Vercel/CI fetch
  LFS objects before install (install refuses pointer stubs).
- Review PRs under `chapter-audio/generate-*` before merge — merging available
  audio makes Listen appear for those units on the live site (no env flag).

Note: `SITE_REVALIDATE_URL` is **no longer trusted**. Revalidation always targets the
hardcoded allowlisted production URL in `scripts/revalidate_site_cache.sh`.

## Historical credential incident

Git history still contains four old commits that embedded `x-access-token` URLs in
portfolio-audit manifests (allowlisted in `.gitleaks.toml` for history scans only).
Those files are no longer tracked.

- [ ] Confirm any GitHub App / Actions token that may have appeared in that history
      was rotated or revoked after the original incident
- [ ] Confirm GitHub secret scanning / push protection is enabled so a reintroduction
      is blocked at push time
