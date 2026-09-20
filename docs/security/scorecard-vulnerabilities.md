# OpenSSF Scorecard — Vulnerabilities

Scorecard scans lockfiles and (via OSV) unpinned `requirements.txt` resolves.
Native CI audits (`npm audit` on the workspace root, `pip-audit` on `uv.lock`)
stay the source of truth for what the **website** installs.

**Counts are not interchangeable:**

| Source | What it counts | Current (after `vercel@59.23.2` lock refresh) |
| --- | --- | --- |
| OpenSSF Scorecard **Vulnerabilities** | Distinct OSV/GHSA IDs present in scanned lockfiles | **37** advisory IDs (Scorecard check score 0) |
| `npm audit --prefix tools/vercel-cli` | npm’s aggregated vulnerability graph nodes | **29** nodes (1 critical / 15 high / 12 moderate / 1 low) — includes parent `@vercel/*` packages that only inherit child advisories |
| `npm audit --audit-level=high` (repo root) | Website workspace lock only | **0** high+ |

The 37 Scorecard IDs are listed under [Remaining Scorecard advisories](#remaining-scorecard-advisories-37).
npm’s 29 is a different aggregation and must not be treated as “37 fixed” or “37 open” in audit tooling.

## Remediated in-repo

| Finding | Action |
| --- | --- |
| `PYSEC-2026-1374` / `PYSEC-2026-1375` (`filelock`) | Floor pin `filelock>=3.20.3` in `requirements.txt`. Authoritative install is `uv.lock` (`filelock` ≥ 3.20.3 already). |
| `GHSA-fm4j-4xhm-xpwx` / `GHSA-gc25-3vc5-2jf9` (`sandbox`) | Excluded in `tools/vercel-cli/osv-scanner.toml`. Advisories describe abandoned `gf3/sandbox` (<1.0); locked `sandbox@4.x` is Vercel’s unrelated package. |

## Website vs Vercel CLI tooling

| Surface | Path | Verified |
| --- | --- | --- |
| Website runtime / Site CI quality gate | Root `package-lock.json` (workspaces `apps/*`, `packages/*`) | `npm audit --audit-level=high` → 0 high+ (re-run on each triage). Does **not** include `tools/vercel-cli`. |
| Vercel CLI (CI deploy tooling + Cloud Agents) | `tools/vercel-cli/{package.json,package-lock.json}` | Isolated; not an npm workspace. Used for `vercel whoami` / `pull` / `build` / `deploy --prebuilt` in [`.github/workflows/site-ci.yml`](../../.github/workflows/site-ci.yml). |

This document does **not** claim the website is free of all transitive risk beyond what root `npm audit --audit-level=high` reports.

## CLI maintenance status

Locked CLI: **`vercel@59.23.2`** (npm latest as of 2026-09-18). Prior pin was `59.18.0`.

Verified on a fresh `59.23.2` install: the same vulnerable exact pins remain
(`js-yaml@4.1.1`, `tar@7.5.7` / `7.5.11`, `undici@5.28.4` / `5.29.0`,
`path-to-regexp@6.1.0` / `8.2.0` / `8.3.0`, `minimatch@10.1.1`, `smol-toml@1.5.2`,
`ajv@8.6.3`, `@tootallnate/once@2.0.0`). **No Scorecard advisory IDs are resolved
by this bump.** Treat CLI lock refreshes as maintenance + triage, not vulnerability fixes,
until upstream unpins patched versions.

We do **not** force npm `overrides` against Vercel’s exact pins.

## Critical / high advisories — chains, workflow use, mitigations

Site CI / Cloud Agent CLI usage (no deploy exercised in this triage):
`vercel whoami`, `vercel pull`, `vercel build`, `vercel deploy --prebuilt`
against this **Next.js** app (`apps/site`). Builders for Python/Rust/Express/etc.
ship inside the CLI package graph even when unused for this repo’s framework.

Upstream tracking (revisit when closed **and** a published `vercel` release
clears the relevant pin in `tools/vercel-cli/package-lock.json`):

- <https://github.com/vercel/vercel/issues/11543> — insecure transitive packages with available patches (open).
- <https://github.com/vercel/vercel/issues/15176> — `@vercel/fun` still publishes `tar@7.5.7` despite merged bump in `vercel/fun#135` (open).

**Revisit condition:** after each `tools/vercel-cli` Dependabot / manual CLI bump,
re-run `npm audit --prefix tools/vercel-cli` and compare Scorecard’s advisory ID
list; close or update this section only when locked versions meet the patched floors
below.

### `tar` (critical + high)

| GHSA | Severity | Affected (npm) | Need | Locked |
| --- | --- | --- | --- | --- |
| `GHSA-23hp-3jrh-7fpw` | critical | `<=7.5.18` | `>=7.5.19` | `7.5.7`, `7.5.11` |
| `GHSA-r292-9mhp-454m` | high | `<=7.5.20` | `>=7.5.21` | both |
| `GHSA-8x88-c5mf-7j5w` | high | `<=7.5.17` | `>=7.5.18` | both |
| `GHSA-83g3-92jg-28cx` | high | `<7.5.8` | `>=7.5.8` | **`7.5.7` only** (`7.5.11` OK for this ID) |
| `GHSA-qffp-2rhf-9h96` | high | `<=7.5.9` | `>=7.5.10` | **`7.5.7` only** |
| `GHSA-9ppj-qmqm-q256` | high | `<=7.5.10` | `>=7.5.11` | **`7.5.7` only** |

- **Chain:** `vercel` → `@vercel/fun@1.3.0` → `tar@7.5.7`; also `@mapbox/node-pre-gyp` → `tar@7.5.7`; `vercel` → `@vercel/container` → `tar@7.5.11`.
- **Workflow use:** Archive extract/pack paths inside Lambda/container builders. This repo’s Site CI builds a Next.js app and deploys **prebuilt** output; it does not intentionally feed untrusted tar streams into the CLI.
- **Mitigation:** Keep CLI isolated under `tools/vercel-cli`; do not override. Rely on trusted CI checkout + Vercel API deploy. Wait for published `@vercel/fun` / CLI pins ≥ patched floors ([issue 15176](https://github.com/vercel/vercel/issues/15176)).

### `js-yaml` (high)

| GHSA | Severity | Affected (4.x) | Need | Locked |
| --- | --- | --- | --- | --- |
| `GHSA-2883-xcg3-v3hh` | high | `>=4.0.0 <4.3.2` | `>=4.3.2` | `4.1.1` |
| `GHSA-52cp-r559-cp3m` | high | `>=4.0.0 <4.3.0` | `>=4.3.0` | `4.1.1` |
| `GHSA-5p4m-2wfm-xmqj` | high | `>=4.0.0 <4.3.1` | `>=4.3.1` | `4.1.1` |

- **Chain:** `vercel` → `@vercel/python-analysis@0.14.0` → `js-yaml@4.1.1` (exact).
- **Workflow use:** YAML parse in Python analysis helpers. This site is Next.js; python-analysis is not the selected builder for `apps/site`, but the package remains installed with the CLI.
- **Mitigation:** No untrusted YAML is passed into the CLI in Site CI. Website lock separately overrides `js-yaml` to `^4.3.2` (root `package.json`); that does **not** affect the CLI lock. Upstream: [issue 11543](https://github.com/vercel/vercel/issues/11543).

### `minimatch` (high)

| GHSA | Severity | Affected (10.x) | Need | Locked vulnerable |
| --- | --- | --- | --- | --- |
| `GHSA-3ppc-4f35-3m26` | high | `>=10.0.0 <10.2.1` | `>=10.2.1` | `10.1.1` |
| `GHSA-7r86-cg39-jmmj` | high | `>=10.0.0 <10.2.3` | `>=10.2.3` | `10.1.1` |
| `GHSA-23c5-xmqv-rm74` | high | `>=10.0.0 <10.2.3` | `>=10.2.3` | `10.1.1` |

(Also locked: `minimatch@10.2.6` via `glob`, `3.1.5` via `ts-morph` — outside these 10.x ranges / already past 3.1.4 floors.)

- **Chain:** `vercel` → `@vercel/python-analysis@0.14.0` → `minimatch@10.1.1`.
- **Workflow use:** Glob matching in analysis helpers; same Next.js builder note as `js-yaml`.
- **Mitigation:** Trusted repo globs only in CI. Upstream: [issue 11543](https://github.com/vercel/vercel/issues/11543).

### `path-to-regexp` (high)

| GHSA | Severity | Affected | Need | Locked hit |
| --- | --- | --- | --- | --- |
| `GHSA-9wv6-86v2-598j` | high | `>=4.0.0 <6.3.0` | `>=6.3.0` | `6.1.0` |
| `GHSA-j3q9-mxjg-w52f` | high | `>=8.0.0 <8.4.0` | `>=8.4.0` | `8.2.0`, `8.3.0` |

- **Chain:** `@vercel/node` / `@vercel/remix-builder` → `6.1.0`; `@vercel/fun` → `8.2.0`; `@vercel/backends` / `express` / `hono` → `8.3.0`.
- **Workflow use:** Route-pattern compilation inside those builders. Site CI uses `@vercel/next` for this app; Express/Hono/Node server-builder path-to-regexp is not the primary Next compile path, but remains in the installed CLI tree.
- **Mitigation:** No attacker-controlled route patterns fed to the CLI in CI. Upstream: [issue 11543](https://github.com/vercel/vercel/issues/11543), [issue 15176](https://github.com/vercel/vercel/issues/15176) (fun pins).

### `smol-toml` (high)

| GHSA | Severity | Affected | Need | Locked |
| --- | --- | --- | --- | --- |
| `GHSA-7w5x-hrqm-74c2` | high | `<=1.7.0` | `>=1.7.1` | `1.5.2` |

- **Chain:** `vercel` (direct), `@vercel/container`, `@vercel/python-analysis`, `@vercel/rust` → `smol-toml@1.5.2`.
- **Workflow use:** TOML parse (e.g. Cargo / container metadata). Malformed TOML DoS requires hostile input.
- **Mitigation:** CI only parses in-repo / Vercel-provided config. Upstream: [issue 11543](https://github.com/vercel/vercel/issues/11543).

### `undici` (high)

| GHSA | Severity | Affected | Need | Locked hit |
| --- | --- | --- | --- | --- |
| `GHSA-vrm6-8vpv-qv8q` | high | `<6.24.0` (and some 7.x) | `>=6.24.0` / `>=7.24.0` | `5.28.4`, `5.29.0` |
| `GHSA-v9p9-hfj2-hcw8` | high | `<6.24.0` (and some 7.x) | same | `5.28.4`, `5.29.0` |
| `GHSA-vxpw-j846-p89q` | high | `<6.27.0` (and some 7/8.x) | `>=6.27.0` / newer | `5.28.4`, `5.29.0` |

(Also locked: `undici@6.28.1` via `@vercel/blob`, `7.29.1` via `sandbox` — outside these high ranges.)

- **Chain:** `vercel` → `undici@5.29.0`; `@vercel/node` → `undici@5.28.4`.
- **Workflow use:** High findings are WebSocket client issues. Site CI uses HTTPS Vercel API (`whoami` / `pull` / `build` / `deploy --prebuilt`), not an untrusted WebSocket peer.
- **Mitigation:** Prefer env-based auth patterns already documented for agents; no CLI overrides. Upstream: [issue 11543](https://github.com/vercel/vercel/issues/11543).

## Remaining Scorecard advisories (37)

All remain **open** / genuine for the CLI lockfile (plus moderate/low undici/ajv/`@tootallnate/once` / path-to-regexp / tar / smol-toml / js-yaml IDs Scorecard also lists). Do not dismiss them in GitHub.

```
GHSA-vpq2-c234-7xj6  GHSA-2g4f-4pwh-qvx6  GHSA-2883-xcg3-v3hh  GHSA-52cp-r559-cp3m
GHSA-5p4m-2wfm-xmqj  GHSA-h67p-54hq-rp68  GHSA-23c5-xmqv-rm74  GHSA-3ppc-4f35-3m26
GHSA-7r86-cg39-jmmj  GHSA-9wv6-86v2-598j  GHSA-27v5-c462-wpq7  GHSA-j3q9-mxjg-w52f
GHSA-7w5x-hrqm-74c2  GHSA-v3rj-xjv7-4jmq  GHSA-23hp-3jrh-7fpw  GHSA-8x88-c5mf-7j5w
GHSA-gvwx-54wh-qm9j  GHSA-r292-9mhp-454m  GHSA-vmf3-w455-68vh  GHSA-w8wr-v893-vjvp
GHSA-83g3-92jg-28cx  GHSA-9ppj-qmqm-q256  GHSA-qffp-2rhf-9h96  GHSA-2mjp-6q6p-2qxm
GHSA-35p6-xmwp-9g52  GHSA-4992-7rv2-5pvq  GHSA-8xcm-r25x-g524  GHSA-c76h-2ccp-4975
GHSA-cxrh-j4jr-qwg3  GHSA-g8m3-5g58-fq7m  GHSA-g9mf-h72j-4rw9  GHSA-m8rv-5g2x-5cg5
GHSA-p88m-4jfj-68fv  GHSA-v3r7-h72x-cjcm  GHSA-v9p9-hfj2-hcw8  GHSA-vrm6-8vpv-qv8q
GHSA-vxpw-j846-p89q
```

Expect Scorecard Vulnerabilities to stay **0** until Vercel publishes CLI builds that unpin patched versions.

## Native audits

- Root / Site CI: `npm audit --audit-level=high` (workspace lock) — merge gate.
- Python CI: `pip-audit` (locked).
- `tools/vercel-cli`: not a blocking `npm audit` gate (would fail on the upstream graph above).
