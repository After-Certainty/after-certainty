# PADE + Cloud Agent (After Certainty)

After Certainty Cloud Agents use [PADE](https://github.com/After-Certainty/pade) **v0.2.0** with a **private broker** for scoped capabilities. The agent VM carries **no** Google Analytics service-account JSON, GitHub App keys, Vercel tokens, or `KSM_CONFIG`.

## What lives in this repo

| File | Purpose |
|------|---------|
| [`.cursor/environment.json`](../.cursor/environment.json) | Installs released `pade` v0.2.0 and pinned Vercel CLI on Cloud Agent bootstrap |
| [`.cursor/install-pade.sh`](../.cursor/install-pade.sh) | Downloads released `pade` into `.tools/pade` and puts it on `PATH` |
| [`.cursor/install-vercel.sh`](../.cursor/install-vercel.sh) | Installs pinned `vercel@59.3.0` into `.tools/vercel` (binary only; no token) |
| [`pade.yaml`](../pade.yaml) | Portable DevelopmentSession (secret-free Intent) |
| [`.pade/agent-bindings.yaml`](../.pade/agent-bindings.yaml) | Runtime broker endpoint (URL committed by design) |
| [`apps/site/scripts/ga4-*.sh`](../apps/site/scripts/) | GA4 Admin/Data API helpers invoked via `pade exec` |
| [`scripts/pade-smoke.sh`](../scripts/pade-smoke.sh) | End-to-end broker smoke test |

## Capabilities

Configured in [`pade.yaml`](../pade.yaml):

- `github.repo.read` — GitHub repo metadata via broker
- `google-analytics.read` — GA4 Admin + Data API via broker
- `vercel.diagnostics` — ordinary Vercel CLI receives `VERCEL_TOKEN` Material from the broker (inspect / logs / whoami; not deploy)

Broker resolves Cursor OIDC, runs server-side exec providers, and injects process-scoped Material into `pade exec` children (e.g. `GA_ACCESS_TOKEN`, `GA_PROPERTY_ID`, `VERCEL_TOKEN`).

## Broker endpoint

Committed in [`.pade/agent-bindings.yaml`](../.pade/agent-bindings.yaml):

```text
https://pade-broker-754719312452.us-central1.run.app
```

OIDC audience matches the same URL. Allowed Cursor subject: `user:253367178`.

## Analytics workflow

Cloud Agents run the [`ga-trends`](../apps/site/.cursor/skills/ga-trends/SKILL.md) skill via **PADE broker mode**:

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-run-report.sh '<json-body>'
```

Property ID comes from `$GA_PROPERTY_ID` injected by the broker — not hardcoded in scripts or skill payloads.

**Local laptop fallback:** MCP `user-analytics-mcp` + `gcloud auth application-default login` (documented in the skill; not used on Cloud Agents).

## Vercel diagnostics workflow

Cloud Agents run the [`vercel-diagnostics`](../apps/site/.cursor/skills/vercel-diagnostics/SKILL.md) skill via **PADE broker mode**. The Vercel CLI is on `PATH` (no token). Wrap every diagnostic command:

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.diagnostics --quiet -- \
  vercel whoami
```

`$VERCEL_TOKEN` is injected only into the `pade exec` child. Do **not** export it into the agent shell, pass `--token`, run `vercel login`, or use Vercel MCP on Cloud Agents.

**Local laptop fallback:** a logged-in `vercel` CLI. Cloud Agents must not use that path.

## Smoke test

From repo root on a Cloud Agent VM (identity socket required):

```bash
make pade-smoke
# or: bash scripts/pade-smoke.sh
```

Expect:

- `pade --version` → `v0.2.0`
- `vercel --version` → `59.3.0`
- `pade capabilities` → `github.repo.read`, `google-analytics.read`, and `vercel.diagnostics` all `provider: broker`, configured
- Property meta + minimal GA report succeed
- `pade exec … vercel whoami` succeeds (never prints `$VERCEL_TOKEN`)

### Full ga-trends report pack

End-to-end test of the [`ga-trends`](../apps/site/.cursor/skills/ga-trends/SKILL.md) skill via PADE broker (prints markdown brief to stdout):

```bash
make ga-trends-test
# or: bash scripts/ga-trends-test.sh
```

The pack is **13 core reports** plus realtime screens (8b) and optional custom-dimension breakdowns (14–15). Brief rendering lives in [`tools/ga_trends_brief.py`](../tools/ga_trends_brief.py). Reports run sequentially with brief pauses (`PADE_PAUSE=0.75` default) to avoid broker identity-mint contention. Override: `PADE_PAUSE=1.5 make ga-trends-test`.

## Environment builds

After changing [`.cursor/environment.json`](../.cursor/environment.json), [`.cursor/install-pade.sh`](../.cursor/install-pade.sh), or [`.cursor/install-vercel.sh`](../.cursor/install-vercel.sh), trigger an **environment build** or start a **new** Cloud Agent for the install to take effect.

## Security

- No secrets in `environment.json`, skills, or committed bindings (broker URL only).
- Never echo `$GA_ACCESS_TOKEN` or `$VERCEL_TOKEN` in logs, chat, or PR descriptions.
- Do not run `vercel env pull` on Cloud Agents (would persist secrets on disk).
- On 401/403 from broker: `pade identity --audience <broker-url>` and verify policy subject.

See also: [credential-free Cursor development](security/credential-free-cursor.md).
