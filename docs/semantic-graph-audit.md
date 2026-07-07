# Semantic graph data-quality audit

Systematic read-only audit of the After Certainty semantic graph: sources, thinkers, concepts, patterns, books, relationships, slugs, and manifest consistency.

## Relationship to other checks

| Command | Scope |
|---------|--------|
| `make verify-semantic-ontology` | Hard gate: schema, YAML parse, manifest round-trip, graph lint |
| `make lint-semantic-graph` | Structural warnings (over-connected nodes, duplicate defs) |
| `make audit-semantic-metadata-quality` | Source/thinker display-field metadata only |
| `make audit-thinker-concepts` | Thinker↔concept coverage and creator slug alignment |
| **`make audit-semantic-graph`** | **Unified data-quality audit with JSON + Markdown reports (includes concept-grounding checks)** |

The unified audit **calls** the metadata-quality audit and adds broader checks. It does not replace the hard validation gate.

## How to run

```bash
make audit-semantic-graph
```

Or directly:

```bash
python3 tools/audit_semantic_graph.py --repo .
```

Optional manifest overrides:

```bash
python3 tools/audit_semantic_graph.py \
  --semantic-manifest build/semantic-manifest.json \
  --books-manifest build/books-manifest.json
```

If `build/` manifests are missing, the audit auto-discovers:

1. `build/semantic-manifest.json` / `build/books-manifest.json`
2. `docs/portfolio-audit/data/semantic-manifest.json` / `books-manifest.json` (snapshot)

For best results, generate fresh manifests first:

```bash
make verify-semantic-manifest
make verify-books-manifest
make audit-semantic-graph
```

## Output

| File | Format |
|------|--------|
| `reports/semantic-graph-audit.json` | Machine-readable (CI, automation) |
| `reports/semantic-graph-audit.md` | Human-readable summary |

## Severity rubric

| Severity | Meaning |
|----------|---------|
| **error** | Likely data bug (bad year, dangling ref, manifest divergence) |
| **warning** | Review recommended (metadata heuristic, slug damage, tautological defs) |
| **info** | Outlier or sparsity (unlinked entity, missing optional enrichment) |

The audit exits 0 by default (advisory). It does not mutate YAML or manifests.

### Heuristic tuning notes

Some checks are intentionally conservative and were refined to reduce false positives:

- **Concept tautology** — flags only when a definition restates the title without substantive content (e.g. `Agile is agile`). The house glossary pattern `Title is …` with a real explanation is allowed.
- **Institution vs creator** — skipped for `report`, `institutional_document`, `standard`, and other org-authored works where `institution` correctly mirrors the publishing organization.
- **sourceKind mismatch** — only when the **author/creator** looks institutional, not when an agency name appears in a scholarly book title (e.g. NASA in a Diane Vaughan monograph).
- **Thinker person/org** — organization names containing words like `bank` or `collaboration` are not treated as person names.
- **Long creatorNames** — multi-author lists (manifestos, consortia) are not flagged; citation blobs with years/URLs still are.
- **Multi-person thinker names** — flags person thinkers whose `name` lists multiple authors (`et al`, `, and `, long comma-separated lists). Suggests splitting into one thinker per author and linking shared sources via `creatorSlugs`.
- **Last-first thinker names** — flags bibliographic `Last, First` display order (info); editor suffixes like `, ed` are ignored for detection.

Bulk splitting of composite thinkers is supported by `tools/split_multi_person_thinkers.py` (`--apply`, then `--sync-source-names`).

To auto-apply concept-grounding warnings::

    python3 tools/apply_concept_grounding.py --repo . --apply

## What is checked

- **Source metadata** — years (including page-range misparsing), truncated titles, citation leaks, type mismatches
- **Thinker metadata** — person/org classification, empty summaries, disconnected thinkers, multi-person author lists, Last/First name order
- **Concept metadata** — missing/tautological/short definitions, sparse grounding, high-traffic thin concepts
- **Pattern metadata** — missing links, duplicate titles, original synthesis without `evidenceType`
- **Book metadata** — manifest divergence, duplicate titles, concept-count outliers
- **Relationships** — dangling refs, duplicates, unsupported labels, vocabulary inventory
- **Slug quality** — diacritic damage, collisions, filename mismatches
- **Manifest consistency** — stale portfolio-audit snapshots vs `build/`
- **Concept grounding** — sources or thinkers that should link a concept because a linked work's title/heuristic matches (e.g. Agile Manifesto → `agile`); uses conservative `TITLE_HEURISTICS` from the thinker-concept audit, not broad text matching

## Adding new checks

1. Add a function in [`tools/semantic_graph_audit.py`](../tools/semantic_graph_audit.py) returning `list[AuditIssue]`.
2. Register it in `run_audit()`.
3. Add a pytest fixture in [`tests/test_audit_semantic_graph.py`](../tests/test_audit_semantic_graph.py).

Use `get_list(entity, "relatedConcepts", "concepts")` for schema-tolerant field access.

## Waiving false positives

No waiver mechanism is implemented yet. A future optional `auditWaivers` YAML (per-entity check suppressions) can be added without breaking the schema. Until then, document known false positives in PR notes.

## Site repository (`after-certainty-site`)

The site consumes release artifacts (`semantic-manifest.json`, `books-manifest.json`). Options:

1. Publish `semantic-graph-audit.json` from this repo's CI and link to it from the site, or
2. Vendor shared audit helpers and run against downloaded manifests in the site repo.

Canonical fixes belong in this content repo under `semantic/`.
