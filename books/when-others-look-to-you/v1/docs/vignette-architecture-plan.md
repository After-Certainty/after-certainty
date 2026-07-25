# Vignette Architecture Plan — When Others Look to You v1

Planning document only. This pass does **not** revise manuscript prose, change
semantic metadata, modify schemas, regenerate exports, or implement any proposed
vignette changes until a later implementation task begins.

Authoritative location: `books/when-others-look-to-you/v1/docs/vignette-architecture-plan.md`.
No duplicate under `docs/roadmaps/`.

**Status:** Editorial decisions below are **approved**. The plan is ready to
drive chapter-level work on branch `cursor/wolty-vignette-architecture-plan-ca80`
after VIGNETTE-001 baseline confirmation. See §30 Ready to implement.

---

## 1. Purpose

The book’s conceptual framework is strong after the preservation-first editorial
revision. The remaining opportunity is vignette architecture: make selected
scenes more inhabitable, structurally meaningful, and memorable in the signature
movement—

ordinary object or action
→ lived uncertainty
→ widening structural tension
→ conceptual recognition
→ return to the object with changed meaning

Goals for selected scenes:

- More inhabitable and less obviously constructed to prove a category
- Better integrated into chapter architecture
- Able to carry meaning before the explanatory framework arrives
- Able to return near the end with changed significance where appropriate
- Memorable as objects rather than only as leadership terms

Non-goals:

- Making every vignette longer, ornate, or cinematic
- Turning the book into a novel
- Rewriting already strong scenes for consistency
- Adding a symbolic object or return to every chapter
- Mechanical uniformity across chapters

Expected method for most revisions:

strengthen or consolidate the scene
+ remove nearby explanatory repetition
= roughly stable chapter length

**Strongest plan conclusions (do not reopen casually):**

- Most scenes should remain untouched.
- Chapter 5 and Chapter 8 are internal models.
- Introduction and Chapter 1 should not be casually revised.
- Chapter 12 and the epilogue should not gain new vignette material.
- The book should remain approximately stable in length.
- Details must perform conceptual work.
- Not every chapter requires an object return.
- Some clear paired examples should remain.
- Fictional specificity must not imply historical reporting.
- The previous editorial revision is the conceptual baseline.

---

## 2. Editorial baseline

| Item | Value |
|---|---|
| Planning / implementation branch | `cursor/wolty-vignette-architecture-plan-ca80` |
| Conceptual baseline | Latest `main` including PR #364 (`4db44908`) |
| Book root | `books/when-others-look-to-you/v1/` |
| Preservation register | [`editorial-preservation-register.yml`](editorial-preservation-register.yml) |
| Baseline metrics | [`editorial-baseline.md`](editorial-baseline.md) |
| Verification report | [`editorial-preservation-verification.md`](editorial-preservation-verification.md) |
| Validation command | `python3 tools/validate_editorial_preservation.py --book-dir books/when-others-look-to-you/v1` |
| Word-count tooling | `tools/manuscript_structure.count_words` on TOC-linked units from `index.md` |

Approximate current word counts (plain `wc -w` on unit files; VIGNETTE-001 must
recapture canonical counts with established tooling):

| Unit | ~Words | Formal Vignette Blocks |
|---|---:|---:|
| Preface | 353 | 0 |
| Introduction | 676 | 0 |
| Bridge I | 132 | 0 |
| Chapter 1 | 1,023 | 0 |
| Bridge II | 134 | 0 |
| Chapter 2 | 924 | 0 |
| Chapter 3 | 1,342 | 4 |
| Chapter 4 | 1,258 | 4 |
| Chapter 5 | 2,134 | 3 |
| Bridge III | 107 | 0 |
| Chapter 6 | 2,502 | 7 |
| Chapter 7 | 1,114 | 2 |
| Chapter 8 | 1,425 | 1 |
| Bridge IV | 138 | 0 |
| Chapter 9 | 1,007 | 1 |
| Chapter 10 | 1,424 | 2 |
| Chapter 11 | 2,093 | 2 |
| Bridge V | 75 | 0 |
| Chapter 12 | 634 | 0 |
| Epilogue | 518 | 0 |

Formal `Vignette Block` count in argument chapters: **26**.
Broader scene/example inventory: **45**.

Note: Chapter 12 lives under `parts/part-5-closing/`, not Part IV.

---

## 3. Relationship to the completed editorial revision

This vignette pass is a **separate editorial effort**, not an extension of PR #364.

Preserve all improvements already landed there, including:

- Canonical definition of a leader
- Protected-language register (verbatim, substantive, manual review)
- Terminology-integrity corrections
- Distinction between correction and circulation
- Stronger observer-responsibility material
- Revised Chapter 2 framing (directions, mixed states, anti-typing, four-state framework)
- Tighter Chapter 12
- Stable chapter identities and native-reader routes
- All existing citations and footnotes

Treat [`editorial-preservation-register.yml`](editorial-preservation-register.yml)
as authoritative; do not duplicate it here.

---

## 4. Signature-style findings from other books

Representative chapters inspected (actual manuscript prose, not summaries):

| Book | Signature objects |
|---|---|
| `the-world-we-make-together` | crop, bowl, clipboard |
| `why-collaboration-is-so-hard` | spreadsheet, crane ritual |
| `learning-to-see` | breath return; ritual vessels |
| `the-game-we-think-we-saw` | box score; whistle/replay |
| `living-in-sediment` | mortgage papers; book shelf |
| `before-certainty-arrives` | plastered skull / settlement |
| `the-economy-we-dont-experience` | grocery receipts |
| `boundary-conditions` | incident message / bridge |
| `after-certainty` | tree / photograph |

Craft principles (do **not** copy scenes, metaphors, or sentences):

