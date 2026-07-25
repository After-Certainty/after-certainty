# Vignette Architecture Plan — When Others Look to You v1

Planning document only. This pass does **not** revise manuscript prose, change
semantic metadata, modify schemas, regenerate exports, or implement any proposed
vignette changes. Implementation belongs to later agent-ready tasks listed below.

Authoritative location: `books/when-others-look-to-you/v1/docs/vignette-architecture-plan.md`.
No duplicate under `docs/roadmaps/` (those roadmaps cover product/migration work).

---

## 1. Purpose

The book’s conceptual framework is now strong after the preservation-first
editorial revision. The remaining opportunity is vignette architecture: make
selected scenes more inhabitable, structurally meaningful, and memorable in the
signature movement used in Kevin Steffensen’s strongest recent books—

ordinary object or action
→ lived uncertainty
→ widening structural tension
→ conceptual recognition
→ return to the object with changed meaning

Goals for selected scenes:

- More inhabitable and less obviously constructed to prove a category
- Better integrated into chapter architecture
- Able to carry meaning before the explanatory framework arrives
- Able to return near the end with changed significance
- Memorable as objects (phone, log, citation, form, dashboard, chair, doorway)
  rather than only as leadership terms

Non-goals:

- Making every vignette longer, ornate, or cinematic
- Turning the book into a novel
- Rewriting already strong scenes for consistency
- Adding a symbolic object to every chapter

Expected method for most revisions:

strengthen or consolidate the scene
+ remove nearby explanatory repetition
= roughly stable chapter length

---

## 2. Editorial baseline

| Item | Value |
|---|---|
| Baseline branch | Latest `main` |
| Editorial revision | Merged via PR #364 (`4db44908`), formerly `cursor/wolty-editorial-revision-40ba` |
| Book root | `books/when-others-look-to-you/v1/` |
| Preservation register | [`editorial-preservation-register.yml`](editorial-preservation-register.yml) |
| Baseline metrics | [`editorial-baseline.md`](editorial-baseline.md) |
| Verification report | [`editorial-preservation-verification.md`](editorial-preservation-verification.md) |
| Validation command | `python3 tools/validate_editorial_preservation.py --book-dir books/when-others-look-to-you/v1` |
| Pre-plan validation | OK — 41 verbatim protections present |

Approximate current word counts (plain `wc -w` on unit files; use
`tools/manuscript_structure.count_words` for TOC-linked baselines during
implementation):

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
Broader scene/example inventory (including non-block examples): **45**.

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
- Revised Chapter 2 framing (directions, mixed states, anti-typing)
- Tighter Chapter 12
- Stable chapter identities and native-reader routes
- All existing citations and footnotes

Do not reopen settled terminology or “improve” protected scenes by rewriting them
into another book’s house style. Treat
[`editorial-preservation-register.yml`](editorial-preservation-register.yml) as
authoritative; do not duplicate it here.

---

## 4. Signature-style findings from other books

Representative chapters inspected (actual manuscript prose, not summaries):

| Book | Files inspected | Signature objects |
|---|---|---|
| `the-world-we-make-together` | photograph, bowl, clipboard, window chapters | crop, bowl, clipboard |
| `why-collaboration-is-so-hard` | spreadsheet, ritual-before-lift, dashboard, nodding room | spreadsheet, crane ritual |
| `learning-to-see` | attention practices; memory/ritual | breath return; eucharist vessels |
| `the-game-we-think-we-saw` | scoreboard; whistle | box score; replay/whistle |
| `living-in-sediment` | thirty-year house; subscription lives | mortgage papers; book shelf |
| `before-certainty-arrives` | life under constraint | plastered skull / settlement |
| `the-economy-we-dont-experience` | kitchen table; averages | grocery receipts |
| `boundary-conditions` | message; boundaries at work | incident message / bridge |
| `after-certainty` | end of correctness; not knowing | tree / photograph |

Craft principles extracted (do **not** copy scenes, metaphors, or sentences):

1. **Utility before symbolism.** The object already does work (crop, pass, sign,
   hold, delay) before it becomes conceptual.
2. **Stay in scene before naming.** Strong openings typically remain concrete for
   roughly 4–12 short paragraphs before the governing concept is named.
3. **Operational detail only.** Details perform constraint, cost, permission,
   timing, access, or memory—not atmosphere.
4. **Widen through one institution.** Small scene → one system → named pattern.
5. **Return with changed meaning.** The object comes back carrying a new question,
   not a slogan restatement.
6. **Ambiguity held.** True-but-incomplete, useful-but-dangerous, caring-but-costly.
7. **No business-school case tone.** No tidy lesson packaging; friction remains.
8. **One decision-pressure per vignette.** Roles over character arcs.

---

## 5. Vignette design principles

A major vignette should generally contain:

### Physical anchor

An object, repeated action, or visible artifact that can carry meaning:

phone, ticket rail, whiteboard, log, dashboard, form, map, list, citation,
door, empty chair, status light, name written or omitted.

The anchor must do conceptual work, not decoration.

### Live decision

Someone in the scene can still act differently. Avoid settled after-action reports
whose meaning is already known.

### Partial knowledge

Participants see only part of the structure. Avoid one character who understands
the framework perfectly and another who merely demonstrates the mistake.

### Social consequence

Reveal who becomes credited, ignored, exposed, protected, delayed, invited,
excluded, trusted, remembered, or punished.

### Aftermath

The room, team, institution, or observer learns something from what happens next—
especially for guest leadership, correction, circulation, punishment, authority,
legitimacy, and observer selection pressure.

### Return

Where appropriate, the object or action returns near the chapter ending with
changed meaning. The return must not merely repeat the opening description.

---

## 6. Anti-patterns to avoid

Implementation agents must explicitly guard against:

- Adding generic sensory detail (coffee, fluorescent lights, steam-for-atmosphere,
  nervous glances)
- Filling every room with decorative atmosphere
- Making fictional composites sound like documented history
- Making every vignette the same length
- Beginning every chapter with a story
- Giving every chapter a symbolic object
- Creating perfect good-group / bad-group symmetry
- Adding new scenes merely to illustrate every concept
- Making the manuscript longer by layering scenes over unchanged explanation
- Replacing conceptual precision with literary ambiguity
- Turning the book into a novel
- Introducing melodrama
- Adding names where roles work better
- Adding dialogue that sounds scripted
- Reopening settled terminology
- Altering protected language
- Weakening citations
- Breaking native-reader structure
- Copying the style of another author or book
- Rewriting already strong scenes merely for consistency

---

## 7. Current vignette inventory

Inventory covers formal `Vignette Block` scenes and non-block narrative examples
that carry argumentative weight. Appendices and glossary are noted separately.

### Front matter and formation

