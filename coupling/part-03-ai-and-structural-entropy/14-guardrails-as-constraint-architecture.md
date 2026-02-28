# 14. Guardrails as Constraint Architecture

## Draft Intent

- Treat guardrails as structural coupling design, not add-on policy text.
- Show how constraints make consequence visible before deployment failure.
- Connect AI-era guardrails to the same responsibility/coupling grammar used across the book.

## Planned Throughline

- Fast generation increases output velocity and error surface at the same time.
- Guardrails convert vague caution into executable constraints, checks, and escalation paths.
- Systems improve when guardrails are tied to redesign-capable ownership boundaries.

## Planned Section Arc

- `## Why Guardrails Became Central`
  - Acceleration and context fragility in LLM-assisted work
  - Limits of "prompt skill" without structural controls
- `## The Constraint Stack`
  - Input constraints (scope, policy, retrieval boundaries)
  - Tool/action constraints (permissions, allow/deny operations)
  - Output constraints (policy checks, structured validation)
  - Runtime monitoring and incident escalation
- `## Evaluation as a Return Path`
  - Pre-deploy evals, canary evals, post-deploy failure review
  - Why eval signal must feed redesign ownership
- `## Guardrails and Accountability`
  - Policy present vs consequence proximity
  - How guardrails fail when nobody owns adjustment authority
- `## Cross-Domain Parallels`
  - Clinical safety checklists and escalation pathways
  - Aviation and incident-review loops
  - Public-sector service controls under legal constraints
- `## Transition to Architectural Cohesion`
  - Move from control layers to boundary design patterns in AI systems

## Citation and Evidence Plan

- NIST AI RMF 1.0
- ISO/IEC 42001
- Model Cards / Datasheets literature
- HELM and model-evaluation literature
- OWASP LLM security/control frameworks

## Key Risk to Manage While Drafting

- Avoid equating guardrails with censorship rhetoric; keep framing on structural learning, safety, and accountable redesign.
