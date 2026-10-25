# Reader passage links audit

Read-only scan of `semantic/sources`, `semantic/thinkers`, and published
manuscripts. Evidence levels A–E follow the reader-passage-enrichment skill:
bibliography-only and keyword overlap never count as verified passages.

## Coverage summary

### Sources

- Total sources scanned: **714**
- With `readerPassagePath`: **634**
- Structurally valid + fragment-checked paths: **634**
- Verified link + mechanically tied citation (level A): **634**
- Mechanical footnote candidates (level B / strong_candidate): **1**
- Path present but needs editorial review: **0**
- Fragment check skipped (unverified): **0**
- Invalid passage links: **0**
- Missing path but footnote-cited: **1**
- Bibliography only (level D): **60**
- Tied-citation (level A) coverage: **88.8%**
- `whyThisMatters` present/substantive: **634**

Level A means a public path whose fragment is the matched citation invocation — a *mechanical* condition, not editorial approval of philosophical relevance. All newly proposed connections still need editorial review before YAML enrichment.

Evidence levels:

- A: 634
- B: 1
- C: 1
- D: 60
- E: 18

### Thinkers

- Total thinkers scanned: **643**
- With derivable work passage links: **590**
- Useful derived path coverage: **91.76%**

Evidence levels:

- A: 590
- B: 0
- C: 0
- D: 53
- E: 0

## Unresolved / invalid passage links

_None._

## Ranked improvement opportunities

- **B** `guha-ramachandra-gandhi-before-india` — strong_candidate; action `editorial_review_then_add_path`; candidate `/explore/books/when-others-become-leaders/chapters/parts-part-1-how-influence-begins-chapter-2-salt#user-content-fnref-s2-9`
- **C** `schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast` — thematic_connection; action `editorial_review_consider_citation`; candidate `/explore/books/the-economy-we-dont-experience/chapters/parts-part-3-leadership-in-a-compressed-world-chapter-6-leadership-in-a-one-sentence-world`

## Verified link + mechanically tied citation examples (level A)

