"""
Book-grounded enrichment for After Certainty (issue #116).

Sourced from books/after-certainty manuscript (parts, front matter, conclusion).
"""

from __future__ import annotations

ENRICHMENT_FIELDS = (
    "recognitionSignals",
    "questions",
    "counterbalances",
    "trajectory",
    "manifestations",
)

# Ten appendix patterns — primary chapters per docs/pattern-language.md
PATTERNS: dict[str, dict] = {
    "correctness-hardens-into-identity": {
        "recognitionSignals": [
            "disagreement is felt approaching the point where people defend instead of revise",
            "the stronger case on paper goes unpressed to keep the room from escalating",
            "every correction spawns new audiences and interpretations instead of convergence",
            "being right begins signaling seriousness more than shared reality",
        ],
        "questions": [
            "When would pressing the stronger case cost more than it would save?",
            "Where is letting silence stay in the room serving revisability rather than avoidance?",
            "What would change if correctness were a tool again instead of a moral achievement?",
        ],
        "counterbalances": [
            "leave room for a smaller question instead of winning the argument",
            "treat the meeting ending without resolution as success, not failure",
            "separate being right from belonging in the room",
        ],
        "trajectory": {
            "earlySignals": [
                "correctness still feels like safety and justified discipline",
                "evidence and study are invoked before scale fragments the picture",
            ],
            "intensificationSignals": [
                "confidence escalates while understanding thins",
                "competing certainties harden into moral worlds",
                "disagreement starts feeling irresponsible",
            ],
            "failureModes": [
                "revision feels like betrayal to the group",
                "no shared picture can be revised collectively",
            ],
            "restorationPaths": [
                "practice judgment without finality in the same conversation",
                "name partial understanding before acting",
            ],
        },
        "manifestations": {
            "leadership": [
                "strategy meetings reward the strongest case on paper over contact",
                "executives treat challenged forecasts as attacks on seriousness",
            ],
            "organizations": [
                "clarification campaigns multiply frames instead of settling them",
                "consensus is prized over updating shared reality",
            ],
            "politics": [
                "public debate rewards certainty displays over revisability",
            ],
        },
    },
    "explanation-replaces-response": {
        "recognitionSignals": [
            "the postmortem is praised while the same delays continue outside",
            "briefings make harm legible without making it smaller",
            "organizations narrate constraints instead of naming tradeoffs",
            "additional analysis is requested when a decision is already sensed",
        ],
        "questions": [
            "Did the briefing reduce suffering or reorganize it?",
            "What response is required now that the timeline is understood?",
            "When has understanding become emotionally sufficient without changing effects?",
        ],
        "counterbalances": [
            "pair every analysis cycle with a named decision and owner",
            "stop when harm outside the room is unchanged",
            "ask what this requires of us now, not only why it happened",
        ],
        "trajectory": {
            "earlySignals": [
                "explanation arrives immediately after harm and feels like care",
                "people nod through thoughtful questions and take notes",
            ],
            "intensificationSignals": [
                "processes grow sophisticated while effects stay untouched",
                "every answer opens another ambiguity",
                "urgency discharges into interpretation",
            ],
            "failureModes": [
                "explanation occupies the space where response would occur",
                "the best postmortem becomes the moral finish line",
            ],
            "restorationPaths": [
                "let explanation inform judgment then stop",
                "practice responsibility as responsiveness to effects",
            ],
        },
        "manifestations": {
            "leadership": [
                "leaders explain outcomes instead of addressing effects",
                "lessons-learned rituals complete without operational change",
            ],
            "organizations": [
                "root-cause language substitutes for remedy",
                "professional care replaces contact with waiting parties",
            ],
        },
    },
    "admiration-becomes-insulation": {
        "recognitionSignals": [
            "contradictory details are adapted into a purer villain and victim",
            "the thread speeds up rather than slowing for uneven facts",
            "harm around a heroic figure is reframed as tradeoff or necessity",
            "questioning the sorting risks sounding disloyal to the harm",
        ],
        "questions": [
            "What detail would reopen the story we are protecting?",
            "Who benefits when admiration forecloses proportionate inquiry?",
            "Where is trust insulation rather than trust?",
        ],
        "counterbalances": [
            "ask proportionate questions without recasting heroes as villains",
            "slow the thread when facts do not fit the moral sorting",
            "keep legitimacy open to revision without cynicism",
        ],
        "trajectory": {
            "earlySignals": [
                "the story arrives already sorted into hero and villain",
                "admiration attaches to a coherent moral narrative",
            ],
            "intensificationSignals": [
                "outrage spreads faster than verification",
                "information threatening the story feels destabilizing",
            ],
            "failureModes": [
                "the admired person is protected by audience reluctance",
                "accountability weakens to preserve coherence",
            ],
            "restorationPaths": [
                "practice scrutiny that preserves trust",
                "replace archetypes with attention to effects",
            ],
        },
        "manifestations": {
            "leadership": [
                "boards interpret harm around executives as necessary tradeoffs",
                "contradiction near a leader is treated as disloyalty",
            ],
            "organizations": [
                "comment threads reward emotionally complete narratives",
                "whistle paths are framed as betraying the harm itself",
            ],
            "politics": [
                "public moral sorting outruns verification",
            ],
        },
    },
    "blame-compresses-complexity": {
        "recognitionSignals": [
            "the moral work feels complete once blame has a face",
            "systems and incentives disappear after a villain is named",
            "ordinary participation is no longer examined",
            "outrage offers relief faster than structural learning",
        ],
        "questions": [
            "What incentives remain visible after we name the villain?",
            "How might similar dynamics operate closer to home?",
            "What learning is lost when harm has a recognizable face?",
        ],
        "counterbalances": [
            "map structural participation before closing the story",
            "practice attention to effects instead of personalities",
            "keep accountability without narrative loyalty",
        ],
        "trajectory": {
            "earlySignals": [
                "harm attaches quickly to one careless actor and one institution",
                "moral energy concentrates through identification",
            ],
            "intensificationSignals": [
                "the thread adapts facts to preserve the sorting",
                "complexity collapses around a stable target",
            ],
            "failureModes": [
                "wrongdoing is treated as exceptional not systemic",
                "learning narrows once outrage has a target",
            ],
            "restorationPaths": [
                "replace heroes and villains with patterns",
                "restore contact with consequences and limits",
            ],
        },
        "manifestations": {
            "leadership": [
                "executive dismissal ends the moral inquiry",
                "scapegoating replaces incentive review",
            ],
            "organizations": [
                "compliance closes when one role is sanctioned",
                "training blames attitude instead of structure",
            ],
        },
    },
    "revisability-preserves-judgment": {
        "recognitionSignals": [
            "judgment is described as practice rather than verdict",
            "revision is framed as accountability, not collapse",
            "restraint is distinguished from indefinite waiting",
            "provisional decisions are named under partial understanding",
        ],
        "questions": [
            "What would revision look like if it were expected?",
            "Where are we using finality to compensate for uncertainty?",
            "What response is warranted given what we cannot know?",
        ],
        "counterbalances": [
            "act without pretending the matter is finished",
            "publish what would change your mind",
            "separate restraint from fear of being wrong",
        ],
        "trajectory": {
            "earlySignals": [
                "judgment still draws lines and responds to harm",
                "people fear judgment means harsh final closure",
            ],
            "intensificationSignals": [
                "severity increases when certainty underneath is thin",
                "waiting for more confidence delays warranted action",
            ],
            "failureModes": [
                "revision threatens identity when judgment depends on finality",
                "paralysis masquerades as openness",
            ],
            "restorationPaths": [
                "treat new information as part of practice",
                "accept discomfort of no clean moral completion",
            ],
        },
        "manifestations": {
            "leadership": [
                "decisions carry consequences without claiming permanent settlement",
                "leaders model provisional commitment",
            ],
            "organizations": [
                "reviews are scheduled without punishing updates",
                "policies include revisability clauses",
            ],
        },
    },
    "responsibility-persists-beyond-control": {
        "recognitionSignals": [
            "she shows up without pretending agreement restores control",
            "innocence is attractive when systems feel too large to steer",
            "people act through rules and permissions others still inherit",
            "symbolic gestures substitute for sustained attention",
        ],
        "questions": [
            "Where is meaningful contact still possible without control?",
            "What participation continues after formal authority ends?",
            "Is this loyalty, avoidance, or answerability without mastery?",
        ],
        "counterbalances": [
            "remain present without pretending outcomes are steerable",
            "notice effects rather than intentions alone",
            "refuse innocence as escape from participation",
        ],
        "trajectory": {
            "earlySignals": [
                "responsibility is assumed to require visible effectiveness",
                "distance feels justified when influence seems absent",
            ],
            "intensificationSignals": [
                "harm persists while responsibility is treated as optional",
                "tradeoffs tolerated become precedents others follow",
            ],
            "failureModes": [
                "care is abandoned because it cannot guarantee improvement",
                "abstraction replaces accountability at scale",
            ],
            "restorationPaths": [
                "narrow responsibility to human-scale contact",
                "document what you can still affect",
            ],
        },
        "manifestations": {
            "leadership": [
                "leaders remain answerable for permissions left ambiguous",
                "successors inherit normalized exceptions",
            ],
            "organizations": [
                "committees keep authority after the crisis ends",
                "symbolic statements replace remedy",
            ],
        },
    },
    "scrutiny-preserves-trust": {
        "recognitionSignals": [
            "admiration turns into reluctance to reopen the story",
            "proportionate inquiry is cast as cynicism or disloyalty",
            "trust is confused with insulating the narrative",
            "legitimacy is questioned without demanding a villain rewrite",
        ],
        "questions": [
            "What question would preserve trust without insulation?",
            "Where is admiration blocking proportionate inquiry?",
            "How do we scrutinize without collapsing into sorting?",
        ],
        "counterbalances": [
            "keep admiration open to revision",
            "ask evidence questions in public forums",
            "separate trust from narrative attachment",
        ],
        "trajectory": {
            "earlySignals": [
                "heroes reassure coordination quickly",
                "contradiction near admired figures feels expensive",
            ],
            "intensificationSignals": [
                "harm is reframed to preserve coherent admiration",
                "accountability routes around the heroic story",
            ],
            "failureModes": [
                "trust survives through insulation not inquiry",
                "revision of the story feels like moral collapse",
            ],
            "restorationPaths": [
                "practice scrutiny as trust maintenance",
                "reward proportionate questions alongside admiration",
            ],
        },
        "manifestations": {
            "leadership": [
                "boards soften questions around character",
                "audit is welcomed as trust practice not betrayal",
            ],
            "organizations": [
                "ombud paths are exceptional instead of normal",
                "peer review excludes power holders",
            ],
        },
    },
    "attention-restores-contact": {
        "recognitionSignals": [
            "aggregate dashboards stay green while exception clusters hide harm",
            "people become metrics, risks, or roles instead of particulars",
            "distance hides consequence until someone looks sideways",
            "smooth operation is treated as equivalent to legitimacy",
        ],
        "questions": [
            "What did the exception report notice that averages concealed?",
            "Who is still a particular person inside this category?",
            "Where has abstraction stopped feeling partial?",
        ],
        "counterbalances": [
            "read exception reports when headlines look fine",
            "write plain language without hero or dissenter roles",
            "ask questions that slow meetings by ten minutes",
        ],
        "trajectory": {
            "earlySignals": [
                "systems depend on aggregation and standardization",
                "abstraction is recognized as structurally necessary",
            ],
            "intensificationSignals": [
                "harm becomes statistical and suffering harder to notice",
                "accountability thins as decisions move from effects",
            ],
            "failureModes": [
                "abstraction feels sufficient instead of partial",
                "continuity disguises harm at scale",
            ],
            "restorationPaths": [
                "document patterns in plain language",
                "stay close to what leverage actually reaches",
            ],
        },
        "manifestations": {
            "leadership": [
                "quarterly metrics hide clusters that do not move the average",
                "rollouts proceed while exceptions accumulate quietly",
            ],
            "organizations": [
                "complaints are withdrawn without changing the workflow",
                "green dashboards end investigation",
            ],
        },
    },
    "finality-compensates-for-uncertainty": {
        "recognitionSignals": [
            "judgment is forceful when people need the case to feel closed",
            "severity arrives where uncertainty underneath is uncomfortable",
            "ambiguity is treated as moral instability",
            "certainty is performed to justify closure",
        ],
        "questions": [
            "What uncertainty are we closing too early?",
            "Where is harshness compensating for insecurity?",
            "What would provisional judgment look like here?",
        ],
        "counterbalances": [
            "name remaining uncertainty alongside the decision",
            "separate seriousness from permanent settlement",
            "practice revisability after acting",
        ],
        "trajectory": {
            "earlySignals": [
                "judgment is expected to end the question",
                "withholding judgment is treated as compassion",
            ],
            "intensificationSignals": [
                "people insist the matter is settled to relieve anxiety",
                "revision threatens coherence and authority together",
            ],
            "failureModes": [
                "finality forecloses warranted revision",
                "emotional stability is purchased by freezing judgment",
            ],
            "restorationPaths": [
                "act under partial understanding with review dates",
                "accept no clean moment of moral completion",
            ],
        },
        "manifestations": {
            "leadership": [
                "zero-tolerance policies follow ambiguous harm",
                "executives announce irreversible cuts to calm rooms",
            ],
            "organizations": [
                "investigations close when anxiety peaks",
                "certainty artifacts are demanded for compliance",
            ],
        },
    },
    "speech-escalates-faster-than-meaning": {
        "recognitionSignals": [
            "screenshots circulate detached from the full statement",
            "short fragments become arguments the text never settled",
            "speaking more increases visibility without increasing clarity",
            "silence is read as indifference before care is assessed",
        ],
        "questions": [
            "What did the whole statement commit us to—not the fragment?",
            "When is speech performing visibility instead of reducing harm?",
            "What quieter care is displaced by drafting another statement?",
        ],
        "counterbalances": [
            "optimize statements for contact with effects not circulation",
            "choose proportion over persuasion under pressure",
            "treat legibility as distinct from care",
        ],
        "trajectory": {
            "earlySignals": [
                "speech feels morally required when stakes are high",
                "language promises participation and agency",
            ],
            "intensificationSignals": [
                "nuance collapses and tone hardens",
                "words signal allegiance faster than understanding",
            ],
            "failureModes": [
                "performative speech displaces quieter care",
                "new surfaces appear for conflict to organize around",
            ],
            "restorationPaths": [
                "speak with restraint when meaning cannot stay stable",
                "name responsibility without six drafts of humility",
            ],
        },
        "manifestations": {
            "leadership": [
                "institutional statements pass through six careful drafts",
                "inside feels responsible while outside harm sharpens",
            ],
            "organizations": [
                "screenshot culture detaches context",
                "visibility rewards over proportionate response",
            ],
            "politics": [
                "public fragments outrun full texts",
            ],
        },
    },
}

