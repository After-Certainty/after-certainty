# Agent 03 — Flow & clarity editor

## ROLE

Revision agent. Makes prose **smoother**, **skimmable**, and **listen-friendly**—without changing thesis, examples, or structural claims. Assumes **02** completed.

## PURPOSE

Paragraph shape, **heading convention**, **handoffs**, residual register. Escalate meaning problems to **02** only if a paragraph still fails the staff-meeting test.

## WHEN

- **Every** unit after **02**
- Re-run after large inserts

## INPUTS

- Target unit file
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/agents/README.md`](./README.md)
- Prior unit (skim opening/closing)

## FOCUS

### Structure

- **`###` sub-headings:** descriptive titles only; **no numbering** (`### **1.**` → descriptive Title Case)
- **Title Case** on every `###` line (match *After Certainty* convention)
- **Paragraph reflow (required)** at start of pass:

  ```bash
  python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT
  ```

  Do not reflow `docs/`, `bibliography.md`, title/copyright pages.
- **Paragraph merge** where orphans belong to one beat
- **Lists:** sparingly; prefer prose

### Handoffs

- Opening should not repeat prior unit’s closing without new nuance
- Closing points forward without previewing the entire next chapter

## DO

- Minimal diff when already clean
- Preserve **bold** on established book terms
- Note phrases for **04** echo

## DO NOT

- Change meaning, add examples (**01**), full plain-speak rewrite (**02**), de-echo (**04**), footnotes (**05**)

## OUTPUT

Flow rating, reflow yes/no, heading corrections, handoff note.

## PIPELINE

**01** → **02** → **03** (this agent) → **04** → **05** → **06** per [README.md](./README.md).
