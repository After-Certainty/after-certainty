#!/usr/bin/env python3
"""Render the ga-trends markdown brief from GA4 runReport JSON files.

Used by ``scripts/ga-trends-test.sh`` (PADE pack) and unit tests.
Never print access tokens. Event parameters are IDs/slugs only — no query text.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# Shipped ``AnalyticsEvents`` names from apps/site/lib/analytics/events.ts.
# ``question_path_complete`` is defined but not currently fired; keep it here so
# the inList report picks it up if it starts landing.
SITE_CUSTOM_EVENTS: tuple[str, ...] = (
    "select_content",
    "file_download",
    "click",
    "search_open",
    "search_query",
    "search_select",
    "search_refine",
    "search_no_results",
    "search_expand",
    "question_section_view",
    "question_select",
    "question_path_start",
    "question_stop_open",
    "question_path_complete",
    "question_related_select",
    "question_continue_book",
    "question_search_handoff",
    "question_observatory_pathway",
    "trail_index_view",
    "trail_select",
    "trail_path_start",
    "trail_stop_open",
    "trail_related_select",
    "trail_continue_book",
    "trail_search_handoff",
    "trail_observatory_pathway",
    "books_catalog_view",
    "books_shelf_select",
    "books_filter_apply",
    "books_filter_remove",
    "books_filters_reset",
    "books_sort_change",
    "books_search",
    "books_card_select",
    "books_no_match",
    "books_start_here_select",
    "edition_current_select",
    "edition_companion_select",
    "edition_notice_view",
    "whats_new_view",
    "whats_new_select",
    "whats_new_filter",
    "whats_new_home_select",
    "book_overview_primary_action",
    "book_overview_concept_select",
    "book_overview_related_select",
    "book_overview_edition_history_open",
    "chapter_open",
    "next_chapter",
    "game_started",
    "challenge_answered",
    "challenge_completed",
    "related_content_opened",
    "session_completed",
    "session_delight_shown",
)

# GA4 inListFilter allows at most 50 values; split into orGroup chunks.
IN_LIST_MAX = 50

RECOMMENDED_EVENTS: tuple[str, ...] = ("select_content", "file_download", "click")

SURFACE_GROUPS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Reader", ("chapter_open", "next_chapter", "file_download")),
    (
        "Search",
        (
            "search_open",
            "search_query",
            "search_select",
            "search_refine",
            "search_no_results",
            "search_expand",
        ),
    ),
    (
        "Questions",
        (
            "question_section_view",
            "question_select",
            "question_path_start",
            "question_stop_open",
            "question_related_select",
            "question_continue_book",
            "question_search_handoff",
            "question_observatory_pathway",
        ),
    ),
    (
        "Trails",
        (
            "trail_index_view",
            "trail_select",
            "trail_path_start",
            "trail_stop_open",
            "trail_related_select",
            "trail_continue_book",
            "trail_search_handoff",
            "trail_observatory_pathway",
        ),
    ),
    (
        "Books catalog",
        (
            "books_catalog_view",
            "books_shelf_select",
            "books_filter_apply",
            "books_filter_remove",
            "books_filters_reset",
            "books_sort_change",
            "books_search",
            "books_card_select",
            "books_no_match",
            "books_start_here_select",
        ),
    ),
    (
        "Book overview",
        (
            "book_overview_primary_action",
            "book_overview_concept_select",
            "book_overview_related_select",
            "book_overview_edition_history_open",
            "edition_current_select",
            "edition_companion_select",
            "edition_notice_view",
        ),
    ),
    ("Observatory", ("select_content",)),
    (
        "What's new",
        ("whats_new_view", "whats_new_select", "whats_new_filter", "whats_new_home_select"),
    ),
    (
        "Games",
        (
            "game_started",
            "challenge_answered",
            "challenge_completed",
            "related_content_opened",
            "session_completed",
            "session_delight_shown",
        ),
    ),
    ("Outbound / downloads", ("click", "file_download")),
)

AREA_ORDER: tuple[str, ...] = (
    "home",
    "start",
    "reader",
    "books",
    "explore",
    "questions",
    "trails",
    "search",
    "games",
    "whats-new",
    "podcast",
    "other",
)

AREA_LABELS: dict[str, str] = {
    "home": "Home (`/`)",
    "start": "Start (`/start`)",
    "reader": "Reader (chapter pages)",
    "books": "Books catalog / overview",
    "explore": "Explore / Observatory (other)",
    "questions": "Questions",
    "trails": "Trails",
    "search": "Search",
    "games": "Games",
    "whats-new": "What's new",
    "podcast": "Podcast",
    "other": "Other",
}

_BOOK_RE = re.compile(r"^/explore/books/([^/]+)")
_CHAPTER_RE = re.compile(r"^/explore/books/([^/]+)/chapters/([^/?]+)")
_QUESTION_RE = re.compile(r"^/questions/([^/]+)")
_TRAIL_RE = re.compile(r"^/trails/([^/]+)")
_CATALOG_BOOK_SEGMENTS = frozenset({"shelves"})


def load_report(out_dir: Path, report_id: str) -> dict[str, Any]:
    path = out_dir / f"{report_id}.json"
    if not path.is_file():
        return {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def rows(data: dict[str, Any]) -> list[dict[str, str]]:
    dims = [d["name"] for d in data.get("dimensionHeaders", [])]
    metrics = [m["name"] for m in data.get("metricHeaders", [])]
    result: list[dict[str, str]] = []
    for row in data.get("rows", []) or []:
        dvals = [v.get("value", "") for v in row.get("dimensionValues", [])]
        mvals = [v.get("value", "") for v in row.get("metricValues", [])]
        result.append(dict(zip(dims + metrics, dvals + mvals, strict=False)))
    return result


def fmt_date(value: str) -> str:
    if len(value) == 8 and value.isdigit():
        return f"{value[:4]}-{value[4:6]}-{value[6:8]}"
    return value


def num(value: str | None) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def pct(part: float, total: float) -> str:
    return f"{100 * part / total:.1f}%" if total else "—"


def fmt_engagement_rate(value: str | None) -> str:
    if value in (None, "", "—"):
        return "—"
    n = num(value)
    if n <= 1:
        return f"{100 * n:.1f}%"
    return f"{n:.1f}%"


def fmt_duration(value: str | None) -> str:
    if value in (None, "", "—"):
        return "—"
    secs = num(value)
    if secs >= 60:
        minutes = int(secs // 60)
        rem = int(round(secs % 60))
        return f"{minutes}m {rem}s"
    return f"{secs:.1f}s"


def strip_query(page_path: str) -> str:
    return (page_path or "").split("?", 1)[0]


def normalize_path(page_path: str) -> str:
    path = strip_query(page_path).rstrip("/") or "/"
    if not path.startswith("/"):
        path = f"/{path}"
    return path


def path_area(page_path: str) -> str:
    path = normalize_path(page_path)
    if path == "/":
        return "home"
    if path == "/start" or path.startswith("/start/"):
        return "start"
    if path.startswith("/explore/books/") and "/chapters/" in path:
        return "reader"
    if path == "/explore/books" or path.startswith("/explore/books/"):
        return "books"
    if path == "/explore" or path.startswith("/explore/"):
        return "explore"
    if path == "/questions" or path.startswith("/questions/"):
        return "questions"
    if path == "/trails" or path.startswith("/trails/"):
        return "trails"
    if path == "/search" or path.startswith("/search/"):
        return "search"
    if path == "/games" or path.startswith("/games/"):
        return "games"
    if path == "/whats-new" or path.startswith("/whats-new/"):
        return "whats-new"
    if path == "/podcast" or path.startswith("/podcast/"):
        return "podcast"
    return "other"


def book_slug_from_path(page_path: str) -> str | None:
    path = normalize_path(page_path)
    match = _BOOK_RE.match(path)
    if not match:
        return None
    slug = match.group(1)
    if slug in _CATALOG_BOOK_SEGMENTS:
        return None
    return slug


def question_slug_from_path(page_path: str) -> str | None:
    path = normalize_path(page_path)
    if path == "/questions":
        return None
    match = _QUESTION_RE.match(path)
    return match.group(1) if match else None


def trail_slug_from_path(page_path: str) -> str | None:
    path = normalize_path(page_path)
    if path == "/trails":
        return None
    match = _TRAIL_RE.match(path)
    return match.group(1) if match else None


def chapter_key_from_path(page_path: str) -> str | None:
    path = normalize_path(page_path)
    match = _CHAPTER_RE.match(path)
    if not match:
        return None
    return f"{match.group(1)}/{match.group(2)}"


def session_source_host(source_medium: str) -> str:
    """Return the GA4 source host from ``source / medium`` (never a URL substring)."""
    return source_medium.split(" / ", 1)[0].strip().lower()


def is_facebook_session_source(source_medium: str) -> bool:
    """True when the session source host is facebook.com or a subdomain."""
    host = session_source_host(source_medium)
    return host == "facebook.com" or host.endswith(".facebook.com")


def event_counts(event_rows: list[dict[str, str]]) -> dict[str, float]:
    counts: dict[str, float] = {}
    for row in event_rows:
        name = row.get("eventName", "")
        if not name:
            continue
        counts[name] = counts.get(name, 0.0) + num(row.get("eventCount"))
    return counts


def funnel_stats(counts: dict[str, float]) -> dict[str, float | None]:
    chapter_open = counts.get("chapter_open", 0.0)
    next_chapter = counts.get("next_chapter", 0.0)
    file_download = counts.get("file_download", 0.0)
    return {
        "chapter_open": chapter_open,
        "next_chapter": next_chapter,
        "file_download": file_download,
        "advance_rate": (next_chapter / chapter_open) if chapter_open else None,
        "download_rate": (file_download / chapter_open) if chapter_open else None,
    }


def search_health(counts: dict[str, float]) -> dict[str, float | None]:
    queries = counts.get("search_query", 0.0)
    no_results = counts.get("search_no_results", 0.0)
    selects = counts.get("search_select", 0.0)
    opens = counts.get("search_open", 0.0)
    return {
        "search_open": opens,
        "search_query": queries,
        "search_no_results": no_results,
        "search_select": selects,
        "no_result_rate": (no_results / queries) if queries else None,
        "select_rate": (selects / queries) if queries else None,
    }


def bucket_page_views(page_rows: list[dict[str, str]]) -> dict[str, float]:
    buckets: dict[str, float] = defaultdict(float)
    for row in page_rows:
        area = path_area(row.get("pagePath", ""))
        buckets[area] += num(row.get("screenPageViews"))
    return dict(buckets)


def top_by_slug(
    page_rows: list[dict[str, str]],
    slug_fn,
    *,
    limit: int = 8,
) -> list[tuple[str, float]]:
    totals: dict[str, float] = defaultdict(float)
    for row in page_rows:
        slug = slug_fn(row.get("pagePath", ""))
        if slug:
            totals[slug] += num(row.get("screenPageViews"))
    ranked = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    return ranked[:limit]


def event_name_filter(names: tuple[str, ...] = SITE_CUSTOM_EVENTS) -> dict[str, Any]:
    chunks = [list(names[i : i + IN_LIST_MAX]) for i in range(0, len(names), IN_LIST_MAX)]
    expressions = [
        {
            "filter": {
                "fieldName": "eventName",
                "inListFilter": {"values": chunk, "caseSensitive": True},
            }
        }
        for chunk in chunks
    ]
    if len(expressions) == 1:
        return expressions[0]
    return {"orGroup": {"expressions": expressions}}


def mcp_event_name_filter(names: tuple[str, ...] = SITE_CUSTOM_EVENTS) -> dict[str, Any]:
    chunks = [list(names[i : i + IN_LIST_MAX]) for i in range(0, len(names), IN_LIST_MAX)]
    expressions = [
        {
            "filter": {
                "field_name": "eventName",
                "in_list_filter": {"values": chunk, "case_sensitive": True},
            }
        }
        for chunk in chunks
    ]
    if len(expressions) == 1:
        return expressions[0]
    return {"or_group": {"expressions": expressions}}


def report_body(report_id: str) -> dict[str, Any]:
    last7 = [{"startDate": "7daysAgo", "endDate": "today", "name": "Last7Days"}]
    if report_id == "12":
        return {
            "dateRanges": last7,
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}, {"name": "activeUsers"}],
            "dimensionFilter": event_name_filter(),
            "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
            "limit": 50,
        }
    if report_id == "13":
        return {
            "dateRanges": last7,
            "dimensions": [{"name": "landingPage"}],
            "metrics": [{"name": "sessions"}, {"name": "activeUsers"}],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 15,
        }
    if report_id == "13b":
        return {
            "dateRanges": last7,
            "dimensions": [{"name": "landingPagePlusQueryString"}],
            "metrics": [{"name": "sessions"}, {"name": "activeUsers"}],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 15,
        }
    if report_id == "14":
        return {
            "dateRanges": last7,
            "dimensions": [
                {"name": "customEvent:content_type"},
                {"name": "customEvent:item_id"},
                {"name": "customEvent:method"},
            ],
            "metrics": [{"name": "eventCount"}, {"name": "activeUsers"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "stringFilter": {
                        "matchType": "EXACT",
                        "value": "select_content",
                        "caseSensitive": True,
                    },
                }
            },
            "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
            "limit": 15,
        }
    if report_id == "15":
        return {
            "dateRanges": last7,
            "dimensions": [
                {"name": "customEvent:location"},
                {"name": "customEvent:platform"},
            ],
            "metrics": [{"name": "eventCount"}, {"name": "activeUsers"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "stringFilter": {
                        "matchType": "EXACT",
                        "value": "click",
                        "caseSensitive": True,
                    },
                }
            },
            "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
            "limit": 15,
        }
    raise ValueError(f"unknown report id {report_id!r}")


def _overview_by_range(ov_rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    by_range: dict[str, dict[str, str]] = {}
    for row in ov_rows:
        by_range.setdefault(row.get("dateRange", "Last7Days"), row)
    return by_range


def _fmt_metric(row: dict[str, str], key: str) -> str:
    if key == "engagementRate":
        return fmt_engagement_rate(row.get(key))
    if key == "averageSessionDuration":
        return fmt_duration(row.get(key))
    return row.get(key, "—") or "—"


def _headline(cur_sessions: float, prior_sessions: float) -> str:
    if cur_sessions == 0:
        return (
            "No sessions in the last 7 days — property may be low-traffic, "
            "consent-gated, or data still processing."
        )
    if prior_sessions:
        delta = (cur_sessions - prior_sessions) / prior_sessions * 100
        direction = "up" if delta > 5 else "down" if delta < -5 else "flat"
        return (
            f"Traffic is **{direction}** week-over-week "
            f"({cur_sessions:.0f} vs {prior_sessions:.0f} prior-week sessions, {delta:+.0f}%). "
            "Low volume — interpret cautiously."
        )
    return f"**{cur_sessions:.0f} sessions** in the last 7 days. Prior-week comparison unavailable or zero."


def _landing_path(row: dict[str, str]) -> str:
    return row.get("landingPage") or row.get("landingPagePlusQueryString") or ""


def render_brief(out_dir: Path, *, pulled: str | None = None) -> str:
    ov_rows = rows(load_report(out_dir, "1"))
    by_range = _overview_by_range(ov_rows)
    cur = by_range.get("Last7Days", {})
    prior = by_range.get("Prior7Days", {})
    total_sessions = num(cur.get("sessions"))

    os_rows = rows(load_report(out_dir, "9"))
    mobile_rows = rows(load_report(out_dir, "10"))
    src_rows = rows(load_report(out_dir, "11"))
    page_rows = rows(load_report(out_dir, "4"))
    all_event_rows = rows(load_report(out_dir, "5"))
    custom_event_rows = rows(load_report(out_dir, "12")) or [
        r for r in all_event_rows if r.get("eventName") in SITE_CUSTOM_EVENTS
    ]
    landing_rows = rows(load_report(out_dir, "13"))
    device_rows = rows(load_report(out_dir, "6"))
    geo_rows = rows(load_report(out_dir, "7"))

    counts = event_counts(custom_event_rows)
    funnel = funnel_stats(counts)
    search = search_health(counts)
    areas = bucket_page_views(page_rows)

    definite_not_you = sum(
        num(r.get("sessions"))
        for r in os_rows
        if r.get("operatingSystem") in ("Android", "Linux", "Windows")
    )
    mac_ios_pool = sum(
        num(r.get("sessions")) for r in os_rows if r.get("operatingSystem") in ("Macintosh", "iOS")
    )
    macintosh_sessions = sum(
        num(r.get("sessions")) for r in os_rows if r.get("operatingSystem") == "Macintosh"
    )
    iphone13_you = sum(
        num(r.get("sessions")) for r in mobile_rows if r.get("mobileDeviceModel") == "iPhone 13"
    )
    tooling_you = sum(
        num(r.get("sessions"))
        for r in src_rows
        if r.get("sessionSourceMedium")
        in ("vercel.com / referral", "tagassistant.google.com / referral")
    )
    social_referral = sum(
        num(r.get("sessions"))
        for r in src_rows
        if is_facebook_session_source(r.get("sessionSourceMedium", ""))
    )

    you_signals = tooling_you + iphone13_you + round(macintosh_sessions * 0.65)
    you_mid = min(mac_ios_pool, you_signals)
    not_you_mid = total_sessions - you_mid
    not_you_low = definite_not_you
    not_you_high = definite_not_you + social_referral

    today = pulled or datetime.now(UTC).strftime("%Y-%m-%d")
    lines: list[str] = []
    add = lines.append

    add("# GA trends — After Certainty")
    add(
        f"**Property:** after-certainty (broker GA_PROPERTY_ID) · "
        f"**Range:** 7daysAgo → today · **Pulled:** {today}"
    )
    add("")
    add("## Headline")
    add(_headline(total_sessions, num(prior.get("sessions")) if prior else 0))
    add("")
    add("## Overview")
    add("| Metric | This period | Prior period |")
    add("|--------|------------:|-------------:|")
    overview_metrics = [
        "sessions",
        "activeUsers",
        "newUsers",
        "screenPageViews",
        "engagedSessions",
        "engagementRate",
        "averageSessionDuration",
        "eventCount",
    ]
    for metric in overview_metrics:
        left = _fmt_metric(cur, metric)
        right = _fmt_metric(prior, metric) if prior else "—"
        add(f"| {metric} | {left} | {right} |")

    add("")
    add("## Daily")
    add("| Date | Sessions | Users | Page views |")
    add("|------|----------:|------:|-----------:|")
    daily = rows(load_report(out_dir, "2"))
    if daily:
        for row in daily:
            add(
                f"| {fmt_date(row.get('date', ''))} | {row.get('sessions', '0')} | "
                f"{row.get('activeUsers', '0')} | {row.get('screenPageViews', '0')} |"
            )
    else:
        add("| — | 0 | 0 | 0 |")

    add("")
    add("## Channels")
    add("| Channel | Sessions | Users |")
    add("|---------|----------:|------:|")
    channels = rows(load_report(out_dir, "3"))
    if channels:
        for row in channels[:10]:
            add(
                f"| {row.get('sessionDefaultChannelGroup', '')} | "
                f"{row.get('sessions', '0')} | {row.get('activeUsers', '0')} |"
            )
    else:
        add("| — | 0 | 0 |")

    add("")
    add("## Devices")
    add("| Device | Sessions | Users |")
    add("|--------|----------:|------:|")
    if device_rows:
        for row in device_rows:
            add(
                f"| {row.get('deviceCategory', '')} | "
                f"{row.get('sessions', '0')} | {row.get('activeUsers', '0')} |"
            )
    else:
        add("| — | 0 | 0 |")

    add("")
    add("## Geography")
    add("| Country | Sessions | Users |")
    add("|---------|----------:|------:|")
    if geo_rows:
        for row in geo_rows[:10]:
            add(
                f"| {row.get('country', '')} | "
                f"{row.get('sessions', '0')} | {row.get('activeUsers', '0')} |"
            )
    else:
        add("| — | 0 | 0 |")

    add("")
    add("## Where they land")
    add("| Landing page | Sessions | Users |")
    add("|--------------|----------:|------:|")
    if landing_rows:
        for row in landing_rows[:15]:
            path = _landing_path(row) or "(not set)"
            add(f"| `{path}` | {row.get('sessions', '0')} | {row.get('activeUsers', '0')} |")
    else:
        add("| — | 0 | 0 |")

    add("")
    add("## What they view (path areas)")
    add("| Area | Page views |")
    add("|------|-----------:|")
    if page_rows:
        for area in AREA_ORDER:
            views = areas.get(area, 0.0)
            if views:
                add(f"| {AREA_LABELS[area]} | {views:.0f} |")
    else:
        add("| — | 0 |")

    add("")
    add("## Top pages")
    add("| Page | Views | Users |")
    add("|------|------:|------:|")
    if page_rows:
        for row in page_rows[:15]:
            add(
                f"| `{row.get('pagePath', '')}` | "
                f"{row.get('screenPageViews', '0')} | {row.get('activeUsers', '0')} |"
            )
    else:
        add("| — | 0 | 0 |")

    add("")
    add("## Top content (from URLs)")
    add(
        "Slugs parsed from `pagePath` only — not event parameters. Custom dimensions are not required."
    )
    add("")
    books = top_by_slug(page_rows, book_slug_from_path)
    questions = top_by_slug(page_rows, question_slug_from_path)
    trails = top_by_slug(page_rows, trail_slug_from_path)
    chapters = top_by_slug(page_rows, chapter_key_from_path)
    if books:
        add("**Books**")
        for slug, views in books:
            add(f"- `{slug}`: {views:.0f} {'view' if views == 1 else 'views'}")
        add("")
    if questions:
        add("**Questions**")
        for slug, views in questions:
            add(f"- `{slug}`: {views:.0f} {'view' if views == 1 else 'views'}")
        add("")
    if trails:
        add("**Trails**")
        for slug, views in trails:
            add(f"- `{slug}`: {views:.0f} {'view' if views == 1 else 'views'}")
        add("")
    if chapters:
        add("**Chapters**")
        for slug, views in chapters:
            add(f"- `{slug}`: {views:.0f} {'view' if views == 1 else 'views'}")
        add("")
    if not (books or questions or trails or chapters):
        add("No book, question, trail, or chapter paths in the top pages report.")
        add("")

    add("## Events")
    add("| Event | Count |")
    add("|-------|------:|")
    custom_set = set(SITE_CUSTOM_EVENTS)
    if all_event_rows:
        for row in all_event_rows[:15]:
            name = row.get("eventName", "")
            flag = " ⭐" if name in custom_set else ""
            add(f"| {name}{flag} | {row.get('eventCount', '0')} |")
    else:
        add("| — | 0 |")

    add("")
    add("## What they did (product activity)")
    add(
        "Site custom events from report 12 (`eventName` inList). "
        "Empty surfaces omitted. Event parameters (`book_id`, `question_id`, …) "
        "are not in this table unless registered as GA4 custom dimensions."
    )
    add("")
    any_surface = False
    for title, names in SURFACE_GROUPS:
        present = [(name, counts.get(name, 0.0)) for name in names if counts.get(name, 0.0) > 0]
        if not present:
            continue
        any_surface = True
        add(f"### {title}")
        add("| Event | Count |")
        add("|-------|------:|")
        for name, count in present:
            add(f"| {name} | {count:.0f} |")
        add("")
    if not any_surface:
        add("No site custom events in this period.")
        add("")

    missing_recommended = [name for name in RECOMMENDED_EVENTS if counts.get(name, 0.0) <= 0]
    if missing_recommended:
        add(
            "Recommended events with **no** counts: "
            + ", ".join(f"`{name}`" for name in missing_recommended)
            + " — low traffic, consent denied, or (for `click` / `file_download`) "
            "Enhanced Measurement vs site `trackEvent` mismatch."
        )
        add("")

    observatory_rows = rows(load_report(out_dir, "14"))
    click_rows = rows(load_report(out_dir, "15"))
    if observatory_rows:
        add("### Observatory focus (`select_content`)")
        add("| content_type | item_id | method | Count |")
        add("|--------------|---------|--------|------:|")
        for row in observatory_rows[:15]:
            add(
                f"| {row.get('customEvent:content_type', '')} | "
                f"`{row.get('customEvent:item_id', '')}` | "
                f"{row.get('customEvent:method', '')} | "
                f"{row.get('eventCount', '0')} |"
            )
        add("")
    if click_rows:
        add("### Outbound clicks (`location` / `platform`)")
        add("| location | platform | Count |")
        add("|----------|----------|------:|")
        for row in click_rows[:15]:
            add(
                f"| {row.get('customEvent:location', '')} | "
                f"{row.get('customEvent:platform', '') or '—'} | "
                f"{row.get('eventCount', '0')} |"
            )
        add("")

    add("## Reader funnel")
    add(
        "Heuristic counts only — not a session-scoped GA4 funnel. "
        "ANALYTICS-001: `chapter_open` → `next_chapter` → `file_download`."
    )
    add("")
    add("| Step | Count | vs chapter_open |")
    add("|------|------:|----------------:|")
    chapter_open = funnel["chapter_open"] or 0.0
    add(f"| chapter_open | {chapter_open:.0f} | {'100.0%' if chapter_open else '—'} |")
    add(
        f"| next_chapter | {funnel['next_chapter'] or 0:.0f} | "
        f"{pct(funnel['next_chapter'] or 0, chapter_open)} |"
    )
    add(
        f"| file_download | {funnel['file_download'] or 0:.0f} | "
        f"{pct(funnel['file_download'] or 0, chapter_open)} |"
    )
    add("")
    advance = funnel["advance_rate"]
    download = funnel["download_rate"]
    if advance is not None:
        add(f"Advance rate (`next_chapter` / `chapter_open`): {advance:.2f}")
    else:
        add("Advance rate (`next_chapter` / `chapter_open`): —")
    if download is not None:
        add(f"Download rate (`file_download` / `chapter_open`): {download:.2f}")
    else:
        add("Download rate (`file_download` / `chapter_open`): —")

    add("")
    add("## Search health")
    queries = search["search_query"] or 0.0
    add("| Event | Count | vs search_query |")
    add("|-------|------:|----------------:|")
    add(f"| search_open | {search['search_open'] or 0:.0f} | |")
    add(f"| search_query | {queries:.0f} | {'100.0%' if queries else '—'} |")
    add(
        f"| search_no_results | {search['search_no_results'] or 0:.0f} | "
        f"{pct(search['search_no_results'] or 0, queries)} |"
    )
    add(
        f"| search_select | {search['search_select'] or 0:.0f} | "
        f"{pct(search['search_select'] or 0, queries)} |"
    )
    add("")
    if queries:
        add(
            f"No-result rate: {pct(search['search_no_results'] or 0, queries)}; "
            f"select rate: {pct(search['search_select'] or 0, queries)}."
        )
    else:
        add("No `search_query` events this period — rates omitted.")

    add("")
    add("## Estimated you vs not you")
    add(
        "Heuristic only (owner devices: Mac + iPhone). "
        "Configure internal traffic in GA4 for a definitive split."
    )
    add("")
    add("| | Sessions | % of total |")
    add("|---|----------:|-----------:|")
    add(
        f"| **Definitely not you** (Android / Linux / Windows) | "
        f"{definite_not_you:.0f} | {pct(definite_not_you, total_sessions)} |"
    )
    add(f"| Mac + iOS pool (mixed) | {mac_ios_pool:.0f} | {pct(mac_ios_pool, total_sessions)} |")
    add(f"| — Tooling (Vercel, Tag Assistant) | {tooling_you:.0f} | |")
    add(f"| — iPhone 13 (model reported) | {iphone13_you:.0f} | |")
    add(f"| **Estimated you (middle)** | {you_mid:.0f} | {pct(you_mid, total_sessions)} |")
    add(
        f"| **Estimated not you (middle)** | {not_you_mid:.0f} | "
        f"{pct(not_you_mid, total_sessions)} |"
    )
    add("")
    add(
        f"Range: not you **low**–**high** = {not_you_low:.0f} – {not_you_high:.0f}; "
        "you the complement."
    )
    add("")
    add("**Device/OS (top):**")
    if os_rows:
        for row in os_rows[:8]:
            add(
                f"- {row.get('deviceCategory', '')}/{row.get('operatingSystem', '')}: "
                f"{row.get('sessions', '0')} sessions"
            )
    else:
        add("- none")
    add("")
    add("**Top sessionSourceMedium:**")
    if src_rows:
        for row in src_rows[:8]:
            add(f"- {row.get('sessionSourceMedium', '')}: {row.get('sessions', '0')} sessions")
    else:
        add("- none")

    rt = rows(load_report(out_dir, "8"))
    rt_screens = rows(load_report(out_dir, "8b"))
    active = rt[0].get("activeUsers", "0") if rt else "0"

    add("")
    add("## Realtime")
    add(f"Active users now: **{active}**")
    if rt_screens:
        add("")
        add("| Screen | Active users |")
        add("|--------|-------------:|")
        for row in rt_screens[:5]:
            add(f"| {row.get('unifiedScreenName', '(not set)')} | {row.get('activeUsers', '0')} |")

    add("")
    add("## Notes")
    custom_seen = [name for name, count in sorted(counts.items()) if count > 0]
    if custom_seen:
        add(f"- Custom events observed: {', '.join(custom_seen)}")
    else:
        add(
            "- No site custom events in report 12 — likely low traffic, consent denied, "
            "or data still processing."
        )
    add("- `question_path_complete` is defined in `AnalyticsEvents` but is not currently fired.")
    add("- GA does not label owner traffic without internal-traffic IP filters.")
    add("- iPhone model often reports as generic iPhone or (not set) even for owner device.")
    add(
        "- Registered custom dimensions today: `content_type`, `item_id`, `location`, "
        "`method`, `platform`, plus download fields (`file_extension`, `file_name`, "
        "`link_url`, `link_text`). Still **unregistered:** `book_id`, `question_id`, "
        "`trail_id`, `surface`, `action_kind` — those views use `pagePath` slugs."
    )
    add("- Suggested follow-ups:")
    add("  - Admin → Data streams → Define internal traffic for a definitive you vs not you split.")
    add(
        "  - Register event-scoped custom dimensions for `book_id`, `question_id`, "
        "`trail_id`, `surface`, `action_kind` if you want parameter breakdowns."
    )
    add("  - Ask for 28-day totals or an Explore-only filter if this window is too sparse.")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Render ga-trends brief or emit report JSON.")
    parser.add_argument("out_dir", nargs="?", help="Directory of report JSON files (1.json …)")
    parser.add_argument(
        "--report-body",
        metavar="ID",
        help="Print REST JSON body for report 12, 13, 13b, 14, or 15",
    )
    parser.add_argument("--pulled", help="Override Pulled: date (YYYY-MM-DD) for tests")
    args = parser.parse_args(argv)

    if args.report_body:
        json.dump(report_body(args.report_body), sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")
        return 0

    if not args.out_dir:
        parser.error("out_dir is required unless --report-body is set")

    sys.stdout.write(render_brief(Path(args.out_dir), pulled=args.pulled))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