| ID | File | Unit | Loc | Setting / roles | Physical anchor | Live decision | Concept | Returns? | Paired? | Type | Citations | Protected nearby | Function |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FM-01 | `front-matter/preface.md` | Preface | — | — | — | — | frame | no | no | n/a | no | intention≠structure echo | orientation |
| FM-02 | `introduction-attention-finds-a-focus.md` | Intro | early | generic room; first speaker | pause / cue-taking | who speaks first | attention→influence | yes (book-wide) | no | generalized | no | leader definition; intention/structure; moral posture | opens formation |
| FM-03 | same | Intro | mid | reader | pattern-groups diagram | no | forming/adjusting/eroding/circulating | yes (App B) | no | diagram | no | four-shapes preview | orientation |
| B1-01 | `part-1.../bridge.md` | Bridge I | whole | generic | glance→habit | implicit | attention becoming pattern | yes | no | generalized | no | Attention Finds a Focus | bridge |
| C1-01 | `chapter-1-...md` | Ch1 | opening | street; child/parent | glance / crossing | whether to cross | attention under uncertainty | indirect | cluster | generalized | nearby | definition; Pattern Blocks | low-stakes entry |
| C1-02 | same | Ch1 | opening | meeting | pause | next direction | informal influence | yes | cluster | generalized | nearby | Attention Finds a Focus | workplace version |
| C1-03 | same | Ch1 | opening | congregation | listening for tone | how to interpret difficulty | authority without title | later (Ch9/App A) | cluster | generalized | nearby | definition | non-workplace scope |
| C1-04 | same | Ch1 | opening | company under stress | faltering performance | what direction | attention under stress | later (effectiveness) | cluster | generalized | nearby | definition | organizational scale |
| C1-05 | same | Ch1 | mid | group; silence | unaddressed harm / mistake | whether to intervene | silence as instruction | later (harm/erosion) | mini-pair | generalized | yes | Examples Accumulate | passive leadership |
| C1-06 | same | Ch1 | late | hiring/promo/story | ordinary choices | each choice teaches | nothing is neutral | Ch12/epilogue | no | generalized cluster | yes | pull quote | closes toward core question |

### Part II — renewal, erosion, circulation

| ID | File | Unit | Loc | Setting / roles | Physical anchor | Live decision | Concept | Returns? | Paired? | Type | Citations | Protected nearby | Function |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C2-01 | `chapter-2-the-two-groups.md` | Ch2 | opening | two teams; lead; person closest | hard review; new risk; adjusted plan | reopen vs wave off | renewal vs erosion fork | yes | yes | generalized pair | soon after | direction framing | opens fork; currently weak anchor |
| C2-02 | same | Ch2 | mid | hospital networks; nurses | triage protocol; dosage-order risk | update practice now or delay | scalability vs adaptability | Ch8/App A | yes | institutional composite | chapter cites | capacity defs | concrete capacities |
| C2-03 | same | Ch2 | mid/late | school districts; principals | attendance protocol; thresholds | adjust or protect numbers | mixed renewal/erosion | scale chapters | yes | institutional composite | no direct | grid / pull quote | mixed states |
| C2-04 | same | Ch2 | close | reader | renewal-erosion map | no | four-state grid | Ch9/10 | no | diagram | no | pull quote | consolidate capacities |
| C3-01 | `chapter-3-renewal.md` | Ch3 | opening VG | analyst; lead; review | dashboard rollup; slide | hold slide / examine drop | early warning as work | dashboards recur | no | composite | nearby | vitality setup | vitality open |
| C3-02 | same | Ch3 | VG | lead; engineer; exec thread | green milestone; risk register; reply-all | smooth privately or correct publicly | dissent reaches center | motif | no | composite | nearby | Dissent is Welcomed | public correction |
| C3-03 | same | Ch3 | VG | nonprofit; committee | budget line; grant rule | reallocate / shrink campaign | feedback changes plan | no major | no | composite | no | Feedback Drives Change | grounded renewal |
| C3-04 | same | Ch3 | VG | family business | ledger; returns; contract | revert contract / own cost | authority tied to consequence | Ch6/epilogue | no | composite | no | Leaders Feel Consequences | accountability |
| C3-05 | same | Ch3 | late | generic | failed launch / clients / safety | learn publicly or close | failure can strengthen vitality | effectiveness | no | brief cluster | yes | pull quote | anti outcome-only |
| C4-01 | `chapter-4-erosion.md` | Ch4 | opening VG | construction; foreman | tailgate; pour sheet; rebar truck | flag mismatch or stay silent | truth costs before speech | suppression thread | vs Ch3 open | composite | nearby | erosion defs | decay signal |
| C4-02 | same | Ch4 | VG | association; director | annual letter; blank pads | ask or suppress | disagreement→disloyalty | Ch11 | no | composite | no | Disagreement is Suppressed | social cost |
| C4-03 | same | Ch4 | VG | community college | approval portal; queue; shadow spreadsheet | treat routing flaw as decisive | learning collapses | workarounds | no | institutional | no | Learning Collapses | channel failure |
| C4-04 | same | Ch4 | VG | mutual aid; flood | quorum; card purchase; trucks | authorize exception; later return? | exceptions harden | Ch8/10/12 | no | composite | no | Exceptions are Forever | first strong exception object |
| C5-01 | `chapter-5-circulation.md` | Ch5 | VG | restaurant; sous; expediter | phone; allergy; ticket fire | make substitution call | guest leadership trusted | yes | vs C5-02 | composite | yes | circulation def; kitchen hinge | primary positive |
| C5-02 | same | Ch5 | VG | same trade | phone; steam; ticket rail; hold | answer now or wait | permission closed | yes | vs C5-01 | composite | yes | only one name… | primary negative |
| C5-03 | same | Ch5 | VG | theater tech week | cues; newsletter; rehearsal report | credit / erase temporary lead | correction open / circulation narrow | Reading Circulation | internal pair | composite | yes | guest-leadership PQ | aftermath proof |
| C5-04 | same | Ch5 | close | kitchen/theater objects | phone; rail; huddle; report | embedded | permission copied | Ch12 | embedded | ordinary objects | yes | Circulation copies permission… | signature close |

### Part III — harm, effectiveness, legitimacy

