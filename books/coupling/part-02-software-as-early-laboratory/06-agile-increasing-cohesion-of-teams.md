# 6. Agile: Increasing Cohesion of Teams

## Why Agile Emerged

Agile practice emerged as a response to long-cycle planning and late consequence return. If Waterfall exposed low temporal coupling, Agile sought to shorten cycle time so design decisions could meet feedback earlier.[^c6-emergence]

This was not one method but a family of practices. Iteration, incremental delivery, and regular retrospection were ways to reduce the delay between intent and evidence.

## A Non-Engineering Parallel

A useful parallel appears in hospital care teams. When treatment planning, bedside observation, and follow-up review happen in separate departments on long intervals, correction is slow and recurring issues persist. When a stable cross-functional team meets in short daily and weekly cadences, sees outcomes quickly, and adjusts protocols in cycle, responsibility becomes clearer and patient-care learning speeds up.[^c6-nonengineering-vignette]

The domain is different, but the structure is similar to Agile's core move: shorten the loop between decision and consequence inside a boundary that can actually adapt.

## Cohesion at Team Scale

A major structural contribution of Agile was team-level cohesion. Small cross-functional teams compressed decision distance by keeping product judgment, implementation work, and near-term quality feedback closer together.[^c6-team-cohesion]

When this worked, ownership became more legible. The same boundary that planned work could also absorb outcome and adjust behavior in cycle. That made learning less ceremonial and more operational.

## Feedback Rhythm and Learning Cadence

Iteration changed feedback rhythm. Instead of waiting for large integration events, teams could expose assumptions sooner through short cycles, demos, and frequent test signals.[^c6-feedback-rhythm]

This increased temporal coupling, but not automatically. Fast cycles produce learning only when teams can act on what feedback reveals. Otherwise, speed can become throughput theater.

## The Product-Engineering Boundary

Agile also changed how product and engineering collaborated. In stronger implementations, priorities, technical constraints, and outcome signals were negotiated in ongoing cadence rather than fixed upfront once.[^c6-product-engineering]

That shift improved local adaptation. It also introduced a new risk: teams could optimize for sprint completion while deferring system-level concerns that exceeded team boundaries.

## What Agile Did Not Solve

Agile improved cohesion inside teams more reliably than coupling across teams. As organizations scaled, dependencies between teams, platform constraints, and operational burdens still created distance between decisions and consequences.[^c6-scale-limits]

This explains why many organizations saw mixed outcomes: strong team velocity with persistent incident recurrence, delivery gains with cross-team friction, and healthy local rituals with weak global integration.

## From Team Cohesion to System Coupling

Agile should be read as a partial structural correction, not a final equilibrium. It tightened loops inside the team boundary and improved local responsibility coherence. But runtime consequence often remained partly externalized to operations, platform teams, or later integration points.

That remaining distance set up the next method shift. The question moved from "How do teams learn faster?" to "How do builders stay close to runtime consequence?"[^c6-transition-devops]

Chapter 7 turns to DevOps as an attempt to restore operational coupling, not just team cadence.

[^c6-emergence]: Agile Manifesto (2001) and early Agile-method literature on reducing long-cycle planning delay.
[^c6-team-cohesion]: Alistair Cockburn and related Agile writings on cross-functional teams, local ownership, and adaptive scope management.
[^c6-feedback-rhythm]: Kent Beck and iterative-development literature on short-cycle feedback and test-driven adaptation.
[^c6-product-engineering]: Martin Fowler and product/engineering collaboration literature on incremental planning and continuous reprioritization.
[^c6-scale-limits]: DORA research and large-scale Agile practice literature on limits of team-local optimization under inter-team dependency load.
[^c6-transition-devops]: Gene Kim et al., *The DevOps Handbook*, on extending feedback/ownership beyond team cadence into operations.
[^c6-nonengineering-vignette]: Donald M. Berwick, "Developing and Testing Changes in Delivery of Care," *Annals of Internal Medicine* 128, no. 8 (1998): 651-656.

> Agile strengthened local cohesion, but left system consequence only partially recoupled.
