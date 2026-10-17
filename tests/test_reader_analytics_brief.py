"""Unit tests for reader-analytics brief rendering (synthetic Vercel JSON, no network)."""

from __future__ import annotations

import json
import os
import subprocess
from datetime import date
from pathlib import Path

import pytest

from reader_analytics_brief import (
    anomaly_notes,
    assert_real_payload,
    attribution_pairs,
    channel_breakdown,
    classify_referrer,
    edge_type_pairs,
    inclusive_date_pair,
    load_report,
    main,
    path_family,
    payload_status,
    render_brief,
    render_json_summary,
    rows_from_aggregate,
    safe_ratio,
    week_bounds_denver,
)


def _agg_list(*rows: dict) -> dict:
    return {"version": 1, "data": list(rows)}


def _agg_totals(*, visitors: int, pageviews: int) -> dict:
    return {
        "version": 1,
        "query": {
            "since": "2026-10-10T00:00:00.000Z",
            "until": "2026-10-17T00:00:00.000Z",
        },
        "data": {"visitors": visitors, "pageviews": pageviews},
    }


def write_window(tmp: Path, *, visitors: int = 100, pageviews: int = 200) -> Path:
    tmp.mkdir(parents=True, exist_ok=True)
    (tmp / "visits_count.json").write_text(
        json.dumps(_agg_totals(visitors=visitors, pageviews=pageviews))
    )
    (tmp / "visits_by_day.json").write_text(
        json.dumps(
            _agg_list(
                {"timestamp": "2026-10-10T00:00:00.000Z", "visitors": 40, "pageviews": 80},
                {"timestamp": "2026-10-11T00:00:00.000Z", "visitors": 60, "pageviews": 120},
            )
        )
    )
    (tmp / "visits_by_referrer.json").write_text(
        json.dumps(
            _agg_list(
                {"referrerHostname": "", "visitors": 70, "pageviews": 140},
                {"referrerHostname": "google.com", "visitors": 20, "pageviews": 40},
                {"referrerHostname": "facebook.com", "visitors": 5, "pageviews": 10},
                {"referrerHostname": "example.org", "visitors": 5, "pageviews": 10},
            )
        )
    )
    (tmp / "visits_by_country.json").write_text(
        json.dumps(
            _agg_list(
                {"country": "SG", "visitors": 80, "pageviews": 150},
                {"country": "US", "visitors": 15, "pageviews": 40},
            )
        )
    )
    (tmp / "visits_by_device.json").write_text(
        json.dumps(
            _agg_list(
                {"deviceType": "desktop", "visitors": 85, "pageviews": 160},
                {"deviceType": "mobile", "visitors": 15, "pageviews": 40},
            )
        )
    )
    (tmp / "visits_by_path.json").write_text(
        json.dumps(
            _agg_list(
                {
                    "requestPath": "/explore/sources/goodhart",
                    "visitors": 30,
                    "pageviews": 40,
                },
                {
                    "requestPath": "/explore/books/after-certainty/chapters/intro",
                    "visitors": 20,
                    "pageviews": 25,
                },
                {"requestPath": "/explore/thinkers/foo", "visitors": 10, "pageviews": 12},
            )
        )
    )
    (tmp / "events_by_name.json").write_text(
        json.dumps(
            _agg_list(
                {"eventName": "chapter_open", "count": 10, "visitors": 8},
                {"eventName": "chapter_advance", "count": 4, "visitors": 3},
                {"eventName": "book_download", "count": 2, "visitors": 2},
                {"eventName": "corpus_navigation", "count": 5, "visitors": 4},
                {"eventName": "reader_audio_started", "count": 1, "visitors": 1},
                {"eventName": "reading_path_started", "count": 1, "visitors": 1},
            )
        )
    )
    (tmp / "corpus_by_origin_and_to_id.json").write_text(
        json.dumps(
            _agg_list(
                {
                    "requestPath": "/explore/sources/a",
                    "eventData/to_id": "chapter:book/one",
                    "count": 3,
                    "visitors": 2,
                },
                {
                    "requestPath": "/explore/sources/b",
                    "eventData/to_id": "chapter:book/one",
                    "count": 2,
                    "visitors": 2,
                },
                {
                    "requestPath": "/explore/sources/a",
                    "eventData/to_id": "chapter:book/two",
                    "count": 1,
                    "visitors": 1,
                },
                {
                    "requestPath": "/explore/sources/legacy",
                    "eventData/to_id": "",
                    "count": 4,
                    "visitors": 3,
                },
            )
        )
    )
    (tmp / "corpus_by_from_to_type.json").write_text(
        json.dumps(
            _agg_list(
                {
                    "eventData/from_type": "source",
                    "eventData/to_type": "chapter",
                    "count": 6,
                    "visitors": 4,
                },
                {
                    "eventData/from_type": "thinker",
                    "eventData/to_type": "chapter",
                    "count": 2,
                    "visitors": 2,
                },
            )
        )
    )
    (tmp / "corpus_by_from_type.json").write_text(
        json.dumps(_agg_list({"eventData/from_type": "source", "count": 3, "visitors": 2}))
    )
    (tmp / "corpus_by_to_type.json").write_text(
        json.dumps(_agg_list({"eventData/to_type": "chapter", "count": 3, "visitors": 2}))
    )
    (tmp / "corpus_by_to_id.json").write_text(
        json.dumps(
            _agg_list(
                {"eventData/to_id": "", "count": 2, "visitors": 2},
                {"eventData/to_id": "chapter:after-certainty/intro", "count": 1, "visitors": 1},
            )
        )
    )
    return tmp