| ID | File | Unit | Loc | Setting / roles | Physical anchor | Live decision | Concept | Returns? | Paired? | Type | Citations | Protected nearby | Function |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C6-01 | `chapter-6-...md` | Ch6 | VG open | cold-chain; supervisor; director | temperature log; outbound door; trucks | stop load or ship | cost near authority | harm route | vs C6-02 | composite | nearby | harm routes | primary positive |
| C6-02 | same | Ch6 | VG open | second site | same gap; gel packs; rider | approve ship | harm displaced | yes | vs C6-01 | composite | nearby | who pays | primary negative |
| C6-03 | same | Ch6 | VG | fabrication; inspector | rivet batch; vibration variance | stop run / absorb cost | harm-absorbing | accountability | posture set | composite | nearby | posture def | posture |
| C6-04 | same | Ch6 | VG | parcel hub | picks-per-hour board; injuries | move target or normalize | harm-tolerant | no major | posture set | composite | no | posture def | posture |
| C6-05 | same | Ch6 | VG | youth soccer | unanchored goal; bracket | fix goal or run tournament | harm-instrumental | no major | posture set | composite | yes | posture def | clearest tradeoff |
| C6-06 | same | Ch6 | VG | software co | dashboard; churn; apology calls | keep reading green rollup | harm-blind | dashboards Ch7/11 | posture set | composite | no | posture def | invisible channel |
| C6-07 | same | Ch6 | VG | hospital unit | scheduling rule; handoff gaps | change rule or force off-book | escalation stops | Ch8 echo | selective followership | institutional | yes | pull quote later | bridge to correction |
| C7-01 | `chapter-7-...md` | Ch7 | opening | two teams | quarter target; dashboard | reopen vs quiet objections | effectiveness vs capacity | Ch11 | yes | generalized pair | yes | effectiveness setup | brief contrast |
| C7-02 | same | Ch7 | VG | public library; dinner | state citation; newspaper photo; dessert | press warning or pivot | success narrows signal | misjudgment | internal | composite | nearby | effectiveness hinge | **primary chapter anchor** |
| C7-03 | same | Ch7 | VG | claims center | auto-denial rule; pending counts | pause rule / accept worse metrics | deferred effectiveness | Ch11 | before/after | institutional | yes | correction defs | positive effectiveness |
| C8-01 | `chapter-8-...md` | Ch8 | VG open | hospital network handoff | emergency authority package; review date open | resume local rotation or keep central | legitimacy transfer | whole chapter + App A | no (one case) | institutional | yes | legitimacy defs | object continuity model |
| C8-02–05 | same | Ch8 | mid–late | same network | exception list; 90-day review; office sign-off; sunset question | reopen / sunset / sacralize | four legitimacy forms | App A | variants | case extensions | yes | form defs; pull quote | temporal widening |

### Part IV–V — scale, pressure, misjudgment, close

| ID | File | Unit | Loc | Setting / roles | Physical anchor | Live decision | Concept | Returns? | Paired? | Type | Citations | Protected nearby | Function |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C9-01 | `chapter-9-...md` | Ch9 | VG open | congregation→regional network | branding; training; reporting cycles; mentoring burnout | adapt program or keep expansion story | reach > correction/circulation | App A | local vs regional | institutional | later | scale-not-villain | scale open; weak physical live object |
| C9-02 | same | Ch9 | early | small vs stretched | reports; dashboards; layers | no direct | scale thins harm/correction | epilogue | yes | generalized | yes | scalability/adaptability | conceptual contrast |
| C9-03 | same | Ch9 | mid | local actors | paperwork; workarounds | surface or hide | selective followership at scale | Ch11 | yes | generalized | yes | correction≠circulation | diagnostic |
| C10-01 | `chapter-10-...md` | Ch10 | VG | city A; storm; command | emergency order; underpasses; central signature | reopen local authority? | temporary→legitimacy problem | Ch12/epilogue | vs C10-02 | composite | yes | temporary vs permanent | negative pressure |
| C10-02 | same | Ch10 | VG | city B; same storm | sunset; challenge calls; corridors | restore district override | emergency releases | recovery | vs C10-01 | composite | yes | pressure PQ | positive pressure |
| C10-03 | same | Ch10 | late | governance | exception→default map | sunset or normalize | Exceptions are Forever | Ch12 | closed/reopened | process artifact | yes | pull quote | synthesis |
| C11-01 | `chapter-11-...md` | Ch11 | early | generic observers | targets / certainty | observer judgment | outcome bias seed | whole chapter | contrasts | brief | later | selection pressure | leave brief |
| C11-02 | same | Ch11 | VG | newsroom desks | election night; dashboard speed/share/volume | publish fast or hold | outcome bias; prevented harm invisible | **needs return** | Desk A/B | composite | yes | outcome bias | primary outcome-bias |
| C11-03 | same | Ch11 | VG | air traffic flow | reroute corridor; hazard notes; near-miss logs | change plan or rerun | structural blindness | scale/pressure | vs Fast Desk | composite | yes | structural blindness | primary structural |
| C11-04 | same | Ch11 | mid | followers | public agreement / private divergence | visible dissent vs workaround | selective followership misread | no new scene | yes | generalized | yes | — | expand signals |
| C11-05 | same | Ch11 | late | scaled observers | screens; delayed write-ups | no direct | fragments at scale | Ch12 | room vs fragments | generalized | yes | closing PQ | scale synthesis |
| C12-01 | `part-5.../chapter-12-...md` | Ch12 | open | return cluster | dashboard; warning; emergency path | whether warning changes plan | ordinary moments→structure | is a return | emergency stays/closes | generalized returns | no | integrated view | synthesis; do not add VG |
| C12-02 | same | Ch12 | mid | post-crisis group | temporary→default permissions | reconnect harm / reopen channels | repair sequence | epilogue | echoes Ch10 | process | no | Ch12 PQ | practical close |
| EP-01 | `epilogue.md` | Epilogue | mid | reader / local group | consequences; day-to-day practice | name harm; keep correction open | partial repair | close | no | reflective | no | reversal refusal; definition return | ethical close |
| EP-02 | same | Epilogue | close | companion book | historical cases pointer | no | series nav | external | no | bibliographic | no | — | series |

### Appendices / glossary

| ID | Unit | Role | Classification |
|---|---|---|---|
| A-01–03 | Appendix A | institutional sequences (government, healthcare, religious networks)—not scenic vignettes | protect / leave as appendix |
| B-01 | Appendix B | pattern catalog; small illustrative lines only | protect |
| G-01 | Glossary | definitions; circulation≠correction lock | protect |

---

## 8. Classification of every vignette

Classification key: **protect** | **light-polish** | **strengthen-anchor** |
**add-aftermath** | **add-return** | **complicate** | **consolidate** |
**replace** | **compress** | **move-to-appendix** | **remove** |
**leave-as-brief-example**.

| ID | Classification | Explanation |
|---|---|---|
| FM-01 | protect | No scene work; framing only |
| FM-02 | protect | Canonical opening; do not scenic-upgrade |
| FM-03 | protect | Diagram orientation |
| B1-01 | leave-as-brief-example | Bridge image only |
| C1-01–C1-04 | leave-as-brief-example / protect | Definition cluster; sufficient as brief examples |
| C1-05 | leave-as-brief-example | Mini example of silence-as-instruction |
| C1-06 | protect | Ordinary-choices close; supports pull quote |
| C2-01 | strengthen-anchor / replace opener | Generalized paired teams prove the grid; needs inhabitable carrier from institutional set already in chapter |
| C2-02 | light-polish / complicate | Strong capacity case; may further mix domains (already flagged in manualReview) |
| C2-03 | protect | Already shows mixed renewal/erosion on one map |
| C2-04 | protect | Diagram |
| C3-01–C3-04 | protect | Strong formal vignettes; live decisions and anchors present |
| C3-05 | leave-as-brief-example | Boundary cluster, not a major scene |
| C4-01–C4-04 | protect | Strong erosion architecture; Vote After the Flood already models exception object |
| C5-01–C5-04 | protect (+ optional light-polish) | Internal model; only compress aftermath echoes if needed |
| C6-01–C6-02 | protect | Primary harm pair; keep |
| C6-03 | protect / light-polish | Retain for harm-absorbing range |
| C6-04 | compress | Strong but overlaps “normalized cost” with cold-chain negative; candidate brief application |
| C6-05 | protect | Clearest instrumental tradeoff; keep for non-safety harm |
| C6-06 | compress / add-return | Harm-blind useful; can become brief application with optional log/dashboard return elsewhere |
| C6-07 | protect | Escalation/correction bridge; keep |
| C7-01 | leave-as-brief-example | Opening pair; do not expand |
| C7-02 | protect / add-return | Primary anchor; optional restrained dessert/citation return |
| C7-03 | protect | Deferred effectiveness; keep as secondary |
| C8-01–C8-05 | protect | Internal model of object continuity; no rewrite |
| C9-01 | strengthen-anchor | Narrated from above; deepen reporting-cycle artifact already implied |
| C9-02–C9-03 | leave-as-brief-example / light-polish | Conceptual contrasts; keep brief |
| C10-01–C10-02 | consolidate + complicate | Highest-value rewrite: merge into one-city temporal architecture |
| C10-03 | protect | Boundary sequence stays; may attach to single-city return |
| C11-01 | leave-as-brief-example | Surface-read cluster |
| C11-02 | add-return | Fast Desk strong; needs late dashboard return |
| C11-03 | protect | Smooth Board already strong |
| C11-04–C11-05 | leave-as-brief-example / light-polish | Keep brief |
| C12-01–C12-02 | protect | Existing returns sufficient; do not add vignettes |
| EP-01–EP-02 | protect | Refusal of easy restoration; do not add scenes |
| A/B/G | protect | Reference matter |

