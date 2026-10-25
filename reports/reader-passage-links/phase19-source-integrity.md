# Phase 19 — source integrity & outstanding evidence

## Audit scope

This report reconciles live source records with the saved **Phase 18 rendered-reader**
audit. Metadata and bibliography checks are recomputed from the current corpus.
A correct footnote anchor is *not* independent confirmation that the source
supports every assertion made in a chapter.

- Render-verified reader links: **634 / 714**
- Invalid reader paths: **0**; unverified fragments: **0**
- Unlinked source records: **80**
- Fresh metadata issues: **0 critical, 160 warnings, 229 informational**
- Bibliography drift across **25** audited books: **38 missing sources, 0 missing book links, 0 stale book links**

## Unlinked sources by evidence

| Class | Count | Decision |
|---|---:|---|
| Cited footnote without link | 2 | Recheck the *specific work and claim* before linking |
| Thematic prose overlap only | 1 | Do not promote a title mention into a citation |
| Bibliography only | 59 | Accept background reading unless the text specifically relies on it |
| No detected citation evidence | 18 | Review corpus relevance; never invent manuscript citations |

## Current bibliography reconciliation gaps

Only high-confidence matches to *existing* source records are safe to add
automatically. Remaining references need publication and creator metadata
review, and a weak title-less match must not become a false source link.

### when-the-key-changes-hands — 38 absent sources; 0 unmatched book relations

- **Needs source record:** `annas-julia-intelligent-virtue` — Intelligent Virtue
- **Needs source record:** `anscombe-g-e-m-modern-moral-philosophy` — Modern Moral Philosophy
- **Needs source record:** `aristotle-nicomachean-ethics` — Nicomachean Ethics
- **Needs source record:** `bandura-albert-moral-disengagement-in-the-perpetration-of-inhumanities` — Moral Disengagement in the Perpetration of Inhumanities
- **Needs source record:** `burns-james-macgregor-leadership` — Leadership
- **Needs source record:** `calhoun-cheshire-standing-for-something` — Standing for Something
- **Needs source record:** `doris-john-m-lack-of-character-personality-and-moral-behavior` — Lack of Character: Personality and Moral Behavior
- **Needs source record:** `duckworth-angela-grit` — Grit
- **Needs source record:** `edelman-murray-the-symbolic-uses-of-politics` — The Symbolic Uses of Politics
- **Needs source record:** `eisenstadt-shmuel-n-ed-max-weber-on-charisma-and-institution-building` — Max Weber on Charisma and Institution Building
- **Needs source record:** `frankfurt-harry-g-the-importance-of-what-we-care-about` — The Importance of What We Care About
- **Needs source record:** `frankfurt-harry-g-the-reasons-of-love` — The Reasons of Love
- **Needs source record:** `gardner-john-w-on-leadership` — On Leadership
- **Needs source record:** `geertz-clifford-centers-kings-and-charisma-reflections-on-the` — Centers, Kings, and Charisma: Reflections on the
- **Needs source record:** `griswold-charles-l-forgiveness-a-philosophical-exploration` — Forgiveness: A Philosophical Exploration
- **Needs source record:** `grusky-oscar-managerial-succession-and-organizational-effectiveness` — Managerial Succession and Organizational Effectiveness
- **Needs source record:** `harman-gilbert-moral-philosophy-meets-social-psychology-virtue-ethics` — Moral Philosophy Meets Social Psychology: Virtue Ethics
- **Needs source record:** `heifetz-ronald-alexander-grashow-and-marty-linsky-the-practice-of` — The Practice of
- **Needs source record:** `held-virginia-the-ethics-of-care-personal-political-and-global` — The Ethics of Care: Personal, Political, and Global
- **Needs source record:** `herman-judith-truth-and-repair-how-trauma-survivors-envision-justice` — Truth and Repair: How Trauma Survivors Envision Justice
- **Needs source record:** `hooks-bell-all-about-love-new-visions` — All About Love: New Visions
- **Needs source record:** `james-william-habit` — Habit
- **Needs source record:** `jones-karen-trust-as-an-affective-attitude` — Trust as an Affective Attitude
- **Needs source record:** `kant-immanuel-groundwork-of-the-metaphysics-of-morals` — Groundwork of the Metaphysics of Morals
- **Needs source record:** `madison-james-federalist-no-51-in-the-federalist-papers-edited-by` — Madison, James. Federalist No. 51. In *The Federalist Papers*, edited by
- **Needs source record:** `merton-robert-k-the-unanticipated-consequences-of-purposive-social` — The Unanticipated Consequences of Purposive Social
- **Needs source record:** `mischel-walter-personality-and-assessment` — Personality and Assessment
- **Needs source record:** `nagel-thomas-moral-luck` — Moral Luck
- **Needs source record:** `niebuhr-reinhold-the-irony-of-american-history` — The Irony of American History
- **Needs source record:** `o-neill-onora-a-question-of-trust-the-bbc-reith-lectures-2002` — A Question of Trust: The BBC Reith Lectures 2002
- **Needs source record:** `pettit-philip-republicanism-a-theory-of-freedom-and-government` — Republicanism: A Theory of Freedom and Government
- **Needs source record:** `pfeffer-jeffrey-the-ambiguity-of-leadership` — The Ambiguity of Leadership
- **Needs source record:** `polanyi-michael-the-tacit-dimension` — The Tacit Dimension
- **Needs source record:** `ricoeur-paul-oneself-as-another` — Oneself as Another
- **Needs source record:** `walker-margaret-urban-moral-repair-reconstructing-moral-relations-after` — Moral Repair: Reconstructing Moral Relations after
- **Needs source record:** `williams-bernard-moral-luck` — Moral Luck
- **Needs source record:** `wolf-susan-moral-saints` — Moral Saints
- **Needs source record:** `wood-wendy-good-habits-bad-habits` — Good Habits, Bad Habits

