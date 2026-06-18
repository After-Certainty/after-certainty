# The Relay — agent specs

**House rules (agents do not override):**  
[project-spec.md](../project-spec.md) → [character-bible.md](../character-bible.md) → [civilization-bible.md](../civilization-bible.md) → [iconic-locations.md](../iconic-locations.md) → [voice-spec.md](../voice-spec.md)

Copy a spec into a Cursor prompt with the chapter file and linked docs.

## Per-chapter pipeline

| Step | Agent | When |
|------|--------|------|
| 0 | [00-brief-to-rough-draft](./00-brief-to-rough-draft.md) | Expand stub from index |
| 1 | [10-flow-clarity-editor](./10-flow-clarity-editor.md) | First polish |
| 1b | [17-timeline-sequencing-agent](./17-timeline-sequencing-agent.md) | Time, space, information order; openings |
| 1c | [18-future-texture-agent](./18-future-texture-agent.md) | Non-Velorum future detail; anti wise-person drift |
| 1d | [19-future-language-terminology-agent](./19-future-language-terminology-agent.md) | Friction terms; corridor not throat; earned coinage only |
| 1e | [20-first-read-snag-agent](./20-first-read-snag-agent.md) | Line-by-line decode pauses; compressed grammar; thesis narration |
| 1f | [21-contemporary-dialogue-agent](./21-contemporary-dialogue-agent.md) | TV/audiobook dialogue; anti-aphorism; goals not themes |
| 1g | [22-author-intrusion-agent](./22-author-intrusion-agent.md) | Flag narrator-as-editor; meta/arc/theme restatement (**report only**) |
| 1h | [23-redundant-explanation-agent](./23-redundant-explanation-agent.md) | Paragraph retell after show; delete test (**report only**) |
| 2 | [14-brittany-agent](./14-brittany-agent.md) | Readability; Speechify test |
| 3 | [16-contemporary-readability-agent](./16-contemporary-readability-agent.md) | Anti literary drift; POV-grounded prose |
| 4 | [15-language-drift-agent](./15-language-drift-agent.md) | Anti jargon; POV vocabulary |
| 2–9 | Craft agents 01–09 | See below |
| — | [11-audio-readaloud](./11-audio-readaloud.md) | Before chapter done |
| periodic | [12-theme-agent](./12-theme-agent.md) | Every 3–4 chapters |
| always | [13-participation-agent](./13-participation-agent.md) | Momentum + participation |

**Note:** After expansion, **Contemporary Dialogue (21)** is the highest-leverage pass—characters still leak nonfiction/thesis register. Brittany + Language Drift matter for narration; Agent 21 targets **quoted speech**.

**Post-expansion pipeline:** 17 → 02 → 18 → 19 → 20 → **21** → **22** → **23** → 14 → 16 → 15 → 11

Agents **22** and **23** are **report-only**—flag first; apply deletions in a separate approved pass.

**Profanity:** Velorum-aligned rules in [voice-spec.md](../voice-spec.md) — heat in dialogue, clean narration; preserve on polish (dialogue agent + read-aloud).

## Craft agents

| # | Agent | Focus |
|---|--------|-------|
| 01 | [Dialogue](./01-dialogue-agent.md) | Distinct voices; subtext; no theme lectures |
| 02 | [Wonder](./02-wonder-agent.md) | Place image; "never seen this before" |
| 03 | [Systems](./03-systems-agent.md) | Incentives; wrong theory; no villain simplification |
| 04 | [Human](./04-human-agent.md) | Sees/misses; independent goals; Arin agency |
| 05 | [Mystery](./05-mystery-agent.md) | Dual mystery; misread; reject AI/conspiracy answer |
| 06 | [Worldbuilding](./06-worldbuilding-agent.md) | Places; Ribbon culture; implication |
| 07 | [Hope](./07-hope-agent.md) | Participation over cynicism |
| 08 | [Reality](./08-reality-agent.md) | Institutional/economic plausibility |
| 14 | [Brittany](./14-brittany-agent.md) | Emotional accessibility; anti-friction |
| 16 | [Contemporary readability](./16-contemporary-readability-agent.md) | One image then move; anti thematic interior |
| 17 | [Timeline & sequencing](./17-timeline-sequencing-agent.md) | Chronology, spatial continuity, page-one orientation |
| 18 | [Future texture](./18-future-texture-agent.md) | Visual/social SF detail; distinct minor voices |
| 19 | [Future language & terminology](./19-future-language-terminology-agent.md) | Useful coinage only; operational replacements |
| 20 | [First-read snag](./20-first-read-snag-agent.md) | Line-by-line decode pauses; fix on read |
| 21 | [Contemporary dialogue](./21-contemporary-dialogue-agent.md) | TV/audiobook register; anti-aphorism in speech |
| 22 | [Author intrusion](./22-author-intrusion-agent.md) | Meta/arc/theme commentary; flag only |
| 23 | [Redundant explanation](./23-redundant-explanation-agent.md) | Retell after show; delete test; flag only |
| 15 | [Language drift](./15-language-drift-agent.md) | POV vocabulary; anti engineer-speak |
| 13 | [Participation](./13-participation-agent.md) | Decision/relationship/discovery required |
