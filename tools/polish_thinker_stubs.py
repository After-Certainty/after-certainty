#!/usr/bin/env python3
"""Apply editorial summaries to thinker stubs created by bibliography reconcile.

Replaces placeholder ``Thinker draft aggregated...`` summaries with portfolio-grounded
prose (and optional whyThisMatters). Also intended to be re-runnable and idempotent
for entries still carrying draft language.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

THINKERS = Path("semantic/thinkers")

# slug -> (summary, whyThisMatters | None)
ENRICHMENTS: dict[str, tuple[str, str | None]] = {
    "a-leo-oppenheim": (
        "Assyriologist portraying Mesopotamian civilization through texts, institutions, and everyday practice.",
        "Oppenheim shows certainty arriving late—complex order without modern science's self-image.",
    ),
    "aldon-d-morris": (
        "Sociologist of the civil rights movement who traces how Black communities built organizing capacity before national leaders arrived.",
        "Morris reframes leadership as cumulative local infrastructure—authority that holds because people already practiced it together.",
    ),
    "allister-sparks": (
        "South African journalist who chronicled the negotiated end of apartheid from close political range.",
        "Sparks shows authority remade in rooms—when former enemies must invent a shared future.",
    ),
    "american-college-of-emergency-physicians": (
        "Professional body publishing clinical and policy guidance on emergency-care practice, including boarding.",
        "ACEP sources show how professional norms become moral pressure inside metric-driven hospitals.",
    ),
    "amy-jill-levine": (
        "New Testament scholar reading Jesus's parables as confrontational short stories that unsettle rather than settle meaning.",
        "Levine keeps scripture from collapsing into slogan—guest leadership that refuses the convenient moral of the tale.",
    ),
    "andrew-jameton": (
        "Nurse ethicist who named moral distress—knowing the right action while being constrained from taking it.",
        "Jameton gives language for incentive systems that force caregivers to betray their own judgment.",
    ),
    "annibale-fantoli": (
        "Historian of Galileo's conflict with the Church, attentive to cosmology, obedience, and institutional fear.",
        "Fantoli frames misread authority—when doctrinal office meets observational claim.",
    ),
    "anthony-pagden": (
        "Intellectual historian of early European debates over Indigenous humanity and natural law.",
        "Pagden recovers when empire needed philosophical permission to misread other people.",
    ),
    "anthony-sampson": (
        "Journalist-biographer of Mandela who balances authorized access with political context.",
        "Sampson helps read charismatic authority without swallowing its public relations.",
    ),
    "anupama-rao": (
        "Historian of caste and modern India, attentive to how Dalit politics renegotiate modernity's promises of equality.",
        "Rao shows leadership claims underwritten by hierarchy—and how naming that hierarchy becomes moral work.",
    ),
    "associated-press": (
        "Global wire service whose event reporting supplies contemporaneous public facts for leadership and spectacle arguments.",
        "AP copy anchors claims in reported events when influence travels through coverage rather than decree.",
    ),
    "austen-henry-layard": (
        "Nineteenth-century excavator of Nineveh and Babylon whose finds entered Western biblical imagination.",
        "Layard marks archaeology's role in making ancient authority newly visible—and newly owned.",
    ),
    "b-r-ambedkar": (
        "Jurist and Dalit leader who challenged Gandhi's and Congress's terms for untouchability and political recognition.",
        "Ambedkar marks the cost of moral authority that asks the subordinated to wait—leadership contested from below.",
    ),
    "b-r-nanda": (
        "Biographer of Gandhi attentive to the making of a moral and political life across India and South Africa.",
        "Nanda supplies grounded narrative when Gandhi risks becoming icon rather than a person under constraint.",
    ),
    "barbara-ransby": (
        "Historian of Ella Baker and radical democratic organizing in the Black freedom movement.",
        "Ransby centers facilitative leadership—power that multiplies other people's capacity instead of monopolizing the microphone.",
    ),
    "ben-sisario": (
        "Music-business journalist covering tours, revenue, and how celebrity logistics become public leadership theater.",
        "Sisario documents when spectacle numbers become the moral metric of 'taking care of people.'",
    ),
    "betsy-beyer-chris-jones-jennifer-petoff-and-niall-richard-murphy": (
        "Google SRE editors documenting production practices that keep large systems reliable under change.",
        "Their handbook is the craft text for coupling, incident learning, and operational seriousness.",
    ),
    "biblical-sources": (
        "New Testament texts (gospels, Acts, Pauline letters) treated as narrative sources for hospitality, authority, and community formation.",
        "These writings supply classic scenes of guest leadership and contested authority without modern management vocabulary.",
    ),
    "brownell-kelly-d-and-kenneth-e-warner": (
        "Public-health researchers comparing tobacco industry tactics to later food and unhealthy-product campaigns.",
        "They warn that authority learned to deceive once can template later public harms.",
    ),
    "cappelli-peter-and-anna-tavis": (
        "Management scholars of performance systems and the corporate turn from annual reviews to continuous ranking.",
        "They show how appraisal regimes rewrite what 'good' means at work—incentive as moral language.",
    ),
    "center-for-responsive-politics": (
        "Nonpartisan tracker (OpenSecrets) of U.S. campaign finance, lobbying, and donor influence.",
        "OpenSecrets makes incentive structure countable—when money becomes the audible moral claim.",
    ),
    "ceplair-larry-and-steven-englund": (
        "Historians of the Hollywood blacklist and political control over film-community careers.",
        "They document when cultural authority becomes punishment for wrong affiliation.",
    ),
    "charter-77": (
        "Czechoslovak dissident initiative whose founding declaration made living in truth a public civic practice.",
        "Charter 77 is the template for moral seriousness when legality and legitimacy diverge.",
    ),
    "chloe-melas": (
        "Entertainment journalist reporting celebrity labor practices, bonuses, and the economics of mega-tours.",
        "Melas's reporting makes private generosity public—authority measured by what crews actually receive.",
    ),
    "clemmons-fran-ois-with-tim-madigan": (
        "Opera singer and educator whose memoir with Madigan recounts friendship with Fred Rogers and public neighborliness.",
        "Clemmons shows guest leadership as everyday recognition—authority granted through patient relationship.",
    ),
    "congressional-budget-office": (
        "Nonpartisan scorekeeper estimating how automatic stabilizers and fiscal rules shape the federal budget.",
        "CBO numbers become the shared terrain when political arguments claim fiscal virtue.",
    ),
    "congressional-record": (
        "Official transcript of U.S. congressional debate, including Affordable Care Act floor fights.",
        "The Record preserves how incentives and fairness arguments are spoken into law.",
    ),
    "craig-calhoun": (
        "Sociologist of the 1989 Beijing democracy movement and student politics under state power.",
        "Calhoun reads protest authority against an empire that answers with tanks and amnesia.",
    ),
    "cynda-hylton-rushton": (
        "Nurse ethicist working on moral distress, resilience, and integrity under institutional constraint.",
        "Rushton tracks what metric cultures do to caregivers who still feel responsible.",
    ),
    "d-t-potts": (
        "Archaeologist of Mesopotamia's material foundations—cities, craft, and institutional infrastructure.",
        "Potts keeps civilizational claims grounded in what people actually built and stored.",
    ),
    "david-j-garrow": (
        "Historian of King, the SCLC, and the FBI's surveillance campaign against the movement.",
        "Garrow thickens leadership under watch—moral authority contending with state suspicion.",
    ),
    "david-n-keightley": (
        "Historian of Shang China using oracle bones as sources for early kingship and divination.",
        "Keightley shows certainty sought through ritual inquiry—authority consulting the bone.",
    ),
    "david-ussishkin": (
        "Biblical archaeologist whose Lachish excavations test text against stratigraphy.",
        "Ussishkin models how material evidence corrects or complicates received narrative.",
    ),
    "declaration-on-research-assessment": (
        "Coalition statement (DORA) against over-reliance on journal impact factors in research evaluation.",
        "DORA is the reform case when a score becomes mistaken for scholarly worth.",
    ),
    "dennis-dalton": (
        "Political theorist of Gandhi's nonviolent power as practiced strategy rather than soft idealism.",
        "Dalton keeps nonviolence operational—leadership that organizes refusal without abandoning leverage.",
    ),
    "dennis-e-smith": (
        "Scholar of early Christian meals and symposium culture as sites of status negotiation and community formation.",
        "Smith locates leadership in table practices—who is welcomed, ranked, or fed becomes the moral grammar.",
    ),
    "desai-ashwin-and-goolam-vahed": (
        "Historians reassessing Gandhi's South African years against empire, race, and caste comforts.",
        "They resist hagiography—moral authority audited against who was left outside the circle of concern.",
    ),
    "desmond-tutu": (
        "Anglican bishop and TRC chair who framed forgiveness as public work after political violence.",
        "Tutu ties reconciliation to truth-telling—leadership that refuses cheap closure after harm.",
    ),
    "diane-mcwhorter": (
        "Journalist-historian of Birmingham's civil rights battles and the local conflicts that made national confrontation possible.",
        "McWhorter keeps climactic leadership scenes tethered to neighborhoods, newspapers, and unresolved local debts.",
    ),
    "e-p-sanders": (
        "Historian of Jesus in Second Temple Judaism, careful about what can and cannot be claimed from the sources.",
        "Sanders models interpretive restraint—authority that does not invent certainty the evidence will not bear.",
    ),
    "eisenstadt-shmuel-n-ed": (
        "Comparative sociologist of Axial Age transformations in religion, politics, and critique.",
        "Eisenstadt frames the long emergence of transcendent standards against earthly power.",
    ),
    "eitan-hersh": (
        "Political scientist arguing politics should be for building power, not for performative opinion.",
        "Hersh challenges moral language that substitutes vibes for organized accountability.",
    ),
    "elizabeth-l-eisenstein": (
        "Historian arguing the printing press remade knowledge authority and European culture.",
        "Eisenstein shows how a medium shift reallocates who may fix and circulate certainty.",
    ),
    "ellen-schrecker": (
        "Historian of McCarthyism and the machinery of accusation in mid-century America.",
        "Schrecker shows how loyalty tests misread dissent as treason—and wreck lives.",
    ),
    "emanuel-tov": (
        "Textual critic of the Hebrew Bible mapping how scripture's wording developed across witnesses.",
        "Tov makes sacred text a history of transmission—certainty as editorial outcome.",
    ),
    "erica-armstrong-dunbar": (
        "Historian of Ona Judge's escape from the Washington household and the hunt that followed.",
        "Dunbar forces founders' authority to answer for slavery's intimate violence.",
    ),
    "eugene-garfield": (
        "Information scientist who developed citation indexing and the journal impact factor.",
        "Garfield's metric became an incentive regime—measurement that rewrote what counts as knowledge.",
    ),
    "eugene-ulrich": (
        "Dead Sea Scrolls scholar on the developmental composition of biblical literature.",
        "Ulrich shows scripture arriving through stages rather than descending finished.",
    ),
    "european-financial-reporting-advisory-group": (
        "EU technical body developing European Sustainability Reporting Standards (ESRS).",
        "EFRAG shows how disclosure rules harden moral claims about corporate responsibility into compliance.",
    ),
    "ezra-f-vogel": (
        "China scholar of Deng Xiaoping and the pragmatic remaking of post-Mao authority.",
        "Vogel tracks how a regime regenerates legitimacy after catastrophic certainty.",
    ),
    "federal-deposit-insurance-corporation": (
        "U.S. deposit insurer analyzing reform options for protecting bank deposits after crisis risk.",
        "FDIC work shows how trust in money is engineered—and periodically redesigned.",
    ),
    "federal-election-commission": (
        "U.S. agency publishing campaign-finance disclosure data and enforcement records.",
        "FEC data make incentive pathways between donors, candidates, and public speech legible.",
    ),
    "federal-reserve-bank-of-philadelphia": (
        "Regional Fed bank publishing the Survey of Professional Forecasters and related expectation data.",
        "Forecast aggregates reveal how experts' certainty becomes a public input to policy.",
    ),
    "financial-stability-board": (
        "G20-linked body tracking implementation and effects of post-crisis financial regulatory reforms.",
        "The FSB is the transnational scorecard for whether reforms still constrain risk.",
    ),
    "frances-haugen": (
        "Former Facebook product manager whose disclosures highlighted engagement-ranking harms and research suppression.",
        "Haugen embodies whistleblowing when incentive design becomes a moral injury to the public.",
    ),
    "fred-rogers-productions": (
        "Production archive stewarding Mister Rogers' Neighborhood materials and hall-of-fame records of public tenderness.",
        "The archive preserves how slow attention became a leadership craft on mass media.",
    ),
    "fritz-hirschfeld": (
        "Documentary historian collecting Washington's own words and records on slavery.",
        "Hirschfeld lets primary sources contradict patriotic myth without sermon.",
    ),
    "galileo-galilei": (
        "Astronomer and physicist whose observations challenged geocentric doctrine and institutional certainty.",
        "Galileo is the classic misreading of authority—truth measured against office.",
    ),
    "george-packer": (
        "Journalist of Merkel-era Germany and the quiet styles of power in crises.",
        "Packer reads authority that prefers competence theater over charismatic display.",
    ),
    "george-washington": (
        "Revolutionary general and first U.S. president whose farewell and household records complicate civic sainthood.",
        "Washington is founding authority under audit—republican virtue beside slaveholding practice.",
    ),
    "geraldine-forbes": (
        "Historian of women in modern India and the gendered limits of nationalist leadership narratives.",
        "Forbes recovers who carried movements when public leadership remained male by default.",
    ),
    "grissom-jason-a-et-al": (
        "Education researchers on teacher stress, health, and the spillover costs of schooling under pressure.",
        "Their evidence links performance regimes to body and burnout—not just outputs.",
    ),
    "h-c-darby": (
        "Historical geographer of Domesday England and the Norman survey's territorial vision.",
        "Darby reads state knowing as maps and manor lists—legibility avant la lettre.",
    ),
    "hew-strachan": (
        "Military historian of the First World War's strategic and social transformation.",
        "Strachan places modern catastrophe where industrial certainty met human limits.",
    ),
    "horwitz-jeff-and-deepa-seetharaman": (
        "Wall Street Journal reporters who documented Facebook executives sidelining fixes that reduced divisiveness.",
        "Their reporting shows incentive conflict when harm reduction threatens growth metrics.",
    ),
    "hovland-carl-i-and-walter-weiss": (
        "Psychologists studying how source credibility changes communication effectiveness.",
        "They show trust in messenger as a filter—before content even gets heard.",
    ),
    "howard-schneider": (
        "Reuters Fed reporter covering Powell's soft-landing language and forecast caveats.",
        "Schneider catches monetary authority mid-hedge—when markets hang on phrasing.",
    ),
    "ian-hodder": (
        "Archaeologist of Çatalhöyük and theorist of human-thing entanglement over deep time.",
        "Hodder resists tidy progress stories—meaning binds to objects long before theory arrives.",
    ),
    "ian-r-bartky": (
        "Historian of standard time's adoption and the coordination of clocks across distance.",
        "Bartky shows modernity installing shared certainty as infrastructure.",
    ),
    "indra-nooyi": (
        "Former PepsiCo CEO whose memoir reframes corporate leadership through work, family, and stakeholder pressure.",
        "Nooyi shows executive authority negotiating market metrics and personal obligations at once.",
    ),
    "integrity-council-for-the-voluntary-carbon-market": (
        "Governance body issuing Core Carbon Principles for voluntary carbon-market integrity.",
        "The ICVCM is what happens when market 'responsibility' needs independent claim rules.",
    ),
    "international-sustainability-standards-board": (
        "IFRS foundation board setting global sustainability and climate disclosure standards (S1/S2).",
        "ISSB turns moral language about climate into investor-facing measurement requirements.",
    ),
    "james-c-vanderkam": (
        "Dead Sea Scrolls scholar surveying the finds and their impact on biblical studies.",
        "VanderKam opens a gateway text for how discovery unsettles settled canons.",
    ),
    "jane-addams": (
        "Settlement-house leader whose Hull-House practice treated democracy as daily neighborhood work.",
        "Addams models guest leadership as hospitality under pressure—authority earned by staying with complexity.",
    ),
    "jerald-greenberg": (
        "Organizational psychologist who mapped organizational justice—fairness perceptions at work across time.",
        "Greenberg supplies the grammar for when incentive systems feel legitimate or insulting.",
    ),
    "jo-ann-gibson-robinson": (
        "Montgomery organizer whose memoir documents women's networks that sparked the bus boycott.",
        "Robinson shows leadership that initiates before it is authorized—and then disappears from the plaque.",
    ),
    "john-carlin": (
        "Journalist who chronicled Mandela's use of sport and reconciliation theater in post-apartheid South Africa.",
        "Carlin captures strategic grace—leadership that converts enmity into a shared public ritual.",
    ),
    "john-hatcher": (
        "Economic historian of plague, population, and England's late-medieval economy.",
        "Hatcher links demographic shock to institutional change—certainty rewritten by mortality.",
    ),
    "john-l-heilbron": (
        "Historian of science who situates Galileo within early-modern institutions and intellectual conflict.",
        "Heilbron thickens the Galileo case beyond cartoon courage versus cartoon church.",
    ),
    "john-p-meier": (
        "Catholic biblical scholar of the historical Jesus, methodical about criteria and contested reconstructions.",
        "Meier embodies interpretive discipline when charismatic authority tempts readers toward certainty.",
    ),
    "jon-d-levenson": (
        "Biblical theologian of Sinai and Zion as paired centers of Jewish covenantal meaning.",
        "Levenson reads sacred geography as claim about where authority may speak.",
    ),
    "jonathan-cohn": (
        "Journalist chronicling the Affordable Care Act fights and the politics of American health reform.",
        "Cohn tracks how insurance incentives become contested public morality.",
    ),
    "jorge-e-hirsch": (
        "Physicist who proposed the h-index as a citation-based measure of research output.",
        "Hirsch's index is a case study in how a clever score becomes career destiny.",
    ),
    "joseph-j-ellis": (
        "Historian of Washington's character, temperament, and the making of presidential authority.",
        "Ellis humanizes founding leadership without dissolving its consequences.",
    ),
    "judith-m-brown": (
        "Historian of Gandhi's political rise and the tensions between moral hope and power-building.",
        "Brown keeps Gandhi historically thick—leadership as negotiation, not immaculate intention.",
    ),
    "justin-yifu-lin": (
        "Economist analyzing China's household responsibility system and agricultural reform incentives.",
        "Lin shows authority learning through institutional redesign after catastrophic collectivist certainty.",
    ),
    "kate-connolly": (
        "Guardian correspondent covering Merkel's COVID messaging and the contested legacy of her Russia policy.",
        "Connolly's reporting catches authority mid-explanation—when trust depends on numbers and memory.",
    ),
    "kate-xiao-zhou": (
        "Political scientist of Chinese farmers' quiet power in reshaping reform from below.",
        "Zhou relocates authority—policy that follows practices people already invented.",
    ),
    "key-v-o-jr": (
        "Political scientist of retrospective voting and the responsible electorate thesis.",
        "Key argues voters punish and reward—accountability as electoral learning, not omniscience.",
    ),
    "kff": (
        "Health-policy organization surveying employer benefits and coverage costs in the U.S.",
        "KFF data make private insurance incentives visible as lived household pressure.",
    ),
    "knight-foundation-and-gallup": (
        "Research partnership surveying American trust in media and democratic information environments.",
        "Their polls measure when public trust stops tracking institutions' self-descriptions.",
    ),
    "larry-m-bartels": (
        "Political scientist of partisan bias in political perceptions beyond a simple running tally.",
        "Bartels shows how prior loyalty warps what economic facts citizens think they saw.",
    ),
    "learning-policy-institute": (
        "Education research organization studying teacher shortages, turnover, and system capacity.",
        "LPI evidence shows incentive and burnout effects when schools treat teachers as interchangeable stock.",
    ),
    "lewis-hanke": (
        "Historian of the Valladolid debate over Indigenous rights and Spanish imperial conscience.",
        "Hanke shows empire forced—briefly—to argue whether all mankind is one.",
    ),
    "lewis-john-with-michael-d-orso": (
        "Civil rights organizer and congressman whose memoir recounts nonviolent discipline under assault.",
        "Lewis shows moral seriousness as practiced courage—authority that absorbs blows without becoming them.",
    ),
    "library-of-congress": (
        "U.S. national library whose Bayard Rustin papers preserve March on Washington planning materials.",
        "Archival sources make logistics of mass leadership visible—who drafted, mediated, and held the coalition.",
    ),
    "louisa-lim": (
        "Journalist of Tiananmen memory and the Chinese state's enforced forgetting.",
        "Lim shows misread history as policy—authority that polices what may be recalled.",
    ),
    "lupia-arthur-and-mathew-d-mccubbins": (
        "Political scientists asking whether citizens can learn what they need despite limited information.",
        "They model democratic judgment under cue-taking—certainty borrowed from trusted others.",
    ),
    "mahmood-mamdani": (
        "Political theorist critiquing South Africa's TRC tradeoffs between amnesty, justice, and nation-building.",
        "Mamdani pressures reconciliation narratives that risk insulating perpetrators from accountability.",
    ),
    "mark-blyth": (
        "Political economist of austerity as a dangerous idea recycled across crises.",
        "Blyth punctures moral language that treats fiscal pain as virtue regardless of outcomes.",
    ),
    "mark-edward-lewis": (
        "Historian of early Chinese sanctioned violence and the formation of political order.",
        "Lewis traces how force gets moralized into state ritual and story.",
    ),
    "mark-monmonier": (
        "Geographer explaining how maps persuade—projection, omission, and spatial rhetoric as power.",
        "Monmonier teaches legibility's tricks—when visualization becomes an incentive to believe.",
    ),
    "mark-zuckerberg": (
        "Meta CEO whose congressional testimony framed platform responsibility under commercial growth logic.",
        "Zuckerberg is a primary case of incentive language colliding with public accountability.",
    ),
    "mary-v-thompson": (
        "Mount Vernon historian documenting Washington, slavery, and the enslaved community on the estate.",
        "Thompson grounds founding authority in household records and regretted subjects left unavoidable.",
    ),
    "maurice-a-finocchiaro": (
        "Philosopher-historian compiling documentary history of the Galileo affair.",
        "Finocchiaro lets primary texts adjudicate who misread whom.",
    ),
    "merritt-anna-c-daniel-a-effron-and-beno-t-monin": (
        "Psychologists of moral self-licensing—how prior good acts free later bad ones.",
        "They explain how virtue credits become cover stories for harm.",
    ),
    "michael-eric-dyson": (
        "Cultural critic reclaiming a fuller, more conflicted Martin Luther King Jr. from pious reduction.",
        "Dyson resists misreading King as comfort—authority that still demands structural change.",
    ),
    "michael-j-de-la-merced": (
        "Business reporter covering activist investors and PepsiCo's public resistance to break-up pressure.",
        "His reporting shows corporate authority negotiating market moralism in real time.",
    ),
    "michael-j-puett": (
        "Scholar of early Chinese sacrifice, cosmology, and practices of becoming like a god.",
        "Puett explores how ritual remakes agents—authority as transformative technique.",
    ),
    "michael-k-honey": (
        "Labor historian of the Memphis sanitation strike and King's final campaign for economic dignity.",
        "Honey reconnects moral leadership to wages and work—authority that must answer material harm.",
    ),
    "mohandas-k-gandhi": (
        "Indian independence leader whose writings and campaigns treated nonviolence as political technology.",
        "Gandhi is the portfolio's recurring case of moral authority under empire—and of contested claims about who counts.",
    ),
    "mordechai-cogan": (
        "Assyriologist translating historical inscriptions that flood biblical studies with imperial voice.",
        "Cogan lets empire speak in its own record—certainty as royal inscription.",
    ),
    "morris-p-fiorina": (
        "Political scientist of retrospective voting in national elections.",
        "Fiorina frames electorate judgment as performance evaluation more than ideology exam.",
    ),
    "n-t-wright": (
        "New Testament theologian reading Jesus's vocation against Israel's hope and empire's claims.",
        "Wright keeps religious leadership claims historically argued rather than sentimentally floated.",
    ),
    "national-archives-u-s": (
        "U.S. federal archives holding March on Washington demands and related civil-rights documentary evidence.",
        "Primary documents straighten leadership myths—what was actually asked for in public.",
    ),
    "national-center-for-education-statistics": (
        "Federal statistical agency publishing graduation rates and schooling indicators.",
        "NCES metrics become moral scoreboards—what gets counted gets managed.",
    ),
    "national-science-foundation": (
        "U.S. science funder whose merit-review criteria and PAPPG set the rules of research worthiness.",
        "NSF policy shows how peer judgment is institutionalized as an incentive system.",
    ),
    "nelson-mandela": (
        "Anti-apartheid leader and South African president whose prison statement and memoir frame dignity under domination.",
        "Mandela models long-horizon moral leadership—authority that survives captivity without collapsing into vengeance.",
    ),
    "nissen-hans-j-peter-damerow-and-robert-k-englund": (
        "Scholars of archaic bookkeeping and the administrative origins of writing.",
        "They root 'civilization' in clay tallies—certainty invented to track stores and labor.",
    ),
    "nobel-prize": (
        "Nobel institutions publicizing Peace Prize citations and laureate narratives, including Wangari Maathai.",
        "Prize machinery shows how moral leadership gets internationally certified—and selectively celebrated.",
    ),
    "organisation-for-economic-co-operation-and-development": (
        "Intergovernmental body publishing PISA and other comparative education and policy metrics.",
        "OECD rankings export a moral language of 'performance' across national school systems.",
    ),
    "patti-waldmeir": (
        "Journalist chronicling apartheid's end as contingency, negotiation, and near-failure.",
        "Waldmeir keeps the 'miracle' narrative from erasing how close things came to blood.",
    ),
    "pollstar": (
        "Music industry data publisher tracking tour rankings and commercial scale of live performance.",
        "Pollstar quantifies when entertainment logistics become the scoreboard for care and responsibility.",
    ),
    "rainer-albertz": (
        "Historian of Israel's exile period and the literature produced under displacement.",
        "Albertz shows theology rewritten when political certainty collapses.",
    ),
    "ramachandra-guha": (
        "Historian of Gandhi across phases—from South Africa to the remaking of India—skeptical of simple sainthood.",
        "Guha gives chronological thickness when moral examples are asked to do present-day work.",
    ),
    "record-commission": (
        "Nineteenth-century British commission that published Statutes of the Realm as authoritative law texts.",
        "The commission made legal past legible—certainty rebound into volumes.",
    ),
    "residents-of-hull-house": (
        "Collective authors of Hull-House Maps and Papers, mapping neighborhood poverty and civic interdependence.",
        "Their maps make moral leadership empirical—seeing neighbors as data and duty at once.",
    ),
    "reuters-institute-for-the-study-of-journalism": (
        "Oxford institute publishing the Digital News Report on news trust, platforms, and media use.",
        "Their annual survey tracks when news incentives and audience trust diverge.",
    ),
    "richard-j-blackwell": (
        "Philosopher of science reading Galileo, Bellarmine, and biblical interpretation under pressure.",
        "Blackwell clarifies when scriptural authority is asked to do astronomical work.",
    ),
    "richard-salomon": (
        "Epigrapher guiding the study of Indian inscriptions as historical sources.",
        "Salomon teaches how carved text becomes evidence when narrative is thin.",
    ),
    "robert-eno": (
        "Sinologist on the Mandate of Heaven and early Chinese historiography's moral grammar.",
        "Eno shows history writing as judgment on rulers—certainty as heavenly audit.",
    ),
    "robin-alexander": (
        "German journalist analyzing Merkel's refugee-policy decisions and the politics of being driven by events.",
        "Alexander studies authority that claims competence while narrating itself as compelled.",
    ),
    "romila-thapar": (
        "Historian of Asoka and Mauryan decline, exacting about evidence and imperial mythology.",
        "Thapar models demythologizing ancient authority without cynicism.",
    ),
    "ron-chernow": (
        "Biographer of Washington who braids military, political, and private contradictions into one life.",
        "Chernow is the long-form check on simplified founding leadership stories.",
    ),
    "science-based-targets-initiative": (
        "Partnership setting corporate net-zero standards claiming scientific pathway alignment.",
        "SBTi is moral language as target-setting—credibility rented through methodology.",
    ),
    "south-african-history-online": (
        "Public history project documenting South Africa's democracy transition and related civic milestones.",
        "Accessible chronology keeps transition leadership tied to dates, votes, and contested memory.",
    ),
    "stillman-drake": (
        "Galileo translator and interpreter making early scientific writings available for modern argument.",
        "Drake keeps Galilean claim-making legible when authority disputes observation.",
    ),
    "sundar-pichai": (
        "Google CEO whose congressional testimony defended platform policies under competition and speech pressure.",
        "Pichai scenes show tech leadership answering incentive questions it would rather treat as engineering detail.",
    ),
    "taylor-branch": (
        "Narrative historian of America in the King years across three landmark volumes.",
        "Branch is the long civic chronicle when leadership is inseparable from national story.",
    ),
    "thomas-p-slaughter": (
        "Historian of the Whiskey Rebellion as frontier conflict with federal authority.",
        "Slaughter shows early American legitimacy tested by tax, force, and local refusal.",
    ),
    "timothy-brook": (
        "Historian of the military suppression of Beijing's 1989 democracy movement.",
        "Brook documents how state authority ends argument with force—and then manages memory.",
    ),
    "timothy-garton-ash": (
        "Witness-historian of 1989's Central European revolutions and the improvisation of post-authoritarian politics.",
        "Garton Ash captures leadership as timing—authority that arrives when the old story fails in public.",
    ),
    "tom-standage": (
        "Technology historian comparing the Victorian telegraph to modern internet social dynamics.",
        "Standage shows new media reinventing old dramas of rumor, speed, and authority.",
    ),
    "truth-and-reconciliation-commission": (
        "South African commission that investigated apartheid-era abuses and published a multi-volume final report.",
        "The TRC is the institutional case for truth as a precondition of political renewal.",
    ),
    "u-s-department-of-the-treasury-board-of-governors-of-the-federal-reserve-system-and-federal-deposit-insurance-corporation": (
        "Joint Treasury–Fed–FDIC statements coordinating crisis language about banks and deposits.",
        "Tri-agency speech is authority synchronizing to stop a bank run with words and backstops.",
    ),
    "u-s-environmental-protection-agency": (
        "U.S. environmental regulator whose Clean Diesel notices exposed emissions cheating as compliance theater.",
        "EPA enforcement is the hard case when metrics are gamed and the public pays.",
    ),
    "u-s-house-of-representatives": (
        "U.S. House whose Katrina investigation report catalogued federal initiative failure.",
        "The report is institutional self-critique—authority accounting for unread signals.",
    ),
    "u-s-senate-subcommittee-on-communications": (
        "Senate subcommittee whose Public Broadcasting Act hearings shaped the civic case for noncommercial media.",
        "The hearings show how public trust in media is legislated—leadership argued into existence.",
    ),
    "u-s-white-house": (
        "Executive lessons-learned report on the federal response to Hurricane Katrina.",
        "The White House document shows official knowledge after catastrophe—certainty rebuilt in retrospect.",
    ),
    "united-states-congress": (
        "U.S. legislature behind statutes such as ESSA and WARN that encode accountability and disclosure rules.",
        "Congressional statutes are incentive architecture with the force of law.",
    ),
    "victor-s-navasky": (
        "Journalist-historian of naming names in the Hollywood blacklist era.",
        "Navasky maps collaboration, fear, and the moral ledger of informing.",
    ),
    "voluntary-carbon-markets-integrity-initiative": (
        "Initiative publishing claims codes for voluntary carbon-market integrity and green claims.",
        "VCMI polices how climate virtue can be said without becoming free-floating moral language.",
    ),
    "wangari-maathai": (
        "Kenyan environmental leader and Nobel laureate whose Green Belt Movement linked trees, democracy, and dignity.",
        "Maathai models ecological guest leadership—authority grown through care of shared ground.",
    ),
    "wayne-a-meeks": (
        "New Testament scholar of early urban Christians and the social world of Pauline communities.",
        "Meeks reads leadership as social formation—networks, status, and belonging before creeds harden.",
    ),
    "webb-miller": (
        "Foreign correspondent who reported the Dharasana salt raid and British force against nonviolent protests.",
        "Miller's dispatches make repression visible—when violence answers moral leadership in view of the world.",
    ),
    "william-p-jones": (
        "Historian of the March on Washington who recovers the jobs-and-freedom coalition behind the landmark day.",
        "Jones restores economic demands to a story often reduced to a single speech.",
    ),
    "wolfgang-schivelbusch": (
        "Cultural historian of railway travel and the industrialization of space and time.",
        "Schivelbusch captures modernity's new sensorium—when speed rewires what feels certain.",
    ),
}

DRAFT_MARKERS = ("draft aggregated", "edit before promotion", "edit summary before promotion")


def _is_draft(summary: str) -> bool:
    low = summary.lower()
    return any(m in low for m in DRAFT_MARKERS)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite even non-draft summaries when slug is listed",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    thinkers_dir = repo / THINKERS
    updated = 0
    skipped = 0
    missing = 0
    for slug, (summary, why) in sorted(ENRICHMENTS.items()):
        path = thinkers_dir / f"{slug}.yml"
        if not path.is_file():
            missing += 1
            print(f"missing thinker file: {slug}", file=sys.stderr)
            continue
        doc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        current = str(doc.get("summary") or "")
        if not args.force and current and not _is_draft(current):
            skipped += 1
            continue
        doc["summary"] = summary
        if why:
            doc["whyThisMatters"] = why
        elif "whyThisMatters" in doc and _is_draft(str(doc.get("whyThisMatters") or "")):
            del doc["whyThisMatters"]
        text = (
            yaml.safe_dump(
                doc, allow_unicode=True, default_flow_style=False, sort_keys=False
            ).rstrip()
            + "\n"
        )
        action = "would update" if args.dry_run else "update"
        print(f"{action} {slug}")
        if not args.dry_run:
            path.write_text(text, encoding="utf-8")
        updated += 1
    print(
        f"updated={updated} skipped_non_draft={skipped} missing_files={missing} catalog={len(ENRICHMENTS)}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