### Classification rollup

| Class | Approx. count |
|---|---:|
| protect | 24 |
| light-polish | 5 |
| strengthen-anchor | 2 (C2-01, C9-01) |
| add-return | 2 (C7-02 optional, C11-02) |
| consolidate / complicate | 3 (C6 compress set, C10 pair) |
| leave-as-brief-example | 9 |
| replace (opener only) | 1 (C2-01 treatment) |
| move-to-appendix / remove | 0 |

Major revision targets (chapter-level): **Ch2, Ch6, Ch9, Ch10, Ch11** (and optional Ch7 polish).

---

## 9. Strong internal models

### Chapter 5 — Circulation (protect)

Strengths to preserve:

- Expediter’s phone as live decision object
- Steam / ticket rail as operational pressure (not decoration)
- Sous chef’s hesitation as partial knowledge + social memory
- Whether a name is spoken at the later huddle
- Credit and aftermath in the theater pair
- Guest leadership trusted vs punished
- Correction versus circulation made memorable through scenes, not only definitions

Preserve exactly (verbatim register):

> When guest leadership is trusted, more people use it openly.
>
> When guest leadership is punished, people retreat.

> The failure mode is not "they didn't hear you." It is "only one name is permitted to steer."

> Circulation copies permission before it ever copies a title.

Also preserve substantive kitchen hinge and permission-aftermath meanings from the
register (`ch5-kitchen-opening`, `ch5-permission-aftermath`, etc.).

Plan recommendation: **light polish only** if aftermath echoes still stack after
the editorial revision. No wholesale rewrite.

### Chapter 8 — Legitimacy Over Time (protect)

Model for:

- Object continuity (inherited emergency-permissions package)
- Temporal widening inside **one** institutional setting
- Institutional inheritance without interchangeable case studies
- Changed meaning without a forced symbolic ending

Stay with the hospital network across example-based, procedural, office-based,
and sacralized legitimacy. Do not introduce new vignette settings here.

---

## 10. Chapters requiring no change

| Unit | Why untouched |
|---|---|
| Preface | Frame only; no vignette architecture problem |
| Introduction | Canonical definitions and moral posture; scenic upgrade endangers protected language |
| Bridges I–V | Short handoffs; do not add scenes |
| Chapter 1 | Definition staging works; brief examples sufficient |
| Chapters 3–4 | Formal vignettes already meet the standard; protect |
| Chapter 5 | Internal model; protect |
| Chapter 8 | Internal model; protect |
| Chapter 12 | Recently tightened; return cluster already synthesizes |
| Epilogue | Refusal of easy restoration; do not restore repetition via new scenes |
| Appendices / Glossary / Bibliography | Reference; not vignette targets |
| Typographical conventions | Example block only |

Continuity pass (VIGNETTE-009) may still scan these units for accidental
repetition or transition friction without rewriting their scene architecture.

---

## 11. Priority chapter diagnoses

### Chapter 2 — Two Directions

**Current weakness:** Opening relies on generalized paired teams. Actors and
decisions remain conceptual placeholders. Contrast risks feeling constructed to
demonstrate the grid—even though later hospital/school cases are stronger.

**Manuscript-native anchors already present:** triage protocol, dosage-order risk,
satellite clinics, attendance intervention protocol, weekly absence data,
thresholds.

**Whiteboard / launch-date direction:** Evaluated and **rejected as default**.
It is not in the manuscript and would import a product/corporate setting that
fights the chapter’s institutional capacity examples.

**Recommended architecture:**

1. Open inside one institutional setting already used later (prefer hospital
   triage protocol sheet / dosage-order risk).
2. Let the live decision be whether the unchanged protocol / date / threshold
   gets revised when the new risk appears.
3. Keep the capacity model and diagram.
4. Return briefly to what remains written or unchanged on the protocol / wall /
   threshold sheet near the close—only if the return deepens mixed-state reading.
5. Preserve anti-typing / mixed-state language from the editorial revision.

Size: **M**.

### Chapter 6 — Harm Under Influence

**Current concern:** Seven formal vignettes create taxonomic pacing. Attention
distributes across postures rather than deepening one primary architecture.

**Recommended architecture:**

1. Keep cold-chain temperature log + outbound door pair as primary anchor.
2. Retain Rivet Batch (absorbing), Tournament Weekend (instrumental; non-safety),
   and When Escalation Stops (correction failure) for harm-range coverage.
3. Compress Peak Numbers Hold and/or The Quarterly Looks Healthy into brief
   applications after the primary pair.
4. Optional restrained return to the blank/completed log or “who authorized the
   stop” note near the end—only if it replaces explanatory repetition.
5. Preserve range across displacement channels and postures; do **not** reduce
   harm to physical safety alone.

Size: **M**. Expected length: stable to slightly shorter.

### Chapter 7 — Effectiveness and Its Illusions

**Current strength:** Library dinner / state citation / newspaper photograph /
director pivots to dessert and the room follows.

**Recommendation:** Treat library scene as primary (it already is). Fast Rule
Pauses remains the deferred-effectiveness secondary. Opening paired teams stay
brief.

**Return:** Consider a restrained late echo of the citation photo or the dessert
pivot—only if it shows what public success still cannot hold. Do not force a cute
symbolic ending. Protect the existing dessert-follow movement unless revision
reveals a clearer treatment.

Size: **S**.

### Chapter 9 — Scale and Drift

**Current concern:** Regional-network vignette is mostly narrated from above.
Scale is described rather than physically experienced. Live decision is weak.

**Exception-form direction:** Evaluated and **rejected as invention**. Prefer
artifacts already implied: paperwork packet, mentoring roster, fixed reporting
cycle, green public update that compresses local burnout into growth language.

**Recommended architecture:**

