# Bibliography and Citation Pass

Use this pass after substantive edits to any chapter, and during part-level
cleanup before approval.

## Purpose

- Keep in-text footnotes consistent and traceable.
- Keep `back-matter/bibliography.md` complete and non-duplicative.
- Standardize citation IDs so references remain stable through revisions.

## Citation format in chapters

Use Pandoc-style footnotes:

- Marker in body: `[^id]` (renders as superscript in output).
- Definition in file: `[^id]: Full note text...`

Place footnote markers after punctuation where possible.

## Stable ID convention

Use semantic, chapter-scoped IDs rather than numeric-only IDs.

- Preferred: `[^c1-ledoux-emotional-brain]`
- Preferred: `[^c3-arendt-responsibility-judgment]`
- Avoid: `[^1]`, `[^2]`, `[^source-a]`

Rules:

- Prefix with chapter (`c1`, `c2`, etc.) for stability.
- Use author + short-work slug.
- Keep IDs lowercase and hyphenated.
- Keep one source to one ID per chapter unless a chapter needs distinct notes.

## Bibliography style (match house model)

`back-matter/bibliography.md` should use:

- A heading: `# **Bibliography**`
- Dash bullets, one source per bullet.
- Wrapped continuation lines indented by two spaces.
- Consistent bibliographic order: Author. *Title*. Publisher/place/year info.

Example shape:

- Author, First. *Book Title*.
  City: Publisher, Year.

- Author, First, and Coauthor Name. "Article Title."
  *Journal Name* Volume, no. Issue (Year): pages.

## Integrity checks

Run from repo root:

```bash
cd books/how-meaning-moves && python3 << 'PY'
import re
from pathlib import Path

roots = [Path("front-matter"), Path("parts"), Path("back-matter")]
ref_pat = re.compile(r"\[\^([^\]]+)\]")
def_pat = re.compile(r"^\[\^([^\]]+)\]:", re.M)

all_refs, all_defs = set(), {}

for root in roots:
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

Expected in a clean pass:

- No missing definitions.
- No unused definitions.

## Part-by-part workflow

For each part pass:

1. Normalize footnote IDs in that part to stable IDs.
2. Ensure footnotes are chapter-scoped and non-duplicative.
3. Add/normalize matching entries in `back-matter/bibliography.md`.
4. Run integrity checks.
5. Note any unresolved source metadata as TODOs in the pass summary.
