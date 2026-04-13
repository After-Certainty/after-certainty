# Citation and bibliography audit (v1)

**Last run:** generated during a full footnote/bibliography cross-check.

## Scope

- **Manuscript:** `front-matter/`, `parts/`, `back-matter/` Markdown (excluding `bibliography.md` itself from “footnote body” parsing).
- **Bibliography:** `back-matter/bibliography.md` (aggregate list).
- **Footnotes:** Pandoc-style `[^id]` in body with `[^id]:` definitions at file bottoms.

## Footnote integrity

A script verifies that every `[^footnote-id]` used in body text has a matching `[^footnote-id]:` definition in the same manuscript tree, and that every definition is referenced.

**Result:** **40** unique footnote IDs; **40** definitions; **no** missing definitions and **no** unused definitions (balanced).

To re-check after edits:

```bash
cd when-others-look-to-you/v1 && python3 << 'PY'
import re
from pathlib import Path
roots = [Path("front-matter"), Path("parts"), Path("back-matter")]
ref_pat = re.compile(r"\[\^([^\]]+)\]")
def_pat = re.compile(r"^\[\^([^\]]+)\]:", re.M)
all_refs, all_defs = set(), {}
for root in roots:
    for p in root.rglob("*.md"):
        if p.name == "bibliography.md":
            continue
        text = p.read_text(encoding="utf-8")
        defs = set(re.findall(def_pat, text))
        body = re.sub(r"^\[\^[^\]]+\]:.*$(?:\n(?!\[\^|\n).*)*", "", text, flags=re.M)
        used = set(ref_pat.findall(body))
        all_refs |= used
        for d in defs:
            all_defs[d] = p
print("missing:", sorted(all_refs - set(all_defs.keys())))
print("unused:", sorted(set(all_defs.keys()) - all_refs))
PY
```

## Bibliography vs chapter footnotes

Each **bibliography** entry corresponds to at least one **in-chapter footnote** (full or partial citation). The bibliography is the consolidated list; chapters carry the concrete anchors readers see.

| Work (short) | Appears in footnotes (examples) |
|----------------|----------------------------------|
| Agamben, *State of Exception* | Ch. 10 crisis precedent |
| Argyris, *Overcoming Organizational Defenses* | Ch. 1, 2, 7, 11 |
| Argyris & Schön, *Organizational Learning II* | Ch. 7 |
| Arendt, *Eichmann in Jerusalem* | Ch. 1 |
| Arendt, "What Is Authority?" | Ch. 1 (with Weber), Ch. 8 |
| Bandura, *Social Learning Theory* | Ch. 1 |
| Baron & Hershey, outcome bias | Ch. 11 |
| Beck, *Risk Society* | Ch. 6 |
| Brehm, *Psychological Reactance* | Ch. 1, Ch. 11 |
| Cialdini et al., focus theory | Ch. 1 |
| Cockburn, guest leadership (Cutter) | Ch. 1, 5, 7 |
| Dekker, *Just Culture* | Ch. 6 |
| Edmondson, *Fearless Organization* | Ch. 7 |
| Edmondson, psych safety (ASQ) | Ch. 1, Ch. 7, Ch. 11 |
| Foucault, *Discipline and Punish* | Ch. 6 |
| Hirschman, *Exit, Voice, and Loyalty* | Ch. 3, 6, 7 |
| Janis, *Groupthink* | Ch. 4 |
| Perrow, *Normal Accidents* | Ch. 9 (scale / coupling) |
| Scott, *Domination and the Arts of Resistance* | Ch. 6, Ch. 9 |
| Staw, escalating commitment | Ch. 7, Ch. 10 |
| Uhl-Bien et al., followership | Ch. 1, Ch. 11 |
| Vaughan, *Challenger Launch Decision* | Ch. 11 |
| Weber, *Economy and Society* | Ch. 1, Ch. 8, Ch. 9 |
| Weick, *Social Psychology of Organizing* | Ch. 2 |
| Weick & Sutcliffe, *Managing the Unexpected* | Ch. 3 |
| Weick et al., sensemaking (*Organization Science*) | Ch. 11 |

**No bibliography entries are orphaned** (nothing listed only in the back matter without a chapter footnote path).

## URLs

- **Cockburn (Cutter),** guest leadership: `https://www.cutter.com/article/how-step-stepping-promoting-guest-leadership-successful-collaboration-494516` — verified reachable; article title and journal match the citation.

## Relevance notes (qualitative)

- **Weber** on legitimacy forms and **Arendt** on authority/challenge: appropriate for Ch. 8–9 and the opening definition footnote in Ch. 1.
- **Agamben** (*State of Exception*) on Ch. 10: supports emergency precedent / baseline shift; use is structural, not legal analysis of specific administrations.
- **Perrow** (*Normal Accidents*) on Ch. 9: used where scale and coupling obscure harm and feedback—aligned with high-risk systems / layered organizations; not a literal “accident” claim in every vignette.
- **Vaughan** on Ch. 11 (normalization of deviance, structural blindness): standard pairing for those concepts.
- **Combined footnotes** (e.g. Ch. 11 structural blindness bundling Vaughan, Argyris, Weick et al.): heavy citation load for one sentence; acceptable as a composite anchor for a synthesis claim—split only if you want finer-grained provenance per clause.

## Housekeeping

- Ch. 1 **Cockburn** footnote was aligned to ***Cutter IT Journal*** and the same URL string as Ch. 5, Ch. 7, and the bibliography (removed alternate journal name).
- Re-run this audit after adding chapters, merging files, or changing footnote IDs.
