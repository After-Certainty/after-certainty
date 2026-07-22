# Editorial report — final rhythm, citation, and production pass (July 2026)

Manuscript: *The World We Make Together*

## 1. Word counts

| Scope | Before | After |
|------:|-------:|------:|
| Full manuscript sources (front/parts/back, incl. bibliography) | ~48,616 | ~48,724 |
| Body (Introduction through Conclusion, incl. part bridges) | ~47,399 | ~47,473 |

Small net increase comes mainly from more specific footnote and bibliography wording, not developmental expansion. Prose rhythm edits produced local compression offset by citation specificity.

## 2–5. Antithesis pattern

| Metric | Count |
|--------|------:|
| Antithetical / paired-negation constructions reviewed (priority chapters + Conclusion; search on `does not` / `cannot` / `is not` / `not merely` / `not simply` / short `Not` / reject-then-replace pairs) | ~45 pair-like hits in Ch 6–10 + Conclusion; full-manuscript pattern inventory ~41 load-bearing constructions carried from prior pass |
| Retained unchanged (including load-bearing formulations) | ~27–29 |
| Recast, merged, or removed | **16** |

### Representative revisions

1. **Merge (Ballot):** “This does not make voting meaningless. It makes voting incomplete…” → “Voting remains meaningful, but it becomes incomplete—and dangerous—when asked to carry the entire burden of shared power.”
2. **Recast (Fence):** “Trust is not the absence of rupture. It is partly the existence of a route back…” → “Trust includes a route back after rupture: an institution to reconvene…”
3. **Merge (Fence close):** “A shared world does not begin when every fence comes down. / It begins when…” → single positive sentence.
4. **Recast (Scale):** “Power-with does not mean pretending interpretation has vanished. / It means…” → “Power-with still depends on interpretation. What changes is that the people living within the situation participate meaningfully…”
5. **Recast (Conclusion):** “The table is not valuable because everyone around it will agree. It is valuable because…” → “The table’s value lies less in guaranteeing agreement than in holding disagreement inside a relationship no one person completely owns.”

**Preserved:** ballot preference vs justice; equal mark / shared work; fence/trust formulations; Counterpower restrains domination / does not necessarily create a common capacity; Without refusal, agreement may be only compliance; scale → window close.

## 6. Chapter 9 paragraph rhythm

Combined **~18** short-paragraph / fragment clusters into flowing sentences or short paragraphs (target 10–15; a few additional low-cost merges were included where clusters were purely successive explanation).

Preserved isolated statements for conceptual turns, including counterpower, refusal/compliance, and the scale→window handoff.

Short-cluster count after pass: ~20 remaining (down from ~37), with remaining isolation used for emphasis rather than habit.

## 7–9. Citations and bibliography

| Item | Result |
|------|--------|
| Duplicate / overlapping notes consolidated | Pullman Strike Commission cluster (`c9-panic-rents`, `c9-strike`, `c9-commission`) aligned to one titled report with shortened later forms; Flint notes (`c9-flint`, `c9-brigade`, `c9-settlement`) shortened to Fine without vague “Michigan labor histories”; Little Rock NPS notes de-duplicated language and dropped vague “National Archives summaries” where NPS + EO 10730 suffice |
| Citation entries made more specific | **~18** notes sharpened (March on Washington NPS pages; Apollo SP-4102 / SP-238; Little Rock NPS URLs; Newburgh editions; NUMMI NYT/SF Chronicle; World Bank Report 40144-BR; SA IEC/SAHO; langar/Pluralism; COINTELPRO Church Committee; Citizenship Schools LDHI exhibit pages; Pullman NPS URLs) |
| Bibliography | Rebuilt for consistency: exact titles, stable URLs, report numbers, hanging-indent `Bibliography` style blocks; removed homepage-only / vague institutional placeholders where a specific page or report exists; added Abate; IEC; SAHO; Apollo 11 Mission Report; specific LDHI pages; World Bank 40144-BR |

## 10. Table of contents / production

- `tools/docx_interior_finish.py` no longer inserts instructional “right-click / Update Field” placeholder text.
- TOC field (`TOC \o "1-2" \h \z \u`) is generated with **populated cached entries** for Introduction, Part I (injected; no Part I bridge file), Parts II–IV, Chapters 1–10, Conclusion, Bibliography, with tab leaders.
- `w:updateFields` is set so Word refreshes TOC page numbers on open.
- LibreOffice index refresh was tested and **emptied** the field (outline mapping), so it is **not** used in the build; final numeric page refresh: open the DOCX in Word (or LibreOffice and update the TOC field carefully) once before print PDF if em-dash placeholders remain.
- Cover/title/copyright/Contents separation, Clock Before/During/After H3 style, and interior_finish headers/sections verified via rebuild (`toc_field: true`, 16 body openers, 17 sections).

## 11. Still requiring human verification

- Exact page pin in NASA SP-4102 for the ~400,000 Apollo workforce figure.
- Mahalia Jackson “Tell them about the dream” remains recollection-attested.
- Soweto queue photograph: SAHO collection-level rather than a single catalogued image ID.
- USDA–Black Panther breakfast influence remains interpretive.
- Some NPS / NMAAHC / CAAM notes remain site-level rather than single archive item IDs.
- TOC numeric page values after Word open-update (em dashes until field refresh).

## 12. Integrity

No historical cases, chapters, governing claims, object scenes, Introduction preview material, Conclusion object inventory, or Chapter 3 Challenger/Y2K structure were removed or substantially rewritten. This pass was rhythm, antithesis variety, citation specificity, bibliography standardization, and DOCX production only.
