#!/usr/bin/env python3
"""Fill empty after-certainty enrichment drafts from canonical YAML (issue #116)."""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from semantic_enrichment import AGENT_TO_FIELD, ENRICHMENT_ROOT, ENTITY_TYPE_TO_DIR  # noqa: E402

BOOK = "after-certainty"

# Appendix-aligned enrichment for the ten After Certainty patterns.
PATTERN_FILL: dict[str, dict[str, object]] = {
    "correctness-hardens-into-identity": {
        "recognitionSignals": [
            "challenging a forecast is treated as disloyalty",
            "revision is deferred to protect group coherence",
            "being right matters more than updating shared reality",
        ],
        "questions": [
            "What would we revise if belonging were not at stake?",
            "Who cannot raise doubt without paying a social cost?",
            "Where has correctness become identity rather than contact with reality?",
        ],
        "counterbalances": [
            "publish what would change your mind",
            "reward updates to shared reality, not defensive coherence",
            "separate belonging from the accuracy of the frame",
        ],
        "trajectory": {
            "earlySignals": [
                "small doubts are voiced privately but not in the room",
                "evidence that complicates the story is labeled noise",
            ],
            "intensificationSignals": [
                "disagreement is treated as moral threat",
                "revision feels like betrayal to the group",
            ],
            "failureModes": [
                "the group cannot remain revisable under pressure",
                "being right protects the story more than understanding",
            ],
            "restorationPaths": [
                "practice revisability-preserves-judgment in public",
                "name tradeoffs without demanding final closure",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives treat challenged forecasts as disloyalty",
                "strategy reviews reward defensive coherence",
            ],
            "organizations": [
                "consensus becomes more important than accuracy",
                "dissent routes through private channels only",
            ],
            "software": [
                "roadmaps cannot change without a political fight",
                "metrics debates become status contests",
            ],
        },
    },
    "explanation-replaces-response": {
        "recognitionSignals": [
            "another session is scheduled to understand more before acting",
            "analysis is praised while the decision slips",
            "understanding is offered where answerability is required",
        ],
        "questions": [
            "What decision are we postponing by adding context?",
            "Who benefits when comprehension substitutes for response?",
            "What would we do Monday if we stopped explaining?",
        ],
        "counterbalances": [
            "set a decision date before the next analysis cycle",
            "pair every insight meeting with a named owner and deadline",
            "measure response, not comprehension",
        ],
        "trajectory": {
            "earlySignals": [
                "meetings expand scope instead of closing a choice",
                "more context feels like moral progress",
            ],
            "intensificationSignals": [
                "harm is reorganized faster than reduced",
                "urgency discharges into interpretation",
            ],
            "failureModes": [
                "understanding substitutes for responsibility",
                "analysis becomes emotionally sufficient",
            ],
            "restorationPaths": [
                "name the response required alongside the analysis",
                "practice responsibility-persists-beyond-control at contact points",
            ],
        },
        "manifestations": {
            "leadership": [
                "working groups produce briefs but no owner for action",
                "crisis reviews expand narrative without changing permissions",
            ],
            "organizations": [
                "post-incident learning replaces repair",
                "stakeholder updates substitute for remedy",
            ],
            "software": [
                "RCA documents grow while rollback paths stay unclear",
                "tickets accumulate analysis comments without state change",
            ],
        },
    },
    "admiration-becomes-insulation": {
        "recognitionSignals": [
            "contradiction is reframed as context around the admired figure",
            "accountability weakens to preserve a heroic narrative",
            "scrutiny is cast as cynicism or disloyalty",
        ],
        "questions": [
            "What harm are we reframing as tradeoff to protect the story?",
            "Who cannot ask proportionate questions without betrayal?",
            "What would scrutiny look like if admiration stayed open?",
        ],
        "counterbalances": [
            "ask proportionate questions in public forums",
            "separate trust from insulation of the narrative",
            "practice scrutiny-preserves-trust without villain casting",
        ],
        "trajectory": {
            "earlySignals": [
                "contradictory evidence is handled privately",
                "the admired figure receives benefit of every doubt",
            ],
            "intensificationSignals": [
                "harm is narrated as necessary for the role",
                "accountability routes around the hero",
            ],
            "failureModes": [
                "trust is replaced by narrative attachment",
                "revision of the story feels like moral collapse",
            ],
            "restorationPaths": [
                "institutionalize scrutiny-preserves-trust",
                "reward proportionate inquiry alongside admiration",
            ],
        },
        "manifestations": {
            "leadership": [
                "board questions soften around the CEO's character",
                "successor narratives protect prior harm as tradeoff",
            ],
            "organizations": [
                "whistle routes are framed as culture betrayal",
                "audit findings are contextualized away from the star performer",
            ],
            "software": [
                "founder lore blocks architecture critique",
                "incident blame stops at the celebrated builder",
            ],
        },
    },
    "blame-compresses-complexity": {
        "recognitionSignals": [
            "a single face is assigned while incentives stay unnamed",
            "learning stops once the villain is identified",
            "structural participation is externalized",
        ],
        "questions": [
            "What incentives are we hiding inside the blamed individual?",
            "Who participated besides the person we fired?",
            "What would we learn if the face were not yet assigned?",
        ],
        "counterbalances": [
            "map incentives before naming a responsible individual",
            "practice attention-restores-contact with affected parties",
            "keep learning open after accountability is assigned",
        ],
        "trajectory": {
            "earlySignals": [
                "conversations rush toward who not how",
                "complexity is traded for emotional closure",
            ],
            "intensificationSignals": [
                "structural causes disappear from the record",
                "participation is framed as someone else's failure",
            ],
            "failureModes": [
                "the organization learns only a morality tale",
                "repeat failure with a new face",
            ],
            "restorationPaths": [
                "document field conditions alongside individual acts",
                "restore contact with harms and tradeoffs",
            ],
        },
        "manifestations": {
            "leadership": [
                "executive dismissal ends the investigation",
                "reorg follows scapegoating without incentive change",
            ],
            "organizations": [
                "compliance closes the file once one role is sanctioned",
                "training blames attitude not structure",
            ],
            "software": [
                "one engineer owns an outage caused by systemic coupling",
                "postmortems stop at human error tags",
            ],
        },
    },
    "revisability-preserves-judgment": {
        "recognitionSignals": [
            "leaders publish what would change their mind",
            "revision is practiced without infinite deferral",
            "openness is distinguished from weakness",
        ],
        "questions": [
            "What would change our judgment if we said it aloud?",
            "Where are we confusing revisability with paralysis?",
            "Who models update without collapse of coherence?",
        ],
        "counterbalances": [
            "set review dates on live judgments",
            "reward public updates to shared frames",
            "pair openness with named decisions",
        ],
        "trajectory": {
            "earlySignals": [
                "assumptions are listed alongside commitments",
                "small updates are welcomed early",
            ],
            "intensificationSignals": [
                "revision becomes routine before stakes peak",
                "groups practice contact with new information",
            ],
            "failureModes": [
                "revisability is performed but never acted on",
                "openness becomes branding without update",
            ],
            "restorationPaths": [
                "tie revisability to accountable decisions",
                "measure updates to judgment, not tone alone",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives revise forecasts without penalty",
                "strategy admits earlier misread in public",
            ],
            "organizations": [
                "policy includes sunset and review clauses",
                "teams run pre-mortems on live choices",
            ],
            "software": [
                "architecture decision records stay living documents",
                "feature flags include explicit review dates",
            ],
        },
    },
    "responsibility-persists-beyond-control": {
        "recognitionSignals": [
            "withdrawal is framed as innocence while influence continues",
            "precedents outlive formal authority",
            "care is mistaken for omnipotence",
        ],
        "questions": [
            "What are we still answerable for after we stepped back?",
            "Where does our participation continue through permission?",
            "What response remains possible without control?",
        ],
        "counterbalances": [
            "audit precedents and permissions left behind",
            "name answerability without claiming mastery",
            "practice care at points of remaining contact",
        ],
        "trajectory": {
            "earlySignals": [
                "leaders notice lingering effects of past choices",
                "withdrawal is tempting as systems feel large",
            ],
            "intensificationSignals": [
                "innocence is used to end participation",
                "formal exit masks ongoing influence",
            ],
            "failureModes": [
                "answerability is abandoned while harm continues",
                "care is replaced by distance as virtue",
            ],
            "restorationPaths": [
                "document ongoing influence after role changes",
                "restore response where contact still exists",
            ],
        },
        "manifestations": {
            "leadership": [
                "former executives still shape norms through alumni authority",
                "successors inherit permissions never revoked",
            ],
            "organizations": [
                "committees retain power after crises end",
                "norms persist after reorganization",
            ],
            "software": [
                "deprecated paths remain default in practice",
                "on-call rotations keep old escalation habits",
            ],
        },
    },
    "scrutiny-preserves-trust": {
        "recognitionSignals": [
            "proportionate questions are asked in public",
            "inquiry is distinguished from cynicism",
            "legitimacy stays open to revision",
        ],
        "questions": [
            "What question would preserve trust without insulation?",
            "Where has admiration blocked proportionate inquiry?",
            "Who can scrutinize without being cast as enemy?",
        ],
        "counterbalances": [
            "institutionalize regular proportionate review",
            "separate character defense from role accountability",
            "pair admiration with open records",
        ],
        "trajectory": {
            "earlySignals": [
                "routine forums invite challenge without crisis",
                "records are accessible before scandal forces it",
            ],
            "intensificationSignals": [
                "questions focus on tradeoffs not character assassination",
                "revision of trust is practiced in daylight",
            ],
            "failureModes": [
                "scrutiny is performed only after harm surfaces",
                "trust rhetoric blocks inquiry until failure",
            ],
            "restorationPaths": [
                "reward questions that keep legitimacy revisable",
                "document answers alongside admiration",
            ],
        },
        "manifestations": {
            "leadership": [
                "boards ask evidence questions without loyalty tests",
                "leaders welcome audit as trust maintenance",
            ],
            "organizations": [
                "ombud paths are normalized not exceptional",
                "peer review includes power holders",
            ],
            "software": [
                "security review includes product leaders",
                "incident review questions policy not only operators",
            ],
        },
    },
    "attention-restores-contact": {
        "recognitionSignals": [
            "reviews name particular harms and people",
            "abstraction is challenged with lived outcomes",
            "distance is noticed as moral risk",
        ],
        "questions": [
            "Who is affected in particular, not on average?",
            "What tradeoff disappears when we stay at summary level?",
            "Where has visibility replaced responsiveness?",
        ],
        "counterbalances": [
            "require named affected parties in decisions",
            "visit contact points before closing incidents",
            "pair metrics with case-based review",
        ],
        "trajectory": {
            "earlySignals": [
                "summaries dominate while cases are available",
                "distance is rewarded over contact",
            ],
            "intensificationSignals": [
                "averaging conceals particular harm",
                "closure arrives without contact",
            ],
            "failureModes": [
                "abstraction becomes innocence",
                "scale is used to avoid answerability",
            ],
            "restorationPaths": [
                "institutionalize case-based review at scale",
                "measure contact not only commentary",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives meet affected stakeholders before press releases",
                "reviews include frontline testimony",
            ],
            "organizations": [
                "complaint paths reach decision makers",
                "harm registers include lived impact",
            ],
            "software": [
                "incident reviews include customer impact stories",
                "SLO debates include user-visible failure cases",
            ],
        },
    },
    "finality-compensates-for-uncertainty": {
        "recognitionSignals": [
            "confidence is overstated to end discomfort",
            "severity arrives where certainty is missing",
            "ambiguity is treated as moral instability",
        ],
        "questions": [
            "What uncertainty are we closing too early?",
            "Who benefits from harsh finality here?",
            "What would slower closure protect?",
        ],
        "counterbalances": [
            "name remaining uncertainty alongside decisions",
            "separate severity from insecurity",
            "allow provisional commitments with review",
        ],
        "trajectory": {
            "earlySignals": [
                "rooms rush toward a single confident frame",
                "questions about doubt feel unwelcome",
            ],
            "intensificationSignals": [
                "policy hardens to relieve collective anxiety",
                "severity substitutes for shared understanding",
            ],
            "failureModes": [
                "finality forecloses needed revision",
                "insecurity drives punitive clarity",
            ],
            "restorationPaths": [
                "practice revisability-preserves-judgment",
                "publish uncertainty budgets with decisions",
            ],
        },
        "manifestations": {
            "leadership": [
                "executives announce irreversible cuts to calm markets",
                "zero-tolerance policies follow ambiguous harm",
            ],
            "organizations": [
                "investigations close when anxiety peaks",
                "compliance demands certainty artifacts",
            ],
            "software": [
                "freeze windows become permanent policy",
                "rollback is banned to appear decisive",
            ],
        },
    },
    "speech-escalates-faster-than-meaning": {
        "recognitionSignals": [
            "statements circulate for allegiance before precision",
            "tone is read before content",
            "communication grows more visible and less precise",
        ],
        "questions": [
            "What does this statement commit us to do?",
            "Who is performing concern without changing practice?",
            "Where has circulation outrun correction?",
        ],
        "counterbalances": [
            "require action items with public statements",
            "slow circulation until claims are scoped",
            "reward precision over allegiance signaling",
        ],
        "trajectory": {
            "earlySignals": [
                "hot takes spread before facts are checked",
                "urgency favors sharing over understanding",
            ],
            "intensificationSignals": [
                "words signal teams more than they coordinate",
                "nuance collapses under volume",
            ],
            "failureModes": [
                "speech substitutes for presence",
                "visibility rewards escalation not care",
            ],
            "restorationPaths": [
                "pair statements with named owners and dates",
                "practice speech-that-does-less-harm norms",
            ],
        },
        "manifestations": {
            "leadership": [
                "executive posts move markets before policy exists",
                "all-hands rhetoric outpaces operational change",
            ],
            "organizations": [
                "PR cycles set moral tone without practice change",
                "internal memos circulate as substitute for repair",
            ],
            "software": [
                "status pages update before engineering confirms scope",
                "viral incident threads outrun postmortem facts",
            ],
        },
    },
}