1. Make compression visible: local problem enters a character-limited report /
   status field / public update and comes out green.
2. Show a volunteer or local leader leaving or going quiet before the report
   changes.
3. Connect carrier to compression, lost local knowledge, coordination,
   scalability, adaptability, and distance from consequence.
4. Preserve “Scale does not cause erosion by itself…”

Size: **M**.

### Chapter 10 — Tradeoffs Under Pressure

**Highest-value major rewrite.**

**Current concern:** Paired cities are clear but schematic. Good/bad symmetry can
obscure justified centralization’s real ambiguity.

**Recommended architecture (default):**

1. One city, one storm, one command map / temporary approval path.
2. First forty-eight hours: centralization justified (flooded underpasses,
   diverted ambulances, sandbags).
3. Early correction signals arrive; some are logged, some delayed.
4. Months later: dry underpass; central signature still required.
5. Show correction reopening before circulation fully returns.
6. Legitimacy thins through persistence, not merely concentration.

Preserve:

- Temporary centralization may be justified
- Information flow ≠ decision rights
- Correction / circulation precision
- Emergency authority becomes problematic through persistence

Size: **L–XL**. Expected length: stable (merge two vignettes + compress mirror
explanation).

### Chapter 11 — Why We Misjudge Leaders

**Current strength:** Newsroom dashboard; Desk A/B; Smooth Board structural
blindness; observer selection pressure paragraphs.

**Recommendation:** Keep both major vignettes. Add a late return to the
projected dashboard:

- Illustrative direction only (not approved manuscript prose): the chart did not
  lie, but contained no place for prevented errors or later corrections.

Do not overexplain outcome bias after the return. Protect selection-pressure
hinge language from the register.

Size: **S–M**.

### Chapter 12 and Epilogue

Do **not** automatically add vignettes. Existing returns (dashboard, frontline
warning, emergency approval path, emergency-permissions sequence, definition
return, refusal of easy restoration) are sufficient. Avoid restoring repetition
through scene additions.

### Introduction and Chapter 1

Canonical language risk outweighs scenic gain. Existing glance/pause cluster is
enough. **No dedicated prose task** unless Kevin overrides.

Preserve exactly:

> A leader is someone others look to when deciding what to do next.

> Leadership cannot be reduced to intention. Intention matters, but structure matters more.

> The aim is not to condemn people. It is to clarify dynamics.

> Whether leadership exists is rarely the puzzle. The question is what it is becoming while others watch—and what you can still see in the meantime.

---

## 12. Chapter-by-chapter revision map

| Unit | Current vignette role | Classification | Proposed action | Anchor | Return | Concept protected | Risk | Size |
|---|---|---|---|---|---|---|---|---|
| Preface | none | protect | no change | — | — | intention≠structure framing | low | — |
| Introduction | brief formation | protect | no change | pause / cue | book-wide | leader definition; intention/structure; moral posture; closing stance | high if touched | — |
| Bridge I | micro image | leave-as-brief | no change | glance | Ch1 | Attention Finds a Focus | low | — |
| Ch1 | brief example cluster | protect | no change | glance / pause | structural | definition; Pattern Blocks; pull quote | high if scenic rewrite | — |
| Bridge II | defs | protect | no change | — | — | renewal/erosion/circulation defs | high if wording drifts | — |
| Ch2 | generalized pair + institutional cases | strengthen-anchor | replace opener with institutional carrier; keep grid | protocol / risk note | optional protocol return | directions; capacities; anti-typing | medium: inventing whiteboard | M |
| Ch3 | 4 strong VGs | protect | continuity scan only | dashboard; register; budget; ledger | existing | Pattern Blocks; pull quote | low | XS |
| Ch4 | 4 strong VGs | protect | continuity scan only | rebar; pads; portal; flood vote | existing | Pattern Blocks; Exceptions are Forever | low | XS |
| Ch5 | kitchen + theater model | protect | optional aftermath compression only | phone; ticket rail; report | already returns | guest leadership; correction≠circulation; permission copy | very high if rewritten | XS |
| Bridge III | lenses handoff | protect | no change | — | — | lens independence | low | — |
| Ch6 | 7 VGs; taxonomic | consolidate | primary cold-chain; keep 3 range scenes; compress 1–2 | temperature log; door | optional log | harm routes; postures; who pays | medium: over-cutting range | M |
| Ch7 | library + claims | light-polish / add-return | strengthen library primacy; optional dessert return | citation; dessert | optional | future capacity; deferred effectiveness | medium: cute return | S |
| Ch8 | one-network inheritance | protect | no change | emergency permissions list | temporal variants | legitimacy forms; pull quote | high if multi-cased | — |
| Bridge IV | handoff | protect | no change | — | — | scale/judgment preview | low | — |
| Ch9 | above-narrated network | strengthen-anchor | deepen reporting-cycle carrier | report packet / green update | optional report return | scale≠erosion; correction/circulation split | medium: inventing exception form | M |
| Ch10 | paired cities | consolidate + complicate | single-city temporal rewrite | command map; signature; underpass | months-later path | temporary vs permanent; correction before circulation | high: losing teaching clarity | L–XL |
| Ch11 | Fast Desk + Smooth Board | add-return | late dashboard return; keep both VGs | dashboard | yes | selection pressure; outcome bias; structural blindness | medium: overexplaining | S–M |
| Bridge V | short | protect | no change | — | — | closing handoff | low | — |
| Ch12 | return cluster | protect | no new vignettes | dashboard; emergency path | already | capacity can move; correction alone insufficient | high if scenes added | — |
| Epilogue | reflective close | protect | no new vignettes | practice / consequences | close | reversal not always possible | high if softened | — |
| App A/B | reference | protect | no scene moves into/out of main text | — | — | legitimacy sequences; patterns | low | — |
| Glossary | defs | protect | sync only if terms drift in 010 | — | — | circulation≠correction | medium if edited casually | — |

---

## 13. Physical-anchor recommendations

| Chapter | Recommended primary anchor | Why | Rejected alternative |
|---|---|---|---|
| Ch2 | triage protocol sheet / dosage-order risk note (or attendance threshold sheet) | Already native to chapter; carries adaptability decision | Product whiteboard / launch date |
| Ch5 | phone + ticket rail (existing) | Model; do not replace | — |
| Ch6 | temperature log + outbound door | Cost and stop decision visible | Collapsing to one safety-only domain |
| Ch7 | state citation + dessert pivot (existing) | Success and silenced warning in one room | New secondary dinner scene |
| Ch8 | emergency-permissions list (existing) | Temporal legitimacy carrier | Multiple new institutions |
| Ch9 | reporting packet / mentoring roster / green public update | Makes compression physical | Invented exception form / dropdown not in MS |
| Ch10 | command map / temporary approval box / central signature / dry underpass | Persistence after justification | Permanent paired-city symmetry |
| Ch11 | projected dashboard | Observer selection visible | Replacing Smooth Board |

Anchor variety check (VIGNETTE-009): avoid stacking too many dashboards as the
only memorable object across Ch3/Ch6/Ch7/Ch11/Ch12. Prefer distinct carriers where
revision touches a chapter.

