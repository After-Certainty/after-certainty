# Bibliography ↔ semantic drift audit

Manuscript bibliographies are the source of truth for which works (and thus creators) belong to each book. This report is **read-only** — no `semantic/sources` or `semantic/thinkers` YAML was modified.

## Follow-on reconcile rules

1. **missing_in_semantic** — extract drafts for that book → `make promote-semantic-source-drafts SOURCE_PROMOTE_BOOK_IDS='…'` (no prune) → backfill metadata.
2. **missing_related_books** — add the book id to the existing source’s `relatedBooks` (do not duplicate the YAML).
3. **stale_related_books** — remove only that book id from `relatedBooks` (keep the file if still linked elsewhere).
4. Re-derive / update thinkers so `works` and `relatedBooks` match reconciled sources; do not auto-delete multi-book thinker nodes.
5. `make verify-semantic-ontology`.

## Portfolio summary

- Books with bibliography audited: **24**
- Matched pairs: **845**
- Missing in semantic (no work found): **0**
- Exists but missing `relatedBooks` link: **0**
- Stale `relatedBooks` links: **0**

| Book | Style | Biblio | Linked | Matched | Missing | Missing RB | Stale |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `after-certainty` | list | 27 | 27 | 27 | 0 | 0 | 0 |
| `before-certainty-arrives` | list | 42 | 42 | 42 | 0 | 0 | 0 |
| `coupling` | list | 68 | 68 | 68 | 0 | 0 | 0 |
| `how-meaning-moves` | list | 23 | 23 | 23 | 0 | 0 | 0 |
| `how-serious-systems-learn` | list | 38 | 38 | 38 | 0 | 0 | 0 |
| `how-trust-forms` | list | 15 | 15 | 15 | 0 | 0 | 0 |
| `living-in-sediment` | list | 72 | 72 | 72 | 0 | 0 | 0 |
| `the-discipline-of-uncertainty` | list | 10 | 10 | 10 | 0 | 0 | 0 |
| `the-economy-we-dont-experience` | pandoc_div | 27 | 27 | 27 | 0 | 0 | 0 |
| `the-game-we-think-we-saw` | list | 72 | 72 | 72 | 0 | 0 | 0 |
| `the-world-we-make-together` | pandoc_div | 54 | 54 | 54 | 0 | 0 | 0 |
| `trust-beyond-similarity` | list | 42 | 42 | 42 | 0 | 0 | 0 |
| `what-we-cannot-see` | list | 21 | 21 | 21 | 0 | 0 | 0 |
| `when-accountability-no-longer-expires` | list | 12 | 12 | 12 | 0 | 0 | 0 |
| `when-authority-is-misread` | list | 51 | 51 | 51 | 0 | 0 | 0 |
| `when-authority-outlives-accountability` | list | 30 | 30 | 30 | 0 | 0 | 0 |
| `when-incentives-become-the-moral-language` | plain_chicago | 47 | 47 | 47 | 0 | 0 | 0 |
| `when-interpretation-no-longer-matters` | list | 38 | 38 | 38 | 0 | 0 | 0 |
| `when-moral-seriousness-scales` | list | 22 | 22 | 22 | 0 | 0 | 0 |
| `when-others-become-leaders` | list | 53 | 53 | 53 | 0 | 0 | 0 |
| `when-others-look-to-you-v1` | list | 26 | 26 | 26 | 0 | 0 | 0 |
| `when-others-look-to-you-v2` | list | 17 | 17 | 17 | 0 | 0 | 0 |
| `when-trust-stops-tracking-reality` | list | 23 | 23 | 23 | 0 | 0 | 0 |
| `why-collaboration-is-so-hard` | pandoc_div | 15 | 15 | 15 | 0 | 0 | 0 |

## Out of audit scope

These book ids appear in source `relatedBooks` but have **no** manuscript bibliography — no removals recommended from this audit.

- `learning-to-see` — 12 linked source(s)

## `after-certainty`

- Bibliography: `books/after-certainty/back-matter/bibliography.md`
- Parse style: `list` (27 entries)
- Semantic linked sources: 27
- Parse warning: other styles also matched: plain_chicago=12

### Matched (27)

- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` (exact_slug, score=100)
- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `bauman-zygmunt-modernity-and-the-holocaust` ← biblio `bauman-zygmunt-modernity-and-the-holocaust` (exact_slug, score=100)
- `boss-pauline-ambiguous-loss-learning-to-live-with-unresolved-grief` ← biblio `boss-pauline-ambiguous-loss-learning-to-live-with-unresolved-grief` (exact_slug, score=100)
- `butler-judith-frames-of-war-when-is-life-grievable` ← biblio `butler-judith-frames-of-war-when-is-life-grievable` (exact_slug, score=100)
- `dewey-john-ethics` ← biblio `dewey-john-ethics` (exact_slug, score=100)
- `dewey-john-experience-and-nature` ← biblio `dewey-john-experience-and-nature` (exact_slug, score=100)
- `dewey-john-the-quest-for-certainty-a-study-of-the-relation-of` ← biblio `dewey-john-the-quest-for-certainty-a-study-of-the-relation-of` (exact_slug, score=100)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` ← biblio `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` (exact_slug, score=100)
- `goffman-erving-the-presentation-of-self-in-everyday-life` ← biblio `goffman-erving-the-presentation-of-self-in-everyday-life` (exact_slug, score=100)
- `kahan-dan-m-cultural-cognition-and-public-policy` ← biblio `kahan-dan-m-cultural-cognition-and-public-policy` (exact_slug, score=100)
- `luhmann-niklas-social-systems` ← biblio `luhmann-niklas-social-systems` (exact_slug, score=100)
- `macintyre-alasdair-after-virtue-a-study-in-moral-theory` ← biblio `macintyre-alasdair-after-virtue-a-study-in-moral-theory` (exact_slug, score=100)
- `merleau-ponty-maurice-phenomenology-of-perception` ← biblio `merleau-ponty-maurice-phenomenology-of-perception` (exact_slug, score=100)
- `minow-martha-between-vengeance-and-forgiveness-facing-history-after` ← biblio `minow-martha-between-vengeance-and-forgiveness-facing-history-after` (exact_slug, score=100)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` ← biblio `perrow-charles-normal-accidents-living-with-high-risk-technologies` (exact_slug, score=100)
- `putnam-hilary-reason-truth-and-history` ← biblio `putnam-hilary-reason-truth-and-history` (exact_slug, score=100)
- `shklar-judith-n-putting-cruelty-first` ← biblio `shklar-judith-n-putting-cruelty-first` (exact_slug, score=100)
- `simon-herbert-a-a-behavioral-model-of-rational-choice` ← biblio `simon-herbert-a-a-behavioral-model-of-rational-choice` (exact_slug, score=100)
- `taylor-charles-sources-of-the-self-the-making-of-the-modern-identity` ← biblio `taylor-charles-sources-of-the-self-the-making-of-the-modern-identity` (exact_slug, score=100)
- `thompson-dennis-f-moral-responsibility-of-public-officials-the` ← biblio `thompson-dennis-f-moral-responsibility-of-public-officials-the` (exact_slug, score=100)
- `walzer-michael-just-and-unjust-wars-a-moral-argument-with-historical` ← biblio `walzer-michael-just-and-unjust-wars-a-moral-argument-with-historical` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `ross-lee-and-richard-nisbett-the-person-and-the-situation` ← biblio `ross-lee-and-richard-e-nisbett-the-person-and-the-situation` (title_author, score=85)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the` (title_author, score=85)
- `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social-media` ← biblio `sunstein-cass-r-republic-divided-democracy-in-the-age-of-social` (title_author, score=85)
- `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of-care` ← biblio `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

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
- Semantic linked sources: 42
- Parse warning: other styles also matched: plain_chicago=25

### Matched (42)

- `albertz-rainer-israel-in-exile-the-history-and-literature-of-the` ← biblio `albertz-rainer-israel-in-exile-the-history-and-literature-of-the` (exact_slug, score=100)
- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `bartky-ian-r-the-adoption-of-standard-time` ← biblio `bartky-ian-r-the-adoption-of-standard-time` (exact_slug, score=100)
- `boehm-christopher-hierarchy-in-the-forest-the-evolution-of` ← biblio `boehm-christopher-hierarchy-in-the-forest-the-evolution-of` (exact_slug, score=100)
- `braudel-fernand-on-history` ← biblio `braudel-fernand-on-history` (exact_slug, score=100)
- `carr-e-h-what-is-history` ← biblio `carr-e-h-what-is-history` (exact_slug, score=100)
- `cogan-mordechai-the-raging-torrent-historical-inscriptions-from` ← biblio `cogan-mordechai-the-raging-torrent-historical-inscriptions-from` (exact_slug, score=100)
- `darby-h-c-domesday-england` ← biblio `darby-h-c-domesday-england` (exact_slug, score=100)
- `douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution` ← biblio `douglas-mary-purity-and-danger-an-analysis-of-concepts-of-pollution` (exact_slug, score=100)
- `eisenstadt-shmuel-n-ed-the-origins-and-diversity-of-axial-age` ← biblio `eisenstadt-shmuel-n-ed-the-origins-and-diversity-of-axial-age` (exact_slug, score=100)
- `eisenstein-elizabeth-l-the-printing-press-as-an-agent-of-change` ← biblio `eisenstein-elizabeth-l-the-printing-press-as-an-agent-of-change` (exact_slug, score=100)
- `eno-robert-the-mandate-of-heaven-and-the-origins-of-history-in` ← biblio `eno-robert-the-mandate-of-heaven-and-the-origins-of-history-in` (exact_slug, score=100)
- `hanke-lewis-all-mankind-is-one-a-study-of-the-disputation-between` ← biblio `hanke-lewis-all-mankind-is-one-a-study-of-the-disputation-between` (exact_slug, score=100)
- `hatcher-john-plague-population-and-the-english-economy-1348-1530` ← biblio `hatcher-john-plague-population-and-the-english-economy-1348-1530` (exact_slug, score=100)
- `hodder-ian-the-leopard-s-tale-revealing-the-mysteries-of` ← biblio `hodder-ian-the-leopard-s-tale-revealing-the-mysteries-of` (exact_slug, score=100)
- `hodder-ian-where-are-we-heading-the-evolution-of-humans-and-things` ← biblio `hodder-ian-where-are-we-heading-the-evolution-of-humans-and-things` (exact_slug, score=100)
- `illich-ivan-tools-for-conviviality` ← biblio `illich-ivan-tools-for-conviviality` (exact_slug, score=100)
- `jaspers-karl-the-origin-and-goal-of-history` ← biblio `jaspers-karl-the-origin-and-goal-of-history` (exact_slug, score=100)
- `keightley-david-n-sources-of-shang-history-the-oracle-bone` ← biblio `keightley-david-n-sources-of-shang-history-the-oracle-bone` (exact_slug, score=100)
- `kuhn-thomas-s-the-structure-of-scientific-revolutions` ← biblio `kuhn-thomas-s-the-structure-of-scientific-revolutions` (exact_slug, score=100)
- `layard-austen-henry-discoveries-in-the-ruins-of-nineveh-and-babylon` ← biblio `layard-austen-henry-discoveries-in-the-ruins-of-nineveh-and-babylon` (exact_slug, score=100)
- `levenson-jon-d-sinai-and-zion-an-entry-into-the-jewish-bible` ← biblio `levenson-jon-d-sinai-and-zion-an-entry-into-the-jewish-bible` (exact_slug, score=100)
- `lewis-mark-edward-sanctioned-violence-in-early-china` ← biblio `lewis-mark-edward-sanctioned-violence-in-early-china` (exact_slug, score=100)
- `nissen-hans-j-peter-damerow-and-robert-k-englund-archaic` ← biblio `nissen-hans-j-peter-damerow-and-robert-k-englund-archaic` (exact_slug, score=100)
- `oppenheim-a-leo-ancient-mesopotamia-portrait-of-a-dead` ← biblio `oppenheim-a-leo-ancient-mesopotamia-portrait-of-a-dead` (exact_slug, score=100)
- `pagden-anthony-the-fall-of-natural-man-the-american-indian-and-the` ← biblio `pagden-anthony-the-fall-of-natural-man-the-american-indian-and-the` (exact_slug, score=100)
- `potts-d-t-mesopotamian-civilization-the-material-foundations` ← biblio `potts-d-t-mesopotamian-civilization-the-material-foundations` (exact_slug, score=100)
- `puett-michael-j-to-become-a-god-cosmology-sacrifice-and` ← biblio `puett-michael-j-to-become-a-god-cosmology-sacrifice-and` (exact_slug, score=100)
- `salomon-richard-indian-epigraphy-a-guide-to-the-study-of-inscriptions` ← biblio `salomon-richard-indian-epigraphy-a-guide-to-the-study-of-inscriptions` (exact_slug, score=100)
- `schivelbusch-wolfgang-the-railway-journey-the-industrialization-of` ← biblio `schivelbusch-wolfgang-the-railway-journey-the-industrialization-of` (exact_slug, score=100)
- `statutes-of-the-realm-vol-1-london-record-commission-1810` ← biblio `statutes-of-the-realm-vol-1-london-record-commission-1810` (exact_slug, score=100)
- `strachan-hew-the-first-world-war` ← biblio `strachan-hew-the-first-world-war` (exact_slug, score=100)
- `thapar-romila-asoka-and-the-decline-of-the-mauryas` ← biblio `thapar-romila-asoka-and-the-decline-of-the-mauryas` (exact_slug, score=100)
- `tov-emanuel-textual-criticism-of-the-hebrew-bible` ← biblio `tov-emanuel-textual-criticism-of-the-hebrew-bible` (exact_slug, score=100)
- `u-s-house-of-representatives-a-failure-of-initiative-final-report-of` ← biblio `u-s-house-of-representatives-a-failure-of-initiative-final-report-of` (exact_slug, score=100)
- `u-s-white-house-the-federal-response-to-hurricane-katrina-lessons` ← biblio `u-s-white-house-the-federal-response-to-hurricane-katrina-lessons` (exact_slug, score=100)
- `ulrich-eugene-the-dead-sea-scrolls-and-the-developmental-composition` ← biblio `ulrich-eugene-the-dead-sea-scrolls-and-the-developmental-composition` (exact_slug, score=100)
- `ussishkin-david-the-renewed-archaeological-excavations-at-lachish` ← biblio `ussishkin-david-the-renewed-archaeological-excavations-at-lachish` (exact_slug, score=100)
- `vanderkam-james-c-the-dead-sea-scrolls-today` ← biblio `vanderkam-james-c-the-dead-sea-scrolls-today` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human-evolution` ← biblio `henrich-joseph-the-secret-of-our-success-how-culture-is-driving-human` (title_author, score=85)
- `polanyi-karl-the-great-transformation-the-political-and-economic-origins-of-our` ← biblio `polanyi-karl-the-great-transformation-the-political-and-economic` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (3)

