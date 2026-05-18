# 2. Responsibility as Cohesion

## From Software Boundaries to Human Boundaries

The previous chapter described cohesion in technical systems. A cohesive software component has a clear purpose, a clear boundary, and a stable reason to change. This chapter applies the same idea to people, teams, and institutions.

The question is simple: where does responsibility actually live? And is that boundary clear enough that the system can still learn when something goes wrong?[^c2-boundary-transfer]

When responsibility is cohesive, people can answer basic questions clearly:

- What am I responsible for?
- What decisions can I make?
- What consequences am I expected to absorb and improve?

When those answers become unclear, responsibility begins fragmenting long before anyone formally notices.

## Responsibility Is About More Than Blame

Responsibility is often treated as moral language: who should be blamed, who failed, who should apologize. But structurally, responsibility serves a different purpose. Responsibility determines where learning can happen.

A system learns best when the people making decisions, the people experiencing consequences, and the people capable of redesigning the system remain connected closely enough that feedback can still improve future behavior.[^c2-cohesive-responsibility] When those elements separate too far, organizations can still explain failures without becoming much better at preventing them. That distinction matters. A system can become highly skilled at narration while remaining poor at correction.

## What Cohesive Responsibility Looks Like

Cohesive responsibility does not mean one person controls everything. It means boundaries remain clear enough that outcomes can still meaningfully connect back to redesign.

At the team level, this often means a group can operate and improve a service over time, decisions remain close to operational reality, and failures can be traced back to people capable of changing the structure. At the organizational level, it means handoffs do not erase ownership. At the institutional level, it means authority and operational burden remain connected closely enough that systems can still adapt.

The practical test is simple: when something fails, can the organization identify a boundary capable of redesigning the conditions that produced the failure? If not, responsibility has likely become too fragmented to support learning reliably.[^c2-redesign-capable-boundary]

## Ownership Must Be Clear Before Pressure Arrives

Clear ownership often matters most during incidents. Under normal conditions, weak boundaries can stay hidden for long periods because momentum compensates for ambiguity. Under stress, ambiguity becomes visible immediately. Who decides? Who approves? Who absorbs the operational impact? Who can change the system afterward?

If those answers require prolonged negotiation during a crisis, cohesion was already weaker than the organization believed. This is one reason mature engineering organizations care deeply about operational ownership—not because ownership sounds virtuous, but because unclear ownership slows adaptation exactly when systems most need clarity.[^c2-postmortem-learning]

## How Responsibility Becomes Blurry

Responsibility usually fragments gradually rather than all at once. At first, collaboration expands informally. More stakeholders become involved. More people comment on decisions. More approvals appear. More exceptions get negotiated socially instead of structurally. This often feels inclusive and cooperative, but over time the organization starts losing clarity about who can actually redesign the system.

People become responsible for outcomes they cannot fully control. Meanwhile, people with structural authority become increasingly distant from operational consequence. That separation creates frustration everywhere: frontline teams feel powerless, leadership feels overwhelmed, coordination overhead increases, and redesign slows. The system continues operating, but learning weakens.

## When Accountability Diffuses

Diffuse accountability is not the absence of process. Often it appears as the opposite: more reporting, more oversight, more stakeholders, more review layers, more coordination meetings. Every group contributes partial information. No group fully owns redesign.

Software organizations experience this when ownership spreads across product, platform, operations, security, architecture, and compliance. Government institutions experience similar patterns across agencies, committees, and regulatory layers. The result is often the same: the organization becomes better at explaining problems than correcting them.[^c2-diffuse-accountability] That is one of the clearest signs responsibility has lost cohesion.

## The Centralization Problem

Large systems face a recurring tension. Some functions benefit from centralization. Security is a good example. A centralized security function can maintain expertise, establish consistent standards, and coordinate response across many teams. But centralization also creates distance. A central team may become a queue, an approval layer, or a group increasingly separated from operational reality.

Pure decentralization creates opposite problems: uneven capability, inconsistent standards, fragmented response, duplicated mistakes. The challenge is not choosing between total centralization and total autonomy. Healthy systems usually require some combination of both: clear local ownership, shared standards, escalation paths, visible integration responsibility. In other words: cohesion across levels, not just within one layer of the system.[^c2-federated-ownership]

## What Systems Spend When Responsibility Fragments

When responsibility becomes unclear, organizations compensate. Meetings increase. Approvals increase. Reporting increases. Escalations increase. This is not simply inefficiency. It is the system paying coordination cost because ownership boundaries no longer hold enough shared understanding on their own.

The organization spends more energy synchronizing fragmented responsibility. That compensation can keep systems functioning for a surprisingly long time, but it rarely improves learning quality, because coordination can distribute information without restoring clear redesign authority.

## What This Chapter Is Arguing

This chapter is not arguing that all decisions should be local, all organizations should flatten hierarchy, or all collaboration is harmful. The argument is narrower: systems learn best when responsibility remains cohesive enough that decisions, consequences, and redesign authority still meet in roughly the same place. That does not eliminate coordination. It preserves enough clarity that coordination remains useful instead of becoming compensation for fragmentation.

The next chapter extends the argument further. If cohesion determines where responsibility lives, coupling determines whether consequence can still find its way back there.

[^c2-boundary-transfer]: Robert C. Martin, *Clean Architecture*. Responsibility boundaries and separation of concerns in system design.
[^c2-cohesive-responsibility]: Hannah Arendt, *Responsibility and Judgment*. Responsibility as answerability in morally complex systems.
[^c2-redesign-capable-boundary]: Elinor Ostrom, *Governing the Commons*. Institutional design and boundary clarity for accountable governance.
[^c2-postmortem-learning]: W. Edwards Deming, *Out of the Crisis*. Learning quality depends on feedback into redesign, not post-hoc narration.
[^c2-diffuse-accountability]: Herbert A. Simon, *Administrative Behavior*, on bounded rationality and administrative fragmentation under complexity.
[^c2-federated-ownership]: Elinor Ostrom, *Governing the Commons*. Layered authority and local operational ownership under shared governance.

> Responsibility becomes coherent when the people making decisions, experiencing consequences, and redesigning the system remain connected closely enough to learn together.
