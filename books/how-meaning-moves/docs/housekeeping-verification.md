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

## Cadence spot-check (not a full audiobook pass)

Recurring closure phrases after essayistic rewrite:

| Phrase | Chapter hits | Notes |
|--------|--------------|-------|
| `Seeing this clearly does not` | 12 across 10 chapters | Rationed to Core Principle zones; Ch 4, 5, 8 use twice (body + principle). Monitor on audio pass. |
| `If you want to see` | 8 chapters | Deliberate reader-orientation hinge; varies slightly in Part III (`what still can move`, `what restraint makes possible`). |

No `Pattern Block` or `Vignette Block` fences remain in chapter bodies (essayistic integration). Part I `pattern-map.md` retains Pattern Block typography by design.

## Remaining optional polish (out of housekeeping scope)

- Full Pandoc build on CI or local machine with pandoc installed
- Dedicated audiobook cadence pass per `docs/book-rules.md` Advanced Polish section
- Regenerate `semantic-reports/glossary-usage.md` after legacy file removal (`make scan-book-glossary-usage` or book tooling equivalent)
