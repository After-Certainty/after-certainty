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
    """Return Denver midnights for two comparable completed weeks.

    Default: last **seven completed** America/Denver calendar days ending
    **yesterday** (excludes today's partial day), plus the prior seven completed
    days. Each returned datetime is midnight at the start of that calendar day
    in America/Denver (DST-aware via ZoneInfo).

    Callers should pass inclusive calendar labels via ``inclusive_date_pair`` and
    API ``since``/``until`` as those ``YYYY-MM-DD`` dates. The Vercel Web Analytics
    API resolves date params to UTC midnights and treats ``until`` as an inclusive
    calendar day (exclusive end = start of the next UTC day). ISO timestamps with
    a non-zero time component are truncated to UTC midnight — verified 2026-10-17.
    """
    now = (
        datetime.now(TZ)
        if anchor is None
        else datetime(anchor.year, anchor.month, anchor.day, tzinfo=TZ)
    )
    # Exclusive of today: last completed Denver day is yesterday.
    until_day = now.date() - timedelta(days=1)
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
    """Inclusive America/Denver calendar labels for a completed-day window."""
    return start.date().isoformat(), end.date().isoformat()


def denver_midnight_utc_iso(day: datetime) -> str:
    """UTC ISO for Denver midnight on ``day`` (API still truncates to UTC date)."""
    return day.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"error: missing report file {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"error: invalid JSON in {path}: {exc}") from exc


def payload_status(payload: Any) -> str:
    """Return status: ok | empty | unavailable | fake_token | invalid."""
    if not isinstance(payload, dict):
        return "invalid"
    status = payload.get("status")
    if status in {"unavailable", "fake_token"}:
        return str(status)
    note = payload.get("note")
    if isinstance(note, str) and "fake token" in note.lower():
        return "fake_token"
    if "error" in payload and payload.get("data") is None:
        return "unavailable"
    data = payload.get("data")
    if data is None and status == "unavailable":
        return "unavailable"
    if isinstance(data, list):
        return "empty" if len(data) == 0 else "ok"
    if isinstance(data, dict):
        return "ok"
    return "invalid"


def assert_real_payload(payload: Any, *, path: str | Path) -> None:
    """Fail closed on fake/sentinel payloads during normal reporting."""
    status = payload_status(payload)
    if status == "fake_token":
        raise SystemExit(
            f"error: fake/sentinel analytics payload in {path} — refusing to render as real zeroes"
        )
    if status == "invalid":
        raise SystemExit(f"error: invalid analytics payload shape in {path}")


def rows_from_aggregate(payload: Any) -> list[dict[str, Any]]:
    if not isinstance(payload, dict):
        return []
    if payload_status(payload) in {"unavailable", "fake_token", "invalid"}:
        return []
    data = payload.get("data")
    if isinstance(data, list):
        return [r for r in data if isinstance(r, dict)]
    if isinstance(data, dict):
        return [data]
    return []


def unavailable_reason(payload: Any) -> str:
    if not isinstance(payload, dict):
        return "invalid payload"
    reason = payload.get("reason") or payload.get("note")
    if isinstance(reason, str) and reason.strip():
        return reason.strip()
    err = payload.get("error")
    if isinstance(err, dict):
        msg = err.get("message")
        if isinstance(msg, str) and msg.strip():
            return msg.strip()
    return "query unavailable"


def load_report(path: Path) -> tuple[str, list[dict[str, Any]], Any]:
    """Load a report file → (status, rows, raw_payload). Fail closed on fake tokens."""
    payload = load_json(path)
    assert_real_payload(payload, path=path)
    status = payload_status(payload)
    return status, rows_from_aggregate(payload), payload


def is_source_or_thinker_path(path: str) -> bool:
    p = (path or "").split("?", 1)[0]
    return p.startswith("/explore/sources") or p.startswith("/explore/thinkers")


