# When Others Look to You - Drafting Process

## Purpose

This document defines the drafting workflow for building the book in a structured, review-driven way.

## Export and Production Notes

- Use `docs/reference.docx` as the canonical Word template for `.docx`
  exports.
- The template defines the `Pattern Block`, `Pull Quote Block`, and
  `Vignette Block` styles used by manuscript display blocks.
- Keep technical export/configuration instructions in docs files like this
  one, not in reader-facing manuscript prose.
- Recommended export command:
  `make export-docx DIR=books/when-others-look-to-you/v1`
- Kindle EPUB (only export path; custom-style blocks are flattened for device
  readers, shallow nav TOC):
  `make export-kindle-epub DIR=books/when-others-look-to-you/v1`
  In the prep step (`tools/kindle-flatten.py --flatten-custom-blocks`),
  **Pattern Block**, **Pull Quote Block**, and **Vignette Block** are all
  converted to Markdown blockquotes (`>`) so boundaries read clearly in EPUB;
  Word exports keep the named styles from `reference.docx`.
- Kindle exports use `BookCover.png` as EPUB cover metadata and remove
  the inline cover image from in-book reading flow so title-page text
  appears first.
- Fixed-layout figures (e.g. the pattern-groups triangle in the introduction)
  live as SVG under `docs/diagrams/` and are rasterized to
  `export-assets/diagrams/*.png` before Pandoc runs. **`make export-docx`**
  and the Kindle prep step (`tools/kindle-flatten.py`) both call
  `tools/diagram_rasterize.py` so PNGs track SVG mtimes. Install **librsvg**
  (`rsvg-convert`) or **ImageMagick** (`magick`) for that conversion.
- Post-processing removes the generated EPUB cover page from spine order
  while keeping the metadata cover, so readers open to title-page text.
- EPUB navigation uses ``--toc-depth=1``: the table of contents lists Part
  headings (from ``index.md``), each file’s top-level ``#`` title (bridges,
  chapters, front/back matter), and omits ``##``/``###`` subsection titles.
  Part labels are inserted by ``tools/kindle-flatten.py`` before the first
  linked file in each ``## Part …`` block.

## Branch and PR Workflow (Applies Throughout)

- Use one branch per part.
- Branch naming convention is mandatory: `<book-slug>-part-<N>`.
- For this manuscript, `<book-slug>` is `when-others-look-to-you`.
- Part branch names for this manuscript must therefore be:
  - `when-others-look-to-you-part-1`
  - `when-others-look-to-you-part-2`
  - `when-others-look-to-you-part-3`
- `<N>` is the numeric part number (no word forms such as `one`).
- Create each part branch from the latest `main` before drafting that part.
- Keep all chapter (and bridge, if present) work for that part on its corresponding part branch.
- Back matter may use a dedicated branch when explicitly scoped as a
  separate drafting phase (current: `when-others-look-to-you-back-matter`).
- Do not commit per chapter or per bridge.
- When the author explicitly marks a full part as approved, create one consolidated commit for that part, then push the part branch.
- For front matter, draft and review as one batch and create one consolidated commit when explicitly approved.
- Open one pull request per part branch into `main` when that part is complete and approved.

## Step 1: Refactor the Skeleton

Start by refactoring `skeleton.md` into `index.md` and splitting the content into the target manuscript file structure.

Requirements:

- `index.md` becomes the hub document.
- `index.md` links all manuscript sections together (parts/bridges if used, plus chapters).
- The manuscript structure must follow the file and style rules in `docs/book-rules.md`.

## Step 2: Draft Sequentially (Part-at-a-Time)

Draft one full part at a time for review.

Within the active part, progress in sequence:

1. Part bridge (if used)
2. Chapter 1 in the part
3. Chapter 2 in the part
4. Continue until all chapters in the part are drafted

Do not switch to the next part until the current part is fully approved.

## Phase A: Section Draft and Audit (Before Approval)

## Step 3: Rule Compliance Check During Part Drafting

