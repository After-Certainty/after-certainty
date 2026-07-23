# Contributing to What’s New

What’s New is a chronological feed of **meaningful** public changes.

## Public surface

| Surface          | Path                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Index            | `/whats-new`                                                                      |
| Filters          | `/whats-new?type=books\|revisions\|podcast\|site` (canonical always `/whats-new`) |
| RSS              | `/whats-new/feed.xml`                                                             |
| Homepage preview | “Latest from After Certainty”                                                     |
| Book pages       | Related events via `findWhatsNewEventsForBook`                                    |

## Source of truth

| Event kind                                               | Owner               | Location                                                                 |
| -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `book_published` / `book_revised` / corpus announcements | **after-certainty** | `semantic/change-events/` → `changeEvents[]` in `semantic-manifest.json` |
| `podcast_episode` / `site_feature`                       | **this site**       | [`data/site-whats-new.json`](../data/site-whats-new.json)                |

Loaders merge corpus `changeEvents` with site-owned rows in [`lib/whats-new/publicEvents.ts`](../lib/whats-new/publicEvents.ts).

**Do not** create events from git commits, dependency bumps, cover optimization, CI, or `generatedAt` alone.

## Adding a book publication / revision event

Author YAML under after-certainty `semantic/change-events/`, release, then refresh the bundled semantic manifest on this site.

## Adding a podcast or site-feature event

1. Append an object to `events` in [`data/site-whats-new.json`](../data/site-whats-new.json).
2. Use a stable `id` like `event-site-…` or `event-podcast-…`.
3. Set `source: "authored"` and `published: true` only when it should appear publicly.
4. Point `href` at an on-site path when possible.
5. Run:

```bash
npm test -- lib/whats-new/
```

## Policy

- Draft books must never appear in public published events.
- Companion editions may be announced as `book_published` with `relatedEditionId` pointing at the primary volume — they are not supersessions.
- Prefer a **small** feed.