def test_classify_referrer_and_path_family() -> None:
    assert classify_referrer("") == "no_recorded_referrer"
    assert classify_referrer("www.google.com") == "organic_search"
    assert classify_referrer("m.facebook.com") == "social_or_newsletter"
    assert classify_referrer("news.example.com") == "other_external"
    assert path_family("/explore/books/ac/chapters/one") == "chapter"
    assert path_family("/explore/books/ac") == "book"
    assert path_family("/explore/sources/x") == "source"
    assert path_family("/questions/y") == "question"


def test_week_bounds_end_yesterday_not_today() -> None:
    cur_s, cur_u, pri_s, pri_u = week_bounds_denver(date(2026, 10, 17))
    # Anchor day is excluded; seven completed days end on the 16th.
    assert inclusive_date_pair(cur_s, cur_u) == ("2026-10-10", "2026-10-16")
    assert inclusive_date_pair(pri_s, pri_u) == ("2026-10-03", "2026-10-09")


def test_week_bounds_dst_spring_forward() -> None:
    # 2026-03-08 is US DST spring-forward Sunday in America/Denver.
    cur_s, cur_u, _, _ = week_bounds_denver(date(2026, 3, 10))
    assert inclusive_date_pair(cur_s, cur_u) == ("2026-03-03", "2026-03-09")
    assert cur_s.tzinfo is not None
    # Denver midnight → UTC offset changes across DST; instants remain locally midnight.
    assert cur_s.hour == 0 and cur_u.hour == 0


def test_week_bounds_dst_fall_back() -> None:
    # 2026-11-01 is US DST fall-back Sunday in America/Denver.
    cur_s, cur_u, _, _ = week_bounds_denver(date(2026, 11, 3))
    assert inclusive_date_pair(cur_s, cur_u) == ("2026-10-27", "2026-11-02")
    assert cur_s.hour == 0 and cur_u.hour == 0


def test_rows_from_aggregate_dict_and_list() -> None:
    assert rows_from_aggregate({"data": {"visitors": 1, "pageviews": 2}}) == [
        {"visitors": 1, "pageviews": 2}
    ]
    assert rows_from_aggregate({"data": [{"a": 1}]}) == [{"a": 1}]
    assert rows_from_aggregate(None) == []
    assert rows_from_aggregate({"status": "unavailable", "data": None}) == []
    assert rows_from_aggregate({"status": "fake_token", "data": [], "note": "fake token"}) == []


def test_payload_status_and_assert_real() -> None:
    assert payload_status({"data": []}) == "empty"
    assert payload_status({"data": [{"x": 1}]}) == "ok"
    assert payload_status({"status": "unavailable", "data": None}) == "unavailable"
    assert payload_status({"note": "fake token; skipped real API", "data": []}) == "fake_token"
    with pytest.raises(SystemExit, match="fake/sentinel"):
        assert_real_payload({"note": "fake token; skipped real API", "data": []}, path="x.json")


