# Reader Passage Disambiguation Pilot (Phase 8)

Branch: `cursor/reader-passage-disambiguation-pilot-2103`  
Baseline audit (re-run on branch tip / main `1e372994`): **714** sources, **396** paths, **384** tied A, **243** missing-path-cited, **241** deferred, **0** invalid/unverified.  
After pilot apply: **714** sources, **403** paths (+7), **389** tied A (+5), **235** missing-path-cited, **234** deferred (−7), **14** path-needs-review (includes ACEP + Brook shared footnotes), **0** invalid/unverified.

Honesty rule: verification depth is labeled per candidate. No invented source claims.

Outcomes: **A** Separate · **B** Primary · **C** Preserve shared · **D** Correct/defer

---

## 1. Allspaw & Hammond — DevOps emergence

1. **Source slug / identity:** `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` — Allspaw & Hammond, “10+ Deploys Per Day: Dev and Ops Cooperation at Flickr,” Velocity 2009.
2. **Location:** Coupling · Ch.7 DevOps · `[^c7-devops-emergence]` · path `#user-content-fnref-c7-devops-emergence`.
3. **Shared footnote works:** DevOps Handbook (Kim et al.); Allspaw & Hammond Velocity 2009.
4. **Claim supported:** DevOps emerged to reduce distance between people who change systems and people who absorb runtime consequence (handoff / build–run separation).
5. **Source establishes:** Early public case of high-frequency deploy practice with explicit Dev–Ops cooperation at Flickr (historical emergence landmark). Verification: title/metadata/footnote + well-known Velocity 2009 talk identity (no full slide deck re-read this pass).
6. **AC adds:** Structural reading that the point is coupling/consequence proximity, not automation fashion.
7. **Outcome B — Primary.** Allspaw is the emergence practice citation; Handbook synthesizes later practice and already has a sole-work note at `[^c7-mechanisms]`.
8. **Manuscript change:** Narrow `[^c7-devops-emergence]` to Allspaw; point Handbook readers to `[^c7-mechanisms]`.
9. **New path:** Yes — Allspaw → `#user-content-fnref-c7-devops-emergence`.
10. **Uncertainty:** Low. Handbook removal from this note is editorial housekeeping, not a claim that Handbook denies emergence narratives.

---

## 2. Kim et al. — DevOps Handbook (sync cost; Cluster A reconciliation)

1. **Source slug / identity:** `kim-gene-jez-humble-patrick-debois-and-john-willis-the-devops-handbook-how-to-create-world-class` — *The DevOps Handbook* (IT Revolution, 2nd ed. 2021 in YAML).
2. **Location (deferred key):** Coupling · Interlude · `[^int-sync-cost]` · `#user-content-fnref-int-sync-cost`. (Not deferred on `c7-devops-emergence`; that mismatch is the Cluster A reconciliation issue.)
3. **Shared footnote works:** DevOps Handbook; *Accelerate* (Forsgren, Humble, Kim).
4. **Claim supported:** Synchronization/coordination (incident bridges, cross-team sync) can grow without producing redesign/learning.
5. **Source establishes:** Practice patterns for incident response, cross-team coordination, and operational feedback loops in DevOps organizations. Verification: title/metadata/footnote only (no chapter-level re-read).
6. **AC adds:** Sync cost as structural compensation for weak shared understanding — not a DORA metric claim.
7. **Outcome B — Primary** on `int-sync-cost`. Remove *Accelerate* from this footnote (*Accelerate* already sole-cited at `[^int-dora-coherence]` and already has `readerPassagePath` at `c8-bridge-dora`). Cluster A: do **not** also attach Handbook to `c7-devops-emergence` after Allspaw narrowing.
8. **Manuscript change:** Narrow `[^int-sync-cost]` to Handbook; cross-ref `[^int-dora-coherence]` for metrics.
9. **New path:** Yes — Handbook → `#user-content-fnref-int-sync-cost` (closes prior deferred key).
10. **Uncertainty:** Medium on exact Handbook chapter mapping to “incident bridges”; path is to the footnote that already attributes that theme to the Handbook.