1. Utility before symbolism
2. Stay in scene ~4–12 short paragraphs before naming the concept
3. Operational detail only (cost, permission, timing, access, memory)
4. Widen through one institution, then name the pattern
5. Return with changed meaning; leave some tension unresolved
6. Hold ambiguity (true-but-incomplete, useful-but-dangerous)
7. Avoid business-school case tone
8. One decision-pressure per vignette; roles over character arcs

---

## 5. Vignette design principles

A major vignette should generally contain:

**Physical anchor** — object/action/artifact that does conceptual work  
**Live decision** — someone can still act differently  
**Partial knowledge** — no omniscient framework character  
**Social consequence** — who is credited, ignored, exposed, protected, delayed,
invited, excluded, trusted, remembered, or punished  
**Aftermath** — the room/institution learns something next  
**Return** — only where appropriate and transformative (see §5a)

### 5a. Object-return policy (resolved)

| Priority | Units |
|---|---|
| **Strongly expected** | Chapter 9, Chapter 10, Chapter 11 |
| **Optional** | Chapter 6, Chapter 7 |
| **Generally avoid adding** | Introduction, Chapter 1, Chapter 5, Chapter 8, Chapter 12, Epilogue |

“Strongly expected” does **not** mean mandatory if the drafted return feels cute,
overly symmetrical, self-conscious, like the author pointing at the metaphor, or
repetitive rather than transformative.

Every implementation task must allow removal of a planned return during review.

---

## 6. Anti-patterns to avoid

- Generic sensory detail and decorative atmosphere
- Making fictional composites sound like documented history
- Uniform vignette length; story openings in every chapter; symbolic objects everywhere
- Perfect good-group / bad-group symmetry
- New scenes merely to illustrate every concept
- Lengthening by layering scenes over unchanged explanation
- Replacing conceptual precision with literary ambiguity
- Melodrama, scripted dialogue, unnecessary personal names
- Reopening settled terminology or altering protected language
- Weakening citations or breaking native-reader structure
- Copying another book’s prose
- Rewriting already strong scenes for consistency
- Cumulative patterning that makes chapters mechanically uniform (see §24a)

---

## 7. Current vignette inventory

Inventory covers formal `Vignette Block` scenes and non-block narrative examples.
Full entry-level detail from the planning pass remains summarized here by unit;
chapter diagnoses in §11 supersede earlier tentative recommendations where they
conflict.

### Formal Vignette Blocks (26)

| Ch | Titles / openings | Count |
|---|---|---:|
| 3 | Dashboard interruption; Correction in Public; Budget Line; Variance on Ledger | 4 |
| 4 | Foreman/rebar; Question Not Asked; Placement Queue; Vote After the Flood | 4 |
| 5 | Swap Goes Out; Hold for the Chef; Who Gets Credit (theater) | 3 |
| 6 | Cold-chain stop; Cold-chain ship; Rivet Batch; Peak Numbers; Tournament; Quarterly; Escalation Stops | 7 |
| 7 | After the Citation (library); Fast Rule Pauses | 2 |
| 8 | Handoff After the Surge (+ four legitimacy variants in same network) | 1 |
| 9 | Regional Network | 1 |
| 10 | Emergency Order Closed; Emergency Order Reopened | 2 |
| 11 | Fast Desk; Smooth Board | 2 |

Plus ~19 non-block examples across intro, Ch1–2, bridges, Ch12, epilogue.

---

## 8. Classification rollup

| Class | Approx. count | Notes |
|---|---:|---|
| protect | 24 | Incl. Ch3–5, Ch8, Ch12, epilogue, models |
| light-polish | 3 | Continuity-only unless drift found |
| strengthen-anchor | 2 | Ch2, Ch9 |
| consolidate / complicate | 2 | Ch6, Ch10 |
| add-return | 1–2 | Ch11 strongly expected; Ch7 conditional/optional |
| leave-as-brief / no vignette task | rest | Intro, Ch1, bridges, many pairs |
| Active major prose chapters | 5 | Ch10 first, then Ch2, Ch6, Ch9, Ch11 |

---

## 9. Strong internal models

### Chapter 5 — Circulation (protect)

Preserve kitchen phone / ticket rail / sous hesitation / credit aftermath /
theater pair. Preserve exactly:

> When guest leadership is trusted, more people use it openly.
>
> When guest leadership is punished, people retreat.

> The failure mode is not "they didn't hear you." It is "only one name is permitted to steer."

> Circulation copies permission before it ever copies a title.

No wholesale rewrite. Optional light aftermath compression only if still stacked.

### Chapter 8 — Legitimacy Over Time (protect)

Model for object continuity, temporal widening, and one-institution inheritance
via the emergency-permissions package. Do not introduce interchangeable new
settings.

---

## 10. Chapters requiring no change (architecture)

| Unit | Why |
|---|---|
| Preface | Frame only |
| Introduction | Canonical definitions; deferred |
| Bridges I–V | Short handoffs; no scenes |
| Chapter 1 | Definition staging; deferred |
| Chapters 3–4 | Formal vignettes already meet standard |
| Chapter 5 | Internal model |
| Chapter 8 | Internal model |
| Chapter 12 | Recently tightened; continuity review only |
| Epilogue | Refusal of easy restoration; continuity review only |
| Appendices / Glossary | Reference |

---

## 11. Priority chapter diagnoses (with approved decisions)

### Chapter 2 — Two Directions — **APPROVED**

**Decision:** Use an existing institutional protocol / risk note / review artifact
already native to the chapter. Do **not** introduce a product-launch whiteboard.
Prefer hospital or school material. Preserve the four-state framework and all
terminology corrections from the editorial pass.

#### Artifact ranking

