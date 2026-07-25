# Native Reader V1 cohort (READ-010)

**Status:** Resolved  
**Date:** 2026-07-25  
**Decision owner:** Kevin  

## Decision

**All published catalog books with manuscript chapter structure are in the Native Reader V1 cohort.** There is no download-only holdout set among public editions.

Eligibility follows existing corpus rules (not a separate allowlist):

| In reader V1 | Out of reader V1 |
|--------------|------------------|
| Published `books/*` editions with generated `ManifestChapter` rows (`public: true`) | Draft / archived / superseded editions excluded from public structure generation |
| Chapter routes, overview Read CTAs, search, and sitemap when `isChapterSearchEligible` / sitemap eligibility holds | Chapters with `public: false` (404; do not leak) |
| Downloads (EPUB/PDF/DOCX) remain available alongside Read | Upcoming / non-catalog sources without public manuscript structure |

No edition-slug denylist is maintained. New published books that gain manuscript structure enter the reader automatically when the manifest is regenerated.

## Edition slugs in V1 (as of 2026-07-25)

Generated from `build/semantic-manifest.json` — every published `source: books` edition that had public chapters (32 / 32). Empty **out** list for that catalog snapshot.

| Edition slug | Public chapters |
|--------------|----------------:|
| `after-certainty` | 15 |
| `before-certainty-arrives` | 15 |
| `boundary-conditions` | 25 |
| `coupling` | 37 |
| `curiosity-before-certainty` | 14 |
| `everyone-knows-love` | 30 |
| `how-meaning-moves` | 17 |
| `how-serious-systems-learn` | 25 |
| `how-trust-forms` | 15 |
| `learning-to-see` | 19 |
| `living-in-sediment` | 21 |
| `observer-patterns` | 29 |
| `the-discipline-of-uncertainty` | 23 |
| `the-economy-we-dont-experience` | 16 |
| `the-game-we-think-we-saw` | 13 |
| `the-relay` | 31 |
| `the-world-we-make-together` | 16 |
| `trust-beyond-similarity` | 15 |
| `velorum` | 30 |
| `what-we-cannot-see` | 19 |
| `when-accountability-no-longer-expires` | 19 |
| `when-authority-is-misread` | 15 |
| `when-authority-outlives-accountability` | 15 |
| `when-incentives-become-the-moral-language` | 20 |
| `when-interpretation-no-longer-matters` | 15 |
| `when-moral-seriousness-scales` | 17 |
| `when-others-become-leaders` | 15 |
| `when-others-look-to-you-v1` | 25 |
| `when-others-look-to-you-v2` | 18 |
| `when-trust-stops-tracking-reality` | 15 |
| `why-collaboration-is-so-hard` | 10 |
| `why-diversity-matters` | 16 |

**Out for V1 (download-only / no public reader chapters):** none among published catalog editions in that snapshot.

## Implementation note

Site and manifest pipelines already treat public chapters on public books as reader destinations (READ-002+). This document records the product scope decision so agents do not re-introduce a narrower pilot allowlist without an explicit superseding decision.

## Related

- [`docs/semantic-chapter-identity.md`](semantic-chapter-identity.md) — URL and eligibility contract  
- [`docs/roadmaps/remaining-product-roadmap.md`](roadmaps/remaining-product-roadmap.md) — READ-010  
