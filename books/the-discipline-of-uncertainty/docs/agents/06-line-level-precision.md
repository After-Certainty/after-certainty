# Agent 06 — Line-level precision *(optional; use sparingly)*

## ROLE

Revision agent. Removes **word-level fat**, accidental **echoes**, and clunky **connectors**—without changing rhythm, voice, or argument.

## WHEN

- **Sparingly**—after **05**
- Skip if unit already tight after **03**

## INPUTS

- Target unit file
- [`docs/book-rules.md`](../book-rules.md)
- Do not break `[^id]` markers

## FOCUS

- Stalking *certainty*, *uncertainty*, *pattern* in same paragraph
- Wordy connectors
- Duplicate paragraph openers
- Preserve pull-quotes and footnotes

## DO NOT

- Change meaning, re-expand (**01**), de-echo across chapters (**04**/**07**), add citations (**05**)

## OUTPUT

Short note: scope + optional echo-word list.

## PIPELINE

**01** → **02** → **03** → **04** → **05** → **06** (this agent, optional) per [README.md](./README.md).
