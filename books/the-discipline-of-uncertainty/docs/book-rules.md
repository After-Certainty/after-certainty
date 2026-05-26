# The Discipline of Uncertainty — Book Rules

## Purpose

Architectural constraints for **The Discipline of Uncertainty** (*Judgment, restraint, and decision quality under incomplete information*).

## Author framing (not for reader-facing copy)

This book is **not** about doubt as paralysis. It is about **uncertainty as a discipline**—a practiced way of reasoning, judging, and acting when absolutes fail.

## Book scope and structure

### Target length

- **First editorial cycle:** ~50–58k words (intro + 6 part bridges + 12 chapters + conclusion)
- **Part bridges:** ~600–900 words each (orientation and handoff—not chapter length)
- **Chapters:** ~3,500–4,500 words each in first cycle
- **Long-term band:** ~70–90k at completion
- 6 parts, 6 part bridges, 12 chapters, optional appendix ideas file

### Subtitle alignment

- Primary subtitle (aligned May 2026): *Judgment, restraint, and decision quality under incomplete information* — in `book.yml`, `index.md`, and title page.

## Core invariant (non-negotiable)

> Maturity under incomplete information requires disciplined uncertainty—patterns as warnings not verdicts, probabilistic seriousness without relativism, and leadership that refuses false prophecy.

## Thematic arc by part

- **Part I — Why We Crave Absolutes:** Psychological comfort; abstraction and clean answers.
- **Part II — What Patterns Actually Are:** Warnings vs verdicts; fatalistic pattern recognition.
- **Part III — Probabilistic Truth and Moral Seriousness:** World refuses absolutes; probabilism ≠ relativism.
- **Part IV — Institutions, Authority, and Drift:** Warning systems; collapse into absolutes.
- **Part V — Leadership Without Prophecy:** Pressure into certainty; uncertainty as practice.
- **Part VI — Living Without Guarantees:** Responsibility and meaning after certainty.

## Tone and positioning

### This book must not be

- Stoic “embrace ambiguity” self-help
- Statistical pedantry without moral stakes
- Leadership hype about “comfort with ambiguity”

### This book must be

- Serious about judgment under constraint
- Clear on probability vs moral seriousness
- Applicable to institutions and leaders without checklists

## Outline-stage rules

When expanding to prose:

- One anchor beat becomes at least one substantive section.
- Do not publish bullet-only chapters.

## Key docs

- `docs/drafting-process.md`
- `docs/status.md`
- `docs/agents/README.md` — expansion, plain-speak, flow/clarity, echo, citation, line-level, part-echo agents (01–07)

## Sub-headings

Use **descriptive `###` titles** only—no numbered subsection ladders (`### **1.**` …).

Use **Title Case** on sub-headings (same convention as other books in this repo, e.g. *After Certainty*): major words capitalized; short prepositions and conjunctions lowercase unless first or last word in the heading.

## Plain-speak (Feynman bar)

Every chapter must pass the **Feynman test** after agent **02**: a smart reader outside academia can follow the mechanism without jargon stacks or throat-clearing. Concrete nouns before abstractions; book terms earned with a plain gloss on first use. See [`docs/agents/02-plain-speak-language.md`](agents/02-plain-speak-language.md).

## Prose paragraphs

Body prose uses **flowing paragraphs**: one line per paragraph in the source file, separated by a single blank line—not hard-wrapped at ~60–70 characters. Agent **03** runs `python3 tools/reflow_markdown_paragraphs.py` on the unit file at the start of the flow pass.
