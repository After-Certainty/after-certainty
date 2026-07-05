"""Tests for semantic source slug deduplication."""

from __future__ import annotations

import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _REPO_ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from dedupe_semantic_sources import (  # noqa: E402
    build_redirect_map,
    collapse_prefix_duplicates,
    find_duplicate_groups,
)


def test_hirschman_exit_voice_loyalty_prefix_chain() -> None:
    slugs = [
        "hirschman-albert-o-exit-voice-and-loyalty",
        "hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline",
        "hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states",
        "hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility",
    ]
    groups = find_duplicate_groups(slugs)
    assert len(groups) == 1
    assert groups[0][-1] == (
        "hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states"
    )
    redirect = build_redirect_map(groups)
    assert redirect["hirschman-albert-o-exit-voice-and-loyalty"] == groups[0][-1]


def test_collapse_prefix_duplicates_unions_related_books() -> None:
    short = "hirschman-albert-o-exit-voice-and-loyalty"
    long = "hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states"
    records = {
        short: {
            "slug": short,
            "name": "Albert O. Hirschman — Exit, Voice, and Loyalty",
            "type": "book",
            "summary": "Short summary.",
            "relatedBooks": ["why-collaboration-is-so-hard"],
            "concepts": [],
            "patterns": ["examples-accumulate"],
        },
        long: {
            "slug": long,
            "name": "Albert O. Hirschman — Exit, Voice, and Loyalty: Responses to Decline in Firms, Organizations, and States",
            "type": "book",
            "summary": "Longer summary with subtitle detail.",
            "relatedBooks": ["how-meaning-moves"],
            "concepts": [],
            "patterns": [],
        },
    }
    out = collapse_prefix_duplicates(records)
    assert set(out) == {long}
    assert out[long]["relatedBooks"] == ["how-meaning-moves", "why-collaboration-is-so-hard"]
    assert "examples-accumulate" in out[long]["patterns"]