def attribution_pairs(rows: list[dict[str, Any]]) -> list[tuple[str, str, int, int, str]]:
    """Return (origin_path, to_id, count, visitors, label) sorted by count.

    Empty ``to_id`` is labeled legacy/type-only — not a claimed destination.
    """
    scored: list[tuple[str, str, int, int, str]] = []
    for row in rows:
        origin = ""
        for key in ("requestPath", "route", "path"):
            if isinstance(row.get(key), str):
                origin = row[key]
                break
        to_id = row.get("eventData/to_id")
        if to_id is None:
            to_id = row.get("to_id")
        to_id_s = to_id if isinstance(to_id, str) else ""
        count = metric_int(row, "count", "pageviews")
        visitors = metric_int(row, "visitors")
        if to_id_s.strip():
            label = "attributed"
        else:
            label = "legacy/type-only (empty to_id)"
        scored.append((origin or "(unknown)", to_id_s, count, visitors, label))
    scored.sort(key=lambda t: (-t[2], -t[3], t[0], t[1]))
    return scored


def edge_type_pairs(rows: list[dict[str, Any]]) -> list[tuple[str, str, int, int]]:
    """Joint from_type × to_type edges (not marginal totals)."""
    scored: list[tuple[str, str, int, int]] = []
    for row in rows:
        frm = row.get("eventData/from_type") or row.get("from_type") or "(unknown)"
        to = row.get("eventData/to_type") or row.get("to_type") or "(unknown)"
        scored.append(
            (str(frm), str(to), metric_int(row, "count", "pageviews"), metric_int(row, "visitors"))
        )
    scored.sort(key=lambda t: (-t[2], -t[3], t[0], t[1]))
    return scored


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
    if countries and visit_visitors > 0:
        top_country, top_pv, top_vis = countries[0]
        # Denominator is overall period visitors — not the truncated top-N country sum.
        share = top_vis / visit_visitors
        if share >= 0.4 and top_country.upper() in {"SG", "CN"}:
            notes.append(
                f"Heuristic: country **{top_country}** is ~{share:.0%} of overall visitors "
                f"({top_vis} / {visit_visitors}; {top_pv} pageviews in country row). "
                "Treat as anomaly signal, not bot identity."
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


def _section_or_unavailable(
    *,
    title: str,
    status: str,
    payload: Any,
    ok_lines: list[str],
) -> list[str]:
    if status == "unavailable":
        return [
            title,
            "",
            f"_Unavailable — {unavailable_reason(payload)}. Not a zero-events result._",
            "",
        ]
    return ok_lines


def render_brief(
    *,
    current_dir: Path,
    prior_dir: Path | None,
    since: str,
    until: str,
    prior_since: str | None,
    prior_until: str | None,
    generated_at: datetime | None = None,
    query_since_utc: str | None = None,
    query_until_utc: str | None = None,
) -> str:
    generated_at = generated_at or datetime.now(UTC)

    visits_status, visits, visits_payload = load_report(current_dir / "visits_count.json")
    if visits_status == "unavailable":
        raise SystemExit(
            f"error: required visits_count unavailable: {unavailable_reason(visits_payload)}"
        )
    visit_totals = visits[0] if visits else {}
    pageviews = metric_int(visit_totals, "pageviews")
    visitors = metric_int(visit_totals, "visitors")
    api_query = visits_payload.get("query") if isinstance(visits_payload, dict) else {}
    if isinstance(api_query, dict):
        query_since_utc = query_since_utc or (
            str(api_query["since"]) if api_query.get("since") else None
        )
        query_until_utc = query_until_utc or (
            str(api_query["until"]) if api_query.get("until") else None
        )

    _, daily, _ = load_report(current_dir / "visits_by_day.json")
    _, referrers, _ = load_report(current_dir / "visits_by_referrer.json")
    _, countries, _ = load_report(current_dir / "visits_by_country.json")
    _, devices, _ = load_report(current_dir / "visits_by_device.json")
    paths_status, paths, paths_payload = load_report(current_dir / "visits_by_path.json")
    _, events_by_name, _ = load_report(current_dir / "events_by_name.json")

    # Prefer joint edge file; keep marginal files optional for older fixtures.
    if (current_dir / "corpus_by_from_to_type.json").exists():
        edges_status, edges_rows, edges_payload = load_report(
            current_dir / "corpus_by_from_to_type.json"
        )
    else:
        edges_status, edges_rows, edges_payload = (
            "unavailable",
            [],
            {"status": "unavailable", "reason": "corpus_by_from_to_type.json missing"},
        )

    pairs_path = current_dir / "corpus_by_origin_and_to_id.json"
    if pairs_path.exists():
        pairs_status, pairs_rows, pairs_payload = load_report(pairs_path)
    else:
        pairs_status, pairs_rows, pairs_payload = (
            "unavailable",
            [],
            {"status": "unavailable", "reason": "corpus_by_origin_and_to_id.json missing"},
        )

    # Legacy marginal files remain optional context only.
    from_status, corpus_from, from_payload = (
        load_report(current_dir / "corpus_by_from_type.json")
        if (current_dir / "corpus_by_from_type.json").exists()
        else ("unavailable", [], {"status": "unavailable", "reason": "not fetched"})
    )
    to_status, corpus_to, to_payload = (
        load_report(current_dir / "corpus_by_to_type.json")
        if (current_dir / "corpus_by_to_type.json").exists()
        else ("unavailable", [], {"status": "unavailable", "reason": "not fetched"})
    )
    to_id_status, corpus_to_id, to_id_payload = (
        load_report(current_dir / "corpus_by_to_id.json")
        if (current_dir / "corpus_by_to_id.json").exists()
        else ("unavailable", [], {"status": "unavailable", "reason": "not fetched"})
    )

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
    download_c, download_v = event_metrics("book_download")
    audio_c, audio_v = event_metrics("reader_audio_started")
    path_c, path_v = event_metrics("reading_path_started")
    corpus_c, corpus_v = event_metrics("corpus_navigation")
    custom_total = sum(metric_int(r, "count") for r in events_by_name)

    channels = channel_breakdown(referrers)

    prior_block = ""
    if prior_dir and prior_since and prior_until:
        _, prior_visits, _ = load_report(prior_dir / "visits_count.json")
        prior = prior_visits[0] if prior_visits else {}
        p_pv = metric_int(prior, "pageviews")
        p_vis = metric_int(prior, "visitors")
        _, prior_events, _ = load_report(prior_dir / "events_by_name.json")
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
                f"Prior window: **{prior_since} → {prior_until}** "
                "(America/Denver completed calendar days; same length as current).",
                "",
                fmt_table(
                    ["Metric", "Current", "Prior", "Delta"],
                    [
                        ["Visitors", str(visitors), str(p_vis), str(visitors - p_vis)],
                        ["Pageviews", str(pageviews), str(p_pv), str(pageviews - p_pv)],
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

    path_limit_shown = 15
    path_query_limit = 30
    path_top = top_rows(paths, "requestPath", limit=path_limit_shown)
    if not path_top:
        path_top = top_rows(paths, "route", limit=path_limit_shown)

    # Partial family rollup: pageviews only (visitor sums across paths are not distinct).
    families: dict[str, dict[str, int]] = defaultdict(lambda: {"pageviews": 0})
    for label, pv, _vis in path_top:
        families[path_family(label)]["pageviews"] += pv

    pairs = attribution_pairs(pairs_rows)
    source_thinker_pairs = [p for p in pairs if is_source_or_thinker_path(p[0])]
    other_pairs = [p for p in pairs if not is_source_or_thinker_path(p[0])]
    edges = edge_type_pairs(edges_rows)

    utc_bounds_line = (
        f"API query bounds (as resolved by Vercel): **{query_since_utc or '(unknown)'}** → "
        f"**{query_until_utc or '(unknown)'}**  "
    )

    lines: list[str] = [
        "# Reader analytics — After Certainty",
        "",
        f"Generated: **{generated_at.astimezone(UTC).strftime('%Y-%m-%d %H:%M UTC')}**  ",
        "Timezone for week labels: **America/Denver** (last 7 **completed** days ending yesterday)  ",
        f"Current window (Denver calendar): **{since} → {until}** (inclusive completed days)  ",
        utc_bounds_line,
        "Note: Vercel date params map to UTC midnights; non-midnight ISO times are truncated.  ",
        "Source: Vercel Web Analytics aggregate API (project `after-certainty`)",
        "",
        "## Limitations",
        "",
        "- These are **aggregate** pageviews, visitors, and event counts — **not** session-level journeys.",
        "- Do not treat event ratios as per-reader conversion or completion rates.",
        "- Custom events and pageviews use different identification methods than GA4; expect directional, not exact, parity.",
        "- Origin→destination claims require joint `requestPath` × `eventData/to_id` rows with non-empty `to_id`; empty `to_id` is legacy/type-only.",
        "- Anomaly classes are **heuristics**, not confirmed bot identity. Never silently exclude traffic from headlines.",
        "- Unavailable optional queries are labeled explicitly — never rendered as genuine zeroes.",
        "- Fake/sentinel API payloads fail closed and do not produce a brief.",
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
        lines.append("_No daily rows (true empty result)._")

    lines.extend(
        [
            "",
            "## 2. Discovery channels and referrers",
            "",
            fmt_table(
                ["Channel class", "Visitors", "Pageviews"],
                channel_rows or [["(none)", "0", "0"]],
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
        ]
    )

    if paths_status == "unavailable":
        lines.extend(
            [
                "## 3. Top overall paths (partial family breakdown)",
                "",
                f"_Unavailable — {unavailable_reason(paths_payload)}. Not a zero-paths result._",
                "",
            ]
        )
    else:
        lines.extend(
            [
                "## 3. Top overall paths (partial family breakdown)",
                "",
                f"Coverage: top **{path_limit_shown}** of up to **{path_query_limit}** overall "
                "`requestPath` rows (not family-complete). Path-prefix filters are unsupported "
                "by this API, so family rollups are **pageviews among those truncated rows only** — "
                "not distinct visitors and not a full census of sources/thinkers/chapters.",
                "",
                "Partial family pageview rollup (from the truncated top paths):",
                "",
                fmt_table(
                    ["Family", "Pageviews (partial)"],
                    [
                        [fam, str(vals["pageviews"])]
                        for fam, vals in sorted(
                            families.items(), key=lambda kv: -kv[1]["pageviews"]
                        )
                    ]
                    or [["(none)", "0"]],
                ),
                "",
                "Top overall paths:",
                "",
                fmt_table(
                    ["Path", "Visitors", "Pageviews"],
                    [[label, str(vis), str(pv)] for label, pv, vis in path_top]
                    or [["(none)", "0", "0"]],
                ),
                "",
            ]
        )

    lines.extend(
        [
            "## 4. Source/thinker → book/chapter navigation",
            "",
            f"`corpus_navigation` events (by name): **{corpus_c}** count / **{corpus_v}** visitors.",
            "",
        ]
    )

    lines.extend(
        _section_or_unavailable(
            title="### Origin path × `to_id` (joint attribution)",
            status=pairs_status,
            payload=pairs_payload,
            ok_lines=[
                "### Origin path × `to_id` (joint attribution)",
                "",
                "Pairs answer which origin page targeted which destination ID. "
                "Empty `to_id` rows are **legacy/type-only** — do not claim a specific destination.",
                "",
                "Source/thinker origins:",
                "",
                fmt_table(
                    ["Origin path", "to_id", "Count", "Visitors", "Status"],
                    [
                        [
                            origin,
                            to_id or "(empty)",
                            str(count),
                            str(vis),
                            label,
                        ]
                        for origin, to_id, count, vis, label in source_thinker_pairs[:20]
                    ]
                    or [["(none)", "—", "0", "0", "no rows"]],
                ),
                "",
                "Other origins (same joint query):",
                "",
                fmt_table(
                    ["Origin path", "to_id", "Count", "Visitors", "Status"],
                    [
                        [
                            origin,
                            to_id or "(empty)",
                            str(count),
                            str(vis),
                            label,
                        ]
                        for origin, to_id, count, vis, label in other_pairs[:10]
                    ]
                    or [["(none)", "—", "0", "0", "no rows"]],
                ),
                "",
            ],
        )
    )

    lines.extend(
        _section_or_unavailable(
            title="### Edge types (`from_type` × `to_type`)",
            status=edges_status,
            payload=edges_payload,
            ok_lines=[
                "### Edge types (`from_type` × `to_type`)",
                "",
                "Joint grouping — not separate marginal totals — so source→chapter counts are real edge counts.",
                "",
                fmt_table(
                    ["from_type", "to_type", "Count", "Visitors"],
                    [[frm, to, str(count), str(vis)] for frm, to, count, vis in edges[:15]]
                    or [["(none)", "(none)", "0", "0"]],
                ),
                "",
            ],
        )
    )

    # Optional marginal context (clearly labeled secondary).
    if from_status != "unavailable" or to_status != "unavailable" or to_id_status != "unavailable":
        lines.extend(
            [
                "### Secondary marginal totals (not attribution pairs)",
                "",
                "_Shown only as context; prefer the joint tables above._",
                "",
            ]
        )
        if from_status == "ok" or from_status == "empty":
            lines.extend(
                [
                    fmt_table(
                        ["from_type", "Count", "Visitors"],
                        [
                            [label, str(pv), str(vis)]
                            for label, pv, vis in top_rows(
                                corpus_from,
                                "eventData/from_type",
                                value_keys=("count",),
                                limit=10,
                            )
                        ]
                        or [["(none)", "0", "0"]],
                    ),
                    "",
                ]
            )
        elif from_status == "unavailable":
            lines.append(f"_from_type marginal unavailable — {unavailable_reason(from_payload)}_")
            lines.append("")
        if to_status == "ok" or to_status == "empty":
            lines.extend(
                [
                    fmt_table(
                        ["to_type", "Count", "Visitors"],
                        [
                            [label, str(pv), str(vis)]
                            for label, pv, vis in top_rows(
                                corpus_to,
                                "eventData/to_type",
                                value_keys=("count",),
                                limit=10,
                            )
                        ]
                        or [["(none)", "0", "0"]],
                    ),
                    "",
                ]
            )
        elif to_status == "unavailable":
            lines.append(f"_to_type marginal unavailable — {unavailable_reason(to_payload)}_")
            lines.append("")
        if to_id_status == "ok" or to_id_status == "empty":
            lines.extend(
                [
                    fmt_table(
                        ["to_id (marginal)", "Count", "Visitors"],
                        [
                            [label or "(empty)", str(pv), str(vis)]
                            for label, pv, vis in top_rows(
                                corpus_to_id,
                                "eventData/to_id",
                                value_keys=("count",),
                                limit=15,
                            )
                        ]
                        or [["(none)", "0", "0"]],
                    ),
                    "",
                ]
            )
        elif to_id_status == "unavailable":
            lines.append(f"_to_id marginal unavailable — {unavailable_reason(to_id_payload)}_")
            lines.append("")

    lines.extend(
        [
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
    _, visits, _ = load_report(current_dir / "visits_count.json")
    visit_totals = visits[0] if visits else {}
    _, events_by_name, _ = load_report(current_dir / "events_by_name.json")
    return {
        "timezone": "America/Denver",
        "window_rule": "last_7_completed_denver_days_ending_yesterday",
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
            "fail_closed_on_fake_payloads",
            "unavailable_optional_queries_labeled",
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
        # Exclusive API end = start of the day after the inclusive until label (Denver midnight → UTC).
        current_until_exclusive = cur_u + timedelta(days=1)
        prior_until_exclusive = pri_u + timedelta(days=1)
        print(
            json.dumps(
                {
                    "timezone": "America/Denver",
                    "window_rule": "last_7_completed_denver_days_ending_yesterday",
                    "current": {"since": cs, "until": cu},
                    "prior": {"since": ps, "until": pu},
                    "current_since_denver_midnight_utc": denver_midnight_utc_iso(cur_s),
                    "current_until_exclusive_denver_midnight_utc": denver_midnight_utc_iso(
                        current_until_exclusive
                    ),
                    "prior_since_denver_midnight_utc": denver_midnight_utc_iso(pri_s),
                    "prior_until_exclusive_denver_midnight_utc": denver_midnight_utc_iso(
                        prior_until_exclusive
                    ),
                    "api_note": (
                        "Pass since/until as inclusive YYYY-MM-DD Denver calendar labels. "
                        "Vercel resolves date params to UTC midnights and truncates non-midnight "
                        "ISO times; until date is inclusive (exclusive end = next UTC day)."
                    ),
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
