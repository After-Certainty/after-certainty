# Threat model (after-certainty)

## Protected assets

- Manuscript and semantic source trees (`books/`, `upcoming/`, `semantic/`, `schema/`)
- Rolling GitHub release `latest` (DOCX/EPUB/PDF + books/semantic manifests)
- `CACHE_REVALIDATE_SECRET` used to refresh www.after-certainty.com caches
- GitHub Actions write capability (`contents: write`, `pull-requests: write`)
- Developer/CI credentials that must never appear in generated artifacts

## Trust boundaries

1. **Source files** — trusted after human review/merge to `main`.
2. **Python tools/scripts** — repository-controlled; may construct artifacts but must not hold publication credentials during general build work.
3. **Generated intermediates** (`build/`, CI `upload/`) — untrusted until scanned.
4. **Workflow artifacts** — readable by those who can view Actions runs.
5. **GitHub releases** — public distribution; mutable `latest` tag is intentional.
6. **Site cache revalidation** — bearer-authenticated HTTPS POST to one allowlisted URL.
7. **Agent-generated branches/PRs** — untrusted until human merge; must not auto-approve/auto-merge.
8. **Third-party actions/packages/binaries** — pinned (Actions SHAs, `uv.lock`, Typst digest).

## Likely failure modes

| Mode | Impact | Controls |
|---|---|---|
| Tokenized git remote leaked into manifests | Credential disclosure | `sanitize_github_repo_slug`, no-secrets tests, Gitleaks, generated-artifact scan, fake-remote regression |
| Compromised build script with release token | Rewrite public assets | Prepare/publish job split; publish job runs only short shell scripts |
| Mis-set revalidate URL exfiltrates bearer | Secret theft / cache forgery | Hardcoded allowlist URL; no `vars.SITE_REVALIDATE_URL`; no redirects |
| Mutable Actions tags | Supply-chain compromise | Pin to full commit SHAs |
| Path escape via `book.yml` | Write outside book tree | `tools/path_safety.py` |
| Agent PR auto-merge | Unreviewed semantic changes | Dispatch-only; no auto-merge; docs discourage approve permission |

## Residual risks

- Anyone who can merge to `main` can still publish (by design).
- Mutable `latest` release limits strong provenance (attestations deferred).
- Distro apt packages (Pandoc, TeX) remain TOFU.
- GitHub account/org settings (MFA, rulesets, secret scanning) are out of band — see `github-settings-checklist.md`.