---

## 14. Paired-example recommendations

| Pair | Current role | Recommendation |
|---|---|---|
| Ch2 opening teams | clean teaching contrast | Replace with one evolving institutional case + short counterbeat |
| Ch2 hospital networks | capacity contrast | Keep; optionally complicate mixed domains |
| Ch2 school districts | mixed-state teaching | Keep as mixed contrast |
| Ch3 vs Ch4 openings | vitality vs decay | Keep clean teaching contrast |
| Ch5 kitchen pair | circulation open/closed | Keep clean contrast (model) |
| Ch5 theater credit pair | aftermath | Keep; optional slight complication already noted in manualReview |
| Ch6 cold-chain pair | harm route | Keep primary pair |
| Ch6 posture set | taxonomy | Reduce scene weight; keep conceptual range |
| Ch7 opening teams | brief | Keep brief |
| Ch7 library internal | success vs silenced warning | Keep |
| Ch8 four forms | one institution | Keep one-setting variants |
| Ch9 local vs regional | scale | Keep, but deepen physical carrier |
| Ch10 closed vs reopened cities | teaching symmetry | Convert to one-city temporal mixed contrast |
| Ch11 Desk A/B | outcome bias | Keep |
| Ch11 Fast Desk vs Smooth Board | two misreads | Keep both |
| Ch12 emergency stays/closes | synthesis | Keep as return, not new scenes |

Preserve some clear contrasts. Do not make every organization exist in only two
pure states—but also do not make every example ambiguous.

---

## 15. Scene consolidation recommendations

| Location | Action |
|---|---|
| Ch6 Peak Numbers Hold | Compress to brief application of harm-tolerant |
| Ch6 The Quarterly Looks Healthy | Compress to brief application of harm-blind; optional dashboard cross-reference rather than full VG |
| Ch10 Emergency Order Closed + Reopened | Consolidate into one temporal vignette architecture with two phases |
| Ch2 opening pair + later hospital pair | Avoid three teaching pairs; let institutional opener do double duty |
| Ch5 aftermath sections | Only if still echoing after editorial revision: keep strongest form, compress rest (continuity, not rewrite) |

No scenes recommended for move-to-appendix or remove.

---

## 16. Return and aftermath recommendations

| Chapter | Aftermath needed? | Return recommended? | Notes |
|---|---|---|---|
| Ch2 | yes (what happens after protocol stays/changes) | optional | Return to unchanged threshold/protocol only if meaningful |
| Ch5 | already strong | already present | Protect |
| Ch6 | already in cold-chain huddle | optional log return | Prefer replacing explanation over adding length |
| Ch7 | present in dessert follow | optional citation/dessert echo | Abort if cute |
| Ch8 | temporal variants are aftermath | already continuous | Protect |
| Ch9 | yes — who leaves / what report still says | yes | Report returns with growth language intact |
| Ch10 | yes — months later | yes | Dry underpass + still-required signature |
| Ch11 | yes — weekly review praise | yes | Dashboard fields omit prevented errors/corrections |
| Ch12 / Epilogue | already return-heavy | no new | Protect |

---

## 17. Conceptual protections

Do not blur or reopen:

| Concept | Protection |
|---|---|
| Leader definition | Verbatim |
| Intention vs structure | Verbatim |
| Moral posture / reading stance | Verbatim |
| Renewal / erosion as directions | Not personality types or moral identities |
| Vitality / decay as felt states | Distinct from directions |
| Scalability / adaptability | Distinct capacities; scale ≠ erosion |
| Correction vs circulation | Exact failure-mode and definition pair |
| Guest leadership trusted/punished | Verbatim pull quote |
| Circulation copies permission… | Verbatim |
| Temporary vs permanent emergency authority | Persistence problem, not concentration alone |
| Observer selection pressure | Responsibility without blame/conspiracy |
| Harm lens independence from intention | Who pays when pressure rises |
| Effectiveness vs legitimacy | Distinct lenses |
| Epilogue refusal of easy restoration | Verbatim / substantive |

---

## 18. Protected-language workflow

Authoritative register:
[`editorial-preservation-register.yml`](editorial-preservation-register.yml).

For every implementation task that edits manuscript files:

1. **Before editing:**  
   `python3 tools/validate_editorial_preservation.py --book-dir books/when-others-look-to-you/v1`
2. Read substantive + manualReview entries for the target unit.
3. Edit only the scoped file(s).
4. **After editing:** re-run the validator; fix any verbatim breaks immediately.
5. Account for substantive protections in the PR description (even though the
   validator does not enforce them automatically).
6. Do not alter stable chapter IDs, routes, or filenames.
7. Keep footnotes with their claims; do not orphan citations.
8. Do not expand the preservation register during vignette drafting unless Kevin
   asks to lock a new memorable line after review.
9. Semantic metadata updates wait for VIGNETTE-010 and only when scene changes
   make summaries/aliases inaccurate.

---

## 19. Factual and composite-scene labeling

| Proposed / existing scene family | Status | Labeling guidance |
|---|---|---|
| Kitchen / theater (Ch5) | fictional composite | Keep as ordinary organizational scenes; do not add real restaurant/theater names |
| Cold-chain / rivet / tournament / claims / newsroom / ATC / cities | fictional composite | If specificity rises, use light in-text clarity (“in one composite setting…”) only where needed; never add citations to fictional details |
| Hospital legitimacy network (Ch8) | institutional composite | Remain generalized; Appendix A may carry larger historical sequences separately |
| Appendix A government sequence | historical / generalized institutional | Keep sourced caution; do not blend into main-chapter scenic voice as reportage |
| Ch2/Ch9 congregational/school/hospital examples | generalized organizational | Do not invent real districts, denominations, or storm names without sourcing |

Rules:

- Do not let added specificity make a fictional composite appear to be reportage.
- Do not add real organizations, names, or events without adequate sourcing.
- Do not add citations to fictional details.
- Prefer roles over personal names.

---

## 20. Word-count and pacing expectations

| Unit | Current ~words | Major VGs now | Brief apps now | Proposed major VGs | Expected length effect | Explanation to compress |
|---|---:|---:|---:|---:|---|---|
| Intro | 676 | 0 | 1–2 | 0 | stable | — |
| Ch1 | 1,023 | 0 | cluster | 0 | stable | — |
| Ch2 | 924 | 0 formal | 3 pairs | 1 stronger open + keep cases | stable / slight + | mirror “two teams” abstraction |
| Ch3 | 1,342 | 4 | 1 | 4 | stable | only if continuity finds echo |
| Ch4 | 1,258 | 4 | 0 | 4 | stable | only if continuity finds echo |
| Ch5 | 2,134 | 3 | objects | 3 | stable / slight − | aftermath echoes if still stacked |
| Ch6 | 2,502 | 7 | many | 5 major + 2 brief | stable / − | posture lead-ins + compressed VGs |
| Ch7 | 1,114 | 2 | 1 | 2 | stable | success-narrows restatement if return carries it |
| Ch8 | 1,425 | 1 + variants | — | same | stable | — |
| Ch9 | 1,007 | 1 | 2 | 1 deeper | stable / slight + | above-narration fluff swapped for carrier |
| Ch10 | 1,424 | 2 | synthesis | 1 temporal architecture | stable | duplicated mirror explanation between cities |
| Ch11 | 2,093 | 2 | several | 2 + return beat | stable | outcome-bias overexplain after return |
| Ch12 | 634 | 0 | return cluster | 0 | stable | — |
| Epilogue | 518 | 0 | reflective | 0 | stable | — |

