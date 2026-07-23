# Content-type and literary-form corrections (semantic enrichment pass)

Date: 2026-07-22

Ownership: authored in `books/*/book.yml` (`content_type`, optional `literary_form`).
Public projection: `books[].contentType`, `books[].literaryForm`, `works[].contentType`.

## Corrections

| Book | Before | After | Evidence |
|------|--------|-------|----------|
| `boundary-conditions` | default `nonfiction` (unset) | `content_type: fiction`, `literary_form: novel` | Subtitle: “A Literary Organizational Fiction Novel”; about-this-book treats it as organizational fiction |
| `observer-patterns` | default `nonfiction` + `kind: poetry` | `content_type: poetry`, `literary_form: poetry_collection` | `kind: poetry`; introduction: “Not instructions. Not arguments.” |
| `before-certainty-arrives` | already `nonfiction` | keep `nonfiction`, add `literary_form: monograph` | Historical-philosophical essay edition; how-to-read rejects progress narratives and instruction; **not** fiction |
| `living-in-sediment` | already `nonfiction` | keep `nonfiction`, add `literary_form: monograph` | Four-part institutional sediment monograph |
| `the-relay` | `fiction` | add `literary_form: novel` | Already fiction; form made explicit |
| `velorum` | `fiction` | add `literary_form: novel` | Already fiction; form made explicit |
| `how-serious-systems-learn` | `handbook` | add `literary_form: handbook` | Explicit handbook |
| `the-discipline-of-uncertainty` | `handbook` | add `literary_form: handbook` | Explicit handbook |

## Priority nonfiction monographs (content_type set explicitly)

`the-world-we-make-together`, `why-collaboration-is-so-hard`, `learning-to-see`, `the-game-we-think-we-saw`, `the-economy-we-dont-experience` — set to `nonfiction` + `literary_form: monograph` from manuscript form (prose essay volumes with parts/chapters).

## Schema note

`content_type` enum extended with `poetry`. Optional `literary_form` enum: `novel`, `poetry_collection`, `monograph`, `handbook`, `essay_collection`, `field_notes`, `other`.

`kind: prose|poetry` remains a build/format concern and stays orthogonal to public catalog type.
