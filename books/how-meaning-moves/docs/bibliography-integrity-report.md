# Bibliography Integrity Report

**Book:** *How Meaning Moves*  
**Pass date:** 2026-07-13  
**Scope:** Final bibliography integrity pass after proofreading and Ch10 trim

## Summary

Clean pass. All inline citations resolve to footnote definitions; all footnote works appear in `back-matter/bibliography.md`; no orphan bibliography entries remain.

## Actions taken

1. **Removed orphan footnote definitions in Ch10** — `[^c10-arendt-responsibility-judgment]` and `[^c10-edmondson-fearless-organization]` had no inline citations after the Ch10 lean trim. Arendt and Edmondson remain cited elsewhere (Ch6, Ch7); bibliography entries unchanged.

## Integrity checks (post-fix)

| Check | Result |
|-------|--------|
| Inline refs without definitions | 0 |
| Unused footnote definitions | 0 |
| Inline citation markers | 24 |
| Footnote definitions | 24 |
| Bibliography entries | 23 |
| Cited works missing from bibliography | 0 |
| Bibliography entries without citation | 0 |
| Duplicate bibliography entries | 0 |

The 24 footnote IDs map to 23 bibliography entries because several sources are cited in more than one chapter (French & Raven in Ch1 and Ch6; Fricker in Ch3 and Ch8; Goffman in Ch5 and Ch9; Kahan in Ch2, Ch3, and Ch4; Weick in Ch2, Ch3, and Ch6).

## Citation inventory by chapter

| Chapter | Footnote IDs |
|---------|----------------|
| Ch1 | `c1-barrett-how-emotions-are-made`, `c1-ledoux-emotional-brain`, `c1-ross-intuitive-psychologist`, `c1-french-raven-bases-social-power` |
| Ch2 | `c2-clark-using-language`, `c2-standage-telegraph`, `c2-sensemaking-and-motivated-reasoning` |
| Ch3 | `c3-kruglanski-need-closure`, `c3-sensemaking-and-motivated-reasoning`, `c3-fricker-epistemic-injustice` |
| Ch4 | `c4-lazarus-deutsch-pace-conflict`, `c4-kahan-motivated-reasoning`, `c4-identity-and-caricature` |
| Ch5 | `c5-bowlby-attachment-loss`, `c5-goffman-interaction-ritual`, `c5-minuchin-families-family-therapy` |
| Ch6 | `c6-french-raven-bases-social-power`, `c6-meeting-minutes-institutional-record`, `c6-morrison-employee-voice`, `c6-arendt-responsibility-judgment` |
| Ch7 | `c7-evaluative-threat-and-identity`, `c7-nickerson-confirmation-bias` |
| Ch8 | `c8-fricker-epistemic-injustice` |
| Ch9 | `c9-goffman-interaction-ritual` |
| Ch10 | *(none — intentional; chapter closes without scholarly footnotes)* |

## Previously removed (earlier passes)

- **Suchman** — bibliography entry removed when prose citation was cut
- **Perrow** — footnote, inline citation, and bibliography entry removed in final proofreading pass

## Verification command

Re-run from `books/how-meaning-moves/` using the integrity script in `docs/bibliography-pass.md`. Expected output:

```
missing definitions: []
unused definitions: []
```
