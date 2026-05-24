"""
Book-grounded enrichment for Before Certainty Arrives.

Sourced from books/before-certainty-arrives manuscript (essay edition, 2026 draft pass).
"""

from __future__ import annotations

ENRICHMENT_FIELDS = (
    "recognitionSignals",
    "questions",
    "counterbalances",
    "trajectory",
    "manifestations",
)

BCA_GLOSSARY = frozenset(
    {
        "certainty",
        "uncertainty",
        "interpretation",
        "meaning",
        "consequence",
        "coordination",
        "compression",
        "constraint",
        "inheritance",
        "cohesion",
        "adaptation",
        "bureaucracy",
        "distance",
        "drift",
        "exposure",
        "proximity",
    }
)

GLOSSARY: dict[str, dict] = {
    "certainty": {
        "recognitionSignals": [
            "the season will not wait while people debate what is true",
            "roles and repetition hold before reasons are argued for",
            "shared expectation matters more than shared conviction in the moment",
            "what held yesterday must still be recognizable tomorrow",
        ],
        "questions": [
            "What problem did this certainty solve when it first formed?",
            "Where is certainty doing coordination work rather than describing truth?",
            "What would fracture if this expectation were reopened today?",
        ],
        "counterbalances": [
            "ask what holds long enough to live, not only what is right",
            "notice adaptation before calling it error",
            "separate necessity from permanence",
        ],
        "trajectory": {
            "earlySignals": [
                "certainty still feels necessary under visible constraint",
                "compression follows instability quickly",
            ],
            "intensificationSignals": [
                "what held becomes moral rather than merely useful",
                "revision begins to feel like betrayal or collapse",
            ],
            "failureModes": [
                "certainty outlives the conditions that first made it workable",
                "systems still run while the fit thins",
            ],
            "restorationPaths": [
                "recognize why certainty arrived before asking it to leave",
                "name the original pressure before judging inherited form",
            ],
        },
        "manifestations": {
            "politics": [
                "law settles disputes before philosophy finishes arguing",
                "sacred authority relocates legitimacy beyond ordinary revision",
            ],
            "organizations": [
                "canon and procedure replace presence at scale",
                "queues and stamps still recognize names long enough for work to continue",
            ],
            "family": [
                "ritual synchronizes meals and obligation before belief is debated",
            ],
        },
    },
    "uncertainty": {
        "recognitionSignals": [
            "coordination breaks down before truth is settled",
            "disagreement becomes costly faster than explanation can travel",
            "strangers must act together without shared context",
            "instability becomes intolerable before clarity arrives",
        ],
        "questions": [
            "What uncertainty is moral life trying to reduce here?",
            "Is ambiguity dangerous because people are less capable, or because failure now scales?",
            "What would hold if interpretation stayed open another season?",
        ],
        "counterbalances": [
            "do not treat uncertainty as moral advancement by default",
            "distinguish openness from breakdown",
            "watch whether compression follows instability",
        ],
        "trajectory": {
            "earlySignals": [
                "material and existential risk stays visibly high",
                "hesitation carries immediate cost",
            ],
            "intensificationSignals": [
                "uncertainty at scale follows imperial or institutional collapse",
                "exposure widens faster than shared meaning can absorb",
            ],
            "failureModes": [
                "uncertainty is mistaken for freedom after breakdown",
                "systems demand certainty past the point of fit",
            ],
            "restorationPaths": [
                "name the pressure uncertainty is responding to",
                "ask what coordination problem certainty is solving",
            ],
        },
        "manifestations": {
            "politics": [
                "post-plague villages argue over obligation while fields lie untilled",
                "confessional boundaries multiply while trade rewires obligation",
            ],
            "organizations": [
                "oral tradition fractures as authority stretches across distance",
            ],
            "family": [
                "failed hunts force the question of who will still choose to stay",
            ],
        },
    },
    "interpretation": {
        "recognitionSignals": [
            "what one did mattered before why one did it",
            "doctrine narrows while ritual still synchronizes life",
            "canon draws firmer boundaries once writing multiplies voices",
            "disputes end when category replaces discernment",
        ],
        "questions": [
            "Where has interpretation been narrowed to hold action steady?",
            "Who benefits when alternatives feel dangerous rather than merely unpopular?",
            "What would renegotiation cost if the season turned tomorrow?",
        ],
        "counterbalances": [
            "notice practice before principle",
            "allow scenes to breathe before naming doctrine",
            "separate enforced meaning from negotiated meaning",
        ],
        "trajectory": {
            "earlySignals": [
                "interpretation follows stability rather than leading it",
                "meaning accumulates after survival practices hold",
            ],
            "intensificationSignals": [
                "sacred authority compresses acceptable disagreement",
                "law declares which interpretations will count",
            ],
            "failureModes": [
                "interpretation freezes while conditions shift",
                "revision feels indistinguishable from collapse",
            ],
            "restorationPaths": [
                "ask when interpretation was last tied to visible constraint",
                "recognize compression before calling it dogma",
            ],
        },
        "manifestations": {
            "politics": [
                "Hammurabi cases render judgment as fixed category",
                "Ashoka edicts make dharma legible across an empire",
            ],
            "organizations": [
                "copyists reproduce texts with painstaking uniformity",
            ],
            "family": [
                "feast days and godparents mark allegiance before theology is argued",
            ],
        },
    },
    "meaning": {
        "recognitionSignals": [
            "obligation shows itself in calloused hands before it becomes principle",
            "shared ritual feels like survival rather than ornament",
            "the ledger balances while the moral map cannot",
            "meaning drifts as it travels across distance",
        ],
        "questions": [
            "What meaning is coordination carrying here versus revelation?",
            "Where did stabilizing practice and moral truth become hard to separate?",
            "What would remain recognizable if the shrine burned?",
        ],
        "counterbalances": [
            "honor beauty and grief inside structural coordination",
            "do not reduce lived meaning to machinery alone",
            "watch for meaning preserved in matter when voice cannot travel",
        ],
        "trajectory": {
            "earlySignals": [
                "meaning is embedded in practice under pressure",
                "rituals work before they are explained",
            ],
            "intensificationSignals": [
                "what held becomes the shape of the good itself",
                "canon freezes meaning across generations",
            ],
            "failureModes": [
                "meaning thins while machinery still runs",
                "inherited meaning outlives shared context",
            ],
            "restorationPaths": [
                "return to the scene where meaning first made life workable",
                "separate function from permanence before judging failure",
            ],
        },
        "manifestations": {
            "politics": [
                "cosmology places every role inside a recognizable moral structure",
                "confessional maps are drawn in distant capitals",
            ],
            "organizations": [
                "temple grain and calendar synchronize seasons across populations",
            ],
            "family": [
                "a widow feels grace mixed with fear at the storehouse queue",
            ],
        },
    },
    "consequence": {
        "recognitionSignals": [
            "the decision travels on paper while the consequence arrives in bodies",
            "planners optimize logistics far from where harm lands",
            "no one in the room can trace the full chain that produced the harm",
            "feedback slows as authority loses presence",
        ],
        "questions": [
            "Who stands where the consequence lands?",
            "How long between action and recognizable effect?",
            "What would change if the wait downstairs were visible upstairs?",
        ],
        "counterbalances": [
            "follow the file to the body, not only the policy",
            "keep harm traceable before calling compliance correct",
            "notice delay that feels administrative rather than dramatic",
        ],
        "trajectory": {
            "earlySignals": [
                "consequence still meets action within kinship and proximity",
                "accountability remains visible though uneven",
            ],
            "intensificationSignals": [
                "distance opens between rulers and subjects",
                "role compliance replaces discernment",
            ],
            "failureModes": [
                "consequence becomes ordinary enough to endure",
                "systems record outcomes people no longer feel",
            ],
            "restorationPaths": [
                "name who waits downstream while charts are updated",
                "recognize distance before asking for moral clarity alone",
            ],
        },
        "manifestations": {
            "politics": [
                "staff officers move divisions on maps far from trenches",
                "investigators trace causation while prescriptions still wait",
            ],
            "organizations": [
                "clerks stamp orders executed in provinces they will never visit",
            ],
            "family": [
                "families ration by the day inside siege walls",
            ],
        },
    },
    "coordination": {
        "recognitionSignals": [
            "the wall matters more than the grievance for one season",
            "strangers exchange under weights neither party fully trusts",
            "the queue moves because the line must keep moving",
            "machinery recognizes a name long enough for life to continue",
        ],
        "questions": [
            "What coordination problem is this tool solving?",
            "What breaks if behavior stops being predictable tomorrow?",
            "Where is coordination purchased at the cost of revision?",
        ],
        "counterbalances": [
            "ask what holds before asking what is true",
            "notice lived meaning alongside structural work",
            "do not treat coordination as moral proof",
        ],
        "trajectory": {
            "earlySignals": [
                "shared expectation holds small groups together",
                "ritual and role stabilize action under scarcity",
            ],
            "intensificationSignals": [
                "coordination depends on law, canon, and bureaucracy at scale",
                "portable ethics travel with merchants and exiles",
            ],
            "failureModes": [
                "inherited coordination is asked to anchor strangers alone",
                "systems coordinate while meaning thins",
            ],
            "restorationPaths": [
                "name the pressure coordination first answered",
                "recognize tools before demanding they explain themselves",
            ],
        },
        "manifestations": {
            "politics": [
                "tribute lists and census records bind absent populations",
                "Axial teachers carry rules between warring states",
            ],
            "organizations": [
                "factory bells mark shifts for thousands who never meet",
            ],
            "family": [
                "who draws water first matters more than why the rule exists",
            ],
        },
    },
    "compression": {
        "recognitionSignals": [
            "instability demands compression before truth is settled",
            "law narrows discretion so the same words will be read tomorrow",
            "moral depth and moral narrowing arrive together under pressure",
            "acceptable interpretation shrinks while exposure widens",
        ],
        "questions": [
            "What variance is being removed to hold action steady?",
            "Where is compression relief rather than oppression?",
            "When did compression become portable across distance?",
        ],
        "counterbalances": [
            "recognize compression as adaptation before calling it failure",
            "watch scenes before naming the framework",
            "separate temporary tightening from inherited rigidity",
        ],
        "trajectory": {
            "earlySignals": [
                "compression follows catastrophe rather than contemplation",
                "roles precede reasons under visible constraint",
            ],
            "intensificationSignals": [
                "writing and canon externalize judgment",
                "belief hardens locally while diversity expands globally",
            ],
            "failureModes": [
                "tools built to compress instability begin to constrain adaptation",
                "compression outlives the conditions that required it",
            ],
            "restorationPaths": [
                "ask what problem compression first solved",
                "notice when permanence succeeds and then accumulates weight",
            ],
        },
        "manifestations": {
            "politics": [
                "siege walls postpone quarrels because the gate must hold",
                "confessional certainty tightens as printing multiplies voices",
            ],
            "organizations": [
                "categories replace discernment at the city gate",
            ],
            "family": [
                "seasonal scarcity does not permit prolonged moral debate",
            ],
        },
    },
    "constraint": {
        "recognitionSignals": [
            "deliberation is costly when hesitation can be fatal",
            "the season will not wait for argument to finish",
            "survival organizes pressure before abstraction does",
            "ages in this history are defined by shared constraints rather than geography",
        ],
        "questions": [
            "What constraints was this system responding to?",
            "Where is rigidity adaptive rather than merely oppressive?",
            "What would change if the original pressure returned?",
        ],
        "counterbalances": [
            "avoid ranking eras by openness alone",
            "judge adaptation before judging truth",
            "notice constraint without romanticizing it",
        ],
        "trajectory": {
            "earlySignals": [
                "constraint is visible in hunger, exposure, and violence",
                "moral life must function before it can be debated",
            ],
            "intensificationSignals": [
                "constraint shifts from scarcity to scale and distance",
                "inherited tools face pressures they were not built for",
            ],
            "failureModes": [
                "constraint is forgotten while inherited form remains",
                "systems are judged by present standards alone",
            ],
            "restorationPaths": [
                "return to the pressure that first made the tool necessary",
                "ask what held long enough to live",
            ],
        },
        "manifestations": {
            "politics": [
                "harvest counts are pressed into clay before justice is debated",
                "medieval Europe re-adapts after imperial infrastructure fails",
            ],
            "organizations": [
                "irrigation day settles disputes before principle is argued",
            ],
            "family": [
                "sharing meat at the fire is about who will be alive at dawn",
            ],
        },
    },
    "inheritance": {
        "recognitionSignals": [
            "archives still stand while roads between them do not",
            "tools continue with inherited authority after conditions shift",
            "practices feel permanent that began as adaptation",
            "the week continues inside structures taken for granted",
        ],
        "questions": [
            "What conditions first made this inheritance necessary?",
            "Where is inheritance doing work nothing else yet does?",
            "When did stabilization begin to outlive its reasons?",
        ],
        "counterbalances": [
            "recognize function before calling inheritance error",
            "separate persistence from proof",
            "notice inertia without demanding rupture",
        ],
        "trajectory": {
            "earlySignals": [
                "stabilizing practices begin to travel across generations",
                "writing preserves norms when authors are absent",
            ],
            "intensificationSignals": [
                "what held becomes moral truth rather than contingent response",
                "institutional certainty replaces temple walls with files and bells",
            ],
            "failureModes": [
                "inherited tools resist revision while conditions change",
                "systems outlive themselves without admitting strain",
            ],
            "restorationPaths": [
                "name what was inherited and what pressure shaped it",
                "stop at recognition before prescribing replacement",
            ],
        },
        "manifestations": {
            "politics": [
                "Roman milestones rot while local walls matter more",
                "sacred order fixed in stone outlasts priests who explain it",
            ],
            "organizations": [
                "canon and bureaucracy carry certainty beyond its makers",
            ],
            "family": [
                "feast days and titles mark boundaries people still recognize",
            ],
        },
    },
    "cohesion": {
        "recognitionSignals": [
            "norm repetition increases when threat is visible",
            "groups that enforce norms more consistently often hold together longer",
            "ritual synchronizes behavior through seasons",
            "loyalty replaces abstraction when institutions thin",
        ],
        "questions": [
            "What cohesion is being purchased with narrowed choice?",
            "Where does deference to authority increase under pressure?",
            "What breaks if variance is tolerated one season longer?",
        ],
        "counterbalances": [
            "do not treat cohesion as moral proof",
            "notice cost alongside survival",
            "watch for cohesion purchased with rigidity",
        ],
        "trajectory": {
            "earlySignals": [
                "shared expectation holds the band together at the fire",
                "role stability matters more than individual justification",
            ],
            "intensificationSignals": [
                "sacred framing steadies obedience emotionally",
                "feudal obligation makes duty visible before it becomes virtue",
            ],
            "failureModes": [
                "cohesion hardens into exclusion and heresy policing",
                "groups fracture when variance is tolerated too long under siege",
            ],
            "restorationPaths": [
                "ask what cohesion problem the order first solved",
                "recognize cohesion without requiring admiration",
            ],
        },
        "manifestations": {
            "politics": [
                "customary law privileges precedent over reinterpretation",
                "church ritual synchronizes moral life across fragmented territories",
            ],
            "organizations": [
                "same bells call the same fields back to order for generations",
            ],
            "family": [
                "children held close in the temple queue while names are called",
            ],
        },
    },
    "adaptation": {
        "recognitionSignals": [
            "moral systems appear as responses to pressure rather than final discoveries",
            "re-adaptation follows collapse without open-ended experiment",
            "what began as adaptation eventually feels permanent",
            "structural coordination and lived meaning arrive together",
        ],
        "questions": [
            "What problem did this adaptation solve when it emerged?",
            "Where is adaptation mistaken for regression or progress?",
            "What would reopening look like if urgency returned?",
        ],
        "counterbalances": [
            "treat adaptation as descriptive before judging it",
            "avoid hindsight that makes necessity look like blindness",
            "honor grief and belonging inside adaptive systems",
        ],
        "trajectory": {
            "earlySignals": [
                "adaptation follows instability rather than contemplation",
                "Axial traditions rise under shared conditions, not shared revelation",
            ],
            "intensificationSignals": [
                "adaptive tools become moral truths across generations",
                "medieval Europe tightens after imperial collapse",
            ],
            "failureModes": [
                "adaptation outlives the conditions that required it",
                "systems are judged by standards their adapters never held",
            ],
            "restorationPaths": [
                "ask what constraints the adaptation responded to",
                "recognize adaptation before calling for liberation",
            ],
        },
        "manifestations": {
            "politics": [
                "Bronze Age order replaces explanation with visible law",
                "post-Roman Europe reassembles authority from thinner tools",
            ],
            "organizations": [
                "portable ethics survive on roads fortresses cannot secure",
            ],
            "family": [
                "families displaced by war need rules that still make sense after the shrine burns",
            ],
        },
    },
    "bureaucracy": {
        "recognitionSignals": [
            "the room feels like Tuesday before the first form is stamped",
            "box seven rather than box four determines whether a lease continues",
            "the clerk asks for another copy, another signature, another wait",
            "no one feels cruel; no one feels fully responsible either",
        ],
        "questions": [
            "What coordination is bureaucracy making repeatable here?",
            "Where does procedure replace discernment without announcing itself?",
            "Who waits downstairs while charts are updated upstairs?",
        ],
        "counterbalances": [
            "notice relief alongside exhaustion at the corrected stamp",
            "do not confuse procedural reliability with moral proof",
            "follow the file without losing the body",
        ],
        "trajectory": {
            "earlySignals": [
                "bureaucracy extends permanence into practice",
                "rules replace discretion as scale grows",
            ],
            "intensificationSignals": [
                "identity becomes administrable before it is fully felt",
                "compliance replaces discernment across offices",
            ],
            "failureModes": [
                "bureaucracy coordinates while meaning quietly thins",
                "systems function without anyone tracing harm",
            ],
            "restorationPaths": [
                "recognize bureaucracy as moral infrastructure before condemning it",
                "name who waits while machinery keeps its appointments",
            ],
        },
        "manifestations": {
            "politics": [
                "Han clerks copy edicts into provincial registers",
                "census takers move door to door while conscription rolls are stamped",
            ],
            "organizations": [
                "housing offices route forms to the next desk while waits continue",
            ],
            "family": [
                "a bus pass must be revalidated before a child is late for school",
            ],
        },
    },
    "distance": {
        "recognitionSignals": [
            "governors sign orders months before villages learn the cost",
            "investigators trace causation in rooms far from the wait",
            "the file moves; the body receives the consequence",
            "action and reflection no longer meet in the same place",
        ],
        "questions": [
            "How far does decision travel before consequence is felt?",
            "Who can see the full chain between policy and harm?",
            "Where has distance made role compliance feel sufficient?",
        ],
        "counterbalances": [
            "return attention to the queue downstairs",
            "notice delay that feels ordinary rather than dramatic",
            "separate scale from moral judgment",
        ],
        "trajectory": {
            "earlySignals": [
                "distance opens as populations and authority stretch",
                "feedback slows while harm becomes harder to trace",
            ],
            "intensificationSignals": [
                "institutions record outcomes people experience differently",
                "explanation remains credible far from those who wait",
            ],
            "failureModes": [
                "distance becomes built into the architecture of moral life",
                "systems run while fit thins unnoticed",
            ],
            "restorationPaths": [
                "name the gap between what institutions record and what people experience",
                "recognize distance before asking certainty to fail",
            ],
        },
        "manifestations": {
            "politics": [
                "sealed orders open distance stone calendars once closed",
                "technocratic binders stack while names have not cleared downstairs",
            ],
            "organizations": [
                "staff rotate from one crisis to the next without open collapse",
            ],
            "family": [
                "neighbors sign forms in triplicate without reading the third copy",
            ],
        },
    },
    "drift": {
        "recognitionSignals": [
            "meaning drifts as it travels across distance",
            "moral reasoning drifts toward role compliance",
            "machinery still runs while meaning quietly thins",
            "habit carries what explanation no longer fully reassures",
        ],
        "questions": [
            "What is drifting away from its original conditions?",
            "Where does continuity mask thinning fit?",
            "What still works well enough to be taken for granted?",
        ],
        "counterbalances": [
            "distinguish drift from immediate failure",
            "notice strain before demanding rupture",
            "recognize inertia without calling it corruption",
        ],
        "trajectory": {
            "earlySignals": [
                "local enforcement varies as oral tradition travels",
                "tools remain effective at enforcing norms",
            ],
            "intensificationSignals": [
                "institutions outlive the pressures that shaped them",
                "credibility erodes faster than authority itself",
            ],
            "failureModes": [
                "fit thins while appointments still clear",
                "systems persist because nothing else yet does",
            ],
            "restorationPaths": [
                "name drift before prescribing replacement frameworks",
                "stop at recognition when instruction would repeat the pattern",
            ],
        },
        "manifestations": {
            "politics": [
                "postwar planning language outlasts the offices that first needed it",
                "inherited categories fail to contain returning ships",
            ],
            "organizations": [
                "ticket numbers still called while fluorescent lights hum at closing",
            ],
            "family": [
                "payroll continues while conviction is no longer required",
            ],
        },
    },
    "exposure": {
        "recognitionSignals": [
            "ships return with goods and charts inherited categories cannot contain",
            "competing texts arrive weekly while neighbors watch allegiances",
            "the ledger balances while the moral map cannot",
            "certainty is no longer alone even when it is not yet wrong",
        ],
        "questions": [
            "What novelty is arriving faster than inherited frameworks can absorb?",
            "Where does exposure tighten belief locally while diversity expands globally?",
            "Which funeral rites and feast days mark the fracture?",
        ],
        "counterbalances": [
            "do not treat exposure as automatic moral progress",
            "watch social texture before naming pluralism",
            "notice tightening that follows widening contact",
        ],
        "trajectory": {
            "earlySignals": [
                "inherited certainty is stable while the world stays familiar",
                "new knowledge is absorbed as refinement before rupture",
            ],
            "intensificationSignals": [
                "confessional boundaries sharpen as printing spreads disagreement",
                "trade rewires obligation faster than doctrine can follow",
            ],
            "failureModes": [
                "exposure is mistaken for freedom without coordination",
                "competing certainties govern without shared jurisdiction",
            ],
            "restorationPaths": [
                "ask which certainty will govern shared life, not only which is true",
                "recognize exposure before demanding synthesis",
            ],
        },
        "manifestations": {
            "politics": [
                "anatomical theaters widen observation before allegiance absorbs it",
                "confessional maps are drawn in distant capitals",
            ],
            "organizations": [
                "print shops multiply voices faster than canon can settle",
            ],
            "family": [
                "a baker learns the family across the lane keeps different feast days",
            ],
        },
    },
    "proximity": {
        "recognitionSignals": [
            "small groups regulate behavior through familiarity and shared memory",
            "deviations are noticed quickly when authority is personal",
            "kinship and repetition weaken as scale grows",
            "oral tradition holds before writing preserves across absence",
        ],
        "questions": [
            "What nearness to consequence is being lost here?",
            "Where did proximity once carry moral regulation?",
            "What replaces it when strangers must coordinate?",
        ],
        "counterbalances": [
            "notice what proximity solved before celebrating scale",
            "avoid nostalgia for constraint without naming its costs",
            "watch storage in matter when presence fails",
        ],
        "trajectory": {
            "earlySignals": [
                "proximity carries feedback, memory, and immediate accountability",
                "moral coordination depends on who one knows",
            ],
            "intensificationSignals": [
                "proximity and repetition thin under population density",
                "Axial ethics must travel when place becomes unstable",
            ],
            "failureModes": [
                "proximity is assumed lost while inherited tools resist revision",
                "strangers coordinate through files without relational grounding",
            ],
            "restorationPaths": [
                "ask what proximity made recognizable before abstraction",
                "recognize portable ethics as response to lost nearness",
            ],
        },
        "manifestations": {
            "politics": [
                "elders decide sluice disputes because the season will not wait",
                "feudal homage is sworn with hands on relic or hilt",
            ],
            "organizations": [
                "temple queues check marked jars against ledger marks",
            ],
            "family": [
                "foraging bands cannot delay sharing decisions until argument finishes",
            ],
        },
    },
}


def enrichment_for(slug: str, entity_type: str = "glossary") -> dict | None:
    if entity_type != "glossary":
        return None
    return GLOSSARY.get(slug)
