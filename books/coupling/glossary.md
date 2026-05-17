# Glossary

This glossary defines domain-specific terms used across the book so readers from different backgrounds can share a common vocabulary.

Several philosophical terms are used in a general philosophy and ethics sense (especially authority, responsibility, judgment, and political action), rather than only in casual everyday usage.

## Feedback

The path by which outcomes return as signal and influence future decisions. Weak or delayed feedback reduces learning quality.

## System

A system is an organized set of people, processes, rules, and structures that produces repeatable outcomes over time.

In this book, the term applies across domains: software architectures, teams, firms, agencies, governance structures, and media institutions. The shared criterion is not technology; it is patterned behavior under constraints, incentives, and feedback.

## Abstraction

A mechanism for managing complexity by separating layers of concern. Useful for coordination, but risky when it obscures ownership and consequence pathways.

## Constraints

Constraints are the limits and boundary conditions that shape what actions are possible in a system.

They include technical limits, legal rules, time pressure, budget limits, and institutional procedures. Good constraints channel behavior toward learning and accountability; poor constraints hide tradeoffs or displace consequence.

## Incentives

Incentives are the reward and penalty patterns that influence behavior over time.

In this book, incentives include formal metrics, promotion logic, political pressures, funding structures, and social recognition patterns. Incentives do not determine behavior by themselves, but they strongly bias what actors optimize for.

## Scale

Growth in system size, complexity, or abstraction layers that can increase distance between decisions and consequences.

## Responsibility

Responsibility is the durable relation between action and answerability. It includes not only causal involvement but also the obligation to account for consequences and respond to what is revealed by them.

## Accountability

Accountability is the institutional form of responsibility: the mechanisms by which actions, decisions, and outcomes are reviewed, attributed, and corrected. Accountability language can remain while practical accountability erodes.

## Authority

In this book, authority is not mere position or force. It is the socially recognized standing to make binding judgments that others can treat as orienting without constant coercion.

## Agency

Agency is the practical capacity to initiate action that can affect outcomes. Formal role without real leverage is low agency, even when nominal responsibility remains.

## Judgment

Judgment is the situated capacity to interpret particulars without reducing them to rigid rules. In a general philosophy and ethics framing, judgment is central when systems face novelty, ambiguity, or moral conflict.

## Cohesion

The degree to which responsibility is clearly held within a boundary (team, role, function, or institution). High cohesion means ownership is legible and decisions are not diffusely assigned.

## Coupling

The degree to which consequence returns to the people or structures making decisions. Intentional coupling keeps feedback timely and relevant.

## Coordination Pressure

The structural strain that appears when many actors must stay aligned under scale while holding partial information and changing on different timelines.

Coordination pressure is not the same as everyday busywork. It names the cost of maintaining a workable shared picture of responsibility, facts, and next actions when cohesion and coupling weaken. It often appears as approvals, queues, handoffs, and reporting layers that synchronize activity without returning consequence to a redesign-capable boundary.

## Coherence Maintenance

The ongoing work required to keep a system governable: enough agreement about who decides, what happened, and what must change next for learning to remain possible.

Coherence maintenance becomes expensive as independently evolving boundaries multiply. Systems sometimes pay for it through clear ownership and timely feedback; they sometimes pay through coordination substitutes that preserve throughput while thinning corrective capacity.

## Temporal Coupling

The degree to which consequences return quickly enough to shape near-term decisions.

Strong temporal coupling shortens the time between action and correction. Weak temporal coupling introduces lag, memory loss, and interpretive noise that can protect failing designs from timely revision.

## Operational Coupling

The degree to which the people who design or decide also remain close to execution and runtime consequence.

Operational coupling is stronger when builders, operators, and reviewers share consequence exposure. It is weaker when handoffs separate decision authority from incident impact.

## Governance Coupling

The degree to which formal oversight structures preserve real consequence return to decision-capable authority.

Governance coupling weakens when signal is filtered, delayed, or politically insulated, even if nominal accountability mechanisms still exist.

## Interface

In this book, interface is used in a software engineering sense.

An interface is the defined boundary through which one component interacts with another (for example, function signatures, API endpoints, message schemas, or protocol expectations). A good interface makes dependencies explicit while minimizing exposure to internal implementation details.

## Contract

In this book, contract is used in a software engineering sense.

A contract is the explicit behavioral agreement attached to an interface: what inputs are valid, what outputs are expected, what errors can occur, and what invariants are guaranteed. Strong contracts reduce ambiguity between components and make failures easier to diagnose.

## Legitimacy

Legitimacy is the condition under which authority is recognized as rightful rather than merely enforced. Systems lose legitimacy when consequence consistently lands far from decision-makers.

## Shift Left

In this book, shift left is used in a software engineering sense.

Shift left means moving quality, security, and risk checks earlier in the development lifecycle rather than concentrating detection late in integration or release.

## DevOps

In this book, DevOps is used in a software engineering sense.

DevOps refers to practices and operating norms that reduce the distance between software implementation and operations so that delivery, reliability, and learning stay structurally connected.

## Waterfall

In this book, Waterfall is used in a software engineering sense.

Waterfall refers to a phase-sequenced development model where requirements, design, implementation, testing, and release are treated as largely distinct stages with formal handoffs and review gates.

## Agile

In this book, Agile is used in a software engineering sense.

Agile refers to iterative development approaches that shorten feedback cycles, emphasize incremental delivery, and increase team-level ownership of ongoing change.

## DORA

In this book, DORA is used in a software engineering sense.

DORA refers to research-backed software delivery metrics and practices (for example, lead time for changes and change failure rate) used to evaluate learning-loop quality between development and operations.

## Hexagonal Architecture

In this book, hexagonal architecture is used in a software engineering sense.

Hexagonal architecture (also called ports and adapters) is a boundary pattern that keeps domain logic insulated from external technologies by routing integration concerns through explicit interface ports and adapter implementations.

## Invariant

A condition that should remain stable across contexts and scale if a system is to stay healthy. In this book, the invariant is that responsibility should remain cohesive and consequence should remain intentionally coupled.