After drafting each section within the active part (bridge/chapter), run a compliance check against `docs/book-rules.md`.

For each check, provide:

- A brief summary of overall alignment
- Any rule mismatches or weak spots
- Any recommended fixes before review
- Confirm **interpretive register** alignment (**Interpretive register (watch, not checklist)** in `book-rules.md`): observation language over checklist-style bullets, tests-as-headings, or evaluator framing in chapters and bridges
- If pull-quotes are used in this manuscript, confirm expected pull-quote usage/placement for the chapter

## Step 3a: Reader-facing leakage check (when relevant)

When editing **glossary**, **typographical conventions**, **index.md**, **back matter**, or any prose where writer instructions could creep in, run the grep sweeps in **`docs/reader-facing-scope.md`** (**Pass: keep reader-facing prose reader-facing**). That file also lists which paths are reader-facing vs writer-facing for v1.

## Step 4: Echo Pass (Repetition Check)

After each section draft in the active part, run an echo pass against previously drafted material to prevent heavy repetition.

For each echo pass:

- Check for repeated phrasing, repeated claims, and repeated sentence patterns
- Flag overlap that feels duplicative rather than intentionally reinforcing
- Suggest concise rewrites to preserve progression and reduce echo

## Step 5: Editorial Pass (Clarity and Mechanics)

After each section draft in the active part, run an editorial pass focused on readability and standard prose quality.

**Typographical conventions (mandatory for every editorial pass):** Skim
`front-matter/typographical-conventions.md` (brief reader-facing map). Apply
full layout and glossary rules in `docs/book-rules.md` (**Plain speak (house
style)**, pull quotes, Pattern Blocks, vignettes, named dynamics). Run the
mechanical scans in **`docs/typography-check.md`** on
the edited files (or the full manuscript paths listed there) before treating the
pass as complete. Expect zero `**` inside Pull Quote and Vignette blocks and no
extra bold in Pattern Block bodies after the `**Pattern: …**` title line.

At minimum, check for:

- **Plain speak (house style):** Follow **Plain speak (house style)** in
  `docs/book-rules.md` (concrete verbs, cue-taking phrasing, bridge plainness,
  reader-facing conventions scope).
- **Sentence length and running sentences:** Prefer short, direct sentences as
  the house default; avoid long running sentences that pile clauses or steps.
  Split or simplify for clarity where possible (see **Sentence Discipline** and
  **Editorial pass: complicated sentences** in `docs/book-rules.md`; includes a
  before/after example from Chapter 1)
- Stacked negation and avoidable double negatives
- Bold-titled dynamics: do not call them “patterns” in prose; use negation or
  plain conditions (see **Named dynamics** in `docs/book-rules.md`)
- **Pattern Block bodies:** for renewing/adjusting titles, **positive-only**
  inside the block; no “when it breaks” second half (see **Pattern Block
  bodies—positive-only for renewing dynamics** in `docs/book-rules.md`)
