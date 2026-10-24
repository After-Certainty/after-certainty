# Reader Passage Editorial Batch — Phase 10

Continuation of [#703](https://github.com/After-Certainty/after-certainty/pull/703) (Phase 8) and [#722](https://github.com/After-Certainty/after-certainty/pull/722) (Phase 9).

## Editorial policy

Review a **bounded set of twelve citation clusters**, not an arbitrary number of source rows. Distinguish source facts from After Certainty's inferences and prefer an intentionally shared note over a manufactured independent claim. Source-link confidence is not inferred from the Phase 9 heuristics: those are review questions. Do not upgrade an evidence level just because a title resembles a claim.

**Verification depth:** `publisher/author/primary webpage + manuscript` where specified below; otherwise `footnote/metadata + manuscript`. No claim of a page-by-page scholarly read. A working URL and valid footnote are necessary but not sufficient for intellectual relevance.

## Applied — four clusters, eight previously missing paths

### 1. Tiananmen: movement, crackdown, later memory (three works)

**Outcome A — separate genuinely distinct claims.**

- **Craig Calhoun, *Neither Gods nor Emperors* (1994):** the organization, demands, and protest movement. New `[^c7-tiananmen-protest]` on the student-movement passage.
- **Timothy Brook, *Quelling the People* (1992):** military suppression; retain the existing `[^c7-tiananmen]` path but narrow its footnote to Brook.
- **Louisa Lim, *The People's Republic of Amnesia* (2014):** later suppression, censorship, and politics of public memory. New `[^c7-tiananmen-memory]` on the later-commemoration passage.

The book's moral interpretation of Deng's accomplishments versus accountability remains its own, not a thesis attributed to any one historian.

**Verification:** source-specific publisher/author descriptions and manuscript:
[Calhoun, UC Press](https://www.ucpress.edu/books/neither-gods-nor-emperors/paper);
[Calhoun author bibliography](https://cjcalhoun.com/paper/5f34019c-3e89-428b-8ad9-9cd72442ae24);
[Lim author's description](https://www.louisalim.com/peoples-republic-of-amnesia).
Brook's role rests on manuscript attribution and bibliographic identity in this pass, not a chapter-by-chapter book reread.

### 2. NUMMI closing: the corporate decision and the workers' farewell (two works)

**Outcome A — distinguish event mechanisms from affected people's experience.**

- **Nick Bunkley (New York Times, 2010):** the ending of the GM-Toyota joint venture. Keep and narrow `[^c5-nummi-close]` as Bunkley-specific.
- **Tom Abate (San Francisco Chronicle, 2010):** workers saying goodbye to the Fremont facility. Create `[^c5-nummi-workers]` on a short newly distinct event sentence.

**Verification:** titles, bibliography URLs, and manuscript; corroborating contemporaneous reporting:
[San Francisco Chronicle's closure reporting](https://www.sfchronicle.com/business/article/last-truck-rolls-off-nummi-assembly-line-3269113.php).
The structural point — authority to improve work is not ownership over whether work survives — belongs to the book.

### 3. Hull-House founding (one linked work)

**Outcome B — primary first-person source.**

- **Jane Addams, *Twenty Years at Hull-House* (1910):** founding the settlement with Ellen Gates Starr in 1889. Narrow the co-cited `[^h1]` to the memoir, rather than leaving an undifferentiated museum-timeline reference.

**Verification:** [Addams's original text in the Jane Addams Digital Edition](https://digital.janeaddams.ramapo.edu/items/show/6264), [Project Gutenberg](https://www.gutenberg.org/ebooks/1325), and manuscript.

### 4. Taylor Branch: three distinct periods in King's work (three works)

**Outcome A — period-specific citations, preserving the arguments.**

- **Parting the Waters (1954–63):** Birmingham and the March on Washington in 1963; substitute `[^c4-branch-1963]` for the former shared umbrella citation.
- **Pillar of Fire (1963–65):** Selma and its voting-rights struggle; new `[^c4-branch-selma]`.
- **At Canaan's Edge (1965–68):** the campaign into Northern cities, including Chicago's housing struggle; new `[^c4-branch-chicago]`.

The former `[^c4-branch-garrow]` named all three Branch volumes, plus Garrow, for multiple chronologies. This revision retains other Garrow citations elsewhere in the chapter rather than assigning them a false single-work link.

**Verification:** [Pillar of Fire, publisher](https://www.simonandschuster.com/books/Pillar-of-Fire/Taylor-Branch/9780684848099);
[At Canaan's Edge, publisher](https://www.simonandschuster.com/books/At-Canaans-Edge/Taylor-Branch/9780684857138);
[Smithsonian bibliographic description of the latter](https://www.si.edu/object/canaans-edge-america-king-years-1965-68-taylor-branch%3Asiris_sil_783838).
Title/coverage verification, not proof of each interpretive proposition in the manuscript.

## Reviewed but not linked — eight clusters

The following deliberately **remain deferred**; their citations are not failures merely because they are shared. Previous Phase 8 deferral decisions are preserved in the review log.

| Cluster | Outcome | Rationale |
|---|---|---|
| Andrew Luck retirement, AP Marot + Colts.com Walker | **C — preserve shared** | Two perspectives on one retirement announcement; no distinct sourced claims to separate |
| Kaepernick grievance filed, AP + ESPN | **C — preserve shared** | Same October 2017 filing, independent corroboration |
| Kaepernick grievance settled, AP + Reuters | **C — preserve shared** | Same February 2019 settlement; do not manufacture two claims |
| Alexander, *Timeless Way* + *A Pattern Language* | **C — preserve shared** | Joint architectural-theory basis for the manuscript's sediment interpretation |
| Emergency boarding, ACEP + IOM | **B/C — preserve shared** | ACEP already has a primary path from Phase 8; IOM supplies contextual system-level corroboration, not a unique new claim |
| Bob Knight coaching record and methods, IU + AP + Feinstein | **C — defer** | Mixed biographical and interpretive material; attributing specific claims to one source needs fuller reading |
| Bob Knight chair episode, contemporary reporting | **C — defer** | One event with incident and penalty coverage; avoid link promotion before confirming a specific cited work and exact incident/discipline division |
| Kaepernick 2018 anthem policy, ESPN + NFL.com updates | **C — preserve shared** | Policy adoption versus subsequent standstill should only be split if prose engages distinct event dates explicitly |

These eight clusters are editorial outcomes, not claims that source URLs were all reread. Their citation configurations were compared against the relevant manuscript footnotes and Phase 8 records.

## Reconciliation and validation

- **Eight** new `readerPassagePath` + `whyThisMatters` pairs added; **one** previously shared path (Brook) becomes sole-work tied.
- Historic deferred/proposed candidate keys that no longer point to an existing note are marked `skipped` as superseded, with replacement paths. New work-specific keys are `applied`; intentional shared-note entries remain `deferred`.
- All source schema changes are limited to existing sources associated with the cited books. There are no changes to the one-path-per-source schema.
- The `audit.md` and `audit.summary.json` checked-in snapshots reflect the previous Phase 8 audit until a complete renderer-backed `make audit-reader-passage-links` regeneration is run. **Do not infer new totals merely by arithmetic;** automatic matching and the audit may classify references differently.
- Validation commands before merging:

```bash
uv run pytest tests/test_reader_passage_phase10.py tests/test_reader_passage_links.py
uv run python tools/validate_semantic_entities.py --repo .
make audit-reader-passage-links
```

If audit output differs, use the generated files as authoritative; do not manually set coverage counts. The CI site/book export workflows must remain green. Fragment checks should verify all eight new targets before merging.

## Later work

A later editorial batch can examine Bob Knight's incident/penalty reporting, the NFL policy's changed status, and the broader many-to-many source model *only where distinct authored claims justify them*. Do not optimize for a higher linked-source percentage at the expense of clear attribution.
