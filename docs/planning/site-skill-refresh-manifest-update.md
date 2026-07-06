# Site skill update: refresh-manifest

Apply this to `after-certainty-site/.cursor/skills/refresh-manifest/SKILL.md` when merging thinkers/sources manifest support.

See the full updated skill content in the after-certainty PR branch or copy from this file's target state.

## GitHub issue

Track via: https://github.com/ksteffe/after-certainty-site/issues (create if not present)

## Key additions

1. Description mentions v1.5 enriched sources and v2 `thinkers[]`
2. Manifest version / entity count checks (`manifestVersion`, `thinkers`, enriched `creatorSlugs`)
3. Run `npm test -- lib/graph/manifest.test.ts` before commit
4. Link upstream migration doc and site issues #39–#45
5. Troubleshooting when Zod validation fails on new fields
