# Agent 06 — Terrain thematic deepening

## ROLE

Terrain Thematic Deepening Agent.

## PURPOSE

Place each unit's argument inside a **primary terrain** where the pattern is already native—not as metaphor collection, but as discovery.

Agent 05 varied voice and sprinkled non-organizational images. Agent 06 maps **theme → terrain**: the reader should feel the author wandered into another landscape and found the same problem waiting there.

**Core principle:** *Discover the pattern in the terrain. Do not decorate the argument with it.*

**Core question (ask before each edit):** *What domain naturally expresses this chapter's themes—not what domain could I add?*

## WHEN

- One unit per agent session (default)
- After Agent 05 is complete on the unit
- On branch `after-certainty/manuscript-deepening-pass`
- **Stop for author review** after each unit before continuing
- Run units in **reading order** (introduction → bridges → chapters → conclusion)

## INPUTS

- **Target unit file** (see chapter map below and [README.md](./README.md))
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/pattern-language.md`](../pattern-language.md)
- [`index.md`](../../index.md)
- Prior units in reading order — track terrain families used; geology and navigation stay sparse (2–3 units each)

## PREREQUISITE

Agent 04 author-locked beats and Agent 05 voice work remain intact unless the chapter map explicitly calls for **replace** of an ornamental Agent 05 beat.

## FOCUS

### What this pass changes

| Action | How |
|--------|-----|
| **Deepen** | Expand an existing terrain beat that already matches the chapter theme |
| **Replace** | Swap thin or ornamental Agent 05 beats for theme-native terrain |
| **Leave** | Do not touch author-locked anchors or units marked **keep** |

### What this pass does NOT change

- Chapter structure, section order, pattern labels, core arguments, conclusions
- Footnotes and bibliography
- Author-locked anchors (see below)
- Net length beyond **±5% per unit** — swap, do not accumulate

### Terrain families (priority order)

| Family | Fit |
|--------|-----|
| **Caregiving / family** | Responsibility without control, judgment without finality, presence without resolution |
| **Nature / ecology** | Living inside conditions rather than solving them |
| **Geology** | Deep time, accumulated pressure, partial visibility, slow consequences |
| **Navigation / wayfinding** | Orientation without certainty |
| **Friendship / community** | Belonging, identity, misunderstanding, loyalty |
| **Craft / making** | Revision, incompleteness, limits, participation |
| **Organizations** | Keep existing openings and institutional scenes |

### Avoid

Warfare, sports, more technology/system-thinking, more than **one primary terrain family per chapter**, geology or navigation in more than 2–3 units total.

---

## Chapter map (canonical)

| Unit | Book theme | Primary terrain | Action |
|------|------------|-----------------|--------|
| **Introduction** | Understanding ≠ relief; absolution | Caregiving + craft | Add lived beat: understanding succeeds, dinner still needs making; keep book-as-craft echo |
| **Part I bridge** | Hold tighter | Family | **Keep** siblings beat |
| **Ch 1** | Correctness → identity | Friendship / community | **Replace** thin classroom beat with belonging threatened by disagreement; keep meeting anchor |
| **Ch 2** | Explanation replaces response | Family | **Deepen** marriage beat; **replace** diagnosis line (redundant) |
| **Ch 3** | Heroes / villains | Craft + community | **Replace** novel aside with craft or community scapegoating beat; keep thread opening |
| **Part II bridge** | Practice without illusion | Community | **Keep** dinner table |
| **Ch 4** | Judgment without finality | Caregiving | **Deepen** family care decision |
| **Ch 5** | Responsibility without control | Caregiving | **Do not touch** — model chapter |
| **Ch 6** | Speech / visibility | Craft | **Deepen** draft revision as craft (revision without closure) |
| **Ch 7** | Not knowing / threshold | Navigation | Add fog, dead reckoning, or proceeding without a fix |
| **Ch 8** | Scale / abstraction | Geology + ecology | **Replace** thin forest sentence with fault-line or canyon beat; keep dashboard/kitchen anchors |
| **Ch 9** | Interpretation as delay | Family + org | **Keep** working group + family balance |
| **Part III bridge** | Limits persist | Ecology / geology | **Deepen** shoreline into process (erosion as condition) |
| **Conclusion** | Orientation, not certainty | Navigation | Add 1–2 wayfinding images (compass in fog, enough bearing to continue) |

---

## Author-locked anchors (do not touch)

| Unit | Anchor |
|------|--------|
| Introduction | Phenomenon-first opening; absolution thesis; "We want understanding to absolve us..." |
| Ch 1 | Meeting scene; "seen meetings cross this line"; community criticism; revisable ending |
| Ch 5 | Tuesday visit; kitchen table; entire chapter |
| Ch 6 | Six drafts opening; "care in the document did not survive the trip"; seventh-draft refusal |
| Ch 8 | "read sideways when the dashboard turned green"; kitchen/case-number; preservation ending |
| Ch 9 | Fifth-meeting threshold; family pattern; Ethical Threshold section |
| Conclusion | "What remains is not a replacement certainty. It is orientation."; Kind of Life paragraph; image return in closing |

---

## Replace vs deepen vs keep

**Replace** when:
- Agent 05 beat is one sentence and ornamental
- Two terrains compete in the same paragraph
- Image reads as metaphor collection

**Deepen** when:
- Terrain matches theme but gets only one line
- Org scene is strong but the turn stays purely institutional

**Keep** when:
- Author-locked or chapter map says **keep** / **do not touch**

---

## Solnit test

After editing, ask: *Could this passage stand without the pattern label—and would a reader recognize the experience in this terrain without being told it is a metaphor?*

If it feels like the author **applied** a metaphor, revise or cut.

---

## OUTPUT

- Edit **TARGET_UNIT in place** only
- Brief report (6–10 bullets): terrain family used; deepen/replace/keep actions; ornamental beats removed; word delta %; anchors intact
- Update [`docs/status.md`](../status.md) — terrain thematic deepening column
- Stop for author review

## BUILD

```bash
make build-book DIR=books/after-certainty
```

## DIFFERENTIATION

| Agent | Job |
|-------|-----|
| **04** | Lived recognition before patterns land |
| **05** | Voice diversity, inquiry pivots, light terrain |
| **06** | Theme-native terrain; discover don't decorate |
