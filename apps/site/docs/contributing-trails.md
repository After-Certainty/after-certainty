# Contributing Curated Reading Trails

Curated Reading Trails are editorially composed paths through the After Certainty corpus. **Corpus definitions live in after-certainty** (`semantic/trails/*.yml`) and ship via `semantic-manifest.json` → `trails[]`.

Site-owned pieces that remain here:

- Search bridges — [`data/path-search-bridges.json`](../data/path-search-bridges.json) (`trailBridges`)
- Fiction-doorway presentation flag — [`lib/books/presentation-overlays.ts`](../lib/books/presentation-overlays.ts)

## Where definitions live

| Layer              | Location                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| Canonical YAML     | after-certainty `semantic/trails/`                                       |
| Release asset      | `semantic-manifest.json` → `trails[]`                                    |
| Site bridges       | [`data/path-search-bridges.json`](../data/path-search-bridges.json)      |
| Types / enrichment | [`types/trails.ts`](../types/trails.ts), [`lib/trails/`](../lib/trails/) |

## Trails vs questions

|         | Reading Trail                                        | Start with a Question                                   |
| ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Framing | Title + orientation to a tension                     | Interrogative H1 + what-it-is-not                       |
| Purpose | Reusable sequence for themes, audiences, or revisits | Accessible entrance when you arrive with a felt tension |
| Route   | `/trails/[slug]`                                     | `/questions/[slug]`                                     |

Both use the same **path stop** model under the hood.

## Creating a new trail

1. Author `semantic/trails/<slug>.yml` in **ksteffe/after-certainty** (see upstream authoring guide).
2. Ship a release so `semantic-manifest.json` includes the trail.
3. Refresh this repo’s bundled manifest (refresh-manifest skill).
4. Optionally add `trailBridges` terms in [`data/path-search-bridges.json`](../data/path-search-bridges.json).
5. Run `npm test -- lib/trails/validate.test.ts` and preview `/trails/your-slug`.

## Related

- Questions: same ownership pattern via `semantic/questions/`
- Upstream: [authoring-discovery-metadata.md](https://github.com/ksteffe/after-certainty/blob/main/docs/authoring-discovery-metadata.md)
