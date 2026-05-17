# 22. Designing for High Cohesion

## The Meeting That Replaced Ownership

A product area spans four teams. Each team ships regularly. Each has capable people. When a customer-impacting defect appears, a war room fills quickly.

Engineering explains the technical path. Product explains the business tradeoff. Operations explains on-call load. Legal flags exposure. Everyone contributes. No one can say, without negotiation, which boundary will change the design that made the defect likely.

The organization responds with a standing sync: more calendar time, more status fields, more approvers. Activity synchronizes. Responsibility does not cohere.

Chapter 21 named that pattern as oscillation—entropy paid in coordination debt. Chapter 22 asks what design can do earlier: strengthen cohesion so synchronization buys integration rather than replacing ownership.[^c22-opening]

## Cohesion as Design Target

Cohesion is not team spirit. It is structural: responsibilities inside a boundary fit together closely enough that a person or team can answer for outcomes and redesign when consequences return.

Chapter 2 translated cohesion from modules to roles. The design question here is how to build that translation into systems that will grow.

High cohesion reduces unnecessary coordination machinery. When ownership is clear, meetings reconcile real conflicts at known interfaces instead of discovering, repeatedly, who should have decided. When ownership is unclear, coordination substitutes multiply—extra reviews, extra dashboards, extra committees—because the system has no stable place for learning to land.[^c22-cohesion-target]

Designing for cohesion is therefore not anti-collaboration. It is pro-legibility: collaboration with named boundaries, explicit decision rights, and escalation that does not dissolve answerability.

The target is a system that remains locally understandable under pressure—not one where everyone is responsible for everything.

## Domain Boundaries Under Growth

Domains fail in predictable ways as scale increases.

**Boundary erosion.** A successful service attracts adjacent concerns: reporting, permissions, notifications, admin tools. Each addition is plausible. Together they turn one cohesive unit into a grab bag of reasons to change.

**Shared-everything collaboration.** Every team may comment on every area "for alignment." Comments become soft ownership. No boundary absorbs consequence.

**Platform without contract.** A central team offers shared capabilities without stable interfaces. Product teams integrate through tribal knowledge. Cohesion at the center does not produce cohesion at the edge.

Useful responses are design responses:

- name domains by outcome, not by org chart nostalgia;
- document what a boundary owns and what it explicitly does not own;
- treat cross-domain work as integration with a named owner on each side, not as ambient shared responsibility;
- split before cohesion is already gone, not only after incident volume forces a reorg.[^c22-domains]

Domain-driven design and team-topology thinking converge here from different angles: protect core semantics, make dependencies explicit, and align team boundaries to areas that should change together.[^c22-ddd-topologies]

Growth will add domains. The design discipline is to add them deliberately, with integration obligations, rather than by accretion.

## Role Integrity and Escalation

Cohesion weakens when roles separate authority from obligation.

A role has integrity when the person who decides can absorb enough consequence to learn, and when escalation carries context rather than exporting blame.

Under stress, organizations often invert this: decision rights float upward while operational pain stays below. Escalation becomes a request for approval without a paired obligation to redesign. The system synchronizes while coupling severs.

Designing for role integrity means:

- decision rights documented at the boundary where work happens;
- escalation paths that name who can change structure, not only who can approve the next step;
- incident practice that returns signal to owners who can alter architecture, prompts, policy, or staffing—not only restart services;
- refusal to treat "committee decided" as a substitute for "owner can revise the conditions that produced harm."

Chapter 14's guardrails matter in this frame: constraints support cohesion when they are owned and revisable at a boundary that experiences consequence. Guardrails without ownership become coordination theater—visible control without redesign capacity.[^c22-guardrails]

## When Centralization Helps vs Queues Harm

Not all centralization destroys cohesion. Not all distribution preserves it.

Centralization helps when it supplies stable platforms, shared standards, or integration expertise that would otherwise be duplicated badly at every edge. A platform team with clear contracts can raise cohesion for product teams by removing chaotic reinvention.

Centralization harms when it becomes a queue distant from consequence: architecture review without context, shared services without owners who feel operational pain, compliance gates that certify activity without returning signal to designers.

The design test is directional. Does the central function make local ownership more legible and more answerable, or does it insert a layer that synchronizes without learning?

Queues are a symptom of weak cohesion at interfaces. They are sometimes necessary. They are dangerous when they replace the harder work of naming who owns the outcome across boundaries. Federated models—clear local ownership plus explicit integration rules—often outperform both naive decentralization and blanket centralization.[^c22-centralization]

## What This Chapter Does Not Claim

This chapter does not claim that every team should own one service, that all committees should be abolished, or that cohesion eliminates tradeoffs. Scale still requires coordination. Some distance remains necessary.

It claims that cohesion is a design variable institutions can price deliberately: pay in clear boundaries and role integrity, or pay in recurring synchronization that may never return consequence to redesign authority.

Cohesion alone is not enough. A boundary can be cohesive and still severed from consequence. Chapter 23 turns to coupling—how feedback returns, how measurement serves redesign, and how consequence chains stay visible across handoffs.

## Bridge to Chapter 23

Chapter 22 argued for designing high cohesion: domains that survive growth, roles that keep authority and obligation aligned, centralization that enables rather than replaces local ownership.

Chapter 23 asks the paired question: how to design intentional coupling so consequences return with enough fidelity and speed that cohesion produces learning, not only local clarity in a drifting whole.[^c22-bridge-c23]

[^c22-opening]: Chapter 21 in this book on oscillation and coordination debt; and Chapter 4 on coordination substitutes.
[^c22-cohesion-target]: Chapter 2 in this book on responsibility as cohesion; and Elinor Ostrom, *Governing the Commons*, on bounded authority with explicit rules.
[^c22-domains]: Eric Evans, *Domain-Driven Design* (Boston: Addison-Wesley, 2003), on bounded contexts and core domain protection.
[^c22-ddd-topologies]: Matthew Skelton and Manuel Pais, *Team Topologies* (IT Revolution Press, 2019), on team boundaries and interaction modes.
[^c22-guardrails]: Chapter 14 in this book on guardrails as constraint architecture with named ownership.
[^c22-centralization]: Gene Kim et al., *The DevOps Handbook*, 2nd ed. (IT Revolution Press, 2021), on platform enablement versus handoff-heavy models.
[^c22-bridge-c23]: Chapter 3 in this book on consequence as coupling.

> Cohesion is not everyone owning everything. It is a boundary clear enough that someone can answer—and redesign—when consequence returns.
