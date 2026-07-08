# Housekeeping verification — Option B rewrite complete

Writer-facing record of post-rewrite cleanup (2026-07-08).

## Retired paths

Removed from the repository after passage map completion:

### Legacy part directories (14-chapter structure)

- `parts/part-i-the-three-forces/`
- `parts/part-ii-speaking-and-listening-under-pressure/`
- `parts/part-iii-familiar-situations/`
- `parts/part-iv-what-this-lens-changes/`

### Orphaned front matter (merged or cut)

- `front-matter/preface-before-understanding.md` → merged into `introduction-the-sentence-before-the-sentence.md`
- `front-matter/introduction-why-communication-fails-before-anyone-is-wrong.md` → merged into introduction
- `front-matter/how-to-read-this-book.md` → cut (limits in Author's Note)

`index.md` legacy reference section removed.

## Pattern evidence map

`docs/pattern-evidence-map.md` rewritten for Option B chapter paths. Reachability documented as glossary term (Ch 9, epilogue), not an Appendix A pattern.

## Build and assembly checks

| Check | Result |
|-------|--------|
| `make typography-check-how-meaning-moves` | pass |
| `python3 scripts/assemble.py --book-dir books/how-meaning-moves` | pass (all index links resolve) |
| `make build-book DIR=books/how-meaning-moves FORMATS=docx` | **blocked locally** — `pandoc` not installed in cloud agent environment; CI/export host should run full build |

## Manuscript scale

Approximate reader-facing word count (parts + front matter + back matter, excluding `docs/`): **~19,500 words** — within the Option B target band (~17.5k revised scaffold → ~25–35k stretch goal; room remains for a late cadence polish pass if desired).

## Cadence spot-check (post–editorial pass)

Recurring closure phrases after essayistic rewrite and full editorial pass:

| Phrase | Chapter hits | Notes |
|--------|--------------|-------|
| `Seeing this clearly does not` | 2 (Ch 1, Ch 6 Core Principles only) | Body duplicates removed; other chapters use varied landings |
| `If you want to see` | 0 | Replaced with scene residues, hard stops, or plain claims |

## Editorial pass (2026-07-08)

Full manuscript pass applied per `docs/book-rules.md` Advanced Polish:

- Removed writer-facing meta (`Strand C`, `Ch 7 had already…`)
- Cut duplicate restraint/sincerity/speaker-listener exposition in Ch 1
- Varied chapter endings: scene residue, hard stop, or Core Principle without template rhyme
- Trimmed over-stabilizer paragraphs in Ch 4–5, 7–10, epilogue
- Restored Ch 6 connection-at-work beat; light trim to closing authority paragraph (benchmark preserved)
- Fixed Ch 7 typo (`an owner`); removed orphan Gigerenzer footnote
- Introduction: unnamed temporal anchor (`within a few days`) per series guardrails

No `Pattern Block` or `Vignette Block` fences remain in chapter bodies (essayistic integration). Part I `pattern-map.md` retains Pattern Block typography by design.

## Remaining optional polish (out of housekeeping scope)

- Full Pandoc build on CI or local machine with pandoc installed
- Dedicated audiobook cadence pass per `docs/book-rules.md` Advanced Polish section
- Regenerate `semantic-reports/glossary-usage.md` after legacy file removal (`make scan-book-glossary-usage` or book tooling equivalent)
