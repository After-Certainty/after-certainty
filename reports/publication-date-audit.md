# Publication date and change-event audit

Generated as part of the semantic data-quality pass (2026-07-23).

## Evidence rules

Populate `publication_date` / `edition_published_at` / `substantially_revised_at`
only from, in order:

1. Explicit authored publication metadata already in the repository
2. Existing public change events
3. Release records clearly associated with publication (not packaging tags)
4. ISBN, edition, or retailer metadata already stored in the repository
5. Existing publication announcements stored in the corpus
6. A documented editorial record
7. Unknown

Never use: generic Git commit dates, file modification times, manifest generation
dates, most-recent-edit dates, guesswork from neighboring books, or repository
creation dates.

## Substantial revision criteria

`substantially_revised_at` may be set when a public revision includes a major
rewrite, new or reorganized chapters, a changed governing argument, a new edition
replacing an earlier edition, or significant structural/scholarly revision.

It must **not** be set for typo correction, formatting cleanup, cover
optimization, link repair, metadata normalization, manifest regeneration, or CI
changes.

## Dates successfully populated (authored evidence)

| Book | publication_date | Evidence | Authority |
|------|------------------|----------|-----------|
| after-certainty | 2026-01-15 | book.yml + change event | authored |
| curiosity-before-certainty | 2026-02-10 | book.yml + change event | authored |
| when-others-look-to-you-v1 | 2026-03-01 | book.yml + change event | authored |
| how-meaning-moves | 2026-04-01 | book.yml + change event | authored |
| trust-beyond-similarity | 2026-05-20 | book.yml + change event | authored |
| when-others-look-to-you-v2 | 2026-06-01 | book.yml + change event (companion) | authored |

No additional reliable dates were found in this pass. Copyright year `2026` alone
is not treated as a publication date. GitHub release tag `latest` is export
packaging, not book publication.

## Dates still unknown

All other public books remain explicitly unknown, including:

before-certainty-arrives, boundary-conditions, coupling, everyone-knows-love,
how-serious-systems-learn, how-trust-forms, learning-to-see, living-in-sediment,
observer-patterns, the-discipline-of-uncertainty, the-economy-we-dont-experience,
the-game-we-think-we-saw, the-world-we-make-together, velorum, what-we-cannot-see,
when-accountability-no-longer-expires, when-authority-is-misread,
when-authority-outlives-accountability, when-incentives-become-the-moral-language,
when-interpretation-no-longer-matters, when-moral-seriousness-scales,
when-others-become-leaders, when-trust-stops-tracking-reality,
why-collaboration-is-so-hard, why-diversity-matters.

## Conflicting / pending human review

| Book | Notes |
|------|-------|
| when-authority-is-misread | Amazon ASIN B0DWZ2ZFXG present; release date not confirmed in-repo |
| when-authority-outlives-accountability | Amazon ASIN B0GJ3QZQ1V present; release date not confirmed in-repo |

## Change events

Public `book_published` events exist for the six dated books above. No new events
were invented for unknown dates. Books lacking a publication event match the
unknown-date list.
