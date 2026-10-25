"""Phase 17: source-specific reader-passage coverage and editorial guardrails."""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CASES = (
    ("alexander-robin-die-getriebenen-merkel-und-die-fl-chtlingspolitik", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-3-angela-merkel-the-unanswered-need-for-reassurance#user-content-fnref-c3-alexander-merkel"),
    ("andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-3-what-the-result-demands-chapter-6-the-athlete-who-said-no#user-content-fnref-c6-colts-retirement"),
    ("andscape-for-allen-iverson-it-was-never-just-about-practice", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-iverson-andscape"),
    ("associated-press-bob-knight-indiana-s-combustible-coaching-giant-dies-at-age-83", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-knight-method-ap"),
    ("associated-press-kaepernick-eric-reid-settle-collusion-grievances-with-nfl", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-grievance-settled"),
    ("associated-press-kaepernick-files-grievance-against-nfl-alleging-collusion", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-grievance-filed"),
    ("associated-press-return-of-the-hoosier-knight-back-at-indiana-after-20-years", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-return-ap"),
    ("associated-press-trump-says-nfl-should-fire-players-who-kneel-during-anthem", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-trump-ap"),
    ("beard-mary-spqr-a-history-of-ancient-rome", "/explore/books/living-in-sediment/chapters/back-matter-epilogue-two-months-off#user-content-fnref-epi-beard-rome"),
    ("berwick-donald-m-era-3-for-medicine-and-health-care", "/explore/books/coupling/chapters/parts-part-3-ai-and-structural-entropy-14-guardrails-as-constraint-architecture#user-content-fnref-c14-berwick-era3"),
    ("ceplair-larry-and-steven-englund-the-inquisition-in-hollywood-politics-in-the-film-community-193", "/explore/books/when-authority-is-misread/chapters/parts-part-3-looking-twice-chapter-10-the-conversation-that-is-no-longer-a-conversation#user-content-fnref-c10-ceplair"),
    ("chernow-ron-washington-a-life", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-9-george-washington-the-empty-chair#user-content-fnref-c9-chernow"),
    ("cnn-indiana-university-keeps-coach-knight-with-sanctions", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-may-sanctions"),
    ("cnn-politics-trump-nfl-owners-should-fire-players-who-protest-the-national-anthem", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-trump-weekend"),
    ("de-la-merced-michael-j-pepsico-tells-activist-investor-its-answer-is-still-no", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-5-indra-nooyi-what-gets-written-in-the-margin#user-content-fnref-c5-dealbook-pepsico"),
    ("deutscher-guy-the-unfolding-of-language-an-evolutionary-tour-of-mankind-s", "/explore/books/living-in-sediment/chapters/parts-part-1-fossils-we-dont-notice-chapter-1-the-gods-in-the-week#user-content-fnref-c1-deutscher-language"),
    ("douglas-mary-how-institutions-think", "/explore/books/living-in-sediment/chapters/parts-part-4-living-among-sediment-chapter-13-when-justification-fades#user-content-fnref-c13-douglas-habit"),
    ("dunbar-erica-armstrong-never-caught-the-washingtons-relentless-pursuit-of-their-runaway-slave-on", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-9-george-washington-the-empty-chair#user-content-fnref-c9-ona-judge"),
    ("dyson-michael-eric-i-may-not-get-there-with-you-the-true-martin-luther-king-jr", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-4-martin-luther-king-jr-the-door-marked-not-yet#user-content-fnref-c4-sanitization"),
    ("ellis-joseph-j-his-excellency-george-washington", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-9-george-washington-the-empty-chair#user-content-fnref-c9-ellis"),
    ("espn-colin-kaepernick-takes-knee-for-anthem-joined-by-teammate-eric-reid", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-espn-kneel"),
    ("espn-emotional-bob-knight-ends-20-year-split-with-indiana", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-return-espn"),
    ("espn-nfl-commissioner-roger-goodell-says-nfl-was-wrong-not-to-listen-to-its-players-about-racism", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-espn-goodell-june"),
    ("espn-roger-goodell-wish-we-had-listened-earlier-to-what-colin-kaepernick-was-protesting", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-goodell-august"),
    ("espn-transcript-of-brand-s-statement", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-brand-statement"),
    ("espn-video-supports-reed-s-allegation-against-knight", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-4-what-winning-is-allowed-to-excuse#user-content-fnref-c4-reed-video"),
    ("finocchiaro-maurice-a-the-galileo-affair-a-documentary-history", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-6-galileo-galilei-the-permission-to-see#user-content-fnref-c6-trial"),
    ("follett-mary-parker-creative-experience", "/explore/books/the-world-we-make-together/chapters/parts-part-4-from-power-over-to-power-with-chapter-9-the-scale#user-content-fnref-c9-follett-power"),
    ("garud-raghu-and-peter-karn-e-path-dependence-and-creation", "/explore/books/living-in-sediment/chapters/parts-part-4-living-among-sediment-chapter-13-when-justification-fades#user-content-fnref-c13-garud-path-creation"),
    ("giddens-anthony-the-constitution-of-society-outline-of-the-theory-of", "/explore/books/living-in-sediment/chapters/parts-part-4-living-among-sediment-chapter-15-archaeology-of-the-present#user-content-fnref-c15-giddens-structuration"),
    ("goffman-erving-the-presentation-of-self-in-everyday-life", "/explore/books/after-certainty/chapters/parts-part-2-what-can-still-be-practiced-chapter-6-speech-that-does-less-harm#user-content-fnref-c6-performative-speech"),
    ("kessler-glenn-salvador-rizzo-and-meg-kelly-president-trump-has-made-more-than-20-000-false-or-mi", "/explore/books/when-interpretation-no-longer-matters/chapters/parts-part-2-what-replaces-interpretation-chapter-3-the-argument-that-sorts-the-room#user-content-fnref-c3-factcheck-ecosystem"),
    ("kim-gene-kevin-behr-and-george-spafford-the-phoenix-project-a-novel-about-it-devops-and-helping", "/explore/books/coupling/chapters/parts-part-5-oscillation-and-design-21-the-oscillation#user-content-fnref-c21-phoenix-novel"),
    ("lewis-john-with-michael-d-orso-walking-with-the-wind-a-memoir-of-the-movement", "/explore/books/when-others-become-leaders/chapters/parts-part-2-how-influence-moves-chapter-4-the-march#user-content-fnref-m4-lewis-selma"),
    ("luhmann-niklas-social-systems", "/explore/books/after-certainty/chapters/front-matter-introduction#user-content-fnref-intro-misunderstanding-scale"),
    ("maathai-wangari-unbowed-a-memoir", "/explore/books/when-others-become-leaders/chapters/parts-part-2-how-influence-moves-chapter-5-the-tree#user-content-fnref-t1"),
    ("major-league-baseball-mlb-announces-abs-challenge-system-coming-to-the-major-leagues-beginning-i", "/explore/books/the-game-we-think-we-saw/chapters/parts-part-2-why-the-result-counts-chapter-3-the-authority-of-the-whistle#user-content-fnref-c3-mlb-abs"),
    ("mandela-nelson-long-walk-to-freedom", "/explore/books/when-others-become-leaders/chapters/parts-part-1-how-influence-begins-chapter-3-victory#user-content-fnref-v3"),
    ("noble-safiya-umoja-algorithms-of-oppression-how-search-engines-reinforce-racism", "/explore/books/living-in-sediment/chapters/parts-part-3-fossils-forming-now-chapter-9-what-the-algorithm-sees#user-content-fnref-c9-noble-ranking"),
    ("packer-george-the-quiet-german", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-3-angela-merkel-the-unanswered-need-for-reassurance#user-content-fnref-c3-packer-portrait"),
    ("rao-anupama-the-caste-question-dalits-and-the-politics-of-modern-india", "/explore/books/when-others-become-leaders/chapters/parts-part-1-how-influence-begins-chapter-2-salt#user-content-fnref-s2-rao-caste-politics"),
    ("robinson-jo-ann-gibson-the-montgomery-bus-boycott-and-the-women-who-started-it", "/explore/books/when-others-become-leaders/chapters/parts-part-2-how-influence-moves-chapter-4-the-march#user-content-fnref-m4-robinson-wpc"),
    ("slaughter-thomas-p-the-whiskey-rebellion-frontier-epilogue-to-the-american-revolution", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-9-george-washington-the-empty-chair#user-content-fnref-c9-whiskey"),
    ("sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media", "/explore/books/the-discipline-of-uncertainty/chapters/parts-part-4-institutions-authority-and-drift-chapter-8-individuals-structures-and-the-collapse-into-absolutes#user-content-fnref-c8-viral"),
    ("taylor-charles-sources-of-the-self-the-making-of-the-modern-identity", "/explore/books/after-certainty/chapters/parts-part-1-letting-go-chapter-2-the-cost-of-explanation#user-content-fnref-c2-explanation-moral-work"),
    ("tuchman-barbara-w-the-march-of-folly-from-troy-to-vietnam", "/explore/books/the-discipline-of-uncertainty/chapters/parts-part-5-leadership-without-prophecy-chapter-9-why-leaders-are-pressured-into-certainty#user-content-fnref-c9-confidence"),
    ("u-s-department-of-agriculture-food-and-nutrition-service-school-breakfast-program-faqs", "/explore/books/the-world-we-make-together/chapters/parts-part-3-what-shared-power-requires-chapter-8-the-bowl#user-content-fnref-c8-usda"),
    ("u-s-securities-and-exchange-commission-office-of-the-whistleblower-annual-reports-to-congress-ht", "/explore/books/the-discipline-of-uncertainty/chapters/parts-part-4-institutions-authority-and-drift-chapter-7-warning-systems-that-incriminate-their-own-success#user-content-fnref-c7-wb"),
    ("vernon-vaughn-implementing-domain-driven-design", "/explore/books/coupling/chapters/parts-part-3-ai-and-structural-entropy-15-architectural-cohesion#user-content-fnref-c15-vernon-context-mapping"),
    ("washington-george-farewell-address-19-september-1796", "/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-9-george-washington-the-empty-chair#user-content-fnref-c9-farewell"),
    ("worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109", "/explore/books/when-incentives-become-the-moral-language/chapters/parts-part-2-when-the-translation-takes-over-chapter-5-the-matrix-with-no-author#user-content-fnref-c5-warn"),
    ("zerubavel-eviatar-hidden-rhythms-schedules-and-calendars-in-social-life", "/explore/books/living-in-sediment/chapters/front-matter-prologue-september-is-not-seven#user-content-fnref-pro-zerubavel-calendar"),
)


def _manuscript_for_route(route: str) -> Path:
    match = re.fullmatch(r"/explore/books/([^/]+)/chapters/(.+)", route)
    assert match is not None, route
    book, chapter = match.groups()
    manuscripts = (
        p for p in (ROOT / "books" / book).rglob("*.md")
        if "-".join(p.relative_to(ROOT / "books" / book).with_suffix("").parts) == chapter
    )
    found = list(manuscripts)
    assert len(found) == 1, (route, found)
    return found[0]


def test_phase17_reader_footnotes_are_invoked_and_source_specific() -> None:
    log = json.loads((ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8"))["entries"]
    assert len(CASES) == 52
    assert len({slug for slug, _ in CASES}) == len(CASES)
    assert len({path for _, path in CASES}) == len(CASES)
    for slug, path in CASES:
        data = yaml.safe_load((ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8"))
        assert data["readerPassagePath"] == path, slug
        assert len(data["whyThisMatters"]) >= 120, slug
        route, note = path.split("#user-content-fnref-", 1)
        manuscript = _manuscript_for_route(route).read_text(encoding="utf-8")
        definitions = [
            line for line in manuscript.splitlines() if line.startswith(f"[^{note}]:")
        ]
        assert len(definitions) == 1, (slug, note)
        body = "\n".join(
            line
            for line in manuscript.splitlines()
            if not (line.startswith("[^") and "]:" in line)
        )
        assert f"[^{note}]" in body, (slug, note)
        record = log[f"source:{slug}:{path}"]
        assert record["status"] == "applied", slug
        assert record["evidenceLevel"] == "A", slug


def test_phase17_superseded_candidates_remain_traceable() -> None:
    records = json.loads((ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8"))["entries"]
    for slug, path in CASES:
        matched = [v for k, v in records.items() if k.startswith(f"source:{slug}:")]
        applied = [v for v in matched if v["status"] == "applied"]
        assert len(applied) == 1, slug
        assert applied[0]["candidatePath"] == path, slug
        for item in matched:
            if item["status"] == "skipped" and item.get("supersededBy"):
                assert item["supersededBy"] == path, slug

def test_phase17_url_paths_do_not_invent_companion_citations() -> None:
    """A source URL's headline tokens are not another cited work."""
    from tools.reader_passage_links import (
        index_chapter_engagement,
        load_published_chapters,
        load_sources,
    )

    sources = load_sources(ROOT)
    chapters = load_published_chapters(ROOT)
    footnotes, _ = index_chapter_engagement(ROOT, chapters, sources)

    exact_headlines = {
        "espn-colin-kaepernick-takes-knee-for-anthem-joined-by-teammate-eric-reid": "c7-espn-kneel",
        "espn-nfl-commissioner-roger-goodell-says-nfl-was-wrong-not-to-listen-to-its-players-about-racism": "c7-espn-goodell-june",
        "espn-roger-goodell-wish-we-had-listened-earlier-to-what-colin-kaepernick-was-protesting": "c7-goodell-august",
    }
    for slug, note in exact_headlines.items():
        matches = [hit for hit in footnotes[slug] if hit.footnote_id == note]
        assert len(matches) == 1, (slug, note)
        assert not matches[0].shared_with, (slug, matches[0].shared_with)
        assert not matches[0].ambiguous, (slug, note)

    # Do not erase a genuinely multi-work citation in the process.
    shared = [
        hit
        for hit in footnotes["indiana-university-athletics-coach-bob-knight-passes-away-at-83"]
        if hit.footnote_id == "c4-knight-method"
    ]
    assert len(shared) == 1
    assert shared[0].shared_with
