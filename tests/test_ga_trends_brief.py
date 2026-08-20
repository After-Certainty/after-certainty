"""Unit tests for ga-trends brief rendering (synthetic GA4 JSON, no network)."""

from __future__ import annotations

import json
from pathlib import Path

from ga_trends_brief import (
    IN_LIST_MAX,
    SITE_CUSTOM_EVENTS,
    book_slug_from_path,
    bucket_page_views,
    chapter_key_from_path,
    event_counts,
    event_name_filter,
    funnel_stats,
    mcp_event_name_filter,
    path_area,
    question_slug_from_path,
    render_brief,
    report_body,
    search_health,
    trail_slug_from_path,
)


def _row(dims: list[str], metrics: list) -> dict:
    return {
        "dimensionValues": [{"value": v} for v in dims],
        "metricValues": [{"value": str(v)} for v in metrics],
    }


def _report(
    dim_names: list[str], metric_names: list[str], rows: list[tuple[list[str], list]]
) -> dict:
    return {
        "dimensionHeaders": [{"name": n} for n in dim_names],
        "metricHeaders": [{"name": n} for n in metric_names],
        "rows": [_row(dims, metrics) for dims, metrics in rows],
    }


def _empty() -> dict:
    return {"dimensionHeaders": [], "metricHeaders": [], "rows": []}


def write_pack(tmp_path: Path, reports: dict[str, dict]) -> Path:
    for report_id, payload in reports.items():
        (tmp_path / f"{report_id}.json").write_text(json.dumps(payload), encoding="utf-8")
    return tmp_path


def test_path_area_buckets() -> None:
    assert path_area("/") == "home"
    assert path_area("/start") == "start"
    assert path_area("/explore/books/after-certainty/chapters/intro") == "reader"
    assert path_area("/explore/books/after-certainty") == "books"
    assert path_area("/explore/books") == "books"
    assert path_area("/explore/concepts/foo") == "explore"
    assert path_area("/questions/trust-survives-disagreement") == "questions"
    assert path_area("/trails/some-trail") == "trails"
    assert path_area("/search") == "search"
    assert path_area("/games/pattern-recognition") == "games"
    assert path_area("/whats-new") == "whats-new"
    assert path_area("/podcast") == "podcast"
    assert path_area("/privacy") == "other"


def test_slug_parsers_skip_indexes() -> None:
    assert book_slug_from_path("/explore/books/after-certainty") == "after-certainty"
    assert book_slug_from_path("/explore/books/shelves/start-here") is None
    assert book_slug_from_path("/explore/books") is None
    assert question_slug_from_path("/questions") is None
    assert question_slug_from_path("/questions/trust-survives-disagreement") == (
        "trust-survives-disagreement"
    )
    assert trail_slug_from_path("/trails") is None
    assert trail_slug_from_path("/trails/empty-lot") == "empty-lot"
    assert (
        chapter_key_from_path("/explore/books/how-meaning-moves/chapters/front-matter-introduction")
        == "how-meaning-moves/front-matter-introduction"
    )


def test_funnel_and_search_ratios() -> None:
    funnel = funnel_stats({"chapter_open": 10, "next_chapter": 4, "file_download": 1})
    assert funnel["advance_rate"] == 0.4
    assert funnel["download_rate"] == 0.1
    empty = funnel_stats({})
    assert empty["advance_rate"] is None
    health = search_health({"search_query": 10, "search_no_results": 2, "search_select": 5})
    assert health["no_result_rate"] == 0.2
    assert health["select_rate"] == 0.5
    assert search_health({})["no_result_rate"] is None


