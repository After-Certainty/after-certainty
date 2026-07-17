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
- Default `GITHUB_TOKEN` (automatic)

Note: `SITE_REVALIDATE_URL` is **no longer trusted**. Revalidation always targets the
hardcoded allowlisted production URL in `scripts/revalidate_site_cache.sh`.