## Metadata warning classes

- **work_creator_mismatch**: 229
- **orphan_creator_slug**: 150
- **missing_name_separator**: 10

## Editorial review queue

- **guha-ramachandra-gandhi-before-india** (footnote_cited_not_linked).
  - Related books: when-others-become-leaders; footnote hits: 1
  - **Do not force-link:** Gandhi Before India covers his early career, not the late-life celibacy practices described by the shared note. Do not present it as evidence for those practices.
- **popper-karl-the-open-society-and-its-enemies** (footnote_cited_not_linked).
  - Related books: when-the-key-changes-hands; footnote hits: 1
- **schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast** (thematic_connection_only).
  - Related books: the-economy-we-dont-experience; footnote hits: 0

## Full unlinked inventory

| Source slug | Evidence class | Related books |
|---|---|---|
| `abbott-andrew-the-system-of-professions-an-essay-on-the-division-of-expert-labor` | bibliography_only | living-in-sediment |
| `acemoglu-daron-and-james-a-robinson-why-nations-fail-the-origins-of-power` | bibliography_only | living-in-sediment |
| `arendt-hannah-the-life-of-the-mind` | bibliography_only | when-moral-seriousness-scales |
| `arendt-hannah-the-origins-of-totalitarianism` | no_detected_evidence | — |
| `arthur-w-brian-competing-technologies-increasing-returns-and-lock-in-by` | bibliography_only | living-in-sediment |
| `barker-eileen-the-making-of-a-moonie-choice-or-brainwashing` | no_detected_evidence | — |
| `belfast-agreement-good-friday-agreement-multi-party-agreement-and-british-irish-agreement-10-apr` | bibliography_only | the-world-we-make-together |
| `berlin-isaiah-the-hedgehog-and-the-fox` | no_detected_evidence | — |
| `braudel-fernand-on-history` | bibliography_only | before-certainty-arrives |
| `brown-judith-m-gandhi-s-rise-to-power-indian-politics-1915-1922` | bibliography_only | when-others-become-leaders |
| `brown-v-board-of-education-347-u-s-483-1954` | bibliography_only | the-world-we-make-together |
| `chryssides-george-d-the-advent-of-sun-myung-moon-the-origins-beliefs-and-practices-of-the-unific` | no_detected_evidence | — |
| `constitution-of-the-republic-of-south-africa-act-200-of-1993-interim-constitution` | bibliography_only | the-world-we-make-together |
| `davies-paul-about-time-einstein-s-unfinished-revolution` | bibliography_only | living-in-sediment |
| `demarco-tom-and-timothy-lister-slack-getting-past-burnout-busywork-and-the` | bibliography_only | living-in-sediment |
| `deutscher-guy-through-the-language-glass-why-the-world-looks-different-in-other` | bibliography_only | living-in-sediment |
| `dewey-john-ethics` | bibliography_only | after-certainty |
| `edmondson-amy-c-teaming-how-organizations-learn-innovate-and-compete-in-the-knowledge-economy` | bibliography_only | trust-beyond-similarity |
| `eisenhower-dwight-d-executive-order-10730-providing-assistance-for-the-removal-of-an-obstruction` | bibliography_only | the-world-we-make-together |
| `elias-norbert-time-an-essay` | bibliography_only | living-in-sediment |
| `ellul-jacques-propaganda-the-formation-of-men-s-attitudes` | no_detected_evidence | — |
| `espn-new-policy-requires-on-field-players-personnel-to-stand-for-anthem` | bibliography_only | the-game-we-think-we-saw |
| `espn-qb-colin-kaepernick-files-grievance-for-collusion-against-nfl-owners` | bibliography_only | the-game-we-think-we-saw |
| `festinger-leon-henry-w-riecken-and-stanley-schachter-when-prophecy-fails` | no_detected_evidence | — |
| `feynman-richard-p-personal-observations-on-the-reliability-of-the-shuttle` | bibliography_only | the-world-we-make-together |
| `foucault-michel-power-knowledge-selected-interviews-and-other-writings-1972-1977` | no_detected_evidence | — |
| `foucault-michel-society-must-be-defended-lectures-at-the-coll-ge-de-france-1975-76` | no_detected_evidence | — |
| `foucault-michel-the-order-of-things-an-archaeology-of-the-human-sciences` | bibliography_only | living-in-sediment |
| `frankopan-peter-the-silk-roads-a-new-history-of-the-world` | bibliography_only | living-in-sediment |
| `fukuyama-francis-trust-the-social-virtues-and-the-creation-of-prosperity` | bibliography_only | trust-beyond-similarity, when-authority-outlives-accountability |
| `geertz-clifford-the-interpretation-of-cultures` | bibliography_only | living-in-sediment |
| `gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and` | bibliography_only | when-others-become-leaders |
| `gott-richard-hugo-ch-vez-and-the-bolivarian-revolution` | no_detected_evidence | — |
| `graeber-david-debt-the-first-5-000-years` | bibliography_only | living-in-sediment |
| `guha-ramachandra-gandhi-before-india` | footnote_cited_not_linked | when-others-become-leaders |
| `habermas-j-rgen-the-theory-of-communicative-action` | no_detected_evidence | — |
| `haidt-jonathan-the-righteous-mind-why-good-people-are-divided-by-politics-and-religion` | bibliography_only | trust-beyond-similarity |
| `heilbron-john-l-galileo` | bibliography_only | when-authority-is-misread |
| `international-organization-for-standardization-iso-iec-42001-2023-information-technology-artific` | bibliography_only | coupling |
| `knutti-reto-et-al-challenges-in-combining-projections-from-multiple-climate-models` | bibliography_only | what-we-cannot-see |
| `krier-l-on-the-architecture-of-community` | bibliography_only | living-in-sediment |
| `latour-bruno-reassembling-the-social-an-introduction-to-actor-network-theory` | bibliography_only | living-in-sediment |
| `levine-amy-jill-short-stories-by-jesus-the-enigmatic-parables-of-a-controversial-rabbi` | bibliography_only | when-others-become-leaders |
| `liebowitz-s-j-and-stephen-e-margolis-path-dependence-lock-in-and-history` | bibliography_only | living-in-sediment |
| `maslach-christina-and-michael-p-leiter-the-truth-about-burnout` | bibliography_only | when-authority-outlives-accountability |
| `mellers-barbara-et-al-identifying-and-cultivating-superforecasters-as-a-method-of-improving-prob` | bibliography_only | what-we-cannot-see |
| `mouffe-chantal-the-democratic-paradox` | no_detected_evidence | — |
| `national-museum-of-african-american-history-and-culture-black-panther-party-community-survival-p` | bibliography_only | the-world-we-make-together |
| `national-park-service-little-rock-central-high-school-national-historic-site-https-www-nps-gov-c` | bibliography_only | the-world-we-make-together |
| `national-park-service-pullman-national-historical-park-https-www-nps-gov-pull` | bibliography_only | the-world-we-make-together |
| `nguyen-c-thi-games-agency-as-art` | bibliography_only | trust-beyond-similarity |
| `nissen-hans-j-peter-damerow-and-robert-k-englund-archaic` | bibliography_only | before-certainty-arrives |
| `northern-ireland-office-electoral-office-for-northern-ireland-results-of-the-22-may-1998-referen` | bibliography_only | the-world-we-make-together |
| `page-scott-e-the-diversity-bonus-how-great-teams-pay-off-in-the-knowledge-economy` | bibliography_only | trust-beyond-similarity |
| `parker-ashley-and-michael-scherer-donald-trump-and-his-assault-on-truth` | no_detected_evidence | — |
| `petroski-henry-the-evolution-of-useful-things` | bibliography_only | living-in-sediment |
| `popper-karl-the-open-society-and-its-enemies` | footnote_cited_not_linked | when-the-key-changes-hands |
| `postman-neil-amusing-ourselves-to-death` | no_detected_evidence | — |
| `reuters-u-s-quarterback-kaepernick-settles-grievance-case-with-nfl` | bibliography_only | the-game-we-think-we-saw |
| `reynolds-v-sims-377-u-s-533-1964` | bibliography_only | the-world-we-make-together |
| `rosenblat-alex-uberland-how-algorithms-are-rewriting-the-rules-of-work` | bibliography_only | trust-beyond-similarity |
| `schmitt-carl-the-concept-of-the-political` | no_detected_evidence | — |
| `schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast` | thematic_connection_only | the-economy-we-dont-experience |
| `schulz-kenneth-f-et-al-empirical-evidence-of-bias-dimensions-of-methodological-quality-associate` | bibliography_only | what-we-cannot-see |
| `shklar-judith-ordinary-vices` | no_detected_evidence | — |
| `silver-nate-the-signal-and-the-noise-why-so-many-predictions` | bibliography_only | how-serious-systems-learn |
| `solnit-rebecca-a-field-guide-to-getting-lost` | bibliography_only | living-in-sediment |
| `solnit-rebecca-hope-in-the-dark-untold-histories-wild-possibilities` | bibliography_only | living-in-sediment |
| `solnit-rebecca-no-straight-road-takes-you-there-essays-for-uneven-terrain` | bibliography_only | living-in-sediment |
| `star-susan-leigh-and-james-r-griesemer-institutional-ecology-translations-and-boundary-objects` | bibliography_only | trust-beyond-similarity |
| `steffensen-kevin-when-authority-is-misread` | no_detected_evidence | — |
| `steffensen-kevin-when-authority-outlives-accountability-a-lens-for` | no_detected_evidence | — |
| `steffensen-kevin-when-others-look-to-you-companion-edition` | bibliography_only | when-authority-is-misread |
| `svendsen-gert-tinggaard-trust` | bibliography_only | trust-beyond-similarity |
| `sveriges-riksbank-prize-in-economic-sciences-in-memory-of-alfred-nobel-2009-prize-announcement-f` | bibliography_only | the-world-we-make-together |
| `tilly-charles-big-structures-large-processes-huge-comparisons` | bibliography_only | living-in-sediment |
| `u-s-department-of-defense-dod-std-2167a-defense-system-software-development` | bibliography_only | coupling |
| `u-s-house-of-representatives-impeaching-donald-john-trump-president-of-the-united-states-for-hig` | bibliography_only | when-interpretation-no-longer-matters |
| `united-nations-framework-convention-on-climate-change-paris` | bibliography_only | when-incentives-become-the-moral-language |
| `woodward-bob-fear-trump-in-the-white-house` | no_detected_evidence | — |

## Editorial standard

Unlinked does not mean broken. Check the bibliography and prose before removing
a reference or adding a manuscript note. Do not convert incidental keyword
matches into source relationships, and preserve prior explicit exclusions.
Run `python tools/report_source_integrity_phase19.py --repo .` after
regenerating the reader-passage audit when the corpus changes.