**Overall direction:** approximately stable total length. Small local increases
acceptable when an anchor must become inhabitable; balance by cutting nearby
explanatory repetition. No mandatory percentage target.

### Vignette-to-framework timing guidance

No single rigid formula. Defaults by target chapter:

| Chapter | Current timing issue | Recommendation |
|---|---|---|
| Ch2 | Concept names arrive almost immediately after thin pair | Stay longer in institutional scene before naming renewal/erosion |
| Ch6 | Posture labels can arrive before scenes deepen | Let primary pair land; name postures after cost routes are visible |
| Ch7 | Library scene already well timed | Do not over-interpret dessert beat; trust reader |
| Ch9 | Concept arrives while scene is still summary | Lengthen physical compression before “scale” discourse |
| Ch10 | Contrast explanation restates both cities | One scene sequence; name temporary/permanent after aftermath |
| Ch11 | Outcome bias named right after Fast Desk | Keep; add late return instead of earlier naming delay |

---

## 21. Agent-ready tasks

### VIGNETTE-001 — Protection and baseline audit

- Confirm baseline is latest `main` including PR #364
- Lock scene inventory and word-count metrics
- Run preservation validation
- Establish vignette metrics (formal VG count; chapter lengths)
- **No prose changes**

### VIGNETTE-002 — Chapter 2 anchor rewrite

- Replace generalized paired-team opening with institutional carrier
- Preserve capacity model, diagram, anti-typing, pull quote
- Optional restrained return
- Keep stable route/title/filename

### VIGNETTE-003 — Chapter 6 consolidation

- Keep cold-chain primary pair
- Compress Peak Numbers and/or Quarterly
- Retain Rivet, Tournament, Escalation for range
- Keep citations intact
- Optional log return if it replaces explanation

### VIGNETTE-004 — Chapter 7 library anchor

- Confirm library dinner as primary
- Optional restrained citation/dessert return
- Remove duplicative explanation if return carries it
- Protect dessert-follow movement

### VIGNETTE-005 — Chapter 9 scale carrier

- Make reporting-cycle compression physically visible
- Preserve scale-versus-erosion nuance
- Connect local knowledge to reporting structure
- No invented exception-form gadget unless Kevin later chooses it

### VIGNETTE-006 — Chapter 10 single-city architecture

- Restructure paired cities into one temporal institutional arc
- Preserve justified centralization
- Preserve correction/circulation precision
- Show temporal aftermath and legitimacy drift

### VIGNETTE-007 — Chapter 11 dashboard return

- Keep Fast Desk + Smooth Board
- Add late dashboard return
- Preserve observer-selection conceptual revision
- Avoid overexplaining outcome bias

### VIGNETTE-008 — Introduction and Chapter 1 restrained polish

- **Deferred / cancelled by default**
- Reopen only if Kevin overrides Human Decision #8 below

### VIGNETTE-009 — Whole-book continuity pass

- Check anchor variety (dashboard overload)
- Remove accidental repetition introduced by chapter tasks
- Verify chapter transitions and ending payoffs
- No wholesale rewriting
- Confirm Ch5/Ch8/Ch12/epilogue still protected

### VIGNETTE-010 — Semantic and generated-output synchronization

- Update summaries/aliases only where scene changes make them inaccurate
- Regenerate manifest and exports as required by repo tooling
- Verify native-reader routes/rendering
- Re-run preservation validation

---

## 22. Task dependencies

```text
VIGNETTE-001
    ↓
┌──────────────────────────────────────────────┐
│ VIGNETTE-002  Ch2                            │
│ VIGNETTE-003  Ch6                            │
│ VIGNETTE-004  Ch7     (parallel; no overlap) │
│ VIGNETTE-005  Ch9                            │
│ VIGNETTE-006  Ch10   ← highest value         │
│ VIGNETTE-007  Ch11                           │
└──────────────────────────────────────────────┘
    ↓
VIGNETTE-009  whole-book continuity
    ↓
VIGNETTE-010  semantic + export sync
```

VIGNETTE-008 remains off the critical path unless reopened.

---

## 23. Parallelization plan

**May run in parallel after 001** (distinct manuscript files):

- 002 (`chapter-2-the-two-groups.md`)
- 003 (`chapter-6-harm-under-influence.md`)
- 004 (`chapter-7-effectiveness-and-its-illusions.md`)
- 005 (`chapter-9-scale-and-drift.md`)
- 006 (`chapter-10-tradeoffs-under-pressure.md`)
- 007 (`chapter-11-why-we-misjudge-leaders.md`)

**Likely conflict surfaces (serialize or coordinate):**

| Surface | Why |
|---|---|
| Introduction / Ch1 | Only if 008 reopened; conflicts with canonical language |
| Shared semantic metadata | Defer to 010 |
| Book index / routes | Do not change; verify in 010 |
| Preservation documentation | Update only if new lines are intentionally locked after review |
| Chapter transitions / repeated definitions | Handled in 009 |
| Dashboard motif across Ch3/6/7/11/12 | Coordinate in 009 |

**Branch / PR strategy:**

- Prefer separate PRs for **Ch10 (006)** and **Ch2 (002)** because they are
  architecturally large and independently reviewable.
- Smaller tasks (004, 007) may share a branch if review bandwidth is limited.
- 009 and 010 must land after chapter PRs merge (or rebase onto them).

---

## 24. Review gates

Every chapter-level implementation task needs a review gate before VIGNETTE-009.

### Preservation gate

- Protected verbatim language passes validator
- Substantive protections accounted for in PR notes
- Stable chapter ID remains
- Native-reader route remains

### Scene gate

- Physical details perform conceptual work
- Scene contains a live decision
- Characters do not simply embody correct and incorrect answers
- Aftermath visible where relevant
- Scene does not overstate factual status
- Scene does not become melodramatic

### Concept gate

- Existing terminology remains precise
- Correction is not confused with circulation
- Renewal and erosion remain directions
- Scale is not treated as intrinsically erosive
- Temporary authority is not treated as inherently illegitimate
- Observer responsibility is not converted into blame

### Length gate

- Added scene prose balanced by compressed explanation where possible
- Chapter pacing improves
- Repetition does not increase

### Voice gate

- Prose feels consistent with Kevin’s signature style
- Does not sound like generic AI literary embellishment
- Sentence/paragraph rhythms remain consistent with the manuscript
- Sensory detail remains restrained

---

