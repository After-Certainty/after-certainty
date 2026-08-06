# Publication Proof Report — When the Key Changes Hands

**Date:** 2026-08-06  
**Branch:** `cursor/key-hands-publication-proof-750e`  
**Base:** `origin/main` (post–editorial compression pass #515)  
**Scope:** Bibliography completeness, citation integrity, print page-break convention, typography/layout, narrow line-level flags only.

This report precedes manuscript edits. It does not overwrite existing planning maps or [`editorial-rhythm-compression-report.md`](editorial-rhythm-compression-report.md).

---

## A. Bibliography issues

### A1. Arendt — *Responsibility and Judgment*

- **Current entry:** `Arendt, Hannah. *Responsibility and Judgment*. New York: Schocken Books, 2003.`
- **Corresponding footnotes:** `[^epi-arendt-responsibility-judgment]` (full); `[^epi-arendt-judgment-limits]` (short form: `Arendt, *Responsibility and Judgment*.`)
- **Proposed:** No change to bibliography. Short-form second note is intentional Chicago subsequent citation.
- **Evidence:** Footnote and bibliography already agree on place, publisher, year.
- **Confidence:** High that the entry is complete.
- **Unresolved:** None. (Earlier suspicion of a missing year was incorrect for the live file.)

### A2. Popper — *The Open Society and Its Enemies*

- **Current:** `Popper, Karl. *The Open Society and Its Enemies*. Vol. 1. London: Routledge, 1945.`
- **Footnote:** `[^c12-popper-open-society]` — matches.
- **Proposed:** No change.
- **Confidence:** High / complete.

### A3. Scott — *Seeing Like a State*

- **Current:** `Scott, James C. *Seeing Like a State*. New Haven: Yale University Press, 1998.`
- **Footnote:** `[^c2-scott-seeing-like-a-state]` — matches.
- **Proposed:** No change.
- **Confidence:** High / complete.

### A4. Williams — *Moral Luck*

- **Current:** `Williams, Bernard. *Moral Luck*. Cambridge: Cambridge University Press, 1981.`
- **Footnotes:** `[^c1-williams-moral-luck]`, `[^c2-williams-moral-luck]` — match.
- **Proposed:** No change.
- **Confidence:** High / complete.

### A5. Aristotle — *Nicomachean Ethics*

- **Current:** `Aristotle. *Nicomachean Ethics*.`
- **Footnotes:** `[^intro-aristotle-nicomachean-ethics]`, `[^c5-aristotle-nicomachean-ethics]`, `[^c7-aristotle-nicomachean-ethics]` — all edition-neutral (`esp. Book II` / `bks. II–III` / `bk. II`).
- **Proposed:** **Leave unchanged** (edition-neutral by design).
- **Evidence:** [`docs/status.md`](status.md) unresolved TODO; [`anticipated-bibliography.md`](anticipated-bibliography.md) lists work title only; no house preferred modern edition in other book bibliographies.
- **Confidence:** High that incompleteness is intentional pending preferred edition choice.
- **Unresolved:** Preferred modern edition / translator / Bekker or pagination standard.

### A6. Kant — *Groundwork of the Metaphysics of Morals*

- **Current:** `Kant, Immanuel. *Groundwork of the Metaphysics of Morals*.`
- **Footnote:** `[^c5-kant-groundwork]` — edition-neutral plus interpretive gloss.
- **Proposed:** **Leave unchanged**.
- **Evidence:** Same status TODO and anticipated map pattern as Aristotle.
- **Unresolved:** Preferred modern edition / translator.

### A7. James — “Habit” / *The Principles of Psychology*

- **Current:** `James, William. "Habit." In *The Principles of Psychology*. 1890.`
- **Footnote:** `[^c7-james-habit]` — `William James, "Habit," in *The Principles of Psychology* (1890).`
- **Proposed corrected entry:**  
  `James, William. "Habit." In *The Principles of Psychology*. New York: Henry Holt and Company, 1890.`
- **Proposed footnote alignment:** add place/publisher to match.
- **Evidence:** Footnote year 1890; Wikisource title page of first edition (“NEW YORK / HENRY HOLT AND COMPANY / 1890”); Wikipedia bibliographic citation for the 1890 Holt edition.
- **Confidence:** High for place/publisher of the first edition cited by year.
- **Unresolved:** Chapter page range for “Habit” (not required by house notes; leave omitted).

### A8. Soft incompleteness (essay-in-book page ranges)

| Entry | Issue | Action |
|-------|--------|--------|
| Nagel, “Moral Luck,” in *Mortal Questions* | No essay pages in bib or notes | Leave; flag soft |
| Geertz, “Centers, Kings, and Charisma,” in *Local Knowledge* | No chapter pages | Leave; flag soft |

### A9. Doris author-name consistency

- **Bibliography:** `Doris, John M. …`
- **Notes:** Intro + Ch12 use `John Doris`; Ch1, Ch3, Ch4 use `John M. Doris`.
- **Proposed:** Normalize all five notes to **John M. Doris** to match bibliography and majority form.
- **Confidence:** High (house bib already uses middle initial).

### A10. Mechanical bibliography style

- Alphabetical order: OK.
- Italics / quotation marks / journal formatting: OK.
- Continuation lines use two-space indent: OK.
- En dashes in page ranges: present in journal entries.
- No duplicated works under variant titles found.

---

## B. Citation integrity

| Metric | Count |
|--------|------:|
| In-text footnote markers | 81 |
| Footnote definitions | 81 |
| Unique note IDs | 81 |
| Markers missing definitions | 0 |
| Definitions without markers | 0 |
| Unique works cited in notes | 64 |
| Bibliography entries | 64 |
| Cited works missing from bibliography | 0 |
| Bibliography entries with no note cite | 0 |

**Numbering:** Pandoc named IDs (`[^c1-…]`, etc.); rendered sequence is continuous in export order. No numeric renumbering required.

**Detached / questionable notes:** None found. Claim–note pairing spot-check after compression remains coherent for structural pivots.

**Intentional short cite:** `[^epi-arendt-judgment-limits]` — not a defect.

**Bridges:** No footnotes (by design).

---

## C. Layout plan

### Convention (to apply)

House DOCX interior-finish contract ([`book.yml`](../book.yml) already has `interior_finish: true`), matching peer books such as *The Economy We Don’t Experience*:

1. Leading `\newpage` on Introduction, each Part bridge, Chapters 1–16, Epilogue, Bibliography (About the Series already has it).
2. Split H1/H2 openers so [`tools/docx_interior_finish.py`](../../../tools/docx_interior_finish.py) recognizes body openers:
   - `# **Introduction**` / `## **The Key**`
   - `# **Part N**` / `## **Part subtitle**` on bridges (bridge prose stays on the same page under the Part heading)
   - `# **Chapter N**` / `## **Title**`
   - `# **Epilogue**` / `## **The Lock Does Not Know**`
   - `# **Bibliography**` (already correct)
3. Extend `_BODY_OPENER_RE` to include `Epilogue` (keep the name Epilogue; do not rename to Conclusion).
4. Set `publishing.title_page_newpage_after: true` so title page and copyright separate (peer-book pattern).
5. Next-page breaks only — **not** odd-recto chapter starts.

### Current violations

| Unit | Missing `\newpage` | Combined H1 (not opener-regex match) |
|------|--------------------|--------------------------------------|
| Introduction | yes | `Introduction — The Key` |
| Part I–IV bridges | yes | `Part N — …` (Part form may match; will still split for consistency) |
| Chapters 1–16 | yes | `Chapter N — …` |
| Epilogue | yes | `Epilogue — The Lock Does Not Know` |
| Bibliography | yes (for fresh page) | H1 already `# **Bibliography**` |
| About the Series | has `\newpage` | OK |
| Copyright | no leading break | Will use `title_page_newpage_after` |

---

## D. Typographic defects (confirmed before edit)

| Location | Exact text / issue | Proposed correction |
|----------|--------------------|---------------------|
| Intro + Ch12 footnotes | `John Doris` | `John M. Doris` |
| James bib + `[^c7-james-habit]` | Missing place/publisher | Add `New York: Henry Holt and Company` |
| All body units above | Combined titles / missing `\newpage` | Split openers + `\newpage` per layout plan |
| `book.yml` author website | `https://after-certainty.com` | Align to `https://www.after-certainty.com` (About the Series form) |
| Tooling | `_BODY_OPENER_RE` omits Epilogue | Add `Epilogue` |

**Scanned, no hits:** double spaces in prose; missing blank lines before footnote defs; body text joined to footnote definitions.

**Flag only (not defects):**

- Cover notebook phrase “Do the right thing when no one is watching.” — positioning choice; do not change.
- Ch2 “ribbon-cutting” — legitimate English; not a conversion artifact.
- Cover image present (`book-cover.png`, ~2.7 MB); no redesign this pass.

---

## E. Line-level flags

Under the narrow proofing criteria, **no prose rewrites** are proposed at report time.

Governing formulations to protect (spot-check after layout edits; do not alter wording):

- Key / lock couplet (Introduction)
- Person exceeds / pattern still matters (Ch1)
- Cost does not sanctify (Ch3)
- Good formation / less difficult (Ch7)
- Repair / answerability (Intro and elsewhere)
- Heroism consuming; compliance imitates; design/judgment couplet (Ch12)
- Empty empowerment (Ch16)
- Authority / Expectations / Character (Ch16 + Epilogue)
- Lock will open / rest is yours (Ch16)
- Key changes hands easily / belief does not (Epilogue)

Aristotle book-reference abbreviations (`Book II` vs `bk. II` vs `bks. II–III`) are acceptable Chicago variation across notes; **no change** unless a later consistency pass is requested.

---

## Planned edit summary (for Phase B)

1. Complete James bibliography + matching footnote.
2. Normalize Doris to `John M. Doris` in intro and Ch12 notes.
3. Apply `\newpage` + split headings across intro, bridges, chapters, epilogue, bibliography.
4. `title_page_newpage_after: true`; website URL normalize in `book.yml`.
5. Extend Epilogue opener regex + test update.
6. Export `when-the-key-changes-hands-publication-proof.docx` artifact.
7. Re-verify 81/81, outline order, Ch16 length, governing lines.

No general tightening. No architecture changes. Aristotle and Kant remain edition-neutral and listed as unresolved.
