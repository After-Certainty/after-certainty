# Why Collaboration Is So Hard — Drafting Status

## Current phase

**Recognition rewrite active** — experience deepening and citation pass complete; essay-edition residue cleaned from the live tree (July 2026).

## Edition decision

| Edition | Status |
|---------|--------|
| Essay (~12–15k), 4 parts / 14 chapters | **Archived** — [`research/source-edition/`](research/source-edition/) |
| Recognition rewrite (Intro + 8 chapters + Conclusion) | **Active** |

## Manuscript hub

[`index.md`](../index.md) · Outline [`outline.md`](outline.md) · Rules [`book-rules.md`](book-rules.md) · Agents [`agents/README.md`](agents/README.md)

## Unit progress

| Unit | Phase | Notes |
|------|-------|-------|
| Introduction — The Meeting Everyone Remembered Differently | Experience deepening + citations | Governing close intact |
| Ch 1 — The Show That Opens Friday | Experience deepening + citations | Ending intact |
| Ch 2 — We Did Not Agree to the Same Thing | Experience deepening + citations | Ending intact |
| Ch 3 — The Person Who Keeps the Spreadsheet | Experience deepening + citations | Ending couplet intact |
| Ch 4 — The Ritual Before the Lift | Experience deepening + citations | Ending intact |
| Ch 5 — What the Dashboard Cannot See | Experience deepening + citations | Ending intact |
| Ch 6 — The Nodding Room | Experience deepening + citations | Ending intact |
| Ch 7 — Faster Than Care Can Move | Experience deepening + citations | Ending intact |
| Ch 8 — What the Next Team Inherits | Experience deepening + citations | Ending intact |
| Conclusion — The Show Opens Anyway | Experience deepening (light) + citations | Ending intact |
| Glossary | Deferred | Essay glossary archived under source-edition; redesign later if terms earn names |
| Bibliography | Active | Chicago list synced to Pandoc footnotes |

## Residue cleanup (July 2026)

Moved out of the live book tree into [`research/source-edition/`](research/source-edition/):

- Essay agent pipeline (`docs/agents/` → `source-edition/docs/agents/`)
- Part I author gate
- Stale `semantic-reports/` (paths pointed at deleted essay chapters)
- Empty part coherence stubs; live essay glossary; `.gitkeep`

## Next actions

1. Author review of citation pass, residue cleanup, and cadence/flow pass.
2. Glossary vocabulary strategy when (if) terms earn names in prose.
3. Build smoke test when ready: `make build-book DIR=books/why-collaboration-is-so-hard`.

## Open decisions / resolved

- **Structure:** Recognition spine replaces 14-chapter / 4-part essay (resolved in outline).
- **Source preservation:** Full essay edition under `docs/research/source-edition/` (resolved).
- **Framework naming:** Experience before vocabulary; some terms may never be named in prose (resolved as rule).
- **Live glossary:** Removed from TOC until redesigned (resolved in residue cleanup).