def test_channel_breakdown_and_ratio() -> None:
    channels = channel_breakdown(
        [
            {"referrerHostname": "", "visitors": 10, "pageviews": 20},
            {"referrerHostname": "google.com", "visitors": 5, "pageviews": 5},
        ]
    )
    assert channels["no_recorded_referrer"]["visitors"] == 10
    assert channels["organic_search"]["visitors"] == 5
    assert "0.40" in safe_ratio(4, 10)
    assert "n/a" in safe_ratio(1, 0)


def test_anomaly_notes_use_overall_visitor_denominator() -> None:
    notes = anomaly_notes(
        country_rows=[
            {"country": "SG", "visitors": 80, "pageviews": 100},
            {"country": "US", "visitors": 5, "pageviews": 5},
        ],
        device_rows=[{"deviceType": "desktop", "visitors": 90, "pageviews": 100}],
        path_rows=[{"requestPath": "/explore/sources/x", "visitors": 40, "pageviews": 50}],
        referrer_rows=[{"referrerHostname": "", "visitors": 70, "pageviews": 80}],
        custom_event_total=0,
        visit_visitors=200,
    )
    joined = " ".join(notes)
    assert "80 / 200" in joined or "of overall visitors" in joined
    # Must not claim ~94% from truncated top-N (80/(80+5)).
    assert "~94%" not in joined
    assert "SG" in joined


def test_attribution_pairs_distinguish_sources_and_chapters() -> None:
    pairs = attribution_pairs(
        [
            {
                "requestPath": "/explore/sources/a",
                "eventData/to_id": "chapter:book/one",
                "count": 3,
                "visitors": 2,
            },
            {
                "requestPath": "/explore/sources/b",
                "eventData/to_id": "chapter:book/one",
                "count": 2,
                "visitors": 2,
            },
            {
                "requestPath": "/explore/sources/a",
                "eventData/to_id": "chapter:book/two",
                "count": 1,
                "visitors": 1,
            },
            {
                "requestPath": "/explore/sources/legacy",
                "eventData/to_id": "",
                "count": 9,
                "visitors": 5,
            },
        ]
    )
    # Two sources → same chapter appear as distinct pairs.
    same_chapter = [p for p in pairs if p[1] == "chapter:book/one"]
    assert len(same_chapter) == 2
    assert {p[0] for p in same_chapter} == {
        "/explore/sources/a",
        "/explore/sources/b",
    }
    # One source → two chapters.
    from_a = [p for p in pairs if p[0] == "/explore/sources/a" and p[1]]
    assert {p[1] for p in from_a} == {"chapter:book/one", "chapter:book/two"}
    legacy = [p for p in pairs if p[1] == ""]
    assert legacy and "legacy/type-only" in legacy[0][4]


def test_edge_type_pairs_are_joint() -> None:
    edges = edge_type_pairs(
        [
            {
                "eventData/from_type": "source",
                "eventData/to_type": "chapter",
                "count": 5,
                "visitors": 3,
            }
        ]
    )
    assert edges == [("source", "chapter", 5, 3)]


def test_render_brief_contains_limitations_and_sections(tmp_path: Path) -> None:
    current = write_window(tmp_path / "current", visitors=100, pageviews=200)
    prior = write_window(tmp_path / "prior", visitors=80, pageviews=160)
    (prior / "events_by_name.json").write_text(
        json.dumps(_agg_list({"eventName": "chapter_open", "count": 5, "visitors": 4}))
    )
    brief = render_brief(
        current_dir=current,
        prior_dir=prior,
        since="2026-10-10",
        until="2026-10-16",
        prior_since="2026-10-03",
        prior_until="2026-10-09",
    )
    assert "## Limitations" in brief
    assert "session-level journeys" in brief
    assert "## 1. Visitors and pageviews" in brief
    assert "Top overall paths (partial family breakdown)" in brief
    assert "Origin path × `to_id`" in brief
    assert "/explore/sources/a" in brief
    assert "chapter:book/one" in brief
    assert "legacy/type-only" in brief
    assert "from_type` × `to_type`" in brief
    assert "source" in brief and "chapter" in brief
    assert "Continuation ratio" in brief
    assert "## 8. Changes from previous comparable period" in brief
    assert "100" in brief and "80" in brief
    assert "completed days" in brief.lower() or "completed calendar" in brief.lower()

    summary = render_json_summary(since="2026-10-10", until="2026-10-16", current_dir=current)
    assert summary["visitors"] == 100
    assert summary["pageviews"] == 200
    assert "aggregate_only" in summary["limitations"]


