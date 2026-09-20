# Documentation index

Technical documentation for the After Certainty monorepo. For a human-facing project overview and the live website, start at the [root README](../README.md) or [www.after-certainty.com](https://www.after-certainty.com).

Planning status and roadmap authority live in [`roadmaps/README.md`](roadmaps/README.md)—that index is **not** a backlog and is not the front door for “how does this repo work?”

---

## Project

| Document | Topic |
|----------|--------|
| [Root README](../README.md) | What After Certainty is; visit links; choose-your-path |
| [`corpus/`](corpus/) | Corpus overview and books path index |
| [`series-guide.md`](series-guide.md) | Reading order, clusters, title pairs |
| [`portfolio-reader-map.md`](portfolio-reader-map.md) | New-reader onboarding |
| [`semantic-manifest-contract.md`](semantic-manifest-contract.md) | Semantic manifest public API |
| [`semantic-relationship-types.md`](semantic-relationship-types.md) | Typed graph edges |
| [`semantic-chapter-identity.md`](semantic-chapter-identity.md) | Chapter IDs / routeKey |
| [`authoring-discovery-metadata.md`](authoring-discovery-metadata.md) | Discovery metadata authoring |
| [`semantic-graph-evolution.md`](semantic-graph-evolution.md) | Graph evolution architecture |
| [`after-certainty-pattern-language.md`](after-certainty-pattern-language.md) | Cross-corpus pattern language |
| [`agents/semantic/`](agents/semantic/) | Semantic enrichment agent briefs |

## Website

| Document | Topic |
|----------|--------|
| [`../apps/site/README.md`](../apps/site/README.md) | Local development, stack, content architecture |
| [`../apps/site/docs/semantic-manifest.md`](../apps/site/docs/semantic-manifest.md) | How the site loads the local manifest |
| [`site-deploy.md`](site-deploy.md) | GitHub Actions → Vercel prebuilt deploy |
| [`../apps/site/docs/contributing-books-catalog.md`](../apps/site/docs/contributing-books-catalog.md) | Books catalog |
| [`../apps/site/docs/contributing-book-overviews.md`](../apps/site/docs/contributing-book-overviews.md) | Book overviews |
| [`../apps/site/docs/contributing-trails.md`](../apps/site/docs/contributing-trails.md) | Trails |
| [`../apps/site/docs/contributing-whats-new.md`](../apps/site/docs/contributing-whats-new.md) | What’s New |
| [`pade-cloud-agent.md`](pade-cloud-agent.md) | PADE broker for Cloud Agents |
| [`../apps/site/docs/seo-analytics-verification.md`](../apps/site/docs/seo-analytics-verification.md) | Post-deploy SEO / analytics checklist |

## Publishing

| Document | Topic |
|----------|--------|
| [`publishing/book-export-pipeline.md`](publishing/book-export-pipeline.md) | DOCX / EPUB / PDF export pipeline |
| [`book-cover-assets.md`](book-cover-assets.md) | Web cover derivative contract |
| [`publishing/ingramspark-operating-procedure.md`](publishing/ingramspark-operating-procedure.md) | IngramSpark package → upload |
| [`publishing/ingramspark-raster-wrap.md`](publishing/ingramspark-raster-wrap.md) | Raster print-cover conversion |
| [`../schema/book.schema.json`](../schema/book.schema.json) | `book.yml` schema |

## Operations

| Document | Topic |
|----------|--------|
| [`task-orchestration.md`](task-orchestration.md) | mise / Turbo / npm / Make / Python map |
| [`site-deploy.md`](site-deploy.md) | Site CI/CD |
| [`../SECURITY.md`](../SECURITY.md) | Security policy |
| [`security/`](security/) | Threat model, hardening, credential-free Cursor, GitHub checklist |
| [`../AGENTS.md`](../AGENTS.md) | Cursor Cloud agent runtime notes |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Contributor paths (corpus vs site) |

## Planning and history

| Document | Topic | Status |
|----------|--------|--------|
| [`roadmaps/remaining-product-roadmap.md`](roadmaps/remaining-product-roadmap.md) | Authoritative remaining work | **Active** |
| [`roadmaps/README.md`](roadmaps/README.md) | Roadmap / planning document hierarchy | Active index |
| [`migrations/`](migrations/) | Monorepo phases 0–8 and related inventories | **Historical** |
| [`roadmaps/monorepo-migration-plan.md`](roadmaps/monorepo-migration-plan.md) | Two-repo → monorepo plan | Historical |
| [`rewrite-plans/`](rewrite-plans/) | How Meaning Moves editorial passes | Historical |
| [`portfolio-audit/`](portfolio-audit/) | May 2026 promotion readiness suite | Historical |
| [`audits/`](audits/) | Citation, structure, and graph audits | Evidence / mixed |
| [`planning/`](planning/) | Pre–Phase 6 remote manifest skill | **Obsolete — do not follow** |
| [`concept-definition-helper-site-changes.md`](concept-definition-helper-site-changes.md) | Shipped concept helper notes | Historical |

Specialized product plans (TTS, Pattern Recognition, site UX) are classified in [`roadmaps/README.md`](roadmaps/README.md).
