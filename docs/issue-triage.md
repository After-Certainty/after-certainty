# GitHub issue triage and agent dispatch

How open issues are audited, labeled, and queued for cloud agents.

## Labels

| Label | Purpose |
|-------|---------|
| `agent-ready` | Straightforward, repo-contained, no author input; process in creation order |
| `blocked:author` | Needs author URLs, read-through, or editorial decisions |
| `partial` | Work started in codebase but issue body not fully updated |

Do **not** reuse `good first issue` for cloud agents.

## Apply triage on GitHub

Requires `gh` authenticated with issues write access:

```bash
./scripts/github_issue_triage.sh
```

This script:

1. Creates labels (`agent-ready`, `blocked:author`, `partial`)
2. Posts audit comments from [`docs/issue-triage/comments/`](issue-triage/comments/)
3. Updates bodies for #106, #107, #108, #231
4. Applies labels per audit verdict

> **Note:** The cloud-agent token may lack issues write permission. Run the script locally or from CI with a PAT that has `issues:write`.

## Agent queue

List agent-ready issues oldest first:

```bash
gh issue list --repo ksteffe/after-certainty --state open --label agent-ready --sort created \
  --json number,title,createdAt
```

**Current queue (creation order):** #108 → #234 → #235

### Dispatch workflow

1. Pick the oldest open `agent-ready` issue
2. Agent reads issue body + linked files; implements on branch `cursor/<descriptive-name>-1038`
3. Open PR; note any coordinated site-repo changes in PR body
4. On merge: close issue or remove `agent-ready`; add `partial` if scope remains

## Audit summary (Jul 2026)

| Issue | Verdict | Labels |
|-------|---------|--------|
| #106 Interpretation expansion | Partial — author gate | `blocked:author`, `partial` |
| #107 Incentives Phase 3 | Partial — author review only | `blocked:author`, `partial` |
| #108 readingOrder / relatedSlugs | Agent implementation | `agent-ready` |
| #109 purchase_links | Blocked on author URLs | `blocked:author` |
| #110 Site pull quotes | Optional / author | — |
| #231 Source bibliographic | Partial — v1.5 done | `partial` |
| #232 sameAs concepts | Editorial research | — |
| #233 schema.org mapping | Research spec | — |
| #234 dateModified | Agent-ready | `agent-ready` |
| #235 license / language | Agent-ready | `agent-ready` |

Per-issue audit comments live in [`docs/issue-triage/comments/`](issue-triage/comments/).

## Related docs

- [Portfolio audit follow-ups](portfolio-audit/06-follow-up-issues.md)
- [Semantic thinkers/sources migration](semantic-thinkers-sources-migration.md)