def test_event_counts_and_page_buckets() -> None:
    counts = event_counts(
        [
            {"eventName": "chapter_open", "eventCount": "3"},
            {"eventName": "chapter_open", "eventCount": "2"},
            {"eventName": "search_query", "eventCount": "4"},
        ]
    )
    assert counts == {"chapter_open": 5.0, "search_query": 4.0}
    areas = bucket_page_views(
        [
            {"pagePath": "/", "screenPageViews": "16"},
            {"pagePath": "/explore/books/ac/chapters/one", "screenPageViews": "6"},
            {"pagePath": "/questions/x", "screenPageViews": "3"},
        ]
    )
    assert areas["home"] == 16
    assert areas["reader"] == 6
    assert areas["questions"] == 3


def test_custom_event_filter_respects_inlist_cap() -> None:
    assert len(SITE_CUSTOM_EVENTS) > IN_LIST_MAX
    filt = event_name_filter()
    expressions = filt["orGroup"]["expressions"]
    assert len(expressions) >= 2
    named = []
    for expr in expressions:
        values = expr["filter"]["inListFilter"]["values"]
        assert len(values) <= IN_LIST_MAX
        named.extend(values)
    assert named == list(SITE_CUSTOM_EVENTS)
    mcp = mcp_event_name_filter()
    assert "or_group" in mcp
    body = report_body("12")
    assert body["limit"] == 50
    assert (
        body["dimensionFilter"]["orGroup"]["expressions"][0]["filter"]["fieldName"] == "eventName"
    )
    landing = report_body("13")
    assert landing["dimensions"][0]["name"] == "landingPage"
    fallback = report_body("13b")
    assert fallback["dimensions"][0]["name"] == "landingPagePlusQueryString"
    observatory = report_body("14")
    assert observatory["dimensions"][0]["name"] == "customEvent:content_type"
    clicks = report_body("15")
    assert clicks["dimensions"][0]["name"] == "customEvent:location"


def _overview_rows() -> dict:
    metrics = [
        "sessions",
        "activeUsers",
        "newUsers",
        "screenPageViews",
        "engagedSessions",
        "engagementRate",
        "averageSessionDuration",
        "eventCount",
    ]
    return _report(
        ["dateRange"],
        metrics,
        [
            (["Last7Days"], ["20", "8", "3", "50", "10", "0.4", "75", "100"]),
            (["Prior7Days"], ["40", "20", "10", "200", "30", "0.5", "90", "400"]),
        ],
    )


def test_empty_pack_renders_with_tmp(tmp_path: Path) -> None:
    for report_id in [str(i) for i in range(1, 14)] + ["8b"]:
        (tmp_path / f"{report_id}.json").write_text(json.dumps(_empty()), encoding="utf-8")
    text = render_brief(tmp_path, pulled="2026-08-20")
    assert "# GA trends — After Certainty" in text
    assert "No sessions in the last 7 days" in text
    assert "## What they did (product activity)" in text
    assert "## Reader funnel" in text
    assert "## Search health" in text
    assert "No `search_query` events this period" in text
    assert "question_path_complete" in text


