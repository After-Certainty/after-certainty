# Typographical conventions check (mechanical)

Use this during **Step 5 — Editorial Pass** and any **final editorial pass** (`drafting-process.md`), and after substantive edits to manuscript Markdown.

## Authority

- Reader-facing map (short): `front-matter/typographical-conventions.md`
- Full rules (pull quotes, Pattern Blocks, vignettes, glossary bold, named dynamics, **Plain speak (house style)**): `docs/book-rules.md` (for example **Chapter-End Pull-Quote Convention**, **Callout blocks**, **Vignette Convention**, **Direction vs state**)

## What to verify

1. **Pull Quote Block** — No `**` bold inside the block. Do not bold structural vocabulary (including **renewal**, **erosion**, **vitality**, **decay**) inside pull quotes when they carry the glossary sense (**book-rules.md**).
2. **Pattern Block** — First line only: `**Pattern: Canonical Title**`. Renewing/adjusting titles: body is **positive-only** (no “when it breaks” second half in the same block). No extra `**` in the body (single bold title line per `book-rules.md`, **Callout blocks**).
3. **Vignette Block** — Only scene text inside the block; vignette sub-heading (`### **Short Title**`) **outside** the block. No `**` inside scene text (move analysis or glossary/named-dynamic labels to the following prose).

## Repeatable scan (repo root)

```bash
python3 - <<'PY'
import re
from pathlib import Path

root = Path("when-others-look-to-you/v1")
paths = (
    list((root / "front-matter").rglob("*.md"))
    + list((root / "parts").rglob("*.md"))
    + list((root / "back-matter").rglob("*.md"))
)

def blocks(style):
    return re.compile(
        r':{3,4}\s*\{custom-style="%s"\}\s*\n(.*?)\n:{3,4}' % style,
        re.DOTALL | re.IGNORECASE,
    )

for name, style, bad in [
    ("Pull Quote Block contains **", "Pull Quote Block", lambda b: "**" in b),
    ("Vignette Block contains **", "Vignette Block", lambda b: "**" in b),
    ("Pattern Block body (after title line) contains **", "Pattern Block", lambda b: "**" in "\n".join(b.splitlines()[1:])),
]:
    hits = [p for p in paths for m in blocks(style).finditer(p.read_text(encoding="utf-8")) if bad(m.group(1))]
    print(f"{name}: {len(hits)}")
    for p in hits[:15]:
        print(" ", p)
PY
```

Expect **0** hits for each line unless you are mid-edit. Fix violations before treating the editorial pass as complete.

## Pattern Block heading form (spot-check)

First line of each Pattern Block should match `**Pattern: …**` (see **Callout blocks** in `book-rules.md`). Appendix B uses `## **Title**` without `Pattern:`—do not wrap appendix entries in Pattern Block divs.
