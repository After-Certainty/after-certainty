# Citation Audit — Essayistic Rewrite

**Date:** July 2026 (final publication pass)  
**Book:** *When Incentives Become the Moral Language*  
**Scope:** Rewrite manuscript (15 units + 4 part bridges: introduction, interlude, Ch 1–12, epilogue)  
**Automation:** [`tools/audit_citations.py`](../../../tools/audit_citations.py)

---

## Summary

| Check | Result |
|-------|--------|
| Pandoc footnote integrity | **Pass** — 0 missing definitions, 0 unused definitions |
| Bibliography present in `index.md` | **Pass** |
| Chicago `# **Bibliography**` heading | **Pass** |
| Rewrite footnote count | **43** unique identifiers; **46** inline references |
| Bibliography entries | **Normalized** — precise titles, years, URLs where applicable |
| Tier | **C** (compliant) |

---

## Footnote integrity (machine check)

Run against manuscript paths (excludes `bibliography.md`, `export-kindle.md`, `docs/`):

```bash
python3 << 'PY'
import re
from pathlib import Path
book = Path("books/when-incentives-become-the-moral-language")
files = sorted(f for f in book.rglob("*.md")
    if "/docs/" not in f.as_posix() and f.name not in ("bibliography.md", "export-kindle.md"))
cite = re.compile(r"\[\^([^\]]+)\](?!:)")
defs = re.compile(r"^\[\^([^\]]+)\]:", re.M)
cited, defined = set(), set()
for f in files:
    t = f.read_text(encoding="utf-8")
    body = re.sub(r"^\[\^[^\]]+\]:.*$(?:\n(?!\[\^|\n).*)*", "", t, flags=re.M)
    cited |= set(cite.findall(body))
    defined |= set(defs.findall(t))
print("missing:", sorted(cited - defined))
print("unused:", sorted(defined - cited))
PY
```

**Final pass result:** `missing: []`, `unused: []`

**Rendered output:** DOCX contains 46 footnote entries (multiple references to Campbell, Greenberg, NAM, Monmonier across chapters). Pandoc uses chapter-scoped identifiers; numbering is sequential in combined export.

---

## Claim-to-source verification (Chapters 4 and 7)

| Claim | Source | Type | Location | Supports |
|-------|--------|------|----------|----------|
| VW lab vs road NOx divergence | EPA Notice of Violation (2015); EPA/CARB settlements (2016) | Primary/agency | Ch 4 `[^c4-vw]` | Direct |
| Ordinary climate reporting ≠ fraud | Authorial qualification following documented VW case | Synthesis | Ch 4 prose | Inference (explicitly labeled in prose) |
| Local air pollution ≠ GHG emissions | Standard regulatory distinction (GHG vs criteria pollutants) | Structural/domain knowledge | Ch 4 prose | Direct (no separate footnote; not empirical claim) |
| Paris Agreement timelines | UNFCCC Paris Agreement (2015) | Treaty | Ch 4 `[^c4-paris]` | Direct |
| SBTi corporate net-zero criteria | SBTi Corporate Net-Zero Standard v1.2 (2023) | Framework | Ch 4 `[^c4-paris]` | Direct |
| Carbon pricing instruments | World Bank *State and Trends of Carbon Pricing 2024* | Report | Ch 4 `[^c4-world-bank]` | Direct |
| Offset integrity / additionality | ICVCM Core Carbon Principles; VCMI Claims Code (2023) | Guidance | Ch 4 `[^c4-vcmi]` | Direct |
| ISSB / ESRS disclosure | IFRS S1/S2 (2023); ESRS (EFRAG 2023) | Standards | Ch 4 `[^c4-issb]` | Direct |
| Public-option abstract polling support | Congressional Record; Cohn (2021) | Legislative record / secondary | Ch 7 `[^c7-aca]` | Direct (polling); inference (coalition constraints) |
| Public-option dropped amid vote/coalition pressures | Cohn (2021); Congressional Record | Secondary/primary | Ch 7 `[^c7-aca]` | Direct |
| Polling methodology | Pew methodology guide | Methodology | Ch 7 `[^c7-pew]` | Direct |
| Fundraising as political signal | FEC disclosures; OpenSecrets | Data | Ch 7 `[^c7-fec]` | Direct |
| Trust in government decline | Pew "Public Trust in Government: 1958–2024" | Survey series | Ch 7 `[^c7-trust]` | Direct |