- `1810-statutes-of-the-realm-vol-1-london-record-commission` (1810 *Statutes of the Realm*. Vol. 1. London: Record Commission)
- `eisenstadt-shmuel-n` (Eisenstadt, Shmuel N.)
- `nissen-hans-j-peter-damerow-and-robert-k-englund` (Nissen, Hans J., Peter Damerow, and Robert K. Englund)

### Orphan creatorSlugs on linked sources (0)

_None._

## `coupling`

- Bibliography: `books/coupling/back-matter/bibliography.md`
- Parse style: `list` (68 entries)
- Semantic linked sources: 68
- Parse warning: other styles also matched: plain_chicago=23

### Matched (68)

- `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` ← biblio `allspaw-john-and-paul-hammond-10-deploys-per-day-dev-and-ops-cooperation-at-flickr` (exact_slug, score=100)
- `amershi-saleema-et-al-guidelines-for-human-ai-interaction` ← biblio `amershi-saleema-et-al-guidelines-for-human-ai-interaction` (exact_slug, score=100)
- `anderson-c-w-rebuilding-the-news-metropolitan-journalism-in-the-digital-age` ← biblio `anderson-c-w-rebuilding-the-news-metropolitan-journalism-in-the-digital-age` (exact_slug, score=100)
- `andrews-matthew-lant-pritchett-and-michael-woolcock-escaping-capability-traps-through-problem-dr` ← biblio `andrews-matthew-lant-pritchett-and-michael-woolcock-escaping-capability-traps-through-problem-dr` (exact_slug, score=100)
- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
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
- `campbell-donald-t-assessing-the-impact-of-planned-social-change` ← biblio `campbell-donald-t-assessing-the-impact-of-planned-social-change` (exact_slug, score=100)
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
- `gawande-atul-the-checklist-manifesto-how-to-get-things-right` ← biblio `gawande-atul-the-checklist-manifesto-how-to-get-things-right` (exact_slug, score=100)
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
- `meadows-donella-h-thinking-in-systems-a-primer` ← biblio `meadows-donella-h-thinking-in-systems-a-primer` (exact_slug, score=100)
- `merton-robert-k-bureaucratic-structure-and-personality` ← biblio `merton-robert-k-bureaucratic-structure-and-personality` (exact_slug, score=100)
- `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-sp` ← biblio `mitchell-margaret-simone-wu-andrew-zaldivar-parker-barnes-lucy-vasserman-ben-hutchinson-elena-sp` (exact_slug, score=100)
- `national-aeronautics-and-space-administration-aviation-safety-reporting-system-asrs-program-mate` ← biblio `national-aeronautics-and-space-administration-aviation-safety-reporting-system-asrs-program-mate` (exact_slug, score=100)
- `national-institute-of-standards-and-technology-artificial-intelligence-risk-management-framework` ← biblio `national-institute-of-standards-and-technology-artificial-intelligence-risk-management-framework` (exact_slug, score=100)
- `national-institute-of-standards-and-technology-secure-software-development-framework-ssdf-versio` ← biblio `national-institute-of-standards-and-technology-secure-software-development-framework-ssdf-versio` (exact_slug, score=100)
- `nygard-michael-t-release-it-design-and-deploy-production-ready-software` ← biblio `nygard-michael-t-release-it-design-and-deploy-production-ready-software` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `owasp-foundation-owasp-top-10-for-large-language-model-applications` ← biblio `owasp-foundation-owasp-top-10-for-large-language-model-applications` (exact_slug, score=100)
- `pariser-eli-the-filter-bubble-what-the-internet-is-hiding-from-you` ← biblio `pariser-eli-the-filter-bubble-what-the-internet-is-hiding-from-you` (exact_slug, score=100)
- `peng-sida-et-al-the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot` ← biblio `peng-sida-et-al-the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot` (exact_slug, score=100)
- `perry-neil-megha-srivastava-deepak-kumar-and-dan-boneh-do-users-write-more-insecure-code-with-ai` ← biblio `perry-neil-megha-srivastava-deepak-kumar-and-dan-boneh-do-users-write-more-insecure-code-with-ai` (exact_slug, score=100)
- `pollitt-christopher-and-geert-bouckaert-public-management-reform-a-comparative-analysis` ← biblio `pollitt-christopher-and-geert-bouckaert-public-management-reform-a-comparative-analysis` (exact_slug, score=100)
- `royce-winston-w-managing-the-development-of-large-software-systems` ← biblio `royce-winston-w-managing-the-development-of-large-software-systems` (exact_slug, score=100)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug, score=100)
- `simon-herbert-a-administrative-behavior-a-study-of-decision-making-processes-in-administrative-o` ← biblio `simon-herbert-a-administrative-behavior-a-study-of-decision-making-processes-in-administrative-o` (exact_slug, score=100)
- `skelton-matthew-and-manuel-pais-team-topologies-organizing-business-and-technology-teams-for-fas` ← biblio `skelton-matthew-and-manuel-pais-team-topologies-organizing-business-and-technology-teams-for-fas` (exact_slug, score=100)
- `tufekci-zeynep-twitter-and-tear-gas-the-power-and-fragility-of-networked-protest` ← biblio `tufekci-zeynep-twitter-and-tear-gas-the-power-and-fragility-of-networked-protest` (exact_slug, score=100)
- `u-s-department-of-defense-dod-std-2167a-defense-system-software-development` ← biblio `u-s-department-of-defense-dod-std-2167a-defense-system-software-development` (exact_slug, score=100)
- `vernon-vaughn-implementing-domain-driven-design` ← biblio `vernon-vaughn-implementing-domain-driven-design` (exact_slug, score=100)
- `wiener-norbert-cybernetics-or-control-and-communication-in-the-animal-and-the-machine` ← biblio `wiener-norbert-cybernetics-or-control-and-communication-in-the-animal-and-the-machine` (exact_slug, score=100)
- `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future-at-the-new-front` ← biblio `zuboff-shoshana-the-age-of-surveillance-capitalism-the-fight-for-a-human-future-at-the-new-front` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

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
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy` (Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy)
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
- Semantic linked sources: 23
- Parse warning: other styles also matched: plain_chicago=8

### Matched (23)

- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
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
- `march-james-g-and-herbert-a-simon-organizations` ← biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug, score=100)
- `minuchin-salvador-families-and-family-therapy` ← biblio `minuchin-salvador-families-and-family-therapy` (exact_slug, score=100)
- `morrison-elizabeth-w-employee-voice-behavior-integration-and-directions-for-future-research` ← biblio `morrison-elizabeth-w-employee-voice-behavior-integration-and-directions-for-future-research` (exact_slug, score=100)
- `nickerson-raymond-s-confirmation-bias` ← biblio `nickerson-raymond-s-confirmation-bias` (exact_slug, score=100)
- `ross-lee-the-intuitive-psychologist-and-his-shortcomings` ← biblio `ross-lee-the-intuitive-psychologist-and-his-shortcomings` (exact_slug, score=100)
- `standage-tom-the-victorian-internet` ← biblio `standage-tom-the-victorian-internet` (exact_slug, score=100)
- `steele-claude-m-whistling-vivaldi` ← biblio `steele-claude-m-whistling-vivaldi` (exact_slug, score=100)
- `tajfel-henri-and-john-c-turner-the-social-identity-theory-of-intergroup-behavior` ← biblio `tajfel-henri-and-john-c-turner-the-social-identity-theory-of-intergroup-behavior` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization` (title_author, score=85)
- `fricker-miranda-epistemic-injustice-power-and-the-ethics-of-knowing` ← biblio `fricker-miranda-epistemic-injustice` (title_author, score=85)
- `ross-lee-and-andrew-ward-naive-realism-in-everyday-life` ← biblio `ross-lee-and-andrew-ward-naive-realism-in-everyday-life-implications-for-social-conflict-and-mis` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (4)

- `french-john-r-p-and-bertram-raven` (French, John R. P., and Bertram Raven)
- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)
- `ross-lee-and-andrew-ward` (Ross, Lee, and Andrew Ward)
- `tajfel-henri-and-john-c-turner` (Tajfel, Henri, and John C. Turner)

### Orphan creatorSlugs on linked sources (0)

_None._

## `how-serious-systems-learn`

- Bibliography: `books/how-serious-systems-learn/back-matter/bibliography.md`
- Parse style: `list` (38 entries)
- Semantic linked sources: 38
- Parse warning: other styles also matched: plain_chicago=26

### Matched (38)

- `arendt-hannah-responsibility-and-judgment` ← biblio `arendt-hannah-responsibility-and-judgment` (exact_slug, score=100)
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds-site-reliability-engineerin` ← biblio `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy-eds-site-reliability-engineerin` (exact_slug, score=100)
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

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (11)

- `berger-peter-l-and-thomas-luckmann` (Berger, Peter L., and Thomas Luckmann)
- `beyer-betsy-chris-jones-jennifer-petoff-and-niall-richard-murphy` (Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy)
- `demarco-tom-and-timothy-r-lister` (DeMarco, Tom, and Timothy R. Lister)
- `dietrich-d-rner` (Dietrich Dörner)
- `donald-a-sch-n` (Donald A Schön)
- `fahey-liam-and-robert-m-randall` (Fahey, Liam, and Robert M. Randall)
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
- Semantic linked sources: 27
- Parse warning: other styles also matched: plain_chicago=27

### Matched (27)

- `bartels-larry-m-beyond-the-running-tally-partisan-bias-in-political-perceptions` ← biblio `bartels-larry-m-beyond-the-running-tally-partisan-bias-in-political-perceptions` (exact_slug, score=100)
- `bernanke-ben-s-the-courage-to-act-a-memoir-of-a-crisis-and-its-aftermath` ← biblio `bernanke-ben-s-the-courage-to-act-a-memoir-of-a-crisis-and-its-aftermath` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-beige-book-summary-of-commentary-on-current-eco` ← biblio `board-of-governors-of-the-federal-reserve-system-beige-book-summary-of-commentary-on-current-eco` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-financial-stability-report` ← biblio `board-of-governors-of-the-federal-reserve-system-financial-stability-report` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-report-on-the-economic-well-being-of-u-s-househ` ← biblio `board-of-governors-of-the-federal-reserve-system-report-on-the-economic-well-being-of-u-s-househ` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-summary-of-economic-projections` ← biblio `board-of-governors-of-the-federal-reserve-system-summary-of-economic-projections` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-supervisory-bank-stress-test-results-and-relate` ← biblio `board-of-governors-of-the-federal-reserve-system-supervisory-bank-stress-test-results-and-relate` (exact_slug, score=100)
- `board-of-governors-of-the-federal-reserve-system-transcript-of-chair-powell-s-press-conference` ← biblio `board-of-governors-of-the-federal-reserve-system-transcript-of-chair-powell-s-press-conference` (exact_slug, score=100)
- `congressional-budget-office-effects-of-automatic-stabilizers-on-the-federal-budget-2024-to-2034` ← biblio `congressional-budget-office-effects-of-automatic-stabilizers-on-the-federal-budget-2024-to-2034` (exact_slug, score=100)
- `federal-deposit-insurance-corporation-options-for-deposit-insurance-reform` ← biblio `federal-deposit-insurance-corporation-options-for-deposit-insurance-reform` (exact_slug, score=100)
- `federal-reserve-bank-of-philadelphia-survey-of-professional-forecasters` ← biblio `federal-reserve-bank-of-philadelphia-survey-of-professional-forecasters` (exact_slug, score=100)
- `financial-stability-board-implementation-and-effects-of-the-g20-financial-regulatory-reforms` ← biblio `financial-stability-board-implementation-and-effects-of-the-g20-financial-regulatory-reforms` (exact_slug, score=100)
- `fiorina-morris-p-retrospective-voting-in-american-national-elections` ← biblio `fiorina-morris-p-retrospective-voting-in-american-national-elections` (exact_slug, score=100)
- `hovland-carl-i-and-walter-weiss-the-influence-of-source-credibility-on-communication-effectivene` ← biblio `hovland-carl-i-and-walter-weiss-the-influence-of-source-credibility-on-communication-effectivene` (exact_slug, score=100)
- `kahneman-daniel-and-amos-tversky-prospect-theory-an-analysis-of-decision-under-risk` ← biblio `kahneman-daniel-and-amos-tversky-prospect-theory-an-analysis-of-decision-under-risk` (exact_slug, score=100)
- `key-v-o-jr-the-responsible-electorate-rationality-in-presidential-voting-1936-1960` ← biblio `key-v-o-jr-the-responsible-electorate-rationality-in-presidential-voting-1936-1960` (exact_slug, score=100)
- `kff-employer-health-benefits-survey` ← biblio `kff-employer-health-benefits-survey` (exact_slug, score=100)
- `lupia-arthur-and-mathew-d-mccubbins-the-democratic-dilemma-can-citizens-learn-what-they-need-to` ← biblio `lupia-arthur-and-mathew-d-mccubbins-the-democratic-dilemma-can-citizens-learn-what-they-need-to` (exact_slug, score=100)
- `pew-research-center-americans-views-of-inflation-and-the-economy` ← biblio `pew-research-center-americans-views-of-inflation-and-the-economy` (exact_slug, score=100)
- `reinhart-carmen-m-and-kenneth-s-rogoff-this-time-is-different-eight-centuries-of-financial-folly` ← biblio `reinhart-carmen-m-and-kenneth-s-rogoff-this-time-is-different-eight-centuries-of-financial-folly` (exact_slug, score=100)
- `schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast` ← biblio `schneider-howard-powell-says-soft-landing-not-baseline-but-it-s-sure-in-the-forecast` (exact_slug, score=100)
- `shiller-robert-j-narrative-economics-how-stories-go-viral-and-drive-major-economic-events` ← biblio `shiller-robert-j-narrative-economics-how-stories-go-viral-and-drive-major-economic-events` (exact_slug, score=100)
- `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` ← biblio `tetlock-philip-e-and-dan-gardner-superforecasting-the-art-and-science-of-prediction` (exact_slug, score=100)
- `u-s-bureau-of-labor-statistics-consumer-price-index-cpi-news-releases-methodology-notes-and-data` ← biblio `u-s-bureau-of-labor-statistics-consumer-price-index-cpi-news-releases-methodology-notes-and-data` (exact_slug, score=100)
- `u-s-bureau-of-labor-statistics-the-employment-situation` ← biblio `u-s-bureau-of-labor-statistics-the-employment-situation` (exact_slug, score=100)
- `u-s-census-bureau-housing-statistics-and-american-community-survey-materials-on-regional-cost-pr` ← biblio `u-s-census-bureau-housing-statistics-and-american-community-survey-materials-on-regional-cost-pr` (exact_slug, score=100)
- `u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-depo` ← biblio `u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-depo` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (5)

- `hovland-carl-i-and-walter-weiss` (Hovland, Carl I., and Walter Weiss)
- `kahneman-daniel-and-amos-tversky` (Kahneman, Daniel, and Amos Tversky)
- `lupia-arthur-and-mathew-d-mccubbins` (Lupia, Arthur, and Mathew D. McCubbins)
- `reinhart-carmen-m-and-kenneth-s-rogoff` (Reinhart, Carmen M., and Kenneth S. Rogoff)
- `tetlock-philip-e-and-dan-gardner` (Tetlock, Philip E., and Dan Gardner)

