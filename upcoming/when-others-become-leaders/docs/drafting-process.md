# When Others Become Leaders — Drafting Process

## Purpose

Workflow for planning, researching, and drafting *When Others Become Leaders* while preserving essayistic discovery and historical complexity.

## Key references

- [`book-rules.md`](book-rules.md) — non-negotiable constraints and cautions
- [`status.md`](status.md) — unit progress and active priorities
- [`outline.md`](outline.md) — authoritative chapter order and chapter-level planning fields
- [`voice-guide.md`](voice-guide.md) — prose rhythm and anti-pattern checks
- [`research-plan.md`](research-plan.md) — source strategy and verification standards

## Branch naming

Use phase-scoped branches when active drafting begins:

- `upcoming/when-others-become-leaders-structure`
- `upcoming/when-others-become-leaders-draft`
- `upcoming/when-others-become-leaders-editorial`

## Phases

### Phase 0 — Planning scaffold (current)

- Finalize foundational docs in `docs/`.
- Align title/subtitle/chapter ordering across all planning files.
- Record open decisions in [`open-questions.md`](open-questions.md) instead of silently resolving.

### Phase 1 — Research architecture

- Build chapter-by-chapter source packets from [`research-plan.md`](research-plan.md).
- Establish a claims ledger: each factual claim maps to at least one reliable source.
- Gather sources that complicate heroic narratives and surface limits/criticisms.

### Phase 2 — Outline-to-prose pilots

- Draft introduction and 1-2 chapter openings using [`chapter-architecture.md`](chapter-architecture.md).
- Keep central figure entry delayed until the chapter question has formed.
- Run voice checks against [`voice-guide.md`](voice-guide.md) after each pilot section.

### Phase 3 — Chapter drafting loop

For each chapter:

1. Draft opening object/mystery movement.
2. Expand associative exploration and counterpoints.
3. Introduce central figure later in the arc.
4. Draft choices/consequences plus complications/limitations.
5. Surface leadership pattern near ending, then resonate back to opening image.
6. Update source ledger and `status.md`.

### Phase 4 — Coherence and integrity pass

- Ensure patterns emerge through experience, not framework-first exposition.
- Verify no chapter implies moral equivalence among unlike contexts.
- Check all controversial claims against reliable sources.
- Remove repeated prose where cross-links suffice.

### Phase 5 — Manuscript packaging (future)

- Promote from `upcoming/` into `books/` when manuscript is mature.
- Add publication-facing assets (`book.yml`, front/back matter export wiring) in a separate change set.

## Commit discipline

- Keep planning/research infra changes separate from prose-drafting commits.
- Update [`status.md`](status.md) whenever phase or priorities change materially.
- Preserve unresolved decisions in [`open-questions.md`](open-questions.md) rather than hard-coding assumptions.

## Current starting phase

See [`status.md`](status.md) — **Phase 0 — Planning foundation scaffold**.
