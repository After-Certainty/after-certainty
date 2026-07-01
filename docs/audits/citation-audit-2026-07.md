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
| **A** | 4 | Legacy citations; needs migration |
| **B** | 2 | No citations by design; no changes |
| **C** | 16 | Pandoc footnotes + Chicago bibliography linked in index |

Run: `python3 tools/audit_citations.py`  
JSON: `python3 tools/audit_citations.py --json`

---

## Tier A — Legacy, needs migration

| Slug | Pattern | Bibliography | Action |
|------|---------|--------------|--------|
| [when-moral-seriousness-scales](../../books/when-moral-seriousness-scales) | `## Notes` + Unicode superscripts; mixed `¹` / `1.` numbering | Missing | Migrate footnotes; create bibliography; link index |
| [when-authority-is-misread](../../books/when-authority-is-misread) | `## Reference` + superscripts; thematic glosses | Missing | Migrate footnotes; create bibliography; link index |
| [when-authority-outlives-accountability](../../books/when-authority-outlives-accountability) | Superscripts in 7 chapters; defs in `back-matter/notes.md` | Missing | Inject chapter footnotes from notes.md; create bibliography |
| [how-serious-systems-learn](../../books/how-serious-systems-learn) | `## End Notes` + superscripts (16 chapters) | Table metadata sheet, not Chicago bullets | Migrate footnotes; reformat bibliography |

### Fix order (one PR per book after this audit)

1. `when-moral-seriousness-scales`
2. `when-authority-outlives-accountability`
3. `when-authority-is-misread`
4. `how-serious-systems-learn`

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
| [`tools/migrate_upcoming_citations.py`](../../tools/migrate_upcoming_citations.py) | Legacy superscript → Pandoc migration |

Migration supports `## Reference`, `## Notes`, `## End Notes`, and
`--notes-md` mode for centralized `back-matter/notes.md` injection.
