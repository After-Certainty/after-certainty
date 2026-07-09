# Citation Audit — Essayistic Rewrite

**Date:** July 2026  
**Book:** *When Incentives Become the Moral Language*  
**Scope:** Rewrite manuscript (15 units + 4 part bridges: introduction, interlude, Ch 1–12, epilogue)  
**Automation:** [`tools/audit_citations.py`](../../../tools/audit_citations.py)

---

## Summary

| Check | Result |
|-------|--------|
| Pandoc footnote integrity | **Pass** — 0 missing definitions, 0 unused definitions (after interlude fix) |
| Bibliography present in `index.md` | **Pass** |
| Chicago `# **Bibliography**` heading | **Pass** |
| Rewrite footnote count | **43** definitions (post revision pass) |
| Bibliography entries (rewrite) | **39** source lines across 15 units + epilogue |

**Tier:** C (compliant)

---

## Rewrite manuscript inventory

| Unit | Footnotes | Key sources |
|------|----------:|-------------|
| Introduction | 1 | Campbell (Campbell's law) |
| Ch 1 | 5 | ACEP boarding, CMS HRRP/DRG, IOM emergency care, NAM burnout, Talbot/Dean moral injury |
| Ch 2 | 4 | Zuckerberg, Pichai testimony; WSJ divisiveness reporting; Haugen disclosures |
| Ch 3 | 6 | Garfield, Hirsch, DORA, NSF merit review, OSC replication, Ioannidis |
| Interlude | 2 | Monmonier, Scott |
| Ch 4 | 4 | Paris/SBTi, World Bank carbon pricing, VCMI/ICVCM, ISSB/ESRS |
| Ch 5 | 3 | Cappelli/Tavis, WARN, Greenberg organizational justice |
| Ch 6 | 3 | Reuters Digital News Report, Pew, Knight/Gallup trust |
| Ch 7 | 4 | Pew polling/trust, FEC/OpenSecrets, Hersh |
| Ch 8 | 4 | ESEA, ACGR, PISA, RAND/LPI teacher stress |
| Ch 9 | 1 | Campbell |
| Ch 10 | 2 | Greenberg, NAM |
| Ch 11 | 1 | Jameton, Rushton (combined note) |
| Epilogue | 2 | Monmonier, Campbell |

---

### Revision pass (July 2026)

- Introduction Campbell footnote removed with prose.
- Ch 4: added `[^c4-vw]` (Volkswagen diesel compliance gap).
- Ch 7: added `[^c7-aca]` (ACA public-option debate).
- Bibliography: Introduction section removed; Ch 4/7 entries added.

---

## Issues found and resolved

### 1. Unused footnote definitions (interlude)

`[^int-monmonier]` and `[^int-scott]` were defined but not cited inline.

**Fix:** Added citations at map-simplification and institutional-legibility pivots in [`interlude-the-map-was-not-a-lie.md`](../front-matter/interlude-the-map-was-not-a-lie.md).

### 2. Bibliography gaps

- **ESRS/EFRAG** cited in Ch 4 footnote `[^c4-issb]` but absent from consolidated bibliography.
- **Essay edition duplicate section** at bibliography tail repeated CMS/Paris/World Bank entries already listed under rewrite chapters.

**Fix:** Added EFRAG/ESRS entry; removed duplicate legacy tail section from [`bibliography.md`](../back-matter/bibliography.md).

### 3. Footnote formatting

- Ch 5 `[^c5-greenberg]`: page range hyphen normalized to en-dash (399–432).
- Ch 11 `[^c11-jameton]`: corrected editor name (Engelhardt Jr.) and Chicago *in*-anthology form.

---

## Intentional duplicates (not errors)

| Source | Appears in |
|--------|------------|
| Campbell (1979) | Introduction, Ch 9, Epilogue — same law named at opening, synthesis, and close |
| Greenberg (1990) | Ch 5, Ch 10 — procedural fairness in matrix design and hidden subsidy |
| NAM burnout (2019) | Ch 1, Ch 10 — clinician systems burden at domain entry and Part IV cost |
| Monmonier (2018) | Interlude, Epilogue — map metaphor bookends |

Bibliography lists these once per chapter section where they appear, per house practice for chapter-scoped notes.

---

## Out of scope / accepted gaps

| Item | Notes |
|------|-------|
| Ch 10–12 synthesis claims | Authorial synthesis; no new empirical citations required |
| Composite scenes | Disclosed in appendix; no documentary citations added |
| Sparse Ch 9–12 citation density | Structural/synthesis chapters; intentional |

---

## Verification commands

```bash
# Portfolio audit (includes this book)
python3 tools/audit_citations.py

# Rewrite-only integrity
python3 << 'PY'
# See commit script in docs/citation-audit.md history or re-run audit_citations.py
PY
```

After July 2026 fixes: `missing_defs=0`, `unused_defs=0` on rewrite paths.

---

## Remaining optional follow-ups

1. Add Sunstein *#Republic* if Ch 6 civic-trust claims are strengthened in a later pass.
2. Split combined footnotes (Ch 4 Paris/SBTi; Ch 11 Jameton/Rushton) if author prefers one-source-per-note discipline.
3. ~~Update [`appendix-method-and-sources.md`](../back-matter/appendix-method-and-sources.md) composite-scene disclosure when appendix pass runs.~~ **Complete** (July 2026)
