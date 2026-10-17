# Reader passage enrichment — reference

## Commands

```bash
# Full corpus audit (read-only)
make audit-reader-passage-links
uv run python tools/audit_reader_passage_links.py --repo .
mise run semantic:audit-reader-passages

# Faster audit without Node fragment checks (CI unit tests / smoke)
uv run python tools/audit_reader_passage_links.py --repo . --skip-fragment-check

# Propose next batch
uv run python tools/propose_reader_passage_links.py --repo . \
  --kind all --batch-size 10 --only-missing --unreviewed-only --dry-run

uv run python tools/propose_reader_passage_links.py --repo . \
  --kind sources --batch-size 10 --only-missing --write-review-log

make propose-reader-passage-links KIND=sources BATCH_SIZE=10 ONLY_MISSING=1 DRY_RUN=1

# Validate one fragment against the live reader HTML pipeline
cd apps/site && npx tsx scripts/validate-reader-passage-fragment.ts \
  --book-dir books/when-authority-outlives-accountability \
  --source-path parts/part-1-the-three-dimensions/chapter-3-effectiveness.md \
  --fragment user-content-fnref-c3-goodhart-monetary-management \
  --repo ../..
```

## Report files

| Path | Purpose |
|------|---------|
| `reports/reader-passage-links/audit.md` | Human coverage summary |
| `reports/reader-passage-links/audit.json` | Machine-readable full audit |
| `reports/reader-passage-links/candidates.md` | Latest propose batch |
| `reports/reader-passage-links/candidates.json` | Latest propose batch (JSON) |
| `reports/reader-passage-links/review-log.json` | Idempotent review statuses |

## Path and fragment rules

- Canonical chapter identity: `docs/semantic-chapter-identity.md`
- `routeKey` = `/explore/books/{editionSlug}/chapters/{chapterSlug}` from
  `src/after_certainty/manuscript/structure.py` — never synthesize from titles
- Public chapters only; edition must be in the source’s `relatedBooks`
- Citation fragments: `#user-content-fnref-{footnoteId}` (GFM / micromark)
- Heading fragments: only after confirming the id in rendered HTML
- Saved reader progress must not override a non-empty location hash
  (`RestoreReadingScroll` already skips when `location.hash` is set)

## Schema fields (sources)

```yaml
whyThisMatters: >-
  Distinguish the source author’s claim from After Certainty’s question.
readerPassagePath: /explore/books/{edition}/chapters/{chapterSlug}#user-content-fnref-{id}
```

Pattern enforced in `schema/semantic/source-entry.schema.json` and site Zod.

## File map

| Path | Role |
|------|------|
| `tools/reader_passage_links.py` | Shared audit / propose library |
| `tools/audit_reader_passage_links.py` | Audit CLI |
| `tools/propose_reader_passage_links.py` | Propose CLI |
| `apps/site/scripts/validate-reader-passage-fragment.ts` | Rendered-HTML fragment check |
| `apps/site/lib/reading/render-manuscript-html.ts` | Reader HTML pipeline |
| `apps/site/app/explore/(browse)/sources/[slug]/page.tsx` | Source CTA for passage links |
| `tests/test_reader_passage_links.py` | Python regression tests |

## Reused tooling

- `tools/audit_bibliography_semantic_drift.py` — biblio ↔ source matching
- `tools/audit_citations.py` — footnote regexes
- `tools/bibliography_parse.py` — bibliography rows
- `manuscript_structure.build_structure_for_book` — routeKey / public

## Related skills

- [semantic-sources](../semantic-sources/SKILL.md) — works / citations YAML
- [semantic-thinkers](../semantic-thinkers/SKILL.md) — people / institutions
- [semantic-enrichment](../semantic-enrichment/SKILL.md) — glossary/pattern prose (not sources)