GLOSSARY: dict[str, dict] = {
    "judgment": {
        "recognitionSignals": [
            "people wait for certainty before they are willing to judge",
            "judgment is mistaken for harshness when it lacks final closure",
            "insight no longer delivers relief yet judgment is still required",
        ],
        "questions": [
            "What judgment is warranted before understanding feels complete?",
            "Where are we using finality to avoid revisability?",
            "What remains when correctness and explanation no longer settle the question?",
        ],
        "counterbalances": [
            "practice judgment as ongoing practice not verdict",
            "act under partial visibility with room to revise",
            "separate seriousness from permanent settlement",
        ],
        "trajectory": {
            "earlySignals": [
                "judgment still draws boundaries and responds to harm",
                "people associate judgment with punitive finality",
            ],
            "intensificationSignals": [
                "severity rises when uncertainty feels intolerable",
                "revision threatens coherence when judgment must feel finished",
            ],
            "failureModes": [
                "judgment hardens into dogma or paralysis",
                "interpretation delays judgment until harm continues",
            ],
            "restorationPaths": [
                "keep judgment revisable and proportionate",
                "name tradeoffs without claiming omniscience",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives delay decisions until confidence feels complete",
            ],
            "organizations": [
                "reviews punish updates that unsettle prior verdicts",
            ],
        },
    },
    "correction": {
        "recognitionSignals": [
            "every correction spawns new framing instead of shared reality",
            "revision is treated as collapse when identity fused with being right",
            "people try to set the record straight and intensify conflict",
        ],
        "questions": [
            "When does correction coordinate reality versus claim authority?",
            "What would revision look like if it were welcomed?",
            "Who cannot correct without being read as betrayal?",
        ],
        "counterbalances": [
            "reward updates to shared reality over winning frames",
            "pair correction with smaller questions in the room",
            "practice revisability-preserves-judgment",
        ],
        "trajectory": {
            "earlySignals": [
                "correction still helps groups align on evidence",
            ],
            "intensificationSignals": [
                "corrections multiply audiences and interpretations",
                "being right matters more than staying revisable",
            ],
            "failureModes": [
                "correction becomes moral achievement not tool",
            ],
            "restorationPaths": [
                "treat correction as reality-contact before identity defense",
            ],
        },
        "manifestations": {
            "organizations": [
                "clarification campaigns replace collective updating",
            ],
        },
    },
    "responsibility": {
        "recognitionSignals": [
            "responsibility collapses into futility when control is absent",
            "innocence offers relief from participation at scale",
            "symbolic gestures stand in for sustained attention",
        ],
        "questions": [
            "Where does answerability remain without control?",
            "What participation continues through rules we normalized?",
            "When is innocence escape rather than blamelessness?",
        ],
        "counterbalances": [
            "stay responsive to effects not only intentions",
            "narrow responsibility to contact you can still reach",
            "refuse to let abstraction replace accountability",
        ],
        "trajectory": {
            "earlySignals": [
                "responsibility is confused with mastery",
                "people want care to visibly matter",
            ],
            "intensificationSignals": [
                "harm persists while responsibility becomes optional",
                "distance is justified when systems feel opaque",
            ],
            "failureModes": [
                "responsibility is abandoned because it cannot guarantee outcomes",
            ],
            "restorationPaths": [
                "practice responsibility without control at human scale",
            ],
        },
        "manifestations": {
            "leadership": [
                "leaders answer for permissions and precedents left behind",
            ],
        },
    },
    "accountability": {
        "recognitionSignals": [
            "heroes and villains replace accountability with narrative loyalty",
            "abstraction is not allowed to replace answerability in the text",
            "attention shifts from identity to effects and patterns",
        ],
        "questions": [
            "Who remains answerable after the moral sorting is done?",
            "What participation are we externalizing with a villain face?",
            "Where is accountability thinner because of distance?",
        ],
        "counterbalances": [
            "prefer sustained contact with consequences over speed",
            "map participation before assigning a face",
            "practice attention-restores-contact",
        ],
        "trajectory": {
            "earlySignals": [
                "accountability clarifies harm when sorting is simple",
            ],
            "intensificationSignals": [
                "narrative loyalty replaces proportionate answerability",
                "distance thins accountability without intent",
            ],
            "failureModes": [
                "accountability ends when the story feels complete",
            ],
            "restorationPaths": [
                "replace archetypes with attention to effects",
            ],
        },
        "manifestations": {
            "organizations": [
                "postmortems praise analysis while delays continue",
            ],
        },
    },
    "abstraction": {
        "recognitionSignals": [
            "dashboards stay green while exception clusters tell another story",
            "people appear as categories, metrics, or roles",
            "abstraction stops feeling partial and starts feeling sufficient",
        ],
        "questions": [
            "What loss does this aggregation hide?",
            "Who is still particular inside the metric?",
            "When did abstraction complete the moral picture too early?",
        ],
        "counterbalances": [
            "read sideways when averages look fine",
            "document exceptions in plain language",
            "refuse to let smooth operation stand in for legitimacy",
        ],
        "trajectory": {
            "earlySignals": [
                "abstraction is required for coordination at scale",
            ],
            "intensificationSignals": [
                "harm becomes statistical",
                "accountability thins as decisions move from effects",
            ],
            "failureModes": [
                "abstraction replaces persons",
                "continuity disguises harm",
            ],
            "restorationPaths": [
                "treat abstraction as partial by design",
                "restore contact through attention",
            ],
        },
        "manifestations": {
            "organizations": [
                "exception reports are ignored when quarterly metrics rise",
            ],
        },
    },
    "legitimacy": {
        "recognitionSignals": [
            "smooth operation starts appearing equivalent to legitimacy",
            "admiration insulates narratives from proportionate inquiry",
            "trust is confused with refusing to reopen the story",
        ],
        "questions": [
            "What would question legitimacy without cynicism?",
            "Where is trust insulation rather than trust?",
            "Who can scrutinize without being cast as disloyal?",
        ],
        "counterbalances": [
            "keep legitimacy open to revision",
            "practice scrutiny-preserves-trust",
            "separate admiration from narrative protection",
        ],
        "trajectory": {
            "earlySignals": [
                "legitimacy still coordinates trust quickly",
            ],
            "intensificationSignals": [
                "heroic narratives stabilize against contradiction",
                "legitimacy closes when coherence is threatened",
            ],
            "failureModes": [
                "legitimacy survives through insulation",
            ],
            "restorationPaths": [
                "welcome proportionate inquiry in public",
            ],
        },
        "manifestations": {
            "leadership": [
                "boards conflate operational smoothness with moral standing",
            ],
        },
    },
    "authority": {
        "recognitionSignals": [
            "correctness begins helping people claim authority over one another",
            "not knowing risks loss of authority in rooms that still require action",
            "formal authority ends while influence through precedents continues",
        ],
        "questions": [
            "Where is authority claimed without proportionate standing?",
            "What influence continues after the title changes?",
            "Who bears answerability for permissions still in force?",
        ],
        "counterbalances": [
            "judge without authority you do not have",
            "audit permissions others still inherit",
            "separate seriousness from domination",
        ],
        "trajectory": {
            "earlySignals": [
                "authority still helps coordinate under uncertainty",
            ],
            "intensificationSignals": [
                "being right becomes moral dominance",
                "authority closes rooms to revision",
            ],
            "failureModes": [
                "authority substitutes for contact",
            ],
            "restorationPaths": [
                "practice judgment without finality instead of domination",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives conflate being right with moral standing",
            ],
        },
    },
    "authorization": {
        "recognitionSignals": [
            "people continue acting through permissions left ambiguous",
            "normalized exceptions outlive the pressures that produced them",
            "insight becomes permission to delay a required response",
        ],
        "questions": [
            "Which permissions still make sense after the emergency passed?",
            "Who inherits authority without remembering why it was granted?",
            "Where has interpretation become permission to delay?",
        ],
        "counterbalances": [
            "name sunset dates for standing exceptions",
            "pair each permission with review and accountability",
            "stop treating insight as substitute for decision",
        ],
        "trajectory": {
            "earlySignals": [
                "temporary permissions are granted under urgency",
            ],
            "intensificationSignals": [
                "exceptions become how work is done day to day",
                "meetings add context instead of deciding",
            ],
            "failureModes": [
                "authorization persists after crisis ends",
                "harm is attributed to the system not choosers",
            ],
            "restorationPaths": [
                "batch-retire exceptions with named owners",
                "restore decisions insight already supports",
            ],
        },
        "manifestations": {
            "leadership": [
                "crisis permissions become standard operating procedure",
            ],
            "organizations": [
                "working groups treat insight as the moral work",
            ],
        },
    },
    "agency": {
        "recognitionSignals": [
            "speech promises agency when participation feels required",
            "structural causes soften agency until judgment delays",
            "inevitability slowly displaces choice in explanations",
        ],
        "questions": [
            "Where is agency real versus performed through language?",
            "What choice remains after complexity is established?",
            "When does speech substitute for contact?",
        ],
        "counterbalances": [
            "name choices still available after context",
            "speak without claiming more agency than speech provides",
            "act where participation still changes contact",
        ],
        "trajectory": {
            "earlySignals": [
                "agency still feels available through speech and action",
            ],
            "intensificationSignals": [
                "complexity absorbs moral energy",
                "agency is performed for audiences",
            ],
            "failureModes": [
                "agency is claimed without effect on harm",
            ],
            "restorationPaths": [
                "return agency to human-scale participation",
            ],
        },
        "manifestations": {
            "organizations": [
                "statements express concern without consequence",
            ],
        },
    },
    "harm": {
        "recognitionSignals": [
            "harm continues while interpretation expands",
            "briefings make harm legible without smaller",
            "people can still tell when something is doing harm",
        ],
        "questions": [
            "Is harm unchanged outside while we analyze inside?",
            "Who is harmed in particular—not on average?",
            "When does naming harm substitute for reducing it?",
        ],
        "counterbalances": [
            "check effects outside the room after briefings",
            "stop when outcomes for people are unchanged",
            "pair analysis with named remedy attempts",
        ],
        "trajectory": {
            "earlySignals": [
                "harm triggers immediate explanation and sorting",
            ],
            "intensificationSignals": [
                "harm is reorganized narratively",
                "harm becomes statistical at scale",
            ],
            "failureModes": [
                "harm persists while moral work feels complete",
            ],
            "restorationPaths": [
                "return to particular harms and people",
                "accept harm as inevitable without abandoning response",
            ],
        },
        "manifestations": {
            "organizations": [
                "delays continue after excellent postmortems",
            ],
        },
    },
    "scale": {
        "recognitionSignals": [
            "understanding expands while judgment remains unsettled",
            "feedback slows and consequences are harder to trace",
            "moral life is described as condition of scale not personal failure",
        ],
        "questions": [
            "What changes when no one sees the whole picture?",
            "Where is scale eroding ability to see people?",
            "What practices still work at human scale?",
        ],
        "counterbalances": [
            "narrow responsibility to contact that remains",
            "read exceptions when aggregates look fine",
            "refuse to let scale justify disengagement",
        ],
        "trajectory": {
            "earlySignals": [
                "scale still promises coordination through tools",
            ],
            "intensificationSignals": [
                "stabilizers carry more weight than they can sustain",
                "distance hides consequence",
            ],
            "failureModes": [
                "scale justifies innocence and abstraction",
            ],
            "restorationPaths": [
                "practice staying human at scale",
                "contract moral life to reachable contact",
            ],
        },
        "manifestations": {
            "organizations": [
                "systems operate on aggregates not particulars",
            ],
        },
    },
    "stability": {
        "recognitionSignals": [
            "more information no longer restores stability of judgment",
            "revision threatens coherence, authority, and emotional stability together",
            "alignment is pursued while understanding fragments",
        ],
        "questions": [
            "What stability are we protecting—coordination or closure?",
            "Where does emotional stability purchase frozen judgment?",
            "What remains unsettled while analysis continues?",
        ],
        "counterbalances": [
            "tolerate unsettled judgment without forcing false calm",
            "separate coordination from epistemic closure",
            "practice discipline of not knowing",
        ],
        "trajectory": {
            "earlySignals": [
                "stability still feels like moral relief",
            ],
            "intensificationSignals": [
                "stability is bought by stopping revision",
                "certainty is performed to calm rooms",
            ],
            "failureModes": [
                "stability disguises ongoing harm",
            ],
            "restorationPaths": [
                "accept clarity without closure",
            ],
        },
        "manifestations": {
            "leadership": [
                "rooms demand calm narratives while harm continues",
            ],
        },
    },
    "constraints": {
        "recognitionSignals": [
            "constraints are narrated instead of tradeoffs named",
            "working groups add constraints while harm does not pause",
            "analysis recognizes constraints yet decision slips",
        ],
        "questions": [
            "Which constraints are real versus rhetorical cover?",
            "What decision is insight delaying?",
            "When do constraints become permission to wait?",
        ],
        "counterbalances": [
            "name tradeoffs explicitly",
            "stop when constraint mapping replaces action",
            "set decision points after sufficient context",
        ],
        "trajectory": {
            "earlySignals": [
                "constraints legitimately shape choices",
            ],
            "intensificationSignals": [
                "constraint language absorbs responsibility",
                "meetings multiply context without response",
            ],
            "failureModes": [
                "constraints become infinite permission to delay",
            ],
            "restorationPaths": [
                "decide under known constraints",
            ],
        },
        "manifestations": {
            "organizations": [
                "institutions explain constraints instead of effects",
            ],
        },
    },
    "incentives": {
        "recognitionSignals": [
            "incentives diverge as coordination grows",
            "working groups catalog competing incentives while harm continues",
            "understanding incentives replaces governing outcomes",
        ],
        "questions": [
            "Which incentives are we explaining instead of changing?",
            "Who benefits from the delay insight provides?",
            "What outcome would shift if incentives were named as tradeoffs?",
        ],
        "counterbalances": [
            "name incentive conflicts as moral choices",
            "act before incentive maps feel complete",
            "refuse better incentives as automatic fix",
        ],
        "trajectory": {
            "earlySignals": [
                "incentive literacy increases",
            ],
            "intensificationSignals": [
                "incentive stories delay judgment",
                "competing incentives justify paralysis",
            ],
            "failureModes": [
                "incentive analysis replaces response",
            ],
            "restorationPaths": [
                "choose under visible tradeoffs",
            ],
        },
        "manifestations": {
            "organizations": [
                "postmortems list incentives without changing them",
            ],
        },
    },
    "circulation": {
        "recognitionSignals": [
            "phrases optimize for speed, circulation, and coordination",
            "screenshots detach statements from context",
            "meaning cannot remain stable at public scale",
        ],
        "questions": [
            "What happens to meaning once this leaves the room?",
            "Who is reading allegiance instead of substance?",
            "When does circulation outrun correction?",
        ],
        "counterbalances": [
            "publish whole statements not fragments",
            "slow sharing until claims are scoped",
            "choose proportion over viral legibility",
        ],
        "trajectory": {
            "earlySignals": [
                "speech still attempts sincere coordination",
            ],
            "intensificationSignals": [
                "circulation rewards visibility",
                "fragments become the argument",
            ],
            "failureModes": [
                "circulation displaces care",
            ],
            "restorationPaths": [
                "speak for contact not circulation",
            ],
        },
        "manifestations": {
            "politics": [
                "public fragments organize conflict",
            ],
            "organizations": [
                "internal drafts become external ammunition",
            ],
        },
    },
    "feedback": {
        "recognitionSignals": [
            "feedback slows as coordination grows",
            "consequences become harder to trace",
            "people act without seeing effects in time",
        ],
        "questions": [
            "What feedback still reaches decision makers?",
            "Who is acting on stale signals?",
            "Where are we judging without timely contact?",
        ],
        "counterbalances": [
            "seek exception signals not only aggregates",
            "shorten loops between action and effect",
            "document contact when feedback is weak",
        ],
        "trajectory": {
            "earlySignals": [
                "feedback still corrects at human scale",
            ],
            "intensificationSignals": [
                "feedback delays obscure responsibility",
                "traceability weakens",
            ],
            "failureModes": [
                "decisions proceed without consequence contact",
            ],
            "restorationPaths": [
                "create local feedback where global is slow",
            ],
        },
        "manifestations": {
            "organizations": [
                "quarterly reviews miss emerging clusters",
            ],
        },
    },
    "effectiveness": {
        "recognitionSignals": [
            "care is expected to visibly matter",
            "responsibility is resisted when results are not steerable",
            "symbolic action stands in for effectiveness",
        ],
        "questions": [
            "What good is responsibility without visible improvement?",
            "Where is effectiveness demanded as moral proof?",
            "What integrity remains when outcomes do not change?",
        ],
        "counterbalances": [
            "separate responsibility from visible success",
            "value presence and notice over control",
            "act without effectiveness as moral reassurance",
        ],
        "trajectory": {
            "earlySignals": [
                "effectiveness still reassures moral effort",
            ],
            "intensificationSignals": [
                "ineffectiveness is read as futility",
                "symbolic wins replace contact",
            ],
            "failureModes": [
                "responsibility is abandoned when results lag",
            ],
            "restorationPaths": [
                "practice responsibility without control",
            ],
        },
        "manifestations": {
            "leadership": [
                "KPIs substitute for moral contact",
            ],
        },
    },
    "system": {
        "recognitionSignals": [
            "people expect a system, program, or fix",
            "the book refuses to offer a new system of belief",
            "harm is attributed to the system to avoid choosers",
        ],
        "questions": [
            "Are we waiting for a system instead of practicing posture?",
            "What remains when systems cannot become humane?",
            "Where are we using system language to end participation?",
        ],
        "counterbalances": [
            "practice capacities not programs",
            "refuse system fixes as substitute for judgment",
            "stay answerable inside systems you did not design",
        ],
        "trajectory": {
            "earlySignals": [
                "system thinking promises management",
            ],
            "intensificationSignals": [
                "system narratives explain away participation",
                "fixes are demanded at scale",
            ],
            "failureModes": [
                "systems excuse disengagement",
            ],
            "restorationPaths": [
                "orient without a system to sell",
            ],
        },
        "manifestations": {
            "organizations": [
                "transformation roadmaps replace posture",
            ],
        },
    },
}


def enrichment_for(slug: str, entity_type: str) -> dict | None:
    if entity_type == "pattern":
        return PATTERNS.get(slug)
    if entity_type == "glossary":
        return GLOSSARY.get(slug)
    return None
