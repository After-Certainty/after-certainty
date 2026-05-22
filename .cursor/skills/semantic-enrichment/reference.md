# Semantic enrichment reference

## Workflow summary

1. Book + enrichment type (`all` = five fields)
2. Edit `semantic/{glossary,patterns,situations}/*.yml` in scope
3. `make verify-semantic-ontology` (must pass)
4. Branch → commit → push → `gh pr create`

## Enrichment type → YAML field

| Type | Field |
|------|-------|
| `recognition-signals` | `recognitionSignals` |
| `trajectories` | `trajectory` |
| `manifestations` | `manifestations` |
| `counterbalances` | `counterbalances` |
| `questions` | `questions` |
| `all` | all five |

Agent briefs: [docs/agents/semantic/](../../../docs/agents/semantic/)

## Verification (required)

```bash
make verify-semantic-ontology
```

Runs: `validate-semantic-entities`, `verify-semantic-yaml`, `lint-semantic-graph` (warnings OK unless strict), manifest round-trip.

## Book → BOOK_DIR

| book_id | BOOK_DIR |
|---------|----------|
| after-certainty | `books/after-certainty` |
| coupling | `books/coupling` |
| how-meaning-moves | `books/how-meaning-moves` |
| curiosity-before-certainty | `books/curiosity-before-certainty` |
| before-certainty-arrives | `books/before-certainty-arrives` |
| how-serious-systems-learn | `books/how-serious-systems-learn` |
| when-moral-seriousness-scales | `books/when-moral-seriousness-scales` |
| when-authority-is-misread | `books/when-authority-is-misread` |
| when-authority-outlives-accountability | `books/when-authority-outlives-accountability` |
| when-accountability-no-longer-expires | `books/when-accountability-no-longer-expires` |
| when-others-look-to-you-v1 | `books/when-others-look-to-you/v1` |
| when-others-look-to-you-v2 | `books/when-others-look-to-you/v2` |

Discover all ids:

```bash
python3 -c "
from pathlib import Path
import sys
sys.path.insert(0,'tools')
from book_specs import discover_book_spec_paths, discover_upcoming_spec_paths, load_any_book_spec, spec_book_dir
from semantic_enrichment import book_id_from_spec
repo = Path('.')
for p in discover_book_spec_paths(repo) + discover_upcoming_spec_paths(repo):
    print(book_id_from_spec(load_any_book_spec(p)), spec_book_dir(p).relative_to(repo))
"
```

## List entities for a book

```bash
python3 -c "
from pathlib import Path
import sys
sys.path.insert(0,'tools')
from semantic_enrichment import list_book_entities
for et, slug, path in list_book_entities(Path('.'), 'BOOK_ID_HERE'):
    print(et, slug)
"
```

## After Certainty shortcut

Full refresh of curated enrichment on canonical files:

```bash
python3 tools/apply_after_certainty_book_enrichment.py
make verify-semantic-ontology
```

Then PR as usual. Use only for `after-certainty` when type is `all` or user wants a full re-pass.

## Legacy draft workflow

Optional, not used by this skill: `make propose-semantic-enrichment` / `make promote-semantic-enrichment`. See [docs/semantic-graph-evolution.md](../../../docs/semantic-graph-evolution.md).
