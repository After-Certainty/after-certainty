# Semantic manifest contract (v2.2)

`semantic-manifest.json` is a **public, generated API**. YAML under `books/` and `semantic/` is canonical; the manifest is never hand-edited.

## Compatibility policy

1. **Additive only** — existing top-level collections, field names, types, entity IDs, relationship semantics, and slug fields keep their meanings.
2. **No flag-day site break** — consumers that ignore unknown fields continue to work.
3. **Do not repurpose fields** — new meanings get new optional fields or collections.
4. **Integer `manifestVersion`** — remains `1` or `2` (thinkers present → `2`). This is not bumped for additive discovery fields.
5. **String `schemaVersion`** — currently `"2.2"` documents additive discovery plus `parts`/`chapters`, `literaryForm`, and overview `relatedWorks`. `"2.1"` introduced works/editions and discovery collections.
6. **Provenance** — `generatedAt`, `repository`, `ref`, `releaseTag`, and `sourceCommit` (git SHA when available).

## Existing collections (stable)

`books`, `glossary`, `patterns`, `situations`, `sources`, `relationships`, `ontology`, and optional `thinkers`.

## Additive collections (schemaVersion 2.1)

| Collection | Role |
|------------|------|
| `works` | Stable work identity; `currentEditionId` points at the canonical public edition |
| `editions` | Edition rows keyed by existing `book-*` ids |
| `questions` | First-class editorial questions with ordered path stops |
| `trails` | Curated reading trails with transitions |
| `shelves` | Editorial shelves (curated or typed rule); no display limits |
| `changeEvents` | Authored public content-change events |
| `searchAliases` | Alias vs related vocabulary bridges |

## Additive collections (schemaVersion 2.2)

| Collection | Role |
|------------|------|
| `parts` | Stable part identity for parseable manuscripts |
| `chapters` | Stable chapter identity, metrics, optional authored enrichment |

See [semantic-chapter-identity.md](semantic-chapter-identity.md).

## Additive book fields

Optional on each `books[]` entry: `workId`, `editionId`, `isCanonical`, `editionRelationship`, `editionLabel`, `contentType` (includes `poetry`), `literaryForm`, `publicStatus`, `availability`, `overview` (including `relatedWorks`), `searchAliases`.

Legacy `status`, `companionOf`, `companionBooks`, and `slugAliases` are unchanged.

## Open edition

“Open edition” is **not** a public status. Licensing / open-publishing copy and derived download availability are separate from `publicStatus` (`published`, `upcoming` / forthcoming / in_progress, `revised`, `superseded`, `archived`).

## Generation

```bash
make generate-semantic-manifest
make validate-semantic-manifest
make verify-semantic-manifest
make validate-discovery-content
make report-semantic-completeness
```

Release staging regenerates the manifest via `scripts/prepare_release_staging.sh` as before.
