# Bibliography ↔ semantic drift audit

Manuscript bibliographies are the source of truth for which works (and thus creators) belong to each book. This report is **read-only** — no `semantic/sources` or `semantic/thinkers` YAML was modified.

## Follow-on reconcile rules

1. **missing_in_semantic** — extract drafts for that book → `make promote-semantic-source-drafts SOURCE_PROMOTE_BOOK_IDS='…'` (no prune) → backfill metadata.
2. **missing_related_books** — add the book id to the existing source’s `relatedBooks` (do not duplicate the YAML).
3. **stale_related_books** — remove only that book id from `relatedBooks` (keep the file if still linked elsewhere).
4. Re-derive / update thinkers so `works` and `relatedBooks` match reconciled sources; do not auto-delete multi-book thinker nodes.
5. `make verify-semantic-ontology`.

## Portfolio summary

- Books with bibliography audited: **22**
- Matched pairs: **482**
- Missing in semantic (no work found): **190**
- Exists but missing `relatedBooks` link: **61**
- Stale `relatedBooks` links: **23**

| Book | Style | Biblio | Linked | Matched | Missing | Missing RB | Stale |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `after-certainty` | list | 27 | 19 | 19 | 0 | 8 | 0 |
| `before-certainty-arrives` | list | 42 | 6 | 6 | 31 | 5 | 0 |
| `coupling` | list | 68 | 61 | 61 | 0 | 7 | 0 |
| `how-meaning-moves` | list | 23 | 30 | 17 | 2 | 4 | 13 |
| `how-serious-systems-learn` | list | 38 | 38 | 37 | 1 | 0 | 1 |
| `how-trust-forms` | list | 15 | 15 | 15 | 0 | 0 | 0 |
| `living-in-sediment` | list | 72 | 72 | 72 | 0 | 0 | 0 |
| `the-discipline-of-uncertainty` | list | 10 | 10 | 10 | 0 | 0 | 0 |
| `the-economy-we-dont-experience` | pandoc_div | 27 | 16 | 8 | 19 | 0 | 8 |
| `trust-beyond-similarity` | list | 42 | 42 | 42 | 0 | 0 | 0 |
| `what-we-cannot-see` | list | 21 | 18 | 18 | 0 | 3 | 0 |
| `when-accountability-no-longer-expires` | list | 12 | 12 | 12 | 0 | 0 | 0 |
| `when-authority-is-misread` | list | 51 | 5 | 4 | 44 | 3 | 1 |
| `when-authority-outlives-accountability` | list | 30 | 30 | 30 | 0 | 0 | 0 |
| `when-incentives-become-the-moral-language` | plain_chicago | 51 | 5 | 5 | 42 | 4 | 0 |
| `when-interpretation-no-longer-matters` | list | 54 | 50 | 50 | 0 | 4 | 0 |
| `when-moral-seriousness-scales` | list | 22 | 22 | 22 | 0 | 0 | 0 |
| `when-others-become-leaders` | list | 53 | 0 | 0 | 51 | 2 | 0 |
| `when-others-look-to-you-v1` | list | 26 | 10 | 10 | 0 | 16 | 0 |
| `when-others-look-to-you-v2` | list | 17 | 17 | 17 | 0 | 0 | 0 |
| `when-trust-stops-tracking-reality` | list | 23 | 23 | 23 | 0 | 0 | 0 |
| `why-collaboration-is-so-hard` | list | 9 | 4 | 4 | 0 | 5 | 0 |

## Out of audit scope

These book ids appear in source `relatedBooks` but have **no** manuscript bibliography — no removals recommended from this audit.

- `learning-to-see` — 12 linked source(s)

## `after-certainty`

- Bibliography: `books/after-certainty/back-matter/bibliography.md`
- Parse style: `list` (27 entries)
- Semantic linked sources: 19
- Parse warning: other styles also matched: plain_chicago=12

### Matched (19)

- `boss-pauline-ambiguous-loss-learning-to-live-with-unresolved-grief` ← biblio `boss-pauline-ambiguous-loss-learning-to-live-with-unresolved-grief` (exact_slug, score=100)
- `butler-judith-frames-of-war-when-is-life-grievable` ← biblio `butler-judith-frames-of-war-when-is-life-grievable` (exact_slug, score=100)
- `dewey-john-ethics` ← biblio `dewey-john-ethics` (exact_slug, score=100)
- `dewey-john-experience-and-nature` ← biblio `dewey-john-experience-and-nature` (exact_slug, score=100)
- `dewey-john-the-quest-for-certainty-a-study-of-the-relation-of` ← biblio `dewey-john-the-quest-for-certainty-a-study-of-the-relation-of` (exact_slug, score=100)
- `kahan-dan-m-cultural-cognition-and-public-policy` ← biblio `kahan-dan-m-cultural-cognition-and-public-policy` (exact_slug, score=100)
- `luhmann-niklas-social-systems` ← biblio `luhmann-niklas-social-systems` (exact_slug, score=100)
- `merleau-ponty-maurice-phenomenology-of-perception` ← biblio `merleau-ponty-maurice-phenomenology-of-perception` (exact_slug, score=100)
- `minow-martha-between-vengeance-and-forgiveness-facing-history-after` ← biblio `minow-martha-between-vengeance-and-forgiveness-facing-history-after` (exact_slug, score=100)
- `putnam-hilary-reason-truth-and-history` ← biblio `putnam-hilary-reason-truth-and-history` (exact_slug, score=100)
- `shklar-judith-n-putting-cruelty-first` ← biblio `shklar-judith-n-putting-cruelty-first` (exact_slug, score=100)
- `simon-herbert-a-a-behavioral-model-of-rational-choice` ← biblio `simon-herbert-a-a-behavioral-model-of-rational-choice` (exact_slug, score=100)
- `taylor-charles-sources-of-the-self-the-making-of-the-modern-identity` ← biblio `taylor-charles-sources-of-the-self-the-making-of-the-modern-identity` (exact_slug, score=100)
- `thompson-dennis-f-moral-responsibility-of-public-officials-the` ← biblio `thompson-dennis-f-moral-responsibility-of-public-officials-the` (exact_slug, score=100)
- `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of` ← biblio `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of` (exact_slug, score=100)
- `walzer-michael-just-and-unjust-wars-a-moral-argument-with-historical` ← biblio `walzer-michael-just-and-unjust-wars-a-moral-argument-with-historical` (exact_slug, score=100)
- `ross-lee-and-richard-nisbett-the-person-and-the-situation` ← biblio `ross-lee-and-richard-e-nisbett-the-person-and-the-situation` (title_author, score=85)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the` (title_author, score=85)
- `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` ← biblio `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (8)

- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` matches biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` (exact_slug; current books: when-accountability-no-longer-expires, when-authority-outlives-accountability, when-moral-seriousness-scales, when-others-look-to-you-v1)
- `arendt-hannah-responsibility-and-judgment` matches biblio `arendt-hannah-responsibility-and-judgment` (exact_slug; current books: how-serious-systems-learn, the-discipline-of-uncertainty, when-authority-outlives-accountability, when-moral-seriousness-scales)
- `bauman-zygmunt-modernity-and-the-holocaust` matches biblio `bauman-zygmunt-modernity-and-the-holocaust` (exact_slug; current books: when-accountability-no-longer-expires, when-authority-outlives-accountability)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` matches biblio `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` (exact_slug; current books: how-meaning-moves, how-trust-forms, when-trust-stops-tracking-reality)
- `goffman-erving-the-presentation-of-self-in-everyday-life` matches biblio `goffman-erving-the-presentation-of-self-in-everyday-life` (exact_slug; current books: how-trust-forms)
- `macintyre-alasdair-after-virtue-a-study-in-moral-theory` matches biblio `macintyre-alasdair-after-virtue-a-study-in-moral-theory` (exact_slug; current books: how-trust-forms, learning-to-see)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` matches biblio `perrow-charles-normal-accidents-living-with-high-risk-technologies` (exact_slug; current books: how-meaning-moves, how-serious-systems-learn, when-moral-seriousness-scales, when-others-look-to-you-v2)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` matches biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug; current books: how-trust-forms, living-in-sediment, when-accountability-no-longer-expires, when-authority-outlives-accountability, when-interpretation-no-longer-matters, when-moral-seriousness-scales, when-others-look-to-you-v1, when-others-look-to-you-v2, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (2)

- `judith-n-shklar` (Judith N Shklar)
- `ross-lee-and-richard-e-nisbett` (Ross, Lee, and Richard E. Nisbett)

### Orphan creatorSlugs on linked sources (0)

_None._

## `before-certainty-arrives`

- Bibliography: `books/before-certainty-arrives/back-matter/bibliography.md`
- Parse style: `list` (42 entries)
- Semantic linked sources: 6
- Parse warning: other styles also matched: plain_chicago=25

### Matched (6)

- `boehm-christopher-hierarchy-in-the-forest-the-evolution-of` ← biblio `boehm-christopher-hierarchy-in-the-forest-the-evolution-of` (exact_slug, score=100)
- `braudel-fernand-on-history` ← biblio `braudel-fernand-on-history` (exact_slug, score=100)
- `douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution` ← biblio `douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution` (exact_slug, score=100)
- `jaspers-karl-the-origin-and-goal-of-history` ← biblio `jaspers-karl-the-origin-and-goal-of-history` (exact_slug, score=100)
- `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human-evolution` ← biblio `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human` (title_author, score=85)
- `polanyi-karl-the-great-transformation-the-political-and-economic-origins-of-our` ← biblio `polanyi-karl-the-great-transformation-the-political-and-economic` (title_author, score=85)

### Missing in semantic (31)

- Rainer Albertz — *Israel in Exile: The History and Literature of the* (`albertz-rainer-israel-in-exile-the-history-and-literature-of-the`)
- Ian R Bartky — *The Adoption of Standard Time* (`bartky-ian-r-the-adoption-of-standard-time`)
- Mordechai Cogan — *The Raging Torrent: Historical Inscriptions from* (`cogan-mordechai-the-raging-torrent-historical-inscriptions-from`)
- H. C Darby — *Domesday England* (`darby-h-c-domesday-england`)
- Eisenstadt, Shmuel N., ed — *The Origins and Diversity of Axial Age* (`eisenstadt-shmuel-n-ed-the-origins-and-diversity-of-axial-age`)
- Elizabeth L Eisenstein — *The Printing Press as an Agent of Change* (`eisenstein-elizabeth-l-the-printing-press-as-an-agent-of-change`)
- Robert Eno — *The Mandate of Heaven and the Origins of History in* (`eno-robert-the-mandate-of-heaven-and-the-origins-of-history-in`)
- Lewis Hanke — *All Mankind Is One: A Study of the Disputation between* (`hanke-lewis-all-mankind-is-one-a-study-of-the-disputation-between`)
- John Hatcher — *Plague, Population and the English Economy, 1348-1530* (`hatcher-john-plague-population-and-the-english-economy-1348-1530`)
- Ian Hodder — *The Leopard's Tale: Revealing the Mysteries of* (`hodder-ian-the-leopard-s-tale-revealing-the-mysteries-of`)
- Ian Hodder — *Where Are We Heading? The Evolution of Humans and Things* (`hodder-ian-where-are-we-heading-the-evolution-of-humans-and-things`)
- David N Keightley — *Sources of Shang History: The Oracle-Bone* (`keightley-david-n-sources-of-shang-history-the-oracle-bone`)
- Austen Henry Layard — *Discoveries in the Ruins of Nineveh and Babylon* (`layard-austen-henry-discoveries-in-the-ruins-of-nineveh-and-babylon`)
- Jon D Levenson — *Sinai and Zion: An Entry into the Jewish Bible* (`levenson-jon-d-sinai-and-zion-an-entry-into-the-jewish-bible`)
- Mark Edward Lewis — *Sanctioned Violence in Early China* (`lewis-mark-edward-sanctioned-violence-in-early-china`)
- Nissen, Hans J., Peter Damerow, and Robert K. Englund — *Archaic* (`nissen-hans-j-peter-damerow-and-robert-k-englund-archaic`)
- A. Leo Oppenheim — *Ancient Mesopotamia: Portrait of a Dead* (`oppenheim-a-leo-ancient-mesopotamia-portrait-of-a-dead`)
- Anthony Pagden — *The Fall of Natural Man: The American Indian and the* (`pagden-anthony-the-fall-of-natural-man-the-american-indian-and-the`)
- D. T Potts — *Mesopotamian Civilization: The Material Foundations* (`potts-d-t-mesopotamian-civilization-the-material-foundations`)
- Michael J Puett — *To Become a God: Cosmology, Sacrifice, and* (`puett-michael-j-to-become-a-god-cosmology-sacrifice-and`)
- Richard Salomon — *Indian Epigraphy: A Guide to the Study of Inscriptions* (`salomon-richard-indian-epigraphy-a-guide-to-the-study-of-inscriptions`)
- Wolfgang Schivelbusch — *The Railway Journey: The Industrialization of* (`schivelbusch-wolfgang-the-railway-journey-the-industrialization-of`)
- 1810 *Statutes of the Realm*. Vol. 1. London: Record Commission — *(no title)* (`statutes-of-the-realm-vol-1-london-record-commission-1810`)
- Hew Strachan — *The First World War* (`strachan-hew-the-first-world-war`)
- Romila Thapar — *Asoka and the Decline of the Mauryas* (`thapar-romila-asoka-and-the-decline-of-the-mauryas`)
- Emanuel Tov — *Textual Criticism of the Hebrew Bible* (`tov-emanuel-textual-criticism-of-the-hebrew-bible`)
- Eugene Ulrich — *The Dead Sea Scrolls and the Developmental Composition* (`ulrich-eugene-the-dead-sea-scrolls-and-the-developmental-composition`)
- David Ussishkin — *The Renewed Archaeological Excavations at Lachish* (`ussishkin-david-the-renewed-archaeological-excavations-at-lachish`)
- U.S. House of Representatives — *A Failure of Initiative: Final Report of* (`u-s-house-of-representatives-a-failure-of-initiative-final-report-of`)
- U.S. White House — *The Federal Response to Hurricane Katrina: Lessons* (`u-s-white-house-the-federal-response-to-hurricane-katrina-lessons`)
- James C VanderKam — *The Dead Sea Scrolls Today* (`vanderkam-james-c-the-dead-sea-scrolls-today`)

### Exists but missing relatedBooks (5)

- `arendt-hannah-responsibility-and-judgment` matches biblio `arendt-hannah-responsibility-and-judgment` (exact_slug; current books: how-serious-systems-learn, the-discipline-of-uncertainty, when-authority-outlives-accountability, when-moral-seriousness-scales)
- `carr-e-h-what-is-history` matches biblio `carr-e-h-what-is-history` (exact_slug; current books: living-in-sediment)
- `illich-ivan-tools-for-conviviality` matches biblio `illich-ivan-tools-for-conviviality` (exact_slug; current books: living-in-sediment)
- `kuhn-thomas-s-the-structure-of-scientific-revolutions` matches biblio `kuhn-thomas-s-the-structure-of-scientific-revolutions` (exact_slug; current books: learning-to-see, trust-beyond-similarity)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` matches biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug; current books: how-trust-forms, living-in-sediment, when-accountability-no-longer-expires, when-authority-outlives-accountability, when-interpretation-no-longer-matters, when-moral-seriousness-scales, when-others-look-to-you-v1, when-others-look-to-you-v2, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (30)

- `1810-statutes-of-the-realm-vol-1-london-record-commission` (1810 *Statutes of the Realm*. Vol. 1. London: Record Commission)
- `a-leo-oppenheim` (A. Leo Oppenheim)
- `anthony-pagden` (Anthony Pagden)
- `austen-henry-layard` (Austen Henry Layard)
- `d-t-potts` (D. T Potts)
- `david-n-keightley` (David N Keightley)
- `david-ussishkin` (David Ussishkin)
- `eisenstadt-shmuel-n-ed` (Eisenstadt, Shmuel N., ed)
- `elizabeth-l-eisenstein` (Elizabeth L Eisenstein)
- `emanuel-tov` (Emanuel Tov)
- `eugene-ulrich` (Eugene Ulrich)
- `h-c-darby` (H. C Darby)
- `hew-strachan` (Hew Strachan)
- `ian-hodder` (Ian Hodder)
- `ian-r-bartky` (Ian R Bartky)
- `james-c-vanderkam` (James C VanderKam)
- `john-hatcher` (John Hatcher)
- `jon-d-levenson` (Jon D Levenson)
- `lewis-hanke` (Lewis Hanke)
- `mark-edward-lewis` (Mark Edward Lewis)
- `michael-j-puett` (Michael J Puett)
- `mordechai-cogan` (Mordechai Cogan)
- `nissen-hans-j-peter-damerow-and-robert-k-englund` (Nissen, Hans J., Peter Damerow, and Robert K. Englund)
- `rainer-albertz` (Rainer Albertz)
- `richard-salomon` (Richard Salomon)
- `robert-eno` (Robert Eno)
- `romila-thapar` (Romila Thapar)
- `u-s-house-of-representatives` (U.S. House of Representatives)
- `u-s-white-house` (U.S. White House)
- `wolfgang-schivelbusch` (Wolfgang Schivelbusch)

### Orphan creatorSlugs on linked sources (0)

_None._

## `coupling`

- Bibliography: `books/coupling/back-matter/bibliography.md`
- Parse style: `list` (68 entries)
- Semantic linked sources: 61
- Parse warning: other styles also matched: plain_chicago=23

### Matched (61)

