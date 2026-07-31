\newpage

# **Introduction**

## **The Merge Button**

At the bottom of a software pull request sits a green button.

The code has already been written. Automated checks may already be green. An AI reviewer may already have left comments that look careful, specific, and nearly human. The scarce work is no longer production. It is the human attention required to decide whether the change should exist, whether it belongs in this system, and who will live with it after the click.

The button is not sinister. It is useful. It turns a finished proposal into a shared fact. Teams need that conversion. Without it, work remains private forever. With it, a local improvement can become infrastructure that other people inherit, maintain, depend on, and eventually blame when something breaks.

What has changed is not the usefulness of the button. What has changed is everything surrounding it.

In one mid-sized company that set out to double merged pull requests per engineer, researchers followed 802 developers and 196,212 pull requests over more than two years. Per-capita throughput eventually reached 2.09 times the pre-mandate baseline. Per-reviewer load roughly doubled. Automated review overtook human review. Merge rates and revert rates remained stable during the study period.[^intro-he-2x]

That last detail matters. This is not a simple story of quality collapse. The familiar cautionary plot—people moved faster, quality fell, the system broke—does not fit the evidence cleanly. What fits more closely is a quieter story: a constraint moved.

Writing became cheaper. Review did not. Integration did not. Maintenance did not. Consequence contact did not. The organization got more green checks into the queue. It did not automatically get more capacity to understand what those checks meant, to notice what they displaced, or to decide when speed should stop.

A faster step does not necessarily create a faster system. It often relocates the constraint.

Once that pattern comes into view, the Merge button stops being only a software detail. It becomes a general institutional object. Wherever generation becomes cheap—code, notes, images, recommendations, decisions—the same pressure appears. Production accelerates. Organizations interpret new capacity as an obligation to produce more. Bottlenecks move into review, verification, coordination, training, maintenance, and care. Dashboards celebrate what became visible. Fragility often lives elsewhere.

This book is not an argument against AI, automation, or speed. Urgency can be real. Automation can remove toil. Throughput can reduce waiting, improve access, and free people for more important work. Those goods are not rhetorical concessions. They are part of the problem’s seriousness. If acceleration never helped, the design question would be easy: slow down. Because acceleration often helps, the question becomes harder: how do institutions preserve the capacity for judgment while work changes shape around them?

Thought is not simply an individual virtue that people can summon on command. Judgment depends on conditions. It needs time. It needs attention. It needs stable enough context to notice what changed. It needs contact with consequence—some way for the person deciding to encounter what the decision does after it leaves the screen. It needs permission to pause. It needs enough institutional slack for a second look. Without those conditions, intelligence remains real and still cannot do the work assigned to it.

That is why bottlenecks are not always waste. Sometimes a bottleneck is a safety boundary: the place where the system still forces a human being to hold the work long enough for understanding to catch up. Eliminate that friction without replacing its function, and the system may move faster while becoming less able to know what it is doing.

The chapters that follow begin with present-day stories in which AI, automation, staffing pressure, and throughput targets move work faster than review or understanding. They then turn to older precedents—scientific management, the assembly line, aviation checklists, Challenger, Three Mile Island—not to claim that today’s tools are identical to yesterday’s machines, but to show that technological acceleration repeatedly relocates the scarce work and forces institutions to rediscover pauses, margins, training, and stop authority. Finally they ask what responsible speed would require as generation becomes cheaper and judgment becomes the scarce resource.

Every chapter asks a version of the same five questions. What activity became faster, cheaper, or easier? Where did the constraint move? Who or what absorbed the displaced work? Why did the new constraint become less visible? What institutional mechanism could make it visible or manageable again?

A companion book, *The Case That Does Not Fit*, asks whether an institution can reconsider a category that failed to represent a particular case. This book asks a prior question: whether the institution still possesses the systemic capacity—time, attention, context, review, and stop authority—to reconsider anything at all.

The queue contains more green checks than it did before. The human still has one pair of eyes.

The button was always easy to press. The difficult work is building an organization in which someone still has time—and authority—to decide.

[^intro-he-2x]: Hao He et al., “AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate,” arXiv:2607.01904, July 2, 2026, https://arxiv.org/abs/2607.01904. Panel of 802 developers and 196,212 pull requests (January 2024–April 2026); per-capita throughput reached 2.09× the pre-mandate baseline in April 2026; per-reviewer load roughly doubled; automated review overtook human review; merge and revert rates held steady. The authors treat the adoption-and-use channel as strongly implicated rather than as exact causal attribution from random assignment.
