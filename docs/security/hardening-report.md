# Security hardening report

## 1. Executive summary

The highest realistic risks were: (a) release publication sharing a write-capable
token with general-purpose Python build code, (b) cache-revalidation Bearer tokens
sent to a repository-variable URL, (c) Actions pinned only to mutable tags, and
(d) credential-shaped strings leaking from authenticated git remotes into
manifests. This change set adds overlapping secret detection, splits prepare vs
publish jobs, hardcodes the revalidate allowlist, locks Python deps, pins Actions
and Typst digests, contains file paths, hardens agent enrichment, and documents
manual GitHub settings. The repository is **not** “secure” in absolute terms;
risks were reduced under stated assumptions.

## 2. Threat model

See [threat-model.md](threat-model.md).

## 3. File-by-file change summary

| Path | Why |
|---|---|
| `.gitleaks.toml` | Local/CI secret scanner config |
| `.pre-commit-config.yaml` | Add Gitleaks hook |
| `tools/scan_generated_secrets.py` | Scan generated artifacts (incl. DOCX/EPUB members) |
| `tests/test_scan_generated_secrets.py` | Scanner unit tests |
| `tests/test_fake_credential_remote.py` | Fake authenticated remote regression |
| `scripts/revalidate_site_cache.sh` | Exact URL allowlist; no redirects with auth |
| `scripts/publish_latest_release.sh` | Narrow audited release publisher |
| `scripts/prepare_release_staging.sh` | Read-only staging + secret scan + checksums |
| `scripts/write_sha256sums.sh` | Release asset digests |
| `scripts/check_clean_tree.sh` | Fail on unexpected tracked changes |
| `scripts/install_typst.sh` / `typst.sha256` | Checksum-verified Typst install |
| `tests/test_revalidate_site_cache.py` | URL allowlist tests |
| `tests/test_install_typst.py` | Wrong-digest rejection |
| `tools/path_safety.py` + tests | Path containment helper |
| `scripts/frontmatter_gen.py`, `build.py`, `diagram_rasterize.py`, `manifest_books.py`, `semantic_enrichment.py` | Apply containment |
| `.github/workflows/*` | Permissions, prepare/publish split, pins, scanners |
| `pyproject.toml` + `uv.lock` | Locked reproducible deps |
| `requirements.txt` | Readable deps; lock is authoritative |
| `.github/dependabot.yml` | uv + Actions updates |
| `.github/CODEOWNERS` | Ownership for sensitive paths |
| `SECURITY.md` + `docs/security/*` | Policy, threat model, checklists, Cursor guidance |
| `.devcontainer/devcontainer.json` | Credential-free default container |

## 4. Workflow permission matrix

| Workflow / job | Permissions | Token availability | Repo Python executes? | Can publish/modify repo? |
|---|---|---|---|---|
| book-export / semantic-yaml, detect, export, prepare-* | `contents: read` | Read token only on prior-release download step | Yes (prepare/export) | No |
| book-export / publish-* | `contents: write` | `GH_TOKEN` on publish step; revalidate secret on revalidate step | No (shell only) | Yes (release + revalidate) |
| python-tests / all jobs | `contents: read` | None | Yes | No |
| typography | `contents: read` | None | Yes | No |
| semantic-enrichment | job: `contents: write`, `pull-requests: write` | Token only on push/PR step | Yes without token on scaffold; with token on publish | Branch + PR only |
| CodeQL / Scorecards | read + security-events (analyze) | OIDC for scorecard publish | N/A | SARIF only |

## 5. Verification evidence

Commands run in the hardening environment (no production credentials, no releases):

| Command | Result |
|---|---|
| `uv sync --frozen` | OK — lock resolved |
| `uv run ruff check/format --check tools scripts tests` | Passed |
| `uv run pytest tests/ -q` | 180 passed, 3 skipped |
| `uv run pip-audit` | No known vulnerabilities found |
| Manifest generation + `scan_generated_secrets.py build/` | No secret findings |
| `tests/test_fake_credential_remote.py` | Passed (remote restored) |
| `tests/test_revalidate_site_cache.py` | Passed (allowlist + dry-run + max-redirs) |
| `tests/test_install_typst.py` | Passed (wrong digest rejected) |
| `tests/test_path_safety.py` | Passed |
| Representative Pandoc export | Skipped locally (pandoc not installed); covered by CI export job |
| `scripts/check_clean_tree.sh` | Intended for clean CI checkouts after tests |

Fake credentials used in tests are unmistakably synthetic (`TESTONLY_NOT_A_SECRET_…`) and injected only at runtime.

## 6. Manual follow-up

See [github-settings-checklist.md](github-settings-checklist.md).

## 7. Deferred recommendations

- GitHub artifact attestations (mutable `latest` undermines strong provenance)
- Immutable dated release tags alongside `latest`
- Pinning apt package versions for Pandoc/TeX
- Expanding secret patterns beyond GitHub-shaped tokens (keep custom tests)