- `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` ← biblio `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` (exact_slug, score=100)
- `amershi-saleema-et-al-guidelines-for-human-ai-interaction` ← biblio `amershi-saleema-et-al-guidelines-for-human-ai-interaction` (exact_slug, score=100)
- `anderson-c-w-rebuilding-the-news-metropolitan-journalism-in-the-digital-age` ← biblio `anderson-c-w-rebuilding-the-news-metropolitan-journalism-in-the-digital-age` (exact_slug, score=100)
- `andrews-matthew-lant-pritchett-and-michael-woolcock-escaping-capability-traps-through-problem-dr` ← biblio `andrews-matthew-lant-pritchett-and-michael-woolcock-escaping-capability-traps-through-problem-dr` (exact_slug, score=100)
- `barke-helena-and-lutz-prechelt-role-clarity-deficiencies-can-wreck-agile-teams` ← biblio `barke-helena-and-lutz-prechelt-role-clarity-deficiencies-can-wreck-agile-teams` (exact_slug, score=100)
- `bebchuk-lucian-a-and-scott-hirst-index-funds-and-the-future-of-corporate-governance-theory-evide` ← biblio `bebchuk-lucian-a-and-scott-hirst-index-funds-and-the-future-of-corporate-governance-theory-evide` (exact_slug, score=100)
- `beck-kent-mike-beedle-arie-van-bennekum-alistair-cockburn-ward-cunningham-martin-fowler-james-gr` ← biblio `beck-kent-mike-beedle-arie-van-bennekum-alistair-cockburn-ward-cunningham-martin-fowler-james-gr` (exact_slug, score=100)
- `beer-stafford-brain-of-the-firm` ← biblio `beer-stafford-brain-of-the-firm` (exact_slug, score=100)
- `bender-emily-m-timnit-gebru-angelina-mcmillan-major-and-shmargaret-shmitchell-on-the-dangers-of` ← biblio `bender-emily-m-timnit-gebru-angelina-mcmillan-major-and-shmargaret-shmitchell-on-the-dangers-of` (exact_slug, score=100)
- `berle-adolf-a-jr-and-gardiner-c-means-the-modern-corporation-and-private-property` ← biblio `berle-adolf-a-jr-and-gardiner-c-means-the-modern-corporation-and-private-property` (exact_slug, score=100)
- `berwick-donald-m-developing-and-testing-changes-in-delivery-of-care` ← biblio `berwick-donald-m-developing-and-testing-changes-in-delivery-of-care` (exact_slug, score=100)
- `berwick-donald-m-era-3-for-medicine-and-health-care` ← biblio `berwick-donald-m-era-3-for-medicine-and-health-care` (exact_slug, score=100)
- `berwick-donald-m-measuring-surgical-outcomes-for-improvement-was-codman-wrong` ← biblio `berwick-donald-m-measuring-surgical-outcomes-for-improvement-was-codman-wrong` (exact_slug, score=100)
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds-site-reliability-engineerin` ← biblio `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds-site-reliability-engineerin` (exact_slug, score=100)
- `boehm-barry-w-software-engineering-economics` ← biblio `boehm-barry-w-software-engineering-economics` (exact_slug, score=100)
- `bogle-john-c-the-clash-of-the-cultures-investment-vs-speculation` ← biblio `bogle-john-c-the-clash-of-the-cultures-investment-vs-speculation` (exact_slug, score=100)
- `brooks-frederick-p-jr-the-mythical-man-month-essays-on-software-engineering` ← biblio `brooks-frederick-p-jr-the-mythical-man-month-essays-on-software-engineering` (exact_slug, score=100)
- `cockburn-alistair-agile-software-development` ← biblio `cockburn-alistair-agile-software-development` (exact_slug, score=100)
- `cockburn-alistair-hexagonal-architecture-ports-and-adapters` ← biblio `cockburn-alistair-hexagonal-architecture-ports-and-adapters` (exact_slug, score=100)
- `cockburn-alistair-the-heart-of-agile` ← biblio `cockburn-alistair-the-heart-of-agile` (exact_slug, score=100)
- `dekker-sidney-drift-into-failure-from-hunting-broken-components-to-understanding-complex-systems` ← biblio `dekker-sidney-drift-into-failure-from-hunting-broken-components-to-understanding-complex-systems` (exact_slug, score=100)
- `deming-w-edwards-out-of-the-crisis` ← biblio `deming-w-edwards-out-of-the-crisis` (exact_slug, score=100)
- `dikert-karina-maria-paasivaara-and-casper-lassenius-challenges-and-success-factors-for-large-sca` ← biblio `dikert-karina-maria-paasivaara-and-casper-lassenius-challenges-and-success-factors-for-large-sca` (exact_slug, score=100)
- `evans-eric-domain-driven-design-tackling-complexity-in-the-heart-of-software` ← biblio `evans-eric-domain-driven-design-tackling-complexity-in-the-heart-of-software` (exact_slug, score=100)
- `ford-neal-rebecca-parsons-and-patrick-kua-building-evolutionary-architectures-support-constant-c` ← biblio `ford-neal-rebecca-parsons-and-patrick-kua-building-evolutionary-architectures-support-constant-c` (exact_slug, score=100)
- `forsgren-nicole-jez-humble-and-gene-kim-accelerate-the-science-of-lean-software-and-devops-build` ← biblio `forsgren-nicole-jez-humble-and-gene-kim-accelerate-the-science-of-lean-software-and-devops-build` (exact_slug, score=100)
- `fowler-martin-integration-metadata` ← biblio `fowler-martin-integration-metadata` (exact_slug, score=100)
- `fowler-martin-refactoring-improving-the-design-of-existing-code` ← biblio `fowler-martin-refactoring-improving-the-design-of-existing-code` (exact_slug, score=100)
- `gebru-timnit-jamie-morgenstern-briana-vecchione-jennifer-wortman-vaughan-hanna-wallach-hal-daum` ← biblio `gebru-timnit-jamie-morgenstern-briana-vecchione-jennifer-wortman-vaughan-hanna-wallach-hal-daum` (exact_slug, score=100)
- `hayek-friedrich-a-the-use-of-knowledge-in-society` ← biblio `hayek-friedrich-a-the-use-of-knowledge-in-society` (exact_slug, score=100)
- `hendrycks-dan-collin-burns-anya-chen-and-spencer-ball-holistic-evaluation-of-language-models` ← biblio `hendrycks-dan-collin-burns-anya-chen-and-spencer-ball-holistic-evaluation-of-language-models` (exact_slug, score=100)
- `hood-christopher-and-ruth-dixon-a-government-that-worked-better-and-cost-less` ← biblio `hood-christopher-and-ruth-dixon-a-government-that-worked-better-and-cost-less` (exact_slug, score=100)
- `humble-jez-and-david-farley-continuous-delivery-reliable-software-releases-through-build-test-an` ← biblio `humble-jez-and-david-farley-continuous-delivery-reliable-software-releases-through-build-test-an` (exact_slug, score=100)
- `international-organization-for-standardization-iso-iec-42001-2023-information-technology-artific` ← biblio `international-organization-for-standardization-iso-iec-42001-2023-information-technology-artific` (exact_slug, score=100)
- `jensen-michael-c-and-william-h-meckling-theory-of-the-firm-managerial-behavior-agency-costs-and` ← biblio `jensen-michael-c-and-william-h-meckling-theory-of-the-firm-managerial-behavior-agency-costs-and` (exact_slug, score=100)
- `khurana-rakesh-from-higher-aims-to-hired-hands-the-social-transformation-of-american-business-sc` ← biblio `khurana-rakesh-from-higher-aims-to-hired-hands-the-social-transformation-of-american-business-sc` (exact_slug, score=100)
- `kim-gene-jez-humble-patrick-debois-and-john-willis-the-devops-handbook-how-to-create-world-class` ← biblio `kim-gene-jez-humble-patrick-debois-and-john-willis-the-devops-handbook-how-to-create-world-class` (exact_slug, score=100)
- `kim-gene-kevin-behr-and-george-spafford-the-phoenix-project-a-novel-about-it-devops-and-helping` ← biblio `kim-gene-kevin-behr-and-george-spafford-the-phoenix-project-a-novel-about-it-devops-and-helping` (exact_slug, score=100)
- `lewis-catherine-c-rebecca-r-perry-and-akihiko-murata-how-should-research-contribute-to-instructi` ← biblio `lewis-catherine-c-rebecca-r-perry-and-akihiko-murata-how-should-research-contribute-to-instructi` (exact_slug, score=100)
- `lipsky-michael-street-level-bureaucracy-dilemmas-of-the-individual-in-public-services` ← biblio `lipsky-michael-street-level-bureaucracy-dilemmas-of-the-individual-in-public-services` (exact_slug, score=100)
- `madison-james-alexander-hamilton-and-john-jay-the-federalist-papers` ← biblio `madison-james-alexander-hamilton-and-john-jay-the-federalist-papers` (exact_slug, score=100)
- `martin-robert-c-clean-architecture-a-craftsman-s-guide-to-software-structure-and-the-design-of-p` ← biblio `martin-robert-c-clean-architecture-a-craftsman-s-guide-to-software-structure-and-the-design-of-p` (exact_slug, score=100)
- `mccombs-maxwell-e-and-donald-l-shaw-the-agenda-setting-function-of-mass-media` ← biblio `mccombs-maxwell-e-and-donald-l-shaw-the-agenda-setting-function-of-mass-media` (exact_slug, score=100)
- `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-sp` ← biblio `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-sp` (exact_slug, score=100)
- `national-aeronautics-and-space-administration-aviation-safety-reporting-system-asrs-program-mate` ← biblio `national-aeronautics-and-space-administration-aviation-safety-reporting-system-asrs-program-mate` (exact_slug, score=100)
- `national-institute-of-standards-and-technology-artificial-intelligence-risk-management-framework` ← biblio `national-institute-of-standards-and-technology-artificial-intelligence-risk-management-framework` (exact_slug, score=100)
- `national-institute-of-standards-and-technology-secure-software-development-framework-ssdf-versio` ← biblio `national-institute-of-standards-and-technology-secure-software-development-framework-ssdf-versio` (exact_slug, score=100)
- `nygard-michael-t-release-it-design-and-deploy-production-ready-software` ← biblio `nygard-michael-t-release-it-design-and-deploy-production-ready-software` (exact_slug, score=100)
- `owasp-foundation-owasp-top-10-for-large-language-model-applications` ← biblio `owasp-foundation-owasp-top-10-for-large-language-model-applications` (exact_slug, score=100)
- `pariser-eli-the-filter-bubble-what-the-internet-is-hiding-from-you` ← biblio `pariser-eli-the-filter-bubble-what-the-internet-is-hiding-from-you` (exact_slug, score=100)
- `peng-sida-et-al-the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot` ← biblio `peng-sida-et-al-the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot` (exact_slug, score=100)
- `perry-neil-megha-srivastava-deepak-kumar-and-dan-boneh-do-users-write-more-insecure-code-with-ai` ← biblio `perry-neil-megha-srivastava-deepak-kumar-and-dan-boneh-do-users-write-more-insecure-code-with-ai` (exact_slug, score=100)
- `pollitt-christopher-and-geert-bouckaert-public-management-reform-a-comparative-analysis` ← biblio `pollitt-christopher-and-geert-bouckaert-public-management-reform-a-comparative-analysis` (exact_slug, score=100)
- `royce-winston-w-managing-the-development-of-large-software-systems` ← biblio `royce-winston-w-managing-the-development-of-large-software-systems` (exact_slug, score=100)
- `simon-herbert-a-administrative-behavior-a-study-of-decision-making-processes-in-administrative-o` ← biblio `simon-herbert-a-administrative-behavior-a-study-of-decision-making-processes-in-administrative-o` (exact_slug, score=100)
- `skelton-matthew-and-manuel-pais-team-topologies-organizing-business-and-technology-teams-for-fas` ← biblio `skelton-matthew-and-manuel-pais-team-topologies-organizing-business-and-technology-teams-for-fas` (exact_slug, score=100)
- `tufekci-zeynep-twitter-and-tear-gas-the-power-and-fragility-of-networked-protest` ← biblio `tufekci-zeynep-twitter-and-tear-gas-the-power-and-fragility-of-networked-protest` (exact_slug, score=100)
- `u-s-department-of-defense-dod-std-2167a-defense-system-software-development` ← biblio `u-s-department-of-defense-dod-std-2167a-defense-system-software-development` (exact_slug, score=100)
- `vernon-vaughn-implementing-domain-driven-design` ← biblio `vernon-vaughn-implementing-domain-driven-design` (exact_slug, score=100)
- `wiener-norbert-cybernetics-or-control-and-communication-in-the-animal-and-the-machine` ← biblio `wiener-norbert-cybernetics-or-control-and-communication-in-the-animal-and-the-machine` (exact_slug, score=100)
- `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future-at-the-new-front` ← biblio `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future-at-the-new-front` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (7)

- `arendt-hannah-responsibility-and-judgment` matches biblio `arendt-hannah-responsibility-and-judgment` (exact_slug; current books: how-serious-systems-learn, the-discipline-of-uncertainty, when-authority-outlives-accountability, when-moral-seriousness-scales)
- `campbell-donald-t-assessing-the-impact-of-planned-social-change` matches biblio `campbell-donald-t-assessing-the-impact-of-planned-social-change` (exact_slug; current books: when-authority-outlives-accountability)
- `gawande-atul-the-checklist-manifesto-how-to-get-things-right` matches biblio `gawande-atul-the-checklist-manifesto-how-to-get-things-right` (exact_slug; current books: how-serious-systems-learn)
- `meadows-donella-h-thinking-in-systems-a-primer` matches biblio `meadows-donella-h-thinking-in-systems-a-primer` (exact_slug; current books: how-serious-systems-learn, living-in-sediment)
- `merton-robert-k-bureaucratic-structure-and-personality` matches biblio `merton-robert-k-bureaucratic-structure-and-personality` (exact_slug; current books: when-moral-seriousness-scales)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` matches biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug; current books: how-trust-forms, living-in-sediment, trust-beyond-similarity, when-trust-stops-tracking-reality)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` matches biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug; current books: after-certainty, how-serious-systems-learn, how-trust-forms, living-in-sediment, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (28)

- `allspaw-john-and-paul-hammond` (Allspaw, John, and Paul Hammond)
- `amershi-saleema-et-al` (Amershi, Saleema, et al)
- `andrews-matthew-lant-pritchett-and-michael-woolcock` (Andrews, Matthew, Lant Pritchett, and Michael Woolcock)
- `barke-helena-and-lutz-prechelt` (Barke, Helena, and Lutz Prechelt)
- `bebchuk-lucian-a-and-scott-hirst` (Bebchuk, Lucian A., and Scott Hirst)
- `beck-kent-mike-beedle-arie-van-bennekum-alistair-cockburn-ward-cunningham-martin-fowler-james-grenning-jim-highsmith-andrew-hunt-ron-jeffries-jon-kern-brian-marick-robert-c-martin-steve-mellor-ken-schwaber-jeff-sutherland-and-dave-thomas` (Beck, Kent, Mike Beedle, Arie van Bennekum, Alistair Cockburn, Ward Cunningham, Martin Fowler, James Grenning, Jim Highsmith, Andrew Hunt, Ron Jeffries, Jon Kern, Brian Marick, Robert C. Martin, Steve Mellor, Ken Schwaber, Jeff Sutherland, and Dave Thomas)
- `bender-emily-m-timnit-gebru-angelina-mcmillan-major-and-shmargaret-shmitchell` (Bender, Emily M., Timnit Gebru, Angelina McMillan-Major, and Shmargaret Shmitchell)
- `berle-adolf-a-jr-and-gardiner-c-means` (Berle, Adolf A., Jr., and Gardiner C. Means)
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds` (Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy, eds)
- `dikert-karina-maria-paasivaara-and-casper-lassenius` (Dikert, Karina, Maria Paasivaara, and Casper Lassenius)
- `ford-neal-rebecca-parsons-and-patrick-kua` (Ford, Neal, Rebecca Parsons, and Patrick Kua)
- `forsgren-nicole-jez-humble-and-gene-kim` (Forsgren, Nicole, Jez Humble, and Gene Kim)
- `gebru-timnit-jamie-morgenstern-briana-vecchione-jennifer-wortman-vaughan-hanna-wallach-hal-daum-iii-and-kate-crawford` (Gebru, Timnit, Jamie Morgenstern, Briana Vecchione, Jennifer Wortman Vaughan, Hanna Wallach, Hal Daumé III, and Kate Crawford)
- `hendrycks-dan-collin-burns-anya-chen-and-spencer-ball` (Hendrycks, Dan, Collin Burns, Anya Chen, and Spencer Ball)
- `hood-christopher-and-ruth-dixon` (Hood, Christopher, and Ruth Dixon)
- `humble-jez-and-david-farley` (Humble, Jez, and David Farley)
- `jensen-michael-c-and-william-h-meckling` (Jensen, Michael C., and William H. Meckling)
- `kim-gene-jez-humble-patrick-debois-and-john-willis` (Kim, Gene, Jez Humble, Patrick Debois, and John Willis)
- `kim-gene-kevin-behr-and-george-spafford` (Kim, Gene, Kevin Behr, and George Spafford)
- `lewis-catherine-c-rebecca-r-perry-and-akihiko-murata` (Lewis, Catherine C., Rebecca R. Perry, and Akihiko Murata)
- `mccombs-maxwell-e-and-donald-l-shaw` (McCombs, Maxwell E., and Donald L. Shaw)
- `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-spitzer-inioluwa-deborah-raji-and-timnit-gebru` (Mitchell, Margaret, Simone Wu, Andrew Zaldivar, Parker Barnes, Lucy Vasserman, Ben Hutchinson, Elena Spitzer, Inioluwa Deborah Raji, and Timnit Gebru)
- `national-aeronautics-and-space-administration` (National Aeronautics and Space Administration)
- `peng-sida-et-al` (Peng, Sida, et al)
- `perry-neil-megha-srivastava-deepak-kumar-and-dan-boneh` (Perry, Neil, Megha Srivastava, Deepak Kumar, and Dan Boneh)
- `pollitt-christopher-and-geert-bouckaert` (Pollitt, Christopher, and Geert Bouckaert)
- `skelton-matthew-and-manuel-pais` (Skelton, Matthew, and Manuel Pais)
- `u-s-department-of-defense-dod-std-2167a` (U.S. Department of Defense. DOD-STD-2167A)

### Orphan creatorSlugs on linked sources (0)

_None._

## `how-meaning-moves`

- Bibliography: `books/how-meaning-moves/back-matter/bibliography.md`
- Parse style: `list` (23 entries)
- Semantic linked sources: 30
- Parse warning: other styles also matched: plain_chicago=8

### Matched (17)

- `barrett-lisa-feldman-how-emotions-are-made-the-secret-life-of-the-brain` ← biblio `barrett-lisa-feldman-how-emotions-are-made-the-secret-life-of-the-brain` (exact_slug, score=100)
- `bowlby-john-attachment-and-loss` ← biblio `bowlby-john-attachment-and-loss` (exact_slug, score=100)
- `clark-herbert-h-using-language` ← biblio `clark-herbert-h-using-language` (exact_slug, score=100)
- `deutsch-morton-the-resolution-of-conflict` ← biblio `deutsch-morton-the-resolution-of-conflict` (exact_slug, score=100)
- `french-john-r-p-and-bertram-raven-the-bases-of-social-power` ← biblio `french-john-r-p-and-bertram-raven-the-bases-of-social-power` (exact_slug, score=100)
- `goffman-erving-interaction-ritual` ← biblio `goffman-erving-interaction-ritual` (exact_slug, score=100)
- `kahan-dan-m-motivated-reasoning` ← biblio `kahan-dan-m-motivated-reasoning` (exact_slug, score=100)
- `kruglanski-arie-w-the-need-for-cognitive-closure` ← biblio `kruglanski-arie-w-the-need-for-cognitive-closure` (exact_slug, score=100)
- `lazarus-richard-s-emotion-and-adaptation` ← biblio `lazarus-richard-s-emotion-and-adaptation` (exact_slug, score=100)
- `ledoux-joseph-the-emotional-brain` ← biblio `ledoux-joseph-the-emotional-brain` (exact_slug, score=100)
- `minuchin-salvador-families-and-family-therapy` ← biblio `minuchin-salvador-families-and-family-therapy` (exact_slug, score=100)
- `nickerson-raymond-s-confirmation-bias` ← biblio `nickerson-raymond-s-confirmation-bias` (exact_slug, score=100)
- `steele-claude-m-whistling-vivaldi` ← biblio `steele-claude-m-whistling-vivaldi` (exact_slug, score=100)
- `tajfel-henri-and-john-c-turner-the-social-identity-theory-of-intergroup-behavior` ← biblio `tajfel-henri-and-john-c-turner-the-social-identity-theory-of-intergroup-behavior` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization` (title_author, score=85)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` ← biblio `fricker-miranda-epistemic-injustice` (title_author, score=85)
- `ross-lee-and-andrew-ward-naive-realism-in-everyday-life` ← biblio `ross-lee-and-andrew-ward-naive-realism-in-everyday-life-implications-for-social-conflict-and-mis` (title_author, score=85)

### Missing in semantic (2)

- Elizabeth W Morrison — *Employee Voice Behavior: Integration and Directions for Future Research* (`morrison-elizabeth-w-employee-voice-behavior-integration-and-directions-for-future-research`)
- Tom Standage — *The Victorian Internet* (`standage-tom-the-victorian-internet`)

### Exists but missing relatedBooks (4)

- `arendt-hannah-responsibility-and-judgment` matches biblio `arendt-hannah-responsibility-and-judgment` (exact_slug; current books: how-serious-systems-learn, the-discipline-of-uncertainty, when-authority-outlives-accountability, when-moral-seriousness-scales)
- `march-james-g-and-herbert-a-simon-organizations` matches biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug; current books: living-in-sediment, when-moral-seriousness-scales)
- `ross-lee-the-intuitive-psychologist-and-his-shortcomings` matches biblio `ross-lee-the-intuitive-psychologist-and-his-shortcomings` (exact_slug; current books: when-authority-outlives-accountability)
- `weick-karl-e-sensemaking-in-organizations` matches biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug; current books: how-serious-systems-learn, trust-beyond-similarity, when-accountability-no-longer-expires, when-trust-stops-tracking-reality)

### Stale relatedBooks (13)

