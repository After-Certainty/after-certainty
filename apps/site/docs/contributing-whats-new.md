# Contributing to What’s New

What’s New is an authored chronological feed of **meaningful** public changes.

## Public surface (Phase E)

| Surface          | Path                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| Index            | `/whats-new`                                                                      |
| Filters          | `/whats-new?type=books\|revisions\|podcast\|site` (canonical always `/whats-new`) |
| RSS              | `/whats-new/feed.xml`                                                             |
| Homepage preview | “Latest from After Certainty” in the mission/recent section                       |
| Start Here       | Link section                                                                      |
| Footer           | What’s New                                                                        |
| Book pages       | Related events for that book (Phase H) via `findWhatsNewEventsForBook`            |

## Source of truth

- **Authored events:** [`data/whats-new.json`](../data/whats-new.json)
- **Schema / load / validate:** [`lib/whats-new/`](../lib/whats-new/)
- **Do not** create events from git commits, dependency bumps, cover optimization, CI, or `semantic-manifest.json` `generatedAt` alone.

## Event types (V1)

| Type              | Meaning                             | Authored?                | Auto?                       |
| ----------------- | ----------------------------------- | ------------------------ | --------------------------- |
| `book_published`  | New public book / edition available | Yes (seed)               | Optional candidate later    |
| `book_revised`    | Substantial editorial revision      | **Required**             | **Never**                   |
| `book_announced`  | Upcoming book announced             | Yes                      | No                          |
| `podcast_episode` | New episode                         | Yes or confirm candidate | Candidate from podcast feed |
| `site_feature`    | Meaningful site capability          | Yes                      | No                          |

## Adding an event

1. Append an object to `events` in `data/whats-new.json`.
2. Use a stable `id` like `event-book-{slug}-published`.
3. Set `source: "authored"` and `published: true` only when the change should appear publicly.
4. Point `href` at an on-site path when possible (`/explore/books/...`, `/podcast`, `/questions`, …).
5. For books/podcasts, set `entityId` to the graph book id or podcast episode id.
6. Run:

```bash
npm test -- lib/whats-new/
```

## Policy

- Draft books must never appear in public published events.
- Companion editions may be announced as `book_published` with `relatedEditionId` pointing at the primary volume — they are not supersessions.
- Prefer a **small** feed. Not every book in the catalog needs a historical seed entry.
- Book dates in the Phase D seed are editorial approximations until upstream `publicationDate` is populated.
