# Trajectory extractor

**Agent type:** `trajectories`  
**Canonical field:** `trajectory`

## Task

Model how a pattern or situation **evolves over time**: early signs, intensification, failure modes, restoration paths.

## Output

```yaml
items:
  earlySignals: []
  intensificationSignals: []
  failureModes: []
  restorationPaths: []
```

## Quality bar

- Each phase has 2–4 concise bullets when possible.
- `failureModes` describe systemic lock-in, not moral judgment.
- `restorationPaths` stay actionable (counter fatalism).

## Do not

- Collapse all phases into a single list (use the four keys).
- Promote empty phase objects.
