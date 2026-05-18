# Manuscript-Wide Pass (Step 13)

Branch: `coupling-manuscript-pass`  
Scope: Full manuscript per `index.md` reading order (exclude `docs/`).  
Guardrails: Final polish only—no major rewrites, no epilogue expansion, no coordination-framing micro-insertions.

---

## Author sign-off

- **Parts I–IV Feynman rewrites** (commit `3807a33`): approved for Step 13 polish.
- **Epilogue:** locked (grammar, echo, links only).

---

## 13.1 — Structural cohesion (light)

**Date:** 2026-05-17  
**Status:** complete

### Checks

| Transition | Result |
|------------|--------|
| Front matter → Part I bridge | OK |
| Part I bridge → Ch 1 | OK |
| Ch 1–4 progression | OK |
| Part I → Part II bridge | OK |
| Part II Ch 5–11 progression | OK |
| Part II → Part III bridge | OK |
| Part III Ch 12–16 progression | OK |
| Part III → Part IV bridge | OK |
| Part IV Ch 17–20 progression | OK |
| Part IV → Interlude | OK |
| Interlude → Part V bridge | OK |
| Part V Ch 21–25 progression | OK |
| Ch 25 → Epilogue | OK |

### Fixes applied

- Ch 20 bridge forward: interlude references changed from future to present tense (interlude follows Ch 20 in reading order).

### Flags (no change)

- Part I bridge re-bold of cohesion/coupling removed (Introduction already introduced terms).
- Cross-domain opening scenes (hospital/platform/auth) in Part V: acceptable pattern per part passes.

---

## 13.2 — Global echo and compression

**Date:** 2026-05-17  
**Status:** complete

### Tool

`python3 tools/coupling_thesis_echo_check.py` (excludes `docs/` and `export-kindle.md`).

### Kept (intentional reinforcement)

- **coordination pressure** (22 hits): layered across Ch 4, bridges, interlude, Part IV–V—distinct anchors per domain.
- **Learning weakens** / **The system remains active**: motif across Parts I–IV; short parallel structure by design.
- **temporal coupling** (Part II): definitional arc Ch 5–10.
- **coordination cost / debt** (Part V): design and oscillation chapters.
- **context collapse** (Part III): Ch 12 bridge → Ch 13 development.
- Prologue ↔ Ch 17–18 scenes: intentional cross-domain rhyme.

### Trimmed (duplicative)

- Ch 19: closing recap changed second “Learning weakens.” to “Redesign loses force.” (same chapter, lines ~116 and ~196).

---

## 13.3 — Editorial and copy

**Date:** 2026-05-17  
**Status:** complete

### Fixes applied

- “in order to” → “to” (Ch 1, Ch 17, Ch 24).
- Pull-quotes: no bold inside quotes (verified).
- Part I bridge: removed redundant bold on cohesion/coupling.

### Verified

- Stacked negation: Ch 23 intentional triple “not” retained.
- Terminology consistent across parts.

---

## 13.4 — Citation integrity and density

**Date:** 2026-05-17  
**Status:** complete

### Notes

- No `verify source details` placeholders in manuscript body.
- Ch 24–25: added cross-chapter footnote markers to reach six definitions each; Ch 25 `[^c25-bridge-epilogue]` now used in bridge text.
- All other chapters: 6–14 footnote definitions (bridges/interlude proportionally lighter).
- Stable chapter-scoped IDs; markers after punctuation.

---

## 13.5 — Glossary completion

**Date:** 2026-05-17  
**Status:** complete

### First-use bolding (reading order after Typographical Conventions)

| Term | First manuscript use |
|------|----------------------|
| Coordination Pressure | Ch 4 |
| Context Collapse | Ch 12 bridge |
| Stale Representation | Ch 17 heading |
| Coherence Maintenance | Ch 20 bridge |
| Consequence Architecture | Ch 16 |

Core terms (system, cohesion, coupling, etc.) bolded in Introduction. Prologue: judgment, agency.

### Glossary file

- Order preserved; no forward-dependency issues.
- No new terms required.

---

## 13.6 — Bibliography completion

**Date:** 2026-05-17  
**Status:** complete

### Edits

- Replaced writer-facing domain table with reader-facing alphabetical bibliography (Chicago-style bullets, aligned with *When Others Look to You* v1).
- Entries drawn from chapter footnotes; edition and publisher detail in bibliography where stable, with chapter notes for nuance.
- Remaining expansion toward 120–180 references can proceed by adding entries as new sources enter the manuscript.

---

## 13.7 — Linkage and back matter integrity

**Date:** 2026-05-17  
**Status:** complete

### Checks

- All 39 `index.md` links resolve.
- Back matter order: Epilogue → Glossary → Bibliography.
- `make export-kindle-epub DIR=books/coupling` succeeded (41 prepared files; `coupling.epub` built).

### Notes

- `export-kindle.md` regenerated locally (gitignored).

---

## Step 13 complete

Ready for PR from `coupling-manuscript-pass` → `main`.
