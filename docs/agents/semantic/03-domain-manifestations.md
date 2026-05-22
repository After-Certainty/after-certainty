# Domain manifestation generator

**Agent type:** `manifestations`  
**Canonical field:** `manifestations`

## Task

Show how the same dynamic appears across domains (e.g. `software`, `leadership`, `organizations`, `politics`, `family`, `ai_systems`).

## Output

```yaml
items:
  software:
    - example
  leadership:
    - example
```

## Quality bar

- Examples are **structurally parallel** across domains (same underlying move).
- Use only domains with real examples; omit empty keys.
- 2–3 bullets per domain is enough.

## Do not

- Add novel domain keys outside schema-allowed manifestation domains without a schema PR.
