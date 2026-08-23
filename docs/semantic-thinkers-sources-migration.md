# Semantic manifest: thinkers & sources migration

Backward-compatible evolution of the semantic graph so **works** (books, articles, reports, standards, datasets, case sources) stay in `sources[]` while **thinkers** (people and institutions) can be modeled explicitly and aggregated on the site.

Related consumer work historically tracked against [after-certainty-site issues](https://github.com/ksteffe/after-certainty-site/issues); new work belongs on [`After-Certainty/after-certainty`](https://github.com/After-Certainty/after-certainty) / `apps/site/` (see rollout section below). The standalone site repository is archived in Phase 7.

## Principles

- **YAML is canonical** — [`semantic/`](../semantic/) remains the source of truth.
- **`sources` is the compatibility layer** — do not rename to `works`; add optional fields first.
- **Additive changes only** — existing manifests and site pages must keep working when new fields are absent.
- **Manifest is derived** — [`tools/generate_semantic_manifest.py`](../tools/generate_semantic_manifest.py) produces `semantic-manifest.json` for releases and the website.
- **Prefer correcting existing identities** over creating duplicates.
- **Citation-only creators** may remain source-linked without a public thinker page (`citationOnly: true`).

## Identity classes (schemaVersion 2.3)

Thinker `type`: `person` | `organization` | `author_group` | `collective`.

Optional fields: `citationOnly`, `aliases`, `formerSlugs`, `canonicalSlug` (example: `hal-daume-iii` with `formerSlugs: [hal-daum-iii]`).

---

## Current structure

### Manifest top-level keys

| Key | Required | Notes |
|-----|----------|-------|
| `manifestVersion` | yes | Currently `1`; becomes `1` or `2` when thinkers ship |
| `generatedAt`, `ref`, `releaseTag` | yes | Release metadata |
| `repository` | optional | `owner/repo` |
| `books`, `glossary`, `patterns`, `sources`, `relationships`, `ontology` | yes | Core graph |
| `situations` | emitted | Always present in generator output |
| `thinkers` | v2 optional | Top-level thinker nodes when `manifestVersion: 2` |

### Current `sourceEntry` shape

```json
{
  "id": "source-arendt-hannah-between-past-and-future",
  "slug": "arendt-hannah-between-past-and-future",
  "name": "Hannah Arendt — Between Past and Future",
  "type": "book",
  "summary": "Arendt, Hannah. Between Past and Future. New York: Penguin Books, 2006.",
  "concepts": [],
  "patterns": [],
  "relatedBooks": ["book-living-in-sediment"]
}
```

Canonical YAML lives in [`semantic/sources/`](../semantic/sources/) (~411 files). The draft pipeline ([`extract_semantic_source_drafts.py`](../tools/extract_semantic_source_drafts.py), [`promote_semantic_source_drafts.py`](../tools/promote_semantic_source_drafts.py)) parses bibliographies into work entries with `name: "Author — Title"`.

### Observed problems

1. **Conceptual mismatch** — docs label `semantic/sources/` as "Thinkers / references" but every entry is a **bibliographic work**, not a person or institution node.
2. **Fused metadata** — author and title share `name`; bibliography overloads `summary`.
3. **Weak typing** — `type` is `book`/`article` in practice; generator default `person` is unused; institutions and reports use the same schema as monographs.
4. **No thinker grouping** — multiple works per author (e.g. nine Arendt entries) have no aggregation layer.
5. **Site confusion** — book pages label individual works as "Major thinkers" under [`/explore/sources`](../) on the consumer site.

---

## Proposed v1.5 — additive source fields

`manifestVersion` stays **`1`**. All new fields are **optional** on YAML and manifest entries.

| Field | Purpose | Example |
|-------|---------|---------|
| `sourceKind` | Fine-grained work classifier | `book`, `article`, `report`, `standard`, `dataset`, `speech`, `case`, `website`, `institutional_document` |
| `creatorNames` | People or institutions behind the work | `["Hannah Arendt"]` |
| `creatorSlugs` | Stable thinker keys for site grouping | `["hannah-arendt"]` |
| `title` | Work title (separate from author) | `Between Past and Future` |
| `citation` | Full bibliography string | Plain Chicago-style line (no markdown italics; prefer over `summary` for display when set) |
| `year` | Publication year | `2006` |
| `publisher` | Publisher or issuing body | `Penguin Books` |
| `institution` | Institutional author when distinct | `World Bank` |
| `url` | Canonical external URL | `https://...` |
| `whyThisMatters` | Reader-facing relevance | Short prose |

### Field rules

- Keep legacy `type` (`book` / `article`) for backward compatibility; prefer `sourceKind` when present.
- Keep `summary` required; backfill may copy `summary` → `citation` until editors split abstract vs bibliography.
- Keep `name` as required display fallback (`"Author — Title"`).
- Store plain-text bibliography strings in `summary` / `citation` / display `name` — strip Chicago markdown italics (`*Title*`) at extract and enrich time. Manuscript bibliographies keep markdown; semantic YAML and the Explore UI do not.

### Slug conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Source (work) | `lastname-firstname-work` | `arendt-hannah-between-past-and-future` |
| Thinker (person/org) | `firstname-lastname` or org slug | `hannah-arendt`, `world-bank` |

**Do not** derive thinker slugs from source slug prefixes. Use [`backfill_source_metadata.py`](../tools/backfill_source_metadata.py) / explicit YAML to set `creatorSlugs` from parsed `creatorNames`.

### YAML example (v1.5)

```yaml
slug: arendt-hannah-between-past-and-future
name: Hannah Arendt — Between Past and Future
type: book
sourceKind: book
creatorNames:
  - Hannah Arendt
creatorSlugs:
  - hannah-arendt
title: Between Past and Future
citation: 'Arendt, Hannah. Between Past and Future. New York: Penguin Books, 2006.'
year: 2006
publisher: Penguin Books
summary: 'Arendt, Hannah. Between Past and Future. New York: Penguin Books, 2006.'
concepts: []
patterns: []
relatedBooks:
  - living-in-sediment
```

---

## Proposed v2 — top-level `thinkers` array

When canonical thinker YAML exists under [`semantic/thinkers/`](../semantic/thinkers/), the generator sets `manifestVersion: **2**` and emits `thinkers[]`. When no thinker files exist, omit `thinkers` and keep `manifestVersion: 1`.

### `thinkerEntry` shape

```json
{
  "id": "thinker-hannah-arendt",
  "slug": "hannah-arendt",
  "name": "Hannah Arendt",
  "type": "person",
  "summary": "Political theorist whose work helps frame authority, judgment, responsibility, violence, and public action.",
  "concepts": ["concept-authority", "concept-judgment"],
  "patterns": [],
  "relatedBooks": ["book-after-certainty"],
  "works": ["source-arendt-hannah-between-past-and-future"],
  "whyThisMatters": "Arendt helps distinguish authority from force and responsibility from obedience."
}
```

- `type`: `person` | `organization`
- `works[]`: canonical `source-*` ids
- Books continue to reference `source-*` ids in `books[].sources`; thinkers are a parallel aggregation layer.

### Thinker YAML layout

```
semantic/thinkers/
  hannah-arendt.yml
  world-bank.yml
```

Use [`derive_thinker_drafts.py`](../tools/derive_thinker_drafts.py) to scaffold drafts from enriched sources (`creatorSlugs`) for human review before promoting to canonical YAML.

---

## Schema changes

| File | Change |
|------|--------|
| [`schema/semantic/source-entry.schema.json`](../schema/semantic/source-entry.schema.json) | Optional v1.5 fields; `sourceKind` enum |
| [`schema/semantic/thinker-entry.schema.json`](../schema/semantic/thinker-entry.schema.json) | New thinker YAML schema (v2) |
| [`schema/semantic-manifest.schema.json`](../schema/semantic-manifest.schema.json) | Extended `sourceEntry`; optional `thinkers`; `manifestVersion: enum [1, 2]`; `situations` in required |

Required arrays on `sourceEntry` and `thinkerEntry` are unchanged for legacy fields.

---

## Generator changes

[`tools/generate_semantic_manifest.py`](../tools/generate_semantic_manifest.py):

1. **`build_sources()`** — pass through optional v1.5 fields when present in YAML.
2. **`build_thinkers()`** — load `semantic/thinkers/*.yml`; map slugs to `thinker-{slug}` ids; resolve `works` / `concepts` / `patterns` / `relatedBooks` to prefixed ids.
3. **`manifestVersion`** — `2` when `thinkers` is non-empty; otherwise `1`.
4. **Payload** — include `thinkers` only when non-empty (omit key for v1 manifests).

---

## Validation strategy

| Layer | Tool |
|-------|------|
| YAML entities | `make validate-semantic-entities` — sources + thinkers dirs |
| Manifest JSON | `tools/validate_semantic_manifest.py` |
| Full gate | `make verify-semantic-ontology` |
| Tests | `tests/test_semantic_manifest_pipeline.py`, `tests/test_source_metadata_backfill.py` |

---

## Release compatibility

```text
Phase 1: schema + generator accept optional source fields (manifestVersion=1)
    ↓
Phase 2: backfill YAML metadata (creatorNames, title, citation, sourceKind)
    ↓
Phase 3: site issues 1–2 (enriched sources + derived thinkers)
    ↓
Phase 4: semantic/thinkers YAML + manifestVersion=2
    ↓
Phase 5: site issues 3–7 (thinker pages, book split, JSON-LD)
```

- [`merge_release_assets.py`](../tools/merge_release_assets.py) never copies old manifests; each release regenerates `semantic-manifest.json` from current YAML.
- Post-release cache revalidation (`semantic` target) already runs from CI.
- First enriched release keeps all legacy fields populated — no breaking change for the site.

---

## Tooling

| Tool | Purpose |
|------|---------|
| [`backfill_source_metadata.py`](../tools/backfill_source_metadata.py) | Batch-add v1.5 fields from `name`/`summary` heuristics |
| [`promote_semantic_source_drafts.py`](../tools/promote_semantic_source_drafts.py) | Preserve `title`, `creatorNames`, `creatorSlugs`, `citation` on promote |
| [`derive_thinker_drafts.py`](../tools/derive_thinker_drafts.py) | Aggregate sources by `creatorSlugs` into reviewable thinker drafts |

---

## Site rollout (`apps/site/`)

| Stage | Behavior | Tracking issue |
|-------|----------|----------------|
| 1 | `/explore/sources` unchanged | — |
| 2 | Use v1.5 fields when present | Enriched source metadata |
| 3 | Derive thinkers from `creatorSlugs` | Derive thinker groupings |
| 4 | Prefer `manifest.thinkers` | Top-level thinkers array |
| 5 | `/explore/thinkers` index + detail | Thinker pages |
| 6 | Book page: thinkers vs research sources | Split book-page sections |
| — | JSON-LD for sources and thinkers | JSON-LD updates |

**Cursor skills**

| Repo | Skill | Role |
|------|-------|------|
| after-certainty | `semantic-sources` | Bibliography → `semantic/sources/` + v1.5 metadata |
| after-certainty | `semantic-thinkers` | `semantic/thinkers/` + manifest v2 |
| after-certainty-site | `refresh-manifest` | Pull release manifest; check `manifestVersion`, optional `thinkers[]`, enriched `sources[]` |

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Site Zod schema strips new fields | Land site issue 1 before relying on enriched manifest in production UI |
| Thinker vs source slug mismatch | Document `firstname-lastname` for thinkers; never infer from source slug prefix |
| Institutional sources misclassified | Use `sourceKind: institutional_document`; thinker `type: organization` |
| Duplicate works (author-string variants) | Separate dedupe pass; not blocking v1.5 |
| `summary` vs `citation` drift | Backfill copies summary→citation; site prefers `citation` for bibliography display |

---

## Commands

```bash
# Validate after editing semantic YAML
make verify-semantic-ontology

# Backfill v1.5 metadata (dry-run first)
python3 tools/backfill_source_metadata.py --repo . --dry-run
python3 tools/backfill_source_metadata.py --repo .

# Scaffold thinker drafts from enriched sources
python3 tools/derive_thinker_drafts.py --repo . --dry-run

# Regenerate manifest locally
python3 tools/generate_semantic_manifest.py --repo . --out /tmp/semantic-manifest.json
python3 tools/validate_semantic_manifest.py --repo . --manifest /tmp/semantic-manifest.json
```
