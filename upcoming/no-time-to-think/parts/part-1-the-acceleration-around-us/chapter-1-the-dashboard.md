\newpage

# **Chapter 1**

## **The Dashboard**

The meeting was on a Wednesday afternoon, the third month after the AI coding tools had been deployed.

The director of engineering opened the slide deck on the conference room screen. Around twenty people had joined—some seated at the table, the rest present as small rectangles in the video grid along the right side. Slide one was the agenda. Slide two was context: a reminder of when the tools had been rolled out, which teams had been in the pilot, what the initial usage numbers showed. Slide three was a methodology note nobody spent much time on. Slide four was the dashboard.

The dashboard showed the quarter's output in green. Commits per engineer were up 34 percent. Tickets closed were up 29 percent. Documents generated—the slide offered two baselines, and the default showed the more favorable one—were up significantly. Time saved, according to the tool vendor's calculation, was two to three hours per engineer per week. All arrows pointed upward.

"The investment is working," the director said.

The room relaxed in the specific way rooms relax when a number confirms what leadership had already decided was true. Someone offered that it was great to finally see this data. Someone else asked about the timeline for expanding the rollout to the infrastructure team. The meeting moved forward.

Near the back of the call, one senior engineer had been looking at slide four a few seconds longer than everyone else. He hadn't said anything. He was thinking about a pull request he had merged ten days earlier: 844 lines of AI-generated scaffolding, all automated checks green, an AI review comment that specifically noted no concerns with the core logic. He'd read it quickly. A bug filed three days later traced to a race condition on line 412. The ticket was already marked closed before the bug arrived. The commit was already counted in the green numbers on the slide. None of the dashboard's fields had a place for any of that.

He stayed quiet. The meeting ended. The slide advanced to next steps.

---

The dashboard was not lying about the numbers it was built to display. That is part of the trouble.

Metrics do not merely observe work. They shape what an organization believes is happening and, in doing so, teach it what to pursue. When generation becomes cheap, the easiest things to count are volume and velocity: how many artifacts appeared, how quickly they moved, how much human typing was avoided. Those measures can be real and useful. They can also become a moral account of the workplace before anyone has agreed on what productivity is for.

There is a particular risk when a measurement improves because a constraint moved rather than because the work got better. Commits rise not only because engineers became more capable but because the bottleneck shifted from code generation to code review. Documents appear faster not only because the organization improved at producing them but because verification of those documents was never scheduled into the workflow. The dashboard records the gain at the generation stage. It has no field for what accumulated downstream, because it was not built to look downstream.

This incompleteness is not unusual or dishonest. Dashboards are always partial. The danger arrives when the organization treats a partial measure as a complete account—when "commits are up" becomes the full story of whether the engineering organization is in good health.

---

Research on AI coding assistants has continued to find genuine productivity gains in some settings, alongside substantial variation by task type, team, and context, and persistent disagreement about what should count as productivity in the first place.[^c1-he-throughput] Some teams finish more pull requests per sprint. Some individuals report less toil on repetitive scaffolding work they found least engaging. Some settings show little lasting change once the novelty of the tool wears off and its consistent limitations become familiar. The evidence does not settle into a single transferable number.

A longitudinal study covering more than two years and nearly 200,000 pull requests documented one of the clearer cases. When throughput doubled under mandate, per-reviewer load roughly doubled, automated review overtook human review, and merge and revert rates held steady—at least during the study window. The surface remained smooth. What shifted was where the scarce work lived. Human attention per pull request shrank. The volume of decisions requiring that attention did not.

What such a study can measure is the pace of generation and the distribution of review labor. What it cannot easily measure is whether the reviews that happened were adequate to what was being reviewed—whether comprehension kept pace with production, whether the engineers doing the reviewing had enough context to catch the failure modes that take months to surface. The two-year window is long enough to show that the system did not obviously break. It is not long enough to show whether it became more brittle.

That brittleness, when it arrives, rarely announces itself cleanly. It shows up in the bug that takes an experienced engineer two days to diagnose because the system has accumulated three months of AI-assisted changes that nobody has a full mental model of. It shows up in the review that got done under thirty seconds of attention because there were twenty-two other pull requests and the sprint closed on Friday.

---

The difficulty compounds when leadership announces a production target before the organization has settled a definition of what it is producing.

