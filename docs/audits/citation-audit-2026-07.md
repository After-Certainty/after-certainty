# Non-fiction Citation Audit

**Date:** 2026-07-01  
**Branch:** `cursor/citation-audit-b461`  
**Automation:** [`tools/audit_citations.py`](../../tools/audit_citations.py)  
**House standard:** [`books/how-meaning-moves/docs/bibliography-pass.md`](../../books/how-meaning-moves/docs/bibliography-pass.md)

This audit classifies all 22 non-fiction titles for Chicago notes-and-bibliography
compliance and Pandoc footnote linking. Fiction (`velorum`, `the-relay`,
`boundary-conditions`) is excluded.

---

## Summary

| Tier | Count | Meaning |
|------|-------|---------|
| **A** | 0 | Legacy citations; needs migration (complete) |
| **B** | 2 | No citations by design; no changes |
| **C** | 20 | Pandoc footnotes + Chicago bibliography linked in index |

Run: `python3 tools/audit_citations.py`  
JSON: `python3 tools/audit_citations.py --json`

---

## Tier A — Legacy, needs migration (complete)

All four Tier A titles were migrated on branch `cursor/citation-audit-b461`:

| Slug | Status |
|------|--------|
| [when-moral-seriousness-scales](../../books/when-moral-seriousness-scales) | Migrated |
| [when-authority-outlives-accountability](../../books/when-authority-outlives-accountability) | Migrated |
| [when-authority-is-misread](../../books/when-authority-is-misread) | Migrated |
| [how-serious-systems-learn](../../books/how-serious-systems-learn) | Migrated |

---

## Tier B — No citations (no changes)

| Slug | Notes |
|------|-------|
| [curiosity-before-certainty](../../books/curiosity-before-certainty) | Introductory tone; zero footnote markers |
| [why-diversity-matters](../../books/why-diversity-matters) | Essay-length; no bibliography by design |

---

## Tier C — Compliant

Pandoc `[^id]` footnotes, `# **Bibliography**` in `back-matter/bibliography.md`,
linked from `index.md`:

`after-certainty`, `before-certainty-arrives`, `coupling`, `how-meaning-moves`,
`how-trust-forms`, `living-in-sediment`, `the-discipline-of-uncertainty`,
`the-economy-we-dont-experience`, `trust-beyond-similarity`,
`when-accountability-no-longer-expires`, `when-incentives-become-the-moral-language`,
`when-interpretation-no-longer-matters`, `when-trust-stops-tracking-reality`,
`when-others-look-to-you/v1`, `when-others-look-to-you/v2`, `why-collaboration-is-so-hard`

**Optional follow-up (not blocking):** some books use non-`cN` ID prefixes
(`intro-*`, `conclusion-*`); integrity-balanced. `why-collaboration-is-so-hard`
cites in only 4 late chapters (sparse by design).

---

## House standard (quick reference)

**Inline:** `[^c14-arendt-responsibility-judgment]` after punctuation.

**Definition** (blank line before each block):

```markdown
[^c14-arendt-responsibility-judgment]: Arendt, Hannah. *Responsibility and Judgment*. New York: Schocken Books, 2003.
```

**Bibliography** (`back-matter/bibliography.md`):

```markdown
# **Bibliography**

- Arendt, Hannah. *Responsibility and Judgment*. Edited by Jerome Kohn.
  New York: Schocken Books, 2003.
```

---

## Footnote integrity check

Per-book (from book directory):

```bash
cd books/<slug> && python3 << 'PY'
import re
from pathlib import Path

roots = [Path("front-matter"), Path("parts"), Path("back-matter")]
ref_pat = re.compile(r"\[\^([^\]]+)\]")
def_pat = re.compile(r"^\[\^([^\]]+)\]:", re.M)
all_refs, all_defs = set(), {}

for root in roots:
    if not root.exists():
        continue
    for p in root.rglob("*.md"):
        if p.name == "bibliography.md":
            continue
        text = p.read_text(encoding="utf-8")
        defs = set(def_pat.findall(text))
        body = re.sub(r"^\[\^[^\]]+\]:.*$(?:\n(?!\[\^|\n).*)*", "", text, flags=re.M)
        used = set(ref_pat.findall(body))
        all_refs |= used
        for d in defs:
            all_defs[d] = p

print("missing definitions:", sorted(all_refs - set(all_defs.keys())))
print("unused definitions:", sorted(set(all_defs.keys()) - all_refs))
PY
```

Expected in a clean pass: no missing definitions, no unused definitions.

---

## Tooling

| Tool | Purpose |
|------|---------|
| [`tools/audit_citations.py`](../../tools/audit_citations.py) | Portfolio classification |
| [`tools/migrate_upcoming_citations.py`](../../tools/migrate_upcoming_citations.py) | Legacy superscript → Pandoc migration (`## Notes`, `## End Notes`, `--notes-md`) |
| [`tools/normalize_chicago_footnotes.py`](../../tools/normalize_chicago_footnotes.py) | Chicago NB footnote body normalization |
| [`tools/convert_serious_systems_footnotes.py`](../../tools/convert_serious_systems_footnotes.py) | Chicago conversion for legacy end-note format |