def _glossary_fill(slug: str, data: dict, field: str) -> object:
    title = str(data.get("title", slug)).strip()
    short = str(data.get("shortDefinition", "")).strip()
    t = title.lower()
    if field == "recognitionSignals":
        return [
            f"people invoke {t} to justify a frame that resists updating",
            f"conversations treat {t} as settled when evidence is still arriving",
            f"{t} is used where contact with consequence would be slower",
        ]
    if field == "questions":
        return [
            f"Where is {t} doing moral work that should stay revisable?",
            f"What would we notice if {t} were not available as closure?",
            f"Who pays when {t} is overstretched beyond its fit?",
        ]
    if field == "counterbalances":
        return [
            f"pair talk of {t} with named review dates",
            f"require examples before accepting {t} as sufficient",
            f"keep {t} tied to particular harms and people",
        ]
    if field == "trajectory":
        return {
            "earlySignals": [
                f"{t} appears early as a stabilizer under pressure",
                "small mismatches are explained away using the term",
            ],
            "intensificationSignals": [
                f"{t} carries more weight than the situation can sustain",
                f"revision of {t} feels threatening to coordination",
            ],
            "failureModes": [
                f"{t} substitutes for contact with what is happening",
                f"drift around {t} becomes normal before it is named",
            ],
            "restorationPaths": [
                f"re-anchor {t} to particular cases and tradeoffs",
                "practice revisability where the term closed debate",
            ],
        }
    if field == "manifestations":
        return {
            "leadership": [f"executives use {t} to close debate in the room"],
            "organizations": [f"policy language leans on {t} instead of repair"],
            "software": [f"metrics or process labels stand in for {t} in practice"],
        }
    if short:
        _ = short  # anchor prose in future edits
    return []