| Rank | Artifact in manuscript | Why |
|---|---|---|
| **1 — Recommended** | Hospital **triage protocol** + **dosage-order risk** (satellite clinics; monthly review) | Makes **scalability** (same thresholds / reach across clinics) and **adaptability** (update practice now vs wait for monthly review) visible in one institutional object; live midweek decision; not a software-team scene |
| 2 — Plausible secondary | School **attendance intervention protocol** + **thresholds** / weekly absence data | Excellent for mixed renewal/erosion on one map; slightly weaker as the sole opening live decision than the dosage-order risk |

**Why not whiteboard:** Not in the manuscript; imports a product/corporate setting
that fights the chapter’s institutional capacity examples; visually convenient
but institutionally false for this chapter.

**Architecture:**

1. Replace the generalized paired-team opener with the hospital triage protocol /
   dosage-order risk as the inhabitable opening case (or open immediately into it
   so the abstract pair is no longer the first remembered scene).
2. Keep the school attendance protocol as the mixed-state secondary case.
3. Preserve capacity definitions, four-state naming-once + diagram, anti-typing,
   and pull quote.
4. Return optional: only if what remains unchanged on the protocol / threshold
   sheet deepens the mixed-state read.

Size: **M**. File:
`parts/part-2-renewal-erosion-circulation/chapter-2-the-two-groups.md`.

---

### Chapter 6 — Harm Under Influence — **APPROVED**

**Decision:** Cold-chain is the primary remembered vignette. Preserve harm range.
Allow substantial compression of secondary examples. Not every retained example
must remain a full Vignette Block. Do not reduce harm to physical safety alone.

#### Exact current formal vignette set

1. Cold-chain supervisor stops outbound door (temperature log; product hold)
2. Cold-chain site ships with gel packs (same gap; displacement)
3. The Rivet Batch (harm-absorbing)
4. Peak Numbers Hold (harm-tolerant; parcel hub)
5. The Tournament Weekend (harm-instrumental; youth soccer)
6. The Quarterly Looks Healthy (harm-blind; software dashboard)
7. When Escalation Stops (hospital scheduling / correction failure)

#### Final hierarchy

| Tier | Scene | Form | Rationale |
|---|---|---|---|
| **1. Primary anchor** | Cold-chain pair (log, outbound door, product hold / parked trucks, blunt note, huddle naming the call) | Keep as paired Vignette Blocks or one strengthened primary + short contrast beat | Cost, stop decision, credit/aftermath already strong |
| **2. Full secondary** | The Tournament Weekend | Keep as full Vignette Block | Only clear non-safety instrumental tradeoff with aftermath punishment; protects harm-range |
| **3. Brief applications** | Rivet Batch; When Escalation Stops; Quarterly (compressed) | Compress out of full-block weight where possible | Absorbing detail beyond the door-stop; correction-failure bridge; harm-blind channel design |
| **4. Compress heavily** | Peak Numbers Hold | Brief mention under harm-tolerant | Recurrence/normalization overlaps cold-chain displacement less uniquely than Tournament |
| **5. Remove / relocate** | None | — | Do not move main-text harm range into appendix |

Optional return (Ch6): temperature log / “who authorized the stop” note—only if it
replaces explanatory repetition and does not feel cute.

Size: **M**. Expected length: stable to slightly shorter. File:
`parts/part-3-harm-effectiveness-legitimacy/chapter-6-harm-under-influence.md`.

---

### Chapter 7 — Effectiveness and Its Illusions — **CONDITIONAL**

**Decision:** Optional until larger vignette changes can be read together.
Preserve library dinner, state citation, newspaper attention, and movement toward
dessert. No assumed major rewrite. Restrained return only if it deepens naturally.
Do not create a clever or conspicuously symbolic ending.

**Task status:** VIGNETTE-004 is **conditional**.

**Conditions that justify doing Ch7 after Ch2, Ch6, Ch9, Ch10, and Ch11:**

1. Whole-book read shows the library scene no longer carries enough inhabitability
   relative to newly strengthened chapters, **or**
2. Success-narrows-correction teaching has become abstract again because nearby
   explanation drifted, **or**
3. A restrained citation/dessert return would remove explanatory repetition
   without becoming cute.

If none of those conditions hold after the decision gate, **skip Ch7 prose work**.

Size if run: **S**. File:
`parts/part-3-harm-effectiveness-legitimacy/chapter-7-effectiveness-and-its-illusions.md`.

---

### Chapter 9 — Scale and Drift — **APPROVED**

**Decision:** Use an existing reporting / public-update artifact already present.
Do not invent character-limited interfaces, dropdowns, or form fields unless the
manuscript already contains them (it does not). Make scale visible as compression.
Preserve scale ≠ erosion.

#### Manuscript-native carrier (exact)

**Primary artifact:** **public updates** that “highlight growth and consistency,”
fed by **paperwork and fixed reporting cycles** around the **mentoring program**.

(Secondary texture already present: shared branding, shared training, shared donor
strategy—these stay as institutional context, not the live carrier.)

| Beat | Content |
|---|---|
| What enters | Mentoring burnout; quiet exclusion of younger volunteers; local adaptation needs |
| What is compressed / lost | Names, exclusion texture, local timing, the cost of staying in the program |
| What the center still sees | Growth, consistency, expansion, a coordinated public story |
| What happens locally first | Adaptation slows; people burn out or go quiet **before** the official status changes |
| Strongly expected return | Public update (or reporting packet) still celebrating growth/consistency after local meaning has thinned |

Size: **M**. File:
`parts/part-4-scale-pressure-misjudgment/chapter-9-scale-and-drift.md`.

---

### Chapter 10 — Tradeoffs Under Pressure — **APPROVED (first major prose task)**

**Decision:** One-city temporal architecture. Calibration chapter for the pass.

#### Strongest existing physical artifact

**Primary carrier already in manuscript:** the **central signature** / **approval
path** enforced by the **temporary command protocol** (with corridors, emergency
order, and flooded→later-dry underpasses as condition markers).

