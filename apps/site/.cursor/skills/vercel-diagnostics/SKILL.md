---
name: vercel-diagnostics
description: >-
  Runs Vercel CLI diagnostics for After Certainty via PADE v0.2.0 broker on
  Cursor Cloud Agents (process-scoped VERCEL_TOKEN). Fallback: logged-in vercel
  CLI on a local laptop. Use when the user asks to check Vercel deployments,
  inspect a preview or production URL, read Vercel logs, vercel whoami, or
  verify that Vercel access is working. Do not use for deploy, env pull, or
  env add on Cloud Agents.
---

# Vercel diagnostics (After Certainty)

## Auth paths

| Priority | Path | When |
|----------|------|------|
| **Primary** | PADE broker + `pade exec --capability vercel.diagnostics` wrapping ordinary `vercel` | Cursor Cloud Agent (this repo) |
| **Fallback** | Logged-in `vercel` CLI (no `--token` in chat) | Local laptop only |

On Cloud Agents, **do not** use Vercel MCP, `vercel login`, `--token`, or a session `VERCEL_TOKEN`. The agent VM must not hold durable Vercel credentials. Material is injected only into `pade exec` children.

## Prerequisites

### Cloud Agent (primary — PADE broker)

- Released **PADE v0.2.0** on `PATH` (from [`.cursor/install-pade.sh`](../../../../.cursor/install-pade.sh))
- Pinned **Vercel CLI 59.3.0** on `PATH` (from [`.cursor/install-vercel.sh`](../../../../.cursor/install-vercel.sh); binary only, no token)
- [`pade.yaml`](../../../../pade.yaml) and [`.pade/agent-bindings.yaml`](../../../../.pade/agent-bindings.yaml) at repo root
- Cursor Cloud Agent VM (identity socket for OIDC)

### Local laptop (fallback)

- A logged-in `vercel` CLI (`vercel whoami` works without `pade exec`)
- Do not paste tokens into chat, commits, or PR descriptions

## PADE execution

Wrap every diagnostic command:

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.diagnostics --quiet -- \
  vercel whoami
```

Replace `whoami` with the allowed command. `$VERCEL_TOKEN` comes from broker Material — never echo it.

Parallel `pade exec` can hit broker identity-mint contention. Run **≤3 concurrent** calls, or sequential with ~1s pauses.

## Allowed commands (read-oriented)

- `vercel whoami` — prove access
- `vercel ls` — list deployments
- `vercel inspect <url-or-id>` — inspect a deployment
- `vercel logs <url-or-id>` — read logs

## Forbidden on Cloud Agents

- `vercel deploy` / `vercel --prod` (publication stays in GitHub Actions)
- `vercel env pull` (would persist secrets on disk)
- `vercel env add` / `vercel env rm`
- `vercel login` / `vercel logout`
- Passing `--token` or exporting `VERCEL_TOKEN` into the agent shell
- Vercel MCP tools

## When the user runs this skill

1. **Choose auth path:** Cloud Agent → PADE wrap; local laptop with a logged-in CLI → fallback.
2. Start with `vercel whoami` to confirm access.
3. Then `ls` / `inspect` / `logs` as requested. Prefer inspect + logs over guessing from the dashboard.
4. If `pade exec` fails with **401/403**, check broker policy subject and Cloud Agent identity:

```bash
pade identity --audience "https://pade-broker-754719312452.us-central1.run.app"
```

Expected allowed subject: `user:253367178`. Local CLI fallback remains for machines without broker identity.

## Security guardrails

- **Never echo `$VERCEL_TOKEN`** or paste tokens into chat, commits, or PR descriptions.
- Do not write `.vercel/.env.*.local` on Cloud Agents.
- Plugin Vercel skills (`vercel-cli`, `deployments-cicd`, `env-vars`) assume a logged-in CLI or MCP. On Cloud Agents, **this skill wins**: wrap CLI in `pade exec` and stay read-only.
