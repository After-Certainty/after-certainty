#!/usr/bin/env python3
"""Build and validate Gate 3 parity comparison summaries (no network).

``comparison-summary.json`` is regenerable from ``raw/`` payloads.
``gate-decision.json`` is human/provenance — never overwritten by this tool.

Timezone honesty: Vercel date params resolve to UTC midnights (non-midnight ISO
times are truncated). GA4 ``startDate``/``endDate`` use the property timezone
(America/Denver). Comparisons are approximately aligned calendar periods, not
identical instants.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any

# Files the parity pack requires for a regenerateable comparison snapshot.
REQUIRED_VERCEL = (
    "vercel_visits_count.json",
    "vercel_visits_referrer.json",
    "vercel_visits_country.json",
    "vercel_visits_device.json",
    "vercel_visits_path.json",
    "vercel_events_by_name.json",
    "vercel_corpus_pairs.json",
    "vercel_corpus_edges.json",
)
REQUIRED_GA4 = (
    "ga4_overview.json",
    "ga4_channels.json",
    "ga4_source_medium.json",
    "ga4_country.json",
    "ga4_device.json",
    "ga4_pages.json",
    "ga4_events.json",
    "ga4_reader_events.json",
)


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"error: missing {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"error: invalid JSON in {path}: {exc}") from exc


def is_fake_payload(payload: Any) -> bool:
    if not isinstance(payload, dict):
        return False
    if payload.get("status") == "fake_token":
        return True
    note = payload.get("note")
    return isinstance(note, str) and "fake token" in note.lower()


def assert_not_fake(payload: Any, *, path: str | Path) -> None:
    if is_fake_payload(payload):
        raise SystemExit(
            f"error: fake/sentinel analytics payload in {path} — refusing to render as real zeroes"
        )


def assert_ga4_report_shape(payload: Any, *, path: str | Path) -> None:
    assert_not_fake(payload, path=path)
    if not isinstance(payload, dict):
        raise SystemExit(f"error: GA4 payload is not an object in {path}")
    if "metricHeaders" not in payload:
        raise SystemExit(f"error: GA4 payload missing metricHeaders in {path}")
    if "rows" not in payload:
        # Valid empty reports include rows: [] — missing key is malformed.
        raise SystemExit(f"error: GA4 payload missing rows in {path}")
    if not isinstance(payload["rows"], list):
        raise SystemExit(f"error: GA4 rows must be a list in {path}")
    if not isinstance(payload["metricHeaders"], list):
        raise SystemExit(f"error: GA4 metricHeaders must be a list in {path}")


def assert_vercel_payload_shape(payload: Any, *, path: str | Path) -> None:
    assert_not_fake(payload, path=path)
    if not isinstance(payload, dict):
        raise SystemExit(f"error: Vercel payload is not an object in {path}")
    if payload.get("status") == "unavailable":
        raise SystemExit(f"error: required Vercel report unavailable in {path}")
    if "data" not in payload:
        raise SystemExit(f"error: Vercel payload missing data in {path}")
    if "query" not in payload or not isinstance(payload["query"], dict):
        raise SystemExit(f"error: Vercel payload missing query bounds in {path}")


def vercel_until_param(inclusive_until: str) -> str:
    """Vercel aggregate endpoints need until= day-after inclusive calendar end.

    Passing the inclusive until date alone can resolve to a truncated ~01:00Z
    window on some endpoints; the next calendar day yields a full exclusive end.
    """
    d = date.fromisoformat(inclusive_until)
    return (d + timedelta(days=1)).isoformat()


def expected_vercel_until_utc(inclusive_until: str) -> str:
    """Expected resolved exclusive until for visits/count-style UTC midnight ends."""
    d = date.fromisoformat(inclusive_until) + timedelta(days=1)
    return f"{d.isoformat()}T00:00:00.000Z"


def expected_vercel_since_utc(inclusive_since: str) -> str:
    return f"{inclusive_since}T00:00:00.000Z"


def vercel_iso_request_bounds(inclusive_since: str, inclusive_until: str) -> tuple[str, str]:
    """ISO timestamps to send to Vercel for an approximate UTC calendar week.

    Pass exclusive until = day after inclusive until at T00:00:00.000Z.
    ``visits/count`` keeps that midnight; ``*/aggregate`` often resolves the same
    calendar day at ``T01:00:00.000Z`` (platform quirk) — see validation notes.
    """
    since_iso = expected_vercel_since_utc(inclusive_since)
    until_iso = expected_vercel_until_utc(inclusive_until)
    return since_iso, until_iso


def _until_utc_date(until_iso: str) -> str:
    """Return YYYY-MM-DD from a resolved until timestamp."""
    return until_iso[:10]


def validate_vercel_query_bounds(
    payloads: dict[str, Any],
    *,
    since: str,
    until_inclusive: str,
    until_param: str,
) -> list[str]:
    """Return human notes; raise SystemExit on incompatible resolved windows."""
    notes: list[str] = []
    expected_since = expected_vercel_since_utc(since)
    expected_until_count = expected_vercel_until_utc(until_inclusive)
    expected_until_day = _until_utc_date(expected_until_count)

    # until_param may be a bare date (day-after) or a full ISO exclusive end.
    if until_param not in {vercel_until_param(until_inclusive), expected_until_count}:
        raise SystemExit(
            f"error: until_param {until_param!r} must be day-after inclusive until "
            f"({vercel_until_param(until_inclusive)!r}) or ISO {expected_until_count!r}"
        )

    resolved: list[tuple[str, str, str]] = []
    for name, payload in payloads.items():
        query = payload.get("query") or {}
        rs = str(query.get("since") or "")
        ru = str(query.get("until") or "")
        resolved.append((name, rs, ru))
        if not rs or not ru:
            raise SystemExit(f"error: {name} missing resolved query.since/until")

    sinces = {rs for _, rs, _ in resolved}
    if sinces != {expected_since}:
        detail = ", ".join(f"{n}:{s}" for n, s, _ in resolved)
        raise SystemExit(
            f"error: Vercel resolved since must be {expected_since} for all files ({detail})"
        )

    untils = {ru for _, _, ru in resolved}
    allowed_untils = {
        expected_until_count,  # visits/count midnight exclusive end
        f"{expected_until_day}T01:00:00.000Z",  # aggregate +1h quirk on same UTC day
    }
    if not untils.issubset(allowed_untils):
        detail = ", ".join(f"{n}:{u}" for n, _, u in resolved)
        raise SystemExit(
            f"error: Vercel resolved until values must be on exclusive end day "
            f"{expected_until_day} at T00:00 or T01:00 ({detail})"
        )

    # Reject the historical bug: aggregate ending a full day earlier than count.
    until_days = {_until_utc_date(u) for u in untils}
    if until_days != {expected_until_day}:
        raise SystemExit(
            f"error: Vercel until calendar days {until_days} != expected {{{expected_until_day}}}"
        )

    if len(untils) > 1:
        notes.append(
            "Vercel visits/count resolves until at T00:00:00.000Z while */aggregate often "
            "resolves the same UTC calendar day at T01:00:00.000Z — documented platform quirk; "
            "treat as one exclusive end day, not mixed multi-day slices."
        )
    notes.append(
        f"Vercel since aligned at {expected_since}; until exclusive end day {expected_until_day} "
        f"(count and aggregate shapes: {sorted(untils)})."
    )
    notes.append(
        "GA4 startDate/endDate use America/Denver property midnights — approximately aligned "
        "calendar days, not identical UTC instants to Vercel."
    )
    return notes


def ga_metrics(payload: Any) -> dict[str, str]:
    assert_ga4_report_shape(payload, path="(ga_metrics)")
    if not payload.get("rows"):
        return {}
    names = [h["name"] for h in payload["metricHeaders"]]
    vals = [m["value"] for m in payload["rows"][0]["metricValues"]]
    return dict(zip(names, vals, strict=False))


def ga_event_map(payload: Any) -> dict[str, int]:
    assert_ga4_report_shape(payload, path="(ga_event_map)")
    out: dict[str, int] = {}
    for row in payload.get("rows") or []:
        name = row["dimensionValues"][0]["value"]
        out[name] = int(float(row["metricValues"][0]["value"]))
    return out


def vercel_event_map(payload: Any) -> dict[str, dict[str, int]]:
    assert_vercel_payload_shape(payload, path="(vercel_event_map)")
    out: dict[str, dict[str, int]] = {}
    data = payload.get("data")
    rows = data if isinstance(data, list) else []
    for row in rows:
        if isinstance(row, dict) and row.get("eventName"):
            out[str(row["eventName"])] = {
                "count": int(row.get("count") or 0),
                "visitors": int(row.get("visitors") or 0),
            }
    return out


def build_comparison_summary(
    *,
    art_dir: Path,
    since: str,
    until_inclusive: str,
    until_param: str,
) -> dict[str, Any]:
    raw = art_dir / "raw"
    vercel_payloads: dict[str, Any] = {}
    for name in REQUIRED_VERCEL:
        payload = load_json(raw / name)
        assert_vercel_payload_shape(payload, path=raw / name)
        vercel_payloads[name] = payload

    ga_payloads: dict[str, Any] = {}
    for name in REQUIRED_GA4:
        payload = load_json(raw / name)
        assert_ga4_report_shape(payload, path=raw / name)
        ga_payloads[name] = payload

    alignment_notes = validate_vercel_query_bounds(
        vercel_payloads,
        since=since,
        until_inclusive=until_inclusive,
        until_param=until_param,
    )

    v_visits = vercel_payloads["vercel_visits_count.json"].get("data") or {}
    if not isinstance(v_visits, dict):
        v_visits = {}
    v_events = vercel_event_map(vercel_payloads["vercel_events_by_name.json"])
    g_overview = ga_metrics(ga_payloads["ga4_overview.json"])
    g_reader = ga_event_map(ga_payloads["ga4_reader_events.json"])
    g_all = ga_event_map(ga_payloads["ga4_events.json"])

    referrers = vercel_payloads["vercel_visits_referrer.json"].get("data") or []
    countries = vercel_payloads["vercel_visits_country.json"].get("data") or []
    channels = ga_payloads["ga4_channels.json"]

    resolved_pairs = sorted(
        {
            (
                str((p.get("query") or {}).get("since") or ""),
                str((p.get("query") or {}).get("until") or ""),
            )
            for p in vercel_payloads.values()
        }
    )

    return {
        "schema": "gate3-comparison-summary/v1",
        "generated_at_utc": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "timezone_labels": "America/Denver",
        "window": {
            "denver_inclusive_since": since,
            "denver_inclusive_until": until_inclusive,
            "rule": "last_7_completed_denver_days_ending_yesterday",
            "vercel_request_since": expected_vercel_since_utc(since),
            "vercel_request_until": expected_vercel_until_utc(until_inclusive),
            "vercel_request_until_param_arg": until_param,
            "vercel_resolved_since_until_pairs": [
                {"since": s, "until": u} for s, u in resolved_pairs
            ],
            "ga4_property_timezone": "America/Denver",
            "alignment": "approximate_calendar_days_utc_vs_denver",
            "alignment_notes": alignment_notes,
        },
        "vercel": {
            "visitors": v_visits.get("visitors"),
            "pageviews": v_visits.get("pageviews"),
            "events": v_events,
            "google_referrer_visitors": next(
                (
                    r.get("visitors")
                    for r in referrers
                    if isinstance(r, dict) and r.get("referrerHostname") == "google.com"
                ),
                0,
            ),
            "empty_referrer_visitors": next(
                (
                    r.get("visitors")
                    for r in referrers
                    if isinstance(r, dict) and r.get("referrerHostname") == ""
                ),
                0,
            ),
            "top_countries": countries if isinstance(countries, list) else [],
        },
        "ga4": {
            "overview": g_overview,
            "reader_events": g_reader,
            "selected_events": {
                k: g_all.get(k, 0)
                for k in (
                    "chapter_open",
                    "next_chapter",
                    "file_download",
                    "page_view",
                    "session_start",
                    "search_query",
                )
            },
            "organic_search_sessions": next(
                (
                    int(float(r["metricValues"][0]["value"]))
                    for r in channels.get("rows") or []
                    if r["dimensionValues"][0]["value"] == "Organic Search"
                ),
                0,
            ),
        },
        "directional_comparisons": {
            "volume_scale": (
                "Vercel visitors include ungated aggregate traffic; GA4 is consent-gated — "
                "expect large numeric gaps"
            ),
            "chapter_open": {
                "ga4_event_count": g_reader.get("chapter_open", g_all.get("chapter_open", 0)),
                "vercel_event_count": (v_events.get("chapter_open") or {}).get("count", 0),
            },
            "corpus_navigation_vercel_only": v_events.get("corpus_navigation") or {},
        },
        "provenance": {
            "regenerable": True,
            "gate_decision_path": "gate-decision.json",
            "note": (
                "This file is overwritten by make reader-analytics-parity. "
                "Recommendation, revisit dates, owner smoke, and billing interpretation live in "
                "gate-decision.json and must not be copied here."
            ),
        },
    }


def assert_gate_decision_untouched(art_dir: Path, before: dict[str, Any] | None) -> None:
    path = art_dir / "gate-decision.json"
    if before is None:
        if path.exists():
            raise SystemExit("error: gate-decision.json appeared unexpectedly during regenerate")
        return
    after = load_json(path)
    if after != before:
        raise SystemExit("error: regenerating comparison-summary mutated gate-decision.json")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_build = sub.add_parser("build-summary", help="Write comparison-summary.json from raw/")
    p_build.add_argument("--art-dir", type=Path, required=True)
    p_build.add_argument("--since", required=True)
    p_build.add_argument("--until", required=True, help="Inclusive Denver until date")
    p_build.add_argument(
        "--vercel-until-param",
        required=True,
        help="until= value sent to Vercel (day after inclusive until)",
    )

    p_check = sub.add_parser(
        "check-gate-decision-stable",
        help="Exit 0 if gate-decision.json equals the provided snapshot JSON file",
    )
    p_check.add_argument("--art-dir", type=Path, required=True)
    p_check.add_argument("--before", type=Path, required=True)

    args = parser.parse_args(argv)

    if args.cmd == "build-summary":
        gate_path = args.art_dir / "gate-decision.json"
        before = load_json(gate_path) if gate_path.exists() else None
        summary = build_comparison_summary(
            art_dir=args.art_dir,
            since=args.since,
            until_inclusive=args.until,
            until_param=args.vercel_until_param,
        )
        out = args.art_dir / "comparison-summary.json"
        out.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
        assert_gate_decision_untouched(args.art_dir, before)
        print(f"wrote {out}", file=sys.stderr)
        return 0

    if args.cmd == "check-gate-decision-stable":
        before = load_json(args.before)
        assert_gate_decision_untouched(args.art_dir, before)
        print("gate-decision.json unchanged")
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