- `baumeister-roy-f-and-mark-r-leary-the-need-to-belong` — Mark R. Leary and Roy F. Baumeister — The Need to Belong.
- `easterbrook-j-a-the-effect-of-emotion-on-cue-utilization` — J. A Easterbrook — The Effect of Emotion on Cue Utilization.
- `faden-ruth-r-and-tom-l-beauchamp-a-history-and-theory-of-informed-consent` — Ruth R. Faden and Tom L. Beauchamp — A History and Theory of Informed Consent
- `gigerenzer-gerd-gut-feelings-the-intelligence-of-the-unconscious` — Gerd Gigerenzer — Gut Feelings: The Intelligence of the Unconscious
- `gottman-john-m-the-seven-principles-for-making-marriage-work` — John M Gottman — The Seven Principles for Making Marriage Work
- `kruglanski-arie-w-the-psychology-of-closed-mindedness` — Arie W Kruglanski — The Psychology of Closed-Mindedness
- `milgram-stanley-obedience-to-authority-an-experimental-view` — Stanley Milgram — Obedience to Authority: An Experimental View
- `morrison-elizabeth-w-employee-voice-behavior` — Elizabeth W Morrison — Employee Voice Behavior.
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` — Charles Perrow — Normal Accidents: Living with High-Risk Technologies
- `ross-lee-and-richard-nisbett-the-person-and-the-situation` — Lee Ross and Richard Nisbett — The Person and the Situation
- `suchman-mark-c-managing-legitimacy` — Mark C Suchman — Managing Legitimacy.
- `tversky-amos-and-daniel-kahneman-judgment-under-uncertainty` — Tversky, Amos, and Daniel Kahneman — Judgment under Uncertainty.
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` — Weick, Karl E., Kathleen M. Sutcliffe, and David Obstfeld — Organizing

### Thinkers stale for this book (12)

- `charles-perrow` — Charles Perrow
- `elizabeth-w-morrison` — Elizabeth W Morrison
- `gerd-gigerenzer` — Gerd Gigerenzer
- `j-a-easterbrook` — J. A Easterbrook
- `john-m-gottman` — John M Gottman
- `mark-c-suchman` — Mark C Suchman
- `mark-r-leary` — Mark R. Leary
- `richard-nisbett` — Richard Nisbett
- `roy-f-baumeister` — Roy F. Baumeister
- `ruth-r-faden` — Ruth R. Faden
- `stanley-milgram` — Stanley Milgram
- `tom-l-beauchamp` — Tom L. Beauchamp

### Biblio creators without thinker node (5)

- `french-john-r-p-and-bertram-raven` (French, John R. P., and Bertram Raven)
- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)
- `ross-lee-and-andrew-ward` (Ross, Lee, and Andrew Ward)
- `tajfel-henri-and-john-c-turner` (Tajfel, Henri, and John C. Turner)
- `tom-standage` (Tom Standage)

### Orphan creatorSlugs on linked sources (0)

_None._

## `how-serious-systems-learn`

- Bibliography: `books/how-serious-systems-learn/back-matter/bibliography.md`
- Parse style: `list` (38 entries)
- Semantic linked sources: 38
- Parse warning: other styles also matched: plain_chicago=26

### Matched (37)

- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `collins-jim-good-to-great-why-some-companies-make-the-leap-and` ← biblio `collins-jim-good-to-great-why-some-companies-make-the-leap-and` (exact_slug, score=100)
- `d-rner-dietrich-the-logic-of-failure-recognizing-and-avoiding-error` ← biblio `d-rner-dietrich-the-logic-of-failure-recognizing-and-avoiding-error` (exact_slug, score=100)
- `dekker-sidney-the-field-guide-to-understanding-human-error` ← biblio `dekker-sidney-the-field-guide-to-understanding-human-error` (exact_slug, score=100)
- `demarco-tom-and-timothy-r-lister-peopleware-productive-projects` ← biblio `demarco-tom-and-timothy-r-lister-peopleware-productive-projects` (exact_slug, score=100)
- `fahey-liam-and-robert-m-randall-eds-learning-from-the-future` ← biblio `fahey-liam-and-robert-m-randall-eds-learning-from-the-future` (exact_slug, score=100)
- `gawande-atul-the-checklist-manifesto-how-to-get-things-right` ← biblio `gawande-atul-the-checklist-manifesto-how-to-get-things-right` (exact_slug, score=100)
- `goldratt-eliyahu-m-and-jeff-cox-the-goal-a-process-of-ongoing` ← biblio `goldratt-eliyahu-m-and-jeff-cox-the-goal-a-process-of-ongoing` (exact_slug, score=100)
- `graeber-david-on-the-phenomenon-of-bullshit-jobs` ← biblio `graeber-david-on-the-phenomenon-of-bullshit-jobs` (exact_slug, score=100)
- `grove-andrew-s-high-output-management` ← biblio `grove-andrew-s-high-output-management` (exact_slug, score=100)
- `hollnagel-erik-safety-i-and-safety-ii-the-past-and-future-of-safety` ← biblio `hollnagel-erik-safety-i-and-safety-ii-the-past-and-future-of-safety` (exact_slug, score=100)
- `institute-of-medicine-to-err-is-human-building-a-safer-health` ← biblio `institute-of-medicine-to-err-is-human-building-a-safer-health` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
- `klein-gary-sources-of-power-how-people-make-decisions` ← biblio `klein-gary-sources-of-power-how-people-make-decisions` (exact_slug, score=100)
- `leveson-nancy-g-engineering-a-safer-world-systems-thinking-applied` ← biblio `leveson-nancy-g-engineering-a-safer-world-systems-thinking-applied` (exact_slug, score=100)
- `meadows-donella-h-thinking-in-systems-a-primer` ← biblio `meadows-donella-h-thinking-in-systems-a-primer` (exact_slug, score=100)
- `muller-jerry-z-the-tyranny-of-metrics` ← biblio `muller-jerry-z-the-tyranny-of-metrics` (exact_slug, score=100)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` ← biblio `perrow-charles-normal-accidents-living-with-high-risk-technologies` (exact_slug, score=100)
- `popper-karl-r-the-logic-of-scientific-discovery` ← biblio `popper-karl-r-the-logic-of-scientific-discovery` (exact_slug, score=100)
- `ries-eric-the-lean-startup-how-today-s-entrepreneurs-use-continuous` ← biblio `ries-eric-the-lean-startup-how-today-s-entrepreneurs-use-continuous` (exact_slug, score=100)
- `sch-n-donald-a-the-reflective-practitioner-how-professionals-think` ← biblio `sch-n-donald-a-the-reflective-practitioner-how-professionals-think` (exact_slug, score=100)
- `senge-peter-m-the-fifth-discipline-the-art-and-practice-of-the` ← biblio `senge-peter-m-the-fifth-discipline-the-art-and-practice-of-the` (exact_slug, score=100)
- `silver-nate-the-signal-and-the-noise-why-so-many-predictions` ← biblio `silver-nate-the-signal-and-the-noise-why-so-many-predictions` (exact_slug, score=100)
- `taleb-nassim-nicholas-antifragile-things-that-gain-from-disorder` ← biblio `taleb-nassim-nicholas-antifragile-things-that-gain-from-disorder` (exact_slug, score=100)
- `tavris-carol-and-elliot-aronson-mistakes-were-made-but-not-by-me` ← biblio `tavris-carol-and-elliot-aronson-mistakes-were-made-but-not-by-me` (exact_slug, score=100)
- `thomke-stefan-h-experimentation-works-the-surprising-power-of` ← biblio `thomke-stefan-h-experimentation-works-the-surprising-power-of` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)
- `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` ← biblio `berger-peter-l-and-thomas-luckmann-the-social-construction-of` (title_author, score=85)
- `dekker-sidney-drift-into-failure-from-hunting-broken-components-to-understanding-complex-systems` ← biblio `dekker-sidney-drift-into-failure-from-hunting-broken-components-to` (title_author, score=85)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author, score=85)
- `forsgren-nicole-jez-humble-and-gene-kim-accelerate-the-science-of-lean-software-and-devops-build` ← biblio `forsgren-nicole-jez-humble-and-gene-kim-accelerate-the-science-of` (title_author, score=85)
- `rosenzweig-phil-the-halo-effect-and-the-eight-other-business-delusions` ← biblio `rosenzweig-phil-the-halo-effect-and-the-eight-other-business` (title_author, score=85)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve` (title_author, score=85)
- `selznick-philip-leadership-in-administration-a-sociological-interpretation` ← biblio `selznick-philip-leadership-in-administration-a-sociological` (title_author, score=85)
- `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` ← biblio `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and` (title_author, score=85)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology` (title_author, score=85)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` ← biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected` (title_author, score=85)

### Missing in semantic (1)

- Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy, — *(no title)* (`beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy`)

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (1)

- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds-site-reliability-engineerin` — Betsy Beyer, Chris Jones, Jennifer Petoff, and Niall Richard Murphy — Site Reliability Engineering: How Google Runs Production Systems

### Thinkers stale for this book (4)

- `betsy-beyer` — Betsy Beyer
- `chris-jones` — Chris Jones
- `jennifer-petoff` — Jennifer Petoff
- `niall-richard-murphy` — Niall Richard Murphy

### Biblio creators without thinker node (11)

- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy` (Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy,)
- `demarco-tom-and-timothy-r-lister` (DeMarco, Tom, and Timothy R. Lister)
- `dietrich-d-rner` (Dietrich Dörner)
- `donald-a-sch-n` (Donald A Schön)
- `fahey-liam-and-robert-m-randall-eds` (Fahey, Liam, and Robert M. Randall, eds)
- `forsgren-nicole-jez-humble-and-gene-kim` (Forsgren, Nicole, Jez Humble, and Gene Kim)
- `goldratt-eliyahu-m-and-jeff-cox` (Goldratt, Eliyahu M., and Jeff Cox)
- `tavris-carol-and-elliot-aronson` (Tavris, Carol, and Elliot Aronson)
- `tetlock-philip-e-and-dan-gardner` (Tetlock, Philip E., and Dan Gardner)
- `weick-karl-e-and-kathleen-m-sutcliffe` (Weick, Karl E., and Kathleen M. Sutcliffe)

### Orphan creatorSlugs on linked sources (0)

_None._

## `how-trust-forms`

- Bibliography: `books/how-trust-forms/back-matter/bibliography.md`
- Parse style: `list` (15 entries)
- Semantic linked sources: 15
- Parse warning: other styles also matched: plain_chicago=1

### Matched (15)

- `arendt-hannah-the-human-condition` ← biblio `arendt-hannah-the-human-condition` (exact_slug, score=100)
- `baier-annette-c-trust-and-antitrust` ← biblio `baier-annette-c-trust-and-antitrust` (exact_slug, score=100)
- `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` ← biblio `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` (exact_slug, score=100)
- `dewey-john-human-nature-and-conduct-an-introduction-to-social-psychology` ← biblio `dewey-john-human-nature-and-conduct-an-introduction-to-social-psychology` (exact_slug, score=100)
- `dewey-john-the-public-and-its-problems` ← biblio `dewey-john-the-public-and-its-problems` (exact_slug, score=100)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` ← biblio `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` (exact_slug, score=100)
- `goffman-erving-the-presentation-of-self-in-everyday-life` ← biblio `goffman-erving-the-presentation-of-self-in-everyday-life` (exact_slug, score=100)
- `hardin-russell-trust-and-trustworthiness` ← biblio `hardin-russell-trust-and-trustworthiness` (exact_slug, score=100)
- `luhmann-niklas-trust-and-power-two-works` ← biblio `luhmann-niklas-trust-and-power-two-works` (exact_slug, score=100)
- `macintyre-alasdair-after-virtue-a-study-in-moral-theory` ← biblio `macintyre-alasdair-after-virtue-a-study-in-moral-theory` (exact_slug, score=100)
- `o-neill-onora-a-question-of-trust` ← biblio `o-neill-onora-a-question-of-trust` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `putnam-robert-d-bowling-alone-the-collapse-and-revival-of-american-community` ← biblio `putnam-robert-d-bowling-alone-the-collapse-and-revival-of-american-community` (exact_slug, score=100)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (1)

- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)

### Orphan creatorSlugs on linked sources (0)

_None._

## `living-in-sediment`

- Bibliography: `books/living-in-sediment/back-matter/bibliography.md`
- Parse style: `list` (72 entries)
- Semantic linked sources: 72
- Parse warning: other styles also matched: plain_chicago=30

### Matched (72)