def test_activity_fixture_groups_and_funnel(tmp_path: Path) -> None:
    reports = {
        "1": _overview_rows(),
        "2": _report(
            ["date"],
            ["sessions", "activeUsers", "screenPageViews"],
            [(["20260818"], ["5", "3", "9"])],
        ),
        "3": _report(
            ["sessionDefaultChannelGroup"],
            ["sessions", "activeUsers", "engagedSessions"],
            [(["Direct"], ["10", "6", "4"])],
        ),
        "4": _report(
            ["pagePath"],
            ["screenPageViews", "activeUsers"],
            [
                (["/"], ["16", "6"]),
                (["/start"], ["6", "4"]),
                (["/explore/books/after-certainty/chapters/ch-1"], ["6", "1"]),
                (["/explore/books/curiosity-before-certainty"], ["3", "2"]),
                (["/questions/trust-survives-disagreement"], ["3", "3"]),
                (["/trails/empty-lot"], ["2", "1"]),
            ],
        ),
        "5": _report(
            ["eventName"],
            ["eventCount"],
            [
                (["page_view"], ["61"]),
                (["chapter_open"], ["10"]),
                (["search_query"], ["8"]),
            ],
        ),
        "6": _report(["deviceCategory"], ["sessions", "activeUsers"], [(["mobile"], ["19", "6"])]),
        "7": _report(["country"], ["sessions", "activeUsers"], [(["United States"], ["20", "7"])]),
        "8": _report([], ["activeUsers", "eventCount"], [([], ["1", "4"])]),
        "8b": _report(["unifiedScreenName"], ["activeUsers"], [(["After Certainty"], ["1"])]),
        "9": _report(
            ["deviceCategory", "operatingSystem"],
            ["sessions", "activeUsers"],
            [(["mobile", "iOS"], ["19", "6"]), (["desktop", "Windows"], ["1", "1"])],
        ),
        "10": _report(
            ["deviceCategory", "mobileDeviceBranding", "mobileDeviceModel"],
            ["sessions", "activeUsers"],
            [(["mobile", "Apple", "iPhone"], ["19", "6"])],
        ),
        "11": _report(
            ["sessionSourceMedium"],
            ["sessions", "activeUsers"],
            [(["(direct) / (none)"], ["10", "6"]), (["vercel.com / referral"], ["1", "1"])],
        ),
        "12": _report(
            ["eventName"],
            ["eventCount", "activeUsers"],
            [
                (["chapter_open"], ["10", "3"]),
                (["next_chapter"], ["4", "2"]),
                (["file_download"], ["1", "1"]),
                (["search_query"], ["8", "2"]),
                (["search_no_results"], ["2", "1"]),
                (["search_select"], ["3", "1"]),
                (["question_path_start"], ["3", "2"]),
                (["book_overview_primary_action"], ["6", "2"]),
            ],
        ),
        "13": _report(
            ["landingPage"],
            ["sessions", "activeUsers"],
            [(["/"], ["12", "5"]), (["/start"], ["4", "3"])],
        ),
        "14": _report(
            ["customEvent:content_type", "customEvent:item_id", "customEvent:method"],
            ["eventCount", "activeUsers"],
            [(["book", "after-certainty", "canvas"], ["2", "1"])],
        ),
        "15": _report(
            ["customEvent:location", "customEvent:platform"],
            ["eventCount", "activeUsers"],
            [(["footer", "spotify"], ["1", "1"])],
        ),
    }
    write_pack(tmp_path, reports)
    text = render_brief(tmp_path, pulled="2026-08-20")
    assert "Traffic is **down** week-over-week (20 vs 40 prior-week sessions, -50%)" in text
    assert "| newUsers | 3 | 10 |" in text
    assert "| engagementRate | 40.0% | 50.0% |" in text
    assert "| averageSessionDuration | 1m 15s | 1m 30s |" in text
    assert "| mobile | 19 | 6 |" in text
    assert "| United States | 20 | 7 |" in text
    assert "| `/` | 12 | 5 |" in text
    assert "Reader (chapter pages)" in text
    assert "`after-certainty`" in text
    assert "`trust-survives-disagreement`" in text
    assert "`empty-lot`" in text
    assert "### Reader" in text
    assert "| chapter_open | 10 |" in text
    assert "### Search" in text
    assert "### Questions" in text
    assert "### Book overview" in text
    assert "Recommended events with **no** counts: `select_content`, `click`" in text
    assert "| next_chapter | 4 | 40.0% |" in text
    assert "Advance rate (`next_chapter` / `chapter_open`): 0.40" in text
    assert "No-result rate: 25.0%; select rate: 37.5%." in text
    assert "Definitely not you" in text
    assert "Active users now: **1**" in text
    assert "Custom events observed:" in text
    assert "chapter_open" in text
    assert "### Games" not in text
    assert "### Trails" not in text
    assert "Observatory focus" in text
    assert "| book | `after-certainty` | canvas | 2 |" in text
    assert "| footer | spotify | 1 |" in text
