# Security Policy

This repository publishes manuscripts, semantic-graph data, and generated book
artifacts. It is not a production application runtime.

## Reporting a vulnerability

Please report security issues privately via GitHub’s
[private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
for this repository (if enabled), or by contacting the repository owner.

Do **not** open a public issue that includes real credentials, tokens, or private keys.

## What counts as in-scope

- Credential leakage into tracked files, manifests, release assets, or CI logs
- Over-privileged GitHub Actions workflows
- Path traversal or unintended writes from repository tooling
- Compromised or unexpectedly changed dependencies affecting CI/builds
- Agent workflows that bypass human review of semantic data

## What is out of scope

- Manuscript editorial disagreements
- Theoretical issues that cannot realistically affect credentials, source
  integrity, releases, or the public website without additional privileges

## Credential-free development

Cursor and local tools should be able to do nearly all work **without** GitHub,
Vercel, Beehiiv, SSH, or other production credentials. See
[docs/security/credential-free-cursor.md](docs/security/credential-free-cursor.md).

Never commit secrets. CI enforces overlapping checks via
`tests/test_no_secrets_in_repo.py`, Gitleaks, and generated-artifact scanning.
