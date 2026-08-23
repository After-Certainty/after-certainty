"""Discover chapter-audio units that need generation (secret-free, no network).

Enablement comes from ``book.yml`` ``narration.defaults`` + ``chapter-enrichment.yml``
``audio.enabled`` (via the existing resolver). “Needs generation” uses the plan
statuses that compare receipts/artifacts to the current generation hash.
"""

from __future__ import annotations

from pathlib import Path

from after_certainty.chapter_audio.plan import UnitAudioPlan, plan_units

# Enabled but not safely available for Listen / install.
NEED_GENERATE_STATUSES = frozenset(
    {
        "enabled-missing",
        "enabled-stale",
        "enabled-invalid",
    }
)


def discover_units_to_generate(
    repo: Path,
    *,
    edition_slug: str | None = None,
    force: bool = False,
    unit_ids: list[str] | None = None,
) -> list[UnitAudioPlan]:
    """Return enabled plans that should be generated.

    - Default: enabled units whose artifacts are missing, stale, or invalid.
    - ``force``: all enabled, configured units (excludes ``enabled-unconfigured``).
    - ``unit_ids``: optional allow-list; unknown ids raise ``ValueError``.
    """
    repo = repo.resolve()
    requested = [u.strip() for u in (unit_ids or []) if u and u.strip()]
    plans = plan_units(repo, enabled_only=True)
    by_id = {p.unit_id: p for p in plans}

    if requested:
        missing = [u for u in requested if u not in by_id]
        if missing:
            raise ValueError("unknown or disabled unit id(s): " + ", ".join(sorted(missing)))
        selected = [by_id[u] for u in requested]
    else:
        selected = list(plans)

    if edition_slug:
        slug = edition_slug.strip()
        selected = [p for p in selected if p.edition_slug == slug]

    out: list[UnitAudioPlan] = []
    for plan in selected:
        if plan.status == "enabled-unconfigured":
            continue
        if force or plan.status in NEED_GENERATE_STATUSES or plan.regenerate_required:
            out.append(plan)
    return out
