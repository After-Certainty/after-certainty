# Recognition signal extractor

**Agent type:** `recognition-signals`  
**Canonical field:** `recognitionSignals`

## Task

From book manuscript and existing pattern/glossary context, propose **observable signs** a reader could notice in real settings (not abstract definitions).

## Inputs

- `BOOK_DIR` with `book.yml` and manuscript markdown
- Canonical entities in scope (`relatedBooks` includes this book)
- Optional: pattern appendix / glossary units (via `make extract-semantic-pattern-drafts` for reference)

## Output

Draft sidecars under `semantic/_drafts/enrichment/<book-id>/recognition-signals/<entity-type>/<slug>.yml`:

```yaml
items:
  - short, concrete signal (one line each)
sourceExcerpt: optional quote or section reference
```

## Quality bar

- Signals are **falsifiable** (someone could notice them or not).
- Avoid duplicating the pattern `observation` verbatim; add situational texture.
- Prefer 3–6 items per entity; merge duplicates on promote.

## Do not

- Write directly to `semantic/glossary|patterns|situations/` without promote.
- Invent slugs not present in canonical YAML.
