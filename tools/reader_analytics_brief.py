#!/usr/bin/env python3
"""Render the reader-analytics markdown brief from Vercel Web Analytics JSON.

Used by ``scripts/reader-analytics-test.sh`` (PADE pack) and unit tests.
Never print access tokens. Custom-event properties are IDs/enums only.

Timezone: America/Denver for week boundaries; UTC ISO timestamps stated in output.
Aggregate counts are not session journeys — see LIMITATIONS in the brief.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Denver")

SEARCH_HOST_RE = re.compile(
    r"(^|\.)(google|bing|duckduckgo|yahoo|baidu|yandex|ecosia|brave)\.",
    re.I,
)
SOCIAL_HOST_FRAGMENTS = (
    "facebook.com",
    "fb.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "t.co",
    "reddit.com",
    "instagram.com",
    "threads.net",
    "substack.com",
    "medium.com",
    "youtube.com",
    "youtu.be",
)
MAIL_HOST_FRAGMENTS = (
    "com.google.android.gm",
    "mail.google.com",
    "outlook.live.com",
    "mail.yahoo.com",
)

RESEARCH_PATH_PREFIXES = (
    "/explore/sources",
    "/explore/thinkers",
    "/explore/concepts",
    "/explore/patterns",
)


def week_bounds_denver(anchor: date | None = None) -> tuple[datetime, datetime, datetime, datetime]:
    """Return (current_since, current_until, prior_since, prior_until) as Denver midnights.

    ``until`` is exclusive end-of-day next morning for API ``until`` date params
    that treat the end date as inclusive calendar days — callers should pass
    ``until.date().isoformat()`` as inclusive end (yesterday-inclusive week).
    """
    now = (
        datetime.now(TZ)
        if anchor is None
        else datetime(anchor.year, anchor.month, anchor.day, tzinfo=TZ)
    )
    # Inclusive last 7 calendar days ending today (Denver).
    until_day = now.date()
    since_day = until_day - timedelta(days=6)
    prior_until_day = since_day - timedelta(days=1)
    prior_since_day = prior_until_day - timedelta(days=6)
    return (
        datetime(since_day.year, since_day.month, since_day.day, tzinfo=TZ),
        datetime(until_day.year, until_day.month, until_day.day, tzinfo=TZ),
        datetime(prior_since_day.year, prior_since_day.month, prior_since_day.day, tzinfo=TZ),
        datetime(prior_until_day.year, prior_until_day.month, prior_until_day.day, tzinfo=TZ),
    )


def inclusive_date_pair(start: datetime, end: datetime) -> tuple[str, str]:
    return start.date().isoformat(), end.date().isoformat()


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"error: missing report file {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"error: invalid JSON in {path}: {exc}") from exc


def rows_from_aggregate(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    data = payload.get("data")
    if isinstance(data, list):
        return [r for r in data if isinstance(r, dict)]
    if isinstance(data, dict):
        return [data]
    return []


def classify_referrer(hostname: str | None) -> str:
    host = (hostname or "").strip().lower()
    if not host:
        return "no_recorded_referrer"
    if SEARCH_HOST_RE.search(host) or host.startswith("google."):
        return "organic_search"
    if any(frag in host for frag in MAIL_HOST_FRAGMENTS):
        return "social_or_newsletter"
    if any(frag in host for frag in SOCIAL_HOST_FRAGMENTS):
        return "social_or_newsletter"
    return "other_external"


def path_family(path: str) -> str:
    p = (path or "").split("?", 1)[0].rstrip("/") or "/"
    if p.startswith("/explore/books/") and "/chapters/" in p:
        return "chapter"
    if p.startswith("/explore/books"):
        return "book"
    if p.startswith("/explore/sources"):
        return "source"
    if p.startswith("/explore/thinkers"):
        return "thinker"
    if p.startswith("/explore/concepts"):
        return "concept"
    if p.startswith("/explore/patterns"):
        return "pattern"
    if p.startswith("/questions"):
        return "question"
    if p.startswith("/trails"):
        return "trail"
    if p.startswith("/listen"):
        return "listen"
    if p in {"/", "/start", "/explore"}:
        return "discovery_home"
    return "other"


def is_research_path(path: str) -> bool:
    p = (path or "").split("?", 1)[0]
    return any(p.startswith(prefix) for prefix in RESEARCH_PATH_PREFIXES)


def metric_int(row: dict[str, Any], *keys: str) -> int:
    for key in keys:
        if key in row and row[key] is not None:
            try:
                return int(float(row[key]))
            except (TypeError, ValueError):
                continue
    return 0


def sum_metrics(rows: list[dict[str, Any]], *keys: str) -> int:
    return sum(metric_int(r, *keys) for r in rows)


def top_rows(
    rows: list[dict[str, Any]],
    label_key: str,
    *,
    limit: int = 10,
    value_keys: tuple[str, ...] = ("pageviews", "count"),
    visitor_keys: tuple[str, ...] = ("visitors",),
) -> list[tuple[str, int, int]]:
    scored: list[tuple[str, int, int]] = []
    for row in rows:
        label = row.get(label_key)
        if label is None and "/" in label_key:
            # eventData/from_type style sometimes nested as eventData key
            label = row.get(label_key) or row.get(label_key.split("/")[-1])
        if label is None:
            # try first non-metric string field
            for k, v in row.items():
                if k in {"pageviews", "visitors", "count", "timestamp"}:
                    continue
                if isinstance(v, str):
                    label = v
                    break
        if not isinstance(label, str):
            label = str(label) if label is not None else "(unknown)"
        scored.append((label, metric_int(row, *value_keys), metric_int(row, *visitor_keys)))
    scored.sort(key=lambda t: (-t[1], -t[2], t[0]))
    return scored[:limit]


def channel_breakdown(referrer_rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = defaultdict(lambda: {"pageviews": 0, "visitors": 0})
    for row in referrer_rows:
        host = ""
        for key in ("referrerHostname", "referrer", "hostname"):
            if isinstance(row.get(key), str):
                host = row[key]
                break
        # Some API rows put the grouped value in a generic field
        if not host:
            for k, v in row.items():
                if k in {"pageviews", "visitors", "count"}:
                    continue
                if isinstance(v, str):
                    host = v
                    break
        cls = classify_referrer(host)
        out[cls]["pageviews"] += metric_int(row, "pageviews", "count")
        out[cls]["visitors"] += metric_int(row, "visitors")
    return dict(out)


def anomaly_notes(
    *,
    country_rows: list[dict[str, Any]],
    device_rows: list[dict[str, Any]],
    path_rows: list[dict[str, Any]],
    referrer_rows: list[dict[str, Any]],
    custom_event_total: int,
    visit_visitors: int,
) -> list[str]:
    notes: list[str] = []
    countries = top_rows(country_rows, "country", limit=5)
    if countries:
        top_country, top_pv, top_vis = countries[0]
        total_vis = sum(v for _, _, v in countries) or visit_visitors or 1
        share = top_vis / total_vis if total_vis else 0
        if share >= 0.4 and top_country.upper() in {"SG", "CN"}:
            notes.append(
                f"Heuristic: country **{top_country}** is ~{share:.0%} of grouped visitors "
                f"({top_vis} visitors / {top_pv} pageviews). Treat as anomaly signal, not bot identity."
            )
    devices = {
        label.lower(): vis for label, _, vis in top_rows(device_rows, "deviceType", limit=10)
    }
    desktop = devices.get("desktop", 0)
    if desktop and visit_visitors and desktop / max(visit_visitors, 1) >= 0.7:
        notes.append(
            f"Heuristic: desktop-heavy traffic ({desktop} visitors in device breakdown vs "
            f"{visit_visitors} overall visitors in period)."
        )
    research_vis = 0
    for row in path_rows:
        path = ""
        for key in ("requestPath", "route", "path"):
            if isinstance(row.get(key), str):
                path = row[key]
                break
        if is_research_path(path):
            research_vis += metric_int(row, "visitors")
    empty_ref = channel_breakdown(referrer_rows).get("no_recorded_referrer", {})
    empty_vis = empty_ref.get("visitors", 0)
    if research_vis and empty_vis and visit_visitors:
        notes.append(
            f"Heuristic: research/thinker/source paths show ~{research_vis} visitors in top path rows; "
            f"empty-referrer visitors ~{empty_vis}. Combine with country/device above — not confirmed automation."
        )
    if visit_visitors and custom_event_total == 0:
        notes.append(
            "Custom reader events are absent or near-zero while pageviews exist — engagement may be thin "
            "or instrumentation not yet collecting for this window."
        )
    if not notes:
        notes.append("No strong geo×device×referrer anomaly pattern flagged for this window.")
    return notes


def fmt_table(headers: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)


def safe_ratio(num: int, den: int) -> str:
    if den <= 0:
        return "n/a (no denominator events)"
    return f"{num / den:.2f} events per open ({num}/{den}) — aggregate ratio, not a session conversion rate"


def render_brief(
    *,
    current_dir: Path,
    prior_dir: Path | None,
    since: str,
    until: str,
    prior_since: str | None,
    prior_until: str | None,
    generated_at: datetime | None = None,
) -> str:
    generated_at = generated_at or datetime.now(UTC)
    visits = rows_from_aggregate(load_json(current_dir / "visits_count.json"))
    visit_totals = visits[0] if visits else {}
    pageviews = metric_int(visit_totals, "pageviews")
    visitors = metric_int(visit_totals, "visitors")

    daily = rows_from_aggregate(load_json(current_dir / "visits_by_day.json"))
    referrers = rows_from_aggregate(load_json(current_dir / "visits_by_referrer.json"))
    countries = rows_from_aggregate(load_json(current_dir / "visits_by_country.json"))
    devices = rows_from_aggregate(load_json(current_dir / "visits_by_device.json"))
    paths = rows_from_aggregate(load_json(current_dir / "visits_by_path.json"))
    events_by_name = rows_from_aggregate(load_json(current_dir / "events_by_name.json"))
    corpus_from = rows_from_aggregate(load_json(current_dir / "corpus_by_from_type.json"))
    corpus_to = rows_from_aggregate(load_json(current_dir / "corpus_by_to_type.json"))
    corpus_to_id = rows_from_aggregate(load_json(current_dir / "corpus_by_to_id.json"))

    event_map = {
        (
            r.get("eventName")
            or r.get("eventData")
            or next(
                (
                    v
                    for k, v in r.items()
                    if k not in {"pageviews", "visitors", "count"} and isinstance(v, str)
                ),
                "",
            )
        ): r
        for r in events_by_name
    }

    def event_metrics(name: str) -> tuple[int, int]:
        row = event_map.get(name) or {}
        return metric_int(row, "count", "pageviews"), metric_int(row, "visitors")

    chapter_open_c, chapter_open_v = event_metrics("chapter_open")
    chapter_adv_c, chapter_adv_v = event_metrics("chapter_advance")
    # Legacy GA dual-write may still show as next_chapter only on GA; Vercel name is chapter_advance
    download_c, download_v = event_metrics("book_download")
    audio_c, audio_v = event_metrics("reader_audio_started")
    path_c, path_v = event_metrics("reading_path_started")
    corpus_c, corpus_v = event_metrics("corpus_navigation")
    custom_total = sum(metric_int(r, "count") for r in events_by_name)

    channels = channel_breakdown(referrers)

    prior_block = ""
    if prior_dir and prior_since and prior_until:
        prior_visits = rows_from_aggregate(load_json(prior_dir / "visits_count.json"))
        prior = prior_visits[0] if prior_visits else {}
        p_pv = metric_int(prior, "pageviews")
        p_vis = metric_int(prior, "visitors")
        prior_events = rows_from_aggregate(load_json(prior_dir / "events_by_name.json"))
        prior_map = {
            (r.get("eventName") or ""): r
            for r in prior_events
            if isinstance(r.get("eventName"), str)
        }
        p_open = metric_int(prior_map.get("chapter_open") or {}, "count")
        prior_block = "\n".join(
            [
                "## 8. Changes from previous comparable period",
                "",
                f"Prior window: **{prior_since} → {prior_until}** (America/Denver calendar dates).",
                "",
                fmt_table(
                    ["Metric", "Current", "Prior", "Delta"],
                    [
                        [
                            "Visitors",
                            str(visitors),
                            str(p_vis),
                            str(visitors - p_vis),
                        ],
                        [
                            "Pageviews",
                            str(pageviews),
                            str(p_pv),
                            str(pageviews - p_pv),
                        ],
                        [
                            "chapter_open count",
                            str(chapter_open_c),
                            str(p_open),
                            str(chapter_open_c - p_open),
                        ],
                    ],
                ),
                "",
                "Deltas are raw aggregate differences, not significance tests.",
                "",
            ]
        )
    else:
        prior_block = (
            "## 8. Changes from previous comparable period\n\n"
            "_Prior period files not provided; skip comparison._\n"
        )

    channel_rows = [
        [cls, str(vals.get("visitors", 0)), str(vals.get("pageviews", 0))]
        for cls, vals in sorted(channels.items(), key=lambda kv: -kv[1].get("visitors", 0))
    ]

    path_top = top_rows(paths, "requestPath", limit=15)
    # Prefer requestPath; API may return route
    if not path_top:
        path_top = top_rows(paths, "route", limit=15)

    families: dict[str, dict[str, int]] = defaultdict(lambda: {"pageviews": 0, "visitors": 0})
    for label, pv, vis in path_top:
        fam = path_family(label)
        families[fam]["pageviews"] += pv
        families[fam]["visitors"] += vis

    lines: list[str] = [
        "# Reader analytics — After Certainty",
        "",
        f"Generated: **{generated_at.astimezone(UTC).strftime('%Y-%m-%d %H:%M UTC')}**  ",
        "Timezone for week bounds: **America/Denver**  ",
        f"Current window: **{since} → {until}** (inclusive calendar dates)  ",
        "Source: Vercel Web Analytics aggregate API (project `after-certainty`)",
        "",
        "## Limitations",
        "",
        "- These are **aggregate** pageviews, visitors, and event counts — **not** session-level journeys.",
        "- Do not treat event ratios as per-reader conversion or completion rates.",
        "- Custom events and pageviews use different identification methods than GA4; expect directional, not exact, parity.",
        "- `corpus_navigation` without `to_id` is **type-level only**; with semantic `to_id`, report counts/visitors, not reconstructed personal histories.",
        "- Anomaly classes are **heuristics**, not confirmed bot identity. Never silently exclude traffic from headlines.",
        "- If a query failed, this brief must not invent rows — missing files abort generation.",
        "",
        "## 1. Visitors and pageviews",
        "",
        fmt_table(
            ["Metric", "Value"],
            [["Visitors", str(visitors)], ["Pageviews", str(pageviews)]],
        ),
        "",
        "### Daily trend",
        "",
    ]

    if daily:
        day_rows = []
        for row in daily:
            ts = row.get("timestamp") or row.get("day") or ""
            day_rows.append(
                [
                    str(ts)[:10],
                    str(metric_int(row, "visitors")),
                    str(metric_int(row, "pageviews")),
                ]
            )
        lines.append(fmt_table(["Day (UTC stamp)", "Visitors", "Pageviews"], day_rows))
    else:
        lines.append("_No daily rows._")

    lines.extend(
        [
            "",
            "## 2. Discovery channels and referrers",
            "",
            fmt_table(
                ["Channel class", "Visitors", "Pageviews"], channel_rows or [["(none)", "0", "0"]]
            ),
            "",
            "Top referrer hostnames:",
            "",
            fmt_table(
                ["Hostname", "Visitors", "Pageviews"],
                [
                    [label or "(empty)", str(vis), str(pv)]
                    for label, pv, vis in top_rows(referrers, "referrerHostname", limit=8)
                ]
                or [["(none)", "0", "0"]],
            ),
            "",
            "## 3. Most visited books, chapters, sources, and thinkers",
            "",
            "Path-family rollup from top `requestPath` rows:",
            "",
            fmt_table(
                ["Family", "Visitors", "Pageviews"],
                [
                    [fam, str(vals["visitors"]), str(vals["pageviews"])]
                    for fam, vals in sorted(families.items(), key=lambda kv: -kv[1]["visitors"])
                ]
                or [["(none)", "0", "0"]],
            ),
            "",
            "Top paths:",
            "",
            fmt_table(
                ["Path", "Visitors", "Pageviews"],
                [[label, str(vis), str(pv)] for label, pv, vis in path_top]
                or [["(none)", "0", "0"]],
            ),
            "",
            "## 4. Source/thinker → book/chapter navigation",
            "",
            f"`corpus_navigation` events: **{corpus_c}** count / **{corpus_v}** visitors.",
            "",
            "By `from_type`:",
            "",
            fmt_table(
                ["from_type", "Count", "Visitors"],
                [
                    [label, str(pv), str(vis)]
                    for label, pv, vis in top_rows(
                        corpus_from, "eventData/from_type", value_keys=("count",), limit=10
                    )
                ]
                or [["(none)", "0", "0"]],
            ),
            "",
            "By `to_type`:",
            "",
            fmt_table(
                ["to_type", "Count", "Visitors"],
                [
                    [label, str(pv), str(vis)]
                    for label, pv, vis in top_rows(
                        corpus_to, "eventData/to_type", value_keys=("count",), limit=10
                    )
                ]
                or [["(none)", "0", "0"]],
            ),
            "",
            "By semantic `to_id` (attribution edges only; empty means type-level legacy or missing attribute):",
            "",
            fmt_table(
                ["to_id", "Count", "Visitors"],
                [
                    [label or "(empty)", str(pv), str(vis)]
                    for label, pv, vis in top_rows(
                        corpus_to_id, "eventData/to_id", value_keys=("count",), limit=15
                    )
                ]
                or [["(none)", "0", "0"]],
            ),
            "",
            "## 5. Reader continuation and downloads",
            "",
            fmt_table(
                ["Event", "Count", "Visitors"],
                [
                    ["chapter_open", str(chapter_open_c), str(chapter_open_v)],
                    ["chapter_advance", str(chapter_adv_c), str(chapter_adv_v)],
                    ["book_download", str(download_c), str(download_v)],
                ],
            ),
            "",
            f"Continuation ratio: {safe_ratio(chapter_adv_c, chapter_open_c)}",
            "",
            "## 6. Audio and exploration activity",
            "",
            fmt_table(
                ["Event", "Count", "Visitors"],
                [
                    ["reader_audio_started", str(audio_c), str(audio_v)],
                    ["reading_path_started", str(path_c), str(path_v)],
                    ["corpus_navigation", str(corpus_c), str(corpus_v)],
                ],
            ),
            "",
            "## 7. Traffic anomalies",
            "",
            "Geography (top):",
            "",
            fmt_table(
                ["Country", "Visitors", "Pageviews"],
                [[c, str(v), str(p)] for c, p, v in top_rows(countries, "country", limit=8)]
                or [["(none)", "0", "0"]],
            ),
            "",
            "Devices:",
            "",
            fmt_table(
                ["Device", "Visitors", "Pageviews"],
                [[c, str(v), str(p)] for c, p, v in top_rows(devices, "deviceType", limit=8)]
                or [["(none)", "0", "0"]],
            ),
            "",
        ]
    )

    for note in anomaly_notes(
        country_rows=countries,
        device_rows=devices,
        path_rows=paths,
        referrer_rows=referrers,
        custom_event_total=custom_total,
        visit_visitors=visitors,
    ):
        lines.append(f"- {note}")

    lines.extend(["", prior_block.rstrip(), ""])
    return "\n".join(lines).rstrip() + "\n"


def render_json_summary(
    *,
    since: str,
    until: str,
    current_dir: Path,
) -> dict[str, Any]:
    visits = rows_from_aggregate(load_json(current_dir / "visits_count.json"))
    visit_totals = visits[0] if visits else {}
    events_by_name = rows_from_aggregate(load_json(current_dir / "events_by_name.json"))
    return {
        "timezone": "America/Denver",
        "since": since,
        "until": until,
        "visitors": metric_int(visit_totals, "visitors"),
        "pageviews": metric_int(visit_totals, "pageviews"),
        "events": [
            {
                "eventName": r.get("eventName"),
                "count": metric_int(r, "count"),
                "visitors": metric_int(r, "visitors"),
            }
            for r in events_by_name
        ],
        "limitations": [
            "aggregate_only",
            "not_session_journeys",
            "anomaly_heuristics_only",
        ],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--current-dir", type=Path, help="Directory of current-window JSON reports")
    parser.add_argument("--prior-dir", type=Path, help="Directory of prior-window JSON reports")
    parser.add_argument(
        "--since", help="Inclusive start date (YYYY-MM-DD, America/Denver calendar)"
    )
    parser.add_argument("--until", help="Inclusive end date (YYYY-MM-DD, America/Denver calendar)")
    parser.add_argument("--prior-since")
    parser.add_argument("--prior-until")
    parser.add_argument("--json-out", type=Path, help="Optional JSON summary path")
    parser.add_argument(
        "--print-week-bounds", action="store_true", help="Print Denver week bounds as JSON and exit"
    )
    args = parser.parse_args(argv)

    if args.print_week_bounds:
        cur_s, cur_u, pri_s, pri_u = week_bounds_denver()
        cs, cu = inclusive_date_pair(cur_s, cur_u)
        ps, pu = inclusive_date_pair(pri_s, pri_u)
        print(
            json.dumps(
                {
                    "timezone": "America/Denver",
                    "current": {"since": cs, "until": cu},
                    "prior": {"since": ps, "until": pu},
                    "current_since_utc": cur_s.astimezone(UTC).isoformat(),
                    "current_until_utc": cur_u.astimezone(UTC).isoformat(),
                }
            )
        )
        return 0

    if args.current_dir is None or not args.since or not args.until:
        parser.error("--current-dir, --since, and --until are required unless --print-week-bounds")

    brief = render_brief(
        current_dir=args.current_dir,
        prior_dir=args.prior_dir,
        since=args.since,
        until=args.until,
        prior_since=args.prior_since,
        prior_until=args.prior_until,
    )
    sys.stdout.write(brief)
    if args.json_out:
        summary = render_json_summary(
            since=args.since,
            until=args.until,
            current_dir=args.current_dir,
        )
        args.json_out.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