- **Negated titles** in prose use title-case echoes (**Dissent is No Longer
  Welcomed**, **Leaders Do Not Feel the Consequences**—see `docs/book-rules.md`
  (paragraph beginning “When prose names the *negation*”)
- Running prose may use **Learning Collapse** (singular) for fluency; Pattern
  Block headings and lists stay **Learning Collapses** (see **Learning
  Collapses** vs **Learning Collapse** in `docs/book-rules.md`)
- **Word valence:** forming/adjusting territory vs eroding—avoid
  obedience-loaded or blame-loaded wording in neutral formation unless the line
  is explicitly about harm or drift (see **Word valence** in `docs/book-rules.md`
  and **Valence** in `docs/editorial-vocabulary.md`)
- Distinguish **correction** and **circulation** in running prose (sentence case; see
  `docs/book-rules.md`); avoid lowercase *circulation* for structural claims—use the glossary terms or plain English that cannot be mistaken for them
- Bold titles: let titles **complete** sentences with varied wording—**not** the
  same “If so / This is where / That is when” habit in every section (see
  **Vary how titles land** in `docs/book-rules.md`); avoid meta wrappers (“the
  label for,” “refers to,” “is about”) when a natural completion works; do not
  force clause-shaped titles into “Can **[Title]** still happen?” (see **Named
  dynamics** in `docs/book-rules.md`)
- Redundant modifiers and filler phrasing
- Punctuation and consistency issues that reduce clarity
- Pull-quote formatting consistency when pull-quotes are used (for example, no bold text inside pull-quotes; confirm with **`docs/typography-check.md`**)
- Pull-quote confidence calibration against chapter evidence (avoid absolute pull-quote claims unless clearly justified)
- **Interpretive register:** no new **ask:** + bullet question lists, stacked rubric lists, or **test/check** subheadings in chapter/bridge body prose unless the section is reference material (see **Interpretive register (watch, not checklist)** in `book-rules.md`)

## Step 5.5: Literary-Flow Micro-Pass

After each section-level editorial pass, run a literary-flow micro-pass
to prevent punchy fragmentation and preserve sustained prose rhythm.

At minimum:

- Merge unnecessary one-line paragraphs into fuller, coherent paragraphs.
- Remove line breaks used only for emphasis.
- Keep sentence rhythm varied while avoiding manifesto-style cadence.
- Ensure front and back matter read as continuous reader-facing prose.
- In scene-based openings, check for accidental staccato and merge into sustained paragraphs unless brief fragmentation is intentionally structural.
- Flag repeated sentence stems (for example, "They learned..." repeated 3+ times) and consolidate unless repetition is deliberately structural.
- Read revised passages aloud and rewrite any section that still sounds like line-by-line emphasis.

## Step 5.75: Plain-Language and Reader-Prose Pass

After the literary-flow micro-pass, run a plain-language pass to reduce
technical and process-heavy phrasing. **Authoritative habits:** **Plain speak
(house style)** in `docs/book-rules.md` (word-level defaults, bridges, what not
to strip).

At minimum:

- Apply **Plain speak (house style)** in `docs/book-rules.md` on top of this
  checklist (overlap is intentional—this step enforces the locked-in style).
- Replace avoidable jargon with common reader-facing wording.
- Rewrite process-language phrasing ("test," "mechanism," "diagnostic," "run pass") into natural prose where possible.
- Apply **interpretive register** cleanup: prefer **watch / read / notice / track** over **evaluate / assess** framing; convert checklist-shaped bullets into prose where they read as instruments (**Interpretive register (watch, not checklist)** in `book-rules.md`).
- Keep core conceptual terms only when they are necessary to meaning.
- Convert abstract phrasing into concrete language without flattening precision.
- Run a **spoken-style lock pass** (see **Clarity lock (spoken explanatory style)** in `book-rules.md`):
  - simplify 5-8 definition-style lines (`X tracks...`, `X means...`) into plain explanation;
  - break 3-5 dense analytic paragraphs into short stepwise claims;
  - replace 3-5 abstract phrases with everyday alternatives (for example,
    *feedback comes back*, *the real story*).
- Confirm the section reads like book prose for readers, not internal workflow language.
- Check for meta prose drift in analytical paragraphs (for example:
  "this chapter," "this section," "in this book") and rewrite into direct
  claim language unless the line is an explicit navigation/handoff.
- Run a renewal/erosion/vitality/decay neutrality check: ensure plain-language edits do
  not convert structural descriptors into moral praise/blame (for
  example: avoid replacing structural terms with "good/bad people" or
  equivalent moral framing). Use direction words (renewal, erosion, …) and
  state words (vitality, vibrant, decay, decaying) as in `book-rules.md`,
  **Direction vs state**.
- Check local terminology consistency (for example, avoid unnecessary drift between near-synonyms such as "group"/"organization" when no meaning difference is intended).
- Keep domain-specific terms primarily inside vignette scene blocks; in
  non-vignette prose, prefer domain-agnostic wording unless the argument
  depends on a specific domain.
- Allow domain-specific wording in clearly marked concrete-example
  passages when it materially improves clarity; keep surrounding analytic
  prose domain-agnostic.
- Run a domain-language lexicon scan on non-vignette prose (for example:
  business shorthand such as "metrics," "dashboard," "frontline,"
  "campaign," "quarter," "rollout," "executive").
- For each hit in non-vignette prose, assign disposition:
  - Keep-Protected-Example (author-approved illustrative wording),
  - Keep (justified), or
  - Rewrite (domain-agnostic replacement).
- If any hit is kept, record a one-line rationale in the section audit
  summary before approval.
- If "Keep-Protected-Example" is used, include the quoted passage and note
  "protected unless author requests revision" in the section audit summary.

- Run **`docs/editorial-vocabulary.md`** as a mandatory checklist for *When
  Others Look to You* after this step: it encodes approved outcomes from
  recent passes (Chapter 2 direction vs state wording, Chapter 6 look/follow
  and legitimacy plain speak, Chapters 4–5 harm/effectiveness domain and
  jargon swaps, Part III definition echo rules). Update that file when a new
  house rule is adopted.
- Confirm any new or revised **Pattern Block** matches `docs/book-rules.md`
  (positive-only bodies for renewing titles; canonical **Learning Collapses**
  in the heading vs **Learning Collapse** in running prose when grammar
  needs the singular).

## Step 5.9: Late-Addition Continuity Guardrail

When adding new material after a section is already drafted, run a
continuity placement check before finalizing.

At minimum:

- Place substantive new claims in the best-fit core section, not in a
  connection/handoff section.
- Keep "Connection to next chapter" sections transitional and concise.
- If a new paragraph introduces a fresh concept, move it to the relevant
  analytical section and leave only the handoff line in the connection
  section.
- Re-check chapter ending rhythm: final transition line then pull-quote,
  without late conceptual detours.

## Step 6: Focused Self-Critique Pass

After each section draft and editorial pass, run a focused self-critique before moving to review.

At minimum:

- Check argument strength: are key claims clear, defensible, and proportionate?
- Check structural progression: does each section advance rather than restate?
- Check bridge quality (where applicable): does the section set up the next section cleanly?
- Check evidence posture: are claims stated at the right confidence level for the current draft stage?
- Flag top 2-4 weaknesses and propose concrete revisions before author review.

## Step 7: Citation Pass

After each draft and revision, run a citation pass before the linkage check.

For a **footnote ↔ definition balance check**, **bibliography coverage**, and **URL spot-checks**, see **`docs/citation-audit.md`** (regenerate or update that file when citations change materially).

At minimum:

- Add citation markers at major structural pivots and non-obvious claims
- Use stable, chapter-scoped footnote IDs (for example, `[^c1-leadership-definition]`)
- Keep IDs unique within each chapter and aligned to the cited claim
- Place citation markers after punctuation
- Avoid ornamental citations; each citation should anchor a claim, term lineage, or framework
- Track chapter-level citation density toward the target range defined for this manuscript (if a numeric range is set)
- If a source detail is not yet verified, mark it explicitly in the footnote as "verify source details"

## Step 8: Linkage Check

After each draft and revision, run a linkage check to confirm the manuscript graph is intact.

At minimum:

- Confirm `index.md` links to the current file path and title
- Confirm renamed files do not leave stale links behind
- Confirm internal links use the current canonical filenames

## Step 9: Section Audit Summary (Before Review)

After completing Steps 3-8 for a section, prepare a concise audit summary
for review. This summary should be used in the human review loop.

At minimum:

- Overall alignment status against `docs/book-rules.md`
- **Typographical conventions:** confirm `docs/typography-check.md` scans are clean (or list exceptions mid-edit)
- Top quality risks or weak spots (if any)
- Recommended fixes applied or pending

Do not mark a section as approved in `docs/status.md` at this stage.

## Phase B: Human Review and Revision (Approval Gate)

## Step 10: Human Review and Revision Loop

After each drafted section and compliance summary:

- Pause for author review
- Collect revision feedback
- Apply revisions to that same section
- Repeat until the section is approved

Do not move to the next section until revisions are complete and approved.

## Step 10.5: Post-Approval Actions

Only after explicit approval:

- Update `docs/status.md` to record section/part approval state.
- If the full part is approved, create one consolidated part commit, then push the part branch.

## Step 11: Move Through the Current Part

Once a section in the active part is approved, move to the next section in that same part and repeat the cycle:

1. Draft
2. Check against `docs/book-rules.md`
3. Run echo pass against drafted material
4. Run editorial pass (includes typographical conventions and `docs/typography-check.md` mechanical scans)
5. Run literary-flow micro-pass
6. Run plain-language and reader-prose pass
7. Run late-addition continuity guardrail
8. Run focused self-critique pass
9. Run citation pass
10. Run linkage check
11. Summarize alignment and quality findings
12. Review
13. Revise
14. Approve
15. Update `docs/status.md` (post-approval only)
16. If the section belongs to an in-progress part, keep iterating without committing yet
17. When the full part is explicitly approved, create one consolidated part commit and push

Continue until the full part is complete, then start the next part.

## Step 11.5: Part-Level Coherence Gate (Before Part Approval)

After all sections in a part are drafted and approved, run a part-level coherence pass before requesting part approval.

At minimum:

- Check bridge-to-chapter continuity across the full part (if bridges are used)
- Check chapter-to-chapter progression so each chapter advances rather than restates
- Check recurring terms for consistent meaning and confidence level across the part
- Check example distribution to avoid redundant case patterns inside the part
- Check citation distribution so major structural pivots in each chapter are grounded
- Check part ending/transition quality into the next part

Only after this pass is complete should the part be presented for explicit part approval (which then triggers branch push).

## Step 12: Final Editorial Passes (After Full Draft)

Once all front matter, bridges (if used), chapters, and back matter are drafted and approved, run a final manuscript-wide pass.

### 12.1 Structural Cohesion Pass

- Verify part-to-part progression and bridge continuity (if bridges are used)
- Confirm each chapter advances the central argument and does not duplicate adjacent chapters
- Check that section headings and sub-headings support navigation across the full manuscript

### 12.2 Global Echo and Compression Pass

- Remove cross-chapter repetition that no longer adds nuance
- Tighten over-explained sections and restore pacing where chapters feel dense
- Normalize recurring key phrases so they are consistent without sounding repetitive

### 12.3 Editorial and Copy Pass

- Run a full manuscript edit for clarity, grammar, punctuation, and rhythm
- Apply **Plain speak (house style)**, **Sentence Discipline**, and the
  **Editorial pass: complicated sentences** checks in `docs/book-rules.md`:
  prefer short sentences, break up long running sentences where clarity improves
- Remove residual stacked negation, filler phrasing, and awkward transitions
- Ensure terminology usage is consistent across chapters
- Run **`docs/typography-check.md`** across the full manuscript paths (mechanical Pull Quote / Vignette / Pattern Block checks) and fix any violations

### 12.4 Citation Integrity and Density Pass

- Ensure each drafted chapter has meaningful citation markers at key structural claims
- Verify stable IDs are unique, chapter-scoped, and semantically consistent
- Validate source details and remove remaining "verify source details" placeholders
- Check chapter-level citation density against the target range for this manuscript (if defined)

### 12.5 Bibliography Completion Pass

- Expand `bibliography.md` from working map to complete reference set
- Remove duplicate entries and fill in missing canonical references
- Add final citation details (edition/year/publisher and chapter-note support as needed)

### 12.6 Final Linkage and Back Matter Integrity Pass

- Confirm all links in `index.md` and across manuscript files resolve correctly
- Validate back matter ordering and completeness (for example: Epilogue, Bibliography)
- Confirm no stale filenames remain after renames or reorganizations
