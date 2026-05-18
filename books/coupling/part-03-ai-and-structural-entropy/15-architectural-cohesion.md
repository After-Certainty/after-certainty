# 15. Architectural Cohesion

## The Team That Could Not Answer a Simple Question

A company launches an AI-assisted support system. Several teams contribute pieces: a retrieval system, a prompt orchestration layer, a policy classifier, recommendation logic, and the customer-support interface.

The demos look excellent. The assistant answers quickly. Leadership approves rollout. Adoption grows.

Then incidents start appearing. Support agents receive contradictory recommendations for similar customers. One path says refund the charge. Another says escalate to fraud review.

Logs show something strange: the policy classifier blocks some safe cases, while an older rules engine still approves riskier ones through a legacy path.

During the incident review, somebody asks a simple question: "Who owns what a correct recommendation actually means?"

Nobody can answer clearly. The retrieval team owns search quality. The platform team owns orchestration. Product owns workflows. The data-science team tuned the model. Operations owns runtime reliability.

But no boundary owns the meaning of the recommendation itself. The system has components. It does not have cohesion.[^c15-opening]

## AI Does Not Own Consequences

People often talk about AI systems as if the model itself "owns" outcomes. Structurally, that is backwards.

Models generate output. They do not absorb consequence. Models do not answer pager alerts, handle customer escalation, absorb legal liability, redesign workflows after incidents, or explain failures to regulators. People and institutions do.

That distinction matters enormously. AI systems amplify whatever ownership structure already exists.

A healthy architecture becomes more productive under assistance because generated work lands inside boundaries that can still learn and redesign coherently. An unhealthy architecture becomes more chaotic faster because generation fills gaps nobody clearly owned in the first place.

Acceleration exposes cohesion problems. It does not solve them.[^c15-amplifier]

## Why Boundaries Matter

Large systems need boundaries so people can reason locally. Without boundaries, every change affects everything, meaning drifts across teams, and responsibility becomes increasingly ceremonial.

Good boundaries answer simple questions clearly:

- What does this system mean?
- Who can change it?
- Which rules belong here?
- Which changes are external?
- Who learns when this fails?

Domain-driven design calls these boundaries bounded contexts. The name matters less than the idea: a bounded context is simply a place where terms still mean one thing and somebody still owns the consequences of changing them.[^c15-bounded-contexts]

## Context Collapse in Assisted Systems

AI systems create a new pressure: they make it extremely easy to mix contexts together.

A retrieval system can pull customer conversations, internal planning notes, policy drafts, engineering documentation, and experimental prompts into one generated response. The result often sounds coherent. That is the danger.

Syntax holds together longer than meaning does. The system produces fluent output even while mixing assumptions that were supposed to remain separate.

This is context collapse. And once it spreads through workflows, it becomes expensive to unwind.

## Data Boundaries

Data boundaries are one form of cohesion.

A support assistant should not automatically treat legal strategy documents, customer history, and internal experimentation notes as interchangeable context. The retrieval system may become more "helpful" in the short term. Operationally, the organization loses clarity about which rules apply, which information belongs where, and who owns the consequences of using it incorrectly.

Good systems keep contexts separate on purpose—not because merging them is technically difficult, but because meaning changes when boundaries disappear.

## Prompt Boundaries

Prompts need boundaries too.

Organizations often accumulate policy rules, exceptions, behavioral instructions, escalation logic, formatting guidance, and retrieval hints inside one enormous shared prompt. At first this feels efficient.

Over time the prompt becomes the AI equivalent of a legacy monolith: easy to extend, hard to reason about, and dangerous because one team's shortcut silently changes another team's behavior. The prompt grows. Ownership weakens.

Eventually nobody fully understands which instructions still matter or why certain behaviors emerged.

## Tool Boundaries

Tool access creates another kind of coupling.

A support assistant that can read customer history, issue refunds, modify billing, and trigger account actions without clear permission boundaries is no longer just generating text. It is acting inside the system. That changes the risk completely.

A wrong answer can be corrected later. A wrong action changes reality immediately. This is why tool boundaries matter so much.

The important question is not "Can the model call the API?" The important question is "Who owns the consequences if it does?"[^c15-interfaces]

## Interfaces Are Agreements

Interfaces are not just APIs. They are agreements about what crosses boundaries, what meanings stay stable, what failures look like, and when escalation must happen.

Human-machine systems need explicit interfaces for the same reason distributed software systems do. For example: what counts as a recommendation versus a decision, what requires human approval, what confidence means, what sources were used, and what happens when the system is uncertain.

