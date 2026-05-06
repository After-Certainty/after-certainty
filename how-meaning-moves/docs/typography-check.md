# Typography Check (Mechanical)

Use this during editorial passes and after substantial manuscript edits.

## Authority

- Reader-facing map: typographical notes in front matter (if present)
- Full editorial authority: `docs/book-rules.md`

## What to verify

1. Pull Quote blocks contain no inline `**` bold.
2. Pattern block first line is exactly `**Pattern: ...**`.
3. Pattern block body does not add extra `**` formatting.
4. Vignette blocks contain scene text only; no inline `**` labels.
5. Vignette blocks are preceded by a short heading line in the form `### **Short Title**`.

## Repeatable scan (repo root)

```bash
python3 - <<'PY'
import re
from pathlib import Path

root = Path("how-meaning-moves")
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

checks = [
    ("Pull Quote Block contains **", "Pull Quote Block", lambda b: "**" in b),
    ("Vignette Block contains **", "Vignette Block", lambda b: "**" in b),
    (
        "Pattern Block body (after title line) contains **",
        "Pattern Block",
        lambda b: "**" in "\n".join(b.splitlines()[1:]),
    ),
]

for name, style, bad in checks:
    hits = []
    for p in paths:
        text = p.read_text(encoding="utf-8")
        for m in blocks(style).finditer(text):
            if bad(m.group(1)):
                hits.append(p)
                break
    print(f"{name}: {len(hits)}")
    for p in hits[:20]:
        print(" ", p)
PY
```

Expected result is zero hits for all lines once a pass is complete.
