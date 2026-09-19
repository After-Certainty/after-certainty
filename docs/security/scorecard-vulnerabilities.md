# OpenSSF Scorecard — Vulnerabilities

Scorecard scans lockfiles and (via OSV) unpinned `requirements.txt` resolves. Native CI audits (`npm audit` on the workspace root, `pip-audit` on `uv.lock`) stay the source of truth for what we install.

## Remediated in-repo

| Finding | Action |
| --- | --- |
| `PYSEC-2026-1374` / `PYSEC-2026-1375` (`filelock`) | Floor pin `filelock>=3.20.3` in `requirements.txt`. Authoritative install is `uv.lock` (`filelock` ≥ 3.20.3 already). |
| `GHSA-fm4j-4xhm-xpwx` / `GHSA-gc25-3vc5-2jf9` (`sandbox`) | Excluded in `tools/vercel-cli/osv-scanner.toml`. Advisories describe abandoned `gf3/sandbox` (<1.0); locked `sandbox@4.x` is Vercel’s unrelated package. |

## Upstream-blocked (`tools/vercel-cli`)

Isolating the Vercel CLI under `tools/vercel-cli` exposes Vercel’s transitive graph to Scorecard. Parents pin exact versions (`js-yaml@4.1.1`, `tar@7.5.7`, `undici@5.28.4` / `5.29.0`, `path-to-regexp`, `minimatch`, `smol-toml`, `ajv`, `@tootallnate/once`). Bumping `vercel` within 59.x does not clear them. We do **not** force npm `overrides` against those pins.

Expect Scorecard Vulnerabilities to remain **0** until Vercel unpins patched versions. Re-scan after each `tools/vercel-cli` Dependabot bump.

## Native audits

- Root / Site CI: `npm audit --audit-level=high` (workspace lock).
- Python CI: `pip-audit` (locked).
- `tools/vercel-cli`: not a blocking `npm audit` gate yet (would fail on the upstream graph above).
