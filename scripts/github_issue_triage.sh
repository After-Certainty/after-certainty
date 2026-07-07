#!/usr/bin/env bash
# Apply GitHub issue triage from docs/issue-triage.md (labels, comments, body updates).
# Requires gh auth with issues:write on ksteffe/after-certainty.
set -euo pipefail

REPO="ksteffe/after-certainty"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMMENTS_DIR="$ROOT/docs/issue-triage/comments"

create_labels() {
  gh label create "agent-ready" --repo "$REPO" --color "0E8A16" \
    --description "Straightforward, repo-contained; safe for cloud agent in creation order" \
    --force 2>/dev/null || true
  gh label create "blocked:author" --repo "$REPO" --color "FBCA04" \
    --description "Needs author URLs, read-through, or editorial decisions" \
    --force 2>/dev/null || true
  gh label create "partial" --repo "$REPO" --color "C5DEF5" \
    --description "Work started in codebase but issue body not fully updated" \
    --force 2>/dev/null || true
}

post_comment() {
  local issue="$1"
  local file="$COMMENTS_DIR/issue-${issue}.md"
  if [[ -f "$file" ]]; then
    gh issue comment "$issue" --repo "$REPO" --body-file "$file" || \
      echo "WARN: could not comment on #$issue (check gh issues:write permission)"
  fi
}

update_body() {
  local issue="$1"
  local file="$COMMENTS_DIR/issue-${issue}-body.md"
  if [[ -f "$file" ]]; then
    gh issue edit "$issue" --repo "$REPO" --body-file "$file" || \
      echo "WARN: could not edit body for #$issue (check gh issues:write permission)"
  fi
}

apply_labels() {
  local issue="$1"
  shift
  if (($# > 0)); then
    gh issue edit "$issue" --repo "$REPO" --add-label "$*" || \
      echo "WARN: could not label #$issue (check gh issues:write permission)"
  fi
}

main() {
  create_labels

  for issue in 106 107 108 109 110 231 232 233 234 235; do
    post_comment "$issue"
  done

  for issue in 106 107 108 231; do
    update_body "$issue"
  done

  apply_labels 108 agent-ready partial
  apply_labels 234 agent-ready
  apply_labels 235 agent-ready
  apply_labels 106 blocked:author partial
  apply_labels 107 blocked:author partial
  apply_labels 109 blocked:author
  apply_labels 231 partial

  echo "Triage complete. Agent queue:"
  gh issue list --repo "$REPO" --state open --label agent-ready --sort created
}

main "$@"