### Orphan creatorSlugs on linked sources (0)

_None._

## `the-game-we-think-we-saw`

- Bibliography: `books/the-game-we-think-we-saw/back-matter/bibliography.md`
- Parse style: `list` (72 entries)
- Semantic linked sources: 72

### Matched (72)

- `andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl` ← biblio `andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl` (exact_slug, score=100)
- `andscape-for-allen-iverson-it-was-never-just-about-practice` ← biblio `andscape-for-allen-iverson-it-was-never-just-about-practice` (exact_slug, score=100)
- `associated-press-ap-was-there-smith-and-carlos-protest-during-1968-olympics` ← biblio `associated-press-ap-was-there-smith-and-carlos-protest-during-1968-olympics` (exact_slug, score=100)
- `associated-press-bob-knight-indiana-s-combustible-coaching-giant-dies-at-age-83` ← biblio `associated-press-bob-knight-indiana-s-combustible-coaching-giant-dies-at-age-83` (exact_slug, score=100)
- `associated-press-bob-knight-s-chair-college-basketball-s-classic-furniture` ← biblio `associated-press-bob-knight-s-chair-college-basketball-s-classic-furniture` (exact_slug, score=100)
- `associated-press-kaepernick-eric-reid-settle-collusion-grievances-with-nfl` ← biblio `associated-press-kaepernick-eric-reid-settle-collusion-grievances-with-nfl` (exact_slug, score=100)
- `associated-press-kaepernick-files-grievance-against-nfl-alleging-collusion` ← biblio `associated-press-kaepernick-files-grievance-against-nfl-alleging-collusion` (exact_slug, score=100)
- `associated-press-nike-unveils-kaepernick-ad-to-air-during-nfl-season-opener` ← biblio `associated-press-nike-unveils-kaepernick-ad-to-air-during-nfl-season-opener` (exact_slug, score=100)
- `associated-press-return-of-the-hoosier-knight-back-at-indiana-after-20-years` ← biblio `associated-press-return-of-the-hoosier-knight-back-at-indiana-after-20-years` (exact_slug, score=100)
- `associated-press-trump-says-nfl-should-fire-players-who-kneel-during-anthem` ← biblio `associated-press-trump-says-nfl-should-fire-players-who-kneel-during-anthem` (exact_slug, score=100)
- `basketball-reference-bill-russell` ← biblio `basketball-reference-bill-russell` (exact_slug, score=100)
- `centers-for-disease-control-and-prevention-returning-to-sports` ← biblio `centers-for-disease-control-and-prevention-returning-to-sports` (exact_slug, score=100)
- `centers-for-disease-control-and-prevention-symptoms-of-concussion` ← biblio `centers-for-disease-control-and-prevention-symptoms-of-concussion` (exact_slug, score=100)
- `cnn-indiana-university-keeps-coach-knight-with-sanctions` ← biblio `cnn-indiana-university-keeps-coach-knight-with-sanctions` (exact_slug, score=100)
- `cnn-politics-trump-nfl-owners-should-fire-players-who-protest-the-national-anthem` ← biblio `cnn-politics-trump-nfl-owners-should-fire-players-who-protest-the-national-anthem` (exact_slug, score=100)
- `dave-studeman-the-triumph-of-moneyball` ← biblio `dave-studeman-the-triumph-of-moneyball` (exact_slug, score=100)
- `espn-colin-kaepernick-takes-knee-for-anthem-joined-by-teammate-eric-reid` ← biblio `espn-colin-kaepernick-takes-knee-for-anthem-joined-by-teammate-eric-reid` (exact_slug, score=100)
- `espn-emotional-bob-knight-ends-20-year-split-with-indiana` ← biblio `espn-emotional-bob-knight-ends-20-year-split-with-indiana` (exact_slug, score=100)
- `espn-new-policy-requires-on-field-players-personnel-to-stand-for-anthem` ← biblio `espn-new-policy-requires-on-field-players-personnel-to-stand-for-anthem` (exact_slug, score=100)
- `espn-nfl-commissioner-roger-goodell-says-nfl-was-wrong-not-to-listen-to-its-players-about-racism` ← biblio `espn-nfl-commissioner-roger-goodell-says-nfl-was-wrong-not-to-listen-to-its-players-about-racism` (exact_slug, score=100)
- `espn-qb-colin-kaepernick-files-grievance-for-collusion-against-nfl-owners` ← biblio `espn-qb-colin-kaepernick-files-grievance-for-collusion-against-nfl-owners` (exact_slug, score=100)
- `espn-roger-goodell-wish-we-had-listened-earlier-to-what-colin-kaepernick-was-protesting` ← biblio `espn-roger-goodell-wish-we-had-listened-earlier-to-what-colin-kaepernick-was-protesting` (exact_slug, score=100)
- `espn-transcript-of-brand-s-statement` ← biblio `espn-transcript-of-brand-s-statement` (exact_slug, score=100)
- `espn-video-supports-reed-s-allegation-against-knight` ← biblio `espn-video-supports-reed-s-allegation-against-knight` (exact_slug, score=100)
- `grand-slam-tournaments-statement-from-grand-slam-tournaments-regarding-naomi-osaka` ← biblio `grand-slam-tournaments-statement-from-grand-slam-tournaments-regarding-naomi-osaka` (exact_slug, score=100)
- `indiana-university-athletics-coach-bob-knight-passes-away-at-83` ← biblio `indiana-university-athletics-coach-bob-knight-passes-away-at-83` (exact_slug, score=100)
- `international-football-association-board-video-assistant-referee-var-protocol` ← biblio `international-football-association-board-video-assistant-referee-var-protocol` (exact_slug, score=100)
- `international-olympic-committee-gymnastics-what-are-the-twisties` ← biblio `international-olympic-committee-gymnastics-what-are-the-twisties` (exact_slug, score=100)
- `international-olympic-committee-simone-biles-all-titles-records-and-medals-complete-list` ← biblio `international-olympic-committee-simone-biles-all-titles-records-and-medals-complete-list` (exact_slug, score=100)
- `international-olympic-committee-simone-biles-opens-up-about-the-twisties-my-mind-and-body-are-si` ← biblio `international-olympic-committee-simone-biles-opens-up-about-the-twisties-my-mind-and-body-are-si` (exact_slug, score=100)
- `international-olympic-committee-simone-biles-speaks-about-pulling-out-of-team-event-i-took-a-ste` ← biblio `international-olympic-committee-simone-biles-speaks-about-pulling-out-of-team-event-i-took-a-ste` (exact_slug, score=100)
- `jackie-macmullan-the-little-known-story-behind-allen-iverson-s-practice-rant` ← biblio `jackie-macmullan-the-little-known-story-behind-allen-iverson-s-practice-rant` (exact_slug, score=100)
- `jahn-k-hakes-and-raymond-d-sauer-an-economic-evaluation-of-the-moneyball-hypothesis` ← biblio `jahn-k-hakes-and-raymond-d-sauer-an-economic-evaluation-of-the-moneyball-hypothesis` (exact_slug, score=100)
- `john-feinstein-a-season-on-the-brink` ← biblio `john-feinstein-a-season-on-the-brink` (exact_slug, score=100)
- `los-angeles-times-former-hoosier-reed-says-he-was-choked-by-knight` ← biblio `los-angeles-times-former-hoosier-reed-says-he-was-choked-by-knight` (exact_slug, score=100)
- `los-angeles-times-knight-suspended-for-a-game-by-big-ten-for-throwing-chair` ← biblio `los-angeles-times-knight-suspended-for-a-game-by-big-ten-for-throwing-chair` (exact_slug, score=100)
- `los-angeles-times-tape-has-knight-grabbing-player` ← biblio `los-angeles-times-tape-has-knight-grabbing-player` (exact_slug, score=100)
- `major-league-baseball-mlb-announces-abs-challenge-system-coming-to-the-major-leagues-beginning-i` ← biblio `major-league-baseball-mlb-announces-abs-challenge-system-coming-to-the-major-leagues-beginning-i` (exact_slug, score=100)
- `major-league-baseball-pitch-smart-pitching-guidelines` ← biblio `major-league-baseball-pitch-smart-pitching-guidelines` (exact_slug, score=100)
- `michael-lewis-moneyball-the-art-of-winning-an-unfair-game` ← biblio `michael-lewis-moneyball-the-art-of-winning-an-unfair-game` (exact_slug, score=100)
- `michael-marot-oft-injured-colts-qb-andrew-luck-29-announces-retirement` ← biblio `michael-marot-oft-injured-colts-qb-andrew-luck-29-announces-retirement` (exact_slug, score=100)
- `mlb-com-mlb-to-use-abs-challenge-system-starting-in-2026` ← biblio `mlb-com-mlb-to-use-abs-challenge-system-starting-in-2026` (exact_slug, score=100)
- `moore-et-al-factors-and-expectations-influencing-concussion-disclosure-within-ncaa-division-i-at` ← biblio `moore-et-al-factors-and-expectations-influencing-concussion-disclosure-within-ncaa-division-i-at` (exact_slug, score=100)
- `naomi-osaka-it-s-o-k-not-to-be-o-k` ← biblio `naomi-osaka-it-s-o-k-not-to-be-o-k` (exact_slug, score=100)
- `national-collegiate-athletic-association-concussion-fact-sheet-for-coaches` ← biblio `national-collegiate-athletic-association-concussion-fact-sheet-for-coaches` (exact_slug, score=100)
- `nba-com-legends-profile-bill-russell` ← biblio `nba-com-legends-profile-bill-russell` (exact_slug, score=100)
- `nba-com-nba-sends-teams-the-results-found-in-load-management-study` ← biblio `nba-com-nba-sends-teams-the-results-found-in-load-management-study` (exact_slug, score=100)
- `nba-communications-nba-board-of-governors-approves-new-player-participation-policy` ← biblio `nba-communications-nba-board-of-governors-approves-new-player-participation-policy` (exact_slug, score=100)
- `nbc-sports-boston-who-gets-most-of-the-credit-brady-or-belichick` ← biblio `nbc-sports-boston-who-gets-most-of-the-credit-brady-or-belichick` (exact_slug, score=100)
- `nfl-com-brady-to-have-season-ending-knee-surgery` ← biblio `nfl-com-brady-to-have-season-ending-knee-surgery` (exact_slug, score=100)
- `nfl-com-buccaneers-qb-tom-brady-extends-record-with-fifth-super-bowl-mvp` ← biblio `nfl-com-buccaneers-qb-tom-brady-extends-record-with-fifth-super-bowl-mvp` (exact_slug, score=100)
- `nfl-com-nfl-anthem-policy-on-hold-under-standstill-agreement` ← biblio `nfl-com-nfl-anthem-policy-on-hold-under-standstill-agreement` (exact_slug, score=100)
- `nfl-com-nfl-owners-approve-national-anthem-policy-for-2018` ← biblio `nfl-com-nfl-owners-approve-national-anthem-policy-for-2018` (exact_slug, score=100)
- `nfl-com-nfl-teams-unanimously-approve-simplified-catch-rule` ← biblio `nfl-com-nfl-teams-unanimously-approve-simplified-catch-rule` (exact_slug, score=100)
- `nfl-com-referee-dez-bryant-catch-incomplete-once-ball-hit-ground` ← biblio `nfl-com-referee-dez-bryant-catch-incomplete-once-ball-hit-ground` (exact_slug, score=100)
- `nfl-com-roger-goodell-nfl-wrong-for-not-listening-to-protesting-players-earlier` ← biblio `nfl-com-roger-goodell-nfl-wrong-for-not-listening-to-protesting-players-earlier` (exact_slug, score=100)
- `nfl-concussion-protocol-return-to-participation-protocol-overview` ← biblio `nfl-concussion-protocol-return-to-participation-protocol-overview` (exact_slug, score=100)
- `nfl-football-operations-art-mcnally-gameday-central` ← biblio `nfl-football-operations-art-mcnally-gameday-central` (exact_slug, score=100)
- `nick-wagoner-from-a-seat-to-a-knee-how-colin-kaepernick-and-nate-boyer-are-trying-to-affect-chan` ← biblio `nick-wagoner-from-a-seat-to-a-knee-how-colin-kaepernick-and-nate-boyer-are-trying-to-affect-chan` (exact_slug, score=100)
- `pro-football-reference-2008-new-england-patriots` ← biblio `pro-football-reference-2008-new-england-patriots` (exact_slug, score=100)
- `pro-football-reference-new-england-patriots-franchise-encyclopedia` ← biblio `pro-football-reference-new-england-patriots-franchise-encyclopedia` (exact_slug, score=100)
- `pro-football-reference-super-bowl-lv-box-score` ← biblio `pro-football-reference-super-bowl-lv-box-score` (exact_slug, score=100)
- `reuters-u-s-quarterback-kaepernick-settles-grievance-case-with-nfl` ← biblio `reuters-u-s-quarterback-kaepernick-settles-grievance-case-with-nfl` (exact_slug, score=100)
- `san-francisco-49ers-colin-kaepernick-opts-out-of-contract-becomes-a-free-agent` ← biblio `san-francisco-49ers-colin-kaepernick-opts-out-of-contract-becomes-a-free-agent` (exact_slug, score=100)
- `steve-wyche-colin-kaepernick-explains-why-he-sat-during-national-anthem` ← biblio `steve-wyche-colin-kaepernick-explains-why-he-sat-during-national-anthem` (exact_slug, score=100)
- `united-states-anti-doping-agency-lance-armstrong-receives-lifetime-ban-and-disqualification-of-c` ← biblio `united-states-anti-doping-agency-lance-armstrong-receives-lifetime-ban-and-disqualification-of-c` (exact_slug, score=100)
- `united-states-anti-doping-agency-reasoned-decision-of-the-united-states-anti-doping-agency-on-di` ← biblio `united-states-anti-doping-agency-reasoned-decision-of-the-united-states-anti-doping-agency-on-di` (exact_slug, score=100)
- `united-states-supreme-court-clay-v-united-states` ← biblio `united-states-supreme-court-clay-v-united-states` (exact_slug, score=100)
- `weber-rawlins-et-al-concussion-symptom-underreporting-among-incoming-ncaa-division-i-college-ath` ← biblio `weber-rawlins-et-al-concussion-symptom-underreporting-among-incoming-ncaa-division-i-college-ath` (exact_slug, score=100)
- `will-graves-biles-returns-to-olympic-competition-wins-bronze-on-beam` ← biblio `will-graves-biles-returns-to-olympic-competition-wins-bronze-on-beam` (exact_slug, score=100)
- `will-graves-biles-withdraws-from-gymnastics-final-to-protect-team-self` ← biblio `will-graves-biles-withdraws-from-gymnastics-final-to-protect-team-self` (exact_slug, score=100)
- `world-athletics-iconic-mexico-city-olympic-podium-protest-turns-50` ← biblio `world-athletics-iconic-mexico-city-olympic-podium-protest-turns-50` (exact_slug, score=100)

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

## `the-world-we-make-together`

