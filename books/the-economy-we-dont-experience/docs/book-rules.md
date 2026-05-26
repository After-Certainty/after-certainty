# The Economy We Don't Experience — Book Rules

## Purpose

Architectural constraints for **The Economy We Don't Experience** (*Leadership, Communication, and the Credibility Crisis in Economics and Politics*).

## Book scope and structure

### Target length

- **This edition:** ~28–32k words (intro + 4 part bridges + 8 chapters + conclusion; appendix separate)
- **Part bridges:** ~450–900 words each (orientation and handoff—not chapter length)
- **Long-term band (optional future edition):** toward ~50–70k if the manuscript grows into a fuller treatment
- 4 parts, 4 part bridges, 8 chapters, appendix

## Core invariant (non-negotiable)

> The economy we argue about is not the economy we experience—compression, scaled pain, and interpretive stress break leadership communication long before policy fails on its own terms.

## Thematic arc by part

- **Part I — The Economy We Describe:** Compression problem; forecast era; experienced economy.
- **Part II — Why Pain Travels Farther:** Pain scales; resonance without understanding.
- **Part III — Leadership Under Compression:** Interpretive stress; elections without shared understanding.
- **Part IV — Stability, Memory, and Fragility:** Resilience, reform, forgotten guardrails.

## Tone and positioning

### This book must not be

- Macroeconomic textbook
- "Both sides" false balance
- Communication tips without structural diagnosis

### This book must be

- Grounded in lived economic experience vs aggregate narrative
- Clear on leadership under interpretive failure
- Willing to name compression without conspiracy framing

## Outline-stage rules

Chapters use bullet beats and "Core idea" lines. Expand each beat to a full section in prose; preserve one core idea per chapter as the pull-through line.

## Key docs

- `docs/drafting-process.md`
- `docs/status.md`
- `docs/agents/README.md` — expansion, plain-speak, flow/clarity, echo, citation, line-level agents (01–06)

## Sub-headings

Use **descriptive `###` titles** only—no numbered subsection ladders (`### **1.**` …).

Use **Title Case** on sub-headings (same convention as other books in this repo, e.g. *After Certainty*): major words capitalized; short prepositions and conjunctions lowercase unless first or last word in the heading.

## Plain-speak (Feynman bar)

Every chapter must pass the **Feynman test** after agent **02**: a smart non-economist can follow the mechanism without jargon stacks or throat-clearing. Concrete nouns before abstractions; book terms earned with a plain gloss on first use. See [`docs/agents/02-plain-speak-language.md`](agents/02-plain-speak-language.md).

## Prose paragraphs

Body prose uses **flowing paragraphs**: one line per paragraph in the source file, separated by a single blank line—not hard-wrapped at ~60–70 characters. Agent **03** runs `python3 tools/reflow_markdown_paragraphs.py` on the unit file at the start of the flow pass.
