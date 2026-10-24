# Reader passage editorial batch — Phase 11

Continues Phase 8 ([#703](https://github.com/After-Certainty/after-certainty/pull/703)), Phase 9 ([#722](https://github.com/After-Certainty/after-certainty/pull/722)), Phase 10 ([#723](https://github.com/After-Certainty/after-certainty/pull/723)), and the renderer-validated audit sync ([#724](https://github.com/After-Certainty/after-certainty/pull/724)).

## Editorial method

This is a bounded review of **eight citation clusters** in *The Game We Think We Saw*, selected for possible ambiguity between separate historical events and multiple reports of the *same* event. Five source profiles gain reader destinations across **three** clusters; five clusters intentionally remain deferred or unchanged.

Review evidence includes directly consulted published NFL reporting, NFLPA's 2018 statement, Indiana University's career summary, the Los Angeles Times's 1985 AP wire report, AP's Knight retrospective, and the manuscript's existing cited notes. This is **not** a claim that books such as Feinstein's *A Season on the Brink* were reread in full. Citation matches and renderer paths do not establish the truth of the manuscript's interpretation.

## Applied

### 1. NFL anthem policy — two different decisions, May and July 2018

**Outcome A — divide genuinely different events.**

- **NFL.com, “NFL Owners Approve National Anthem Policy for 2018” (May 23):** identifies the sideline-standing rule, remain-off-field option and club fines. New sole-work `[^c7-policy-approved]`.
- **NFL.com, “NFL Anthem Policy on Hold under Standstill Agreement” (July 19):** describes the NFL/NFLPA pause on new rules and enforcement while talks continued. New sole-work `[^c7-policy-standstill]`.
- **ESPN's May 23 adoption story** remains a **deferred corroboration source** rather than being given a fabricated distinct claim.

This separates a **policy vote** from a **subsequent standstill**; it does not claim that the standstill permanently revoked the earlier policy.

Verification:
[NFL policy announcement](https://www.nfl.com/news/nfl-owners-approve-national-anthem-policy-for-2018-0ap3000000933971),
[NFL account of standstill](https://www.nfl.com/news/nfl-anthem-policy-on-hold-under-standstill-agreement-0ap3000000941064),
[NFLPA joint statement (July 20 page date)](https://nflpa.com/press/joint-statement-on-anthem-policy).

### 2. Bob Knight chair — incident versus Big Ten discipline

**Outcome A — the episode and its sanction belong to different dates.**

- **Associated Press, “Bob Knight's Chair: College Basketball's Classic Furniture”:** retrospective of Knight's February 23, 1985 chair toss, ejection and public myth. New `[^c4-chair-incident]`.
- **Los Angeles Times archive of AP wire, “Knight Suspended for a Game by Big Ten for Throwing Chair” (March 3):** contemporary report of the March 2 Big Ten one-game suspension and warning of further sanctions. New `[^c4-chair-sanction]`.

The manuscript previously packaged the incident, apology and later suspension under one co-citation. The revised paragraph preserves that narrative but distinguishes the event from the institution's response. The Times is the **archival publication**, not the original newswire byline; the note now says so.

Verification:
[AP retrospective (KSL syndication)](https://www.ksl.com/article/50773222),
[Los Angeles Times March 3 AP wire report](https://www.latimes.com/archives/la-xpm-1985-03-03-sp-32864-story.html).

### 3. Bob Knight career record — verified university statistics

**Outcome B — scope the statistical citation to a directly checkable institutional account.**

- **Indiana University Athletics, “Coach Bob Knight Passes Away at 83” (November 1, 2023):** documents 902 career wins, 1976/1981/1987 NCAA titles, the undefeated 1976 season, and 1984 Olympic gold. The already-authored `[^c4-knight-record]` now cites the institution's summary alone.
- **Knight's coaching methods** still have a **mixed note** `[^c4-knight-method]` involving IU, Associated Press and John Feinstein. That previously deferred note stays deferred. The university's commemorative account is not taken as an independent assessment of coaching conduct.

Verification:
[Indiana University Athletics record](https://iuhoosiers.com/news/2023/11/1/mens-basketball-coach-bob-knight-passes-away-at-83).

## Reviewed but deliberately not linked — five clusters

| Cluster | Decision | Editorial reason |
|---|---|---|
| Bob Knight coaching methods (IU, AP, Feinstein) | **Deferred** | Career methods and the claims about discipline / academics draw on multiple perspectives; no unique placement is yet defensible without more source-text comparison |
| Bob Knight 2020 reunion (ESPN, AP) | **Preserve shared** | Two reports cover one appearance; a separate citation per article would not reflect separate claims |
| NFL May policy (ESPN) | **Preserve corroboration** | Same May 23 approval described in the newly distinct NFL.com note; no separate ESPN-backed proposition |
| Andrew Luck's 2019 retirement (AP Marot, Colts.com Walker) | **Preserve shared** | Reporting on the same announcement; Phase 8 decision remains valid |
| Kaepernick grievance filing (AP + ESPN) | **Preserve shared** | Both describe the same October 2017 filing; separate claim attribution would overfit source count |

These are review dispositions, not denials of the sources' value. In particular, `deferred` remains eligible for later re-review.

## Review log and report contract

- **Five** new source-level `readerPassagePath` and source-specific `whyThisMatters` values.
- Four superseded shared-note candidate keys (`c4-chair`, `c7-policy`) marked `skipped` *with replacements*; five claim-specific keys marked `applied`.
- Indiana's `c4-knight-method` remains `deferred`, because it is still present in the chapter and legitimately shared.
- No thinker fields or one-path-per-source schema changes; no edits to sources from other books.

**Audit generation belongs in this PR.** After the source and manuscript changes, run the full audit with rendered HTML validation and commit its generated `audit.md` and `audit.summary.json`. Do not manually edit coverage metrics. The generated result must have zero invalid and zero unverified fragment paths, and all five newly linked sources must appear among mechanically tied A examples (which still are not an editorial attestation).

### Checks

```bash
uv run pytest tests/test_reader_passage_phase11.py tests/test_reader_passage_links.py -q
uv run python tools/audit_reader_passage_links.py --repo .
```

Validate that previous Phase 10 links stay intact, and that only the two changed chapters and five semantic source files carry new editorial content.
