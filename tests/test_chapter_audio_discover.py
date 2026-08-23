"""Discover chapter-audio units needing generation (count-agnostic)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.discover import (  # noqa: E402
    NEED_GENERATE_STATUSES,
    discover_units_to_generate,
)
from chapter_audio.plan import plan_units  # noqa: E402


@pytest.fixture(scope="session")
def enabled_plans():
    return plan_units(REPO, enabled_only=True)


@pytest.fixture(scope="session")
def discover_plans():
    return discover_units_to_generate(REPO)


@pytest.fixture(scope="session")
def discover_observer_plans():
    return discover_units_to_generate(REPO, edition_slug="observer-patterns")


def test_discover_only_returns_units_needing_generation(discover_plans, enabled_plans) -> None:
    assert all(p.enabled for p in discover_plans)
    assert all(p.status in NEED_GENERATE_STATUSES or p.regenerate_required for p in discover_plans)
    current_ids = {p.unit_id for p in enabled_plans if p.status == "enabled-current"}
    discovered_ids = {p.unit_id for p in discover_plans}
    assert discovered_ids.isdisjoint(current_ids)


def test_discover_force_includes_current_when_present(enabled_plans) -> None:
    current = [p for p in enabled_plans if p.status == "enabled-current"]
    if not current:
        pytest.skip("no enabled-current units in this checkout (LFS / artifacts)")
    forced = discover_units_to_generate(REPO, force=True)
    forced_ids = {p.unit_id for p in forced}
    assert {p.unit_id for p in current} <= forced_ids


def test_discover_edition_filter(discover_observer_plans) -> None:
    assert all(p.edition_slug == "observer-patterns" for p in discover_observer_plans)
    empty = discover_units_to_generate(REPO, edition_slug="no-such-edition")
    assert empty == []


def test_discover_unknown_unit_raises() -> None:
    with pytest.raises(ValueError, match="unknown or disabled"):
        discover_units_to_generate(REPO, unit_ids=["chapter-does-not-exist"])


def test_discover_cli_ids_format(discover_observer_plans) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(TOOLS / "discover_chapter_audio.py"),
            "--repo",
            str(REPO),
            "--edition",
            "observer-patterns",
            "--format",
            "ids",
        ],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert r.returncode == 0, r.stderr
    ids = [line.strip() for line in r.stdout.splitlines() if line.strip()]
    assert all(i.startswith("chapter-observer-patterns-") for i in ids)
    # Count may change as the corpus is generated; only invariants matter.
    assert ids == [p.unit_id for p in discover_observer_plans]
