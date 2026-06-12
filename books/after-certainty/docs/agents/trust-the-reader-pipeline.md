# Trust the reader pipeline — Agent 09

Use as a **single Cursor prompt** for Agent **09** on one unit or the full manuscript.

**Prerequisites:** Agents 04–08 complete; branch `after-certainty/manuscript-deepening-pass`.

---

## Prompt template

```markdown
Run the Trust the Reader Agent on **After Certainty**:

**Target:** TARGET_UNIT (or full manuscript reading order)

**Spec:** books/after-certainty/docs/agents/09-trust-the-reader.md

**Also load:** book-rules.md, pattern-language.md, status.md.

**Rules:**
- Trim explanatory scaffolding only—no structural rewrite.
- Trust strong scenes (postmortem, meeting, visit, marriage, statement, working group).
- Vary/soften/remove inquiry scaffolds where earned—not wholesale.
- Preserve all **Pattern Name** labels; reader should arrive before label.
- Ch 5 untouched.
- ±2% length per unit (usually trim).
- Update status.md (trust the reader column).
- Brief report when done.

make export-docx DIR=books/after-certainty
```
