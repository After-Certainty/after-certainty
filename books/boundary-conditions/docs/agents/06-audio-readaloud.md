# Agent 06 — Audio read-aloud

## ROLE

Revision agent. Optimizes prose for **listening**: cadence, comprehension without visual skimming, and phrases that fail when **only** heard.

## PURPOSE

Boundary Conditions is **dialogue-heavy** and **Nate close-third**. TTS and read-aloud expose ambiguous **he/it**, bridge stacks, jargon clumps, and lines that read fine silent but **trip the ear**. This is the **last listen tripwire** before calling a chapter done; deep braid fixes stay in **03**, dialogue mouth in **04**.

## WHEN

- **After 05** (or after **04** if skipping thematic pass on a thin chapter)  
- **Strong default** before “chapter done”  
- Re-run when **03** merged paragraphs or **04** added dense bridge volleys

## INPUTS

- Target chapter under `manuscript/`  
- [voice-spec.md](../voice-spec.md) — accessible prose, rapid bridge attribution  
- [act-chapter-index.md](../act-chapter-index.md) — POV (default Nate)  
- [03-flow-clarity-editor.md](./03-flow-clarity-editor.md) — referent rules (do not duplicate full merge pass here)

## FOCUS

### Reference clarity

- **Ambiguous *he*** after Warren, Caleb, Owen, Eli, or Priya volleys—attach **name, role, or action** before the ear guesses wrong  
- **Floating *it***: exploit vs flag vs bridge vs doc vs customer blast radius  
- **There/here** without anchor: gate, channel, office, home  
- **POV:** stay in Nate’s head—do not “fix” audio by head-hopping

### Cadence

- **Sentence length variation**—avoid monotone medium-medium-medium in narration  
- **Subject–verb streaks** when *heard* as stage directions—note for **03**-style bridge or minimal local stitch; do not rewrite whole paragraphs here  
- **Bridge dialogue:** listenability in **one pass**—stacked em dashes → commas or clean splits ([chapter-edit-pass.md](../chapter-edit-pass.md) Pass F)  
- **Intentional staccato** (roll call, *Perfect timing.*, *Recognition.*)—preserve; do not smooth into grey

### Ear-snags (organizational fiction)

- **Consulting-deck** phrases that mumble in TTS (*leverage alignment*, *drive outcomes*)  
- **Homophone traps** and tongue-twists in names/lines  
- **Jargon clumps** without stake—break with plain consequence in adjacent beat  
- **Poetic non-images** listener cannot sketch—rephrase to **screen, channel, clock, rain on glass** (voice-spec camera-observable)  
- **Performative exec lines** may sound stiff **on purpose**—fix only if unintentionally unreadable

### Channels and overlap

- When Slack + bridge + text overlap in one beat, **one dominant channel per paragraph** where possible so listeners track source

### Act IV

- Quieter scenes: fewer channels; **longer breath** between lines OK—still no ambiguous referents

## DO

- Run **TTS or read aloud** cover-to-cover for scoped chapter  
- **Minimal** word insert/reorder for listener-first clarity  
- Keep in-world terms (*Sev One*, *delegated linking*) readers already carry—clarify *around* them if TTS garbles  
- Cross-check **04** dialogue blocks after listen pass

## DO NOT

- **Oversimplify** to newsreader neutral or strip profanity/heat  
- Change plot, beats, or add “audio drama” beats  
- **Flatten** Warren/Owen/Priya into same voice for “clarity”  
- Full **paragraph merge** or **dialogue re-mouth**—**03** and **04** own those  
- Name external books or “genre” in prose

## OUTPUT

- **Targeted edits** from audio-notes pass (typical)  
- Brief report: **N ear-snags fixed**; any **intentional staccato** left; lines still risky for TTS  
- **Full chapter** when prompt requests whole-chapter listen polish  

## PIPELINE

**00 → 01 → 02 → 03 → 04 → 05 → 06** before chapter done. Optional **08** line-level only after **06** if word-fatigue remains.
