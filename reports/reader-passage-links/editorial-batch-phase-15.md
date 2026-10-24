# Reader-passage editorial coverage — Phase 15 (large batch)

Follows the merged [Phase 14 coverage and source corrections (#728)](https://github.com/After-Certainty/after-certainty/pull/728). Phase 14 left **422 valid source paths out of 714**, all mechanically tied to a cited reader fragment, and **215 footnote-cited sources without a path**.

## Editorial approach

This batch deliberately increases scope while preserving citation identity. It reviews **27 works across five chapters**, contrasting with earlier batches of five. All 27 works already appeared in the manuscripts; shared footnotes were narrowed, paired works were tied to different clauses, and a small number of explanatory sentences were added where the distinction was materially useful. Each profile gets a substantive `whyThisMatters` explanation and a reader path, with the historical or empirical provenance separate from this project's interpretive claims.

The work does **not** bulk-accept every ranked audit candidate. Cases where the books genuinely co-support a single indivisible claim remain deferred for later analysis. A mechanically verified A path means a public reader fragment is tied to a specific cited work, not that its author endorses the manuscript's philosophy.

## Group 1 — *Before Certainty Arrives*, chapter 5: Six sources

| Source | Claim-specific reader footnote |
|---|---|
| Karl Jaspers, *The Origin and Goal of History* | `c5-jaspers-origin` — the comparative Axial Age category as an intellectual proposal |
| Shmuel Eisenstadt, ed., *The Origins and Diversity of Axial Age Civilizations* | `c5-axial-debate` — historical variation and limits of a uniform axial narrative |
| Rainer Albertz, *Israel in Exile* | `c5-babylonian-exile` — Babylonian conquest and displacement |
| Jon Levenson, *Sinai and Zion* | `c5-sinai-zion` — covenant and enduring identity, not a second witness to the conquest date |
| Mark Edward Lewis, *Sanctioned Violence in Early China* | `c5-warring-states` — political fragmentation and violent interstate rule |
| Michael Puett, *To Become a God* | `c5-warring-ritual` — cosmological and ritual thought, distinguished from Lewis's political history |

These are complementary disciplinary lenses, not proof that independently developed traditions shared one origin. The manuscript's argument about portable moral coordination remains explicitly interpretive.

## Group 2 — *Before Certainty Arrives*, chapter 6: Five sources

| Source | Claim-specific reader footnote |
|---|---|
| Romila Thapar, *Asoka and the Decline of the Mauryas* | `c6-ashoka-edicts` — imperial context and promulgation of edicts |
| Richard Salomon, *Indian Epigraphy* | `c6-ashoka-epigraphy` — scripts, inscription locations and differing audiences |
| Emanuel Tov, *Textual Criticism of the Hebrew Bible* | `c6-qumran-canon` — manuscript variation |
| Eugene Ulrich, *The Dead Sea Scrolls and the Developmental Composition of the Bible* | `c6-qumran-composition` — gradual textual development rather than assumed canonical closure |
| James VanderKam, *The Dead Sea Scrolls Today* | `c6-qumran-scrolls` — Qumran collections and the range of surviving genres |

The `c6-tools-outliving` note remains deliberately shared between Illich and Kuhn; its two different works were **not** forced into single-source status merely to raise coverage.

## Group 3 — *The Game We Think We Saw*, chapter 1: Four sources

| Source | Claim-specific reader footnote |
|---|---|
| Basketball-Reference, Bill Russell | `c1-russell-career` — season, title, MVP and rebounding totals |
| NBA.com, “Legends Profile: Bill Russell” | `c1-blocks-official` — the timing of official blocked-shot recording |
| Michael Lewis, *Moneyball* | `c1-lewis-moneyball` — Oakland's narrative shift toward undervalued on-base contribution |
| Jahn Hakes and Raymond Sauer, economic study | `c1-hakes-evaluation` — subsequent empirical evaluation, distinct from Lewis's narrative |

The text now explicitly distinguishes an often-told management story from research that tests its economic premise.

## Group 4 — *The Game We Think We Saw*, chapter 2: Six sources

| Source | Claim-specific reader footnote |
|---|---|
| Pro-Football-Reference, Patriots franchise record | `c2-brady-belichick-era` — joint era and dynasty results |
| NBC Sports Boston, Brady/Belichick debate | `c2-brady-debate` — disagreement over credit, not raw sports statistics |
| NFL.com, Brady's September 2008 knee injury | `c2-brady-injury` — the season-ending injury as a discrete event |
| Pro-Football-Reference, 2008 Patriots | `c2-2008-cassel` — record and missing the postseason |
| Pro-Football-Reference, Super Bowl LV box score | `c2-sb-lv` — game statistics and victory |
| NFL.com, Brady's fifth Super Bowl MVP | `c2-sb-mvp` — individual award, separate from the team result |

These distinctions prevent two stories about *who deserves credit* from being merged with the numerical data used to ask the question.

## Group 5 — *When Incentives Become the Moral Language*, chapter 4: Six sources

| Source | Claim-specific reader footnote |
|---|---|
| U.S. EPA, Volkswagen violation notice | `c4-vw` — 2015 defeat-device and real-emissions discrepancy |
| Science Based Targets initiative, *Corporate Net-Zero Standard* | `c4-science-targets` — the corporate target-setting framework, separate from the Paris Agreement |
| Integrity Council for the Voluntary Carbon Market, *Core Carbon Principles* | `c4-credit-integrity` — additionality, durability and credit-quality criteria |
| Voluntary Carbon Markets Integrity Initiative, *Claims Code of Practice* | `c4-vcmi` — integrity of *claims about* carbon credits |
| ISSB, IFRS S1/S2 | `c4-issb` — investor-oriented sustainability and climate financial disclosure |
| EFRAG, European Sustainability Reporting Standards | `c4-esrs` — separate European disclosure regime |

Existing footnotes for the **Paris Agreement**, **World Bank carbon pricing**, and **2016 EPA/CARB Volkswagen settlements** are retained. The chapter describes a hypothetical director; it does not imply that any company in this vignette committed fraud. The regulatory reporting frameworks are described as 2023 standards, not as an assessment of their current implementation in every jurisdiction.

## Preservation and verification requirements

- All 27 source entries gain source-specific reader passage links and substantive, claim-specific explanations.
- Original candidate review decisions are retained as `skipped` with a replacement pointer, or promoted when the same correct anchor is now sole-work A.
- Both `audit.md` and `audit.summary.json` must be regenerated with full HTML/fragment verification **in this PR**. Expect a baseline of 422 sources with paths; verify the actual resulting numbers rather than assuming a fixed arithmetic total.
- Add regression tests to enforce all 27 source → manuscript → footnote relationships, actual in-prose invocation, the prior reference preservation, and the absence of cross-work citation blending.
- Ruff checks, prior Phase 10–14 tests, and site/book-export CI must remain green.
- No new global audit-matcher heuristics, schema changes, or bulk updates to other source profiles are introduced in this batch.

**After audit:** Record the actual counts below, including tied A, any linked-path review flags, and invalid or unverified fragments. If all 27 do not pass, fix or defer the unsupported ones rather than silently reclassifying them.

