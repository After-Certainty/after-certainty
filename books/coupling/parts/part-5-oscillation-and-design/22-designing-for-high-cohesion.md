# 22. Designing for High Cohesion

## The Meeting That Appeared After the Failure

A product area spans several teams.

Each team has capable people. Each team ships regularly. Everyone is working hard.

Then a customer-impacting failure occurs.

A meeting forms quickly.

Engineering explains the technical issue. Product explains the business tradeoff. Operations explains staffing pressure. Security explains risk exposure. Legal explains compliance concerns.

Everyone contributes useful information.

But one question remains strangely difficult to answer: Who can actually change the conditions that made this problem likely?

The organization responds the way large systems often do:

- another recurring sync,
- more reporting fields,
- additional approval paths,
- more visibility dashboards,
- clearer escalation chains.

Activity increases. Coordination increases. But ownership often remains just as unclear as before.

The system becomes better at synchronizing around problems than redesigning the structures producing them.

Chapter 21 described this pattern as oscillation: drift compensated for through coordination. This chapter asks a different question: what kinds of design make coordination less necessary in the first place?[^c22-opening]

## What Cohesion Actually Means

Cohesion is often misunderstood as cultural alignment or teamwork. But cohesion is structural.

A system is cohesive when responsibilities that belong together remain together strongly enough that someone can understand the outcome, answer for the outcome, and redesign the system when consequences return.

Low cohesion means responsibilities are scattered across too many boundaries. At first this can feel collaborative. Many people contribute. Many perspectives are included. Many teams stay informed.

But over time, systems with weak cohesion often compensate with increasing coordination overhead: more meetings, more handoffs, more approvals, more status tracking, more synchronization work.

The organization spends growing energy coordinating fragmented ownership.

High cohesion reduces that burden. It does not eliminate collaboration. It makes collaboration more legible. People know which boundary owns what, where decisions belong, and where consequences should return when something fails.

The goal is not making everyone responsible for everything. The goal is preserving boundaries clear enough that learning can actually land somewhere durable.[^c22-cohesion-meaning]

## How Cohesion Erodes

Cohesion rarely disappears all at once. It usually erodes gradually under growth.

A service begins with one clear purpose. Then adjacent responsibilities get added: reporting, permissions, notifications, analytics, administrative tooling, integrations.

Each addition seems reasonable individually. Over time, the boundary loses clarity. The system no longer has one stable reason to change. Different teams modify it for unrelated purposes. Local understanding weakens.

Organizations often respond by increasing coordination: shared planning, alignment meetings, review processes, cross-functional oversight.

But coordination cannot fully compensate for boundaries that no longer make structural sense.

Another common failure appears when collaboration becomes ambient rather than owned. Everyone comments on everything. Everyone participates. No one fully absorbs consequence.

Responsibility becomes socially distributed while structurally unclear. This often feels inclusive in the short term. In the long term, it becomes difficult to identify who can redesign the system coherently.[^c22-erosion]

## Designing Boundaries That Survive Growth

Healthy systems usually make ownership explicit early, before scale forces the issue painfully.

That means:

- defining domains around outcomes rather than org charts,
- naming what a boundary owns,
- naming what it explicitly does not own,
- treating cross-boundary work as negotiated integration rather than vague shared responsibility.

Growth always creates new boundaries. The question is whether those boundaries emerge intentionally or accumulate accidentally.

Systems designed intentionally remain understandable longer under pressure. Systems built through unchecked accretion often compensate later through bureaucracy and synchronization.[^c22-boundaries]

## Role Integrity

Cohesion also depends on whether authority and consequence remain connected.

Roles lose integrity when people making decisions no longer experience enough consequence to learn from those decisions. This often happens gradually in scaled organizations. Operational pain remains close to frontline teams. Decision authority moves upward. Escalation becomes a request for permission instead of a path for redesign.

The organization still appears accountable because approvals exist. But the learning loop weakens.

Healthy role design keeps enough connection between decision-making, operational consequence, and redesign authority. That does not mean executives should personally operate every system. It means systems should preserve clear paths through which consequence can still influence the structures capable of changing it.

Without that connection, escalation slowly becomes procedural theater: activity proving responsibility is being processed without responsibility becoming structurally clearer.[^c22-role-integrity]

## When Centralization Helps

Centralization is not automatically bad. Some centralization increases cohesion.

Shared platforms can reduce duplication. Clear standards can reduce chaos. Specialized expertise can improve system quality across many teams. A well-designed platform team often strengthens local ownership by removing unnecessary complexity from product teams.

The problem appears when centralization becomes too distant from consequence. Architecture review boards without operational context. Shared services nobody fully understands. Compliance gates optimized for documentation instead of redesign.

At that point, the central function becomes a queue. And queues are often signals that ownership has weakened at the interface between groups.

Some queues are unavoidable. But systems become fragile when queues replace the harder work of clarifying who owns outcomes across boundaries.[^c22-centralization]

## What High Cohesion Protects

High cohesion does not eliminate failure. It protects local understanding.

When systems remain cohesive:

- problems are easier to trace,
- redesign happens closer to consequence,
- coordination costs remain lower,
- learning survives growth longer.

The system remains understandable enough that adaptation is still possible.

That matters because large systems rarely fail from a single catastrophic mistake. More often, they drift into fragmentation slowly enough that nobody notices how difficult redesign has become until pressure arrives.

## What This Chapter Is Not Arguing

This chapter is not arguing that every team should own a single service, committees are always harmful, or coordination can disappear entirely.

Large systems will always require synchronization. Some distance between groups is unavoidable.

The argument is narrower: organizations can choose whether to pay more of their coordination cost through clear boundaries, visible ownership, and coherent responsibility—or through recurring synchronization, procedural overhead, and increasingly complex negotiation.

Cohesion alone is not enough. A boundary can remain internally coherent while still disconnected from consequence. That is the next chapter's problem.

## Bridge to Chapter 23

This chapter focused on cohesion: clear domains, stable ownership, role integrity, understandable boundaries.

Chapter 23 turns to coupling: how consequences return across those boundaries, how feedback remains visible, and how systems preserve learning as handoffs multiply.

Because clear ownership alone does not guarantee adaptation. Systems also need consequence to find its way back to the people capable of redesigning them.

[^c22-opening]: Chapter 21 in this book on oscillation and coordination debt; and Chapter 4 in this book on coordination substitutes.
[^c22-cohesion-meaning]: Chapter 2 in this book on responsibility as cohesion; and Chapter 1 on cohesion as internal integrity of a bounded unit.
[^c22-erosion]: Chapter 13 in this book on context collapse and accumulation; and Chapter 12 on ownership diffusion under acceleration.
[^c22-boundaries]: Eric Evans, *Domain-Driven Design* (Boston: Addison-Wesley, 2003), on bounded contexts; and Matthew Skelton and Manuel Pais, *Team Topologies* (IT Revolution Press, 2019), on team boundaries under growth.
[^c22-role-integrity]: Chapter 2 in this book on decision clarity under pressure; and Michael Lipsky, *Street-Level Bureaucracy*, on frontline consequence and distant authority.
[^c22-centralization]: Gene Kim et al., *The DevOps Handbook*, 2nd ed. (IT Revolution Press, 2021), on platform enablement versus handoff-heavy models.

> Cohesion is not about making everyone responsible for everything. It is about preserving boundaries clear enough that responsibility can survive growth.
