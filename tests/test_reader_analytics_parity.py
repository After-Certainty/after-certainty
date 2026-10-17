"""Unit tests for Gate 3 parity summary builder (offline fixtures)."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import pytest

from reader_analytics_parity import (
    assert_ga4_report_shape,
    assert_not_fake,
    build_comparison_summary,
    ga_metrics,
    is_fake_payload,
    main,
    validate_vercel_query_bounds,
    vercel_until_param,
)


def _vercel(data, *, since="2026-10-10T00:00:00.000Z", until="2026-10-17T00:00:00.000Z"):
    return {"version": 1, "query": {"since": since, "until": until}, "data": data}


def _ga_overview(*, sessions="9", users="4", pageviews="32"):
    return {
        "metricHeaders": [
            {"name": "sessions"},
            {"name": "activeUsers"},
            {"name": "screenPageViews"},
            {"name": "eventCount"},
        ],
        "rows": [
            {
                "metricValues": [
                    {"value": sessions},
                    {"value": users},
                    {"value": pageviews},
                    {"value": "10"},
                ]
            }
        ],
    }


def _ga_events(pairs: list[tuple[str, str]]):
    return {
        "metricHeaders": [{"name": "eventCount"}],
        "dimensionHeaders": [{"name": "eventName"}],
        "rows": [
            {
                "dimensionValues": [{"value": name}],
                "metricValues": [{"value": count}],
            }
            for name, count in pairs
        ],
    }


def write_pack(art: Path, *, until_resolved="2026-10-17T00:00:00.000Z") -> None:
    raw = art / "raw"
    raw.mkdir(parents=True, exist_ok=True)
    since_r = "2026-10-10T00:00:00.000Z"
    for name, data in [
        ("vercel_visits_count.json", {"visitors": 100, "pageviews": 200}),
        (
            "vercel_visits_referrer.json",
            [
                {"referrerHostname": "", "visitors": 70, "pageviews": 140},
                {"referrerHostname": "google.com", "visitors": 10, "pageviews": 10},
            ],
        ),
        (
            "vercel_visits_country.json",
            [{"country": "US", "visitors": 20, "pageviews": 40}],
        ),
        ("vercel_visits_device.json", [{"deviceType": "desktop", "visitors": 80}]),
        ("vercel_visits_path.json", [{"requestPath": "/", "visitors": 5}]),
        (
            "vercel_events_by_name.json",
            [{"eventName": "chapter_open", "count": 2, "visitors": 1}],
        ),
        ("vercel_corpus_pairs.json", []),
        ("vercel_corpus_edges.json", []),
    ]:
        (raw / name).write_text(
            json.dumps(_vercel(data, since=since_r, until=until_resolved)),
            encoding="utf-8",
        )

    (raw / "ga4_overview.json").write_text(json.dumps(_ga_overview()), encoding="utf-8")
    empty_dims = {
        "metricHeaders": [{"name": "sessions"}, {"name": "activeUsers"}],
        "dimensionHeaders": [{"name": "x"}],
        "rows": [],
    }
    for name in (
        "ga4_channels.json",
        "ga4_source_medium.json",
        "ga4_country.json",
        "ga4_device.json",
        "ga4_pages.json",
    ):
        (raw / name).write_text(json.dumps(empty_dims), encoding="utf-8")
    (raw / "ga4_channels.json").write_text(
        json.dumps(
            {
                "metricHeaders": [{"name": "sessions"}, {"name": "activeUsers"}],
                "dimensionHeaders": [{"name": "sessionDefaultChannelGroup"}],
                "rows": [
                    {
                        "dimensionValues": [{"value": "Organic Search"}],
                        "metricValues": [{"value": "5"}, {"value": "2"}],
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    (raw / "ga4_events.json").write_text(
        json.dumps(_ga_events([("chapter_open", "2"), ("page_view", "32")])),
        encoding="utf-8",
    )
    (raw / "ga4_reader_events.json").write_text(
        json.dumps(_ga_events([("chapter_open", "2")])),
        encoding="utf-8",
    )


def test_vercel_until_param_is_next_day() -> None:
    assert vercel_until_param("2026-10-16") == "2026-10-17"


def test_fake_payload_detection() -> None:
    assert is_fake_payload({"note": "fake token; skipped real API", "rows": []})
    assert is_fake_payload({"status": "fake_token", "data": []})
    with pytest.raises(SystemExit, match="fake/sentinel"):
        assert_not_fake({"note": "fake token; skipped real API"}, path="x")
    with pytest.raises(SystemExit, match="fake/sentinel"):
        assert_ga4_report_shape({"note": "fake token; skipped real API", "rowCount": 0}, path="ga")


def test_ga_empty_valid_vs_malformed() -> None:
    empty = {"metricHeaders": [{"name": "sessions"}], "rows": []}
    assert ga_metrics(empty) == {}
    with pytest.raises(SystemExit, match="missing rows"):
        assert_ga4_report_shape({"metricHeaders": []}, path="bad")


def test_mismatched_vercel_until_days_fail() -> None:
    payloads = {
        "count.json": _vercel({"visitors": 1}, until="2026-10-17T00:00:00.000Z"),
        # Historical bug: aggregate ending a full day earlier
        "agg.json": _vercel({"visitors": 1}, until="2026-10-16T01:00:00.000Z"),
    }
    with pytest.raises(SystemExit, match="exclusive end day|until calendar"):
        validate_vercel_query_bounds(
            payloads,
            since="2026-10-10",
            until_inclusive="2026-10-16",
            until_param="2026-10-17T00:00:00.000Z",
        )


def test_count_vs_aggregate_plus_one_hour_allowed() -> None:
    payloads = {
        "count.json": _vercel({"visitors": 1}, until="2026-10-17T00:00:00.000Z"),
        "agg.json": _vercel([{"country": "US"}], until="2026-10-17T01:00:00.000Z"),
    }
    notes = validate_vercel_query_bounds(
        payloads,
        since="2026-10-10",
        until_inclusive="2026-10-16",
        until_param="2026-10-17T00:00:00.000Z",
    )
    assert any("T01:00:00.000Z" in n for n in notes)


def test_build_summary_and_preserves_gate_decision(tmp_path: Path) -> None:
    art = tmp_path / "parity"
    write_pack(art)
    gate = {
        "schema": "gate3-decision/v1",
        "recommendation": "keep_parallel_longer",
        "earliest_revisit_date": "2026-10-31",
    }
    (art / "gate-decision.json").write_text(json.dumps(gate), encoding="utf-8")
    before = json.loads((art / "gate-decision.json").read_text())

    summary = build_comparison_summary(
        art_dir=art,
        since="2026-10-10",
        until_inclusive="2026-10-16",
        until_param="2026-10-17T00:00:00.000Z",
    )
    assert summary["schema"] == "gate3-comparison-summary/v1"
    assert summary["vercel"]["visitors"] == 100
    assert summary["ga4"]["reader_events"]["chapter_open"] == 2
    assert "recommendation" not in summary
    assert "owner_smoke" not in summary
    assert summary["window"]["alignment"] == "approximate_calendar_days_utc_vs_denver"

    # CLI regenerate must not mutate gate-decision.json
    (art / "comparison-summary.json").write_text("{}\n", encoding="utf-8")
    assert (
        main(
            [
                "build-summary",
                "--art-dir",
                str(art),
                "--since",
                "2026-10-10",
                "--until",
                "2026-10-16",
                "--vercel-until-param",
                "2026-10-17T00:00:00.000Z",
            ]
        )
        == 0
    )
    after = json.loads((art / "gate-decision.json").read_text())
    assert after == before
    rebuilt = json.loads((art / "comparison-summary.json").read_text())
    assert rebuilt["vercel"]["visitors"] == 100


def test_ga4_run_report_fake_token_fails_closed() -> None:
    script = Path("apps/site/scripts/ga4-run-report.sh")
    env = os.environ.copy()
    env["GA_ACCESS_TOKEN"] = "ya29.pade_fake_test"
    env["GA_PROPERTY_ID"] = "properties/1"
    env.pop("READER_ANALYTICS_ALLOW_FAKE_TOKEN", None)
    result = subprocess.run(
        ["bash", str(script), '{"metrics":[{"name":"activeUsers"}]}'],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )
    assert result.returncode == 1
    assert "refusing fake" in result.stderr.lower()


def test_ga4_run_report_fake_token_allowed_with_flag() -> None:
    script = Path("apps/site/scripts/ga4-run-report.sh")
    env = os.environ.copy()
    env["GA_ACCESS_TOKEN"] = "ya29.pade_fake_test"
    env["GA_PROPERTY_ID"] = "properties/1"
    env["READER_ANALYTICS_ALLOW_FAKE_TOKEN"] = "1"
    result = subprocess.run(
        ["bash", str(script), '{"metrics":[{"name":"activeUsers"}]}'],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload.get("status") == "fake_token"