def _items_empty(items: object) -> bool:
    if not items:
        return True
    if isinstance(items, list):
        return not any(str(x).strip() for x in items)
    if isinstance(items, dict):
        return not any(v for v in items.values() if v)
    return True


def fill_drafts(repo: Path) -> int:
    root = repo / ENRICHMENT_ROOT / BOOK
    if not root.is_dir():
        print(f"No drafts under {root}", file=sys.stderr)
        return 1
    filled = 0
    for agent_dir in sorted(root.iterdir()):
        if not agent_dir.is_dir() or agent_dir.name == "lint-reports":
            continue
        field = AGENT_TO_FIELD.get(agent_dir.name)
        if not field:
            continue
        for draft_path in sorted(agent_dir.rglob("*.yml")):
            raw = yaml.safe_load(draft_path.read_text(encoding="utf-8"))
            if not isinstance(raw, dict) or not _items_empty(raw.get("items")):
                continue
            slug = str(raw.get("targetSlug", draft_path.stem))
            entity_type = str(raw.get("entityType", ""))
            if entity_type == "pattern" and slug in PATTERN_FILL:
                payload = PATTERN_FILL[slug].get(field)
            elif entity_type == "glossary":
                rel = ENTITY_TYPE_TO_DIR["glossary"] / f"{slug}.yml"
                canon = yaml.safe_load((repo / rel).read_text(encoding="utf-8"))
                payload = _glossary_fill(slug, canon, field)
            else:
                continue
            if payload is None or _items_empty(payload):
                continue
            raw["items"] = payload
            draft_path.write_text(
                yaml.safe_dump(
                    raw, allow_unicode=True, default_flow_style=False, sort_keys=False
                ).rstrip()
                + "\n",
                encoding="utf-8",
            )
            filled += 1
    print(f"Filled {filled} draft file(s)", file=sys.stderr)
    return 0


def main() -> None:
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=".")
    args = p.parse_args()
    sys.exit(fill_drafts(Path(args.repo).resolve()))


if __name__ == "__main__":
    main()
