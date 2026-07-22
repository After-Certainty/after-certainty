# Chapter identity in the semantic manifest

Additive collections `parts[]` and `chapters[]` (schemaVersion **2.2**) export manuscript structure without embedding full chapter text.

## Generation

```bash
make generate-semantic-manifest
```

Structure is parsed from each published book’s `index.md` (same link resolution as export assembly).

## Stable IDs

| Entity | Pattern |
|--------|---------|
| Part | `part-{editionSlug}-{partSlug}` |
| Chapter | `chapter-{editionSlug}-{relativePathWithoutExtAsDashes}` |

Examples:

- `part-boundary-conditions-act-3-realization`
- `chapter-why-collaboration-is-so-hard-parts-chapter-2-we-did-not-agree-to-the-same-thing`

**Rules**

1. Prefer an authored override `id` in `books/<slug>/chapter-enrichment.yml` when present.
2. Otherwise derive from the **source path**, not the display title — renaming a chapter title does not change the ID.
3. Duplicate stems (e.g. multiple `bridge.md` files) stay unique because the full relative path is encoded.
4. Position is ordinal within the edition only; do not use position alone as an external reference.

## Chapter kinds

`introduction` | `chapter` | `bridge` | `interlude` | `conclusion` | `appendix` | `afterword` | `notes` | `other`

## Authored enrichment (optional)

Create `books/<slug>/chapter-enrichment.yml`:

```yaml
version: 1
chapters:
  - sourcePath: parts/chapter-2-we-did-not-agree-to-the-same-thing.md
    summary: >
      Short manuscript-grounded summary.
    centralQuestion: "..."
    selectedConcepts: [partial-coherence]
    selectedPatterns: [disagreement-is-suppressed]
    searchAliases: [same meeting different memories]
    situations: [same-meeting-different-decisions]
    readingTransition: >
      Optional bridge to the next unit.
```

Fields project into the chapter entry when present. Full-corpus chapter enrichment is not required.

## Validation

Missing in-book source files linked from `index.md`, duplicate chapter IDs, and invalid enrichment concept/pattern slugs fail validation. Public manifests omit non-public editions.
