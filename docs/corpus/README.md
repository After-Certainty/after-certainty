# Corpus overview

The After Certainty **corpus** is the authoritative content layer of this monorepo: published manuscripts plus the semantic graph that connects them.

## Layout

| Path | Contents |
|------|----------|
| [`books/`](../../books/) | Publishable manuscripts (`index.md` + `book.yml` + chapters) |
| [`semantic/`](../../semantic/) | Concepts, patterns, situations, thinkers, sources, songs, playlists, questions, trails, challenges, shelves, relationships |
| [`corpus/`](../../corpus/) | Supporting fixtures (for example song lyrics used by Listen) |
| [`schema/`](../../schema/) | JSON Schema for `book.yml`, semantic entities, and the semantic manifest |
| [`upcoming/`](../../upcoming/) | Scaffolds and portfolio status until a work is promoted into `books/` |

## Start here

| If you want… | Go to |
|--------------|--------|
| Full book path list | [`books.md`](books.md) |
| Reading order / title pairs | [`../series-guide.md`](../series-guide.md) |
| New-reader onboarding | [`../portfolio-reader-map.md`](../portfolio-reader-map.md) |
| Semantic manifest contract | [`../semantic-manifest-contract.md`](../semantic-manifest-contract.md) |
| Relationship types | [`../semantic-relationship-types.md`](../semantic-relationship-types.md) |
| Chapter identity / routes | [`../semantic-chapter-identity.md`](../semantic-chapter-identity.md) |
| Authoring discovery metadata | [`../authoring-discovery-metadata.md`](../authoring-discovery-metadata.md) |
| Pattern language | [`../after-certainty-pattern-language.md`](../after-certainty-pattern-language.md) |
| Semantic enrichment agents | [`../agents/semantic/`](../agents/semantic/) |
| Live website catalog | [after-certainty.com/explore/books](https://www.after-certainty.com/explore/books) |

## How the corpus reaches the site

1. Edit `books/` and/or `semantic/` YAML.
2. Generate the semantic manifest: `npm run corpus:build-manifest` (writes under `build/`).
3. Install for local site use: `npm run site:install-local-manifest`.
4. Run the site: `npm run site:dev:local` (or `npm run site:dev:watch` to regenerate on change).

Public release manifests remain available for external consumers; the website builds from the same-checkout local manifest. Details: [`../task-orchestration.md`](../task-orchestration.md), [`../../apps/site/docs/semantic-manifest.md`](../../apps/site/docs/semantic-manifest.md).
