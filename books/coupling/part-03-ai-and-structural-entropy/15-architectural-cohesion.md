# 15. Architectural Cohesion

## The Feature Team Without a Domain

A company launches an assisted workflow that recommends next actions for customer support agents. Product, data science, and platform engineering each contribute components: a retrieval service, a prompt orchestration layer, a policy classifier, and UI integrations. Demos are strong. Rollout begins.

Within a month, incident load rises. Agents see contradictory recommendations. Logs show the classifier blocking safe cases while an older rules engine still issues high-risk suggestions on a legacy path. Nobody can state which component owns "what correct recommendation means" for a given customer segment.

The postmortem discovers not a single model failure but a cohesion failure. Boundaries existed on slides. They did not exist in code, data ownership, or escalation paths. Assisted generation accelerated each component separately. Architectural cohesion never caught up.[^c15-opening]

## AI as Amplifier, Not Owner

A common claim about assisted systems is that models "own" outcomes because they produce the visible text or code. Structurally, that claim confuses output with responsibility. Models do not absorb pager load, regulatory obligation, or redesign authority. People and institutions do—when systems are designed so those boundaries remain legible.

AI amplifies whatever architecture already exists. Clear domains with explicit interfaces and consequence return improve faster under assistance because generated work lands inside boundaries that can learn. Collapsed contexts and tacit coupling worsen faster for the opposite reason: assistance fills gaps that should have been owned.[^c15-amplifier]

Chapter 11 introduced hexagonal discipline for protecting core semantics from integration volatility. Chapter 14 added executable guardrails. Chapter 15 asks the architectural question those controls presuppose: where should meaning live, who owns it, and how do human, model, and tool actors interact without dissolving cohesion?

## Bounded Contexts in Assisted Systems

In domain-driven design, a bounded context is a boundary within which a model is consistent and externally exposed through explicit interfaces. The term is useful beyond monolithic versus distributed debates. It names the minimum condition for cohesive responsibility: a place where terms mean one thing and decisions have an owner.

Assisted systems need bounded contexts for data, prompts, and tools—not only for services.

**Data contexts** define which corpora, records, and retention rules apply to which workflows. Mixing support transcripts with internal strategy documents may improve fluency while destroying role-appropriate judgment. Retrieval should respect the same boundaries policy already defines for human access.

**Prompt and policy contexts** define which instructions, refusal rules, and escalation paths apply to which surfaces. Shared mega-prompts are the prompt equivalent of monoliths by accumulation: cheap to extend, expensive to reason about, dangerous when one team's exception becomes another team's default behavior.

**Tool contexts** define which actions are even available to a workflow. A model that can call billing APIs from a support assistant without a hardened tool boundary has collapsed operational contexts. The interface is not the HTTP schema alone. It is the permitted action set tied to role.[^c15-bounded-contexts]

Bounded contexts are how systems refuse context collapse at design time rather than discover it in incident review.

## Interfaces Between Human and Machine Action

Interfaces are not only APIs. They are agreements about what crosses a boundary: inputs, outputs, failure modes, and escalation.

Human–machine interfaces need the same explicitness as service-to-service contracts. A support agent assisted by draft text still needs clarity on what is suggestive versus binding, what requires supervisor approval, and what happens when the model refuses. Without those distinctions, organizations import ambiguity into moments of highest consequence.

Machine–tool interfaces need permission models that match operational reality: read-only by default, scoped writes, idempotent actions where possible, and human gates for irreversible operations. OWASP-style risk framing for large language model applications is useful here because it treats agency as a coupling problem: the more actions a system can take, the shorter the return path to accountability must be.[^c15-interfaces]

Human–human handoffs assisted by automation also need interfaces. If a model summarizes a case for escalation, the escalation owner must know what was omitted, what confidence looked like, and which sources were used. Otherwise assistance becomes a stale representation passed upward—accurate enough to sound complete, thin enough to mislead.

## Composition Roots and Integration Ownership

Every assisted architecture needs a composition root: a place where workflows are assembled deliberately rather than accreted. In hexagonal terms, this is where ports are wired to adapters; in organizational terms, it is where someone is accountable for how pieces combine.

Without a composition root, teams integrate by convenience. A data scientist adds retrieval. A platform engineer adds observability. Product adds a new tool. Each step is locally rational. The combined graph lacks an owner who can answer: "What is the end-to-end consequence path when this fails?"

Composition ownership is not a role title. It is a design assignment. Someone—or a small cross-functional boundary—must hold the map of contexts, interfaces, and guardrails as a single system rather than a pile of components. Team-topology thinking is relevant here: stream-aligned ownership for outcomes, platform enablement for shared capabilities, and explicit interaction modes so collaboration does not dissolve into tacit coupling.[^c15-composition]

