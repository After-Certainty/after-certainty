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

# Phase 9 triage: multi-work / ambiguous footnotes with explainable review hints
uv run python tools/propose_reader_passage_links.py --repo . \
  --kind sources --ambiguous-only --only-missing --unreviewed-only \
  --batch-size 15 --dry-run

uv run python tools/propose_reader_passage_links.py --repo . \
  --kind sources --batch-size 10 --only-missing --write-review-log

make propose-reader-passage-links KIND=sources BATCH_SIZE=10 ONLY_MISSING=1 DRY_RUN=1

# Validate one fragment against the live reader HTML pipeline (pinned jiti; no npx)
node apps/site/scripts/validate-reader-passage-fragment.mjs \
  --book-dir books/when-authority-outlives-accountability \
  --source-path parts/part-1-the-three-dimensions/chapter-3-effectiveness.md \
  --fragment user-content-fnref-c3-goodhart-monetary-management \
  --repo .
```

## Report files

| Path | Purpose |
|------|---------|
| `reports/reader-passage-links/audit.md` | Human coverage summary |
| `reports/reader-passage-links/audit.summary.json` | Compact tracked totals + top opportunities |
| `reports/reader-passage-links/audit.full.json` | Full corpus dump (gitignored; `--write-full-json`) |
| `reports/reader-passage-links/candidates.md` | Latest propose batch |
| `reports/reader-passage-links/candidates.json` | Latest propose batch (JSON) |
| `reports/reader-passage-links/review-log.json` | Idempotent review statuses |

`anchor_exists` on candidates is `true`/`false` only after the reader HTML check;
`null` means unverified. Newly proposed connections always set
`needsEditorialReview: true` until approved/applied in the review log.

Propose supports `--max-per-source N` (default 3) so rejecting the first
footnote still surfaces alternate chapter/footnote candidates under
`--unreviewed-only`.

### Review-log states

| Status | Meaning |
|--------|---------|
| *(absent)* | Never queued — eligible for `--unreviewed-only` |
| `proposed` | In a prior batch; **skipped** by `--unreviewed-only` so later batches advance |
| `deferred` | Parked for a later batch (e.g. shared footnote needing disambiguation); **still eligible** under `--unreviewed-only` |
| `approved` | Editorially accepted; awaiting YAML/manuscript apply |
| `applied` | Canonical YAML (and any citation) updated |
| `rejected` / `skipped` | Terminal — do not re-propose (deliberately rejected alternatives after choosing another destination) |

Stable candidate keys are `kind:slug:routeKey#fragment` (includes footnote id when present).
To re-queue a terminal item, delete its review-log entry (or clear `status`).
Use `deferred` (not `skipped`) when the work should return in a later batch.

### Editorial spot-check rubric (before apply)

Mechanical level **A**/tied citation is necessary but not sufficient. For each
candidate, confirm in one pass:

1. **Source claim** — What does this work actually establish (method, period,
   finding)? Do not invent longitudinal results, surveys, or endorsements the
   text does not support.
2. **AC inference** — What does After Certainty add? Keep that in
   `whyThisMatters` as the book’s question/extension, not as the source’s claim.
3. **Footnote identity** — Does `[^id]` name *this* work (title/year/period),
   alone? Multi-work notes, chronological mismatches (book ends before the
   cited event), and “Author and related writings” generics → **defer** or
   narrow the footnote before linking.
4. **Landing sentence** — Does the invocation sit on prose that engages the
   source, or only on an adjacent theme? Relocate the `[^id]` or defer if the
   bridge is only structural.
5. **Bibliographic identity** — Spot-check hard identifiers against primary
   records before apply. For DOI/URL citations: open the DOI/landing page and
   confirm title, authors, year/venue match the YAML *and* the manuscript
   footnote (do not trust slug/author strings alone). For government hearings
   and testimony: confirm hearing date and committee (Senate vs House;
   joint vs single), and keep `type`/`sourceKind` as speech or
   institutional_document—not book. Mismatches are source-identity errors;
   fix YAML + footnote (+ bibliography) together, or defer.

Sample stratified across books on large batches; do not treat audit A% as
editorial completion.

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
| `apps/site/scripts/validate-reader-passage-fragment.mjs` | Rendered-HTML fragment check (pinned `jiti`) |
| `apps/site/scripts/validate-reader-passage-fragment.ts` | Legacy TS twin — do not run via `npx tsx` |
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
