# Chapter identity in the semantic manifest

Additive collections `parts[]` and `chapters[]` (schemaVersion **2.2+**) export manuscript structure without embedding full chapter text.

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

`introduction` | `chapter` | `bridge` | `interlude` | `conclusion` | `appendix` | `afterword` | `notes` | `poem` | `section` | `sequence` | `other`

Poetry collections (`book.kind: poetry`) map titled part units to `poem` unless overridden.

## Authored enrichment (optional)

Create `books/<slug>/chapter-enrichment.yml`:

```yaml
version: 1
chapters:
  - sourcePath: parts/part-1/chapter-1.md
    summary: >
      Conceptual movement of the chapter (not a title paraphrase).
    centralQuestion: Narrower than the book question.
    selectedConcepts: [judgment]
    selectedPatterns: [revisability-preserves-judgment]
    situations: [feedback-stops-changing-decisions]
    searchAliases: [judgment without finality]
    transition:
      fromPrevious: Why this follows the previous unit.
      toNext: What remains open into the next unit.
```

Summaries must be manuscript-grounded. Fiction summaries should avoid spoiling more than needed for navigation and must not treat fictional events as empirical proof.

Schema: [`schema/semantic/chapter-enrichment.schema.json`](../schema/semantic/chapter-enrichment.schema.json).

## Report coverage

Completeness reports should be generated with `--manifest build/semantic-manifest.json` (Makefile default). Per-book `chapterSummaryCoverage` reports `present/total`.