## 25. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Rewriting Ch5/Ch8 “to match” signature style elsewhere | High | Explicit do-not-touch list; reject PRs that touch them without cause |
| Ch10 loses teaching clarity when pair collapses | High | Keep two-phase structure inside one city; preserve temporary justification |
| Ch6 consolidation erases non-safety harm | High | Retain Tournament + Escalation; compress only overlapping scenes |
| Decorative sensory inflation | High | Scene gate + voice gate; operational detail only |
| Fictional composites read as reportage | High | Labeling rules; no fake citations |
| Dashboard overuse across chapters | Medium | Continuity pass anchor-variety check |
| Length creep | Medium | Scene + compress method; length gate |
| Protected-language breakage | High | Validator before/after every task |
| Cute object returns | Medium | Human judgment; abort returns that feel symbolic-only |
| Reopening editorial terminology | High | Conceptual protections list; separate from PR #364 |

Largest risk overall: **literary embellishment that weakens conceptual precision
while breaking protected language or Ch5/Ch8 architecture.**

---

## 26. Human editorial decisions

| # | Decision | Recommendation | Tradeoffs |
|---|---|---|---|
| 1 | Ch2 whiteboard vs institutional protocol | Use protocol / risk / threshold artifact already in chapter | Whiteboard is more cinematic; protocol is more continuous and less invented |
| 2 | Ch6 retain all domains? | Keep cold-chain primary + Rivet + Tournament + Escalation; compress Peak/Quarterly | Full retention preserves taxonomy but keeps overload; over-cut risks safety-only book |
| 3 | Ch7 library as primary? | Yes (already is); Fast Rule secondary | Elevating Fast Rule would blur success-narrows-correction teaching |
| 4 | Ch10 one city vs paired cities | One city temporal arc | Loses neat symmetry; gains object continuity and legitimacy drift |
| 5 | How much composite labeling? | Light, only where specificity rises | Heavy labeling breaks voice; none risks faux-reportage |
| 6 | Which returns are meaningful vs crafted? | Require Ch9/Ch10/Ch11; optional Ch6/Ch7; never force | Too many returns feel patterned; too few lose signature payoff |
| 7 | Does a scene sound like Kevin? | Kevin final arbiter on each major PR | Agents can approximate craft principles only |
| 8 | Intro/Ch1 polish task? | **Do not run VIGNETTE-008** unless Kevin overrides | Small inhabitability gain vs high canonical-language risk |
| 9 | Add new lines to preservation register? | Only after Kevin approves post-review | Premature locking freezes draft language |

---

## 27. Recommended first implementation task

**VIGNETTE-001 — Protection and baseline audit.**

No prose changes. Confirms metrics, inventory lock, and preservation validation
before any chapter rewrite begins.

If chapter work must start immediately after 001, begin with **VIGNETTE-006
(Chapter 10)** as the highest-value major rewrite, in a dedicated PR.

---

## 28. Recommended implementation sequence

1. Land this planning document (no manuscript edits).
2. Run VIGNETTE-001; publish baseline metrics in the task PR/notes.
3. Kevin resolves Human Decisions #1, #2, #4, and #6 (at minimum) before large
   rewrites freeze architecture choices.
4. Implement in parallel where files do not overlap:
   - Priority order if serialized: **006 → 002 → 003 → 005 → 007 → 004**
5. Merge chapter PRs with review gates satisfied.
6. Run VIGNETTE-009 continuity.
7. Run VIGNETTE-010 semantic/export/native-reader sync.
8. Final whole-book preservation validation + export success check.

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
9. Chapter 6 has a clearer primary anchor and less example overload.
10. Chapter 10 communicates justified centralization and later legitimacy drift through one coherent architecture.
11. Chapter 11 makes observer selection pressure memorable.
12. Objects return only where the return deepens meaning.
13. No chapter gains generic decorative detail.
14. Fictional composites are not mistaken for documented events.
15. Citations remain valid.
16. Total length remains controlled.
17. Explanatory repetition is reduced where scene meaning now carries it.
18. The whole book still feels conceptually unified.
19. Native-reader rendering remains correct.
20. Semantic summaries remain accurate.
21. DOCX, PDF, and EPUB exports succeed.
22. The revised scenes feel recognizably consistent with Kevin’s signature style.

---

## Do-not-touch list (implementation agents)

Do not change unless a later human decision explicitly reopens the item:

- Canonical leader definition (intro + Ch1)
- Intention/structure; moral posture; closing reading stance
- Guest-leadership trusted/punished pull quote
- Correction-versus-circulation failure mode and definition pair
- “Circulation copies permission before it ever copies a title.”
- Chapter 5 kitchen architecture (Swap Goes Out / Hold for the Chef)
- Chapter 5 theater credit architecture (unless light aftermath compression only)
- Chapter 8 inherited-permissions architecture and one-network continuity
- Chapter 11 observer-selection paragraphs (`ch11-selection-pressure`,
  `ch11-misjudgment-selection`, `ch11-not-corruption-selection`)
- Revised Chapter 12 synthesis and pull quote
- Epilogue refusal of easy restoration / slowing damage ≠ restoring vitality
- All Pattern Blocks and chapter-end Pull Quote Blocks listed in the register
- Stable filenames, chapter IDs, and native-reader routes
- Existing footnote bodies and bibliographic claims

---

## Directions rejected after manuscript inspection

| Proposed idea | Why rejected |
|---|---|
| Ch2 whiteboard with launch date as default rewrite | Not in manuscript; conflicts with hospital/school institutional anchors already carrying the capacity model |
| Ch9 invented exception form / dropdown as default | Not present; reporting-cycle / paperwork compression already native |
| Reduce Ch6 to physical-safety cold-chain only | Erases instrumental/blind/escalation range the chapter needs |
| Major scenic upgrade to Intro/Ch1 | Endangers canonical definition and framework staging |
| New vignettes in Ch12 or epilogue | Recent editorial pass tightened these; return density already adequate |
| Treat paired cities in Ch10 as permanently ideal | Clear but schematic; single-city temporal arc better shows persistence/legitimacy drift |
| Assume Chapter 12 lives in Part IV | Actual path is `parts/part-5-closing/chapter-12-what-happens-next.md` |

---

## Planning-pass summary metrics

| Metric | Value |
|---|---|
| Plan path | `books/when-others-look-to-you/v1/docs/vignette-architecture-plan.md` |
| Signature-style books inspected | 9 |
| Current scenes/examples inventoried | 45 |
| Formal Vignette Blocks (argument chapters) | 26 |
| Classified protect | 24 |
| Classified light-polish | 5 |
| Classified major revision (chapter targets) | 5 (Ch2, Ch6, Ch9, Ch10, Ch11) |
| Chapters recommended for no change | Intro, Ch1, Ch3, Ch4, Ch5, Ch8, Ch12, Epilogue, bridges, appendices |
| Highest-priority chapter | Chapter 10 |
| Agent-ready tasks | 9 active (001–007, 009–010); 008 deferred |
| Parallelizable after 001 | 002–007 |
| Tasks requiring Kevin’s judgment | Human Decisions #1–#9 (especially #1, #2, #4, #6, #8) |
| Expected overall word-count direction | Approximately stable |
| Largest risk | Literary embellishment that weakens precision or breaks Ch5/Ch8 protections |
| Most important protected scene | Chapter 5 kitchen circulation architecture |
| Recommended first implementation task | VIGNETTE-001 |