- `abbott-andrew-the-system-of-professions-an-essay-on-the-division-of-expert-labor` ← biblio `abbott-andrew-the-system-of-professions-an-essay-on-the-division-of-expert-labor` (exact_slug, score=100)
- `acemoglu-daron-and-james-a-robinson-why-nations-fail-the-origins-of-power` ← biblio `acemoglu-daron-and-james-a-robinson-why-nations-fail-the-origins-of-power` (exact_slug, score=100)
- `alexander-christopher-sara-ishikawa-murray-silverstein-et-al-a-pattern-language` ← biblio `alexander-christopher-sara-ishikawa-murray-silverstein-et-al-a-pattern-language` (exact_slug, score=100)
- `alexander-christopher-the-timeless-way-of-building` ← biblio `alexander-christopher-the-timeless-way-of-building` (exact_slug, score=100)
- `arendt-hannah-between-past-and-future` ← biblio `arendt-hannah-between-past-and-future` (exact_slug, score=100)
- `arendt-hannah-the-human-condition` ← biblio `arendt-hannah-the-human-condition` (exact_slug, score=100)
- `arthur-w-brian-competing-technologies-increasing-returns-and-lock-in-by` ← biblio `arthur-w-brian-competing-technologies-increasing-returns-and-lock-in-by` (exact_slug, score=100)
- `arthur-w-brian-increasing-returns-and-path-dependence-in-the-economy` ← biblio `arthur-w-brian-increasing-returns-and-path-dependence-in-the-economy` (exact_slug, score=100)
- `beard-mary-spqr-a-history-of-ancient-rome` ← biblio `beard-mary-spqr-a-history-of-ancient-rome` (exact_slug, score=100)
- `bowker-geoffrey-c-and-susan-leigh-star-sorting-things-out-classification-and` ← biblio `bowker-geoffrey-c-and-susan-leigh-star-sorting-things-out-classification-and` (exact_slug, score=100)
- `braudel-fernand-the-structures-of-everyday-life` ← biblio `braudel-fernand-the-structures-of-everyday-life` (exact_slug, score=100)
- `carr-e-h-what-is-history` ← biblio `carr-e-h-what-is-history` (exact_slug, score=100)
- `christian-brian-the-alignment-problem-machine-learning-and-human-values` ← biblio `christian-brian-the-alignment-problem-machine-learning-and-human-values` (exact_slug, score=100)
- `crawford-kate-atlas-of-ai-power-politics-and-the-planetary-costs-of-artificial` ← biblio `crawford-kate-atlas-of-ai-power-politics-and-the-planetary-costs-of-artificial` (exact_slug, score=100)
- `david-paul-a-clio-and-the-economics-of-qwerty` ← biblio `david-paul-a-clio-and-the-economics-of-qwerty` (exact_slug, score=100)
- `davies-paul-about-time-einstein-s-unfinished-revolution` ← biblio `davies-paul-about-time-einstein-s-unfinished-revolution` (exact_slug, score=100)
- `demarco-tom-and-timothy-lister-slack-getting-past-burnout-busywork-and-the` ← biblio `demarco-tom-and-timothy-lister-slack-getting-past-burnout-busywork-and-the` (exact_slug, score=100)
- `deutscher-guy-the-unfolding-of-language-an-evolutionary-tour-of-mankind-s` ← biblio `deutscher-guy-the-unfolding-of-language-an-evolutionary-tour-of-mankind-s` (exact_slug, score=100)
- `deutscher-guy-through-the-language-glass-why-the-world-looks-different-in-other` ← biblio `deutscher-guy-through-the-language-glass-why-the-world-looks-different-in-other` (exact_slug, score=100)
- `douglas-mary-how-institutions-think` ← biblio `douglas-mary-how-institutions-think` (exact_slug, score=100)
- `edgerton-david-the-shock-of-the-old-technology-and-global-history-since-1900` ← biblio `edgerton-david-the-shock-of-the-old-technology-and-global-history-since-1900` (exact_slug, score=100)
- `elias-norbert-time-an-essay` ← biblio `elias-norbert-time-an-essay` (exact_slug, score=100)
- `ferguson-niall-the-ascent-of-money-a-financial-history-of-the-world` ← biblio `ferguson-niall-the-ascent-of-money-a-financial-history-of-the-world` (exact_slug, score=100)
- `foucault-michel-the-order-of-things-an-archaeology-of-the-human-sciences` ← biblio `foucault-michel-the-order-of-things-an-archaeology-of-the-human-sciences` (exact_slug, score=100)
- `frankopan-peter-the-silk-roads-a-new-history-of-the-world` ← biblio `frankopan-peter-the-silk-roads-a-new-history-of-the-world` (exact_slug, score=100)
- `garud-raghu-and-peter-karn-e-path-dependence-and-creation` ← biblio `garud-raghu-and-peter-karn-e-path-dependence-and-creation` (exact_slug, score=100)
- `geertz-clifford-the-interpretation-of-cultures` ← biblio `geertz-clifford-the-interpretation-of-cultures` (exact_slug, score=100)
- `giddens-anthony-the-constitution-of-society-outline-of-the-theory-of` ← biblio `giddens-anthony-the-constitution-of-society-outline-of-the-theory-of` (exact_slug, score=100)
- `graeber-david-debt-the-first-5-000-years` ← biblio `graeber-david-debt-the-first-5-000-years` (exact_slug, score=100)
- `hacking-ian-the-taming-of-chance` ← biblio `hacking-ian-the-taming-of-chance` (exact_slug, score=100)
- `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human-evolution` ← biblio `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human-evolution` (exact_slug, score=100)
- `illich-ivan-tools-for-conviviality` ← biblio `illich-ivan-tools-for-conviviality` (exact_slug, score=100)
- `ingham-geoffrey-the-nature-of-money` ← biblio `ingham-geoffrey-the-nature-of-money` (exact_slug, score=100)
- `jacobs-jane-the-death-and-life-of-great-american-cities` ← biblio `jacobs-jane-the-death-and-life-of-great-american-cities` (exact_slug, score=100)
- `krier-l-on-the-architecture-of-community` ← biblio `krier-l-on-the-architecture-of-community` (exact_slug, score=100)
- `lakoff-george-and-mark-johnson-metaphors-we-live-by` ← biblio `lakoff-george-and-mark-johnson-metaphors-we-live-by` (exact_slug, score=100)
- `landes-david-s-revolution-in-time-clocks-and-the-making-of-the-modern-world` ← biblio `landes-david-s-revolution-in-time-clocks-and-the-making-of-the-modern-world` (exact_slug, score=100)
- `latour-bruno-reassembling-the-social-an-introduction-to-actor-network-theory` ← biblio `latour-bruno-reassembling-the-social-an-introduction-to-actor-network-theory` (exact_slug, score=100)
- `levin-yuval-the-fractured-republic-renewing-america-s-social-contract-in-the-age` ← biblio `levin-yuval-the-fractured-republic-renewing-america-s-social-contract-in-the-age` (exact_slug, score=100)
- `liebowitz-s-j-and-stephen-e-margolis-path-dependence-lock-in-and-history` ← biblio `liebowitz-s-j-and-stephen-e-margolis-path-dependence-lock-in-and-history` (exact_slug, score=100)
- `macgregor-neil-a-history-of-the-world-in-100-objects` ← biblio `macgregor-neil-a-history-of-the-world-in-100-objects` (exact_slug, score=100)
- `march-james-g-and-herbert-a-simon-organizations` ← biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug, score=100)
- `martin-felix-money-the-unauthorized-biography` ← biblio `martin-felix-money-the-unauthorized-biography` (exact_slug, score=100)
- `mcneill-william-h-keeping-together-in-time-dance-and-drill-in-human-history` ← biblio `mcneill-william-h-keeping-together-in-time-dance-and-drill-in-human-history` (exact_slug, score=100)
- `meadows-donella-h-thinking-in-systems-a-primer` ← biblio `meadows-donella-h-thinking-in-systems-a-primer` (exact_slug, score=100)
- `muller-jerry-z-the-tyranny-of-metrics` ← biblio `muller-jerry-z-the-tyranny-of-metrics` (exact_slug, score=100)
- `mumford-lewis-technics-and-civilization` ← biblio `mumford-lewis-technics-and-civilization` (exact_slug, score=100)
- `noble-safiya-umoja-algorithms-of-oppression-how-search-engines-reinforce-racism` ← biblio `noble-safiya-umoja-algorithms-of-oppression-how-search-engines-reinforce-racism` (exact_slug, score=100)
- `north-douglass-c-institutions-institutional-change-and-economic-performance` ← biblio `north-douglass-c-institutions-institutional-change-and-economic-performance` (exact_slug, score=100)
- `o-neil-cathy-weapons-of-math-destruction-how-big-data-increases-inequality-and` ← biblio `o-neil-cathy-weapons-of-math-destruction-how-big-data-increases-inequality-and` (exact_slug, score=100)
- `petroski-henry-the-evolution-of-useful-things` ← biblio `petroski-henry-the-evolution-of-useful-things` (exact_slug, score=100)
- `pierson-paul-increasing-returns-path-dependence-and-the-study-of-politics` ← biblio `pierson-paul-increasing-returns-path-dependence-and-the-study-of-politics` (exact_slug, score=100)
- `polanyi-karl-the-great-transformation-the-political-and-economic-origins-of-our` ← biblio `polanyi-karl-the-great-transformation-the-political-and-economic-origins-of-our` (exact_slug, score=100)
- `porter-theodore-m-trust-in-numbers-the-pursuit-of-objectivity-in-science-and` ← biblio `porter-theodore-m-trust-in-numbers-the-pursuit-of-objectivity-in-science-and` (exact_slug, score=100)
- `rosenzweig-phil-the-halo-effect-and-the-eight-other-business-delusions` ← biblio `rosenzweig-phil-the-halo-effect-and-the-eight-other-business-delusions` (exact_slug, score=100)
- `rovelli-carlo-the-order-of-time` ← biblio `rovelli-carlo-the-order-of-time` (exact_slug, score=100)
- `scott-james-c-domination-and-the-arts-of-resistance-hidden-transcripts` ← biblio `scott-james-c-domination-and-the-arts-of-resistance-hidden-transcripts` (exact_slug, score=100)
- `selznick-philip-leadership-in-administration-a-sociological-interpretation` ← biblio `selznick-philip-leadership-in-administration-a-sociological-interpretation` (exact_slug, score=100)
- `simmel-georg-the-philosophy-of-money` ← biblio `simmel-georg-the-philosophy-of-money` (exact_slug, score=100)
- `solnit-rebecca-a-field-guide-to-getting-lost` ← biblio `solnit-rebecca-a-field-guide-to-getting-lost` (exact_slug, score=100)
- `solnit-rebecca-hope-in-the-dark-untold-histories-wild-possibilities` ← biblio `solnit-rebecca-hope-in-the-dark-untold-histories-wild-possibilities` (exact_slug, score=100)
- `solnit-rebecca-no-straight-road-takes-you-there-essays-for-uneven-terrain` ← biblio `solnit-rebecca-no-straight-road-takes-you-there-essays-for-uneven-terrain` (exact_slug, score=100)
- `tilly-charles-big-structures-large-processes-huge-comparisons` ← biblio `tilly-charles-big-structures-large-processes-huge-comparisons` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `winner-langdon-do-artifacts-have-politics` ← biblio `winner-langdon-do-artifacts-have-politics` (exact_slug, score=100)
- `wu-tim-the-attention-merchants-the-epic-scramble-to-get-inside-our-heads` ← biblio `wu-tim-the-attention-merchants-the-epic-scramble-to-get-inside-our-heads` (exact_slug, score=100)
- `zerubavel-eviatar-hidden-rhythms-schedules-and-calendars-in-social-life` ← biblio `zerubavel-eviatar-hidden-rhythms-schedules-and-calendars-in-social-life` (exact_slug, score=100)
- `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` ← biblio `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a` (title_author, score=85)
- `madison-james-alexander-hamilton-and-john-jay-the-federalist-papers` ← biblio `hamilton-alexander-james-madison-and-john-jay-the-federalist-papers` (title_author, score=85)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective` (title_author, score=85)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human` (title_author, score=85)
- `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future-at-the-new-front` ← biblio `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (11)

- `acemoglu-daron-and-james-a-robinson` (Acemoglu, Daron, and James A. Robinson)
- `alexander-christopher-sara-ishikawa-murray-silverstein-et-al` (Alexander, Christopher, Sara Ishikawa, Murray Silverstein, et al)
- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)
- `bowker-geoffrey-c-and-susan-leigh-star` (Bowker, Geoffrey C., and Susan Leigh Star)
- `demarco-tom-and-timothy-lister` (DeMarco, Tom, and Timothy Lister)
- `garud-raghu-and-peter-karn-e` (Garud, Raghu, and Peter Karnøe)
- `hamilton-alexander-james-madison-and-john-jay` (Hamilton, Alexander, James Madison, and John Jay)
- `l-on-krier` (Léon Krier)
- `lakoff-george-and-mark-johnson` (Lakoff, George, and Mark Johnson)
- `liebowitz-s-j-and-stephen-e-margolis` (Liebowitz, S. J., and Stephen E. Margolis)
- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)

### Orphan creatorSlugs on linked sources (0)

_None._

## `the-discipline-of-uncertainty`

- Bibliography: `books/the-discipline-of-uncertainty/back-matter/bibliography.md`
- Parse style: `list` (10 entries)
- Semantic linked sources: 10

### Matched (10)

- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
- `lord-charles-g-lee-ross-and-mark-r-lepper-biased-assimilation-and-attitude-polarization-the-effe` ← biblio `lord-charles-g-lee-ross-and-mark-r-lepper-biased-assimilation-and-attitude-polarization-the-effe` (exact_slug, score=100)
- `reason-james-the-human-contribution-unsafe-acts-accidents-and-heroic-recoveries` ← biblio `reason-james-the-human-contribution-unsafe-acts-accidents-and-heroic-recoveries` (exact_slug, score=100)
- `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` ← biblio `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` (exact_slug, score=100)
- `taleb-nassim-nicholas-antifragile-things-that-gain-from-disorder` ← biblio `taleb-nassim-nicholas-antifragile-things-that-gain-from-disorder` (exact_slug, score=100)
- `tillich-paul-the-courage-to-be` ← biblio `tillich-paul-the-courage-to-be` (exact_slug, score=100)
- `tuchman-barbara-w-the-march-of-folly-from-troy-to-vietnam` ← biblio `tuchman-barbara-w-the-march-of-folly-from-troy-to-vietnam` (exact_slug, score=100)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` ← biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` (exact_slug, score=100)
- `u-s-securities-and-exchange-commission-office-of-the-whistleblower-annual-reports-to-congress-ht` ← biblio `u-s-securities-and-exchange-commission-office-of-the-whistleblower-annual-reports-to-congress` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (3)

- `lord-charles-g-lee-ross-and-mark-r-lepper` (Lord, Charles G., Lee Ross, and Mark R. Lepper)
- `u-s-securities-and-exchange-commission-office-of-the-whistleblower` (U.S. Securities and Exchange Commission, Office of the Whistleblower)
- `weick-karl-e-and-kathleen-m-sutcliffe` (Weick, Karl E., and Kathleen M. Sutcliffe)

### Orphan creatorSlugs on linked sources (0)

_None._

## `the-economy-we-dont-experience`

- Bibliography: `books/the-economy-we-dont-experience/back-matter/bibliography.md`
- Parse style: `pandoc_div` (27 entries)
- Semantic linked sources: 16
- Parse warning: other styles also matched: plain_chicago=27

### Matched (8)

- `bernanke-ben-s-the-courage-to-act-a-memoir-of-a-crisis-and-its-aftermath` ← biblio `bernanke-ben-s-the-courage-to-act-a-memoir-of-a-crisis-and-its-aftermath` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-report-on-the-economic-well-being-of-u-s-househ` ← biblio `board-of-governors-of-the-federal-reserve-system-report-on-the-economic-well-being-of-u-s-househ` (exact_slug, score=100)
- `kahneman-daniel-and-amos-tversky-prospect-theory-an-analysis-of-decision-under-risk` ← biblio `kahneman-daniel-and-amos-tversky-prospect-theory-an-analysis-of-decision-under-risk` (exact_slug, score=100)
- `pew-research-center-americans-views-of-inflation-and-the-economy` ← biblio `pew-research-center-americans-views-of-inflation-and-the-economy` (exact_slug, score=100)
- `reinhart-carmen-m-and-kenneth-s-rogoff-this-time-is-different-eight-centuries-of-financial-folly` ← biblio `reinhart-carmen-m-and-kenneth-s-rogoff-this-time-is-different-eight-centuries-of-financial-folly` (exact_slug, score=100)
- `shiller-robert-j-narrative-economics-how-stories-go-viral-and-drive-major-economic-events` ← biblio `shiller-robert-j-narrative-economics-how-stories-go-viral-and-drive-major-economic-events` (exact_slug, score=100)
- `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` ← biblio `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` (exact_slug, score=100)
- `u-s-census-bureau-housing-statistics-and-american-community-survey-materials-on-regional-cost-pr` ← biblio `u-s-census-bureau-housing-statistics-and-american-community-survey-materials-on-regional-cost-pr` (exact_slug, score=100)

### Missing in semantic (19)

- Larry M Bartels — *Beyond the Running Tally: Partisan Bias in Political Perceptions* (`bartels-larry-m-beyond-the-running-tally-partisan-bias-in-political-perceptions`)
- Board of Governors of the Federal Reserve System — *Beige Book: Summary of Commentary on Current Economic Conditions by Federal Reserve District* (`board-of-governors-of-the-federal-reserve-system-beige-book-summary-of-commentary-on-current-eco`)
- Board of Governors of the Federal Reserve System — *Financial Stability Report* (`board-of-governors-of-the-federal-reserve-system-financial-stability-report`)
- Board of Governors of the Federal Reserve System — *Summary of Economic Projections* (`board-of-governors-of-the-federal-reserve-system-summary-of-economic-projections`)
- Board of Governors of the Federal Reserve System — *Transcript of Chair Powell's Press Conference* (`board-of-governors-of-the-federal-reserve-system-transcript-of-chair-powell-s-press-conference`)
- Board of Governors of the Federal Reserve System — *Supervisory bank stress-test results and related supervisory materials. Washington, DC: Federal Reserve Board, 2011-2024* (`board-of-governors-of-the-federal-reserve-system-supervisory-bank-stress-test-results-and-relate`)
- Congressional Budget Office — *Effects of Automatic Stabilizers on the Federal Budget: 2024 to 2034* (`congressional-budget-office-effects-of-automatic-stabilizers-on-the-federal-budget-2024-to-2034`)
- Federal Deposit Insurance Corporation — *Options for Deposit Insurance Reform* (`federal-deposit-insurance-corporation-options-for-deposit-insurance-reform`)
- Federal Reserve Bank of Philadelphia — *Survey of Professional Forecasters* (`federal-reserve-bank-of-philadelphia-survey-of-professional-forecasters`)
- Financial Stability Board — *Implementation and Effects of the G20 Financial Regulatory Reforms* (`financial-stability-board-implementation-and-effects-of-the-g20-financial-regulatory-reforms`)
- Morris P Fiorina — *Retrospective Voting in American National Elections* (`fiorina-morris-p-retrospective-voting-in-american-national-elections`)
- Hovland, Carl I., and Walter Weiss — *The Influence of Source Credibility on Communication Effectiveness* (`hovland-carl-i-and-walter-weiss-the-influence-of-source-credibility-on-communication-effectivene`)
- Key, V. O., Jr — *The Responsible Electorate: Rationality in Presidential Voting, 1936-1960* (`key-v-o-jr-the-responsible-electorate-rationality-in-presidential-voting-1936-1960`)
- KFF — *Employer Health Benefits Survey* (`kff-employer-health-benefits-survey`)
- Lupia, Arthur, and Mathew D. McCubbins — *The Democratic Dilemma: Can Citizens Learn What They Need to Know?* (`lupia-arthur-and-mathew-d-mccubbins-the-democratic-dilemma-can-citizens-learn-what-they-need-to`)
- Howard Schneider — *Powell says soft-landing not baseline, but it's sure in the forecast* (`schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast`)
- U.S. Bureau of Labor Statistics — *Consumer Price Index (CPI) news releases, methodology notes, and databases, 2020-2024* (`u-s-bureau-of-labor-statistics-consumer-price-index-cpi-news-releases-methodology-notes-and-data`)
- U.S. Bureau of Labor Statistics — *The Employment Situation* (`u-s-bureau-of-labor-statistics-the-employment-situation`)
- U.S. Department of the Treasury, Board of Governors of the Federal Reserve System, and Federal Deposit Insurance Corporation — *Joint Statement by the Department of the Treasury, Federal Reserve, and FDIC* (`u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-depo`)

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (8)

- `haldane-andrew-the-second-wave-the-economic-and-financial-impact-of-covid-19` — Andrew Haldane — The Second Wave: The Economic and Financial Impact of COVID-19.
- `kashyap-anil-k-and-jeremy-c-stein-what-do-a-million-observations-on-banks-say-about-the-transmis` — Anil K. Kashyap and Jeremy C. Stein — What Do a Million Observations on Banks Say about the Transmission of Monetary Policy?
- `mankiw-n-gregory-the-macroeconomist-as-scientist-and-engineer` — N. Gregory Mankiw — The Macroeconomist as Scientist and Engineer.
- `rodrik-dani-economics-rules-the-rights-and-wrongs-of-the-dismal-science` — Dani Rodrik — Economics Rules: The Rights and Wrongs of the Dismal Science
- `sunstein-cass-r-how-facts-change-minds-cognitive-foundations-of-political-persuasion` — Cass R Sunstein — How Facts Change Minds: Cognitive Foundations of Political Persuasion
- `u-s-bureau-of-labor-statistics-consumer-price-index-cpi-news-releases-and-databases-2020-2024-ht` — U.S. Bureau of Labor Statistics — Consumer Price Index (CPI) news releases and databases
- `u-s-bureau-of-labor-statistics-employment-situation-news-releases-job-openings-and-labor-turnove` — U.S. Bureau of Labor Statistics — Employment Situation news releases; Job Openings and Labor Turnover Survey (JOLTS)
- `yellen-janet-l-speeches-on-inflation-labor-markets-and-financial-stability-board-of-governors-of` — Janet L. Yellen — Speeches on inflation, labor markets, and financial stability (2021–2024)

### Thinkers stale for this book (7)

- `andrew-haldane` — Andrew Haldane
- `anil-k-kashyap` — Anil K. Kashyap
- `cass-r-sunstein` — Cass R Sunstein
- `dani-rodrik` — Dani Rodrik
- `janet-l-yellen` — Janet L. Yellen
- `jeremy-c-stein` — Jeremy C. Stein
- `n-gregory-mankiw` — N. Gregory Mankiw

### Biblio creators without thinker node (15)

- `congressional-budget-office` (Congressional Budget Office)
- `federal-deposit-insurance-corporation` (Federal Deposit Insurance Corporation)
- `federal-reserve-bank-of-philadelphia` (Federal Reserve Bank of Philadelphia)
- `financial-stability-board` (Financial Stability Board)
- `hovland-carl-i-and-walter-weiss` (Hovland, Carl I., and Walter Weiss)
- `howard-schneider` (Howard Schneider)
- `kahneman-daniel-and-amos-tversky` (Kahneman, Daniel, and Amos Tversky)
- `key-v-o-jr` (Key, V. O., Jr)
- `kff` (KFF)
- `larry-m-bartels` (Larry M Bartels)
- `lupia-arthur-and-mathew-d-mccubbins` (Lupia, Arthur, and Mathew D. McCubbins)
- `morris-p-fiorina` (Morris P Fiorina)
- `reinhart-carmen-m-and-kenneth-s-rogoff` (Reinhart, Carmen M., and Kenneth S. Rogoff)
- `tetlock-philip-e-and-dan-gardner` (Tetlock, Philip E., and Dan Gardner)
- `u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-deposit-insurance-corporation` (U.S. Department of the Treasury, Board of Governors of the Federal Reserve System, and Federal Deposit Insurance Corporation)

### Orphan creatorSlugs on linked sources (0)

_None._

## `trust-beyond-similarity`

- Bibliography: `books/trust-beyond-similarity/back-matter/bibliography.md`
- Parse style: `list` (42 entries)
- Semantic linked sources: 42
- Parse warning: other styles also matched: plain_chicago=1

### Matched (42)

- `anderson-benedict-imagined-communities-reflections-on-the-origin-and-spread-of-nationalism` ← biblio `anderson-benedict-imagined-communities-reflections-on-the-origin-and-spread-of-nationalism` (exact_slug, score=100)
- `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` ← biblio `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` (exact_slug, score=100)
- `brinkmann-svend-standpoints-ten-old-ideas-for-a-new-world` ← biblio `brinkmann-svend-standpoints-ten-old-ideas-for-a-new-world` (exact_slug, score=100)
- `dahl-robert-a-on-democracy` ← biblio `dahl-robert-a-on-democracy` (exact_slug, score=100)
- `edmondson-amy-c-teaming-how-organizations-learn-innovate-and-compete-in-the-knowledge-economy` ← biblio `edmondson-amy-c-teaming-how-organizations-learn-innovate-and-compete-in-the-knowledge-economy` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` (exact_slug, score=100)
- `fisher-roger-william-ury-and-bruce-patton-getting-to-yes-negotiating-agreement-without-giving-in` ← biblio `fisher-roger-william-ury-and-bruce-patton-getting-to-yes-negotiating-agreement-without-giving-in` (exact_slug, score=100)
- `flook-david-j-commercial-diving-manual` ← biblio `flook-david-j-commercial-diving-manual` (exact_slug, score=100)
- `freeman-r-edward-strategic-management-a-stakeholder-approach` ← biblio `freeman-r-edward-strategic-management-a-stakeholder-approach` (exact_slug, score=100)
- `fukuyama-francis-trust-the-social-virtues-and-the-creation-of-prosperity` ← biblio `fukuyama-francis-trust-the-social-virtues-and-the-creation-of-prosperity` (exact_slug, score=100)
- `haidt-jonathan-the-righteous-mind-why-good-people-are-divided-by-politics-and-religion` ← biblio `haidt-jonathan-the-righteous-mind-why-good-people-are-divided-by-politics-and-religion` (exact_slug, score=100)
- `harvey-jerry-b-the-abilene-paradox-the-management-of-agreement` ← biblio `harvey-jerry-b-the-abilene-paradox-the-management-of-agreement` (exact_slug, score=100)
- `haspeslagh-philippe-c-and-david-b-jemison-managing-acquisitions-creating-value-from-corporate-an` ← biblio `haspeslagh-philippe-c-and-david-b-jemison-managing-acquisitions-creating-value-from-corporate-an` (exact_slug, score=100)
- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` ← biblio `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
- `kuhn-thomas-s-the-structure-of-scientific-revolutions` ← biblio `kuhn-thomas-s-the-structure-of-scientific-revolutions` (exact_slug, score=100)
- `l-gstrup-k-e-the-ethical-demand` ← biblio `l-gstrup-k-e-the-ethical-demand` (exact_slug, score=100)
- `larsen-christian-albrekt-the-rise-and-fall-of-social-cohesion-the-construction-and-de-constructi` ← biblio `larsen-christian-albrekt-the-rise-and-fall-of-social-cohesion-the-construction-and-de-constructi` (exact_slug, score=100)
- `mcpherson-miller-lynn-smith-lovin-and-james-m-cook-birds-of-a-feather-homophily-in-social-networ` ← biblio `mcpherson-miller-lynn-smith-lovin-and-james-m-cook-birds-of-a-feather-homophily-in-social-networ` (exact_slug, score=100)
- `munk-nina-fools-rush-in-steve-case-jerry-levin-and-the-unmaking-of-aol-time-warner` ← biblio `munk-nina-fools-rush-in-steve-case-jerry-levin-and-the-unmaking-of-aol-time-warner` (exact_slug, score=100)
- `murdoch-iris-the-sovereignty-of-good` ← biblio `murdoch-iris-the-sovereignty-of-good` (exact_slug, score=100)
- `nguyen-c-thi-echo-chambers-and-epistemic-bubbles` ← biblio `nguyen-c-thi-echo-chambers-and-epistemic-bubbles` (exact_slug, score=100)
- `nguyen-c-thi-games-agency-as-art` ← biblio `nguyen-c-thi-games-agency-as-art` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `page-scott-e-the-difference-how-the-power-of-diversity-creates-better-groups-firms-schools-and-s` ← biblio `page-scott-e-the-difference-how-the-power-of-diversity-creates-better-groups-firms-schools-and-s` (exact_slug, score=100)
- `page-scott-e-the-diversity-bonus-how-great-teams-pay-off-in-the-knowledge-economy` ← biblio `page-scott-e-the-diversity-bonus-how-great-teams-pay-off-in-the-knowledge-economy` (exact_slug, score=100)
- `porter-michael-e-competitive-advantage-creating-and-sustaining-superior-performance` ← biblio `porter-michael-e-competitive-advantage-creating-and-sustaining-superior-performance` (exact_slug, score=100)
- `raymond-eric-s-the-cathedral-and-the-bazaar-musings-on-linux-and-open-source-by-an-accidental-re` ← biblio `raymond-eric-s-the-cathedral-and-the-bazaar-musings-on-linux-and-open-source-by-an-accidental-re` (exact_slug, score=100)
- `reason-james-human-error` ← biblio `reason-james-human-error` (exact_slug, score=100)
- `rosenblat-alex-uberland-how-algorithms-are-rewriting-the-rules-of-work` ← biblio `rosenblat-alex-uberland-how-algorithms-are-rewriting-the-rules-of-work` (exact_slug, score=100)
- `schelling-thomas-c-the-strategy-of-conflict` ← biblio `schelling-thomas-c-the-strategy-of-conflict` (exact_slug, score=100)
- `staggenborg-suzanne-social-movements` ← biblio `staggenborg-suzanne-social-movements` (exact_slug, score=100)
- `star-susan-leigh-and-james-r-griesemer-institutional-ecology-translations-and-boundary-objects` ← biblio `star-susan-leigh-and-james-r-griesemer-institutional-ecology-translations-and-boundary-objects` (exact_slug, score=100)
- `steffensen-kevin-how-meaning-moves` ← biblio `steffensen-kevin-how-meaning-moves` (exact_slug, score=100)
- `suedfeld-peter-philip-e-tetlock-and-sally-streufert-conceptual-integrative-complexity` ← biblio `suedfeld-peter-philip-e-tetlock-and-sally-streufert-conceptual-integrative-complexity` (exact_slug, score=100)
- `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` ← biblio `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` (exact_slug, score=100)
- `svendsen-gert-tinggaard-trust` ← biblio `svendsen-gert-tinggaard-trust` (exact_slug, score=100)
- `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` ← biblio `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` (exact_slug, score=100)
- `tetlock-philip-e-expert-political-judgment-how-good-is-it-how-can-we-know` ← biblio `tetlock-philip-e-expert-political-judgment-how-good-is-it-how-can-we-know` (exact_slug, score=100)
- `wachsmuth-david-and-alexander-weisler-airbnb-and-the-rent-gap-gentrification-through-the-sharing` ← biblio `wachsmuth-david-and-alexander-weisler-airbnb-and-the-rent-gap-gentrification-through-the-sharing` (exact_slug, score=100)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` ← biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (8)

- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)
- `fisher-roger-william-ury-and-bruce-patton` (Fisher, Roger, William Ury, and Bruce Patton)
- `mcpherson-miller-lynn-smith-lovin-and-james-m-cook` (McPherson, Miller, Lynn Smith-Lovin, and James M. Cook)
- `star-susan-leigh-and-james-r-griesemer` (Star, Susan Leigh, and James R. Griesemer)
- `suedfeld-peter-philip-e-tetlock-and-sally-streufert` (Suedfeld, Peter, Philip E. Tetlock, and Sally Streufert)
- `tetlock-philip-e-and-dan-gardner` (Tetlock, Philip E., and Dan Gardner)
- `wachsmuth-david-and-alexander-weisler` (Wachsmuth, David, and Alexander Weisler)
- `weick-karl-e-and-kathleen-m-sutcliffe` (Weick, Karl E., and Kathleen M. Sutcliffe)

### Orphan creatorSlugs on linked sources (0)

_None._

## `what-we-cannot-see`

- Bibliography: `books/what-we-cannot-see/back-matter/bibliography.md`
- Parse style: `list` (21 entries)
- Semantic linked sources: 18
- Parse warning: other styles also matched: plain_chicago=1

### Matched (18)

- `columbia-accident-investigation-board-report-of-the-columbia-accident-investigation-board` ← biblio `columbia-accident-investigation-board-report-of-the-columbia-accident-investigation-board` (exact_slug, score=100)
- `federal-aviation-administration-and-nasa-aviation-safety-reporting-system-asrs` ← biblio `federal-aviation-administration-and-nasa-aviation-safety-reporting-system-asrs` (exact_slug, score=100)
- `gleeson-white-jane-double-entry-how-the-merchants-of-venice-created-modern-finance` ← biblio `gleeson-white-jane-double-entry-how-the-merchants-of-venice-created-modern-finance` (exact_slug, score=100)
- `ioannidis-john-p-a-why-most-published-research-findings-are-false` ← biblio `ioannidis-john-p-a-why-most-published-research-findings-are-false` (exact_slug, score=100)
- `johnson-steven-the-ghost-map-the-story-of-london-s-most-terrifying-epidemic-and-how-it-changed-s` ← biblio `johnson-steven-the-ghost-map-the-story-of-london-s-most-terrifying-epidemic-and-how-it-changed-s` (exact_slug, score=100)
- `kahneman-daniel-and-gary-klein-conditions-for-intuitive-expertise-a-failure-to-disagree` ← biblio `kahneman-daniel-and-gary-klein-conditions-for-intuitive-expertise-a-failure-to-disagree` (exact_slug, score=100)
- `knutti-reto-et-al-challenges-in-combining-projections-from-multiple-climate-models` ← biblio `knutti-reto-et-al-challenges-in-combining-projections-from-multiple-climate-models` (exact_slug, score=100)
- `kranz-gene-failure-is-not-an-option-mission-control-from-mercury-to-apollo-13-and-beyond` ← biblio `kranz-gene-failure-is-not-an-option-mission-control-from-mercury-to-apollo-13-and-beyond` (exact_slug, score=100)
- `leveson-nancy-g-and-clark-s-turner-an-investigation-of-the-therac-25-accidents` ← biblio `leveson-nancy-g-and-clark-s-turner-an-investigation-of-the-therac-25-accidents` (exact_slug, score=100)
- `lovell-jim-and-jeffrey-kluger-lost-moon-the-perilous-voyage-of-apollo-13` ← biblio `lovell-jim-and-jeffrey-kluger-lost-moon-the-perilous-voyage-of-apollo-13` (exact_slug, score=100)
- `mellers-barbara-et-al-identifying-and-cultivating-superforecasters-as-a-method-of-improving-prob` ← biblio `mellers-barbara-et-al-identifying-and-cultivating-superforecasters-as-a-method-of-improving-prob` (exact_slug, score=100)
- `nuland-sherwin-b-the-doctors-plague-germs-childbed-fever-and-the-strange-story-of-ign-c-semmelwe` ← biblio `nuland-sherwin-b-the-doctors-plague-germs-childbed-fever-and-the-strange-story-of-ign-c-semmelwe` (exact_slug, score=100)
- `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` ← biblio `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` (exact_slug, score=100)
- `president-s-commission-on-the-space-shuttle-challenger-accident-report-of-the-presidential-commi` ← biblio `president-s-commission-on-the-space-shuttle-challenger-accident-report-of-the-presidential-commi` (exact_slug, score=100)
- `schulz-kenneth-f-et-al-empirical-evidence-of-bias-dimensions-of-methodological-quality-associate` ← biblio `schulz-kenneth-f-et-al-empirical-evidence-of-bias-dimensions-of-methodological-quality-associate` (exact_slug, score=100)
- `simons-daniel-j-and-christopher-f-chabris-gorillas-in-our-midst-sustained-inattentional-blindnes` ← biblio `simons-daniel-j-and-christopher-f-chabris-gorillas-in-our-midst-sustained-inattentional-blindnes` (exact_slug, score=100)
- `snow-john-on-the-mode-of-communication-of-cholera` ← biblio `snow-john-on-the-mode-of-communication-of-cholera` (exact_slug, score=100)
- `tversky-amos-and-daniel-kahneman-availability-a-heuristic-for-judging-frequency-and-probability` ← biblio `tversky-amos-and-daniel-kahneman-availability-a-heuristic-for-judging-frequency-and-probability` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (3)

- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` matches biblio `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` (exact_slug; current books: learning-to-see, trust-beyond-similarity, when-others-look-to-you-v1, when-others-look-to-you-v2)
- `kahneman-daniel-thinking-fast-and-slow` matches biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug; current books: how-serious-systems-learn, learning-to-see, the-discipline-of-uncertainty, trust-beyond-similarity, when-authority-outlives-accountability, when-moral-seriousness-scales)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` matches biblio `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` (exact_slug; current books: how-serious-systems-learn, when-accountability-no-longer-expires, when-others-look-to-you-v2, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (8)

- `kahneman-daniel-and-gary-klein` (Kahneman, Daniel, and Gary Klein)
- `knutti-reto-et-al` (Knutti, Reto, et al)
- `leveson-nancy-g-and-clark-s-turner` (Leveson, Nancy G., and Clark S. Turner)
- `lovell-jim-and-jeffrey-kluger` (Lovell, Jim, and Jeffrey Kluger)
- `mellers-barbara-et-al` (Mellers, Barbara, et al)
- `schulz-kenneth-f-et-al` (Schulz, Kenneth F., et al)
- `simons-daniel-j-and-christopher-f-chabris` (Simons, Daniel J., and Christopher F. Chabris)
- `tversky-amos-and-daniel-kahneman` (Tversky, Amos, and Daniel Kahneman)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-accountability-no-longer-expires`

- Bibliography: `books/when-accountability-no-longer-expires/back-matter/bibliography.md`
- Parse style: `list` (12 entries)
- Semantic linked sources: 12
- Parse warning: other styles also matched: plain_chicago=6

### Matched (12)

- `arendt-hannah-between-past-and-future` ← biblio `arendt-hannah-between-past-and-future` (exact_slug, score=100)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` (exact_slug, score=100)
- `argyris-chris-on-organizational-learning` ← biblio `argyris-chris-on-organizational-learning` (exact_slug, score=100)
- `bauman-zygmunt-modernity-and-the-holocaust` ← biblio `bauman-zygmunt-modernity-and-the-holocaust` (exact_slug, score=100)
- `hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility` ← biblio `hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility` (exact_slug, score=100)
- `march-james-g-exploration-and-exploitation-in-organizational` ← biblio `march-james-g-exploration-and-exploitation-in-organizational` (exact_slug, score=100)
- `mashaw-jerry-l-bureaucratic-justice-managing-social-security` ← biblio `mashaw-jerry-l-bureaucratic-justice-managing-social-security` (exact_slug, score=100)
- `smith-nick-i-was-wrong-the-meanings-of-apologies` ← biblio `smith-nick-i-was-wrong-the-meanings-of-apologies` (exact_slug, score=100)
- `thelen-kathleen-how-institutions-evolve-the-political-economy-of` ← biblio `thelen-kathleen-how-institutions-evolve-the-political-economy-of` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (0)

_None._

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-authority-is-misread`

- Bibliography: `books/when-authority-is-misread/back-matter/bibliography.md`
- Parse style: `list` (51 entries)
- Semantic linked sources: 5

### Matched (4)

- `grice-h-p-logic-and-conversation` ← biblio `grice-h-p-logic-and-conversation` (exact_slug, score=100)
- `king-martin-luther-jr-letter-from-birmingham-jail` ← biblio `king-martin-luther-jr-letter-from-birmingham-jail` (exact_slug, score=100)
- `marton-kati-the-chancellor-the-remarkable-odyssey-of-angela-merkel` ← biblio `marton-kati-the-chancellor-the-remarkable-odyssey-of-angela-merkel` (exact_slug, score=100)
- `eagly-alice-h-and-linda-l-carli-through-the-labyrinth-the-truth` ← biblio `eagly-alice-h-and-linda-l-carli-through-the-labyrinth-the-truth-about-how-women-become-leaders` (title_author, score=85)

### Missing in semantic (44)

- Robin Alexander — *Die Getriebenen: Merkel und die Flüchtlingspolitik* (`alexander-robin-die-getriebenen-merkel-und-die-fl-chtlingspolitik`)
- Richard J Blackwell — *Galileo, Bellarmine, and the Bible* (`blackwell-richard-j-galileo-bellarmine-and-the-bible`)
- Mark Blyth — *Austerity: The History of a Dangerous Idea* (`blyth-mark-austerity-the-history-of-a-dangerous-idea`)
- Taylor Branch — *At Canaan's Edge: America in the King Years 1965-68* (`branch-taylor-at-canaan-s-edge-america-in-the-king-years-1965-68`)
- Taylor Branch — *Parting the Waters: America in the King Years 1954-63* (`branch-taylor-parting-the-waters-america-in-the-king-years-1954-63`)
- Taylor Branch — *Pillar of Fire: America in the King Years 1963-65* (`branch-taylor-pillar-of-fire-america-in-the-king-years-1963-65`)
- Timothy Brook — *Quelling the People: The Military Suppression of the Beijing Democracy Movement* (`brook-timothy-quelling-the-people-the-military-suppression-of-the-beijing-democracy-movement`)
- Brownell, Kelly D., and Kenneth E. Warner — *The Perils of Ignoring History: Big Tobacco Played Dirty and Millions Died. How Similar Is Big Food?* (`brownell-kelly-d-and-kenneth-e-warner-the-perils-of-ignoring-history-big-tobacco-played-dirty-an`)
- Craig Calhoun — *Neither Gods nor Emperors: Students and the Struggle for Democracy in China* (`calhoun-craig-neither-gods-nor-emperors-students-and-the-struggle-for-democracy-in-china`)
- Ceplair, Larry, and Steven Englund — *The Inquisition in Hollywood: Politics in the Film Community, 1930-1960* (`ceplair-larry-and-steven-englund-the-inquisition-in-hollywood-politics-in-the-film-community-193`)
- Ron Chernow — *Washington: A Life* (`chernow-ron-washington-a-life`)
- Kate Connolly — *Angela Merkel Gives Germans a Hard Lesson in COVID Numbers* (`connolly-kate-angela-merkel-gives-germans-a-hard-lesson-in-covid-numbers`)
- Kate Connolly — *Germany Agonises over Merkel's Legacy: Did She Hand Too Much Power to Putin?* (`connolly-kate-germany-agonises-over-merkel-s-legacy-did-she-hand-too-much-power-to-putin`)
- Michael J de la Merced — *PepsiCo Tells Activist Investor Its Answer Is Still No* (`de-la-merced-michael-j-pepsico-tells-activist-investor-its-answer-is-still-no`)
- Stillman Drake — *Discoveries and Opinions of Galileo* (`drake-stillman-discoveries-and-opinions-of-galileo`)
- Erica Armstrong Dunbar — *Never Caught: The Washingtons' Relentless Pursuit of Their Runaway Slave, Ona Judge* (`dunbar-erica-armstrong-never-caught-the-washingtons-relentless-pursuit-of-their-runaway-slave-on`)
- Michael Eric Dyson — *I May Not Get There with You: The True Martin Luther King, Jr.* (`dyson-michael-eric-i-may-not-get-there-with-you-the-true-martin-luther-king-jr`)
- Joseph J Ellis — *His Excellency: George Washington* (`ellis-joseph-j-his-excellency-george-washington`)
- Annibale Fantoli — *Galileo: For Copernicanism and for the Church* (`fantoli-annibale-galileo-for-copernicanism-and-for-the-church`)
- Maurice A Finocchiaro — *The Galileo Affair: A Documentary History* (`finocchiaro-maurice-a-the-galileo-affair-a-documentary-history`)
- Galileo Galilei — *Dialogue Concerning the Two Chief World Systems* (`galilei-galileo-dialogue-concerning-the-two-chief-world-systems`)
- Galileo Galilei — *Sidereus Nuncius, or The Sidereal Messenger* (`galilei-galileo-sidereus-nuncius-or-the-sidereal-messenger`)
- David J Garrow — *Bearing the Cross: Martin Luther King, Jr., and the Southern Christian Leadership Conference* (`garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con`)
- David J Garrow — *The FBI and Martin Luther King, Jr.: From "Solo" to Memphis* (`garrow-david-j-the-fbi-and-martin-luther-king-jr-from-solo-to-memphis`)
- John L Heilbron — *Galileo* (`heilbron-john-l-galileo`)
- Fritz Hirschfeld — *George Washington and Slavery: A Documentary Portrayal* (`hirschfeld-fritz-george-washington-and-slavery-a-documentary-portrayal`)
- King, Martin Luther, Jr — *Beyond Vietnam: A Time to Break Silence* (`king-martin-luther-jr-beyond-vietnam-a-time-to-break-silence`)
- Louisa Lim — *The People's Republic of Amnesia: Tiananmen Revisited* (`lim-louisa-the-people-s-republic-of-amnesia-tiananmen-revisited`)
- Justin Yifu Lin — *The Household Responsibility System in China's Agricultural Reform* (`lin-justin-yifu-the-household-responsibility-system-in-china-s-agricultural-reform`)
- Mahmood Mamdani — *Amnesty or Impunity? A Preliminary Critique of the Report of the Truth and Reconciliation Commission of South Africa (TRC)* (`mamdani-mahmood-amnesty-or-impunity-a-preliminary-critique-of-the-report-of-the-truth-and-reconc`)
- Merritt, Anna C., Daniel A. Effron, and Benoît Monin — *Moral Self-Licensing: When Being Good Frees Us to Be Bad* (`merritt-anna-c-daniel-a-effron-and-beno-t-monin-moral-self-licensing-when-being-good-frees-us-to`)
- Victor S Navasky — *Naming Names* (`navasky-victor-s-naming-names`)
- Indra Nooyi — *My Life in Full: Work, Family, and Our Future* (`nooyi-indra-my-life-in-full-work-family-and-our-future`)
- George Packer — *The Quiet German* (`packer-george-the-quiet-german`)
- Anthony Sampson — *Mandela: The Authorized Biography* (`sampson-anthony-mandela-the-authorized-biography`)
- Ellen Schrecker — *Many Are the Crimes: McCarthyism in America* (`schrecker-ellen-many-are-the-crimes-mccarthyism-in-america`)
- Thomas P Slaughter — *The Whiskey Rebellion: Frontier Epilogue to the American Revolution* (`slaughter-thomas-p-the-whiskey-rebellion-frontier-epilogue-to-the-american-revolution`)
- Allister Sparks — *Tomorrow Is Another Country: The Inside Story of South Africa's Road to Change* (`sparks-allister-tomorrow-is-another-country-the-inside-story-of-south-africa-s-road-to-change`)
- Kevin Steffensen — *When Others Look to You: Companion Edition* (`steffensen-kevin-when-others-look-to-you-companion-edition`)
- Mary V Thompson — *"The Only Unavoidable Subject of Regret": George Washington, Slavery, and the Enslaved Community at Mount Vernon* (`thompson-mary-v-the-only-unavoidable-subject-of-regret-george-washington-slavery-and-the-enslave`)
- Ezra F Vogel — *Deng Xiaoping and the Transformation of China* (`vogel-ezra-f-deng-xiaoping-and-the-transformation-of-china`)
- Patti Waldmeir — *Anatomy of a Miracle: The End of Apartheid and the Birth of the New South Africa* (`waldmeir-patti-anatomy-of-a-miracle-the-end-of-apartheid-and-the-birth-of-the-new-south-africa`)
- George. Farewell Address. 19 September 1796 Washington — *(no title)* (`washington-george-farewell-address-19-september-1796`)
- Kate Xiao Zhou — *How the Farmers Changed China: Power of the People* (`zhou-kate-xiao-how-the-farmers-changed-china-power-of-the-people`)

### Exists but missing relatedBooks (3)

- `steffensen-kevin-how-meaning-moves` matches biblio `steffensen-kevin-how-meaning-moves` (exact_slug; current books: trust-beyond-similarity)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` matches biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug; current books: how-trust-forms, living-in-sediment, when-accountability-no-longer-expires, when-authority-outlives-accountability, when-interpretation-no-longer-matters, when-moral-seriousness-scales, when-others-look-to-you-v1, when-others-look-to-you-v2, when-trust-stops-tracking-reality)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` matches biblio `truth-and-reconciliation-commission-of-south-africa-report` (title_author_short; current books: when-accountability-no-longer-expires, when-authority-outlives-accountability, when-moral-seriousness-scales, when-others-look-to-you-v1)

### Stale relatedBooks (1)

- `steffensen-kevin-when-authority-outlives-accountability-a-lens-for` — Kevin Steffensen — When Authority Outlives Accountability: A Lens for

### Thinkers stale for this book (1)

- `kevin-steffensen` — Kevin Steffensen

### Biblio creators without thinker node (39)

- `allister-sparks` (Allister Sparks)
- `annibale-fantoli` (Annibale Fantoli)
- `anthony-sampson` (Anthony Sampson)
- `brownell-kelly-d-and-kenneth-e-warner` (Brownell, Kelly D., and Kenneth E. Warner)
- `ceplair-larry-and-steven-englund` (Ceplair, Larry, and Steven Englund)
- `craig-calhoun` (Craig Calhoun)
- `david-j-garrow` (David J Garrow)
- `eagly-alice-h-and-linda-l-carli` (Eagly, Alice H., and Linda L. Carli)
- `ellen-schrecker` (Ellen Schrecker)
- `erica-armstrong-dunbar` (Erica Armstrong Dunbar)
- `ezra-f-vogel` (Ezra F Vogel)
- `fritz-hirschfeld` (Fritz Hirschfeld)
- `galileo-galilei` (Galileo Galilei)
- `george-farewell-address-19-september-1796-washington` (George. Farewell Address. 19 September 1796 Washington)
- `george-packer` (George Packer)
- `indra-nooyi` (Indra Nooyi)
- `john-l-heilbron` (John L Heilbron)
- `joseph-j-ellis` (Joseph J Ellis)
- `justin-yifu-lin` (Justin Yifu Lin)
- `kate-connolly` (Kate Connolly)
- `kate-xiao-zhou` (Kate Xiao Zhou)
- `louisa-lim` (Louisa Lim)
- `mahmood-mamdani` (Mahmood Mamdani)
- `mark-blyth` (Mark Blyth)
- `mary-v-thompson` (Mary V Thompson)
- `maurice-a-finocchiaro` (Maurice A Finocchiaro)
- `merritt-anna-c-daniel-a-effron-and-beno-t-monin` (Merritt, Anna C., Daniel A. Effron, and Benoît Monin)
- `michael-eric-dyson` (Michael Eric Dyson)
- `michael-j-de-la-merced` (Michael J de la Merced)
- `patti-waldmeir` (Patti Waldmeir)
- `richard-j-blackwell` (Richard J Blackwell)
- `robin-alexander` (Robin Alexander)
- `ron-chernow` (Ron Chernow)
- `stillman-drake` (Stillman Drake)
- `taylor-branch` (Taylor Branch)
- `thomas-p-slaughter` (Thomas P Slaughter)
- `timothy-brook` (Timothy Brook)
- `truth-and-reconciliation-commission-of-south-africa` (Truth and Reconciliation Commission of South Africa)
- `victor-s-navasky` (Victor S Navasky)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-authority-outlives-accountability`

