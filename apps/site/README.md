# After Certainty · Site

Intellectual commons surface for **After Certainty** — books metadata, podcast hub, patterns library, and collaboration entry points. Books live in separate repositories; this project consumes exported manifests and stays visually restrained (literary, cinematic, dark-first).

## Stack

- **Next.js** (App Router, React Server Components by default)
- **TypeScript**
- **Tailwind CSS v4** with `@tailwindcss/typography`
- **MDX** via `@next/mdx` + `remark-gfm`
- **next-themes** for appearance (defaults to dark; light tokens included)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see NEXT_PUBLIC_SITE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command          | Purpose                          |
| ---------------- | -------------------------------- |
| `npm run dev`    | Local development                |
| `npm run build`  | Production build                 |
| `npm run start`  | Serve production build           |
| `npm run lint`   | ESLint                           |
| `npm run format` | Prettier write                   |

## Environment

Set **`NEXT_PUBLIC_SITE_URL`** to your canonical domain so metadata, Open Graph, RSS links, and `sitemap.xml` resolve correctly. Production: `https://www.after-certainty.com` (see `.env.example`).

## Content architecture

| Kind             | Location / notes                                             |
| ---------------- | ------------------------------------------------------------ |
| Typed models     | `types/content.ts`                                           |
| Sample manifests | `data/*.json` — replace or sync from CI / books repo output    |
| MDX pages        | `content/mdx/*.mdx`, imported from routes under `app/`          |
| Site copy config | `lib/site-config.ts`                                          |

Wire real manifests by swapping JSON under `data/` or pointing loaders in `lib/content-data.ts` at generated artifacts.

## Dependency updates & security

Keeping libraries and CI Actions current:

| Mechanism | What it does |
| --- | --- |
| **Dependabot version updates** | Weekly PRs for npm and GitHub Actions (see `.github/dependabot.yml`). Minor/patch bumps are grouped; majors stay separate. |
| **Dependabot alerts & security updates** | Enable under GitHub → **Settings → Code security** (Dependabot alerts + Dependabot security updates). Security PRs are not controlled by `dependabot.yml`. |
| **CI `npm audit`** | Fails the build on high+ severity advisories (`.github/workflows/ci.yml`). |

After merging the Dependabot config, confirm those Code security toggles are on so alerts and automatic security-fix PRs work.

Optional: once **Dependency graph** is enabled in the same settings page, you can add GitHub’s [Dependency Review Action](https://github.com/actions/dependency-review-action) to fail PRs that introduce high+ severity vulnerable packages. It cannot run until that setting is on.

## Deployment (Vercel)

1. Connect the repository.
2. Set **NEXT_PUBLIC_SITE_URL** to `https://www.after-certainty.com` in project Environment Variables.
3. Defaults assume Node build (`next build`); output is static-first with prerendered routes.

The podcast RSS URL is `siteConfig.podcastRssUrl` (Anchor). The site **fetches that feed on the server** (`lib/podcast/rss.ts`, cached + **revalidated every hour** via `fetch`); episode lists and the home “latest episode” block use that data. If the feed is unreachable (offline dev, CI, etc.), lists fall back to `data/podcast-episodes.json`. `/feed.xml` still redirects to Anchor for podcast apps.

Explore surfaces (books, patterns, glossary, observatory) load **`semantic-manifest.json`** from the [after-certainty](https://github.com/ksteffe/after-certainty) GitHub release (`latest`), with hourly ISR. A separate **`books-manifest.json`** still feeds legacy catalog helpers; promotion and export URLs for `/explore/books` live in the semantic manifest. After each `main` release, CI POSTs to **`/api/cache/revalidate`** with target **`semantic`** to refresh the graph immediately.

1. Set **`CACHE_REVALIDATE_SECRET`** in Vercel (production) — a long random string.
2. Add the same value as repository secret **`CACHE_REVALIDATE_SECRET`** on `ksteffe/after-certainty` (used by the book export workflow).
3. Optional: set repository variable **`SITE_REVALIDATE_URL`** (default `https://www.after-certainty.com/api/cache/revalidate`).

Example manual refresh:

```bash
curl -sS -X POST "https://www.after-certainty.com/api/cache/revalidate" \
  -H "Authorization: Bearer $CACHE_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"targets":["semantic"]}'
```

## Design notes

- **Serif display**: Cormorant Garamond (`--font-display-serif`)
- **Sans body**: Source Sans 3 (`--font-sans-body`)
- **Accent**: restrained gold via CSS tokens in `styles/tokens.css`
- Layout primitives: `components/ui/*`, shell in `components/layout/*`

## License

Site content and configuration follow the project policy you adopt for the commons; attribute remixes under **CC BY-SA** where noted in the footer.
