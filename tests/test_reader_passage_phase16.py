"""Phase 16 regression suite: 47 source-specific, invoked citations in 14 chapters."""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CASES = (
  [
    "center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-open",
    "c7-opensecrets",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md"
  ],
  [
    "federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov",
    "c7-fec",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md"
  ],
  [
    "cohn-jonathan-the-ten-year-war-obamacare-and-the-unmaking-of-american-establishment",
    "c7-aca",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md"
  ],
  [
    "congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions",
    "c7-legislative-record",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md"
  ],
  [
    "pew-research-center-a-guide-to-pew-research-center-s-methodology",
    "c7-pew",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md"
  ],
  [
    "ferguson-niall-the-ascent-of-money-a-financial-history-of-the-world",
    "c4-gold-intuition",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-4-gold-in-the-mind.md"
  ],
  [
    "simmel-georg-the-philosophy-of-money",
    "c4-money-philosophy",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-4-gold-in-the-mind.md"
  ],
  [
    "martin-felix-money-the-unauthorized-biography",
    "c4-money-institution",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-4-gold-in-the-mind.md"
  ],
  [
    "ingham-geoffrey-the-nature-of-money",
    "c4-money-social",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-4-gold-in-the-mind.md"
  ],
  [
    "alexander-christopher-sara-ishikawa-murray-silverstein-et-al-a-pattern-language",
    "c8-alexander-patterns",
    "books/living-in-sediment/parts/part-2-fossils-that-shape-power/chapter-8-the-building-and-the-gathering.md"
  ],
  [
    "alexander-christopher-the-timeless-way-of-building",
    "c8-timeless-way",
    "books/living-in-sediment/parts/part-2-fossils-that-shape-power/chapter-8-the-building-and-the-gathering.md"
  ],
  [
    "mumford-lewis-technics-and-civilization",
    "c8-architecture-pedagogy",
    "books/living-in-sediment/parts/part-2-fossils-that-shape-power/chapter-8-the-building-and-the-gathering.md"
  ],
  [
    "jacobs-jane-the-death-and-life-of-great-american-cities",
    "c8-jacobs-streets",
    "books/living-in-sediment/parts/part-2-fossils-that-shape-power/chapter-8-the-building-and-the-gathering.md"
  ],
  [
    "centers-for-disease-control-and-prevention-symptoms-of-concussion",
    "c5-concussion-symptoms",
    "books/the-game-we-think-we-saw/parts/part-3-what-the-result-demands/chapter-5-the-moral-language-of-playing-hurt.md"
  ],
  [
    "national-collegiate-athletic-association-concussion-fact-sheet-for-coaches",
    "c5-coaches-warning",
    "books/the-game-we-think-we-saw/parts/part-3-what-the-result-demands/chapter-5-the-moral-language-of-playing-hurt.md"
  ],
  [
    "moore-et-al-factors-and-expectations-influencing-concussion-disclosure-within-ncaa-division-i-at",
    "c5-reporting-pressure",
    "books/the-game-we-think-we-saw/parts/part-3-what-the-result-demands/chapter-5-the-moral-language-of-playing-hurt.md"
  ],
  [
    "weber-rawlins-et-al-concussion-symptom-underreporting-among-incoming-ncaa-division-i-college-ath",
    "c5-underreporting",
    "books/the-game-we-think-we-saw/parts/part-3-what-the-result-demands/chapter-5-the-moral-language-of-playing-hurt.md"
  ],
  [
    "lazarus-richard-s-emotion-and-adaptation",
    "c4-lazarus-deutsch-pace-conflict",
    "books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md"
  ],
  [
    "deutsch-morton-the-resolution-of-conflict",
    "c4-deutsch-conflict",
    "books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md"
  ],
  [
    "ross-lee-and-andrew-ward-naive-realism-in-everyday-life",
    "c4-identity-and-caricature",
    "books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md"
  ],
  [
    "tajfel-henri-and-john-c-turner-the-social-identity-theory-of-intergroup-behavior",
    "c4-social-identity",
    "books/how-meaning-moves/parts/part-ii-rooms-that-accelerate-meaning/chapter-4-when-the-pauses-disappear.md"
  ],
  [
    "melas-chloe-taylor-swift-gave-eras-tour-crew-197-million-in-bonuses-exclusive",
    "b2",
    "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-9-the-bracelet.md"
  ],
  [
    "melas-chloe-taylor-swift-gives-life-changing-100-000-bonuses-to-eras-tour-truck-drivers",
    "b2-truck",
    "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-9-the-bracelet.md"
  ],
  [
    "pollstar-year-end-special-features-top-tours",
    "b1-pollstar",
    "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-9-the-bracelet.md"
  ],
  [
    "sisario-ben-taylor-swift-s-eras-tour-is-the-first-to-surpass-2-billion",
    "b1",
    "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-9-the-bracelet.md"
  ],
  [
    "government-of-south-africa-truth-and-reconciliation-commission-final-report",
    "v5",
    "books/when-others-become-leaders/parts/part-1-how-influence-begins/chapter-3-victory.md"
  ],
  [
    "tutu-desmond-no-future-without-forgiveness",
    "v5-tutu",
    "books/when-others-become-leaders/parts/part-1-how-influence-begins/chapter-3-victory.md"
  ],
  [
    "mamdani-mahmood-amnesty-or-impunity-a-preliminary-critique-of-the-report-of-the-truth-and-reconc",
    "c8-mamdani",
    "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-8-nelson-mandela-the-unsent-letter.md"
  ],
  [
    "sparks-allister-tomorrow-is-another-country-the-inside-story-of-south-africa-s-road-to-change",
    "c8-sparks",
    "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-8-nelson-mandela-the-unsent-letter.md"
  ],
  [
    "waldmeir-patti-anatomy-of-a-miracle-the-end-of-apartheid-and-the-birth-of-the-new-south-africa",
    "c8-waldmeir",
    "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-8-nelson-mandela-the-unsent-letter.md"
  ],
  [
    "boehm-christopher-hierarchy-in-the-forest-the-evolution-of",
    "c1-hierarchy",
    "books/before-certainty-arrives/parts/part-1-constraint-before-choice/chapter-1-life-under-constraint.md"
  ],
  [
    "douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution",
    "c1-early-moral-anthropology",
    "books/before-certainty-arrives/parts/part-1-constraint-before-choice/chapter-1-life-under-constraint.md"
  ],
  [
    "hodder-ian-the-leopard-s-tale-revealing-the-mysteries-of",
    "c1-catalhoyuk",
    "books/before-certainty-arrives/parts/part-1-constraint-before-choice/chapter-1-life-under-constraint.md"
  ],
  [
    "hodder-ian-where-are-we-heading-the-evolution-of-humans-and-things",
    "c1-entanglement",
    "books/before-certainty-arrives/parts/part-1-constraint-before-choice/chapter-1-life-under-constraint.md"
  ],
  [
    "north-douglass-c-institutions-institutional-change-and-economic-performance",
    "c2-north-institutions",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-2-sixty-seconds.md"
  ],
  [
    "pierson-paul-increasing-returns-path-dependence-and-the-study-of-politics",
    "c2-path-dependence",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-2-sixty-seconds.md"
  ],
  [
    "rovelli-carlo-the-order-of-time",
    "c2-rovelli-time",
    "books/living-in-sediment/parts/part-1-fossils-we-dont-notice/chapter-2-sixty-seconds.md"
  ],
  [
    "grissom-jason-a-et-al-teacher-stress-and-health-effects-on-teachers-students-and-schools",
    "c8-rand",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-8-the-child-the-score-cannot-hold.md"
  ],
  [
    "learning-policy-institute-teacher-shortages-and-turnover-in-the-united-states",
    "c8-teacher-turnover",
    "books/when-incentives-become-the-moral-language/parts/part-3-the-world-the-metric-makes/chapter-8-the-child-the-score-cannot-hold.md"
  ],
  [
    "u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-depo",
    "c8-banks-2023",
    "books/the-economy-we-dont-experience/parts/part-4-what-holds/chapter-8-the-guardrails-we-notice-only-when-they-fail.md"
  ],
  [
    "federal-deposit-insurance-corporation-options-for-deposit-insurance-reform",
    "c8-fdic-options",
    "books/the-economy-we-dont-experience/parts/part-4-what-holds/chapter-8-the-guardrails-we-notice-only-when-they-fail.md"
  ],
  [
    "financial-stability-board-implementation-and-effects-of-the-g20-financial-regulatory-reforms",
    "c8-fsb-reforms",
    "books/the-economy-we-dont-experience/parts/part-4-what-holds/chapter-8-the-guardrails-we-notice-only-when-they-fail.md"
  ],
  [
    "bartky-ian-r-the-adoption-of-standard-time",
    "c9-railway-time",
    "books/before-certainty-arrives/parts/part-3-inherited-certainty/chapter-9-industrial-scale-and-institutional-certainty.md"
  ],
  [
    "schivelbusch-wolfgang-the-railway-journey-the-industrialization-of",
    "c9-railway-experience",
    "books/before-certainty-arrives/parts/part-3-inherited-certainty/chapter-9-industrial-scale-and-institutional-certainty.md"
  ],
  [
    "electoral-commission-of-south-africa-27-apr-1994-national-election",
    "c6-sa-election",
    "books/the-world-we-make-together/parts/part-2-where-power-gathers/chapter-6-the-ballot.md"
  ],
  [
    "south-african-history-online-denis-farrell",
    "c6-soweto-queue",
    "books/the-world-we-make-together/parts/part-2-where-power-gathers/chapter-6-the-ballot.md"
  ],
  [
    "south-african-history-online-the-south-african-general-elections-1994",
    "c6-election-history",
    "books/the-world-we-make-together/parts/part-2-where-power-gathers/chapter-6-the-ballot.md"
  ]
 )