- Bibliography: `books/when-authority-outlives-accountability/back-matter/bibliography.md`
- Parse style: `list` (30 entries)
- Semantic linked sources: 30
- Parse warning: other styles also matched: plain_chicago=19

### Matched (30)

- `arendt-hannah-between-past-and-future` ← biblio `arendt-hannah-between-past-and-future` (exact_slug, score=100)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` (exact_slug, score=100)
- `arendt-hannah-on-violence` ← biblio `arendt-hannah-on-violence` (exact_slug, score=100)
- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `arendt-hannah-the-human-condition` ← biblio `arendt-hannah-the-human-condition` (exact_slug, score=100)
- `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` ← biblio `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` (exact_slug, score=100)
- `bauman-zygmunt-modernity-and-the-holocaust` ← biblio `bauman-zygmunt-modernity-and-the-holocaust` (exact_slug, score=100)
- `bowen-murray-family-therapy-in-clinical-practice` ← biblio `bowen-murray-family-therapy-in-clinical-practice` (exact_slug, score=100)
- `brown-bren-dare-to-lead-brave-work-tough-conversations-whole` ← biblio `brown-bren-dare-to-lead-brave-work-tough-conversations-whole` (exact_slug, score=100)
- `campbell-donald-t-assessing-the-impact-of-planned-social-change` ← biblio `campbell-donald-t-assessing-the-impact-of-planned-social-change` (exact_slug, score=100)
- `goodhart-charles-a-e-problems-of-monetary-management-the-u-k` ← biblio `goodhart-charles-a-e-problems-of-monetary-management-the-u-k` (exact_slug, score=100)
- `heifetz-ronald-a-leadership-without-easy-answers` ← biblio `heifetz-ronald-a-leadership-without-easy-answers` (exact_slug, score=100)
- `hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility` ← biblio `hirschman-albert-o-the-rhetoric-of-reaction-perversity-futility` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
- `march-james-g-and-johan-p-olsen-rediscovering-institutions-the` ← biblio `march-james-g-and-johan-p-olsen-rediscovering-institutions-the` (exact_slug, score=100)
- `maslach-christina-and-michael-p-leiter-the-truth-about-burnout` ← biblio `maslach-christina-and-michael-p-leiter-the-truth-about-burnout` (exact_slug, score=100)
- `michels-robert-political-parties-a-sociological-study-of-the` ← biblio `michels-robert-political-parties-a-sociological-study-of-the` (exact_slug, score=100)
- `milgram-stanley-obedience-to-authority-an-experimental-view` ← biblio `milgram-stanley-obedience-to-authority-an-experimental-view` (exact_slug, score=100)
- `ross-lee-the-intuitive-psychologist-and-his-shortcomings` ← biblio `ross-lee-the-intuitive-psychologist-and-his-shortcomings` (exact_slug, score=100)
- `schein-edgar-h-organizational-culture-and-leadership` ← biblio `schein-edgar-h-organizational-culture-and-leadership` (exact_slug, score=100)
- `shay-jonathan-achilles-in-vietnam-combat-trauma-and-the-undoing` ← biblio `shay-jonathan-achilles-in-vietnam-combat-trauma-and-the-undoing` (exact_slug, score=100)
- `substance-abuse-and-mental-health-services-administration-samhsa-s` ← biblio `substance-abuse-and-mental-health-services-administration-samhsa-s` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `weber-max-politics-as-a-vocation` ← biblio `weber-max-politics-as-a-vocation` (exact_slug, score=100)
- `zimbardo-philip-the-lucifer-effect-understanding-how-good-people` ← biblio `zimbardo-philip-the-lucifer-effect-understanding-how-good-people` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author, score=85)
- `fukuyama-francis-trust-the-social-virtues-and-the-creation-of-prosperity` ← biblio `fukuyama-francis-trust-the-social-virtues-and-the-creation-of` (title_author, score=85)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline` (title_author, score=85)
- `selznick-philip-leadership-in-administration-a-sociological-interpretation` ← biblio `selznick-philip-leadership-in-administration-a-sociological` (title_author, score=85)
- `tetlock-philip-e-expert-political-judgment-how-good-is-it-how-can-we-know` ← biblio `tetlock-philip-e-expert-political-judgment-how-good-is-it-how-can` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (4)

- `baron-jonathan-and-john-c-hershey` (Baron, Jonathan, and John C. Hershey)
- `bren-brown` (Brené Brown)
- `march-james-g-and-johan-p-olsen` (March, James G., and Johan P. Olsen)
- `maslach-christina-and-michael-p-leiter` (Maslach, Christina, and Michael P. Leiter)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-incentives-become-the-moral-language`

- Bibliography: `books/when-incentives-become-the-moral-language/back-matter/bibliography.md`
- Parse style: `plain_chicago` (51 entries)
- Semantic linked sources: 5

### Matched (5)

- `centers-for-medicare-medicaid-services-hospital-readmissions` ← biblio `centers-for-medicare-medicaid-services-hospital-readmissions-reduction-program-hrrp` (title_author, score=85)
- `national-academy-of-medicine-taking-action-against-clinician` ← biblio `national-academy-of-medicine-taking-action-against-clinician-burnout-a-systems-approach-to-profe` (title_author, score=85)
- `talbot-s-g-and-w-dean-physicians-aren-t-burning-out-they-re` ← biblio `talbot-s-g-and-w-dean-physicians-aren-t-burning-out-they-re-suffering-from-moral-injury` (title_author, score=85)
- `united-nations-framework-convention-on-climate-change-paris` ← biblio `united-nations-framework-convention-on-climate-change-paris-agreement` (title_author, score=85)
- `world-bank-state-and-trends-of-carbon-pricing` ← biblio `world-bank-state-and-trends-of-carbon-pricing-2024` (title_jaccard, score=65)

### Missing in semantic (42)

- American College of Emergency Physicians — *Boarding* (`american-college-of-emergency-physicians-boarding`)
- Centers for Medicare & Medicaid Services — *MS-DRG Classifications and Software* (`centers-for-medicare-medicaid-services-ms-drg-classifications-and-software`)
- Institute of Medicine — *Hospital-Based Emergency Care: At the Breaking Point* (`institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point`)
- Haugen, Frances. Testimony and disclosures regarding Facebook internal research on engagement-based ranking. U.S. Senate Commerce Subcommittee on Consumer Protection, October 5, 2021 — *(no title)* (`haugen-frances-testimony-and-disclosures-regarding-facebook-internal-research-on-engagement-base`)
- Horwitz, Jeff, and Deepa Seetharaman — *Facebook Executives Shut Down Efforts to Make the Site Less Divisive* (`horwitz-jeff-and-deepa-seetharaman-facebook-executives-shut-down-efforts-to-make-the-site-less-d`)
- Pichai, Sundar. Testimony before the U.S. House Judiciary Committee, December 11, 2018 — *(no title)* (`pichai-sundar-testimony-before-the-u-s-house-judiciary-committee-december-11-2018`)
- Zuckerberg, Mark. Testimony before the U.S. Senate Judiciary and Commerce Committees, April 10-11, 2018 — *(no title)* (`zuckerberg-mark-testimony-before-the-u-s-senate-judiciary-and-commerce-committees-april-10-11-20`)
- Eugene Garfield — *The History and Meaning of the Impact Factor* (`garfield-eugene-the-history-and-meaning-of-the-impact-factor`)
- Jorge E Hirsch — *An Index to Quantify an Individual's Scientific Research Output* (`hirsch-jorge-e-an-index-to-quantify-an-individual-s-scientific-research-output`)
- National Science Foundation — *Proposal & Award Policies & Procedures Guide* (`national-science-foundation-proposal-award-policies-procedures-guide`)
- San Francisco Declaration on Research Assessment (DORA). 2012. https://sfdora.org/ — *(no title)* (`san-francisco-declaration-on-research-assessment-dora-2012-https-sfdora-org`)
- Mark Monmonier — *How to Lie with Maps* (`monmonier-mark-how-to-lie-with-maps`)
- U.S. Environmental Protection Agency — *Notice of Violation: Volkswagen Clean Diesel Vehicles* (`u-s-environmental-protection-agency-notice-of-violation-volkswagen-clean-diesel-vehicles`)
- European Financial Reporting Advisory Group (EFRAG). European Sustainability Reporting Standards (ESRS). 2023. https://www.efrag.org/ — *(no title)* (`european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-es`)
- Integrity Council for the Voluntary Carbon Market — *Core Carbon Principles* (`integrity-council-for-the-voluntary-carbon-market-core-carbon-principles`)
- International Sustainability Standards Board (ISSB). IFRS S1 *General Requirements for Disclosure of Sustainability-related Financial Information* and S2 *Climate-related Disclosures*. 2023. https://www.ifrs.org/ — *(no title)* (`international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of`)
- Science Based Targets initiative — *Corporate Net-Zero Standard* (`science-based-targets-initiative-corporate-net-zero-standard`)
- Voluntary Carbon Markets Integrity Initiative — *Claims Code of Practice* (`voluntary-carbon-markets-integrity-initiative-claims-code-of-practice`)
- Cappelli, Peter, and Anna Tavis — *The Performance Management Revolution* (`cappelli-peter-and-anna-tavis-the-performance-management-revolution`)
- Jerald Greenberg — *Organizational Justice: Yesterday, Today, and Tomorrow* (`greenberg-jerald-organizational-justice-yesterday-today-and-tomorrow`)
- Worker Adjustment and Retraining Notification Act, 29 U.S.C. §§ 2101-2109 — *(no title)* (`worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109`)
- Knight Foundation and Gallup — *American Views: Trust, Media and Democracy* (`knight-foundation-and-gallup-american-views-trust-media-and-democracy`)
- Pew Research Center — *How Pew Research Center Conducts Surveys in the United States* (`pew-research-center-how-pew-research-center-conducts-surveys-in-the-united-states`)
- Reuters Institute for the Study of Journalism — *Digital News Report 2024* (`reuters-institute-for-the-study-of-journalism-digital-news-report-2024`)
- Jonathan Cohn — *The Ten Year War: Obamacare and the Unmaking of American Establishment* (`cohn-jonathan-the-ten-year-war-obamacare-and-the-unmaking-of-american-establishment`)
- Congressional Record. 111th Congress. Debate on Affordable Care Act and public-option provisions, 2009-2010 — *(no title)* (`congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions-2`)
- Federal Election Commission. Campaign finance disclosure data. https://www.fec.gov/ — *(no title)* (`federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov`)
- Center for Responsive Politics (OpenSecrets). Fundraising totals and donor reporting. https://www.opensecrets.org/ — *(no title)* (`center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-open`)
- Eitan Hersh — *Politics Is for Power* (`hersh-eitan-politics-is-for-power`)
- Pew Research Center — *A Guide to Pew Research Center's Methodology* (`pew-research-center-a-guide-to-pew-research-center-s-methodology`)
- Pew Research Center — *Public Trust in Government: 1958-2024* (`pew-research-center-public-trust-in-government-1958-2024`)
- Every Student Succeeds Act of 2015, Pub. L. No. 114-95, §§ 1111-1112 — *(no title)* (`every-student-succeeds-act-of-2015-pub-l-no-114-95-1111-1112`)
- Grissom, Jason A., et al — *Teacher Stress and Health: Effects on Teachers, Students, and Schools* (`grissom-jason-a-et-al-teacher-stress-and-health-effects-on-teachers-students-and-schools`)
- Learning Policy Institute — *Teacher Shortages and Turnover in the United States* (`learning-policy-institute-teacher-shortages-and-turnover-in-the-united-states`)
- National Center for Education Statistics — *Adjusted Cohort Graduation Rate (ACGR)* (`national-center-for-education-statistics-adjusted-cohort-graduation-rate-acgr`)
- Organisation for Economic Co-operation and Development — *PISA 2022 Results* (`organisation-for-economic-co-operation-and-development-pisa-2022-results`)
- Jerald Greenberg — *Organizational Justice: Yesterday, Today, and Tomorrow* (`greenberg-jerald-organizational-justice-yesterday-today-and-tomorrow-2`)
- National Academy of Medicine — *Taking Action Against Clinician Burnout: A Systems Approach to Professional Well-Being* (`national-academy-of-medicine-taking-action-against-clinician-burnout-a-systems-approach-to-profe-2`)
- Andrew Jameton — *Nursing Practice: The Ethical Issues* (`jameton-andrew-nursing-practice-the-ethical-issues`)
- Cynda Hylton Rushton — *Moral Distress and Moral Resilience* (`rushton-cynda-hylton-moral-distress-and-moral-resilience`)
- Donald T Campbell — *Assessing the Impact of Planned Social Change* (`campbell-donald-t-assessing-the-impact-of-planned-social-change-2`)
- Mark Monmonier — *How to Lie with Maps* (`monmonier-mark-how-to-lie-with-maps-2`)

### Exists but missing relatedBooks (4)

- `campbell-donald-t-assessing-the-impact-of-planned-social-change` matches biblio `campbell-donald-t-assessing-the-impact-of-planned-social-change` (exact_slug; current books: when-authority-outlives-accountability)
- `ioannidis-john-p-a-why-most-published-research-findings-are-false` matches biblio `ioannidis-john-p-a-why-most-published-research-findings-are-false` (exact_slug; current books: what-we-cannot-see)
- `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` matches biblio `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` (exact_slug; current books: what-we-cannot-see)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` matches biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug; current books: after-certainty, how-serious-systems-learn, how-trust-forms, living-in-sediment, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (34)

