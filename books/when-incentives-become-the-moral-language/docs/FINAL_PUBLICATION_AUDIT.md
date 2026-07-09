# Final Publication Audit

**Date:** July 2026  
**Book:** *When Incentives Become the Moral Language*  
**Pass:** Final editorial and publication-integrity (Tasks 1–15)

---

## Executive summary

| Item | Result |
|------|--------|
| **Files changed** | 11 source files (interlude, Ch 2/3/4/5/6/7/8/12, index, bibliography, citation-audit) |
| **Approximate prose changes** | ~350 words added/revised; net slightly shorter (3 headings removed) |
| **Chapter structure** | Unchanged — no chapters added/removed/reordered |
| **Factual claims** | Ch 4: local air pollution vs GHG distinction added; VW qualification preserved. Ch 7: ACA passage unchanged (verified). |
| **Citations** | Footnotes normalized (Ch 3–8, Ch 4 VW/Paris/SBTi/ISSB/VCMI/World Bank); bibliography expanded to precise entries; orphaned `[^c4-world-bank]` and `[^c4-vcmi]` resolved with inline citations |
| **Build status** | DOCX, EPUB, PDF built successfully; citation audit Tier C; footnote integrity 43/43 |

---

## Solutions-to-orientation wording

**Previous (interlude):**

> This book does not propose solutions, and that refusal is intentional. The moment a book like this offers fixes, it becomes another system competing to define what should be rewarded, optimized, or enforced.

**Revised:**

> This book does not prescribe a program, and that restraint is intentional. A universal checklist would risk becoming another system for deciding what should be rewarded, optimized, or enforced—that move would repeat the substitution it describes. What the book offers instead is orientation: a way to notice what a measure reveals, what it obscures, and what remains owed after the process is complete.

**Chapter 12 alignment** — added after “The signal enters the room. It does not get the last word.”:

> This is what institutional judgment looks like when it survives: not freedom from measurement, but the refusal to let measurement close the account.

Existing orientation sections (signals vs definitions, compliance vs responsibility, unfinished account) fulfill the interlude’s revised promise without further expansion.

---

## Chapter 4 clarification

**Local air pollution vs greenhouse-gas emissions** (after Volkswagen paragraph):

> Local air pollution and greenhouse-gas emissions are distinct harms, governed through different measures. They meet here only as examples of what happens when improvement inside a reporting boundary is mistaken for the whole physical consequence.

**Volkswagen qualification** (preserved):

> Corporate climate accounting usually involves no comparable deception. The structural resemblance is narrower: compliance within a defined reporting frame can diverge from conditions outside it…

**Terminology:** Scope 1/2/3, offsets, additionality, durability language unchanged and verified against standard GHG-reporting usage. `[^c4-vcmi]` now cites ICVCM Core Carbon Principles and VCMI Claims Code of Practice.

---

## Headings removed

| Heading | Integrated into |
|---------|-----------------|
| `### The Impossibility of Neutral Ranking` (Ch 2) | End of `### The Engineer Looking at Two Graphs` |
| `### The Harm That Does Not Fit on the Poster` (Ch 4) | Opening of `### How the Target Became the Sentence` |
| `### When Relevance Becomes Circular` (Ch 6) | End of `### What Editors Carry` |

---

## Footnote audit

| Metric | Result |
|--------|--------|
| Unique footnote identifiers | 43 |
| Total inline references | 46 (some notes cited multiple times) |
| Missing definitions | 0 |
| Unused definitions | 0 |
| Duplicate identifiers across files | 0 |
| Rendered DOCX footnote entries | 46 |
| Pandoc build warnings | 0 (orphaned Ch 4 notes resolved) |

**Machine check:**

```bash
python3 - <<'PY'
# Documented in docs/citation-audit.md — scans front-matter, parts, back-matter/*.md
# excluding bibliography.md and export-kindle.md
PY
```

**Corrections made:** Added inline `[^c4-world-bank]` and `[^c4-vcmi]`; normalized footnote text in Ch 3–8.

---

## Bibliography normalization

**Entries expanded/replaced:**

- Ch 3: NSF PAPPG merit-review criteria (replaced “current program documentation”)
- Ch 4: EPA Notice of Violation (VW); Paris Agreement date; SBTi Net-Zero Standard v1.2; World Bank *State and Trends 2024*; ICVCM/VCMI specific guidance; ISSB IFRS S1/S2 and ESRS
- Ch 5: WARN Act statutory citation (29 U.S.C.)
- Ch 6: *Digital News Report 2024*; Pew methodology page; Knight/Gallup 2018 (removed vague API reference)
- Ch 7: Pew methodology guide; FEC + OpenSecrets; Pew trust 1958–2024 report
- Ch 8: ESSA Pub. L. citation; NCES ACGR; PISA 2022 Volume I; RAND teacher stress 2021; LPI shortages 2024

