# Phase 7 manual checklist

Maintainer steps that cannot be completed from the surviving-repo PR alone.

## Before archive

- [ ] Confirm production Vercel Git repository is `ksteffe/after-certainty` (Root Directory `apps/site`)
- [ ] Confirm no open PRs/issues that still need work on `after-certainty-site` (Phase 7 start: 0 / 0)
- [ ] Merge survivor Phase 7 PR (docs + link sweep) on `after-certainty`
- [ ] Update `after-certainty-site` README with banner from [`archive-readme-banner.md`](./archive-readme-banner.md)
  - Option A: edit on GitHub UI and commit to `main`
  - Option B: merge a short PR that only changes the README

## Archive

- [ ] GitHub → [`after-certainty-site`](https://github.com/ksteffe/after-certainty-site) → **Settings** → **Danger Zone** → **Archive this repository**
- [ ] Confirm the repo shows the **Archived** banner and is read-only

## After archive

- [ ] Open https://github.com/ksteffe/after-certainty/tree/main/apps/site and confirm it is the documented entry point
- [ ] Sweep personal/org bookmarks, Notion, and external docs that clone `after-certainty-site`
- [ ] Optional: mark roadmap Phase 7 complete in a follow-up commit once the GitHub archive succeeds

## Do not

- [ ] Delete the repository (archive only)
- [ ] Remove GitHub Releases/issues history
- [ ] Change production domain or Vercel project settings as part of archive