- `american-college-of-emergency-physicians` (American College of Emergency Physicians)
- `andrew-jameton` (Andrew Jameton)
- `cappelli-peter-and-anna-tavis` (Cappelli, Peter, and Anna Tavis)
- `center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-opensecrets-org` (Center for Responsive Politics (OpenSecrets). Fundraising totals and donor reporting. https://www.opensecrets.org/)
- `congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions-2009-2010` (Congressional Record. 111th Congress. Debate on Affordable Care Act and public-option provisions, 2009-2010)
- `cynda-hylton-rushton` (Cynda Hylton Rushton)
- `eitan-hersh` (Eitan Hersh)
- `eugene-garfield` (Eugene Garfield)
- `european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-esrs-2023-https-www-efrag-org` (European Financial Reporting Advisory Group (EFRAG). European Sustainability Reporting Standards (ESRS). 2023. https://www.efrag.org/)
- `every-student-succeeds-act-of-2015-pub-l-no-114-95-1111-1112` (Every Student Succeeds Act of 2015, Pub. L. No. 114-95, §§ 1111-1112)
- `federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov` (Federal Election Commission. Campaign finance disclosure data. https://www.fec.gov/)
- `grissom-jason-a-et-al` (Grissom, Jason A., et al)
- `haugen-frances-testimony-and-disclosures-regarding-facebook-internal-research-on-engagement-based-ranking-u-s-senate-commerce-subcommittee-on-consumer-protection-october-5-2021` (Haugen, Frances. Testimony and disclosures regarding Facebook internal research on engagement-based ranking. U.S. Senate Commerce Subcommittee on Consumer Protection, October 5, 2021)
- `horwitz-jeff-and-deepa-seetharaman` (Horwitz, Jeff, and Deepa Seetharaman)
- `integrity-council-for-the-voluntary-carbon-market` (Integrity Council for the Voluntary Carbon Market)
- `international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of-sustainability-related-financial-information-and-s2-climate-related-disclosures-2023-https-www-ifrs-org` (International Sustainability Standards Board (ISSB). IFRS S1 *General Requirements for Disclosure of Sustainability-related Financial Information* and S2 *Climate-related Disclosures*. 2023. https://www.ifrs.org/)
- `jerald-greenberg` (Jerald Greenberg)
- `jonathan-cohn` (Jonathan Cohn)
- `jorge-e-hirsch` (Jorge E Hirsch)
- `knight-foundation-and-gallup` (Knight Foundation and Gallup)
- `learning-policy-institute` (Learning Policy Institute)
- `mark-monmonier` (Mark Monmonier)
- `national-center-for-education-statistics` (National Center for Education Statistics)
- `national-science-foundation` (National Science Foundation)
- `organisation-for-economic-co-operation-and-development` (Organisation for Economic Co-operation and Development)
- `pichai-sundar-testimony-before-the-u-s-house-judiciary-committee-december-11-2018` (Pichai, Sundar. Testimony before the U.S. House Judiciary Committee, December 11, 2018)
- `reuters-institute-for-the-study-of-journalism` (Reuters Institute for the Study of Journalism)
- `san-francisco-declaration-on-research-assessment-dora-2012-https-sfdora-org` (San Francisco Declaration on Research Assessment (DORA). 2012. https://sfdora.org/)
- `science-based-targets-initiative` (Science Based Targets initiative)
- `talbot-s-g-and-w-dean` (Talbot, S. G., and W. Dean)
- `u-s-environmental-protection-agency` (U.S. Environmental Protection Agency)
- `voluntary-carbon-markets-integrity-initiative` (Voluntary Carbon Markets Integrity Initiative)
- `worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109` (Worker Adjustment and Retraining Notification Act, 29 U.S.C. §§ 2101-2109)
- `zuckerberg-mark-testimony-before-the-u-s-senate-judiciary-and-commerce-committees-april-10-11-2018` (Zuckerberg, Mark. Testimony before the U.S. Senate Judiciary and Commerce Committees, April 10-11, 2018)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-interpretation-no-longer-matters`

- Bibliography: `books/when-interpretation-no-longer-matters/back-matter/bibliography.md`
- Parse style: `list` (54 entries)
- Semantic linked sources: 50
- Parse warning: other styles also matched: plain_chicago=1

### Matched (50)

- `arendt-hannah-the-origins-of-totalitarianism` ← biblio `arendt-hannah-the-origins-of-totalitarianism` (exact_slug, score=100)
- `barker-eileen-the-making-of-a-moonie-choice-or-brainwashing` ← biblio `barker-eileen-the-making-of-a-moonie-choice-or-brainwashing` (exact_slug, score=100)
- `berlin-isaiah-the-hedgehog-and-the-fox` ← biblio `berlin-isaiah-the-hedgehog-and-the-fox` (exact_slug, score=100)
- `brown-eliot-and-maureen-farrell-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusio` ← biblio `brown-eliot-and-maureen-farrell-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusio` (exact_slug, score=100)
- `bushman-richard-lyman-joseph-smith-rough-stone-rolling` ← biblio `bushman-richard-lyman-joseph-smith-rough-stone-rolling` (exact_slug, score=100)
- `chandler-david-p-voices-from-s-21-terror-and-history-in-pol-pot-s-secret-prison` ← biblio `chandler-david-p-voices-from-s-21-terror-and-history-in-pol-pot-s-secret-prison` (exact_slug, score=100)
- `chryssides-george-d-the-advent-of-sun-myung-moon-the-origins-beliefs-and-practices-of-the-unific` ← biblio `chryssides-george-d-the-advent-of-sun-myung-moon-the-origins-beliefs-and-practices-of-the-unific` (exact_slug, score=100)
- `corrales-javier-and-michael-penfold-dragon-in-the-tropics-hugo-ch-vez-and-the-political-economy` ← biblio `corrales-javier-and-michael-penfold-dragon-in-the-tropics-hugo-ch-vez-and-the-political-economy` (exact_slug, score=100)
- `dik-tter-frank-the-cultural-revolution-a-people-s-history-1962-1976` ← biblio `dik-tter-frank-the-cultural-revolution-a-people-s-history-1962-1976` (exact_slug, score=100)
- `ellul-jacques-propaganda-the-formation-of-men-s-attitudes` ← biblio `ellul-jacques-propaganda-the-formation-of-men-s-attitudes` (exact_slug, score=100)
- `escud-carlos-argentine-political-culture` ← biblio `escud-carlos-argentine-political-culture` (exact_slug, score=100)
- `festinger-leon-henry-w-riecken-and-stanley-schachter-when-prophecy-fails` ← biblio `festinger-leon-henry-w-riecken-and-stanley-schachter-when-prophecy-fails` (exact_slug, score=100)
- `figes-orlando-the-whisperers-private-life-in-stalin-s-russia` ← biblio `figes-orlando-the-whisperers-private-life-in-stalin-s-russia` (exact_slug, score=100)
- `fitzpatrick-sheila-everyday-stalinism-ordinary-life-in-extraordinary-times` ← biblio `fitzpatrick-sheila-everyday-stalinism-ordinary-life-in-extraordinary-times` (exact_slug, score=100)
- `foucault-michel-discipline-and-punish-the-birth-of-the-prison` ← biblio `foucault-michel-discipline-and-punish-the-birth-of-the-prison` (exact_slug, score=100)
- `foucault-michel-power-knowledge-selected-interviews-and-other-writings-1972-1977` ← biblio `foucault-michel-power-knowledge-selected-interviews-and-other-writings-1972-1977` (exact_slug, score=100)
- `foucault-michel-society-must-be-defended-lectures-at-the-coll-ge-de-france-1975-76` ← biblio `foucault-michel-society-must-be-defended-lectures-at-the-coll-ge-de-france-1975-76` (exact_slug, score=100)
- `givens-terryl-l-by-the-hand-of-mormon` ← biblio `givens-terryl-l-by-the-hand-of-mormon` (exact_slug, score=100)
- `gott-richard-hugo-ch-vez-and-the-bolivarian-revolution` ← biblio `gott-richard-hugo-ch-vez-and-the-bolivarian-revolution` (exact_slug, score=100)
- `haberman-maggie-confidence-man-the-making-of-donald-trump-and-the-breaking-of-america` ← biblio `haberman-maggie-confidence-man-the-making-of-donald-trump-and-the-breaking-of-america` (exact_slug, score=100)
- `habermas-j-rgen-the-theory-of-communicative-action` ← biblio `habermas-j-rgen-the-theory-of-communicative-action` (exact_slug, score=100)
- `hawkins-kirk-a-venezuela-s-chavismo-and-populism-in-comparative-perspective` ← biblio `hawkins-kirk-a-venezuela-s-chavismo-and-populism-in-comparative-perspective` (exact_slug, score=100)
- `kershaw-ian-hitler-1889-1936-hubris` ← biblio `kershaw-ian-hitler-1889-1936-hubris` (exact_slug, score=100)
- `kiernan-ben-the-pol-pot-regime-race-power-and-genocide-in-cambodia-under-the-khmer-rouge-1975-79` ← biblio `kiernan-ben-the-pol-pot-regime-race-power-and-genocide-in-cambodia-under-the-khmer-rouge-1975-79` (exact_slug, score=100)
- `klein-ezra-why-we-re-polarized` ← biblio `klein-ezra-why-we-re-polarized` (exact_slug, score=100)
- `klemperer-victor-i-will-bear-witness-a-diary-of-the-nazi-years-1933-1941` ← biblio `klemperer-victor-i-will-bear-witness-a-diary-of-the-nazi-years-1933-1941` (exact_slug, score=100)
- `kotkin-stephen-stalin-paradoxes-of-power-1878-1928` ← biblio `kotkin-stephen-stalin-paradoxes-of-power-1878-1928` (exact_slug, score=100)
- `kuran-timur-private-truths-public-lies-the-social-consequences-of-preference-falsification` ← biblio `kuran-timur-private-truths-public-lies-the-social-consequences-of-preference-falsification` (exact_slug, score=100)
- `laclau-ernesto-on-populist-reason` ← biblio `laclau-ernesto-on-populist-reason` (exact_slug, score=100)
- `macfarquhar-roderick-and-michael-schoenhals-mao-s-last-revolution` ← biblio `macfarquhar-roderick-and-michael-schoenhals-mao-s-last-revolution` (exact_slug, score=100)
- `mouffe-chantal-the-democratic-paradox` ← biblio `mouffe-chantal-the-democratic-paradox` (exact_slug, score=100)
- `page-joseph-a-per-n-a-biography` ← biblio `page-joseph-a-per-n-a-biography` (exact_slug, score=100)
- `parker-ashley-and-michael-scherer-donald-trump-and-his-assault-on-truth` ← biblio `parker-ashley-and-michael-scherer-donald-trump-and-his-assault-on-truth` (exact_slug, score=100)
- `popper-karl-the-open-society-and-its-enemies` ← biblio `popper-karl-the-open-society-and-its-enemies` (exact_slug, score=100)
- `postman-neil-amusing-ourselves-to-death` ← biblio `postman-neil-amusing-ourselves-to-death` (exact_slug, score=100)
- `reiterman-tim-raven-the-untold-story-of-the-rev-jim-jones` ← biblio `reiterman-tim-raven-the-untold-story-of-the-rev-jim-jones` (exact_slug, score=100)
- `schmitt-carl-the-concept-of-the-political` ← biblio `schmitt-carl-the-concept-of-the-political` (exact_slug, score=100)
- `shipps-jan-mormonism-the-story-of-a-new-religious-tradition` ← biblio `shipps-jan-mormonism-the-story-of-a-new-religious-tradition` (exact_slug, score=100)
- `shklar-judith-ordinary-vices` ← biblio `shklar-judith-ordinary-vices` (exact_slug, score=100)
- `steffensen-kevin-when-authority-is-misread` ← biblio `steffensen-kevin-when-authority-is-misread` (exact_slug, score=100)
- `tabor-james-d-and-eugene-v-gallagher-why-waco-cults-and-the-battle-for-religious-freedom-in-amer` ← biblio `tabor-james-d-and-eugene-v-gallagher-why-waco-cults-and-the-battle-for-religious-freedom-in-amer` (exact_slug, score=100)
- `the-church-of-jesus-christ-of-latter-day-saints-pearl-of-great-price` ← biblio `the-church-of-jesus-christ-of-latter-day-saints-pearl-of-great-price` (exact_slug, score=100)
- `woodward-bob-fear-trump-in-the-white-house` ← biblio `woodward-bob-fear-trump-in-the-white-house` (exact_slug, score=100)
- `wright-stuart-a-ed-armageddon-in-waco-critical-perspectives-on-the-branch-davidian-conflict` ← biblio `wright-stuart-a-ed-armageddon-in-waco-critical-perspectives-on-the-branch-davidian-conflict` (exact_slug, score=100)
- `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality-a-treatise-in-the-sociolog` ← biblio `berger-peter-l-and-thomas-luckmann-the-social-construction-of-reality` (title_author, score=85)
- `havel-vaclav-the-power-of-the-powerless` ← biblio `havel-v-clav-the-power-of-the-powerless` (title_author, score=85)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty` (title_author, score=85)
- `steffensen-kevin-when-authority-outlives-accountability-a-lens-for` ← biblio `steffensen-kevin-when-authority-outlives-accountability` (title_author, score=85)
- `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` ← biblio `sunstein-cass-r-republic` (title_author, score=85)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (4)

- `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` matches biblio `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` (exact_slug; current books: when-trust-stops-tracking-reality)
- `goffman-erving-the-presentation-of-self-in-everyday-life` matches biblio `goffman-erving-the-presentation-of-self-in-everyday-life` (exact_slug; current books: how-trust-forms)
- `kuhn-thomas-s-the-structure-of-scientific-revolutions` matches biblio `kuhn-thomas-s-the-structure-of-scientific-revolutions` (exact_slug; current books: learning-to-see, trust-beyond-similarity)
- `steffensen-kevin-how-meaning-moves` matches biblio `steffensen-kevin-how-meaning-moves` (exact_slug; current books: trust-beyond-similarity)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (12)

- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)
- `brown-eliot-and-maureen-farrell` (Brown, Eliot, and Maureen Farrell)
- `carlos-escud` (Carlos Escudé)
- `corrales-javier-and-michael-penfold` (Corrales, Javier, and Michael Penfold)
- `festinger-leon-henry-w-riecken-and-stanley-schachter` (Festinger, Leon, Henry W. Riecken, and Stanley Schachter)
- `frank-dik-tter` (Frank Dikötter)
- `j-rgen-habermas` (Jürgen Habermas)
- `karl-popper` (Karl Popper)
- `macfarquhar-roderick-and-michael-schoenhals` (MacFarquhar, Roderick, and Michael Schoenhals)
- `parker-ashley-and-michael-scherer` (Parker, Ashley, and Michael Scherer)
- `tabor-james-d-and-eugene-v-gallagher` (Tabor, James D., and Eugene V. Gallagher)
- `v-clav-havel` (Václav Havel)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-moral-seriousness-scales`

- Bibliography: `books/when-moral-seriousness-scales/back-matter/bibliography.md`
- Parse style: `list` (22 entries)
- Semantic linked sources: 22
- Parse warning: other styles also matched: plain_chicago=10

### Matched (22)

- `arendt-hannah-between-past-and-future` ← biblio `arendt-hannah-between-past-and-future` (exact_slug, score=100)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` (exact_slug, score=100)
- `arendt-hannah-on-revolution` ← biblio `arendt-hannah-on-revolution` (exact_slug, score=100)
- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `arendt-hannah-the-life-of-the-mind` ← biblio `arendt-hannah-the-life-of-the-mind` (exact_slug, score=100)
- `bowen-murray-family-therapy-in-clinical-practice` ← biblio `bowen-murray-family-therapy-in-clinical-practice` (exact_slug, score=100)
- `dahl-robert-a-polyarchy-participation-and-opposition` ← biblio `dahl-robert-a-polyarchy-participation-and-opposition` (exact_slug, score=100)
- `heifetz-ronald-a-leadership-without-easy-answers` ← biblio `heifetz-ronald-a-leadership-without-easy-answers` (exact_slug, score=100)
- `jervis-robert-perception-and-misperception-in-international` ← biblio `jervis-robert-perception-and-misperception-in-international` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
- `march-james-g-and-herbert-a-simon-organizations` ← biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug, score=100)
- `march-james-g-and-johan-p-olsen-rediscovering-institutions-the` ← biblio `march-james-g-and-johan-p-olsen-rediscovering-institutions-the` (exact_slug, score=100)
- `merton-robert-k-bureaucratic-structure-and-personality` ← biblio `merton-robert-k-bureaucratic-structure-and-personality` (exact_slug, score=100)
- `olson-mancur-the-logic-of-collective-action-public-goods-and-the` ← biblio `olson-mancur-the-logic-of-collective-action-public-goods-and-the` (exact_slug, score=100)
- `rosa-hartmut-social-acceleration-a-new-theory-of-modernity` ← biblio `rosa-hartmut-social-acceleration-a-new-theory-of-modernity` (exact_slug, score=100)
- `schein-edgar-h-organizational-culture-and-leadership` ← biblio `schein-edgar-h-organizational-culture-and-leadership` (exact_slug, score=100)
- `schelling-thomas-c-the-strategy-of-conflict` ← biblio `schelling-thomas-c-the-strategy-of-conflict` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author, score=85)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline` (title_author, score=85)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` ← biblio `perrow-charles-normal-accidents-living-with-high-risk` (title_author, score=85)
- `selznick-philip-leadership-in-administration-a-sociological-interpretation` ← biblio `selznick-philip-leadership-in-administration-a-sociological` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (2)

- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)
- `march-james-g-and-johan-p-olsen` (March, James G., and Johan P. Olsen)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-others-become-leaders`

- Bibliography: `books/when-others-become-leaders/back-matter/bibliography.md`
- Parse style: `list` (53 entries)
- Semantic linked sources: 0

### Matched (0)

_None._

### Missing in semantic (51)

- B. R Ambedkar — *What Congress and Gandhi Have Done to the Untouchables* (`ambedkar-b-r-what-congress-and-gandhi-have-done-to-the-untouchables`)
- Charter 77. Founding declaration. 1977. Václav Havel Library — *(no title)* (`charter-77-founding-declaration-1977-v-clav-havel-library`)
- Fred Rogers Productions. Episode archives; Television Hall of Fame materials (Jeff Erlanger appearances) — *(no title)* (`fred-rogers-productions-episode-archives-television-hall-of-fame-materials-jeff-erlanger-appeara`)
- Mohandas K. Letter to Lord Irwin. 2 March 1930. In *The Collected Works of Mahatma Gandhi* Gandhi — *(no title)* (`gandhi-mohandas-k-letter-to-lord-irwin-2-march-1930-in-the-collected-works-of-mahatma-gandhi`)
- Government of South Africa. Truth and Reconciliation Commission — *Final Report* (`government-of-south-africa-truth-and-reconciliation-commission-final-report`)
- Martin Luther Jr King — *Beyond Vietnam* (`king-martin-luther-jr-beyond-vietnam`)
- Library of Congress. Bayard Rustin Papers. March on Washington planning materials — *(no title)* (`library-of-congress-bayard-rustin-papers-march-on-washington-planning-materials`)
- Nelson Mandela — *Long Walk to Freedom* (`mandela-nelson-long-walk-to-freedom`)
- Mandela, Nelson. Statement from the dock, Rivonia Trial. 20 April 1964 — *(no title)* (`mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964`)
- National Archives (U.S.). Official demands, March on Washington for Jobs and Freedom. 1963 — *(no title)* (`national-archives-u-s-official-demands-march-on-washington-for-jobs-and-freedom-1963`)
- Residents of Hull-House — *Hull-House Maps and Papers* (`residents-of-hull-house-hull-house-maps-and-papers`)
- South African History Online — *South Africa's first democratic elections, 27 April 1994* (`south-african-history-online-south-africa-s-first-democratic-elections-27-april-1994`)
- U.S. Senate Subcommittee on Communications. Hearings on the Public Broadcasting Act. May 1969 — *(no title)* (`u-s-senate-subcommittee-on-communications-hearings-on-the-public-broadcasting-act-may-1969`)
- Webb Miller. Dispatches from Dharasana Salt Works raid. May 1930 — *(no title)* (`webb-miller-dispatches-from-dharasana-salt-works-raid-may-1930`)
- Jane Addams — *Twenty Years at Hull-House* (`addams-jane-twenty-years-at-hull-house`)
- Taylor Branch — *Parting the Waters: America in the King Years, 1954-63* (`branch-taylor-parting-the-waters-america-in-the-king-years-1954-63`)
- Judith M Brown — *Gandhi: Prisoner of Hope* (`brown-judith-m-gandhi-prisoner-of-hope`)
- Judith M Brown — *Gandhi's Rise to Power: Indian Politics, 1915-1922* (`brown-judith-m-gandhi-s-rise-to-power-indian-politics-1915-1922`)
- John Carlin — *Playing the Enemy: Nelson Mandela and the Game That Made a Nation* (`carlin-john-playing-the-enemy-nelson-mandela-and-the-game-that-made-a-nation`)
- Clemmons, François, with Tim Madigan — *Officer Clemmons* (`clemmons-fran-ois-with-tim-madigan-officer-clemmons`)
- Dennis Dalton — *Mahatma Gandhi: Nonviolent Power in Action* (`dalton-dennis-mahatma-gandhi-nonviolent-power-in-action`)
- Desai, Ashwin, and Goolam Vahed — *The South African Gandhi: Stretcher-Bearer of Empire* (`desai-ashwin-and-goolam-vahed-the-south-african-gandhi-stretcher-bearer-of-empire`)
- Geraldine Forbes — *Women in Modern India* (`forbes-geraldine-women-in-modern-india`)
- David J Garrow — *Bearing the Cross: Martin Luther King Jr. and the Southern Christian Leadership Conference* (`garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con`)
- Timothy Garton Ash — *The Magic Lantern: The Revolution of '89 Witnessed in Warsaw, Budapest, Berlin, and Prague* (`garton-ash-timothy-the-magic-lantern-the-revolution-of-89-witnessed-in-warsaw-budapest-berlin-an`)
- Ramachandra Guha — *Gandhi Before India* (`guha-ramachandra-gandhi-before-india`)
- Ramachandra Guha — *Gandhi: The Years That Changed the World, 1914-1948* (`guha-ramachandra-gandhi-the-years-that-changed-the-world-1914-1948`)
- Michael K Honey — *Going Down Jericho Road: The Memphis Strike, Martin Luther King's Last Campaign* (`honey-michael-k-going-down-jericho-road-the-memphis-strike-martin-luther-king-s-last-campaign`)
- William P Jones — *The March on Washington: Jobs, Freedom, and the Forgotten History of Civil Rights* (`jones-william-p-the-march-on-washington-jobs-freedom-and-the-forgotten-history-of-civil-rights`)
- Amy-Jill Levine — *Short Stories by Jesus: The Enigmatic Parables of a Controversial Rabbi* (`levine-amy-jill-short-stories-by-jesus-the-enigmatic-parables-of-a-controversial-rabbi`)
- Lewis, John, with Michael D'Orso — *Walking with the Wind: A Memoir of the Movement* (`lewis-john-with-michael-d-orso-walking-with-the-wind-a-memoir-of-the-movement`)
- Wangari Maathai — *Unbowed: A Memoir* (`maathai-wangari-unbowed-a-memoir`)
- Diane McWhorter — *Carry Me Home: Birmingham, Alabama, the Climactic Battle of the Civil Rights Revolution* (`mcwhorter-diane-carry-me-home-birmingham-alabama-the-climactic-battle-of-the-civil-rights-revolu`)
- John P Meier — *A Marginal Jew: Rethinking the Historical Jesus* (`meier-john-p-a-marginal-jew-rethinking-the-historical-jesus`)
- Wayne A Meeks — *The First Urban Christians* (`meeks-wayne-a-the-first-urban-christians`)
- Aldon D Morris — *The Origins of the Civil Rights Movement: Black Communities Organizing for Change* (`morris-aldon-d-the-origins-of-the-civil-rights-movement-black-communities-organizing-for-change`)
- B. R Nanda — *Mahatma Gandhi: A Biography* (`nanda-b-r-mahatma-gandhi-a-biography`)
- Nobel Prize — *The Nobel Peace Prize 2004 - Wangari Maathai* (`nobel-prize-the-nobel-peace-prize-2004-wangari-maathai`)
- Anupama Rao — *The Caste Question: Dalits and the Politics of Modern India* (`rao-anupama-the-caste-question-dalits-and-the-politics-of-modern-india`)
- Barbara Ransby — *Ella Baker and the Black Freedom Movement: A Radical Democratic Vision* (`ransby-barbara-ella-baker-and-the-black-freedom-movement-a-radical-democratic-vision`)
- Jo Ann Gibson Robinson — *The Montgomery Bus Boycott and the Women Who Started It* (`robinson-jo-ann-gibson-the-montgomery-bus-boycott-and-the-women-who-started-it`)
- E. P Sanders — *The Historical Figure of Jesus* (`sanders-e-p-the-historical-figure-of-jesus`)
- Dennis E Smith — *From Symposium to Eucharist: The Banquet in the Early Christian World* (`smith-dennis-e-from-symposium-to-eucharist-the-banquet-in-the-early-christian-world`)
- Desmond Tutu — *No Future Without Forgiveness* (`tutu-desmond-no-future-without-forgiveness`)
- N. T Wright — *Jesus and the Victory of God* (`wright-n-t-jesus-and-the-victory-of-god`)
- Associated Press — *Taylor Swift Donates to Food Banks on Eras Tour, Providing Thousands of Meals* (`associated-press-taylor-swift-donates-to-food-banks-on-eras-tour-providing-thousands-of-meals`)
- Chloe Melas — *Taylor Swift Gave Eras Tour Crew $197 Million in Bonuses (Exclusive)* (`melas-chloe-taylor-swift-gave-eras-tour-crew-197-million-in-bonuses-exclusive`)
- Chloe Melas — *Taylor Swift Gives 'Life-Changing' $100,000 Bonuses to Eras Tour Truck Drivers* (`melas-chloe-taylor-swift-gives-life-changing-100-000-bonuses-to-eras-tour-truck-drivers`)
- Pollstar — *Year-End Special Features: Top Tours* (`pollstar-year-end-special-features-top-tours`)
- Ben Sisario — *Taylor Swift's Eras Tour Is the First to Surpass $2 Billion* (`sisario-ben-taylor-swift-s-eras-tour-is-the-first-to-surpass-2-billion`)
- Gospel of Luke; Gospel of Mark; Acts of the Apostles; Pauline epistles (1 Corinthians, Galatians, and related letters) — *(no title)* (`gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and`)

### Exists but missing relatedBooks (2)

- `king-martin-luther-jr-letter-from-birmingham-jail` matches biblio `king-martin-luther-jr-letter-from-birmingham-jail` (exact_slug; current books: when-authority-is-misread)
- `havel-vaclav-the-power-of-the-powerless` matches biblio `havel-v-clav-the-power-of-the-powerless` (title_author; current books: when-interpretation-no-longer-matters)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (49)

- `aldon-d-morris` (Aldon D Morris)
- `amy-jill-levine` (Amy-Jill Levine)
- `anupama-rao` (Anupama Rao)
- `associated-press` (Associated Press)
- `b-r-ambedkar` (B. R Ambedkar)
- `b-r-nanda` (B. R Nanda)
- `barbara-ransby` (Barbara Ransby)
- `ben-sisario` (Ben Sisario)
- `charter-77-founding-declaration-1977-v-clav-havel-library` (Charter 77. Founding declaration. 1977. Václav Havel Library)
- `chloe-melas` (Chloe Melas)
- `clemmons-fran-ois-with-tim-madigan` (Clemmons, François, with Tim Madigan)
- `david-j-garrow` (David J Garrow)
- `dennis-dalton` (Dennis Dalton)
- `dennis-e-smith` (Dennis E Smith)
- `desai-ashwin-and-goolam-vahed` (Desai, Ashwin, and Goolam Vahed)
- `desmond-tutu` (Desmond Tutu)
- `diane-mcwhorter` (Diane McWhorter)
- `e-p-sanders` (E. P Sanders)
- `fred-rogers-productions-episode-archives-television-hall-of-fame-materials-jeff-erlanger-appearances` (Fred Rogers Productions. Episode archives; Television Hall of Fame materials (Jeff Erlanger appearances))
- `geraldine-forbes` (Geraldine Forbes)
- `gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and-related-letters` (Gospel of Luke; Gospel of Mark; Acts of the Apostles; Pauline epistles (1 Corinthians, Galatians, and related letters))
- `government-of-south-africa-truth-and-reconciliation-commission` (Government of South Africa. Truth and Reconciliation Commission)
- `jane-addams` (Jane Addams)
- `jo-ann-gibson-robinson` (Jo Ann Gibson Robinson)
- `john-carlin` (John Carlin)
- `john-p-meier` (John P Meier)
- `judith-m-brown` (Judith M Brown)
- `lewis-john-with-michael-d-orso` (Lewis, John, with Michael D'Orso)
- `library-of-congress-bayard-rustin-papers-march-on-washington-planning-materials` (Library of Congress. Bayard Rustin Papers. March on Washington planning materials)
- `mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964` (Mandela, Nelson. Statement from the dock, Rivonia Trial. 20 April 1964)
- `martin-luther-jr-king` (Martin Luther Jr King)
- `michael-k-honey` (Michael K Honey)
- `mohandas-k-letter-to-lord-irwin-2-march-1930-in-the-collected-works-of-mahatma-gandhi-gandhi` (Mohandas K. Letter to Lord Irwin. 2 March 1930. In *The Collected Works of Mahatma Gandhi* Gandhi)
- `n-t-wright` (N. T Wright)
- `national-archives-u-s-official-demands-march-on-washington-for-jobs-and-freedom-1963` (National Archives (U.S.). Official demands, March on Washington for Jobs and Freedom. 1963)
- `nelson-mandela` (Nelson Mandela)
- `nobel-prize` (Nobel Prize)
- `pollstar` (Pollstar)
- `ramachandra-guha` (Ramachandra Guha)
- `residents-of-hull-house` (Residents of Hull-House)
- `south-african-history-online` (South African History Online)
- `taylor-branch` (Taylor Branch)
- `timothy-garton-ash` (Timothy Garton Ash)
- `u-s-senate-subcommittee-on-communications-hearings-on-the-public-broadcasting-act-may-1969` (U.S. Senate Subcommittee on Communications. Hearings on the Public Broadcasting Act. May 1969)
- `v-clav-havel` (Václav Havel)
- `wangari-maathai` (Wangari Maathai)
- `wayne-a-meeks` (Wayne A Meeks)
- `webb-miller-dispatches-from-dharasana-salt-works-raid-may-1930` (Webb Miller. Dispatches from Dharasana Salt Works raid. May 1930)
- `william-p-jones` (William P Jones)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-others-look-to-you-v1`

- Bibliography: `books/when-others-look-to-you/v1/back-matter/bibliography.md`
- Parse style: `list` (26 entries)
- Semantic linked sources: 10
- Parse warning: other styles also matched: plain_chicago=17

### Matched (10)

- `beck-ulrich-risk-society-towards-a-new-modernity` ← biblio `beck-ulrich-risk-society-towards-a-new-modernity` (exact_slug, score=100)
- `brehm-jack-w-a-theory-of-psychological-reactance` ← biblio `brehm-jack-w-a-theory-of-psychological-reactance` (exact_slug, score=100)
- `dekker-sidney-w-a-just-culture-restoring-trust-and-accountability` ← biblio `dekker-sidney-w-a-just-culture-restoring-trust-and-accountability` (exact_slug, score=100)
- `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` ← biblio `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` (exact_slug, score=100)
- `staw-barry-m-knee-deep-in-the-big-muddy-a-study-of-escalating` ← biblio `staw-barry-m-knee-deep-in-the-big-muddy-a-study-of-escalating` (exact_slug, score=100)
- `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b` ← biblio `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b` (exact_slug, score=100)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of` (title_author, score=85)
- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` ← biblio `janis-irving-l-groupthink-psychological-studies-of-policy` (title_author, score=85)
- `scott-james-c-domination-and-the-arts-of-resistance-hidden-transcripts` ← biblio `scott-james-c-domination-and-the-arts-of-resistance-hidden` (title_author, score=85)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (16)

- `agamben-giorgio-state-of-exception` matches biblio `agamben-giorgio-state-of-exception` (exact_slug; current books: when-others-look-to-you-v2)
- `arendt-hannah-what-is-authority` matches biblio `arendt-hannah-what-is-authority` (exact_slug; current books: when-others-look-to-you-v2)
- `argyris-chris-and-donald-a-schon-organizational-learning-ii` matches biblio `argyris-chris-and-donald-a-schon-organizational-learning-ii` (exact_slug; current books: when-others-look-to-you-v2)
- `argyris-chris-overcoming-organizational-defenses` matches biblio `argyris-chris-overcoming-organizational-defenses` (exact_slug; current books: when-others-look-to-you-v2)
- `bandura-albert-social-learning-theory` matches biblio `bandura-albert-social-learning-theory` (exact_slug; current books: when-others-look-to-you-v2)
- `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` matches biblio `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` (exact_slug; current books: when-authority-outlives-accountability)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` matches biblio `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` (exact_slug; current books: when-others-look-to-you-v2)
- `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` matches biblio `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` (exact_slug; current books: when-others-look-to-you-v2)
- `foucault-michel-discipline-and-punish-the-birth-of-the-prison` matches biblio `foucault-michel-discipline-and-punish-the-birth-of-the-prison` (exact_slug; current books: when-interpretation-no-longer-matters)
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` matches biblio `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` (exact_slug; current books: how-meaning-moves, when-others-look-to-you-v2)
- `weick-karl-e-the-social-psychology-of-organizing` matches biblio `weick-karl-e-the-social-psychology-of-organizing` (exact_slug; current books: when-others-look-to-you-v2)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` matches biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author; current books: how-meaning-moves, how-serious-systems-learn, trust-beyond-similarity, when-authority-outlives-accountability, when-moral-seriousness-scales, when-others-look-to-you-v2)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` matches biblio `hirschman-albert-o-exit-voice-and-loyalty` (title_author; current books: when-authority-outlives-accountability, when-interpretation-no-longer-matters, when-moral-seriousness-scales, why-collaboration-is-so-hard)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` matches biblio `perrow-charles-normal-accidents-living-with-high-risk` (title_author; current books: how-meaning-moves, how-serious-systems-learn, when-moral-seriousness-scales, when-others-look-to-you-v2)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` matches biblio `vaughan-diane-the-challenger-launch-decision-risky-technology` (title_author; current books: how-serious-systems-learn, when-accountability-no-longer-expires, when-others-look-to-you-v2, when-trust-stops-tracking-reality)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` matches biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected` (title_author; current books: how-serious-systems-learn, the-discipline-of-uncertainty, trust-beyond-similarity, when-others-look-to-you-v2)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (7)

- `argyris-chris-and-donald-a-schon` (Argyris, Chris, and Donald A. Schon)
- `baron-jonathan-and-john-c-hershey` (Baron, Jonathan, and John C. Hershey)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren` (Cialdini, Robert B., Raymond R. Reno, and Carl A. Kallgren)
- `sidney-w-a-dekker` (Sidney W. A Dekker)
- `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b` (Uhl-Bien, Michael, Ronald E. Riggio, Kelly Lowe, and Gerard B)
- `weick-karl-e-and-kathleen-m-sutcliffe` (Weick, Karl E., and Kathleen M. Sutcliffe)
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld` (Weick, Karl E., Kathleen M. Sutcliffe, and David Obstfeld)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-others-look-to-you-v2`

- Bibliography: `books/when-others-look-to-you/v2/back-matter/bibliography.md`
- Parse style: `list` (17 entries)
- Semantic linked sources: 17
- Parse warning: other styles also matched: plain_chicago=9

### Matched (17)

- `agamben-giorgio-state-of-exception` ← biblio `agamben-giorgio-state-of-exception` (exact_slug, score=100)
- `arendt-hannah-what-is-authority` ← biblio `arendt-hannah-what-is-authority` (exact_slug, score=100)
- `argyris-chris-and-donald-a-schon-organizational-learning-ii` ← biblio `argyris-chris-and-donald-a-schon-organizational-learning-ii` (exact_slug, score=100)
- `argyris-chris-overcoming-organizational-defenses` ← biblio `argyris-chris-overcoming-organizational-defenses` (exact_slug, score=100)
- `bandura-albert-social-learning-theory` ← biblio `bandura-albert-social-learning-theory` (exact_slug, score=100)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` ← biblio `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` (exact_slug, score=100)
- `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` ← biblio `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` (exact_slug, score=100)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` ← biblio `perrow-charles-normal-accidents-living-with-high-risk-technologies` (exact_slug, score=100)
- `reason-james-human-error` ← biblio `reason-james-human-error` (exact_slug, score=100)
- `schein-edgar-h-organizational-culture-and-leadership` ← biblio `schein-edgar-h-organizational-culture-and-leadership` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` ← biblio `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` (exact_slug, score=100)
- `weick-karl-e-the-social-psychology-of-organizing` ← biblio `weick-karl-e-the-social-psychology-of-organizing` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author, score=85)
- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` ← biblio `janis-irving-l-groupthink-psychological-studies-of-policy-decisions` (title_author, score=85)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology` (title_author, score=85)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` ← biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (4)

- `argyris-chris-and-donald-a-schon` (Argyris, Chris, and Donald A. Schon)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren` (Cialdini, Robert B., Raymond R. Reno, and Carl A. Kallgren)
- `weick-karl-e-and-kathleen-m-sutcliffe` (Weick, Karl E., and Kathleen M. Sutcliffe)
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld` (Weick, Karl E., Kathleen M. Sutcliffe, and David Obstfeld)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-trust-stops-tracking-reality`