- `abate-tom-nummi-workers-say-their-final-good-byes` → `/explore/books/the-world-we-make-together/chapters/parts-part-2-where-power-gathers-chapter-5-the-clipboard#user-content-fnref-c5-nummi-workers`
- `addams-jane-twenty-years-at-hull-house` → `/explore/books/when-others-become-leaders/chapters/parts-part-3-how-influence-endures-chapter-7-the-house#user-content-fnref-h1`
- `adler-paul-s-the-learning-bureaucracy-new-united-motor-manufacturing-inc` → `/explore/books/the-world-we-make-together/chapters/parts-part-2-where-power-gathers-chapter-5-the-clipboard#user-content-fnref-c5-nummi-research`
- `agamben-giorgio-state-of-exception` → `/explore/books/when-others-look-to-you-v2/chapters/parts-part-3-eroding-chapter-9-exceptions-are-forever#user-content-fnref-c9-temporary-becomes-permanent`
- `albertz-rainer-israel-in-exile-the-history-and-literature-of-the` → `/explore/books/before-certainty-arrives/chapters/parts-part-2-compression-under-scale-chapter-5-shared-conditions-not-shared-revelation#user-content-fnref-c5-babylonian-exile`
- `alexander-christopher-sara-ishikawa-murray-silverstein-et-al-a-pattern-language` → `/explore/books/living-in-sediment/chapters/parts-part-2-fossils-that-shape-power-chapter-8-the-building-and-the-gathering#user-content-fnref-c8-alexander-patterns`
- `alexander-christopher-the-timeless-way-of-building` → `/explore/books/living-in-sediment/chapters/parts-part-2-fossils-that-shape-power-chapter-8-the-building-and-the-gathering#user-content-fnref-c8-timeless-way`
- `alexander-robin-die-getriebenen-merkel-und-die-fl-chtlingspolitik` → `/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-3-angela-merkel-the-unanswered-need-for-reassurance#user-content-fnref-c3-alexander-merkel`
- `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-07-devops-restoring-operational-coupling#user-content-fnref-c7-devops-emergence`
- `ambedkar-b-r-what-congress-and-gandhi-have-done-to-the-untouchables` → `/explore/books/when-others-become-leaders/chapters/parts-part-1-how-influence-begins-chapter-2-salt#user-content-fnref-s2-7`
- `american-college-of-emergency-physicians-boarding` → `/explore/books/when-incentives-become-the-moral-language/chapters/parts-part-1-the-need-for-translation-chapter-1-the-bed-someone-else-needs#user-content-fnref-c1-boarding`
- `amershi-saleema-et-al-guidelines-for-human-ai-interaction` → `/explore/books/coupling/chapters/parts-part-3-ai-and-structural-entropy-16-the-new-professional-literacy#user-content-fnref-c16-opening`
- `anderson-benedict-imagined-communities-reflections-on-the-origin-and-spread-of-nationalism` → `/explore/books/trust-beyond-similarity/chapters/parts-part-1-the-illusion-of-sufficiency-chapter-2-shared-stories-create-trust#user-content-fnref-c2-anderson-imagined`
- `anderson-c-w-rebuilding-the-news-metropolitan-journalism-in-the-digital-age` → `/explore/books/coupling/chapters/parts-part-4-institutions-under-drift-19-media-and-algorithmic-coupling#user-content-fnref-c19-editorial`
- `andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl` → `/explore/books/the-game-we-think-we-saw/chapters/parts-part-3-what-the-result-demands-chapter-6-the-athlete-who-said-no#user-content-fnref-c6-colts-retirement`
- `andrews-matthew-lant-pritchett-and-michael-woolcock-escaping-capability-traps-through-problem-dr` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-08-heart-of-agile-returning-to-essentials#user-content-fnref-c8-public-service`
- `andscape-for-allen-iverson-it-was-never-just-about-practice` → `/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-iverson-andscape`
- `arendt-hannah-between-past-and-future` → `/explore/books/when-accountability-no-longer-expires/chapters/front-matter-preface-why-this-book-exists#user-content-fnref-preface-arendt-clarity`
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` → `/explore/books/when-authority-outlives-accountability/chapters/parts-part-1-the-three-dimensions-chapter-2-moral-posture-toward-harm#user-content-fnref-c2-arendt-eichmann-in-jerusalem`
- `arendt-hannah-on-revolution` → `/explore/books/when-moral-seriousness-scales/chapters/parts-part-4-what-remains-possible-chapter-9-rebuilding-density#user-content-fnref-c9-arendt-on-revolution`

## Thinkers with derivable passage links

