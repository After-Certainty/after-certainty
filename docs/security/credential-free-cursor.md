# Credential-free Cursor and local development

## Goal

Do nearly all manuscript, semantic-graph, and tooling work **without** possessing
GitHub, Vercel, Beehiiv, SSH, or other production credentials.

## Recommended local setup

1. Clone over HTTPS **without** embedding a token in the remote URL, or use SSH
   only if your agent/SSH setup is intentional and isolated.
2. Prefer explicit env for manifests:
   ```bash
   GITHUB_REPOSITORY=ksteffe/after-certainty make generate-books-manifest
   ```
3. Install Python deps with a lockfile:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   uv sync --frozen
   ```
4. Run checks without network publication:
   ```bash
   make lint
   make test
   ```

## What not to mount into Cursor / agents

- Do not mount your SSH agent socket into untrusted agent environments by default.
- Do not export `GH_TOKEN`, `GITHUB_TOKEN`, `CACHE_REVALIDATE_SECRET`, or Vercel tokens
  into agent sessions unless the task explicitly requires publication (it usually does not).
- Do not paste production secrets into chat, commits, or generated manifests.
- Do not put TTS provider keys into **Cursor cloud** agent environments.

## Exception: laptop-only chapter TTS generate

For the chapter-audio pilot, a **trusted local machine** may hold `ELEVENLABS_API_KEY` in
**gitignored** root [`.env.local`](../../.env.example) and run:

```bash
# after copying .env.example → .env.local and setting ELEVENLABS_API_KEY=
make generate-chapter-audio UNIT=chapter-observer-patterns-front-matter-introduction
```

Rules:

1. Never commit `.env.local` (root `.gitignore` excludes `.env` / `.env.*` except `.env.example`).
2. Never paste the key into chat or PR descriptions.
3. Prefer this laptop path for the first free-plan generate; then install and run the site locally to QA Listen / reader features. GitHub Actions secrets remain optional.
4. Production / after-certainty.com Listen stays off until an explicit go-ahead—local testing does not imply public enablement.
5. Cloud / untrusted agents stay credential-free.

## Dev container

[`.devcontainer/devcontainer.json`](../../.devcontainer/devcontainer.json) clears
`GITHUB_TOKEN` / `GH_TOKEN` / `SSH_AUTH_SOCK` by default and does not mount host
credential agents. Use it for isolated editing and tests.

## Publishing stays in GitHub Actions

Releases and cache revalidation run only on `main` via workflows that separate
**preparation** (read-only, repository Python) from **publication** (narrow shell
scripts with write tokens). Local machines should not need those secrets.
