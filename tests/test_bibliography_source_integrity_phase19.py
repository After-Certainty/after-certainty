"""Phase 19: do not conflate authors when bibliography parsing lacks a work title."""

from __future__ import annotations

from tools.audit_bibliography_semantic_drift import score_expected_vs_source


def test_federalist_papers_cannot_match_unrelated_acemoglu_work() -> None:
    expected = {
        "slug": "madison-james-federalist-no-51",
        "author": "Madison, James. Federalist No. 51. In The Federalist Papers, edited by",
        "workTitle": "",
        "summary": (
            "Madison, James. Federalist No. 51. In The Federalist Papers, "
            "edited by Clinton Rossiter. New York: Mentor, 1961."
        ),
    }
    source = {
        "slug": "acemoglu-daron-and-james-a-robinson-why-nations-fail",
        "name": "Daron Acemoglu and James A. Robinson — Why Nations Fail",
        "title": "Why Nations Fail",
        "creatorNames": ["Daron Acemoglu", "James A. Robinson"],
        "citation": "Daron Acemoglu and James A. Robinson. Why Nations Fail.",
        "summary": "Origins of Power, Prosperity, and Poverty.",
    }
    score, method = score_expected_vs_source(expected, source)
    assert score < 50, (score, method)


def test_titled_less_institutional_material_still_matches_real_creators() -> None:
    expected = {
        "slug": "government-south-africa-final-report",
        "author": "Government of South Africa",
        "workTitle": "",
        "summary": "Government of South Africa. Final Report of the Commission.",
    }
    source = {
        "slug": "government-of-south-africa-truth-and-reconciliation",
        "name": "Government of South Africa — Final Report",
        "title": "Final Report",
        "creatorNames": ["Government of South Africa"],
        "citation": "Government of South Africa. Final Report, 1998.",
    }
    score, method = score_expected_vs_source(expected, source)
    assert score >= 50, (score, method)
