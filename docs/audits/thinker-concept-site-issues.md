# Thinker concept site follow-ups (after-certainty-site)

Draft issues for the consumer site repo (`ksteffe/after-certainty-site`). These are not blocking for manifest v2 compatibility.

## 1. Thinker detail page — concept coverage panel

**Problem:** Thinker pages can describe conceptual terrain in prose while `thinkers[].concepts` is empty or thinner than the thinker's works.

**Proposal:** On thinker detail pages, show:
- Current thinker-level concepts (from manifest)
- Union of concepts from linked works (`works[]`)
- Optional dev-only badge when thinker concepts are empty but work concepts exist

## 2. Dev tooling — surface audit candidates

**Problem:** Graph-quality gaps (missing concepts, suspicious associations) are only visible by running `make audit-thinker-concepts` in the source repo.

**Proposal:** In local dev or CI preview for the site, ingest `reports/thinker-concept-audit.md` (or a JSON export) and surface:
- Thinkers with empty concepts
- Candidate missing concepts per thinker
- Suspicious current concepts flagged for human review

## 3. JSON-LD — thinker `knowsAbout` / `about`

**Problem:** Thinker pages may not expose concept associations to search engines.

**Proposal:** When `thinkers[].concepts` is non-empty, emit JSON-LD `knowsAbout` (or schema.org `about`) using concept titles from the glossary manifest, linked to concept explore URLs.

## 4. Explore — thinker concept filters

**Problem:** Readers cannot browse thinkers by conceptual terrain.

**Proposal:** Add optional concept filter on `/explore/thinkers` using manifest thinker concepts (parallel to source concept filters).
