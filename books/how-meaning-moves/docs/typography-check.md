# Typography Check (Mechanical)

Use this during editorial passes and after substantial manuscript edits.

## Authority

- Reader-facing map: typographical notes in front matter (if present)
- Full editorial authority: `docs/book-rules.md`

## What to verify

1. Pull Quote blocks contain no inline `**` bold.
2. Pattern block first line is exactly `**Pattern: ...**`.
3. Pattern blocks use matched `:::` fences (`::: {custom-style="Pattern Block"}` … `:::`). The repeatable script below verifies **exactly three colons** on open and close.
4. Pattern block body does not add extra `**` formatting.
5. Vignette blocks contain scene text only; no inline `**` labels.
6. Vignette blocks are preceded by a short heading line in the form `### **Short Title**`.

## Repeatable scan (repo root)

Implementation (single source of truth): `tools/how_meaning_moves_typography_check.py`.

```bash
python3 tools/how_meaning_moves_typography_check.py
```

Or via Make:

```bash
make typography-check-how-meaning-moves
```

GitHub Actions runs the same script on pull requests and pushes when files under `books/how-meaning-moves/` change (see `.github/workflows/how-meaning-moves-typography.yml`).

Expected result is **zero** for every printed count, and exit status **0**. Any failure prints `Typography check failed.` to stderr and exits **1** (CI-friendly).
