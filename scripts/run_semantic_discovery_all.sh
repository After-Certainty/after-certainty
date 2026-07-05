#!/usr/bin/env bash
# Run glossary discovery and usage reports for portfolio books.
#
# Usage:
#   ./scripts/run_semantic_discovery_all.sh [tier1|tier2|all]
#
# Writes per book:
#   books/<book-id>/semantic-reports/glossary-candidates.md
#   books/<book-id>/semantic-reports/glossary-usage.md

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

TIER="${1:-all}"

# Tier 1: high-signal books (glossaries, patterns, bibliographies)
TIER1=(
  "books/coupling"
  "books/when-others-look-to-you/v1"
  "books/how-meaning-moves"
  "books/what-we-cannot-see"
  "books/why-collaboration-is-so-hard"
  "books/when-interpretation-no-longer-matters"
  "books/after-certainty"
  "books/before-certainty-arrives"
)

# Tier 2: bibliography-only essay cluster (excluding Tier 1 and Tier 3)
TIER2=(
  "books/when-accountability-no-longer-expires"
  "books/when-trust-stops-tracking-reality"
  "books/trust-beyond-similarity"
  "books/how-serious-systems-learn"
  "books/when-others-look-to-you/v2"
  "books/the-economy-we-dont-experience"
  "books/everyone-knows-love"
  "books/curiosity-before-certainty"
  "books/the-discipline-of-uncertainty"
  "books/when-moral-seriousness-scales"
  "books/when-incentives-become-the-moral-language"
  "books/when-authority-outlives-accountability"
  "books/when-authority-is-misread"
  "books/living-in-sediment"
  "books/how-trust-forms"
  "books/why-diversity-matters"
)

# Tier 3: fiction / atypical — discovery-only when tier=all
TIER3=(
  "books/the-relay"
  "books/velorum"
  "books/boundary-conditions"
  "books/observer-patterns"
)

book_id_from_dir() {
  python3 -c "
import sys
sys.path.insert(0, 'tools')
from pathlib import Path
from book_specs import load_any_book_spec
from semantic_enrichment import book_id_from_spec
spec = load_any_book_spec(Path('$1') / 'book.yml')
print(book_id_from_spec(spec))
"
}

run_for_book() {
  local book_dir="$1"
  local book_id
  book_id="$(book_id_from_dir "$book_dir")"
  local reports_dir="books/${book_id}/semantic-reports"

  # Nested edition paths (v1/v2) store reports under the edition book id folder
  if [[ "$book_dir" == *"/v1" || "$book_dir" == *"/v2" ]]; then
    reports_dir="${book_dir}/semantic-reports"
  fi

  mkdir -p "$reports_dir"

  echo "==> $book_id ($book_dir)"
  python3 tools/discover_book_glossary_candidates.py \
    --repo . \
    --book-dir "$book_dir" \
    --write-drafts \
    --out "${reports_dir}/glossary-candidates.md"

  python3 tools/scan_book_glossary_usage.py \
    --repo . \
    --book-dir "$book_dir" \
    --scope book \
    --out "${reports_dir}/glossary-usage.md"
}

BOOK_DIRS=()
case "$TIER" in
  tier1)
    BOOK_DIRS=("${TIER1[@]}")
    ;;
  tier2)
    BOOK_DIRS=("${TIER2[@]}")
    ;;
  tier3)
    BOOK_DIRS=("${TIER3[@]}")
    ;;
  all)
    BOOK_DIRS=("${TIER1[@]}" "${TIER2[@]}" "${TIER3[@]}")
    ;;
  *)
    echo "Unknown tier: $TIER (use tier1, tier2, tier3, or all)" >&2
    exit 1
    ;;
esac

for book_dir in "${BOOK_DIRS[@]}"; do
  if [[ ! -f "${book_dir}/book.yml" ]]; then
    echo "Skipping missing book.yml: $book_dir" >&2
    continue
  fi
  run_for_book "$book_dir"
done

echo "Done. Reports written for ${#BOOK_DIRS[@]} book(s)."