## Ownership When Generation Is Cheap

Cheap generation changes the economics of ownership. When drafting cost approaches zero, organizations can produce variants faster than they assign owners. The result looks like parallel experimentation. Structurally, it can be responsibility diffusion: many versions, no boundary accountable for which version defines production truth.

Cohesive ownership in assisted systems requires explicit decisions:

- which context definitions are canonical
- which eval suites gate promotion
- which tool permissions are production-default
- which human roles may override, and how overrides are logged for learning
- which team may redesign semantics when incidents reveal mismatch

These decisions mirror pre-AI architecture choices about service ownership and schema authority. The difference is speed. Ownership must be assigned earlier, before generated surface area makes assignment politically costly.

Coupling discipline still applies. Owners need consequence return: incidents, eval failures, operator overrides, and customer harm signals must reach the boundary that can change prompts, corpora, tools, or escalation—not only the boundary that can restart pods.[^c15-ownership]

## Failure Modes: Architecture in Name Only

Assisted systems can reproduce the failure modes of ritualized hexagonal or microservice adoption: diagrams with ports and adapters that code does not honor, bounded contexts drawn once and violated daily, platform teams owning "the AI layer" while product semantics leak everywhere.

Warning signs include:

- multiple conflicting definitions of the same business term across prompts and services
- retrieval indices that no team will curate because "the model handles it"
- tool sprawl without a permission owner
- guardrails that differ by UI path but not by API path
- incident reviews that end with "retrain" when the defect is boundary design

These are cohesion failures, not model failures. Retraining without boundary redesign often preserves the same hidden coupling with better diction.

## Cross-Domain Parallel: Operating Procedures

Hospital protocols separate order entry, pharmacy fulfillment, and bedside administration for reasons that resemble bounded contexts. Assistance that drafts orders or labels can help clinicians, but only if handoff points remain explicit: who verifies allergies, who authorizes exceptions, and where consequential ambiguity must stop for human confirmation.

The parallel is not that hospitals should avoid assistance. It is that high-reliability environments treat boundary clarity as part of care quality. Assisted software systems operating under harm need the same discipline at software scale.[^c15-clinical]

## Bridge to Chapter 16

Architectural cohesion answers where meaning and ownership live in human–model–tool systems. Guardrails constrain behavior. Cohesion organizes responsibility so constraints have addresses—owners who can redesign contexts, interfaces, and composition when consequence returns.

Chapter 16 closes Part III by naming the professional literacy this requires. The literacy is not prompt trivia. It is the ability to design consequence architecture under acceleration: constraints, invariants, feedback visibility, and boundaries that remain legible while tools change.[^c15-bridge-c16]

[^c15-opening]: Matthew Skelton and Manuel Pais, *Team Topologies: Organizing Business and Technology Teams for Fast Flow* (IT Revolution Press, 2019), on ownership clarity and interaction modes under fast flow.
[^c15-amplifier]: Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (Boston: Addison-Wesley, 2003), on models, boundaries, and explicit context mapping.
[^c15-bounded-contexts]: Eric Evans, *Domain-Driven Design*; and Vaughn Vernon, *Implementing Domain-Driven Design* (Upper Saddle River, NJ: Addison-Wesley, 2013), on context maps and integration patterns across bounded contexts.
[^c15-interfaces]: Saleema Amershi et al., "Guidelines for Human-AI Interaction," *Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems*, paper 3, https://doi.org/10.1145/3290605.3300233; and OWASP Foundation, *OWASP Top 10 for Large Language Model Applications*, on excessive agency and tool-mediated risk.
[^c15-composition]: Alistair Cockburn, "Hexagonal Architecture," on composition through ports and adapters; and Matthew Skelton and Manuel Pais, *Team Topologies*, on stream-aligned teams and deliberate interaction modes.
[^c15-ownership]: Gene Kim et al., *The DevOps Handbook*, 2nd ed. (IT Revolution Press, 2021), on service ownership and operational learning loops; and Robert C. Martin, *Clean Architecture*, on dependency direction and policy/core separation.
[^c15-clinical]: Donald M. Berwick, "Era 3 for Medicine and Health Care," *JAMA* 315, no. 13 (2016): 1329-1330, on reliability, transparency, and system design in clinical practice.
[^c15-bridge-c16]: National Institute of Standards and Technology, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1 (2023), on lifecycle governance and role accountability across map, measure, manage, and govern functions.

> Assistance accelerates architecture. Cohesion decides whether what accelerates can still be owned.