- Bibliography: `books/when-trust-stops-tracking-reality/back-matter/bibliography.md`
- Parse style: `list` (23 entries)
- Semantic linked sources: 23
- Parse warning: other styles also matched: plain_chicago=1

### Matched (23)

- `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` ← biblio `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` (exact_slug, score=100)
- `cole-robert-e-what-really-happened-to-toyota` ← biblio `cole-robert-e-what-really-happened-to-toyota` (exact_slug, score=100)
- `dewey-john-experience-and-education` ← biblio `dewey-john-experience-and-education` (exact_slug, score=100)
- `douglas-karen-m-et-al-understanding-conspiracy-theories` ← biblio `douglas-karen-m-et-al-understanding-conspiracy-theories` (exact_slug, score=100)
- `druckman-james-n-et-al-a-framework-for-the-study-of-misinformation-and-health` ← biblio `druckman-james-n-et-al-a-framework-for-the-study-of-misinformation-and-health` (exact_slug, score=100)
- `freeh-sporkin-sullivan-llc-report-of-the-special-investigative-counsel-regarding-the-actions-of` ← biblio `freeh-sporkin-sullivan-llc-report-of-the-special-investigative-counsel-regarding-the-actions-of` (exact_slug, score=100)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` ← biblio `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` (exact_slug, score=100)
- `grady-peter-flying-blind-the-737-max-tragedy-and-the-fall-of-boeing` ← biblio `grady-peter-flying-blind-the-737-max-tragedy-and-the-fall-of-boeing` (exact_slug, score=100)
- `isaacson-walter-steve-jobs` ← biblio `isaacson-walter-steve-jobs` (exact_slug, score=100)
- `keep-william-w-and-peter-j-vander-nat-multilevel-marketing-and-pyramid-schemes-in-the-united-sta` ← biblio `keep-william-w-and-peter-j-vander-nat-multilevel-marketing-and-pyramid-schemes-in-the-united-sta` (exact_slug, score=100)
- `lowenstein-roger-buffett-the-making-of-an-american-capitalist` ← biblio `lowenstein-roger-buffett-the-making-of-an-american-capitalist` (exact_slug, score=100)
- `luhmann-niklas-trust-and-power-two-works` ← biblio `luhmann-niklas-trust-and-power-two-works` (exact_slug, score=100)
- `merton-robert-k-the-normative-structure-of-science` ← biblio `merton-robert-k-the-normative-structure-of-science` (exact_slug, score=100)
- `o-neill-onora-a-question-of-trust` ← biblio `o-neill-onora-a-question-of-trust` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `raine-susan-reinventing-the-self-nxivm-s-promises-secrets-and-lies` ← biblio `raine-susan-reinventing-the-self-nxivm-s-promises-secrets-and-lies` (exact_slug, score=100)
- `reason-james-managing-the-risks-of-organizational-accidents` ← biblio `reason-james-managing-the-risks-of-organizational-accidents` (exact_slug, score=100)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug, score=100)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)
- `wiedeman-reeves-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusion` ← biblio `wiedeman-reeves-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusion` (exact_slug, score=100)
- `raymond-eric-s-the-cathedral-and-the-bazaar-musings-on-linux-and-open-source-by-an-accidental-re` ← biblio `raymond-eric-s-the-cathedral-and-the-bazaar` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (3)

- `douglas-karen-m-et-al` (Douglas, Karen M., et al)
- `druckman-james-n-et-al` (Druckman, James N., et al)
- `keep-william-w-and-peter-j-vander-nat` (Keep, William W., and Peter J. Vander Nat)

### Orphan creatorSlugs on linked sources (0)

_None._

## `why-collaboration-is-so-hard`

- Bibliography: `books/why-collaboration-is-so-hard/back-matter/bibliography.md`
- Parse style: `list` (9 entries)
- Semantic linked sources: 4

### Matched (4)

- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` (exact_slug, score=100)
- `hochschild-arlie-russell-the-managed-heart-commercialization-of-human-feeling` ← biblio `hochschild-arlie-russell-the-managed-heart-commercialization-of-human-feeling` (exact_slug, score=100)
- `sennett-richard-together-the-rituals-pleasures-and-politics-of-cooperation` ← biblio `sennett-richard-together-the-rituals-pleasures-and-politics-of-cooperation` (exact_slug, score=100)
- `star-susan-leigh-and-anselm-strauss-layers-of-silence-arenas-of-voice-the-ecology-of-visible-and` ← biblio `star-susan-leigh-and-anselm-strauss-layers-of-silence-arenas-of-voice-the-ecology-of-visible-and` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (5)

- `luhmann-niklas-trust-and-power-two-works` matches biblio `luhmann-niklas-trust-and-power-two-works` (exact_slug; current books: how-trust-forms, when-trust-stops-tracking-reality)
- `march-james-g-and-herbert-a-simon-organizations` matches biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug; current books: living-in-sediment, when-moral-seriousness-scales)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` matches biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug; current books: how-trust-forms, living-in-sediment, trust-beyond-similarity, when-trust-stops-tracking-reality)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` matches biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug; current books: after-certainty, how-serious-systems-learn, how-trust-forms, living-in-sediment, when-trust-stops-tracking-reality)
- `weick-karl-e-sensemaking-in-organizations` matches biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug; current books: how-serious-systems-learn, trust-beyond-similarity, when-accountability-no-longer-expires, when-trust-stops-tracking-reality)

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (2)

- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)
- `star-susan-leigh-and-anselm-strauss` (Star, Susan Leigh, and Anselm Strauss)

### Orphan creatorSlugs on linked sources (0)

_None._

---

*Generated by `tools/audit_bibliography_semantic_drift.py`.*