Do **not** invent a laminated map or approval box. The signature / approval path /
command protocol already performs the conceptual work.

#### Required narrative arc

1. Real emergency creates a coordination problem.
2. Temporary centralized authority solves something important.
3. Centralization is not foolish or illegitimate at the moment it begins.
4. Local information starts moving again.
5. Correction reopens before circulation fully returns.
6. Local actors can report changing conditions but still lack bounded decision authority.
7. Storm / emergency conditions recede.
8. Centralized signature / approval requirement / command protocol remains.
9. Legitimacy thins because original justification and continuing authority have separated.
10. Ending returns to the ordinary artifact in changed conditions.

#### Preserve precisely

- Correction = signals can alter central decisions.
- Circulation = authority itself can move.
- Information flow ≠ restored decision rights.
- Temporary centralization may be justified.
- Persistence, not concentration alone, creates the later legitimacy problem.

#### Material from existing city vignettes

| Source | Disposition |
|---|---|
| Closed city: flooded underpasses, diverted ambulances, sandbag procurement | **Retain** as justified opening |
| Closed city: temporary command protocol blocks local overrides | **Retain** as early contraction |
| Closed city: months-later “proven under pressure”; corridor needs central signature | **Retain / climax** — primary persistence beat |
| Reopened city: missed dialysis-stop access flagged | **Combine** into middle phase as local information returning |
| Reopened city: concerns logged for post-spike review | **Combine** — correction channel partially opens as reporting |
| Reopened city: district override restored; challenge calls; corridors rerouted; sunset/review date | **Reorder** into attempted recovery beats; in the one-city arc these may be incomplete, temporary, or later rolled back so persistence can still land—teaching clarity comes from sequence, not a second city |
| Dual-city mirror explanation (“What the Contrast Shows” and repeated closed/reopened restatements) | **Compress heavily** once one temporal arc carries the contrast |
| Boundary / Exceptions are Forever synthesis | **Retain**, attached to the single approval-path object |

#### Preserving teaching clarity without paired cities

Use **time** as the contrast engine:

- Phase A (hours/days): justified centralization
- Phase B (first week): local signal returns; correction partially reopens; circulation still gated by signature
- Phase C (months later): dry underpass / stabilized weather; signature still required; legitimacy thins

Readers learn the same split the pair taught—bounded emergency vs capture—by
watching one institution fail to release, rather than by toggling between City A
and City B.

Size: **L–XL**. Expected length: stable (merge two VGs + compress mirror
exposition). File:
`parts/part-4-scale-pressure-misjudgment/chapter-10-tradeoffs-under-pressure.md`.

---

### Chapter 11 — Why We Misjudge Leaders — **APPROVED**

**Decision:** Newsroom dashboard is the principal anchor. Preserve air-traffic /
prevented-harm (Smooth Board) as secondary if it continues distinct work. Make
visible that the dashboard measures speed/traffic while corrections and prevented
errors live elsewhere. Strengthen observer selection pressure. Return only if
restrained.

**Architecture:**

1. Keep Fast Desk (Desk A/B; weekly review follows dashboard: speed, share, volume).
2. Keep Smooth Board as structural-blindness secondary application.
3. Strongly expected restrained return to the projected dashboard near the
   selection-pressure / clearer-read close.
4. Compress nearby outcome-bias exposition that the return will make redundant
   (especially restatements that results are noisy / prevented harm is invisible,
   once the dashboard return enacts it).

**Illustrative direction only (not approved manuscript prose):** the chart did
not lie, but had no field for prevented errors or later corrections.

Size: **S–M**. File:
`parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md`.

---

### Introduction and Chapter 1 — **DEFERRED**

Do not schedule a prose task unless later whole-book review identifies a specific
and substantial weakness. Protect the canonical leader definition and surrounding
architecture. Do not revise merely to force object-return conformity.

Preserve exactly:

> A leader is someone others look to when deciding what to do next.

> Leadership cannot be reduced to intention. Intention matters, but structure matters more.

> The aim is not to condemn people. It is to clarify dynamics.

> Whether leadership exists is rarely the puzzle. The question is what it is becoming while others watch—and what you can still see in the meantime.

VIGNETTE-008 remains **deferred** (possible later review item only).

---

### Chapter 12 and Epilogue — **CONTINUITY ONLY**

Do not add new vignettes. Do not restore material removed in the recent editorial
tightening. Review only for continuity after chapter-level work. Preserve the
epilogue’s refusal of easy restoration.

---

## 12. Chapter-by-chapter revision map

| Unit | Role | Status | Action | Anchor | Return | Size |
|---|---|---|---|---|---|---|
| Preface | frame | protect | none | — | avoid | — |
| Intro | canonical | deferred | none unless later weakness | — | avoid | — |
| Bridge I | handoff | protect | none | — | avoid | — |
| Ch1 | formation | deferred | none unless later weakness | — | avoid | — |
| Bridge II | defs | protect | none | — | avoid | — |
| Ch2 | grid | **active** | institutional opener | triage protocol / dosage-order risk | optional | M |
| Ch3 | renewal VGs | protect | continuity only | existing | avoid adding | XS |
| Ch4 | erosion VGs | protect | continuity only | existing | avoid adding | XS |
| Ch5 | model | protect | none | phone / rail | avoid adding | — |
| Bridge III | lenses | protect | none | — | avoid | — |
| Ch6 | harm | **active** | consolidate hierarchy | temperature log / door | optional | M |
| Ch7 | effectiveness | **conditional** | only if gate fires | citation / dessert | optional | S |
| Ch8 | model | protect | none | permissions list | avoid adding | — |
| Bridge IV | handoff | protect | none | — | avoid | — |
| Ch9 | scale | **active** | deepen compression carrier | public update / reporting cycle | strongly expected | M |
| Ch10 | pressure | **active first prose** | one-city temporal | central signature / approval path / command protocol | strongly expected | L–XL |
| Ch11 | misjudgment | **active** | dashboard return | newsroom dashboard | strongly expected | S–M |
| Bridge V | handoff | protect | none | — | avoid | — |
| Ch12 | synthesis | continuity only | no new VGs | existing returns | avoid adding | — |
| Epilogue | close | continuity only | no new VGs | — | avoid adding | — |

