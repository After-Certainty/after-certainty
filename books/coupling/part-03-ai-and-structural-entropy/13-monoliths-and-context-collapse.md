# 13. Monoliths and Context Collapse

## Draft Intent

- Show how AI-era codebases can reproduce pre-hexagonal failure modes at higher speed: low cohesion modules, accidental tight coupling, entropy without boundary discipline.

## Planned Throughline

- Low cohesion modules: unrelated concerns merged because generation is cheap
- Accidental tight coupling: shared prompts, shared tools, implicit dependencies across services
- Entropy at machine speed: independently evolving generated surfaces without adapter discipline

## Planned Section Arc

- `## Context Collapse as Boundary Failure`
- `## Monoliths by Accumulation`
- `## Hidden Coupling in Assisted Workflows`
- `## Structural Parallels to Pre-AI Integration Debt`
- `## Transition to Guardrails` (Ch 14)

## Coordination Notes

- Connect to Ch 11 hexagonal logic: partial information and interface drift are normal; architecture spends discipline at boundaries.
- Avoid distributed-systems jargon; use "hidden coupling" in software sense already established in Part II.