def test_every_phase16_profile_targets_an_invoked_unique_reader_footnote() -> None:
    review_log = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    assert len(CASES) == 47
    assert len({slug for slug, _, _ in CASES}) == 47
    assert len({note + "|" + doc for _, note, doc in CASES}) == 47

    for slug, note, manuscript_path in CASES:
        source = yaml.safe_load(
            (ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8")
        )
        manuscript = (ROOT / manuscript_path).read_text(encoding="utf-8")
        book = manuscript_path.split("/")[1]
        route = (
            manuscript_path.split("/", 2)[-1].removesuffix(".md").replace("/", "-")
        )
        expected = (
            f"/explore/books/{book}/chapters/{route}#user-content-fnref-{note}"
        )
        assert source["readerPassagePath"] == expected, slug
        assert len(source["whyThisMatters"]) >= 120, slug
        definitions = re.findall(rf"(?m)^\[\^{re.escape(note)}\]:.*$", manuscript)
        assert len(definitions) == 1, (slug, note)
        assert len(definitions[0]) >= 70, slug
        body = re.sub(r"(?m)^\[\^[^]]+\]:.*$", "", manuscript)
        assert f"[^{note}]" in body, slug
        review = review_log[f"source:{slug}:{expected}"]
        assert review["status"] == "applied"
        assert review["evidenceLevel"] == "A"


def test_old_shared_source_candidates_remain_as_review_history() -> None:
    records = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    for slug, _, _ in CASES:
        records_for_source = [
            entry for key, entry in records.items()
            if key.startswith(f"source:{slug}:")
        ]
        applied = [entry for entry in records_for_source if entry["status"] == "applied"]
        assert len(applied) == 1, slug
        for entry in records_for_source:
            if entry["status"] == "skipped" and entry.get("supersededBy"):
                assert entry["supersededBy"] == applied[0]["candidatePath"]


def test_new_footnote_ids_are_not_duplicated() -> None:
    for manuscript_path in {path for _, _, path in CASES}:
        content = (ROOT / manuscript_path).read_text(encoding="utf-8")
        definitions = re.findall(r"(?m)^\[\^([^]]+)\]:", content)
        assert len(definitions) == len(set(definitions)), manuscript_path


def test_representative_claims_are_not_conflated() -> None:
    def note(slug: str, note_id: str) -> str:
        doc = next(path for s, _, path in CASES if s == slug)
        text = (ROOT / doc).read_text(encoding="utf-8")
        found = re.findall(rf"(?m)^\[\^{re.escape(note_id)}\]:.*$", text)
        assert len(found) == 1
        return found[0]

    assert "OpenSecrets" not in note(
        "federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov",
        "c7-fec",
    )
    assert "FEC" not in note(
        "center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-open",
        "c7-opensecrets",
    )
    assert "Geoffrey Ingham" not in note(
        "martin-felix-money-the-unauthorized-biography", "c4-money-institution"
    )
    assert "Christopher Boehm" not in note(
        "douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution",
        "c1-early-moral-anthropology",
    )
    assert "Pollstar" not in note(
        "sisario-ben-taylor-swift-s-eras-tour-is-the-first-to-surpass-2-billion",
        "b1",
    )