---

## 13. Physical-anchor recommendations (final)

| Chapter | Final anchor | Notes |
|---|---|---|
| Ch2 | Hospital triage protocol + dosage-order risk | School attendance protocol remains secondary mixed-state case |
| Ch5 | Phone + ticket rail (existing) | Protect |
| Ch6 | Temperature log + outbound door / product hold | Tournament full secondary |
| Ch7 | Citation + dessert pivot (existing) | Conditional task only |
| Ch8 | Emergency-permissions list (existing) | Protect |
| Ch9 | Public updates + paperwork / fixed reporting cycles | Mentoring program content |
| Ch10 | Central signature / approval path / temporary command protocol | Underpass as condition marker |
| Ch11 | Newsroom dashboard (speed/share/volume) | Smooth Board secondary |

---

## 14. Paired-example recommendations

| Pair | Recommendation |
|---|---|
| Ch2 abstract teams | Replace / demote; hospital case becomes remembered opener |
| Ch2 hospital networks | Absorb into strengthened opener; keep contrast beats |
| Ch2 school districts | Keep as mixed-state teaching contrast |
| Ch5 kitchen + theater | Keep clean contrasts (model) |
| Ch6 cold-chain pair | Keep primary |
| Ch6 posture set | Reduce full-block count; keep conceptual range |
| Ch10 closed/reopened cities | Convert to one-city temporal phases |
| Ch11 Desk A/B | Keep |
| Ch11 Fast Desk vs Smooth Board | Keep both if Smooth Board remains distinct |

Preserve some clear contrasts. Do not force every example into ambiguity.

---

## 15. Scene consolidation recommendations

| Location | Action |
|---|---|
| Ch6 Peak Numbers | Compress to brief harm-tolerant application |
| Ch6 Quarterly | Compress to brief harm-blind application |
| Ch6 Rivet / Escalation | Brief applications (or shortened blocks) |
| Ch10 two city VGs | Consolidate into one temporal architecture |
| Ch10 contrast/restatement sections | Compress once sequence carries the teaching |
| Ch11 outcome-bias restatements | Compress after dashboard return lands |

---

## 16. Return and aftermath recommendations

See §5a. Strongly expected: Ch9, Ch10, Ch11. Optional: Ch6, Ch7. Avoid adding:
Intro, Ch1, Ch5, Ch8, Ch12, Epilogue.

All returns are removable in review if cute, symmetrical, self-conscious, or
non-transformative.

---

## 17. Conceptual protections

Do not blur: leader definition; intention vs structure; moral posture; reading
stance; renewal/erosion as directions; vitality/decay as felt states;
scalability/adaptability; correction vs circulation; guest-leadership pull quote;
circulation copies permission; temporary vs permanent emergency authority;
observer selection without blame; harm independence from intention; effectiveness
vs legitimacy; epilogue refusal of easy restoration.

---

## 18. Protected-language workflow

Authoritative register:
[`editorial-preservation-register.yml`](editorial-preservation-register.yml).

For every manuscript-editing task:

1. Before: `python3 tools/validate_editorial_preservation.py --book-dir books/when-others-look-to-you/v1`
2. Read substantive + manualReview entries for the unit.
3. Edit only scoped file(s).
4. After: re-run validator.
5. Account for substantive protections in the commit/PR notes.
6. Do not alter stable IDs, routes, filenames.
7. Keep footnotes with claims.
8. Semantic updates wait for VIGNETTE-010.

---

## 19. Factual and composite-scene labeling (provisional policy)

**Resolved provisional policy:**

- Do **not** require every unnamed vignette to begin with “In one composite
  organization…”
- Preserve existing labels where they already work.
- Add local disclosure only when increased specificity could reasonably make a
  fictional or generalized scene appear to describe a documented event.
- Do not add names, dates, organizations, quotations, or precise technical facts
  that imply reportage without sourcing.
- Reassess the need for a single front-matter disclosure during VIGNETTE-009.
- Make the final labeling decision only after revised scenes can be read together.

**Whole-book review item (VIGNETTE-009):** decide whether a front-matter composite
disclosure is needed; confirm no faux-reportage risk remains.

---

## 20. Word-count and pacing expectations

| Unit | Direction | Compress |
|---|---|---|
| Ch2 | stable / slight + | abstract paired-team opener |
| Ch6 | stable / − | Peak, Quarterly lead-ins; posture repetition |
| Ch7 | stable if run | only if return replaces explanation |
| Ch9 | stable / slight + | above-narration summary swapped for carrier |
| Ch10 | stable | dual-city mirror exposition |
| Ch11 | stable | outcome-bias restatement after return |

Overall: approximately stable total length.

---

## 21. Agent-ready tasks (reconciled catalog)

| ID | Status | Size | Summary |
|---|---|---|---|
| VIGNETTE-001 | **Active** — reduced kickoff | XS–S | Baseline confirmation only |
| VIGNETTE-002 | **Active** | M | Chapter 2 institutional opener |
| VIGNETTE-003 | **Active** | M | Chapter 6 consolidation hierarchy |
| VIGNETTE-004 | **Conditional** | S | Chapter 7 only if decision gate fires |
| VIGNETTE-005 | **Active** | M | Chapter 9 public-update carrier |
| VIGNETTE-006 | **Active — first major prose** | L–XL | Chapter 10 one-city temporal architecture |
| VIGNETTE-007 | **Active** | S–M | Chapter 11 dashboard return |
| VIGNETTE-008 | **Deferred** | — | Intro/Ch1; later review item only |
| VIGNETTE-009 | **Active** | M | Whole-book continuity + cumulative-patterning |
| VIGNETTE-010 | **Active** | S–M | Semantic + export sync |