Possibility becomes pressure along a fairly predictable sequence. A vendor presents evidence—often genuine, sometimes selectively cited—showing productivity gains of 30 to 50 percent under favorable conditions. A leadership team facing competitive pressure and the cost of the tooling investment decides to realize those gains by the end of the quarter. The target is set. Forecasts harden into staffing plans. Staffing plans harden into budgets. Budgets harden into the quiet assumption that any team asking for more review time, more onboarding investment, or more time to consider what they are building is resisting the program rather than raising a legitimate operational concern.

The dashboard, once a window onto what is happening, becomes a scoreboard determining who is performing. What cannot be plotted there starts to feel optional. Then invisible. Then like waste to be reduced.

The senior engineer who noticed the race condition on line 412 understood this sequence. He knew better than to raise it in the Wednesday meeting. The green arrows were already on the slide. The budget had been committed. The argument he would have needed to make—that review capacity was not keeping pace with generation, that the "time saved" estimate did not count the time required to verify what the model had produced, that bug rates and maintenance cost should be part of the efficiency story—was an argument against a number that leadership had already cited in an all-hands. That is a difficult argument to make from the back of a video call, against a slide with green arrows, to a room that has already relaxed.

---

Consider what follows from the belief that generation volume constitutes the productivity story.

That spring, the engineering organization restructured. Headcount fell by eighteen percent. The teams reduced most were the ones whose work was hardest to count—the people who knew where the brittle seams were, who ran informal code reviews outside ticketed workflows, who had been translating architectural decisions into documentation new hires could use. The memo did not speak of what those people had carried that the tools could not.

That work did not leave with the headcount. Coordination, exception handling, institutional memory, and the slow transmission of judgment from experienced practitioners to newer ones—these do not disappear when the org chart thins. They reappear as review load, maintenance debt, onboarding friction, and unowned consequence.

The restructuring was not primarily an act of cruelty. It was an act of belief. The organization had treated a partial measure—volume, velocity, artifacts produced—as a complete account of capacity. It concluded that certain human functions had become redundant. What it had not accounted for, because the dashboard had never asked the question, was what those human functions were doing that the tools were not doing.

Generation looked cheaper. Judgment was never counted as capacity. When the org chart thinned, the green arrows continued to point upward, for a while, in the metrics that were tracked—while the people left to interpret what those arrows meant grew fewer and less rested and carried more of the context that no model had been trained on.

---

Which costs arrive later? The thinning of context: the gradual loss of people who knew where the exceptions lived and why the system behaves as it does under edge conditions. The capacity to revise a decision after consequence appears: a capacity that depends on people who understand the system well enough to locate what went wrong and why.

Ownership becomes harder to locate when many hands—and many models—contributed to the result. A system that once had authors now has artifacts. The artifacts may be indistinguishable from what careful authors would have produced. The difference appears when something fails and nobody can say with confidence why, or when a proposed change looks safe in isolation and nobody has the context to see what it would disturb three components downstream.

---

A serious productivity account would have to make room for those slower fields. Not by inventing a single replacement metric that pretends to solve the problem of judgment, but by refusing to treat volume alone as evidence that the system improved. Did review capacity keep pace with generation? Did ownership remain named and reachable when something broke? Did newcomers still develop enough understanding to interrupt a bad pattern when they encountered one? Did maintenance get staffed, or only deferred?

Those questions do not glow green by default. They require an organization willing to look past the arrow—and willing to treat understanding as productive capacity rather than as a form of delay to be scheduled away.

The senior engineer who had been quiet at the back of the Wednesday call filed a ticket the next morning. He described the race condition on line 412, linked the relevant commit, and marked the issue as medium severity. It was triaged, assigned to a sprint six weeks out, and eventually resolved by a patch that took one afternoon to write. By the time the fix landed, the bug had been in production for forty-one days. Nothing catastrophic had happened. The dashboard, asked whether the AI coding investment was working, had no way to hold that question against the answer it was built to display.

The dashboard had no field for whether anyone still understood the system well enough to explain why line 412 did what it did. The arrow was green. The sprint was closed. The next sprint was already open.

[^c1-he-throughput]: Hao He et al., "AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate," arXiv:2607.01904, July 2, 2026, https://arxiv.org/abs/2607.01904. This study of 802 developers and 196,212 pull requests documents a case in which per-capita throughput rose substantially while per-reviewer load roughly doubled and automated review overtook human review—a documented instance of a constraint relocating rather than dissolving. The authors note that merge and revert rates remained stable during the study window, which is significant: the surface remained smooth while the distribution of review burden shifted. Broader AI-assistant productivity findings vary significantly by task type, team composition, and baseline; treat headline figures as context-dependent rather than universally applicable, and attend to what each study measured as much as what it found.
