# When Others Become Leaders — Drafting Process

## Purpose

Workflow for planning, researching, and revising *When Others Become Leaders* while preserving essayistic discovery and historical complexity.

## Key references

- [`book-rules.md`](book-rules.md) — non-negotiable constraints and cautions
- [`status.md`](status.md) — unit progress and active priorities
- [`outline.md`](outline.md) — authoritative chapter order and chapter-level planning fields
- [`voice-guide.md`](voice-guide.md) — prose rhythm and anti-pattern checks
- [`research-plan.md`](research-plan.md) — source strategy and verification standards

## Branch naming

Use phase-scoped branches when active work continues:

- `cursor/when-others-become-leaders-planning-ba72` (current)
- `upcoming/when-others-become-leaders-research`
- `upcoming/when-others-become-leaders-editorial`

## Edition policy

**Length locked at ~50k words** (July 2026). Editorial passes compress and sharpen; they do not expand toward a 70–90k band.

## Phases

### Phase 0 — Planning scaffold ✓

- Finalize foundational docs in `docs/`.
- Align title/subtitle/chapter ordering across planning files.
- Record open decisions in [`open-questions.md`](open-questions.md).

### Phase 1 — Research architecture (current)

- Build chapter-by-chapter source packets from [`research-plan.md`](research-plan.md).
- Establish a claims ledger: each factual claim maps to at least one reliable source.
- Gather sources that complicate heroic narratives and surface limits/criticisms.
- Replace seeded footnotes with verified citations.
- Expand bibliography from working stub.

### Phase 2 — Unit passes

For each chapter, intro, epilogue, and front-matter unit:

1. **Rules check** — alignment with [`book-rules.md`](book-rules.md).
2. **Echo pass** — repeated phrasing, claims, and examples against prior units.
3. **Editorial pass** — clarity, rhythm, staccato reflow where not intentional ([`voice-guide.md`](voice-guide.md)).
4. **Self-critique** — top weaknesses and concrete fixes.
5. **Citation pass** — footnotes at structural pivots; verified sources only.
6. **Linkage check** — [`index.md`](../index.md) and internal links resolve.
7. **Status update** — unit row in [`status.md`](status.md).

Pause for author review between units unless explicitly told to continue.

### Phase 3 — Part coherence gate

After all units in a part are at least `draft`:

- Part opener-to-chapter continuity (bridges may expand lightly).
- Chapter-to-chapter progression within the part.
- Consistent terminology and confidence level.
- Example and figure distribution.

### Phase 4 — Manuscript-wide editorial

- Structural cohesion across parts.
- Global echo and compression pass.
- Full copy edit.
- Citation integrity and bibliography completeness.
- Resolve or defer remaining items in [`open-questions.md`](open-questions.md).
- Optional reader-facing front matter (author's note, how-to-read) before promote.

### Phase 5 — Promote to `books/`

When manuscript is mature and author read-through is complete:

- Copy to `books/when-others-become-leaders/`.
- Enable `publishing.enabled` and `build.formats.*` in `book.yml`.
- Export smoke test (`make build-book DIR=books/when-others-become-leaders`).
- Update [`upcoming/docs/portfolio-status.md`](../../docs/portfolio-status.md) and series guide.
- Add WOLTY differentiation blurb if not already in index/front matter.

## Commit discipline

- Keep planning/research infra changes separate from prose-drafting commits.
- Update [`status.md`](status.md) whenever phase or priorities change materially.
- Preserve unresolved decisions in [`open-questions.md`](open-questions.md) rather than hard-coding assumptions.

## Current starting phase

See [`status.md`](status.md) — **Phase 2 — Unit passes** (Phase 1 research complete).