Without those distinctions, organizations slowly move ambiguity into the highest-consequence parts of the workflow.

## Why Composition Matters

Every large assisted system eventually becomes a composition problem. Many teams add retrieval, prompts, tools, policies, monitoring, classifiers, and automation. Each addition looks reasonable locally.

Eventually somebody must answer: "How do all these pieces behave together?" That is architectural ownership.

Without it, systems evolve through convenience. The result is usually overlapping responsibilities, hidden coupling, contradictory behaviors, and incidents nobody can fully redesign because no boundary owns the whole consequence chain.[^c15-composition]

Architecture is not mainly diagrams. Architecture is deciding where meaning lives before acceleration spreads confusion faster than teams can correct it.

## The Most Common Failure

The most common AI architecture failure is not usually model quality. It is ownership diffusion.

Warning signs include multiple definitions of the same business rule, prompts nobody wants responsibility for, retrieval indexes nobody curates, tools without permission owners, and incident reviews ending with "retrain the model" when the real problem was boundary confusion.

These are cohesion failures. The model simply exposes them faster.[^c15-ownership]

## The Pattern Beyond Software

Hospitals separate diagnosis, pharmacy fulfillment, bedside administration, and surgical authorization because high-consequence systems need explicit responsibility boundaries. Aviation separates flight operations, maintenance, safety reporting, and certification for similar reasons.

The goal is not bureaucracy for its own sake. The goal is making sure consequence can still find the people capable of redesigning the system when something goes wrong.

AI systems need the same discipline because acceleration increases the cost of unclear ownership.[^c15-clinical]

## What Architectural Cohesion Really Protects

Architectural cohesion protects understanding. It keeps systems from becoming so interconnected that nobody can still explain what changed, why it changed, who owns it, and how to redesign it safely after failure.

Guardrails help systems stop dangerous behavior earlier. Cohesion decides whether the organization can still understand the system well enough to improve it afterward. That distinction matters.

A system can be highly constrained while still becoming impossible to reason about. Healthy systems need both: constraints that run, and boundaries that remain understandable under pressure.

## Bridge to Chapter 16

Part III began with acceleration: generation becoming cheaper, faster, and more plausible. It ends with a harder question: What kind of professional judgment is required when systems can generate changes faster than organizations can preserve clear ownership around them?

The final chapter argues that the important literacy is not prompt tricks. It is learning how to design systems where consequence stays visible, ownership stays legible, and reality can still teach the organization before drift hardens into normal operation.[^c15-bridge-c16]

[^c15-opening]: Matthew Skelton and Manuel Pais, *Team Topologies: Organizing Business and Technology Teams for Fast Flow* (IT Revolution Press, 2019), on ownership clarity and interaction modes under fast flow.
[^c15-amplifier]: Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (Boston: Addison-Wesley, 2003), on models, boundaries, and explicit context mapping.
[^c15-bounded-contexts]: Eric Evans, *Domain-Driven Design*; and Vaughn Vernon, *Implementing Domain-Driven Design* (Upper Saddle River, NJ: Addison-Wesley, 2013), on context maps and integration across bounded contexts.
[^c15-interfaces]: Saleema Amershi et al., "Guidelines for Human-AI Interaction," *Proceedings of the 2019 CHI Conference on Human Factors in Computing Systems*, paper 3, https://doi.org/10.1145/3290605.3300233; and OWASP Foundation, *OWASP Top 10 for Large Language Model Applications*, on excessive agency and tool-mediated risk.
[^c15-composition]: Alistair Cockburn, "Hexagonal Architecture," on composition through ports and adapters; and Matthew Skelton and Manuel Pais, *Team Topologies*, on stream-aligned teams and deliberate interaction modes.
[^c15-ownership]: Gene Kim et al., *The DevOps Handbook*, 2nd ed. (IT Revolution Press, 2021), on service ownership and operational learning loops; and Robert C. Martin, *Clean Architecture*, on dependency direction and policy/core separation.
[^c15-clinical]: Donald M. Berwick, "Era 3 for Medicine and Health Care," *JAMA* 315, no. 13 (2016): 1329-1330; and NASA Aviation Safety Reporting System (ASRS) program materials on cross-role incident learning.
[^c15-bridge-c16]: National Institute of Standards and Technology, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1 (2023), on lifecycle governance and role accountability.

> Assistance accelerates systems. Cohesion determines whether what accelerates can still be understood, owned, and redesigned.
