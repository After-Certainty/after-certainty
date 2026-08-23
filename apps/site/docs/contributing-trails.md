# Contributing Curated Reading Trails

Curated Reading Trails are editorially composed paths through the After Certainty corpus.
**Corpus definitions live in this monorepo** (`semantic/trails/*.yml`) and ship via
same-checkout `semantic-manifest.json` → `trails[]`.

Site-owned pieces that remain under `apps/site/`:

- Search bridges — [`data/path-search-bridges.json`](../data/path-search-bridges.json) (`trailBridges`)
- Fiction-doorway presentation flag — [`lib/books/presentation-overlays.ts`](../lib/books/presentation-overlays.ts)

## Where definitions live

| Layer              | Location                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| Canonical YAML     | `semantic/trails/` (monorepo root)                                       |
| Generated asset    | `build/semantic-manifest.json` → `trails[]`                              |
| Site install       | `apps/site/data/local-semantic-manifest.json` (gitignored)               |
| Site bridges       | [`data/path-search-bridges.json`](../data/path-search-bridges.json)      |
| Types / enrichment | [`types/trails.ts`](../types/trails.ts), [`lib/trails/`](../lib/trails/) |

## Trails vs questions

|         | Reading Trail                                        | Start with a Question                                   |
| ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Framing | Title + orientation to a tension                     | Interrogative H1 + what-it-is-not                       |
| Purpose | Reusable sequence for themes, audiences, or revisits | Accessible entrance when you arrive with a felt tension |
| Route   | `/trails/[slug]`                                     | `/questions/[slug]`                                     |

Both use the same **path stop** model under the hood. Stops may target books, concepts, patterns, and other explore entities — and **public chapters** via `entityType: chapter` + `entityId` (see [authoring-discovery-metadata.md](https://github.com/After-Certainty/after-certainty/blob/main/docs/authoring-discovery-metadata.md) and [semantic-chapter-identity.md](https://github.com/After-Certainty/after-certainty/blob/main/docs/semantic-chapter-identity.md)).

## Creating a new trail

1. Author `semantic/trails/<slug>.yml` in this monorepo (see upstream authoring guide).
2. Run `npm run corpus:build-manifest` and `npm run site:install-local-manifest`.
3. Start the site with `SEMANTIC_MANIFEST_USE_LOCAL=1`.
4. Optionally add `trailBridges` terms in [`data/path-search-bridges.json`](../data/path-search-bridges.json).
5. Run `npm test -- lib/trails/validate.test.ts` and preview `/trails/your-slug`.

## Related

- Questions: same ownership pattern via `semantic/questions/`
- Upstream: [authoring-discovery-metadata.md](https://github.com/After-Certainty/after-certainty/blob/main/docs/authoring-discovery-metadata.md)
