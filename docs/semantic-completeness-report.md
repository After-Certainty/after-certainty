# Semantic completeness report

Generated coverage report for every public canonical work’s discovery metadata.

## Command

```bash
make report-semantic-completeness
# optional: MANIFEST=build/semantic-manifest.json make report-semantic-completeness
```

Outputs:

- `reports/semantic-completeness.md`
- `reports/semantic-completeness.json`

## Field statuses

| Status | Meaning |
|--------|---------|
| `complete` | Authored and present |
| `missing` | Expected but absent |
| `generated-only` | Present only via extractor associations, not curated overview spine |
| `incomplete` | Present but insufficient |
| `potentially-incorrect` | Conflicts with manuscript signals (e.g. fiction subtitle vs nonfiction type) |
| `not-applicable` | Not expected for this profile |

## Profiles

Expectations differ by `nonfiction`, `fiction`, `poetry`, and `handbook`. Profiles guide the report; they are not a second rigid schema.

## CI

`make validate-discovery-content` prints completeness gaps as **warnings** and does not fail the build for optional enrichment. Hard failures remain reserved for broken IDs, refs, and invalid types.
