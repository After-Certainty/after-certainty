# PADE + Cloud Agent (After Certainty)

After Certainty Cloud Agents use [PADE](https://github.com/ksteffe/pade) **v0.1.0** with a **private broker** for scoped capabilities. The agent VM carries **no** Google Analytics service-account JSON, GitHub App keys, or `KSM_CONFIG`.

## What lives in this repo

| File | Purpose |
|------|---------|
| [`.cursor/environment.json`](../.cursor/environment.json) | Installs released `pade` v0.1.0 on Cloud Agent bootstrap |
| [`pade.yaml`](../pade.yaml) | Portable DevelopmentSession (secret-free Intent) |
| [`.pade/agent-bindings.yaml`](../.pade/agent-bindings.yaml) | Runtime broker endpoint (URL committed by design) |
| [`apps/site/scripts/ga4-*.sh`](../apps/site/scripts/) | GA4 Admin/Data API helpers invoked via `pade exec` |
| [`scripts/pade-smoke.sh`](../scripts/pade-smoke.sh) | End-to-end broker smoke test |

## Capabilities

Configured in [`pade.yaml`](../pade.yaml):

- `github.repo.read` — GitHub repo metadata via broker
- `google-analytics.read` — GA4 Admin + Data API via broker

Broker resolves Cursor OIDC, runs server-side exec providers, and injects process-scoped Material into `pade exec` children (e.g. `GA_ACCESS_TOKEN`, `GA_PROPERTY_ID`).

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

## Smoke test

From repo root on a Cloud Agent VM (identity socket required):

```bash
make pade-smoke
# or: bash scripts/pade-smoke.sh
```

Expect:

- `pade --version` → `v0.1.0`
- `pade capabilities` → both capabilities `provider: broker`, configured
- Property meta + minimal GA report succeed

### Full ga-trends report pack

End-to-end test of the [`ga-trends`](../apps/site/.cursor/skills/ga-trends/SKILL.md) skill via PADE broker (prints markdown brief to stdout):

```bash
make ga-trends-test
# or: bash scripts/ga-trends-test.sh
```

Reports run sequentially with brief pauses (`PADE_PAUSE=0.75` default) to avoid broker identity-mint contention. Override: `PADE_PAUSE=1.5 make ga-trends-test`.

## Environment builds

After changing [`.cursor/environment.json`](../.cursor/environment.json) or [`.cursor/install-pade.sh`](../.cursor/install-pade.sh), trigger an **environment build** or start a **new** Cloud Agent for the install to take effect.

## Security

- No secrets in `environment.json`, skills, or committed bindings (broker URL only).
- Never echo `$GA_ACCESS_TOKEN` in logs, chat, or PR descriptions.
- On 401/403 from broker: `pade identity --audience <broker-url>` and verify policy subject.

See also: [credential-free Cursor development](security/credential-free-cursor.md).
