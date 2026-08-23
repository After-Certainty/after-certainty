# AGENTS.md

Repository overview, toolchains, and standard commands live in [`README.md`](README.md)
(corpus/publishing via Python + `uv` + Make; the website in [`apps/site`](apps/site) via
npm workspaces + Turborepo + Next.js). Site-specific rules are in
[`apps/site/AGENTS.md`](apps/site/AGENTS.md).

## Cursor Cloud specific instructions

The startup update script (`.cursor/install.sh`, wired via `.cursor/environment.json`)
only refreshes dependencies: `uv sync --frozen` (full dev group) + `npm ci`, plus the
optional PADE analytics CLI and pinned Vercel CLI. Everything below is non-obvious
runtime context.

- **PATH after startup.** `uv`, the Python venv, and installed tools are not on `PATH`
  in fresh shells. Before running Python/corpus or manifest commands, export:
  `export PATH="$HOME/.local/bin:$PWD/.venv/bin:$PATH"`. This makes `python3` resolve the
  `.venv` interpreter (with `pyyaml`/`jsonschema`) and puts `uv`, `ruff`, and `pytest` on
  `PATH`. (PADE sets its own PATH via `/etc/profile.d/cursor-pade.sh`. The Vercel CLI
  is on PATH via `/etc/profile.d/cursor-vercel.sh`.)
- **Vercel diagnostics on Cloud Agents.** Do not use Vercel MCP, `vercel login`,
  `--token`, or a session `VERCEL_TOKEN`. Wrap ordinary CLI diagnostics in PADE:
  `pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml --capability vercel.diagnostics --quiet -- vercel whoami`
  (see [`apps/site/.cursor/skills/vercel-diagnostics/SKILL.md`](apps/site/.cursor/skills/vercel-diagnostics/SKILL.md)).
  Allowed: `whoami`, `ls`, `inspect`, `logs`. Forbidden: `deploy`, `env pull`, `env add`.
- **The site needs the local semantic manifest before it renders.** This is a
  build/generate step and is intentionally kept out of the update script. Run it once
  after startup (and again after editing `books/` or `semantic/`):
  `make generate-semantic-manifest && make install-local-manifest-for-site`. Then start
  the dev server with `npm run site:dev:local` (sets `SEMANTIC_MANIFEST_USE_LOCAL=1` +
  `SEMANTIC_MANIFEST_OFFLINE=1`) — or run `npm run site:dev:watch` to auto-regenerate
  the manifest on corpus changes. Plain `npm run site:dev` also requires the installed
  local manifest (generate + install first); runtime remote fetch was removed. Server
  serves on `http://localhost:3000`.
- **Reader URLs.** `/books` 308-redirects to `/explore/books`. The chapter reader lives
  at `/explore/books/<book-slug>/chapters/<chapter-slug>` (the `(reader)` route group
  does not appear in the URL).
- **`apps/site/AGENTS.md` self-modifies.** `next dev` rewrites its `nextjs-agent-rules`
  block on every run, so it shows as an uncommitted change after starting the site. This
  is expected; ignore it or commit it with your work.
- **pandoc is only for book export.** `make build-book DIR=books/<name>` and the
  `export-*` targets require pandoc, which is a system package not in the update script.
  Install it on demand: `sudo apt-get install -y pandoc`. Typst and epubcheck are
  optional extras (`scripts/install_typst.sh`, `scripts/install_epubcheck.sh`).
- **Node engine.** CI and `package.json` engines require Node **22.22.2+** (LTS).
  The Cloud Agent base image may ship a slightly older 22.x (e.g. v22.14); some
  transitive deps (jsdom) still emit `EBADENGINE` until the image catches up, but
  lint/test/build/run all work. Prefer Node 22 LTS locally and in GitHub Actions.