- Bibliography: `books/the-world-we-make-together/back-matter/bibliography.md`
- Parse style: `pandoc_div` (54 entries)
- Semantic linked sources: 54
- Parse warning: other styles also matched: plain_chicago=53

### Matched (54)

- `abate-tom-nummi-workers-say-their-final-good-byes` ← biblio `abate-tom-nummi-workers-say-their-final-good-byes` (exact_slug, score=100)
- `adler-paul-s-the-learning-bureaucracy-new-united-motor-manufacturing-inc` ← biblio `adler-paul-s-the-learning-bureaucracy-new-united-motor-manufacturing-inc` (exact_slug, score=100)
- `belfast-agreement-good-friday-agreement-multi-party-agreement-and-british-irish-agreement-10-apr` ← biblio `belfast-agreement-good-friday-agreement-multi-party-agreement-and-british-irish-agreement-10-apr` (exact_slug, score=100)
- `blackpast-black-panther-party-s-free-breakfast-program-1969-1980` ← biblio `blackpast-black-panther-party-s-free-breakfast-program-1969-1980` (exact_slug, score=100)
- `brown-v-board-of-education-347-u-s-483-1954` ← biblio `brown-v-board-of-education-347-u-s-483-1954` (exact_slug, score=100)
- `bunkley-nick-g-m-and-toyota-s-joint-venture-ends-in-california` ← biblio `bunkley-nick-g-m-and-toyota-s-joint-venture-ends-in-california` (exact_slug, score=100)
- `california-african-american-museum-free-breakfast-for-school-children-program` ← biblio `california-african-american-museum-free-breakfast-for-school-children-program` (exact_slug, score=100)
- `carlyle-thomas-on-heroes-hero-worship-and-the-heroic-in-history` ← biblio `carlyle-thomas-on-heroes-hero-worship-and-the-heroic-in-history` (exact_slug, score=100)
- `church-committee-final-report-of-the-select-committee-to-study-governmental-operations-with-resp` ← biblio `church-committee-final-report-of-the-select-committee-to-study-governmental-operations-with-resp` (exact_slug, score=100)
- `constitution-of-the-republic-of-south-africa-act-200-of-1993-interim-constitution` ← biblio `constitution-of-the-republic-of-south-africa-act-200-of-1993-interim-constitution` (exact_slug, score=100)
- `eisenhower-dwight-d-executive-order-10730-providing-assistance-for-the-removal-of-an-obstruction` ← biblio `eisenhower-dwight-d-executive-order-10730-providing-assistance-for-the-removal-of-an-obstruction` (exact_slug, score=100)
- `electoral-commission-of-south-africa-27-apr-1994-national-election` ← biblio `electoral-commission-of-south-africa-27-apr-1994-national-election` (exact_slug, score=100)
- `encyclopedia-of-arkansas-lost-year` ← biblio `encyclopedia-of-arkansas-lost-year` (exact_slug, score=100)
- `federal-aviation-administration-mcdonnell-douglas-dc-8-61` ← biblio `federal-aviation-administration-mcdonnell-douglas-dc-8-61` (exact_slug, score=100)
- `feynman-richard-p-personal-observations-on-the-reliability-of-the-shuttle` ← biblio `feynman-richard-p-personal-observations-on-the-reliability-of-the-shuttle` (exact_slug, score=100)
- `fine-sidney-sit-down-the-general-motors-strike-of-1936-1937` ← biblio `fine-sidney-sit-down-the-general-motors-strike-of-1936-1937` (exact_slug, score=100)
- `follett-mary-parker-creative-experience` ← biblio `follett-mary-parker-creative-experience` (exact_slug, score=100)
- `follett-mary-parker-dynamic-administration-the-collected-papers-of-mary-parker-follett` ← biblio `follett-mary-parker-dynamic-administration-the-collected-papers-of-mary-parker-follett` (exact_slug, score=100)
- `founders-online-national-archives-from-george-washington-to-officers-of-the-army-15-march-1783` ← biblio `founders-online-national-archives-from-george-washington-to-officers-of-the-army-15-march-1783` (exact_slug, score=100)
- `harvard-university-pluralism-project-langar-the-communal-meal` ← biblio `harvard-university-pluralism-project-langar-the-communal-meal` (exact_slug, score=100)
- `lowcountry-digital-history-initiative-local-and-national-leader-septima-p-clark` ← biblio `lowcountry-digital-history-initiative-local-and-national-leader-septima-p-clark` (exact_slug, score=100)
- `lowcountry-digital-history-initiative-the-progressive-club-johns-island` ← biblio `lowcountry-digital-history-initiative-the-progressive-club-johns-island` (exact_slug, score=100)
- `martin-luther-king-jr-research-and-education-institute-stanford-university-i-have-a-dream` ← biblio `martin-luther-king-jr-research-and-education-institute-stanford-university-i-have-a-dream` (exact_slug, score=100)
- `mcgregor-douglas-the-human-side-of-enterprise` ← biblio `mcgregor-douglas-the-human-side-of-enterprise` (exact_slug, score=100)
- `mill-john-stuart-considerations-on-representative-government` ← biblio `mill-john-stuart-considerations-on-representative-government` (exact_slug, score=100)
- `mount-vernon-newburgh-address` ← biblio `mount-vernon-newburgh-address` (exact_slug, score=100)
- `mount-vernon-newburgh-conspiracy` ← biblio `mount-vernon-newburgh-conspiracy` (exact_slug, score=100)
- `national-aeronautics-and-space-administration-apollo-11-mission-report` ← biblio `national-aeronautics-and-space-administration-apollo-11-mission-report` (exact_slug, score=100)
- `national-aeronautics-and-space-administration-managing-nasa-in-the-apollo-era` ← biblio `national-aeronautics-and-space-administration-managing-nasa-in-the-apollo-era` (exact_slug, score=100)
- `national-museum-of-african-american-history-and-culture-black-panther-party-community-survival-p` ← biblio `national-museum-of-african-american-history-and-culture-black-panther-party-community-survival-p` (exact_slug, score=100)
- `national-museum-of-american-history-i-have-a-dream` ← biblio `national-museum-of-american-history-i-have-a-dream` (exact_slug, score=100)
- `national-park-service-little-rock-central-high-school-national-historic-site-https-www-nps-gov-c` ← biblio `national-park-service-little-rock-central-high-school-national-historic-site-https-www-nps-gov-c` (exact_slug, score=100)
- `national-park-service-march-history` ← biblio `national-park-service-march-history` (exact_slug, score=100)
- `national-park-service-march-on-washington-for-jobs-and-freedom` ← biblio `national-park-service-march-on-washington-for-jobs-and-freedom` (exact_slug, score=100)
- `national-park-service-pullman-national-historical-park-https-www-nps-gov-pull` ← biblio `national-park-service-pullman-national-historical-park-https-www-nps-gov-pull` (exact_slug, score=100)
- `national-transportation-safety-board-aircraft-accident-report-united-airlines-inc-mcdonnell-doug` ← biblio `national-transportation-safety-board-aircraft-accident-report-united-airlines-inc-mcdonnell-doug` (exact_slug, score=100)
- `northern-ireland-department-of-justice-department-of-justice-interface-programme` ← biblio `northern-ireland-department-of-justice-department-of-justice-interface-programme` (exact_slug, score=100)
- `northern-ireland-office-electoral-office-for-northern-ireland-results-of-the-22-may-1998-referen` ← biblio `northern-ireland-office-electoral-office-for-northern-ireland-results-of-the-22-may-1998-referen` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `payne-charles-m-i-ve-got-the-light-of-freedom-the-organizing-tradition-and-the-mississippi-freed` ← biblio `payne-charles-m-i-ve-got-the-light-of-freedom-the-organizing-tradition-and-the-mississippi-freed` (exact_slug, score=100)
- `pettigrew-thomas-f-and-linda-r-tropp-a-meta-analytic-test-of-intergroup-contact-theory` ← biblio `pettigrew-thomas-f-and-linda-r-tropp-a-meta-analytic-test-of-intergroup-contact-theory` (exact_slug, score=100)
- `presidential-commission-on-the-space-shuttle-challenger-accident-rogers-commission-report-of-the` ← biblio `presidential-commission-on-the-space-shuttle-challenger-accident-rogers-commission-report-of-the` (exact_slug, score=100)
- `ransby-barbara-ella-baker-and-the-black-freedom-movement-a-radical-democratic-vision` ← biblio `ransby-barbara-ella-baker-and-the-black-freedom-movement-a-radical-democratic-vision` (exact_slug, score=100)
- `reynolds-v-sims-377-u-s-533-1964` ← biblio `reynolds-v-sims-377-u-s-533-1964` (exact_slug, score=100)
- `sncc-digital-gateway-birth-of-sncc` ← biblio `sncc-digital-gateway-birth-of-sncc` (exact_slug, score=100)
- `south-african-history-online-denis-farrell` ← biblio `south-african-history-online-denis-farrell` (exact_slug, score=100)
- `south-african-history-online-election-results-1994` ← biblio `south-african-history-online-election-results-1994` (exact_slug, score=100)
- `south-african-history-online-the-south-african-general-elections-1994` ← biblio `south-african-history-online-the-south-african-general-elections-1994` (exact_slug, score=100)
- `sveriges-riksbank-prize-in-economic-sciences-in-memory-of-alfred-nobel-2009-prize-announcement-f` ← biblio `sveriges-riksbank-prize-in-economic-sciences-in-memory-of-alfred-nobel-2009-prize-announcement-f` (exact_slug, score=100)
- `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of-care` ← biblio `tronto-joan-c-moral-boundaries-a-political-argument-for-an-ethic-of-care` (exact_slug, score=100)
- `u-s-department-of-agriculture-food-and-nutrition-service-school-breakfast-program-faqs` ← biblio `u-s-department-of-agriculture-food-and-nutrition-service-school-breakfast-program-faqs` (exact_slug, score=100)
- `u-s-government-accountability-office-year-2000-computing-challenge-lessons-learned-can-be-applie` ← biblio `u-s-government-accountability-office-year-2000-computing-challenge-lessons-learned-can-be-applie` (exact_slug, score=100)
- `united-states-strike-commission-report-on-the-chicago-strike-of-june-july-1894` ← biblio `united-states-strike-commission-report-on-the-chicago-strike-of-june-july-1894` (exact_slug, score=100)
- `world-bank-brazil-toward-a-more-inclusive-and-effective-participatory-budget-in-porto-alegre` ← biblio `world-bank-brazil-toward-a-more-inclusive-and-effective-participatory-budget-in-porto-alegre` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (34)

