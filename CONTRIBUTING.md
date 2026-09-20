# Contributing

Thank you for contributing to After Certainty. This map routes you to the right docs; it is not a governance handbook.

## Where to start

| Change type | Primary paths | Validation |
|-------------|---------------|------------|
| Manuscript / `book.yml` | `books/<slug>/` | `make validate-book-specs` · export docs in [`docs/publishing/book-export-pipeline.md`](docs/publishing/book-export-pipeline.md) |
| Semantic graph YAML | `semantic/` | `npm run corpus:build-manifest` · contracts under [`docs/`](docs/README.md) |
| Website (UI, routes, site JSON) | `apps/site/` | `npm run site:lint` · `npm run site:test` · see [`apps/site/README.md`](apps/site/README.md) |
| Site content overlays (catalog, trails, What’s New) | `apps/site/` + guides | [`apps/site/docs/contributing-*.md`](apps/site/docs/) |
| Publishing / export tooling | `scripts/`, `tools/`, `schema/`, `templates/` | `make validate-book-specs` · relevant export targets |
| Docs only | `README.md`, `docs/`, this file | Link-check paths you touch |

Project overview and choose-your-path links: [README.md](README.md). Full technical index: [docs/README.md](docs/README.md).

## Local setup (short)

```bash
uv sync --frozen
npm ci
npm run corpus:build-manifest
npm run site:install-local-manifest
npm run site:dev:local
```

Corpus gate: `make check`. Site checks: `npm run site:test` · `npm run site:lint`.

## Pull requests

- Prefer small, reviewable PRs that separate corpus edits from site UI when practical.
- Do not commit secrets, tokens, or credential-bearing URLs (see [SECURITY.md](SECURITY.md)).
- Do not commit generated `apps/site/data/local-semantic-manifest.json` (gitignored).
- For semantic enrichment PRs, see [`docs/agents/semantic/PR-CHECKLIST.md`](docs/agents/semantic/PR-CHECKLIST.md).

## Issues

There are not yet formal GitHub issue templates. When filing an issue, say whether it is **corpus/semantic**, **manuscript/editorial**, or **apps/site**, and link the relevant paths.

## Security

Report vulnerabilities privately per [SECURITY.md](SECURITY.md). Prefer credential-free local and Cloud Agent workflows ([docs/security/credential-free-cursor.md](docs/security/credential-free-cursor.md)).

## License

Contributions are expected under the repository’s [CC BY-SA 4.0](LICENSE) terms unless otherwise noted.