---

## 3. Associated Press — Smith & Carlos 1968

1. **Source slug / identity:** `associated-press-ap-was-there-smith-and-carlos-protest-during-1968-olympics` — AP retrospective on the 1968 podium protest.
2. **Location:** *The Game We Think We Saw* · Ch.7 · `[^c7-smith-carlos]`.
3. **Shared footnote works:** AP retrospective; World Athletics 50th-anniversary piece.
4. **Claim supported:** 1968 event facts — raised fists, medal ceremony, suspension / removal from Olympic Village.
5. **Source establishes:** Contemporary-wire / “AP Was There” event documentation of the protest and immediate institutional response. Verification: title/metadata/URL in bibliography (publisher page not fully re-fetched this pass).
6. **AC adds:** Later honor as a different communicative act (canonization vs being heard).
7. **Outcome A — Separate.** Event documentation vs later commemorative framing are distinct claims in the same paragraph.
8. **Manuscript change:** Split paragraph into event footnote (AP) and honor footnote (World Athletics).
9. **New path:** Yes — AP → `#user-content-fnref-c7-smith-carlos`.
10. **Uncertainty:** Low on split rationale; medium on which sentences AP body text covers without opening the full article.

---

## 4. World Athletics — Smith & Carlos 50th anniversary

1. **Source slug / identity:** `world-athletics-iconic-mexico-city-olympic-podium-protest-turns-50` — World Athletics, 16 Oct 2018.
2. **Location:** same chapter; was shared under `[^c7-smith-carlos]`; moves to `[^c7-smith-carlos-honor]`.
3. **Shared footnote works:** (was) AP + World Athletics.
4. **Claim supported:** Decades later the photograph became one of the most honored images of athlete protest.
5. **Source establishes:** Institutional commemorative framing at the 50th anniversary. Verification: title/metadata/URL (heritage news page identity from bibliography).
6. **AC adds:** Honor can compress disputed political content into a safely possessable symbol.
7. **Outcome A — Separate** (pair with #3).
8. **Manuscript change:** New `[^c7-smith-carlos-honor]` on the honor sentence; bibliography already lists both works.
9. **New path:** Yes — World Athletics → `#user-content-fnref-c7-smith-carlos-honor`. Prior deferred key on shared `c7-smith-carlos` closed with note pointing to new path.
10. **Uncertainty:** Low.

---

## 5. ACEP — ED boarding policy

1. **Source slug / identity:** `american-college-of-emergency-physicians-boarding` — ACEP “Boarding” policy statement (updated 2023 in YAML).
2. **Location:** *When Incentives Become the Moral Language* · Ch.1 · `[^c1-boarding]`.
3. **Shared footnote works:** ACEP Boarding; IOM *At the Breaking Point* (2007).
4. **Claim supported:** ED boarding / capacity pressure as a driver that pushes hospitals toward throughput-legible decisions.
5. **Source establishes:** Professional-society policy definition and problem framing of boarding. Verification: title/metadata/footnote only (acep.org landing not opened this pass).
6. **AC adds:** Translation of bedside judgment into traveler criteria (moral-language thesis) — **not** attributed to ACEP.
7. **Outcome B — Primary.** ACEP is the direct boarding/capacity cite.
8. **Manuscript change:** None required beyond keeping IOM as contextual second cite in the same note.
9. **New path:** Yes — ACEP → `#user-content-fnref-c1-boarding`.
10. **Uncertainty:** Low that ACEP is primary; do not overclaim ACEP proves AC’s translation thesis.

---

## 6. IOM — *At the Breaking Point*

1. **Source slug / identity:** `institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point` — IOM/NAP 2007.
2. **Location:** same `[^c1-boarding]`.
3. **Shared footnote works:** ACEP; IOM.
4. **Claim supported:** Broader institutional emergency-care capacity crisis context.
5. **Source establishes:** System-level hospital-based emergency care capacity/quality crisis report. Verification: title/metadata/NAP bibliographic identity only.
6. **AC adds:** Same translation thesis — still not IOM’s claim.
7. **Outcome B — Contextual (no unique path).** Primary link is ACEP; IOM remains valuable co-cite without a second unique path (schema is one path per source).
8. **Manuscript change:** None.
9. **New path:** No.
10. **Uncertainty:** Could argue IOM is equally primary for “capacity”; choosing ACEP because the footnote’s lead term is boarding and ACEP’s statement is boarding-specific. Human may prefer IOM or a future split.

---

## 7. Paul David — QWERTY

1. **Source slug / identity:** `david-paul-a-clio-and-the-economics-of-qwerty` — David, *AER* 75(2) 1985: 332–337.
2. **Location:** *Living in Sediment* · Ch.1 · `[^c1-david-qwerty]`.
3. **Shared footnote works:** David 1985; Arthur 1989 *Economic Journal* lock-in article.
4. **Claim supported:** QWERTY persists after the mechanical jam problem disappears — inherited map for a vanished landscape.
5. **Source establishes:** Classic QWERTY path-dependence / lock-in case in economic history. Verification: title/metadata/footnote (standard AER citation; DOI not opened this pass).
6. **AC adds:** Sediment metaphor for ordinary inheritances (weekdays, dialing, icons).
7. **Outcome B — Primary.** David owns the QWERTY case sentence; Arthur 1989 is general lock-in theory (Arthur 1994 already linked at `[^c1-arthur-lock-in]`).
8. **Manuscript change:** Narrow footnote to David; keep Arthur 1989 as optional “see also” or drop from this note (keep biblio entry).
9. **New path:** Yes — David → `#user-content-fnref-c1-david-qwerty`.
10. **Uncertainty:** Low on David primacy; Arthur 1989 fans may want a separate sentence later (not manufactured here).

---

## 8. W. Brian Arthur 1989 — lock-in by historical events

1. **Source slug / identity:** `arthur-w-brian-competing-technologies-increasing-returns-and-lock-in-by` — Arthur, *Economic Journal* 99(394) 1989: 116–131.
2. **Location:** was co-cited under `[^c1-david-qwerty]`.
3. **Shared footnote works:** David 1985; Arthur 1989.
4. **Claim supported:** General increasing-returns lock-in (not the QWERTY mechanical story specifically).
5. **Source establishes:** Formal/theoretical competing-technologies lock-in model. Verification: title/metadata/footnote only.
6. **AC adds:** Feeling that the ordinary is natural — already carried by Arthur 1994 path at `c1-arthur-lock-in`.
7. **Outcome B — Contextual / still deferred.** No unique path; do not invent a new claim sentence for 1989.
8. **Manuscript change:** Removed from `[^c1-david-qwerty]` body (see #7); remains in book bibliography.
9. **New path:** No.
10. **Uncertainty:** Whether 1989 deserves its own future footnote near the “feels natural” line without overlapping 1994 — deferred for human taste.

---

## 9–10. Alexander — *Timeless Way* + *A Pattern Language* (intentional Outcome C)

1. **Slugs / identity:**  
   - `alexander-christopher-the-timeless-way-of-building` (1979)  
   - `alexander-christopher-sara-ishikawa-murray-silverstein-et-al-a-pattern-language` (1977)
2. **Location:** *Living in Sediment* · Ch.8 · `[^c8-alexander-patterns]` on “The building solved a real problem.”
3. **Shared footnote works:** both Alexander volumes.
4. **Claim supported:** Built form as a practical solution that later becomes symbolic sediment.
5. **Sources establish:** Pattern / timeless-way architectural theory of recurring spatial solutions. Verification: title/metadata/footnote only — no page-level claim attribution attempted.
6. **AC adds:** Church-as-building vs gathering; sediment of successful solutions.
7. **Outcome C — Preserve shared.** No distinct claim sentences for the two volumes; forcing a split would manufacture citation opportunities.
8. **Manuscript change:** None.
9. **New path:** No for either.
10. **Uncertainty:** Low that shared is correct; high that any unique path would overclaim without a specific pattern citation.

---

## 11–12. Luck retirement — Marot (AP) + Walker (Colts.com) (Outcome C)

1. **Slugs / identity:**  
   - `michael-marot-oft-injured-colts-qb-andrew-luck-29-announces-retirement` (AP, 24 Aug 2019)  
   - `andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl` (Colts.com, 25 Aug 2019)
2. **Location:** *Game We Think We Saw* · Ch.6 · `[^c6-luck]`.
3. **Shared footnote works:** both contemporaneous retirement reports.
4. **Claim supported:** Aug 2019 retirement announcement, boos, age 29, injury/rehab cycle, joy lost.
5. **Sources establish:** Same-event reporting from wire vs team site. Verification: title/metadata/URLs in footnote.
6. **AC adds:** Athlete refusal of the result’s demand — interpretive frame, not a unique fact in either article.
7. **Outcome C — Preserve shared.** Independent corroboration of one event; unique paths would fake distinct claims.
8. **Manuscript change:** None.
9. **New path:** No.
10. **Uncertainty:** None material; schema one-path limit also makes picking one reporter arbitrary.

---

## 13. Timothy Brook — Tiananmen / *Quelling the People*

1. **Source slug / identity:** `brook-timothy-quelling-the-people-the-military-suppression-of-the-beijing-democracy-movement` — Brook, OUP 1992.
2. **Location:** *When Authority Is Misread* · Ch.7 · `[^c7-tiananmen]`.
3. **Shared footnote works:** Brook; Calhoun *Neither Gods nor Emperors*; Lim *People’s Republic of Amnesia*.
4. **Claim supported:** June 1989 lethal force against civilians is documented historical fact (casualty totals contested under censorship).
5. **Source establishes:** Military suppression / crackdown history. Verification: title/metadata/footnote only.
6. **AC adds:** Moral structure of reading Deng through growth vs through June 1989 — AC inference, not Brook’s thesis alone.
7. **Outcome B — Primary.** Brook is the suppression/crackdown primary among the three.
8. **Manuscript change:** None (keep Calhoun/Lim as contextual co-cites).
9. **New path:** Yes — Brook → `#user-content-fnref-c7-tiananmen`.
10. **Uncertainty:** Medium — Lim’s memory/amnesia angle is real and could support Outcome A later if a commemorative sentence is isolated; not split this pass to avoid rewrite.

---

## 14. Louisa Lim — *People’s Republic of Amnesia* (still deferred under shared)

1. **Source slug / identity:** `lim-louisa-the-people-s-republic-of-amnesia-tiananmen-revisited` — Lim, OUP 2014.
2. **Location:** same `[^c7-tiananmen]`.
3. **Shared footnote works:** Brook; Calhoun; Lim.
4. **Claim supported:** Later memory, censorship, restricted commemoration (present in the same long sentence as the crackdown).
5. **Source establishes:** Post-1989 amnesia / memory politics. Verification: title/metadata/footnote only.
6. **AC adds:** Official narrative vs silenced reckoning.
7. **Outcome C/B hybrid — still deferred.** Shared multi-historiography remains correct; no unique path without splitting the sentence (not done this pass). Calhoun likewise remains deferred contextual.
8. **Manuscript change:** None.
9. **New path:** No.
10. **Uncertainty:** High value for a future Outcome A if editors want memory vs event split; pilot leaves that to humans.

---

## 15. Levine — *Short Stories by Jesus* (Outcome D control)

1. **Source slug / identity:** `levine-amy-jill-short-stories-by-jesus-the-enigmatic-parables-of-a-controversial-rabbi`.
2. **Location:** *When Others Become Leaders* · Ch.1 · `[^t1-2]` (now Luke 19 Zacchaeus only).
3. **Shared footnote works:** N/A — identity error already corrected in #702.
4. **Claim supported:** Zacchaeus meal / restitution (Luke narrative).
5. **Source establishes:** Parable studies — **not** the Zacchaeus pericope. Verification: title/metadata + prior PR7 review fix note.
6. **AC adds:** Welcome creating answerability — gospel narrative, not Levine.
7. **Outcome D — Correct/defer (precedent).** No new link; leave deferred with wrong-attribution rationale.
8. **Manuscript change:** Already done in #702 (`[^t1-2]` = Luke only).
9. **New path:** No.
10. **Uncertainty:** None — control case that mechanical candidates can be identity-wrong.

---

## Additional Outcome C (variety #10) — Kaepernick grievance filed

**AP** `associated-press-kaepernick-files-grievance-against-nfl-alleging-collusion` + **ESPN** `espn-qb-colin-kaepernick-files-grievance-for-collusion-against-nfl-owners` share `[^c7-grievance-filed]` for the same Oct 2017 filing fact. **Outcome C — Preserve shared.** No unique path. (Counted as the extra shared pair; same logic as Luck.)

---

## Pilot lessons

### Counts

| Metric | Count |
|--------|------:|
| Source candidates reviewed | 17 (15 core + 2 grievance) |
| Outcome A | 2 (AP Smith–Carlos; World Athletics) |
| Outcome B primary (new links) | 5 (Allspaw; Handbook sync; ACEP; David; Brook) |
| Outcome B contextual / no path | 2 (IOM; Arthur 1989) |
| Outcome C preserve shared | 6 (Timeless; Pattern Language; Marot; Walker; AP grievance; ESPN grievance) + Lim/Calhoun still deferred under shared Tiananmen |
| Outcome D | 1 (Levine control) |
| Newly linked (`readerPassagePath` set) | 7 |
| Of which mechanical tied A | 5 (Allspaw, Handbook, AP, World Athletics, David) |
| Of which path-valid but shared (evidence B) | 2 (ACEP+IOM; Brook+Calhoun+Lim) |
| Still deferred after pilot (among reviewed) | 10 |

Expect **well under half** newly linked: 7/17 ≈ 41% of reviewed rows; tied-A gains only +5 because Outcome B with intentional co-cites stays mechanically shared.

### Easiest vs hardest ambiguity classes

- **Easiest:** Contemporaneous same-event journalism (Luck; grievance) → Outcome C immediately. Event-vs-anniversary pairs with two claim sentences (Smith–Carlos) → Outcome A with minimal split. Primary professional definition + broader report (boarding) → Outcome B.
- **Hardest:** Multi-historiography packed into one long sentence (Tiananmen); theory pairs where one volume already has a cousin path (Arthur 1989 vs 1994); practice-synthesis books cited both as emergence history and as mechanism manuals (Handbook dual keys on different footnotes).

### Recommended next phase

**Light tooling assist** (option 2) — not bulk manual continue alone, and not many-to-many schema yet.

Why: the pilot’s wins came from (a) detecting when a co-cited work already has a sole-work footnote elsewhere, (b) distinguishing event vs commemorative claim sentences, and (c) refusing unique paths for true corroboration pairs. Tooling that *surfaces* those patterns (sibling sole-work footnotes; anniversary vs event title cues; duplicate-URL same-day news) would speed editorial triage without changing the one-path schema. Full many-to-many representation (option 3) remains future work once deferred volume and genuine multi-claim footnotes justify schema cost — **not implemented here**.

Manual continue (option 1) remains necessary for Outcome A sentence splits and identity checks; tooling should assist, not auto-apply.