def test_render_brief_marks_unavailable_not_zero(tmp_path: Path) -> None:
    current = write_window(tmp_path / "current")
    (current / "corpus_by_origin_and_to_id.json").write_text(
        json.dumps(
            {
                "version": 1,
                "status": "unavailable",
                "reason": "dimension unsupported",
                "data": None,
            }
        )
    )
    brief = render_brief(
        current_dir=current,
        prior_dir=None,
        since="2026-10-10",
        until="2026-10-16",
        prior_since=None,
        prior_until=None,
    )
    assert "Unavailable — dimension unsupported" in brief
    assert "Not a zero-events result" in brief


def test_render_brief_rejects_fake_payload(tmp_path: Path) -> None:
    current = write_window(tmp_path / "current")
    (current / "visits_count.json").write_text(
        json.dumps({"version": 1, "data": [], "note": "fake token; skipped real API"})
    )
    with pytest.raises(SystemExit, match="fake/sentinel"):
        render_brief(
            current_dir=current,
            prior_dir=None,
            since="2026-10-10",
            until="2026-10-16",
            prior_since=None,
            prior_until=None,
        )


def test_valid_empty_real_result_is_zero_not_unavailable(tmp_path: Path) -> None:
    current = write_window(tmp_path / "current")
    (current / "corpus_by_origin_and_to_id.json").write_text(json.dumps({"version": 1, "data": []}))
    status, rows, _ = load_report(current / "corpus_by_origin_and_to_id.json")
    assert status == "empty"
    assert rows == []
    brief = render_brief(
        current_dir=current,
        prior_dir=None,
        since="2026-10-10",
        until="2026-10-16",
        prior_since=None,
        prior_until=None,
    )
    assert "no rows" in brief
    assert "Unavailable" not in brief.split("Origin path")[1].split("### Edge")[0]


def test_main_print_week_bounds(capsys) -> None:
    assert main(["--print-week-bounds"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["timezone"] == "America/Denver"
    assert payload["window_rule"] == "last_7_completed_denver_days_ending_yesterday"
    assert "since" in payload["current"]
    assert "until" in payload["prior"]
    assert "api_note" in payload


def test_main_renders_to_stdout(tmp_path: Path, capsys) -> None:
    current = write_window(tmp_path / "current")
    json_out = tmp_path / "summary.json"
    rc = main(
        [
            "--current-dir",
            str(current),
            "--since",
            "2026-10-10",
            "--until",
            "2026-10-16",
            "--json-out",
            str(json_out),
        ]
    )
    assert rc == 0
    out = capsys.readouterr().out
    assert out.startswith("# Reader analytics")
    assert json_out.is_file()
    assert json.loads(json_out.read_text())["visitors"] == 100


def test_query_script_fake_token_fails_closed() -> None:
    script = Path("apps/site/scripts/vercel-web-analytics-query.sh")
    env = os.environ.copy()
    env["VERCEL_TOKEN"] = "vercel_pade_fake_test"
    env.pop("READER_ANALYTICS_ALLOW_FAKE_TOKEN", None)
    result = subprocess.run(
        ["bash", str(script), "visits/count", "since=2026-10-01", "until=2026-10-07"],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )
    assert result.returncode == 1
    assert "refusing fake" in result.stderr.lower()


def test_query_script_fake_token_allowed_only_with_flag() -> None:
    script = Path("apps/site/scripts/vercel-web-analytics-query.sh")
    env = os.environ.copy()
    env["VERCEL_TOKEN"] = "vercel_pade_fake_test"
    env["READER_ANALYTICS_ALLOW_FAKE_TOKEN"] = "1"
    result = subprocess.run(
        ["bash", str(script), "visits/count", "since=2026-10-01", "until=2026-10-07"],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload.get("status") == "fake_token"
    assert "fake token" in payload.get("note", "")
