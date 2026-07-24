# Semantic-manifest test fixtures

These JSON files are **non-authoritative test fixtures**. They are not a production
fallback, not a second corpus source of truth, and must not be imported from
production site code (`app/`, `components/`, `lib/` outside tests).

## Authority

| Artifact | Role |
| --- | --- |
| Root `books/` + `semantic/` + `schema/` | Authoritative corpus |
| `build/semantic-manifest.json` | Generated same-checkout artifact |
| `apps/site/data/local-semantic-manifest.json` | Gitignored install target for site builds |
| Public GitHub release `semantic-manifest.json` | External consumers / parity only |
| Files in this directory | Unit and component tests only |

## Files

| File | Purpose |
| --- | --- |
| `minimal-valid.json` | Smallest schema-valid graph |
| `enriched-book.json` | One enriched book with overview, chapters, aliases |
| `fiction-and-poetry.json` | Fiction / poetry / nonfiction content types |
| `editions.json` | Canonical + companion edition relationships |
| `questions-and-trails.json` | Discovery questions and trails |
| `invalid/` | Deliberately invalid payloads |

## Regeneration

Prefer hand-editing these fixtures to the smallest shape that exercises the
behavior under test. If you need a fresh slice from a generated manifest:

```bash
# From repo root — generate then install, then copy curated subsets manually.
npm run corpus:build-manifest
npm run site:install-local-manifest
```

Do not commit a full production corpus under `apps/site/data/` or this folder.

## Contract tests

Full-corpus integrity / chapter-health contract tests load the CI-generated
`data/local-semantic-manifest.json` (see `test/helpers/load-local-manifest.ts`).
They skip with a clear message when that file is absent.
