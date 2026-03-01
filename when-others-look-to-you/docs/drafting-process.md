# When Others Look to You - Drafting Process

## Purpose

This document defines the drafting workflow for building the book in a structured, review-driven way.

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

## Step 3: Rule Compliance Check During Part Drafting

After drafting each section within the active part (bridge/chapter), run a compliance check against `docs/book-rules.md`.

For each check, provide:

- A brief summary of overall alignment
- Any rule mismatches or weak spots
- Any recommended fixes before review
- If pull-quotes are used in this manuscript, confirm expected pull-quote usage/placement for the chapter

## Step 4: Echo Pass (Repetition Check)

After each section draft in the active part, run an echo pass against previously drafted material to prevent heavy repetition.

For each echo pass:

- Check for repeated phrasing, repeated claims, and repeated sentence patterns
- Flag overlap that feels duplicative rather than intentionally reinforcing
- Suggest concise rewrites to preserve progression and reduce echo

## Step 5: Editorial Pass (Clarity and Mechanics)

After each section draft in the active part, run an editorial pass focused on readability and standard prose quality.

At minimum, check for:

- Stacked negation and avoidable double negatives
- Awkward sentence constructions
- Redundant modifiers and filler phrasing
- Punctuation and consistency issues that reduce clarity
- Pull-quote formatting consistency when pull-quotes are used (for example, no bold text inside pull-quotes)

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

## Step 9: Status Update

After each section draft/revision cycle within the active part, update `docs/status.md` so progress is explicit and easy to resume.

At minimum:

- Current part being drafted
- Completed sections
- Next part
- Any open decisions or unresolved questions

## Step 10: Human Review and Revision Loop

After each drafted section and compliance summary:

- Pause for author review
- Collect revision feedback
- Apply revisions to that same section
- Repeat until the section is approved

Do not move to the next section until revisions are complete and approved.

## Step 11: Move Through the Current Part

Once a section in the active part is approved, move to the next section in that same part and repeat the cycle:

1. Draft
2. Check against `docs/book-rules.md`
3. Run echo pass against drafted material
4. Run editorial pass
5. Run literary-flow micro-pass
6. Run focused self-critique pass
7. Run citation pass
8. Run linkage check
9. Update `docs/status.md`
10. Summarize alignment and quality findings
11. Review
12. Revise
13. Approve
14. If the section belongs to an in-progress part, keep iterating without committing yet
15. When the full part is explicitly approved, create one consolidated part commit and push

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
- Remove residual stacked negation, filler phrasing, and awkward transitions
- Ensure terminology usage is consistent across chapters

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
