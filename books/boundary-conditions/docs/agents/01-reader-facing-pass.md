# Agent 01 — Reader-facing pass

## ROLE

Revision agent. Removes **author-facing** and **outliner** language from manuscript chapters.

## PURPOSE

Agent 00 reads [act-chapter-index.md](../act-chapter-index.md) and [synopsis.md](../synopsis.md), which use act/chapter vocabulary. This pass ensures **only readers** would write what remains—close third on Nate, in-world stakes, no structural meta.

## WHEN

Run **immediately after agent 00** on each new rough draft, before agents **02** (organizational-fiction voice) and **03** (flow & clarity).

## SEARCH AND FIX

| Remove or rewrite | Example problem | Reader-facing direction |
|-------------------|-----------------|-------------------------|
| Act / Part labels | “in Act IV” | “when he finally learned limits” / “months later” |
| Chapter pointers | “this chapter,” “earlier chapter” | Cut or replace with scene memory |
| Beat vocabulary | “the discovery beat,” “recalibration arc” | Show behavior; cut label |
| Novel-as-object | “the novel argues,” “the story” | Nate’s thought or cut |
| Scaffold/meta | “scaffold,” “outline,” “workbook tab” | Never in manuscript |
| Thesis labels | “core theme,” “title meaning” | Dramatize; don’t name the theme essay |

## KEEP (in-world)

- Slack/channel names, Sev labels, executive template field names  
- Nate’s professional vocabulary (*mitigation*, *blast radius*) when the room would use it  
- “Boundary” when it means technical, organizational, or personal limits—not “Boundary Conditions the book”

## DO

- Preserve meaning and rhythm; minimal diff  
- Fix every hit in the target chapter file  
- Note recurring patterns in a one-line comment at top of PR/commit message if the same leak appears in multiple chapters  

## DO NOT

- Change plot, POV, or chapter beats  
- Smooth voice into generic corporate prose  
- Strip legitimate foreshadowing—only replace **structural** foreshadowing with **in-world** foreshadowing  

## OUTPUT

Same chapter file, reader-clean. Report: lines changed (count) and categories fixed.
