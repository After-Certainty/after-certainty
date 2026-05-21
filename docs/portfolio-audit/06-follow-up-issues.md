# 6. Proposed follow-up GitHub issues

Backlog derived from [issue #99](https://github.com/ksteffe/after-certainty/issues/99). **Not auto-created**—triage and open selectively.

---

## Promotion readiness

### 1. Phase 5 promote: Before Certainty Arrives

**Scope:**
- Author read-through Part I–III; bibliography spot-check.
- Enable `build.formats` in `book.yml`; copy to `books/before-certainty-arrives/`.
- Export smoke test; update portfolio-status to Phase 5.

**Dependencies:** Author gate  
**Sequence:** First in historical arc promote trio

---

### 2. Phase 5 promote: When Accountability No Longer Expires

**Scope:**
- Author gate on Part III bridge → interlude → Part IV.
- Enable exports; promote to `books/`.
- Add public boundary copy vs *When Authority Outlives Accountability* (metadata or series guide).

**Dependencies:** #17 (boundary copy) recommended before wide promotion  
**Sequence:** After or with #1

---

### 3. Phase 5 promote: After Certainty

**Scope:**
- Author read-through; lock essay vs expansion band in `docs/status.md`.
- Enable exports; promote to `books/after-certainty/`.
- Add how-to-read or capstone orientation page.

**Dependencies:** Author gate; cluster boundaries (#9)  
**Sequence:** Last of trio (capstone)

---

### 4. Interpretation: expansion band and author gate (Parts III–IV)

**Scope:**
- Author read-through Parts III–IV.
- Decide ~80–110k expansion vs essay-length acceptance.
- Update portfolio-status; do not enable exports until decided.

**Dependencies:** Author  
**Sequence:** Before interpretation Phase 5

---

### 5. Incentives: Phase 3 part gate and Ch 3–8 author read-through

**Scope:**
- Single-part coherence gate; voice pass Ch 3–8.
- Phase 4 manuscript-wide checklist from `drafting-process.md`.

**Dependencies:** —  
**Sequence:** Before incentives promotion

---

## SEO and discoverability

### 6. Add portfolio series guide (`docs/series-guide.md`)

**Scope:**
- Reading order, three clusters (mature / judgment-compression / depth).
- One-line discriminators per book; link from root README and `upcoming/README.md`.

**Dependencies:** —  
**Sequence:** Early; blocks #7, #14

---

### 7. Related books blocks in index hubs

**Scope:**
- Curated “Related books” section on root README + 6–8 key `index.md` files.
- No manuscript body edits; hub-level only.

**Dependencies:** #6  
**Sequence:** After series guide

---

### 8. List upcoming nonfiction in root README

**Scope:**
- Table or subsection linking all 8 upcoming titles + portfolio dashboard.
- Distinguish fiction (Velorum).

**Dependencies:** —  
**Sequence:** Immediate

---

## Metadata cleanup

### 9. Replace draft-signaling book descriptions (interpretation, accountability)

**Scope:**
- Update `book.yml` `book.description` to present-tense reader promises.
- Regenerate books-manifest; verify site copy if wired.

**Dependencies:** —  
**Sequence:** Immediate

---

### 10. Normalize purchase_links and ISBNs on published books

**Scope:**
- Add `purchase_links` to coupling, curiosity, moral-seriousness, how-serious, when-others v2 where sold.
- Add ISBNs where available; validate manifest.

**Dependencies:** Author commerce URLs  
**Sequence:** Anytime

---

### 11. Remove draft title_page_footer from How Serious Systems Learn

**Scope:**
- Clear or replace `title_page_footer` in `books/how-serious-systems-learn/book.yml`.
- Regenerate front matter; confirm export title page.

**Dependencies:** Author confirm published status  
**Sequence:** Quick win

---

### 12. Normalize subtitle casing (Discipline of Uncertainty)

**Scope:**
- Title-case subtitle in `book.yml` to match portfolio convention.

**Dependencies:** —  
**Sequence:** Trivial

---

## Ontology consistency

### 13. Map upcoming glossary terms to semantic/glossary YAML

**Scope:**
- Extract from interpretation, collaboration, accountability glossaries.
- `make extract-semantic-glossary-drafts` + review + promote.
- Refresh semantic-manifest book links.

**Dependencies:** Glossaries stable per book  
**Sequence:** Per-book as glossaries finalize

---

### 14. Extend authority-cluster published books in semantic manifest

**Scope:**
- Extract patterns/glossary from when-authority-outlives, when-authority-is-misread.
- Link concepts for website cross-navigation.

**Dependencies:** —  
**Sequence:** After #13 pilot

---

## Onboarding improvements

### 15. How-to-read template for capstone and discipline

**Scope:**
- Adapt interpretation/how-meaning-moves template for after-certainty + discipline.
- Author voice pass; add to `index.md`.

**Dependencies:** Author  
**Sequence:** Before after-certainty promote (#3)

---

### 16. Reader-facing scope doc for upcoming books (template)

**Scope:**
- Copy when-others `reader-facing-scope.md` pattern to `upcoming/docs/_templates/`.
- Apply to one pilot upcoming book.

**Dependencies:** —  
**Sequence:** Low priority

---

## Quote extraction

### 17. Site pull quotes: interpretation Part I

**Scope:**
- Extract 3–5 pull quotes from Ch 1–3 for after-certainty.com (no manuscript edits).
- Optional: accountability preface, collaboration core-reframe.

**Dependencies:** Soft launch interpretation (#4)  
**Sequence:** Marketing optional

---

## Website integration

### 18. Align books-manifest fields with after-certainty.com

**Scope:**
- Audit live site vs `build/books-manifest.json` (covers, descriptions, format URLs).
- File gaps as site repo issues or manifest schema updates.

**Dependencies:** Site access  
**Sequence:** After #6

---

### 19. books-manifest: readingOrder and relatedSlugs schema

**Scope:**
- Extend `schema/books-manifest.schema.json` + `generate_books_manifest.py`.
- Populate from series guide; validate in CI.

**Dependencies:** #6  
**Sequence:** Site integration sprint

---

## Cross-linking

### 20. Companion metadata for certainty cluster (optional)

**Scope:**
- Evaluate `companion_books` or `relatedSlugs` for before/after certainty (non-edition pairing).
- Document in series guide if not using YAML companions.

**Dependencies:** #6  
**Sequence:** Optional

---

## Conceptual clarification

### 21. Portfolio-status: judgment/compression cluster boundaries

**Scope:**
- Add short subsection to `upcoming/docs/portfolio-status.md` listing four books + one-line roles.
- Link to interpretation coherence-pass docs.

**Dependencies:** —  
**Sequence:** Immediate (can merge with dashboard sync)

---

### 22. Public boundary: Accountability (upcoming) vs Authority Outlives (published)

**Scope:**
- One paragraph for series guide + both `book.description` fields.
- No manuscript rewrites.

**Dependencies:** #6  
**Sequence:** Before accountability promote (#2)

---

## Editorial refinement

### 23. Author Part I read-through: collaboration, economy, discipline

**Scope:**
- Single author session or three tickets; log outcomes in each `docs/status.md`.
- Unblock Pass 6 expansion decisions.

**Dependencies:** Author  
**Sequence:** Before depth expansion on Tier C

---

### 24. Collaboration: Ch 14 vs back-matter conclusion roles

**Scope:**
- Author decision; update index + status; avoid duplicate endings.

**Dependencies:** Author  
**Sequence:** With #23

---

### 25. Economy: verify Ch 2–3 footnotes (BLS/labor)

**Scope:**
- Citation pass on forecast/labor chapters; bibliography entries.

**Dependencies:** —  
**Sequence:** Before economy Part II expansion

---

## Issue count by category

| Category | Issues |
|----------|--------|
| Promotion readiness | 1–5 |
| SEO / discoverability | 6–8 |
| Metadata cleanup | 9–12 |
| Ontology consistency | 13–14 |
| Onboarding | 15–16 |
| Quote extraction | 17 |
| Website integration | 18–19 |
| Cross-linking | 20 |
| Conceptual clarification | 21–22 |
| Editorial refinement | 23–25 |

**Total proposed:** 25

---

## Suggested opening order (first 5 issues)

1. **#21** — Cluster boundaries in portfolio-status (small doc PR)  
2. **#9** — Description metadata fix  
3. **#6** — Series guide  
4. **#8** — Root README upcoming list  
5. **#1** — Phase 5 before-certainty-arrives (after author gate)