No tasks renumbered. No task is both active and deferred.

### VIGNETTE-001 — Baseline confirmation (XS–S)

Most inventory/research work is already in this plan. Kickoff only:

1. Confirm implementation baseline (this planning branch vs latest `main`).
2. Record the exact starting commit SHA.
3. Confirm chapter source paths for active tasks.
4. Run `python3 tools/validate_editorial_preservation.py --book-dir books/when-others-look-to-you/v1`.
5. Capture canonical word counts with `tools/manuscript_structure` / established
   TOC-linked tooling (not ad-hoc `wc` alone).
6. Confirm this plan has not drifted from the manuscript; report **only meaningful
   drift**.
7. Make **no** manuscript changes.
8. Make **no** new broad editorial recommendations.

### VIGNETTE-002 — Chapter 2

- File: `parts/part-2-renewal-erosion-circulation/chapter-2-the-two-groups.md`
- Anchor: hospital triage protocol + dosage-order risk
- Keep school attendance case as mixed-state secondary
- Preserve four-state framework, capacity defs, pull quote, anti-typing
- Return: optional
- After Ch10 calibration only (parallel with 003 permitted)

### VIGNETTE-003 — Chapter 6

- File: `parts/part-3-harm-effectiveness-legitimacy/chapter-6-harm-under-influence.md`
- Follow final hierarchy in §11
- Preserve citations; preserve harm-range
- Return: optional
- After Ch10 calibration only (parallel with 002 permitted)

### VIGNETTE-004 — Chapter 7 (conditional)

- Run only if decision gate after 007 says yes (§11 conditions)
- Preserve library dinner / citation / dessert movement
- No clever symbolic ending

### VIGNETTE-005 — Chapter 9

- File: `parts/part-4-scale-pressure-misjudgment/chapter-9-scale-and-drift.md`
- Anchor: public updates + paperwork / fixed reporting cycles
- Return: strongly expected (removable if cute)
- Preserve scale ≠ erosion

### VIGNETTE-006 — Chapter 10 (first major prose; calibration)

- File: `parts/part-4-scale-pressure-misjudgment/chapter-10-tradeoffs-under-pressure.md`
- One-city temporal architecture; central signature / approval path / command protocol
- Follow required arc and material disposition in §11
- Return: strongly expected (removable if cute)
- Human calibration review required before 002/003 (§24b)

### VIGNETTE-007 — Chapter 11

- File: `parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md`
- Principal: newsroom dashboard; secondary: Smooth Board if still distinct
- Return: strongly expected (removable if cute)
- Compress redundant outcome-bias exposition
- Preserve observer selection pressure

### VIGNETTE-008 — Intro / Chapter 1 (deferred)

- Possible later review item only
- Not in active sequence

### VIGNETTE-009 — Whole-book continuity

- Continuity, transitions, ending payoffs
- Cumulative-patterning review (§24a)
- Composite-labeling reassessment (§19)
- Optional Ch6/Ch7 return decisions
- Authorized to remove returns, shorten scenes, restore exposition, change anchors,
  leave chapters less literary than neighbors, preserve useful asymmetry
- No wholesale rewriting; no new Ch12/epilogue vignettes

### VIGNETTE-010 — Semantic and generated-output synchronization

- Update summaries/aliases only where inaccurate
- Regenerate manifest/exports as required
- Verify native reader
- Re-run preservation validation
- After 009 only

---

## 22. Task dependencies and sequence

```text
VIGNETTE-001  Baseline confirmation
        ↓
VIGNETTE-006  Chapter 10 one-city temporal architecture
        ↓
Human review and style calibration  (§24b)
        ↓
VIGNETTE-002  Chapter 2
VIGNETTE-003  Chapter 6          ← limited parallel only after calibration
        ↓
VIGNETTE-005  Chapter 9
        ↓
VIGNETTE-007  Chapter 11
        ↓
Decision gate: whether Chapter 7 still needs work
        ↓
VIGNETTE-004  Chapter 7          ← only if gate fires
        ↓
VIGNETTE-009  Whole-book continuity (+ cumulative patterning)
        ↓
VIGNETTE-010  Semantic and generated-output synchronization
```

VIGNETTE-008 remains deferred off-path.

**Why Chapter 10 is the calibration chapter:** it involves the most substantial
architectural change, temporal widening, a justified initial decision, mixed moral
conditions, correction versus circulation, an object return, and the greatest
danger of over-writing. Later prompts should be adjusted from that review.

---

## 23. Parallelization and branch strategy

**Preferred:** Sequential focused commits on the same broader branch
(`cursor/wolty-vignette-architecture-plan-ca80` or its continuation), one chapter
task at a time, with human review after each major task.

**Limited parallelism:** After Chapter 10 calibration only, Chapters 2 and 6 may
run in parallel because they touch separate files and have distinct architectural
goals.

**Do not run concurrently:**

- Chapter 10 and whole-book continuity
- Chapter 11 and semantic synchronization
- Any chapter task and final preservation documentation updates
- Two agents editing shared front matter
- Two agents editing this plan

Use clear, chapter-specific commit messages. Each implementation task must report
its exact diff.

---

## 24. Review gates

Every chapter-level task needs: Preservation / Scene / Concept / Length / Voice
gates (as previously defined: protected language; conceptual work by details; live
decision; correction≠circulation; scale≠erosion; temporary authority not
inherently illegitimate; observer responsibility ≠ blame; length balanced;
restrained voice).