**URLs added** where repository conventions support stable links (NSF, EPA, OECD, Pew, etc.).

**Vague categories removed:** “annual reports,” “representative workforce reduction disclosures” (replaced with statute + SEC Form 8-K reference in footnote), “news consumption and trust surveys,” “reports on teacher stress.”

**Could not pinpoint to single document:** Ch 6 Pew footnote still references headline-testing literature as a class (prose makes general claim about newsroom A/B testing; no single canonical study cited).

---

## Chapter 7 audit

**Final ACA wording** (unchanged this pass; verified):

> Polling showed substantial public support in abstract surveys; Senate vote counts, procedural constraints, and coalition management told a harder story.[^c7-aca] The provision was softened and ultimately dropped as leaders weighed that support against the votes required for passage, industry opposition, and the political cost of prolonging the fight.

**Sources:** Congressional Record (111th Cong.); Jonathan Cohn, *The Ten Year War* (2021).

**Causation:** Uses “leaders weighed” — does not claim polling alone caused removal. Private motives not inferred.

**Unresolved uncertainty:** Exact relative weight of industry lobbying vs vote counts vs presidential strategy is historiographically contested; prose states constraints without ranking undocumented motives.

---

## Repetition review

- Scanned parts for “This is not X. It is Y.” / “The problem is not X” / “Not because X, but because Y.” — **no matches** in chapter prose.
- Governing motifs (travel, portable, defensible, remainder, carry, complete) retained.
- No accidental clustering revisions required beyond heading removals (which reduced fragment-like section breaks).

---

## Readability review (Chapters 4–6)

| Chapter | Change |
|---------|--------|
| Ch 4 | Split overloaded paragraph before map-metaphor sentence; merged mini-section into flowing “How the Target Became the Sentence” |
| Ch 6 | Split audience/public local-reporting examples into two paragraphs |
| Ch 5 | No prose changes (footnote/bibliography only) |

No substantial expansion; no new case studies.

---

## Rendered-output review

| Format | Inspected |
|--------|-----------|
| DOCX | 825 body paragraphs; 46 footnotes; edited passages render correctly |
| PDF | Built with xelatex; subtitle “Decide For Us” consistent; opening/closing content present |

**Issues found and fixed in source:**

- Orphaned footnote definitions `[^c4-world-bank]`, `[^c4-vcmi]` (inline citations added)
- `index.md` subtitle “for” → “For” (title-case alignment with `book.yml`, title page, copyright)

**No issues found:** footnote/body collisions in edited sections; removed headings absent from DOCX; epilogue closing lines intact; Core Principle labels present (11 occurrences).

**Remaining (author/environment):** EPUB build warns about `export-kindle.md` title element (generated artifact; not in publication build path). Widow/orphan page breaks not fully automatable — manual PDF page review recommended before print.

---

## Word counts

Method: strip footnote definitions, markdown markup, and image/link syntax; count alphanumeric tokens (including hyphenated words).

| Scope | Words | Files included |
|-------|------:|----------------|
| 1. Main narrative only (Introduction → Epilogue) | **35,763** | 24 units per `index.md` (intro, bridges, ch 1–12, interlude, epilogue) |
| 2. Narrative + appendix | **36,270** | Above + appendix |
| 3. Complete publication file | **38,626** | Title page, copyright, about-the-series, narrative, appendix, bibliography |

Footnotes are embedded in chapter word counts (definitions excluded; inline reference markers excluded).

---

## Open author decision

**Cover tagline (unchanged):** *“Care continues. Caring becomes private.”*

Editorial note: powerful but may read healthcare-specific. Alternatives: *“Every measure leaves something behind.”* / no tagline / retain current (broad moral sense of care). **Requires explicit author approval to change.**

---

## Build report

| Command | Result |
|---------|--------|
| `python3 tools/audit_citations.py` | Pass — Tier C, pandoc notes=0 |
| `make validate-book-specs` | Pass |
| Footnote integrity script | Pass — 43 defs, 0 missing, 0 unused |
| `make build-book … FORMATS="docx epub pdf"` | Pass |

**Artifacts:** `build/books-when-incentives-become-the-moral-language/when-incentives-become-the-moral-language.{docx,epub,pdf}`