- `a-leo-oppenheim`: `oppenheim-a-leo-ancient-mesopotamia-portrait-of-a-dead` → `/explore/books/before-certainty-arrives/chapters/parts-part-1-constraint-before-choice-chapter-3-from-power-to-moral-legitimacy#user-content-fnref-p18-ancient-mesopotamia-portrai-29cc461`
- `adolf-a-berle`: `berle-adolf-a-jr-and-gardiner-c-means-the-modern-corporation-and-private-property` → `/explore/books/coupling/chapters/parts-part-4-institutions-under-drift-17-finance-ownership-without-cohesion#user-content-fnref-c17-opening`
- `akihiko-murata`: `lewis-catherine-c-rebecca-r-perry-and-akihiko-murata-how-should-research-contribute-to-instructi` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-08-heart-of-agile-returning-to-essentials#user-content-fnref-c8-education`
- `alasdair-macintyre`: `macintyre-alasdair-after-virtue-a-study-in-moral-theory` → `/explore/books/how-trust-forms/chapters/parts-part-3-what-trust-makes-possible-chapter-7-trust-and-leadership#user-content-fnref-c7-macintyre`
- `albert-bandura`: `bandura-albert-social-learning-theory` → `/explore/books/when-others-look-to-you-v1/chapters/parts-part-1-how-influence-forms-chapter-1-the-weight-of-being-looked-to#user-content-fnref-c1-modeling-and-signals`
- `albert-o-hirschman`: `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` → `/explore/books/when-authority-outlives-accountability/chapters/parts-part-2-integration-and-use-chapter-5-the-integrated-model#user-content-fnref-c5-hirschman-exit-voice-and`, `hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility` → `/explore/books/when-authority-outlives-accountability/chapters/parts-part-1-the-three-dimensions-chapter-1-why-leadership-evaluation-fails#user-content-fnref-c1-hirschman-the-rhetoric-of`
- `aldon-d-morris`: `morris-aldon-d-the-origins-of-the-civil-rights-movement-black-communities-organizing-for-change` → `/explore/books/when-others-become-leaders/chapters/parts-part-2-how-influence-moves-chapter-4-the-march#user-content-fnref-m4-3`
- `alexander-weisler`: `wachsmuth-david-and-alexander-weisler-airbnb-and-the-rent-gap-gentrification-through-the-sharing` → `/explore/books/trust-beyond-similarity/chapters/parts-part-2-the-shock-of-the-partial-chapter-4-different-summaries#user-content-fnref-c4-airbnb-neighborhoods`
- `alice-h-eagly`: `eagly-alice-h-and-linda-l-carli-through-the-labyrinth-the-truth` → `/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-3-angela-merkel-the-unanswered-need-for-reassurance#user-content-fnref-c3-eagly`
- `alistair-cockburn`: `beck-kent-mike-beedle-arie-van-bennekum-alistair-cockburn-ward-cunningham-martin-fowler-james-gr` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-bridge#user-content-fnref-p18-manifesto-for-agile-softwar-48083dd`, `cockburn-alistair-agile-software-development` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-bridge#user-content-fnref-p18-agile-software-development-3c26df5`, `cockburn-alistair-hexagonal-architecture-ports-and-adapters` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-10-shift-left-temporal-compression#user-content-fnref-c10-bridge-hex`, `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` → `/explore/books/when-others-look-to-you-v1/chapters/parts-part-1-how-influence-forms-chapter-1-the-weight-of-being-looked-to#user-content-fnref-c1-attention-and-leadership`, `cockburn-alistair-the-heart-of-agile` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-08-heart-of-agile-returning-to-essentials#user-content-fnref-c8-emergence`
- `allister-sparks`: `sparks-allister-tomorrow-is-another-country-the-inside-story-of-south-africa-s-road-to-change` → `/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-8-nelson-mandela-the-unsent-letter#user-content-fnref-c8-sparks`
- `american-college-of-emergency-physicians`: `american-college-of-emergency-physicians-boarding` → `/explore/books/when-incentives-become-the-moral-language/chapters/parts-part-1-the-need-for-translation-chapter-1-the-bed-someone-else-needs#user-content-fnref-c1-boarding`
- `amy-c-edmondson`: `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` → `/explore/books/when-others-look-to-you-v1/chapters/parts-part-1-how-influence-forms-chapter-1-the-weight-of-being-looked-to#user-content-fnref-c1-silence-and-accountability`, `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` → `/explore/books/how-serious-systems-learn/chapters/parts-part-1-why-knowing-no-longer-governs-outcomes-chapter-2-confidence-outruns-correction#user-content-fnref-c2-source-amy-c-edmondson`
- `andrew-hunt`: `beck-kent-mike-beedle-arie-van-bennekum-alistair-cockburn-ward-cunningham-martin-fowler-james-gr` → `/explore/books/coupling/chapters/parts-part-2-software-as-early-laboratory-bridge#user-content-fnref-p18-manifesto-for-agile-softwar-48083dd`
- `andrew-jameton`: `jameton-andrew-nursing-practice-the-ethical-issues` → `/explore/books/when-incentives-become-the-moral-language/chapters/parts-part-4-what-judgment-still-knows-chapter-11-the-institution-that-cannot-hear-itself#user-content-fnref-p18-nursing-practice-the-ethica-5c15e23`
- `andrew-s-grove`: `grove-andrew-s-high-output-management` → `/explore/books/how-serious-systems-learn/chapters/parts-part-1-why-knowing-no-longer-governs-outcomes-chapter-2-confidence-outruns-correction#user-content-fnref-c2-source-andrew-s-grove`
- `andrew-walker`: `andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl` → `/explore/books/the-game-we-think-we-saw/chapters/parts-part-3-what-the-result-demands-chapter-6-the-athlete-who-said-no#user-content-fnref-c6-colts-retirement`
- `andrew-ward`: `ross-lee-and-andrew-ward-naive-realism-in-everyday-life` → `/explore/books/how-meaning-moves/chapters/parts-part-ii-rooms-that-accelerate-meaning-chapter-4-when-the-pauses-disappear#user-content-fnref-c4-identity-and-caricature`
- `andrew-zaldivar`: `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-sp` → `/explore/books/coupling/chapters/parts-part-3-ai-and-structural-entropy-14-guardrails-as-constraint-architecture#user-content-fnref-p18-model-cards-for-model-repor-a331fab`
- `andscape`: `andscape-for-allen-iverson-it-was-never-just-about-practice` → `/explore/books/the-game-we-think-we-saw/chapters/parts-part-4-what-the-result-becomes-chapter-7-when-a-gesture-becomes-another-message#user-content-fnref-c7-iverson-andscape`
- `angelina-mcmillan-major`: `bender-emily-m-timnit-gebru-angelina-mcmillan-major-and-shmargaret-shmitchell-on-the-dangers-of` → `/explore/books/coupling/chapters/parts-part-3-ai-and-structural-entropy-12-the-frictionless-illusion#user-content-fnref-c12-cross-domain`
- `anna-c-merritt`: `merritt-anna-c-daniel-a-effron-and-beno-t-monin-moral-self-licensing-when-being-good-frees-us-to` → `/explore/books/when-authority-is-misread/chapters/parts-part-1-before-the-leader-becomes-a-story-chapter-2-the-chair-no-one-reconsiders#user-content-fnref-c2-posture`
- `anna-tavis`: `cappelli-peter-and-anna-tavis-the-performance-management-revolution` → `/explore/books/when-incentives-become-the-moral-language/chapters/parts-part-2-when-the-translation-takes-over-chapter-5-the-matrix-with-no-author#user-content-fnref-c5-cappelli`
- `annette-c-baier`: `baier-annette-c-trust-and-antitrust` → `/explore/books/how-trust-forms/chapters/front-matter-introduction-how-trust-forms#user-content-fnref-intro-baier-vulnerability`
- `annibale-fantoli`: `fantoli-annibale-galileo-for-copernicanism-and-for-the-church` → `/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-6-galileo-galilei-the-permission-to-see#user-content-fnref-c6-fantoli`
- `anselm-strauss`: `star-susan-leigh-and-anselm-strauss-layers-of-silence-arenas-of-voice-the-ecology-of-visible-and` → `/explore/books/why-collaboration-is-so-hard/chapters/parts-chapter-3-the-person-who-keeps-the-spreadsheet#user-content-fnref-c3-star-strauss`
- `anthony-giddens`: `giddens-anthony-the-constitution-of-society-outline-of-the-theory-of` → `/explore/books/living-in-sediment/chapters/parts-part-4-living-among-sediment-chapter-15-archaeology-of-the-present#user-content-fnref-c15-giddens-structuration`
- `anthony-pagden`: `pagden-anthony-the-fall-of-natural-man-the-american-indian-and-the` → `/explore/books/before-certainty-arrives/chapters/parts-part-3-inherited-certainty-chapter-8-renaissance-exploration-and-fracture#user-content-fnref-p18-the-fall-of-natural-man-the-f8174f1`
- `anthony-sampson`: `sampson-anthony-mandela-the-authorized-biography` → `/explore/books/when-authority-is-misread/chapters/parts-part-2-leaders-becoming-legible-chapter-8-nelson-mandela-the-unsent-letter#user-content-fnref-c8-sampson`
- `anupama-rao`: `rao-anupama-the-caste-question-dalits-and-the-politics-of-modern-india` → `/explore/books/when-others-become-leaders/chapters/parts-part-1-how-influence-begins-chapter-2-salt#user-content-fnref-s2-rao-caste-politics`