- `347-u-s-483-1954-brown-v-board-of-education` (347 U.S. 483 (1954) *Brown v. Board of Education*)
- `377-u-s-533-1964-reynolds-v-sims` (377 U.S. 533 (1964) *Reynolds v. Sims*)
- `belfast-agreement-good-friday-agreement-multi-party-agreement-and-british-irish-agreement-10-april-1998-london-uk-government-https-www-gov-uk-government-publications-the-belfast-agreement` (*Belfast Agreement* (Good Friday Agreement). Multi-Party Agreement and British-Irish Agreement, 10 April 1998. London: UK Government. https://www.gov.uk/government/publications/the-belfast-agreement)
- `blackpast` (BlackPast)
- `california-african-american-museum` (California African American Museum)
- `church-committee` (Church Committee)
- `constitution-of-the-republic-of-south-africa-act-200-of-1993-interim-constitution` (Constitution of the Republic of South Africa Act 200 of 1993 (Interim Constitution))
- `eisenhower-dwight-d-executive-order-10730-providing-assistance-for-the-removal-of-an-obstruction-of-justice-within-the-state-of-arkansas-24-september-1957-national-archives-https-www-archives-gov-milestone-documents-executive-order-10730` (Eisenhower, Dwight D. Executive Order 10730, "Providing Assistance for the Removal of an Obstruction of Justice within the State of Arkansas." 24 September 1957. National Archives. https://www.archives.gov/milestone-documents/executive-order-10730)
- `electoral-commission-of-south-africa` (Electoral Commission of South Africa)
- `encyclopedia-of-arkansas` (Encyclopedia of Arkansas)
- `especially-the-commons-https-www-nobelprize-org-prizes-economic-sciences-2009-summary-sveriges-riksbank-prize-in-economic-sciences-in-memory-of-alfred-nobel-2009-prize-announcement-for-elinor-ostrom-for-her-analysis-of-economic-governance` (especially the commons"). https://www.nobelprize.org/prizes/economic-sciences/2009/summary/ Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel 2009. Prize announcement for Elinor Ostrom ("for her analysis of economic governance)
- `federal-aviation-administration` (Federal Aviation Administration)
- `harvard-university-pluralism-project` (Harvard University Pluralism Project)
- `lowcountry-digital-history-initiative` (Lowcountry Digital History Initiative)
- `martin-luther-king-jr-research-and-education-institute-stanford-university` (Martin Luther King, Jr. Research and Education Institute, Stanford University)
- `mount-vernon` (Mount Vernon)
- `national-aeronautics-and-space-administration` (National Aeronautics and Space Administration)
- `national-archives-founders-online` (National Archives Founders Online)
- `national-museum-of-african-american-history-and-culture-black-panther-party-community-survival-programs-washington-dc-smithsonian-institution-https-nmaahc-si-edu` (National Museum of African American History and Culture. Black Panther Party community survival programs. Washington, DC: Smithsonian Institution. https://nmaahc.si.edu/)
- `national-museum-of-american-history` (National Museum of American History)
- `national-park-service` (National Park Service)
- `national-park-service-little-rock-central-high-school-national-historic-site-https-www-nps-gov-chsc` (National Park Service. Little Rock Central High School National Historic Site. https://www.nps.gov/chsc/)
- `national-park-service-pullman-national-historical-park-https-www-nps-gov-pull` (National Park Service. Pullman National Historical Park. https://www.nps.gov/pull/)
- `national-transportation-safety-board` (National Transportation Safety Board)
- `nick-bunkley` (Nick Bunkley)
- `northern-ireland-department-of-justice` (Northern Ireland Department of Justice)
- `northern-ireland-office-electoral-office-for-northern-ireland-results-of-the-22-may-1998-referendum-on-the-belfast-agreement` (Northern Ireland Office / Electoral Office for Northern Ireland. Results of the 22 May 1998 referendum on the Belfast Agreement)
- `pettigrew-thomas-f-and-linda-r-tropp` (Pettigrew, Thomas F., and Linda R. Tropp)
- `presidential-commission-on-the-space-shuttle-challenger-accident-rogers-commission` (Presidential Commission on the Space Shuttle Challenger Accident (Rogers Commission))
- `sncc-digital-gateway` (SNCC Digital Gateway)
- `tom-abate` (Tom Abate)
- `u-s-department-of-agriculture-food-and-nutrition-service` (U.S. Department of Agriculture, Food and Nutrition Service)
- `u-s-government-accountability-office` (U.S. Government Accountability Office)
- `united-states-strike-commission` (United States Strike Commission)

### Orphan creatorSlugs on linked sources (25)

- `tom-abate` on `abate-tom-nummi-workers-say-their-final-good-byes`
- `blackpast` on `blackpast-black-panther-party-s-free-breakfast-program-1969-1980`
- `nick-bunkley` on `bunkley-nick-g-m-and-toyota-s-joint-venture-ends-in-california`
- `california-african-american-museum` on `california-african-american-museum-free-breakfast-for-school-children-program`
- `church-committee` on `church-committee-final-report-of-the-select-committee-to-study-governmental-operations-with-resp`
- `electoral-commission-of-south-africa` on `electoral-commission-of-south-africa-27-apr-1994-national-election`
- `encyclopedia-of-arkansas` on `encyclopedia-of-arkansas-lost-year`
- `federal-aviation-administration` on `federal-aviation-administration-mcdonnell-douglas-dc-8-61`
- `national-archives-founders-online` on `founders-online-national-archives-from-george-washington-to-officers-of-the-army-15-march-1783`
- `harvard-university-pluralism-project` on `harvard-university-pluralism-project-langar-the-communal-meal`
- `lowcountry-digital-history-initiative` on `lowcountry-digital-history-initiative-local-and-national-leader-septima-p-clark`
- `lowcountry-digital-history-initiative` on `lowcountry-digital-history-initiative-the-progressive-club-johns-island`
- `mount-vernon` on `mount-vernon-newburgh-address`
- `mount-vernon` on `mount-vernon-newburgh-conspiracy`
- `national-aeronautics-and-space-administration` on `national-aeronautics-and-space-administration-apollo-11-mission-report`
- `national-aeronautics-and-space-administration` on `national-aeronautics-and-space-administration-managing-nasa-in-the-apollo-era`
- `national-museum-of-american-history` on `national-museum-of-american-history-i-have-a-dream`
- `national-park-service` on `national-park-service-march-history`
- `national-park-service` on `national-park-service-march-on-washington-for-jobs-and-freedom`
- `national-transportation-safety-board` on `national-transportation-safety-board-aircraft-accident-report-united-airlines-inc-mcdonnell-doug`
- `northern-ireland-department-of-justice` on `northern-ireland-department-of-justice-department-of-justice-interface-programme`
- `pettigrew-thomas-f-and-linda-r-tropp` on `pettigrew-thomas-f-and-linda-r-tropp-a-meta-analytic-test-of-intergroup-contact-theory`
- `sncc-digital-gateway` on `sncc-digital-gateway-birth-of-sncc`
- `u-s-government-accountability-office` on `u-s-government-accountability-office-year-2000-computing-challenge-lessons-learned-can-be-applie`
- `united-states-strike-commission` on `united-states-strike-commission-report-on-the-chicago-strike-of-june-july-1894`

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
- Semantic linked sources: 21
- Parse warning: other styles also matched: plain_chicago=1

### Matched (21)

- `columbia-accident-investigation-board-report-of-the-columbia-accident-investigation-board` ← biblio `columbia-accident-investigation-board-report-of-the-columbia-accident-investigation-board` (exact_slug, score=100)
- `federal-aviation-administration-and-nasa-aviation-safety-reporting-system-asrs` ← biblio `federal-aviation-administration-and-nasa-aviation-safety-reporting-system-asrs` (exact_slug, score=100)
- `gleeson-white-jane-double-entry-how-the-merchants-of-venice-created-modern-finance` ← biblio `gleeson-white-jane-double-entry-how-the-merchants-of-venice-created-modern-finance` (exact_slug, score=100)
- `ioannidis-john-p-a-why-most-published-research-findings-are-false` ← biblio `ioannidis-john-p-a-why-most-published-research-findings-are-false` (exact_slug, score=100)
- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` ← biblio `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` (exact_slug, score=100)
- `johnson-steven-the-ghost-map-the-story-of-london-s-most-terrifying-epidemic-and-how-it-changed-s` ← biblio `johnson-steven-the-ghost-map-the-story-of-london-s-most-terrifying-epidemic-and-how-it-changed-s` (exact_slug, score=100)
- `kahneman-daniel-and-gary-klein-conditions-for-intuitive-expertise-a-failure-to-disagree` ← biblio `kahneman-daniel-and-gary-klein-conditions-for-intuitive-expertise-a-failure-to-disagree` (exact_slug, score=100)
- `kahneman-daniel-thinking-fast-and-slow` ← biblio `kahneman-daniel-thinking-fast-and-slow` (exact_slug, score=100)
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
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` (exact_slug, score=100)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

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
- Semantic linked sources: 51

### Matched (51)

- `alexander-robin-die-getriebenen-merkel-und-die-fl-chtlingspolitik` ← biblio `alexander-robin-die-getriebenen-merkel-und-die-fl-chtlingspolitik` (exact_slug, score=100)
- `blackwell-richard-j-galileo-bellarmine-and-the-bible` ← biblio `blackwell-richard-j-galileo-bellarmine-and-the-bible` (exact_slug, score=100)
- `blyth-mark-austerity-the-history-of-a-dangerous-idea` ← biblio `blyth-mark-austerity-the-history-of-a-dangerous-idea` (exact_slug, score=100)
- `branch-taylor-at-canaan-s-edge-america-in-the-king-years-1965-68` ← biblio `branch-taylor-at-canaan-s-edge-america-in-the-king-years-1965-68` (exact_slug, score=100)
- `branch-taylor-parting-the-waters-america-in-the-king-years-1954-63` ← biblio `branch-taylor-parting-the-waters-america-in-the-king-years-1954-63` (exact_slug, score=100)
- `branch-taylor-pillar-of-fire-america-in-the-king-years-1963-65` ← biblio `branch-taylor-pillar-of-fire-america-in-the-king-years-1963-65` (exact_slug, score=100)
- `brook-timothy-quelling-the-people-the-military-suppression-of-the-beijing-democracy-movement` ← biblio `brook-timothy-quelling-the-people-the-military-suppression-of-the-beijing-democracy-movement` (exact_slug, score=100)
- `brownell-kelly-d-and-kenneth-e-warner-the-perils-of-ignoring-history-big-tobacco-played-dirty-an` ← biblio `brownell-kelly-d-and-kenneth-e-warner-the-perils-of-ignoring-history-big-tobacco-played-dirty-an` (exact_slug, score=100)
- `calhoun-craig-neither-gods-nor-emperors-students-and-the-struggle-for-democracy-in-china` ← biblio `calhoun-craig-neither-gods-nor-emperors-students-and-the-struggle-for-democracy-in-china` (exact_slug, score=100)
- `ceplair-larry-and-steven-englund-the-inquisition-in-hollywood-politics-in-the-film-community-193` ← biblio `ceplair-larry-and-steven-englund-the-inquisition-in-hollywood-politics-in-the-film-community-193` (exact_slug, score=100)
- `chernow-ron-washington-a-life` ← biblio `chernow-ron-washington-a-life` (exact_slug, score=100)
- `connolly-kate-angela-merkel-gives-germans-a-hard-lesson-in-covid-numbers` ← biblio `connolly-kate-angela-merkel-gives-germans-a-hard-lesson-in-covid-numbers` (exact_slug, score=100)
- `connolly-kate-germany-agonises-over-merkel-s-legacy-did-she-hand-too-much-power-to-putin` ← biblio `connolly-kate-germany-agonises-over-merkel-s-legacy-did-she-hand-too-much-power-to-putin` (exact_slug, score=100)
- `de-la-merced-michael-j-pepsico-tells-activist-investor-its-answer-is-still-no` ← biblio `de-la-merced-michael-j-pepsico-tells-activist-investor-its-answer-is-still-no` (exact_slug, score=100)
- `drake-stillman-discoveries-and-opinions-of-galileo` ← biblio `drake-stillman-discoveries-and-opinions-of-galileo` (exact_slug, score=100)
- `dunbar-erica-armstrong-never-caught-the-washingtons-relentless-pursuit-of-their-runaway-slave-on` ← biblio `dunbar-erica-armstrong-never-caught-the-washingtons-relentless-pursuit-of-their-runaway-slave-on` (exact_slug, score=100)
- `dyson-michael-eric-i-may-not-get-there-with-you-the-true-martin-luther-king-jr` ← biblio `dyson-michael-eric-i-may-not-get-there-with-you-the-true-martin-luther-king-jr` (exact_slug, score=100)
- `ellis-joseph-j-his-excellency-george-washington` ← biblio `ellis-joseph-j-his-excellency-george-washington` (exact_slug, score=100)
- `fantoli-annibale-galileo-for-copernicanism-and-for-the-church` ← biblio `fantoli-annibale-galileo-for-copernicanism-and-for-the-church` (exact_slug, score=100)
- `finocchiaro-maurice-a-the-galileo-affair-a-documentary-history` ← biblio `finocchiaro-maurice-a-the-galileo-affair-a-documentary-history` (exact_slug, score=100)
- `galilei-galileo-dialogue-concerning-the-two-chief-world-systems` ← biblio `galilei-galileo-dialogue-concerning-the-two-chief-world-systems` (exact_slug, score=100)
- `galilei-galileo-sidereus-nuncius-or-the-sidereal-messenger` ← biblio `galilei-galileo-sidereus-nuncius-or-the-sidereal-messenger` (exact_slug, score=100)
- `garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con` ← biblio `garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con` (exact_slug, score=100)
- `garrow-david-j-the-fbi-and-martin-luther-king-jr-from-solo-to-memphis` ← biblio `garrow-david-j-the-fbi-and-martin-luther-king-jr-from-solo-to-memphis` (exact_slug, score=100)
- `grice-h-p-logic-and-conversation` ← biblio `grice-h-p-logic-and-conversation` (exact_slug, score=100)
- `heilbron-john-l-galileo` ← biblio `heilbron-john-l-galileo` (exact_slug, score=100)
- `hirschfeld-fritz-george-washington-and-slavery-a-documentary-portrayal` ← biblio `hirschfeld-fritz-george-washington-and-slavery-a-documentary-portrayal` (exact_slug, score=100)
- `king-martin-luther-jr-beyond-vietnam-a-time-to-break-silence` ← biblio `king-martin-luther-jr-beyond-vietnam-a-time-to-break-silence` (exact_slug, score=100)
- `king-martin-luther-jr-letter-from-birmingham-jail` ← biblio `king-martin-luther-jr-letter-from-birmingham-jail` (exact_slug, score=100)
- `lim-louisa-the-people-s-republic-of-amnesia-tiananmen-revisited` ← biblio `lim-louisa-the-people-s-republic-of-amnesia-tiananmen-revisited` (exact_slug, score=100)
- `lin-justin-yifu-the-household-responsibility-system-in-china-s-agricultural-reform` ← biblio `lin-justin-yifu-the-household-responsibility-system-in-china-s-agricultural-reform` (exact_slug, score=100)
- `mamdani-mahmood-amnesty-or-impunity-a-preliminary-critique-of-the-report-of-the-truth-and-reconc` ← biblio `mamdani-mahmood-amnesty-or-impunity-a-preliminary-critique-of-the-report-of-the-truth-and-reconc` (exact_slug, score=100)
- `marton-kati-the-chancellor-the-remarkable-odyssey-of-angela-merkel` ← biblio `marton-kati-the-chancellor-the-remarkable-odyssey-of-angela-merkel` (exact_slug, score=100)
- `merritt-anna-c-daniel-a-effron-and-beno-t-monin-moral-self-licensing-when-being-good-frees-us-to` ← biblio `merritt-anna-c-daniel-a-effron-and-beno-t-monin-moral-self-licensing-when-being-good-frees-us-to` (exact_slug, score=100)
- `navasky-victor-s-naming-names` ← biblio `navasky-victor-s-naming-names` (exact_slug, score=100)
- `nooyi-indra-my-life-in-full-work-family-and-our-future` ← biblio `nooyi-indra-my-life-in-full-work-family-and-our-future` (exact_slug, score=100)
- `packer-george-the-quiet-german` ← biblio `packer-george-the-quiet-german` (exact_slug, score=100)
- `sampson-anthony-mandela-the-authorized-biography` ← biblio `sampson-anthony-mandela-the-authorized-biography` (exact_slug, score=100)
- `schrecker-ellen-many-are-the-crimes-mccarthyism-in-america` ← biblio `schrecker-ellen-many-are-the-crimes-mccarthyism-in-america` (exact_slug, score=100)
- `slaughter-thomas-p-the-whiskey-rebellion-frontier-epilogue-to-the-american-revolution` ← biblio `slaughter-thomas-p-the-whiskey-rebellion-frontier-epilogue-to-the-american-revolution` (exact_slug, score=100)
- `sparks-allister-tomorrow-is-another-country-the-inside-story-of-south-africa-s-road-to-change` ← biblio `sparks-allister-tomorrow-is-another-country-the-inside-story-of-south-africa-s-road-to-change` (exact_slug, score=100)
- `steffensen-kevin-how-meaning-moves` ← biblio `steffensen-kevin-how-meaning-moves` (exact_slug, score=100)
- `steffensen-kevin-when-others-look-to-you-companion-edition` ← biblio `steffensen-kevin-when-others-look-to-you-companion-edition` (exact_slug, score=100)
- `thompson-mary-v-the-only-unavoidable-subject-of-regret-george-washington-slavery-and-the-enslave` ← biblio `thompson-mary-v-the-only-unavoidable-subject-of-regret-george-washington-slavery-and-the-enslave` (exact_slug, score=100)
- `vogel-ezra-f-deng-xiaoping-and-the-transformation-of-china` ← biblio `vogel-ezra-f-deng-xiaoping-and-the-transformation-of-china` (exact_slug, score=100)
- `waldmeir-patti-anatomy-of-a-miracle-the-end-of-apartheid-and-the-birth-of-the-new-south-africa` ← biblio `waldmeir-patti-anatomy-of-a-miracle-the-end-of-apartheid-and-the-birth-of-the-new-south-africa` (exact_slug, score=100)
- `washington-george-farewell-address-19-september-1796` ← biblio `washington-george-farewell-address-19-september-1796` (exact_slug, score=100)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive-sociology` (exact_slug, score=100)
- `zhou-kate-xiao-how-the-farmers-changed-china-power-of-the-people` ← biblio `zhou-kate-xiao-how-the-farmers-changed-china-power-of-the-people` (exact_slug, score=100)
- `eagly-alice-h-and-linda-l-carli-through-the-labyrinth-the-truth` ← biblio `eagly-alice-h-and-linda-l-carli-through-the-labyrinth-the-truth-about-how-women-become-leaders` (title_author, score=85)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `truth-and-reconciliation-commission-of-south-africa-report` (title_author_short, score=70)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (7)

- `brownell-kelly-d-and-kenneth-e-warner` (Brownell, Kelly D., and Kenneth E. Warner)
- `ceplair-larry-and-steven-englund` (Ceplair, Larry, and Steven Englund)
- `eagly-alice-h-and-linda-l-carli` (Eagly, Alice H., and Linda L. Carli)
- `george-farewell-address-19-september-1796-washington` (George. Farewell Address. 19 September 1796 Washington)
- `merritt-anna-c-daniel-a-effron-and-beno-t-monin` (Merritt, Anna C., Daniel A. Effron, and Benoît Monin)
- `michael-j-de-la-merc` (Michael J de la Merc)
- `truth-and-reconciliation-commission-of-south-africa` (Truth and Reconciliation Commission of South Africa)

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
- Parse style: `plain_chicago` (47 entries)
- Semantic linked sources: 47

### Matched (47)

- `american-college-of-emergency-physicians-boarding` ← biblio `american-college-of-emergency-physicians-boarding` (exact_slug, score=100)
- `campbell-donald-t-assessing-the-impact-of-planned-social-change` ← biblio `campbell-donald-t-assessing-the-impact-of-planned-social-change` (exact_slug, score=100)
- `cappelli-peter-and-anna-tavis-the-performance-management-revolution` ← biblio `cappelli-peter-and-anna-tavis-the-performance-management-revolution` (exact_slug, score=100)
- `center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-open` ← biblio `center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-open` (exact_slug, score=100)
- `centers-for-medicare-medicaid-services-ms-drg-classifications-and-software` ← biblio `centers-for-medicare-medicaid-services-ms-drg-classifications-and-software` (exact_slug, score=100)
- `cohn-jonathan-the-ten-year-war-obamacare-and-the-unmaking-of-american-establishment` ← biblio `cohn-jonathan-the-ten-year-war-obamacare-and-the-unmaking-of-american-establishment` (exact_slug, score=100)
- `european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-es` ← biblio `european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-es` (exact_slug, score=100)
- `every-student-succeeds-act-of-2015-pub-l-no-114-95-1111-1112` ← biblio `every-student-succeeds-act-of-2015-pub-l-no-114-95-1111-1112` (exact_slug, score=100)
- `federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov` ← biblio `federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov` (exact_slug, score=100)
- `garfield-eugene-the-history-and-meaning-of-the-impact-factor` ← biblio `garfield-eugene-the-history-and-meaning-of-the-impact-factor` (exact_slug, score=100)
- `greenberg-jerald-organizational-justice-yesterday-today-and-tomorrow` ← biblio `greenberg-jerald-organizational-justice-yesterday-today-and-tomorrow` (exact_slug, score=100)
- `grissom-jason-a-et-al-teacher-stress-and-health-effects-on-teachers-students-and-schools` ← biblio `grissom-jason-a-et-al-teacher-stress-and-health-effects-on-teachers-students-and-schools` (exact_slug, score=100)
- `haugen-frances-testimony-and-disclosures-regarding-facebook-internal-research-on-engagement-base` ← biblio `haugen-frances-testimony-and-disclosures-regarding-facebook-internal-research-on-engagement-base` (exact_slug, score=100)
- `hersh-eitan-politics-is-for-power` ← biblio `hersh-eitan-politics-is-for-power` (exact_slug, score=100)
- `hirsch-jorge-e-an-index-to-quantify-an-individual-s-scientific-research-output` ← biblio `hirsch-jorge-e-an-index-to-quantify-an-individual-s-scientific-research-output` (exact_slug, score=100)
- `horwitz-jeff-and-deepa-seetharaman-facebook-executives-shut-down-efforts-to-make-the-site-less-d` ← biblio `horwitz-jeff-and-deepa-seetharaman-facebook-executives-shut-down-efforts-to-make-the-site-less-d` (exact_slug, score=100)
- `institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point` ← biblio `institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point` (exact_slug, score=100)
- `integrity-council-for-the-voluntary-carbon-market-core-carbon-principles` ← biblio `integrity-council-for-the-voluntary-carbon-market-core-carbon-principles` (exact_slug, score=100)
- `international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of` ← biblio `international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of` (exact_slug, score=100)
- `ioannidis-john-p-a-why-most-published-research-findings-are-false` ← biblio `ioannidis-john-p-a-why-most-published-research-findings-are-false` (exact_slug, score=100)
- `jameton-andrew-nursing-practice-the-ethical-issues` ← biblio `jameton-andrew-nursing-practice-the-ethical-issues` (exact_slug, score=100)
- `knight-foundation-and-gallup-american-views-trust-media-and-democracy` ← biblio `knight-foundation-and-gallup-american-views-trust-media-and-democracy` (exact_slug, score=100)
- `learning-policy-institute-teacher-shortages-and-turnover-in-the-united-states` ← biblio `learning-policy-institute-teacher-shortages-and-turnover-in-the-united-states` (exact_slug, score=100)
- `monmonier-mark-how-to-lie-with-maps` ← biblio `monmonier-mark-how-to-lie-with-maps` (exact_slug, score=100)
- `national-academy-of-medicine-taking-action-against-clinician-burnout-a-systems-approach-to-profe` ← biblio `national-academy-of-medicine-taking-action-against-clinician-burnout-a-systems-approach-to-profe` (exact_slug, score=100)
- `national-center-for-education-statistics-adjusted-cohort-graduation-rate-acgr` ← biblio `national-center-for-education-statistics-adjusted-cohort-graduation-rate-acgr` (exact_slug, score=100)
- `national-science-foundation-proposal-award-policies-procedures-guide` ← biblio `national-science-foundation-proposal-award-policies-procedures-guide` (exact_slug, score=100)
- `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` ← biblio `open-science-collaboration-estimating-the-reproducibility-of-psychological-science` (exact_slug, score=100)
- `organisation-for-economic-co-operation-and-development-pisa-2022-results` ← biblio `organisation-for-economic-co-operation-and-development-pisa-2022-results` (exact_slug, score=100)
- `pew-research-center-a-guide-to-pew-research-center-s-methodology` ← biblio `pew-research-center-a-guide-to-pew-research-center-s-methodology` (exact_slug, score=100)
- `pew-research-center-how-pew-research-center-conducts-surveys-in-the-united-states` ← biblio `pew-research-center-how-pew-research-center-conducts-surveys-in-the-united-states` (exact_slug, score=100)
- `pew-research-center-public-trust-in-government-1958-2024` ← biblio `pew-research-center-public-trust-in-government-1958-2024` (exact_slug, score=100)
- `pichai-sundar-testimony-before-the-u-s-house-judiciary-committee-december-11-2018` ← biblio `pichai-sundar-testimony-before-the-u-s-house-judiciary-committee-december-11-2018` (exact_slug, score=100)
- `reuters-institute-for-the-study-of-journalism-digital-news-report-2024` ← biblio `reuters-institute-for-the-study-of-journalism-digital-news-report-2024` (exact_slug, score=100)
- `rushton-cynda-hylton-moral-distress-and-moral-resilience` ← biblio `rushton-cynda-hylton-moral-distress-and-moral-resilience` (exact_slug, score=100)
- `san-francisco-declaration-on-research-assessment-dora-2012-https-sfdora-org` ← biblio `san-francisco-declaration-on-research-assessment-dora-2012-https-sfdora-org` (exact_slug, score=100)
- `science-based-targets-initiative-corporate-net-zero-standard` ← biblio `science-based-targets-initiative-corporate-net-zero-standard` (exact_slug, score=100)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug, score=100)
- `u-s-environmental-protection-agency-notice-of-violation-volkswagen-clean-diesel-vehicles` ← biblio `u-s-environmental-protection-agency-notice-of-violation-volkswagen-clean-diesel-vehicles` (exact_slug, score=100)
- `voluntary-carbon-markets-integrity-initiative-claims-code-of-practice` ← biblio `voluntary-carbon-markets-integrity-initiative-claims-code-of-practice` (exact_slug, score=100)
- `worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109` ← biblio `worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109` (exact_slug, score=100)
- `zuckerberg-mark-testimony-before-the-u-s-senate-judiciary-and-commerce-committees-april-10-11-20` ← biblio `zuckerberg-mark-testimony-before-the-u-s-senate-judiciary-and-commerce-committees-april-10-11-20` (exact_slug, score=100)
- `centers-for-medicare-medicaid-services-hospital-readmissions` ← biblio `centers-for-medicare-medicaid-services-hospital-readmissions-reduction-program-hrrp` (title_author, score=85)
- `talbot-s-g-and-w-dean-physicians-aren-t-burning-out-they-re` ← biblio `talbot-s-g-and-w-dean-physicians-aren-t-burning-out-they-re-suffering-from-moral-injury` (title_author, score=85)
- `united-nations-framework-convention-on-climate-change-paris` ← biblio `united-nations-framework-convention-on-climate-change-paris-agreement` (title_author, score=85)
- `world-bank-state-and-trends-of-carbon-pricing` ← biblio `world-bank-state-and-trends-of-carbon-pricing-2024` (title_jaccard, score=65)
- `congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions` ← biblio `congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions-2` (summary_overlap, score=58)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (14)

- `cappelli-peter-and-anna-tavis` (Cappelli, Peter, and Anna Tavis)
- `center-for-responsive-politics-opensecrets-fundraising-totals-and-donor-reporting-https-www-opensecrets-org` (Center for Responsive Politics (OpenSecrets). Fundraising totals and donor reporting. https://www.opensecrets.org/)
- `congressional-record-111th-congress-debate-on-affordable-care-act-and-public-option-provisions-2009-2010` (Congressional Record. 111th Congress. Debate on Affordable Care Act and public-option provisions, 2009-2010)
- `european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-esrs-2023-https-www-efrag-org` (European Financial Reporting Advisory Group (EFRAG). European Sustainability Reporting Standards (ESRS). 2023. https://www.efrag.org/)
- `every-student-succeeds-act-of-2015-pub-l-no-114-95-1111-1112` (Every Student Succeeds Act of 2015, Pub. L. No. 114-95, §§ 1111-1112)
- `federal-election-commission-campaign-finance-disclosure-data-https-www-fec-gov` (Federal Election Commission. Campaign finance disclosure data. https://www.fec.gov/)
- `haugen-frances-testimony-and-disclosures-regarding-facebook-internal-research-on-engagement-based-ranking-u-s-senate-commerce-subcommittee-on-consumer-protection-october-5-2021` (Haugen, Frances. Testimony and disclosures regarding Facebook internal research on engagement-based ranking. U.S. Senate Commerce Subcommittee on Consumer Protection, October 5, 2021)
- `horwitz-jeff-and-deepa-seetharaman` (Horwitz, Jeff, and Deepa Seetharaman)
- `international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of-sustainability-related-financial-information-and-s2-climate-related-disclosures-2023-https-www-ifrs-org` (International Sustainability Standards Board (ISSB). IFRS S1 *General Requirements for Disclosure of Sustainability-related Financial Information* and S2 *Climate-related Disclosures*. 2023. https://www.ifrs.org/)
- `pichai-sundar-testimony-before-the-u-s-house-judiciary-committee-december-11-2018` (Pichai, Sundar. Testimony before the U.S. House Judiciary Committee, December 11, 2018)
- `san-francisco-declaration-on-research-assessment-dora-2012-https-sfdora-org` (San Francisco Declaration on Research Assessment (DORA). 2012. https://sfdora.org/)
- `talbot-s-g-and-w-dean` (Talbot, S. G., and W. Dean)
- `worker-adjustment-and-retraining-notification-act-29-u-s-c-2101-2109` (Worker Adjustment and Retraining Notification Act, 29 U.S.C. §§ 2101-2109)
- `zuckerberg-mark-testimony-before-the-u-s-senate-judiciary-and-commerce-committees-april-10-11-2018` (Zuckerberg, Mark. Testimony before the U.S. Senate Judiciary and Commerce Committees, April 10-11, 2018)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-interpretation-no-longer-matters`

- Bibliography: `books/when-interpretation-no-longer-matters/back-matter/bibliography.md`
- Parse style: `list` (38 entries)
- Semantic linked sources: 38
- Parse warning: other styles also matched: plain_chicago=1

### Matched (38)

- `brown-eliot-and-maureen-farrell-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusio` ← biblio `brown-eliot-and-maureen-farrell-the-cult-of-we-wework-adam-neumann-and-the-great-startup-delusio` (exact_slug, score=100)
- `bushman-richard-lyman-joseph-smith-rough-stone-rolling` ← biblio `bushman-richard-lyman-joseph-smith-rough-stone-rolling` (exact_slug, score=100)
- `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` ← biblio `carreyrou-john-bad-blood-secrets-and-lies-in-a-silicon-valley-startup` (exact_slug, score=100)
- `chandler-david-p-voices-from-s-21-terror-and-history-in-pol-pot-s-secret-prison` ← biblio `chandler-david-p-voices-from-s-21-terror-and-history-in-pol-pot-s-secret-prison` (exact_slug, score=100)
- `corrales-javier-and-michael-penfold-dragon-in-the-tropics-hugo-ch-vez-and-the-political-economy` ← biblio `corrales-javier-and-michael-penfold-dragon-in-the-tropics-hugo-ch-vez-and-the-political-economy` (exact_slug, score=100)
- `dik-tter-frank-the-cultural-revolution-a-people-s-history-1962-1976` ← biblio `dik-tter-frank-the-cultural-revolution-a-people-s-history-1962-1976` (exact_slug, score=100)
- `escud-carlos-argentine-political-culture` ← biblio `escud-carlos-argentine-political-culture` (exact_slug, score=100)
- `figes-orlando-the-whisperers-private-life-in-stalin-s-russia` ← biblio `figes-orlando-the-whisperers-private-life-in-stalin-s-russia` (exact_slug, score=100)
- `fitzpatrick-sheila-everyday-stalinism-ordinary-life-in-extraordinary-times` ← biblio `fitzpatrick-sheila-everyday-stalinism-ordinary-life-in-extraordinary-times` (exact_slug, score=100)
- `haberman-maggie-confidence-man-the-making-of-donald-trump-and-the-breaking-of-america` ← biblio `haberman-maggie-confidence-man-the-making-of-donald-trump-and-the-breaking-of-america` (exact_slug, score=100)
- `hawkins-kirk-a-venezuela-s-chavismo-and-populism-in-comparative-perspective` ← biblio `hawkins-kirk-a-venezuela-s-chavismo-and-populism-in-comparative-perspective` (exact_slug, score=100)
- `jones-jeffrey-m-last-trump-job-approval-34-average-is-record-low-41` ← biblio `jones-jeffrey-m-last-trump-job-approval-34-average-is-record-low-41` (exact_slug, score=100)
- `jones-jeffrey-m-trump-approval-more-stable-than-approval-for-prior-presidents` ← biblio `jones-jeffrey-m-trump-approval-more-stable-than-approval-for-prior-presidents` (exact_slug, score=100)
- `jones-jeffrey-m-trump-job-approval-sets-new-record-for-polarization` ← biblio `jones-jeffrey-m-trump-job-approval-sets-new-record-for-polarization` (exact_slug, score=100)
- `kershaw-ian-hitler-1889-1936-hubris` ← biblio `kershaw-ian-hitler-1889-1936-hubris` (exact_slug, score=100)
- `kessler-glenn-salvador-rizzo-and-meg-kelly-president-trump-has-made-more-than-20-000-false-or-mi` ← biblio `kessler-glenn-salvador-rizzo-and-meg-kelly-president-trump-has-made-more-than-20-000-false-or-mi` (exact_slug, score=100)
- `kiernan-ben-the-pol-pot-regime-race-power-and-genocide-in-cambodia-under-the-khmer-rouge-1975-79` ← biblio `kiernan-ben-the-pol-pot-regime-race-power-and-genocide-in-cambodia-under-the-khmer-rouge-1975-79` (exact_slug, score=100)
- `klein-ezra-why-we-re-polarized` ← biblio `klein-ezra-why-we-re-polarized` (exact_slug, score=100)
- `klemperer-victor-i-will-bear-witness-a-diary-of-the-nazi-years-1933-1941` ← biblio `klemperer-victor-i-will-bear-witness-a-diary-of-the-nazi-years-1933-1941` (exact_slug, score=100)
- `kotkin-stephen-stalin-paradoxes-of-power-1878-1928` ← biblio `kotkin-stephen-stalin-paradoxes-of-power-1878-1928` (exact_slug, score=100)
- `kuran-timur-private-truths-public-lies-the-social-consequences-of-preference-falsification` ← biblio `kuran-timur-private-truths-public-lies-the-social-consequences-of-preference-falsification` (exact_slug, score=100)
- `laclau-ernesto-on-populist-reason` ← biblio `laclau-ernesto-on-populist-reason` (exact_slug, score=100)
- `macfarquhar-roderick-and-michael-schoenhals-mao-s-last-revolution` ← biblio `macfarquhar-roderick-and-michael-schoenhals-mao-s-last-revolution` (exact_slug, score=100)
- `page-joseph-a-per-n-a-biography` ← biblio `page-joseph-a-per-n-a-biography` (exact_slug, score=100)
- `pew-research-center-a-look-back-at-americans-reactions-to-the-jan-6-riot-at-the-u-s-capitol` ← biblio `pew-research-center-a-look-back-at-americans-reactions-to-the-jan-6-riot-at-the-u-s-capitol` (exact_slug, score=100)
- `pew-research-center-large-majority-of-the-public-views-prosecution-of-capitol-rioters-as-very-im` ← biblio `pew-research-center-large-majority-of-the-public-views-prosecution-of-capitol-rioters-as-very-im` (exact_slug, score=100)
- `pew-research-center-views-on-the-rioting-at-the-u-s-capitol` ← biblio `pew-research-center-views-on-the-rioting-at-the-u-s-capitol` (exact_slug, score=100)
- `reiterman-tim-raven-the-untold-story-of-the-rev-jim-jones` ← biblio `reiterman-tim-raven-the-untold-story-of-the-rev-jim-jones` (exact_slug, score=100)
- `shipps-jan-mormonism-the-story-of-a-new-religious-tradition` ← biblio `shipps-jan-mormonism-the-story-of-a-new-religious-tradition` (exact_slug, score=100)
- `solzhenitsyn-aleksandr-i-the-gulag-archipelago-1918-1956-an-experiment-in-literary-investigation` ← biblio `solzhenitsyn-aleksandr-i-the-gulag-archipelago-1918-1956-an-experiment-in-literary-investigation` (exact_slug, score=100)
- `tabor-james-d-and-eugene-v-gallagher-why-waco-cults-and-the-battle-for-religious-freedom-in-amer` ← biblio `tabor-james-d-and-eugene-v-gallagher-why-waco-cults-and-the-battle-for-religious-freedom-in-amer` (exact_slug, score=100)
- `u-s-house-of-representatives-articles-of-impeachment-against-donald-john-trump-h-res-755-116th-c` ← biblio `u-s-house-of-representatives-articles-of-impeachment-against-donald-john-trump-h-res-755-116th-c` (exact_slug, score=100)
- `u-s-house-of-representatives-impeaching-donald-john-trump-president-of-the-united-states-for-hig` ← biblio `u-s-house-of-representatives-impeaching-donald-john-trump-president-of-the-united-states-for-hig` (exact_slug, score=100)
- `ung-loung-first-they-killed-my-father-a-daughter-of-cambodia-remembers` ← biblio `ung-loung-first-they-killed-my-father-a-daughter-of-cambodia-remembers` (exact_slug, score=100)
- `wright-stuart-a-ed-armageddon-in-waco-critical-perspectives-on-the-branch-davidian-conflict` ← biblio `wright-stuart-a-ed-armageddon-in-waco-critical-perspectives-on-the-branch-davidian-conflict` (exact_slug, score=100)
- `givens-terryl-l-by-the-hand-of-mormon` ← biblio `givens-terryl-l-by-the-hand-of-mormon-the-american-scripture-that-launched-a-new-world-religion` (title_author, score=85)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty` (title_author, score=85)
- `the-church-of-jesus-christ-of-latter-day-saints-pearl-of-great-price` ← biblio `the-church-of-jesus-christ-of-latter-day-saints-the-pearl-of-great-price` (title_jaccard, score=65)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (27)

- `ashley-parker` — Ashley Parker
- `bob-woodward` — Bob Woodward
- `carl-schmitt` — Carl Schmitt
- `cass-r-sunstein` — Cass R Sunstein
- `chantal-mouffe` — Chantal Mouffe
- `eileen-barker` — Eileen Barker
- `erving-goffman` — Erving Goffman
- `george-d-chryssides` — George D Chryssides
- `hannah-arendt` — Hannah Arendt
- `henry-w-riecken` — Henry W. Riecken
- `isaiah-berlin` — Isaiah Berlin
- `jacques-ellul` — Jacques Ellul
- `judith-shklar` — Judith Shklar
- `jurgen-habermas` — Jürgen Habermas
- `karl-r-popper` — Karl R Popper
- `kevin-steffensen` — Kevin Steffensen
- `leon-festinger` — Leon Festinger
- `max-weber` — Max Weber
- `michael-scherer` — Michael Scherer
- `michel-foucault` — Michel Foucault
- `neil-postman` — Neil Postman
- `peter-l-berger` — Peter L. Berger
- `richard-gott` — Richard Gott
- `stanley-schachter` — Stanley Schachter
- `thomas-luckmann` — Thomas Luckmann
- `thomas-s-kuhn` — Thomas S Kuhn
- `vaclav-havel` — Václav Havel

### Biblio creators without thinker node (13)

- `2019-u-s-house-of-representatives-articles-of-impeachment-against-donald-john-trump-h-res-755-116th-cong-december-18` (2019) U.S. House of Representatives. Articles of Impeachment against Donald John Trump. H. Res. 755. 116th Cong. (December 18)
- `aleksandr-i-solzhenitsyn` (Aleksandr I Solzhenitsyn)
- `brown-eliot-and-maureen-farrell` (Brown, Eliot, and Maureen Farrell)
- `carlos-escud` (Carlos Escudé)
- `corrales-javier-and-michael-penfold` (Corrales, Javier, and Michael Penfold)
- `frank-dik-tter` (Frank Dikötter)
- `jeffrey-m-jones` (Jeffrey M Jones)
- `kessler-glenn-salvador-rizzo-and-meg-kelly` (Kessler, Glenn, Salvador Rizzo, and Meg Kelly)
- `loung-ung` (Loung Ung)
- `macfarquhar-roderick-and-michael-schoenhals` (MacFarquhar, Roderick, and Michael Schoenhals)
- `tabor-james-d-and-eugene-v-gallagher` (Tabor, James D., and Eugene V. Gallagher)
- `u-s-house-of-representatives-impeaching-donald-john-trump-president-of-the-united-states-for-high-crimes-and-misdemeanors-h-res-24-117th-cong-january-13-2021` (U.S. House of Representatives. Impeaching Donald John Trump, President of the United States, for High Crimes and Misdemeanors. H. Res. 24. 117th Cong. (January 13, 2021))
- `wright-stuart-a` (Wright, Stuart A.)

### Orphan creatorSlugs on linked sources (5)

- `jeffrey-m-jones` on `jones-jeffrey-m-last-trump-job-approval-34-average-is-record-low-41`
- `jeffrey-m-jones` on `jones-jeffrey-m-trump-approval-more-stable-than-approval-for-prior-presidents`
- `jeffrey-m-jones` on `jones-jeffrey-m-trump-job-approval-sets-new-record-for-polarization`
- `aleksandr-i-solzhenitsyn` on `solzhenitsyn-aleksandr-i-the-gulag-archipelago-1918-1956-an-experiment-in-literary-investigation`
- `loung-ung` on `ung-loung-first-they-killed-my-father-a-daughter-of-cambodia-remembers`

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
- Semantic linked sources: 53

### Matched (53)

- `addams-jane-twenty-years-at-hull-house` ← biblio `addams-jane-twenty-years-at-hull-house` (exact_slug, score=100)
- `ambedkar-b-r-what-congress-and-gandhi-have-done-to-the-untouchables` ← biblio `ambedkar-b-r-what-congress-and-gandhi-have-done-to-the-untouchables` (exact_slug, score=100)
- `associated-press-taylor-swift-donates-to-food-banks-on-eras-tour-providing-thousands-of-meals` ← biblio `associated-press-taylor-swift-donates-to-food-banks-on-eras-tour-providing-thousands-of-meals` (exact_slug, score=100)
- `branch-taylor-parting-the-waters-america-in-the-king-years-1954-63` ← biblio `branch-taylor-parting-the-waters-america-in-the-king-years-1954-63` (exact_slug, score=100)
- `brown-judith-m-gandhi-prisoner-of-hope` ← biblio `brown-judith-m-gandhi-prisoner-of-hope` (exact_slug, score=100)
- `brown-judith-m-gandhi-s-rise-to-power-indian-politics-1915-1922` ← biblio `brown-judith-m-gandhi-s-rise-to-power-indian-politics-1915-1922` (exact_slug, score=100)
- `carlin-john-playing-the-enemy-nelson-mandela-and-the-game-that-made-a-nation` ← biblio `carlin-john-playing-the-enemy-nelson-mandela-and-the-game-that-made-a-nation` (exact_slug, score=100)
- `charter-77-founding-declaration-1977-v-clav-havel-library` ← biblio `charter-77-founding-declaration-1977-v-clav-havel-library` (exact_slug, score=100)
- `clemmons-fran-ois-with-tim-madigan-officer-clemmons` ← biblio `clemmons-fran-ois-with-tim-madigan-officer-clemmons` (exact_slug, score=100)
- `dalton-dennis-mahatma-gandhi-nonviolent-power-in-action` ← biblio `dalton-dennis-mahatma-gandhi-nonviolent-power-in-action` (exact_slug, score=100)
- `desai-ashwin-and-goolam-vahed-the-south-african-gandhi-stretcher-bearer-of-empire` ← biblio `desai-ashwin-and-goolam-vahed-the-south-african-gandhi-stretcher-bearer-of-empire` (exact_slug, score=100)
- `forbes-geraldine-women-in-modern-india` ← biblio `forbes-geraldine-women-in-modern-india` (exact_slug, score=100)
- `fred-rogers-productions-episode-archives-television-hall-of-fame-materials-jeff-erlanger-appeara` ← biblio `fred-rogers-productions-episode-archives-television-hall-of-fame-materials-jeff-erlanger-appeara` (exact_slug, score=100)
- `gandhi-mohandas-k-letter-to-lord-irwin-2-march-1930-in-the-collected-works-of-mahatma-gandhi` ← biblio `gandhi-mohandas-k-letter-to-lord-irwin-2-march-1930-in-the-collected-works-of-mahatma-gandhi` (exact_slug, score=100)
- `garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con` ← biblio `garrow-david-j-bearing-the-cross-martin-luther-king-jr-and-the-southern-christian-leadership-con` (exact_slug, score=100)
- `garton-ash-timothy-the-magic-lantern-the-revolution-of-89-witnessed-in-warsaw-budapest-berlin-an` ← biblio `garton-ash-timothy-the-magic-lantern-the-revolution-of-89-witnessed-in-warsaw-budapest-berlin-an` (exact_slug, score=100)
- `gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and` ← biblio `gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and` (exact_slug, score=100)
- `government-of-south-africa-truth-and-reconciliation-commission-final-report` ← biblio `government-of-south-africa-truth-and-reconciliation-commission-final-report` (exact_slug, score=100)
- `guha-ramachandra-gandhi-before-india` ← biblio `guha-ramachandra-gandhi-before-india` (exact_slug, score=100)
- `guha-ramachandra-gandhi-the-years-that-changed-the-world-1914-1948` ← biblio `guha-ramachandra-gandhi-the-years-that-changed-the-world-1914-1948` (exact_slug, score=100)
- `honey-michael-k-going-down-jericho-road-the-memphis-strike-martin-luther-king-s-last-campaign` ← biblio `honey-michael-k-going-down-jericho-road-the-memphis-strike-martin-luther-king-s-last-campaign` (exact_slug, score=100)
- `jones-william-p-the-march-on-washington-jobs-freedom-and-the-forgotten-history-of-civil-rights` ← biblio `jones-william-p-the-march-on-washington-jobs-freedom-and-the-forgotten-history-of-civil-rights` (exact_slug, score=100)
- `king-martin-luther-jr-letter-from-birmingham-jail` ← biblio `king-martin-luther-jr-letter-from-birmingham-jail` (exact_slug, score=100)
- `levine-amy-jill-short-stories-by-jesus-the-enigmatic-parables-of-a-controversial-rabbi` ← biblio `levine-amy-jill-short-stories-by-jesus-the-enigmatic-parables-of-a-controversial-rabbi` (exact_slug, score=100)
- `lewis-john-with-michael-d-orso-walking-with-the-wind-a-memoir-of-the-movement` ← biblio `lewis-john-with-michael-d-orso-walking-with-the-wind-a-memoir-of-the-movement` (exact_slug, score=100)
- `library-of-congress-bayard-rustin-papers-march-on-washington-planning-materials` ← biblio `library-of-congress-bayard-rustin-papers-march-on-washington-planning-materials` (exact_slug, score=100)
- `maathai-wangari-unbowed-a-memoir` ← biblio `maathai-wangari-unbowed-a-memoir` (exact_slug, score=100)
- `mandela-nelson-long-walk-to-freedom` ← biblio `mandela-nelson-long-walk-to-freedom` (exact_slug, score=100)
- `mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964` ← biblio `mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964` (exact_slug, score=100)
- `mcwhorter-diane-carry-me-home-birmingham-alabama-the-climactic-battle-of-the-civil-rights-revolu` ← biblio `mcwhorter-diane-carry-me-home-birmingham-alabama-the-climactic-battle-of-the-civil-rights-revolu` (exact_slug, score=100)
- `meeks-wayne-a-the-first-urban-christians` ← biblio `meeks-wayne-a-the-first-urban-christians` (exact_slug, score=100)
- `meier-john-p-a-marginal-jew-rethinking-the-historical-jesus` ← biblio `meier-john-p-a-marginal-jew-rethinking-the-historical-jesus` (exact_slug, score=100)
- `melas-chloe-taylor-swift-gave-eras-tour-crew-197-million-in-bonuses-exclusive` ← biblio `melas-chloe-taylor-swift-gave-eras-tour-crew-197-million-in-bonuses-exclusive` (exact_slug, score=100)
- `melas-chloe-taylor-swift-gives-life-changing-100-000-bonuses-to-eras-tour-truck-drivers` ← biblio `melas-chloe-taylor-swift-gives-life-changing-100-000-bonuses-to-eras-tour-truck-drivers` (exact_slug, score=100)
- `morris-aldon-d-the-origins-of-the-civil-rights-movement-black-communities-organizing-for-change` ← biblio `morris-aldon-d-the-origins-of-the-civil-rights-movement-black-communities-organizing-for-change` (exact_slug, score=100)
- `nanda-b-r-mahatma-gandhi-a-biography` ← biblio `nanda-b-r-mahatma-gandhi-a-biography` (exact_slug, score=100)
- `national-archives-u-s-official-demands-march-on-washington-for-jobs-and-freedom-1963` ← biblio `national-archives-u-s-official-demands-march-on-washington-for-jobs-and-freedom-1963` (exact_slug, score=100)
- `nobel-prize-the-nobel-peace-prize-2004-wangari-maathai` ← biblio `nobel-prize-the-nobel-peace-prize-2004-wangari-maathai` (exact_slug, score=100)
- `pollstar-year-end-special-features-top-tours` ← biblio `pollstar-year-end-special-features-top-tours` (exact_slug, score=100)
- `ransby-barbara-ella-baker-and-the-black-freedom-movement-a-radical-democratic-vision` ← biblio `ransby-barbara-ella-baker-and-the-black-freedom-movement-a-radical-democratic-vision` (exact_slug, score=100)
- `rao-anupama-the-caste-question-dalits-and-the-politics-of-modern-india` ← biblio `rao-anupama-the-caste-question-dalits-and-the-politics-of-modern-india` (exact_slug, score=100)
- `residents-of-hull-house-hull-house-maps-and-papers` ← biblio `residents-of-hull-house-hull-house-maps-and-papers` (exact_slug, score=100)
- `robinson-jo-ann-gibson-the-montgomery-bus-boycott-and-the-women-who-started-it` ← biblio `robinson-jo-ann-gibson-the-montgomery-bus-boycott-and-the-women-who-started-it` (exact_slug, score=100)
- `sanders-e-p-the-historical-figure-of-jesus` ← biblio `sanders-e-p-the-historical-figure-of-jesus` (exact_slug, score=100)
- `sisario-ben-taylor-swift-s-eras-tour-is-the-first-to-surpass-2-billion` ← biblio `sisario-ben-taylor-swift-s-eras-tour-is-the-first-to-surpass-2-billion` (exact_slug, score=100)
- `smith-dennis-e-from-symposium-to-eucharist-the-banquet-in-the-early-christian-world` ← biblio `smith-dennis-e-from-symposium-to-eucharist-the-banquet-in-the-early-christian-world` (exact_slug, score=100)
- `south-african-history-online-south-africa-s-first-democratic-elections-27-april-1994` ← biblio `south-african-history-online-south-africa-s-first-democratic-elections-27-april-1994` (exact_slug, score=100)
- `tutu-desmond-no-future-without-forgiveness` ← biblio `tutu-desmond-no-future-without-forgiveness` (exact_slug, score=100)
- `u-s-senate-subcommittee-on-communications-hearings-on-the-public-broadcasting-act-may-1969` ← biblio `u-s-senate-subcommittee-on-communications-hearings-on-the-public-broadcasting-act-may-1969` (exact_slug, score=100)
- `webb-miller-dispatches-from-dharasana-salt-works-raid-may-1930` ← biblio `webb-miller-dispatches-from-dharasana-salt-works-raid-may-1930` (exact_slug, score=100)
- `wright-n-t-jesus-and-the-victory-of-god` ← biblio `wright-n-t-jesus-and-the-victory-of-god` (exact_slug, score=100)
- `havel-vaclav-the-power-of-the-powerless` ← biblio `havel-v-clav-the-power-of-the-powerless` (title_author, score=85)
- `king-martin-luther-jr-beyond-vietnam-a-time-to-break-silence` ← biblio `king-martin-luther-jr-beyond-vietnam` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (13)

- `charter-77-founding-declaration-1977-v-clav-havel-library` (Charter 77. Founding declaration. 1977. Václav Havel Library)
- `desai-ashwin-and-goolam-vah` (Desai, Ashwin, and Goolam Vah)
- `fred-rogers-productions-episode-archives-television-hall-of-fame-materials-jeff-erlanger-appearances` (Fred Rogers Productions. Episode archives; Television Hall of Fame materials (Jeff Erlanger appearances))
- `gospel-of-luke-gospel-of-mark-acts-of-the-apostles-pauline-epistles-1-corinthians-galatians-and-related-letters` (Gospel of Luke; Gospel of Mark; Acts of the Apostles; Pauline epistles (1 Corinthians, Galatians, and related letters))
- `government-of-south-africa-truth-and-reconciliation-commission` (Government of South Africa. Truth and Reconciliation Commission)
- `library-of-congress-bayard-rustin-papers-march-on-washington-planning-materials` (Library of Congress. Bayard Rustin Papers. March on Washington planning materials)
- `mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964` (Mandela, Nelson. Statement from the dock, Rivonia Trial. 20 April 1964)
- `martin-luther-jr-king` (Martin Luther Jr King)
- `mohandas-k-letter-to-lord-irwin-2-march-1930-in-the-collected-works-of-mahatma-gandhi-gandhi` (Mohandas K. Letter to Lord Irwin. 2 March 1930. In *The Collected Works of Mahatma Gandhi* Gandhi)
- `national-archives-u-s-official-demands-march-on-washington-for-jobs-and-freedom-1963` (National Archives (U.S.). Official demands, March on Washington for Jobs and Freedom. 1963)
- `u-s-senate-subcommittee-on-communications-hearings-on-the-public-broadcasting-act-may-1969` (U.S. Senate Subcommittee on Communications. Hearings on the Public Broadcasting Act. May 1969)
- `v-clav-havel` (Václav Havel)
- `webb-miller-dispatches-from-dharasana-salt-works-raid-may-1930` (Webb Miller. Dispatches from Dharasana Salt Works raid. May 1930)

### Orphan creatorSlugs on linked sources (0)

_None._

## `when-others-look-to-you-v1`

- Bibliography: `books/when-others-look-to-you/v1/back-matter/bibliography.md`
- Parse style: `list` (26 entries)
- Semantic linked sources: 26
- Parse warning: other styles also matched: plain_chicago=17

### Matched (26)

- `agamben-giorgio-state-of-exception` ← biblio `agamben-giorgio-state-of-exception` (exact_slug, score=100)
- `arendt-hannah-what-is-authority` ← biblio `arendt-hannah-what-is-authority` (exact_slug, score=100)
- `argyris-chris-and-donald-a-schon-organizational-learning-ii` ← biblio `argyris-chris-and-donald-a-schon-organizational-learning-ii` (exact_slug, score=100)
- `argyris-chris-overcoming-organizational-defenses` ← biblio `argyris-chris-overcoming-organizational-defenses` (exact_slug, score=100)
- `bandura-albert-social-learning-theory` ← biblio `bandura-albert-social-learning-theory` (exact_slug, score=100)
- `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` ← biblio `baron-jonathan-and-john-c-hershey-outcome-bias-in-decision` (exact_slug, score=100)
- `beck-ulrich-risk-society-towards-a-new-modernity` ← biblio `beck-ulrich-risk-society-towards-a-new-modernity` (exact_slug, score=100)
- `brehm-jack-w-a-theory-of-psychological-reactance` ← biblio `brehm-jack-w-a-theory-of-psychological-reactance` (exact_slug, score=100)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` ← biblio `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren-a-focus` (exact_slug, score=100)
- `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` ← biblio `cockburn-alistair-how-to-step-up-stepping-up-promoting-guest` (exact_slug, score=100)
- `dekker-sidney-w-a-just-culture-restoring-trust-and-accountability` ← biblio `dekker-sidney-w-a-just-culture-restoring-trust-and-accountability` (exact_slug, score=100)
- `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` ← biblio `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` (exact_slug, score=100)
- `foucault-michel-discipline-and-punish-the-birth-of-the-prison` ← biblio `foucault-michel-discipline-and-punish-the-birth-of-the-prison` (exact_slug, score=100)
- `staw-barry-m-knee-deep-in-the-big-muddy-a-study-of-escalating` ← biblio `staw-barry-m-knee-deep-in-the-big-muddy-a-study-of-escalating` (exact_slug, score=100)
- `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` ← biblio `weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing` (exact_slug, score=100)
- `weick-karl-e-the-social-psychology-of-organizing` ← biblio `weick-karl-e-the-social-psychology-of-organizing` (exact_slug, score=100)
- `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of-evil` ← biblio `arendt-hannah-eichmann-in-jerusalem-a-report-on-the-banality-of` (title_author, score=85)
- `edmondson-amy-c-the-fearless-organization-creating-psychological-safety-in-the-workplace-for-lea` ← biblio `edmondson-amy-c-the-fearless-organization-creating-psychological` (title_author, score=85)
- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty` (title_author, score=85)
- `janis-irving-l-groupthink-psychological-studies-of-policy-decisions-and-fiascoes` ← biblio `janis-irving-l-groupthink-psychological-studies-of-policy` (title_author, score=85)
- `perrow-charles-normal-accidents-living-with-high-risk-technologies` ← biblio `perrow-charles-normal-accidents-living-with-high-risk` (title_author, score=85)
- `scott-james-c-domination-and-the-arts-of-resistance-hidden-transcripts` ← biblio `scott-james-c-domination-and-the-arts-of-resistance-hidden` (title_author, score=85)
- `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b` ← biblio `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b-carsten-followership-theory-a-review-an` (title_author, score=85)
- `vaughan-diane-the-challenger-launch-decision-risky-technology-culture-and-deviance-at-nasa` ← biblio `vaughan-diane-the-challenger-launch-decision-risky-technology` (title_author, score=85)
- `weber-max-economy-and-society-an-outline-of-interpretive-sociology` ← biblio `weber-max-economy-and-society-an-outline-of-interpretive` (title_author, score=85)
- `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected-resilient-performance-in-an-age-of` ← biblio `weick-karl-e-and-kathleen-m-sutcliffe-managing-the-unexpected` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (7)

- `argyris-chris-and-donald-a-schon` (Argyris, Chris, and Donald A. Schon)
- `baron-jonathan-and-john-c-hershey` (Baron, Jonathan, and John C. Hershey)
- `cialdini-robert-b-raymond-r-reno-and-carl-a-kallgren` (Cialdini, Robert B., Raymond R. Reno, and Carl A. Kallgren)
- `sidney-w-a-dekker` (Sidney W. A Dekker)
- `uhl-bien-michael-ronald-e-riggio-kelly-lowe-and-gerard-b-carsten` (Uhl-Bien, Michael, Ronald E. Riggio, Kelly Lowe, and Gerard B. Carsten)
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
- Parse style: `pandoc_div` (15 entries)
- Semantic linked sources: 15
- Parse warning: other styles also matched: plain_chicago=15

### Matched (15)

- `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` ← biblio `hirschman-albert-o-exit-voice-and-loyalty-responses-to-decline-in-firms-organizations-and-states` (exact_slug, score=100)
- `hochschild-arlie-russell-the-managed-heart-commercialization-of-human-feeling` ← biblio `hochschild-arlie-russell-the-managed-heart-commercialization-of-human-feeling` (exact_slug, score=100)
- `kwan-janice-l-lisha-lo-margaret-sampson-and-kaveh-g-shojania-medication-reconciliation-during-tr` ← biblio `kwan-janice-l-lisha-lo-margaret-sampson-and-kaveh-g-shojania-medication-reconciliation-during-tr` (exact_slug, score=100)
- `luhmann-niklas-trust-and-power-two-works` ← biblio `luhmann-niklas-trust-and-power-two-works` (exact_slug, score=100)
- `march-james-g-and-herbert-a-simon-organizations` ← biblio `march-james-g-and-herbert-a-simon-organizations` (exact_slug, score=100)
- `morley-claire-maria-unwin-gregory-m-peterson-jim-stankovich-and-leigh-kinsman-emergency-departme` ← biblio `morley-claire-maria-unwin-gregory-m-peterson-jim-stankovich-and-leigh-kinsman-emergency-departme` (exact_slug, score=100)
- `muller-jerry-z-the-tyranny-of-metrics` ← biblio `muller-jerry-z-the-tyranny-of-metrics` (exact_slug, score=100)
- `occupational-safety-and-health-administration-cranes-and-derricks` ← biblio `occupational-safety-and-health-administration-cranes-and-derricks` (exact_slug, score=100)
- `occupational-safety-and-health-administration-cranes-and-derricks-in-construction-final-rule` ← biblio `occupational-safety-and-health-administration-cranes-and-derricks-in-construction-final-rule` (exact_slug, score=100)
- `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` ← biblio `ostrom-elinor-governing-the-commons-the-evolution-of-institutions-for-collective-action` (exact_slug, score=100)
- `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` ← biblio `scott-james-c-seeing-like-a-state-how-certain-schemes-to-improve-the-human-condition-have-failed` (exact_slug, score=100)
- `sennett-richard-together-the-rituals-pleasures-and-politics-of-cooperation` ← biblio `sennett-richard-together-the-rituals-pleasures-and-politics-of-cooperation` (exact_slug, score=100)
- `star-susan-leigh-and-anselm-strauss-layers-of-silence-arenas-of-voice-the-ecology-of-visible-and` ← biblio `star-susan-leigh-and-anselm-strauss-layers-of-silence-arenas-of-voice-the-ecology-of-visible-and` (exact_slug, score=100)
- `weick-karl-e-sensemaking-in-organizations` ← biblio `weick-karl-e-sensemaking-in-organizations` (exact_slug, score=100)
- `edmondson-amy-c-psychological-safety-and-learning-behavior-in-work` ← biblio `edmondson-amy-psychological-safety-and-learning-behavior-in-work-teams` (title_author, score=85)

### Missing in semantic (0)

_None._

### Exists but missing relatedBooks (0)

_None._

### Stale relatedBooks (0)

_None._

### Thinkers stale for this book (0)

_None._

### Biblio creators without thinker node (6)

- `amy-edmondson` (Amy Edmondson)
- `kwan-janice-l-lisha-lo-margaret-sampson-and-kaveh-g-shojania` (Kwan, Janice L., Lisha Lo, Margaret Sampson, and Kaveh G. Shojania)
- `march-james-g-and-herbert-a-simon` (March, James G., and Herbert A. Simon)
- `morley-claire-maria-unwin-gregory-m-peterson-jim-stankovich-and-leigh-kinsman` (Morley, Claire, Maria Unwin, Gregory M. Peterson, Jim Stankovich, and Leigh Kinsman)
- `occupational-safety-and-health-administration` (Occupational Safety and Health Administration)
- `star-susan-leigh-and-anselm-strauss` (Star, Susan Leigh, and Anselm Strauss)

### Orphan creatorSlugs on linked sources (0)

_None._

---

*Generated by `tools/audit_bibliography_semantic_drift.py`.*