---

## Rewrite manuscript inventory

| Unit | Footnotes | Key sources |
|------|----------:|-------------|
| Introduction | 0 | (Campbell footnote removed in revision pass) |
| Ch 1 | 5 | ACEP boarding, CMS HRRP/DRG, IOM emergency care, NAM burnout, Talbot/Dean moral injury |
| Ch 2 | 4 | Zuckerberg, Pichai testimony; WSJ divisiveness reporting; Haugen disclosures |
| Ch 3 | 6 | Garfield, Hirsch, DORA, NSF PAPPG merit review, OSC replication, Ioannidis |
| Interlude | 2 | Monmonier, Scott |
| Ch 4 | 5 | EPA/CARB VW, Paris/SBTi, World Bank carbon pricing, ICVCM/VCMI, ISSB/ESRS |
| Ch 5 | 3 | Cappelli/Tavis, WARN Act, Greenberg organizational justice |
| Ch 6 | 3 | Reuters Digital News Report 2024, Pew methodology, Knight/Gallup trust |
| Ch 7 | 5 | Congressional Record, Cohn, Pew, FEC/OpenSecrets, Hersh, Pew trust |
| Ch 8 | 4 | ESSA, ACGR, PISA 2022, RAND/LPI teacher stress |
| Ch 9 | 1 | Campbell |
| Ch 10 | 2 | Greenberg, NAM |
| Ch 11 | 1 | Jameton, Rushton (combined note) |
| Epilogue | 2 | Monmonier, Campbell |

---

## Revision history

### Revision pass (July 2026)

- Introduction Campbell footnote removed with prose.
- Ch 4: added `[^c4-vw]` (Volkswagen diesel compliance gap).
- Ch 7: added `[^c7-aca]` (ACA public-option debate).
- Bibliography: Introduction section removed; Ch 4/7 entries added.

### Final editorial pass (July 2026)

- Ch 4 VW analogy qualified; Ch 7 ACA causation revised; scaffolding headings removed.

### Final publication pass (July 2026)

- Interlude: solutions → orientation wording.
- Ch 4: local air pollution vs GHG clarification; `[^c4-world-bank]` and `[^c4-vcmi]` cited inline.
- Footnotes Ch 3–8 normalized; bibliography expanded with precise citations and URLs.
- `index.md` subtitle capitalization aligned with `book.yml`.

---

## Issues found and resolved

### 1. Unused footnote definitions (Ch 4) — **resolved**

`[^c4-world-bank]` and `[^c4-vcmi]` were defined but not cited inline.

**Fix:** Added citations at carbon-markets paragraph and offset-integrity questions in [`chapter-4-the-target-on-the-wall.md`](../parts/part-2-when-the-translation-takes-over/chapter-4-the-target-on-the-wall.md).

### 2. Vague bibliography entries — **resolved**

Category-style entries (e.g., “annual reports,” “current program documentation”) replaced with specific titles, years, and stable URLs in [`bibliography.md`](../back-matter/bibliography.md).

### 3. Subtitle capitalization drift — **resolved**

`index.md` used “for”; `book.yml`, title page, and copyright use “For.” Aligned to title case.

---

## Intentional duplicates (not errors)

| Source | Appears in |
|--------|------------|
| Campbell (1979) | Ch 9, Epilogue |
| Greenberg (1990) | Ch 5, Ch 10 |
| NAM burnout (2019) | Ch 1, Ch 10 |
| Monmonier (2018) | Interlude, Epilogue |

Bibliography lists these once per chapter section where they appear, per house practice.

---

## Out of scope / accepted gaps

| Item | Notes |
|------|-------|
| Ch 6 headline A/B testing | General newsroom practice; Pew methodology footnote supports survey/audience measurement context, not a single A/B-test study |
| Ch 9–12 synthesis claims | Authorial synthesis; citation density intentional |
| Composite scenes | Disclosed in appendix |

---

## Verification commands

```bash
python3 tools/audit_citations.py
make validate-book-specs
make build-book DIR=books/when-incentives-become-the-moral-language FORMATS="docx epub pdf"
# Footnote integrity script — see "Footnote integrity" section above
```

**Final pass:** `missing_defs=0`, `unused_defs=0`, Pandoc warnings=0 on DOCX build.
