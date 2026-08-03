# Roadmaps and planning documents

**Last audited:** 2026-08-03 (provider-neutral TTS roadmap revision; explore discovery mobile redesign complete, Phases 0–6)

This index orients agents and maintainers. It is **not** a backlog.

## Authority hierarchy

| Role | Document |
|------|----------|
| **Authoritative remaining work** | [`remaining-product-roadmap.md`](remaining-product-roadmap.md) |
| **Editorial portfolio status** | [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) + per-book `books/*/docs/status.md` |
| **IngramSpark day-to-day use** | [`docs/publishing/ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md) |

**Rules**

1. **Code, tests, and current reports override planning-time snapshots.** Do not treat mid-document “current state” tables in historical plans as live truth.
2. **Do not create a second master roadmap.** New product/platform work belongs in the remaining-product roadmap (or as a specialized plan that links there for unfinished follow-ups).
3. **Per-book editorial, rewrite, and vignette plans stay outside the product roadmap** unless they create a shared capability or cross-book operational requirement.
4. **Generated reports are evidence**, not automatic commitments. Warnings do not become tasks by default.

## Document inventory (concise)

### Active authoritative roadmap

| Path | Topic | Classification |
|------|-------|----------------|
| [`remaining-product-roadmap.md`](remaining-product-roadmap.md) | Remaining cross-layer product, corpus, ops work | **active-authoritative-roadmap** |

### Active specialized plans

| Path | Topic | Classification |
|------|-------|----------------|
| [`elevenlabs-tts-pilot.md`](elevenlabs-tts-pilot.md) | Provider-neutral chapter TTS for native reader (ElevenLabs first adapter; credit/usage-bounded pilot) | **active-specialized-plan** (Phases 0–8 not started) |

### Complete specialized site plans

| Path | Topic | Classification |
|------|-------|----------------|
| [`apps/site/docs/roadmaps/explore-discovery-mobile-redesign.md`](../../apps/site/docs/roadmaps/explore-discovery-mobile-redesign.md) | Concepts, thinkers, sources, situations, questions, trails mobile UX (+ thinkers/sources filter+sort) | **complete-specialized-site-plan** (Phases 0–6) |
| [`apps/site/docs/roadmaps/patterns-mobile-redesign.md`](../../apps/site/docs/roadmaps/patterns-mobile-redesign.md) | Patterns index + Pattern detail mobile UX redesign | **complete-specialized-site-plan** (Phases 1–6) |
| [`apps/site/docs/roadmaps/books-reader-redesign.md`](../../apps/site/docs/roadmaps/books-reader-redesign.md) | Books index, shelves, detail, native reader UX redesign | **complete-specialized-site-plan** (A–G; deferred highlights / visual-regression / Safari manual checks) |

### Completed historical roadmaps / migration records

| Path | Topic | Classification |
|------|-------|----------------|
| [`monorepo-migration-plan.md`](monorepo-migration-plan.md) | Two-repo → monorepo (Phases 0–8) | completed-migration-record |
| [`ingramspark-distribution-target.md`](ingramspark-distribution-target.md) | IngramSpark submission-kit design + delivery | completed-historical-plan |
| [`apps/site/docs/roadmaps/global-search-plan.md`](../../apps/site/docs/roadmaps/global-search-plan.md) | Global Search V1 design | completed-historical-plan |
| [`apps/site/docs/roadmaps/start-with-a-question-plan.md`](../../apps/site/docs/roadmaps/start-with-a-question-plan.md) | Questions / paths discovery | completed-historical-plan |
| [`apps/site/docs/roadmaps/canonical-status-whats-new-book-overviews-plan.md`](../../apps/site/docs/roadmaps/canonical-status-whats-new-book-overviews-plan.md) | Editions, What’s New, overviews | completed-historical-plan |
| [`docs/migrations/monorepo-phase-*/`](../migrations/) | Per-phase completion records | completed-migration-record |
| [`docs/rewrite-plans/`](../rewrite-plans/) | How Meaning Moves rewrite passes | completed-historical-plan (editorial) |

### Living operating procedures

| Path | Topic | Classification |
|------|-------|----------------|
| [`docs/publishing/ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md) | Package → upload lifecycle | living-operating-procedure |
| [`docs/publishing/ingramspark-raster-wrap.md`](../publishing/ingramspark-raster-wrap.md) | Raster cover conversion | living-operating-procedure |
| [`apps/site/docs/roadmaps/search-quality-workflow.md`](../../apps/site/docs/roadmaps/search-quality-workflow.md) | Search alias / ranking quality | living-operating-procedure |
| [`apps/site/docs/contributing-*.md`](../../apps/site/docs/) | Site content contribution guides | living-operating-procedure |

### Living contracts and architecture references

| Path | Topic | Classification |
|------|-------|----------------|
| [`docs/semantic-manifest-contract.md`](../semantic-manifest-contract.md) | Manifest public API | living-contract-or-authoring-guide |
| [`docs/semantic-chapter-identity.md`](../semantic-chapter-identity.md) | Chapter IDs / routeKey | living-contract-or-authoring-guide |
| [`docs/semantic-relationship-types.md`](../semantic-relationship-types.md) | Typed graph edges | living-contract-or-authoring-guide |
| [`docs/book-cover-assets.md`](../book-cover-assets.md) | Cover derivative contract | living-contract-or-authoring-guide |
| [`docs/authoring-discovery-metadata.md`](../authoring-discovery-metadata.md) | Discovery metadata authoring | living-contract-or-authoring-guide |

### Deferred evaluations / spikes

| Path | Topic | Classification |
|------|-------|----------------|
| [`apps/site/docs/roadmaps/search-embeddings-evaluation.md`](../../apps/site/docs/roadmaps/search-embeddings-evaluation.md) | When to add embeddings | deferred-evaluation-or-spike |
| [`apps/site/docs/offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md) | Offline/PWA — defer (no-ship) | deferred-evaluation-or-spike |

### Reports and audits (evidence)

| Path | Topic | Classification |
|------|-------|----------------|
| [`reports/`](../../reports/) | Enrichment gaps, publication dates, graph audits | active-audit-or-generated-gap-report |
| [`docs/audits/`](../audits/) | Historical and draft audits | active-audit-or-generated-gap-report / completed-historical-plan |
| [`docs/security/`](../security/) | Threat model, hardening, GitHub settings checklist | living-operating-procedure / reference-only |

### Obsolete or weak SoT

| Path | Topic | Classification |
|------|-------|----------------|
| [`docs/planning/refresh-manifest-SKILL.md`](../planning/refresh-manifest-SKILL.md) | Remote manifest pull (pre–Phase 6) | stale-or-obsolete |
| [`docs/planning/site-skill-refresh-manifest-update.md`](../planning/site-skill-refresh-manifest-update.md) | Companion note | stale-or-obsolete |
| [`docs/audits/follow-up-issues-backlog.md`](../audits/follow-up-issues-backlog.md) | May 2026 promotion suggestions | stale-or-obsolete (prefer portfolio-status + remaining roadmap) |
| [`docs/portfolio-audit/`](../portfolio-audit/) | May 2026 suite | completed-historical-plan |

### Per-book editorial plans

Remain under `books/*/docs/` and `docs/rewrite-plans/`. They are **per-book-editorial-plan** documents and are not owned by the product roadmap.
