"""Unit tests for reader-analytics brief rendering (synthetic Vercel JSON, no network)."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from reader_analytics_brief import (
    anomaly_notes,
    channel_breakdown,
    classify_referrer,
    inclusive_date_pair,
    main,
    path_family,
    render_brief,
    render_json_summary,
    rows_from_aggregate,
    safe_ratio,
    week_bounds_denver,
)


def _agg_list(*rows: dict) -> dict:
    return {"version": 1, "data": list(rows)}


def _agg_totals(*, visitors: int, pageviews: int) -> dict:
    return {"version": 1, "data": {"visitors": visitors, "pageviews": pageviews}}


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


def test_week_bounds_denver_anchor() -> None:
    cur_s, cur_u, pri_s, pri_u = week_bounds_denver(date(2026, 10, 17))
    assert inclusive_date_pair(cur_s, cur_u) == ("2026-10-11", "2026-10-17")
    assert inclusive_date_pair(pri_s, pri_u) == ("2026-10-04", "2026-10-10")


def test_rows_from_aggregate_dict_and_list() -> None:
    assert rows_from_aggregate({"data": {"visitors": 1, "pageviews": 2}}) == [
        {"visitors": 1, "pageviews": 2}
    ]
    assert rows_from_aggregate({"data": [{"a": 1}]}) == [{"a": 1}]
    assert rows_from_aggregate(None) == []


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


def test_anomaly_notes_flag_sg_desktop() -> None:
    notes = anomaly_notes(
        country_rows=[{"country": "SG", "visitors": 80, "pageviews": 100}],
        device_rows=[{"deviceType": "desktop", "visitors": 90, "pageviews": 100}],
        path_rows=[{"requestPath": "/explore/sources/x", "visitors": 40, "pageviews": 50}],
        referrer_rows=[{"referrerHostname": "", "visitors": 70, "pageviews": 80}],
        custom_event_total=0,
        visit_visitors=100,
    )
    joined = " ".join(notes)
    assert "SG" in joined
    assert "desktop" in joined.lower()
    assert "Custom reader events" in joined


def test_render_brief_contains_limitations_and_sections(tmp_path: Path) -> None:
    current = write_window(tmp_path / "current", visitors=100, pageviews=200)
    prior = write_window(tmp_path / "prior", visitors=80, pageviews=160)
    # Shrink prior chapter_open for delta
    (prior / "events_by_name.json").write_text(
        json.dumps(_agg_list({"eventName": "chapter_open", "count": 5, "visitors": 4}))
    )
    brief = render_brief(
        current_dir=current,
        prior_dir=prior,
        since="2026-10-11",
        until="2026-10-17",
        prior_since="2026-10-04",
        prior_until="2026-10-10",
    )
    assert "## Limitations" in brief
    assert "session-level journeys" in brief
    assert "## 1. Visitors and pageviews" in brief
    assert "## 4. Source/thinker → book/chapter navigation" in brief
    assert "chapter_open" in brief
    assert "Continuation ratio" in brief
    assert "## 8. Changes from previous comparable period" in brief
    assert "100" in brief and "80" in brief

    summary = render_json_summary(since="2026-10-11", until="2026-10-17", current_dir=current)
    assert summary["visitors"] == 100
    assert summary["pageviews"] == 200
    assert "aggregate_only" in summary["limitations"]


def test_main_print_week_bounds(capsys) -> None:
    assert main(["--print-week-bounds"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["timezone"] == "America/Denver"
    assert "since" in payload["current"]
    assert "until" in payload["prior"]


def test_main_renders_to_stdout(tmp_path: Path, capsys) -> None:
    current = write_window(tmp_path / "current")
    json_out = tmp_path / "summary.json"
    rc = main(
        [
            "--current-dir",
            str(current),
            "--since",
            "2026-10-11",
            "--until",
            "2026-10-17",
            "--json-out",
            str(json_out),
        ]
    )
    assert rc == 0
    out = capsys.readouterr().out
    assert out.startswith("# Reader analytics")
    assert json_out.is_file()
    assert json.loads(json_out.read_text())["visitors"] == 100


def test_query_script_fake_token() -> None:
    """Offline guard: fake PADE tokens must not hit the network."""
    import os
    import subprocess

    script = Path("apps/site/scripts/vercel-web-analytics-query.sh")
    env = os.environ.copy()
    env["VERCEL_TOKEN"] = "vercel_pade_fake_test"
    result = subprocess.run(
        ["bash", str(script), "visits/count", "since=2026-10-01", "until=2026-10-07"],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload.get("note") == "fake token; skipped real API"
