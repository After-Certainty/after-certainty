# After Certainty · Site

Intellectual commons surface for **After Certainty** — books metadata, podcast hub, patterns library, and collaboration entry points. Corpus YAML lives in the monorepo root (`books/`, `semantic/`); this app builds from a same-checkout `semantic-manifest.json` (see [`docs/migrations/monorepo-phase-6/`](../../docs/migrations/monorepo-phase-6/) and [`phase-7`](../../docs/migrations/monorepo-phase-7/)).

> **Monorepo note:** This tree is the site source of truth at `apps/site/` inside [`ksteffe/after-certainty`](https://github.com/ksteffe/after-certainty). Prefer installing from the repository root (`npm ci`). Vercel Root Directory should be `apps/site` ([`vercel.json`](./vercel.json)). The former standalone [`after-certainty-site`](https://github.com/ksteffe/after-certainty-site) repository is archived (read-only pointer).

## Stack

- **Next.js** (App Router, React Server Components by default)
- **TypeScript**
- **Tailwind CSS v4** with `@tailwindcss/typography`
- **MDX** via `@next/mdx` + `remark-gfm`
- **next-themes** for appearance (defaults to dark; light tokens included)

## Getting started

From the **monorepo root**:

```bash
npm ci
cp apps/site/.env.example apps/site/.env.local   # optional — see NEXT_PUBLIC_SITE_URL
npm run site:dev:local   # after: npm run corpus:build-manifest && npm run site:install-local-manifest
# or watch corpus YAML while developing:
# npm run site:dev:watch
```

Or from this directory after a root `npm ci` (workspace hoisting):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command          | Purpose                |
| ---------------- | ---------------------- |
| `npm run dev`    | Local development      |
| `npm run build`  | Production build       |
| `npm run start`  | Serve production build |
| `npm run lint`   | ESLint                 |
| `npm run format` | Prettier write         |

## Environment

Set **`NEXT_PUBLIC_SITE_URL`** to your canonical domain so metadata, Open Graph, RSS links, and `sitemap.xml` resolve correctly. Production: `https://www.after-certainty.com` (see `.env.example`).

## Content architecture

| Kind             | Location / notes                                                            |
| ---------------- | --------------------------------------------------------------------------- |
| Typed models     | `types/content.ts`                                                          |
| Manifest data    | `data/local-semantic-manifest.json` (gitignored; installed from root build) |
| Test fixtures    | `test/fixtures/semantic-manifest/` (non-authoritative; unit tests only)     |
| Other site JSON  | `data/*.json` — podcast, shelves, site-owned overlays                       |
| MDX pages        | `content/mdx/*.mdx`, imported from routes under `app/`                      |
| Site copy config | `lib/site-config.ts`                                                        |

Install the real local manifest with `npm run corpus:build-manifest` followed by `npm run site:install-local-manifest`.

## Dependency updates & security

Keeping libraries and CI Actions current:

| Mechanism                                | What it does                                                                                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dependabot version updates**           | Weekly PRs for npm and GitHub Actions (see `.github/dependabot.yml`). Minor/patch bumps are grouped; majors stay separate. TypeScript major upgrades are ignored until the ESLint/Next toolchain supports them. |
| **Dependabot alerts & security updates** | Enable under GitHub → **Settings → Code security** (Dependabot alerts + Dependabot security updates). Security PRs are not controlled by `dependabot.yml`.                                                      |
| **CI `npm audit`**                       | Fails the build on high+ severity advisories (`.github/workflows/ci.yml`).                                                                                                                                      |

After merging the Dependabot config, confirm those Code security toggles are on so alerts and automatic security-fix PRs work.

Optional: once **Dependency graph** is enabled in the same settings page, you can add GitHub’s [Dependency Review Action](https://github.com/actions/dependency-review-action) to fail PRs that introduce high+ severity vulnerable packages. It cannot run until that setting is on.

## Deployment (Vercel)

1. Connect [`ksteffe/after-certainty`](https://github.com/ksteffe/after-certainty); Root Directory `apps/site` (see `vercel.json`).
2. Set **NEXT_PUBLIC_SITE_URL** to `https://www.after-certainty.com`, plus `SEMANTIC_MANIFEST_USE_LOCAL=1` and `SEMANTIC_MANIFEST_OFFLINE=1`.
3. Install/build generate a same-checkout semantic manifest before `next build` — see [`docs/migrations/monorepo-phase-6/`](../../docs/migrations/monorepo-phase-6/).

The podcast RSS URL is `siteConfig.podcastRssUrl` (Anchor). The site **fetches that feed on the server** (`lib/podcast/rss.ts`, cached + **revalidated every hour** via `fetch`); episode lists and the home “latest episode” block use that data. If the feed is unreachable (offline dev, CI, etc.), lists fall back to `data/podcast-episodes.json`. `/feed.xml` still redirects to Anchor for podcast apps.

Explore surfaces (books, patterns, glossary, observatory, questions, trails) load
the same-checkout generated manifest via `data/local-semantic-manifest.json`.
Unit tests use purpose-built fixtures under `test/fixtures/semantic-manifest/`.
There is no committed production fallback under `data/`.
See [`docs/semantic-manifest.md`](docs/semantic-manifest.md) for local manifest
loading, content-type normalization, and `validate:fallback` /
`validate:public-corpus`.
The cache revalidate endpoint is podcast-only.

1. Set **`CACHE_REVALIDATE_SECRET`** in Vercel (production) — a long random string.
2. Add the same value as repository secret **`CACHE_REVALIDATE_SECRET`** on `ksteffe/after-certainty` (used by the book export workflow).
3. Optional: set repository variable **`SITE_REVALIDATE_URL`** (default `https://www.after-certainty.com/api/cache/revalidate`).

Example manual refresh:

```bash
curl -sS -X POST "https://www.after-certainty.com/api/cache/revalidate" \
  -H "Authorization: Bearer $CACHE_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"targets":["podcast"]}'
```

## Design notes

- **Serif display**: Cormorant Garamond (`--font-display-serif`)
- **Sans body**: Source Sans 3 (`--font-sans-body`)
- **Accent**: restrained gold via CSS tokens in `styles/tokens.css`
- Layout primitives: `components/ui/*`, shell in `components/layout/*`

## License

Site content and configuration follow the project policy you adopt for the commons; attribute remixes under **CC BY-SA** where noted in the footer.
