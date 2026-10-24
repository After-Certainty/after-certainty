---
name: reader-passage-enrichment
description: >-
  Audits and enriches connections from semantic sources and thinkers to
  specific online reader passages. Use for source-to-chapter links, thinker
  discovery, missing citations, verifying readerPassagePath, or enriching
  the next batch of source pages.
---

# Reader passage enrichment

Make genuine intellectual relationships discoverable: visitors who land on a
**source** or **thinker** page should reach the specific chapter or passage
where After Certainty examines those ideas.

This skill does **not** replace **semantic-sources** or **semantic-thinkers**.
It sits downstream of them and focuses on `readerPassagePath`,
`whyThisMatters`, manuscript citations, and (later) thinker-page derivation.

Pilot precedent: PRs #689 / #690 (Goodhart, Kahneman–Klein, Amershi).

## Model

| Layer | Where | Role |
|-------|-------|------|
| Source work | `semantic/sources/*.yml` | Optional `readerPassagePath` + `whyThisMatters` |
| Thinker | `semantic/thinkers/*.yml` | Derive destinations from verified works (no new schema in v1) |
| Manuscript | `books/**/*.md` | GFM footnotes → `#user-content-fnref-{id}` |
| Reader | `/explore/books/{edition}/chapters/{chapterSlug}` | Public `routeKey` + fragment |

`readerPassagePath` pattern:

```text
/explore/books/{editionSlug}/chapters/{chapterSlug}#user-content-fnref-{citationId}
```

Prefer citation-reference anchors. Heading anchors are acceptable only when
the section is the genuine locus of discussion and no citation exists yet.

## Evidence levels

| Level | Meaning | Typical action |
|-------|---------|----------------|
| **A** | Citation invocation tied to the authored fragment + validated public path + fragment in rendered HTML | Keep / surface |
| **B** | Specific chapter passage with textual evidence; missing path, untied path, or shared/ambiguous footnote | Propose deep link / editorial confirm |
| **C** | Plausible theme; needs editorial judgment | Review; do not auto-link |
| **D** | Bibliography / `relatedBooks` only | Do **not** fabricate discussion |
| **E** | No reliable match | Skip |

Surname hits, keyword overlap, and bibliography rows alone never become A/B.

## 1 — Audit current coverage

```bash
make audit-reader-passage-links
# or: uv run python tools/audit_reader_passage_links.py --repo .
# or: mise run semantic:audit-reader-passages
```

Writes:

- `reports/reader-passage-links/audit.md`
- `reports/reader-passage-links/audit.json`

## 2 — Select a bounded batch

```bash
uv run python tools/propose_reader_passage_links.py --repo . \
  --kind all --batch-size 10 --only-missing --unreviewed-only --dry-run

uv run python tools/propose_reader_passage_links.py --repo . \
  --kind sources --batch-size 10 --only-missing --write-review-log
```

Filters: `--kind sources|thinkers|all`, `--book`, `--slug`, `--only-missing`,
`--only-invalid`, `--batch-size`, `--unreviewed-only`, `--ambiguous-only`.

### Phase 9: explainable citation disambiguation (read-only)

```bash
uv run python tools/propose_reader_passage_links.py --repo . \
  --kind sources --ambiguous-only --only-missing \
  --unreviewed-only --batch-size 15 --dry-run

# Omit --dry-run to write candidate suggestions (NOT source YAML).
```

The source queue now carries `disambiguation_hints` in candidate JSON and a
readable list in Markdown. Confidence is **confidence in the detected cue**,
not probability that a source supports the manuscript. Heuristics identify
shared footnotes; existing sole-work citations in the same edition; titles
suggesting event versus retrospective framing; potentially corroborating
same-event titles; and matches needing identity verification. Compare source
bodies/dates before any editorial action. These hints do **not** change
evidence levels, overwrite curated paths, rewrite footnotes, or automatically
mark candidates approved. `deferred` remains eligible for later review.

When `--ambiguous-only` is used, the queue includes shared or ambiguous
footnote matches, not ordinary prose-only or thinker candidates. Leave it off
for standard enrichment.

Writes `candidates.{md,json}` and optionally updates `review-log.json`
(`proposed|deferred|approved|rejected|applied|skipped`). Use `deferred`
(not `skipped`) for shared-footnote work that should return in a later batch.

## 3 — Review the evidence

For each candidate:

1. Open the manuscript file and line range.
2. Confirm the surrounding argument actually engages the work.
3. Prefer an existing `[^id]` citation; verify the fragment with the renderer.
4. If a citation is appropriate but missing, propose a **minimal** footnote —
   never bulk-insert or invent discussion for bibliography-only (D) rows.
5. Flag `needsEditorialReview` items for human/Cursor judgment.

Fragment check (same pipeline as the reader; workspace-pinned `jiti`, no network):

```bash
node apps/site/scripts/validate-reader-passage-fragment.mjs \
  --book-dir books/<edition> \
  --source-path <chapter.md> \
  --fragment user-content-fnref-<id> \
  --repo .
```

Level **A** means a public path whose fragment is the matched citation
invocation (`#user-content-fnref-{id}`) — a *mechanical* tied-citation
condition, not editorial approval of philosophical relevance. Mechanical
footnote matches are level **B**; all newly proposed connections still need
editorial review before YAML enrichment.

## 4 — Propose editorial changes

- Set `readerPassagePath` only when the destination is public, in
  `relatedBooks`, and the fragment exists in rendered HTML.
- Write `whyThisMatters` that distinguishes the source author’s claims from
  After Certainty’s interpretation. No generic filler.
- Do **not** overwrite an existing curated path without explicit approval.
- Do **not** add `relatedBooks` from keyword similarity alone.

## 5 — Apply approved changes

PR1 tooling is read-only for YAML/manuscripts. Apply by editing canonical
YAML (and, when needed, a focused manuscript citation) after review.

Update `review-log.json` statuses to `approved` / `applied` / `rejected` /
`skipped` (terminal alternatives) or `deferred` (revisit later) so later
sessions advance correctly. Progress must be recoverable from canonical YAML
+ the review log — not Cursor chat history.

## 6 — Validate

```bash
make verify-semantic-ontology
cd apps/site && npx vitest run lib/reading/render-manuscript-html.test.ts
make audit-reader-passage-links   # coverage should improve
```

## 7 — Focused PR

Small batches (≈5–10 high-confidence sources). No hundreds of content edits.
No automatic PR creation from a read-only audit.

## 8 — Resume later

Re-run audit + propose with `--unreviewed-only`. Completed links remain in
YAML; rejected/applied keys stay in `review-log.json`.

## Thinker pages (derivation design)

Do **not** add thinker-level passage fields unless source relationships cannot
express the connection.

Preferred UX (later PR): on a thinker page, show **Where these ideas appear
in After Certainty** by deriving from that thinker’s works that already have
validated `readerPassagePath` values — book + chapter title, short
connection text (from the work’s `whyThisMatters`), deep link, attribution to
the work. Multiple works → multiple destinations. Keep the mobile list compact;
omit weak (C/D/E) links.

## Do not

- Maximize backlinks or fabricate citations
- Autogenerate filler `whyThisMatters`
- Bulk-rewrite manuscripts
- Treat bibliography-only as verified engagement
- Silently treat a missing fragment as a successful audit
- Create PRs during read-only audit/propose runs

## Reference

See [reference.md](reference.md) for commands, path rules, and file map.