### 24a. Cumulative-patterning review (VIGNETTE-009)

Inspect whether the revised manuscript has become too patterned:

- Too many chapters opening with an object
- Too many objects returning in the final paragraphs
- Repeated “someone pauses before acting” beats
- Repeated dashboards, forms, lists, or written artifacts
- Repeated two-phase temporal structures
- Repeated withholding of explanation
- Repeated scene-to-framework transition language
- Repeated chapter conclusions that announce a transformed object
- Too many scenes with one perceptive dissenter and one resistant authority figure
- Too much atmospheric detail
- Objects chosen for symbolic neatness rather than institutional truth

Authorized responses: remove a return; shorten a scene; restore direct exposition;
change an anchor; leave a chapter less literary than its neighbors; preserve
useful asymmetry. The final book should feel coherent, not mechanically uniform.

### 24b. Chapter 10 calibration gate (required before Ch2 / Ch6)

Human review of the Chapter 10 draft must answer:

1. Does the scene feel like Kevin’s voice?
2. Does the physical artifact perform conceptual work?
3. Does the chapter stay in the scene long enough before explaining it?
4. Is the emergency centralization genuinely justified?
5. Is the later problem persistence rather than simplistic central control?
6. Are correction and circulation still distinct?
7. Does the passage show mixed motives and partial knowledge?
8. Does the return deepen the artifact rather than merely repeat it?
9. Has nearby explanation been removed or compressed?
10. Has the chapter remained roughly stable in length?
11. Does the scene avoid generic AI literary embellishment?
12. Does it preserve the protected-language register?

Later chapter prompts must be adjusted based on this review.

---

## 25. Risks

| Risk | Mitigation |
|---|---|
| Cumulative voice drift / over-patterning | Sequential sequence; Ch10 calibration; §24a |
| Ch10 loses teaching clarity | Temporal phases preserve contrast; calibration gate |
| Ch6 collapses to safety-only | Tournament full secondary; Escalation brief |
| Cute returns | Removable; strongly expected ≠ mandatory |
| Faux-reportage | Provisional labeling; 009 reassessment |
| Protected-language breakage | Validator before/after |
| Touching Ch5/Ch8/Ch12/epilogue casually | Do-not-touch list |
| Parallel over-generation | Limited parallelism only after calibration |

Largest remaining risk: **cumulative patterning and voice drift across sequential
rewrites**, not file conflict.

---

## 26. Human editorial decisions

### Resolved

| Decision | Resolution |
|---|---|
| Ch2 anchor | Hospital triage protocol + dosage-order risk (school secondary); no whiteboard |
| Ch6 hierarchy | Cold-chain primary; Tournament full secondary; Rivet/Escalation/Quarterly brief; Peak compressed; none removed to appendix |
| Ch7 | Conditional after larger changes; preserve library/citation/dessert |
| Ch9 carrier | Public updates + paperwork / fixed reporting cycles (mentoring content) |
| Ch10 architecture | One-city temporal; central signature / approval path / command protocol; first major prose |
| Ch11 | Newsroom dashboard principal; Smooth Board secondary; restrained return |
| Intro / Ch1 | Deferred; no active prose task |
| Ch12 / Epilogue | Continuity only; no new vignettes |
| Object returns | Strongly expected Ch9–11; optional Ch6–7; avoid Intro/Ch1/Ch5/Ch8/Ch12/epilogue |
| Composite labeling | Provisional light policy; final decision in 009 |
| Sequence | 001 → 006 → calibration → 002/003 → 005 → 007 → Ch7 gate → 009 → 010 |

### Deferred until first draft (especially after Ch10)

- Whether Chapter 10’s selected artifact works in prose
- Whether its return feels earned
- Whether the new style should be applied more or less aggressively elsewhere

### Deferred until whole-book continuity (VIGNETTE-009)

- Whether Chapter 7 needs any changes
- Whether a front-matter composite disclosure is needed
- Whether optional returns in Chapters 6 and 7 should remain
- Whether cumulative object architecture has become too regular
- Whether any newly memorable line belongs in the preservation register

### Still unresolved

| Question | Why unresolved | When to decide | Evidence needed |
|---|---|---|---|
| Exact prose texture of Ch10 Phase B (how far correction reopens before circulation stalls) | Cannot be settled without drafting | During/after VIGNETTE-006 draft | Calibration answers §24b #4–#8 |
| Whether Smooth Board remains a full secondary VG after Fast Desk return lands | Depends on whether dashboard return duplicates its work | During VIGNETTE-007 review | Side-by-side read of Fast Desk return vs Smooth Board |
| Final word-count deltas per chapter | Depends on compression success in drafts | After each chapter task | Canonical counts vs VIGNETTE-001 baseline |

Questions already answered by this update are **not** retained as open.

---

## 27. Recommended first implementation task

**VIGNETTE-001 — Baseline confirmation** (no prose).

Immediately after: **VIGNETTE-006 — Chapter 10**, the first major prose task and
calibration draft.

---

## 28. Recommended implementation sequence

1. VIGNETTE-001 baseline confirmation on this branch.
2. VIGNETTE-006 Chapter 10 one-city rewrite.
3. Human calibration review (§24b); adjust later prompts.
4. VIGNETTE-002 and VIGNETTE-003 (sequential preferred; limited parallel OK).
5. VIGNETTE-005 Chapter 9.
6. VIGNETTE-007 Chapter 11.
7. Decision gate for Chapter 7 → VIGNETTE-004 only if needed.
8. VIGNETTE-009 continuity + cumulative-patterning + labeling reassessment.
9. VIGNETTE-010 semantic/export/native-reader sync.
10. Final preservation validation + export success.

---

## 29. Definition of done

The eventual vignette pass is complete when:

1. Protected language remains intact.
2. Stable chapter IDs and routes remain intact.
3. Every major revised scene has a meaningful physical anchor.
4. Physical details perform conceptual work.
5. Selected examples contain realistic mixed conditions.
6. Correction and circulation remain precise.
7. Renewal and erosion remain dynamic directions.
8. Chapter 5 and Chapter 8 retain their strongest architecture.
9. Chapter 6 has a clearer primary anchor and less example overload while preserving harm range.
10. Chapter 10 communicates justified centralization and later legitimacy drift through one coherent architecture.
11. Chapter 11 makes observer selection pressure memorable.
12. Objects return only where the return deepens meaning (and removable returns were removed when unearned).
13. No chapter gains generic decorative detail.
14. Fictional composites are not mistaken for documented events.
15. Citations remain valid.
16. Total length remains controlled.
17. Explanatory repetition is reduced where scene meaning now carries it.
18. The whole book still feels conceptually unified—and not mechanically uniform.
19. Native-reader rendering remains correct.
20. Semantic summaries remain accurate.
21. DOCX, PDF, and EPUB exports succeed.
22. The revised scenes feel recognizably consistent with Kevin’s signature style.
23. Chapter 10 calibration gate was completed before Ch2/Ch6 prose.
24. Cumulative-patterning review was completed in VIGNETTE-009.

---

## 30. Ready to implement

| Item | Assessment |
|---|---|
| Plan ready? | **Yes** |
| VIGNETTE-001 | **Complete** — see [`vignette-001-baseline-confirmation.md`](vignette-001-baseline-confirmation.md) |
| VIGNETTE-006 | **Calibration passed** — Chapter 10 is the style model |
| VIGNETTE-002 | **Drafted** — Chapter 2 hospital triage / dosage-order opener |
| VIGNETTE-003 | **Drafted** — Chapter 6 hierarchy (3 full VGs; secondary examples compressed) |
| Calibration lesson | Let an ordinary institutional artifact remain unchanged while conditions around it change; the mismatch reveals the argument before the chapter names it |
| Next task | Human review of Ch2/Ch6, then **VIGNETTE-005** (Chapter 9) |
| Conditional | VIGNETTE-004 (Chapter 7) |
| Deferred | VIGNETTE-008 (Intro / Chapter 1) |
| Remaining risks | Voice drift; over-patterning; cute returns; Ch10 teaching clarity; Ch6 range loss if over-compressed |
| Planning blockers | **None** |

**Conclusion:** VIGNETTE-006 has passed calibration after polish. Chapters 2 and
6 may proceed, using Chapter 10 as the style model—especially the lesson that an
unchanged institutional artifact, under changed conditions, can reveal the
argument before the chapter names it.

---

## 31. Implementation prompt requirements

Every later chapter-task prompt must include:

- Exact source file
- Current chapter job
- Existing scene inventory
- Protected lines and substantive protections
- Approved physical anchor
- Approved architecture
- Concepts that must remain precise
- Material to retain
- Material to compress
- Material that may be removed
- Expected word-count direction
- Factual/composite status
- Return requirement or optionality (including permission to remove)
- Validation commands
- Required final report (including exact diff)
- Scope exclusions

Implementation agents must show a brief **pre-edit diagnosis** before changing
prose:

1. What the current vignette does
2. Why it is insufficient
3. Which existing material will carry the revision
4. Which exposition will be compressed
5. What must remain untouched

---

## Do-not-touch list (implementation agents)

- Canonical leader definition (intro + Ch1)
- Intention/structure; moral posture; closing reading stance
- Guest-leadership trusted/punished pull quote
- Correction-versus-circulation failure mode and definition pair
- “Circulation copies permission before it ever copies a title.”
- Chapter 5 kitchen and theater architectures
- Chapter 8 inherited-permissions architecture
- Chapter 11 observer-selection paragraphs
- Revised Chapter 12 synthesis and pull quote
- Epilogue refusal of easy restoration
- Pattern Blocks and chapter-end Pull Quote Blocks in the register
- Stable filenames, chapter IDs, native-reader routes
- Existing footnote bodies and bibliographic claims

---

## Directions rejected after manuscript inspection

| Idea | Why rejected |
|---|---|
| Ch2 product-launch whiteboard | Not native; fights hospital/school capacity materials |
| Ch9 invented dropdown / character-limited form field | Not in manuscript; public updates + reporting cycles already present |
| Ch6 reduced to physical safety only | Erases instrumental / blind / escalation dimensions |
| Intro/Ch1 scenic upgrade for conformity | Endangers canonical architecture |
| New Ch12 / epilogue vignettes | Contradicts recent tightening |
| Invented laminated map / approval box in Ch10 | Central signature / approval path / command protocol already stronger and present |
| Launching all chapter agents at once | Cumulative voice drift > file-conflict risk |

---

## Planning-pass summary metrics

| Metric | Value |
|---|---|
| Plan path | `books/when-others-look-to-you/v1/docs/vignette-architecture-plan.md` |
| Highest-priority / first prose | Chapter 10 (VIGNETTE-006) |
| Ch2 recommended anchor | Hospital triage protocol + dosage-order risk |
| Ch6 hierarchy | Cold-chain → Tournament → brief Rivet/Escalation/Quarterly → compress Peak |
| Ch9 anchor | Public updates + paperwork / reporting cycles |
| Ch10 artifact | Central signature / approval path / command protocol |
| Ch11 architecture | Newsroom dashboard + optional restrained return; Smooth Board secondary |
| Ch7 status | Conditional |
| Intro/Ch1 status | Deferred |
| Active tasks | 001, 002, 003, 005, 006, 007, 009, 010 |
| Conditional | 004 |
| Deferred | 008 |
| Parallel permitted | 002 ∥ 003 only after Ch10 calibration |
| Ready to implement | Yes, after VIGNETTE-001 |
