\newpage

# **Introduction**

## **The Merge Button**

The pull request had been open since the previous afternoon.

By the time the engineer arrived at her desk at 8:47 in the morning, the automated pipeline had already run three times. The most recent run was clean: linting passed, unit tests passed, the dependency scanner returned without flags. An AI reviewer had left comments on four sections of the diff—an observation about naming consistency in the session handler, a note suggesting a null check on line 312, a paragraph about test coverage that named a specific edge case the author had not addressed. The comments looked like something a careful colleague would have written. They used the first person and explained their reasoning. The author had resolved two of them at 11:23 PM the previous night and replied to the third: "good catch, fixed."

The engineer opened the pull request. The diff ran to 1,140 lines across eleven files. The description said: "Refactors session handling to support the new multi-tenant model discussed in the March architecture review." She had been at that review. She remembered the broad shape of what was decided. Whether these 1,140 lines correctly implemented that shape—whether they introduced a new edge case, missed an assumption buried in a legacy function nobody had touched in three years, or created a conflict with the parallel change that merged last Thursday—she could not determine in the time available.

There were twenty-two other open pull requests. The sprint closed on Friday. The company had been running a throughput mandate for five months: twice as many merged pull requests per engineer per quarter as the year before.

She read the first three files carefully. She skimmed the next four. She clicked the green button.

---

This is not a story about negligence. The engineer was doing her job, attentively, under conditions not of her choosing. This is a story about proportion—about what happens when an organization makes generation faster without making review faster, and then interprets the gap as a production opportunity rather than as a design problem.

The button at the bottom of a pull request is not sinister. It is useful. It converts a finished proposal into a shared fact, turns private work into infrastructure other people can build on, and moves the day's work forward. Teams need that conversion. Without it, work remains private. With it, a local change can become the foundation other changes stand on—or, in a failure case, the point other failures trace back to.

What has changed is not the usefulness of the button. What has changed is the ratio between the work arriving at it and the human capacity available to evaluate that work before it passes through. Code assistants, language models, automated scaffolding tools, and AI reviewers that leave comments detailed enough to look carefully considered—all of these have made generation faster. Review has not automatically followed. The queue has grown. The pair of eyes at the end of the queue has not multiplied.

The pull request queue fills because generation is now fast and because the organization interpreted fast generation as an invitation to generate more. The reviewer still has one pair of eyes, the same finite attention, and twenty-two other items in the queue.

---

In 2024, a mid-sized software company set an explicit mandate: double the merged pull requests per engineer per quarter. A research team spent more than two years following what that mandate produced.

Hao He and colleagues tracked 802 developers and 196,212 pull requests across January 2024 to April 2026.[^intro-he-2x] By April 2026, per-capita throughput had reached 2.09 times the pre-mandate baseline. Automated review overtook human review in volume. Per-reviewer load roughly doubled. Merge rates held steady. Revert rates held steady—at least within the study window.

The stability of those rates matters. The familiar cautionary story—people sped up, quality collapsed, everything broke visibly—does not describe what the researchers found. Things did not fall apart in ways the dashboard could see. The green arrows remained green.

What the study found instead was a structural shift in where the scarce work lived. Before the mandate, part of the bottleneck was in production itself: writing code took time, and that time contained some of the reflective attention that happens while building. After the mandate and the tools that supported it, generation accelerated substantially. Automated review absorbed part of the new volume. Human review did not scale at the same rate. The share of each transaction that received close human attention shrank. The cognitive load per transaction—what a reviewer needed to understand to evaluate a change responsibly—did not.

The throughput numbers recorded a gain. What they did not record was whether comprehension had kept pace with production.

---

That gap—between what a metric records and what a system needs—is the subject of this book.

A faster step does not necessarily create a faster system. It often relocates the constraint.

This formulation is not a caution against speed. It is a design observation. When one stage of a process accelerates and others do not, the system does not automatically become faster: the bottleneck moves. The organization then has a choice. It can redesign around the new bottleneck—allocating review capacity when generation accelerates, treating verification time as productive work, staffing the pause rather than eliminating it. Or it can proceed as if the bottleneck dissolved instead of moved, and inherit the consequences when the new constraint eventually determines outcomes.

Most of the time, the second path feels more natural. The gain from the faster step is visible and immediate. The cost of the unfollowed bottleneck is deferred and distributed—it does not appear in the dashboard that celebrated the speed increase. The metric that measured success was not designed to look for where the friction went.

The pattern has appeared before. Acceleration has repeatedly outpaced the institutional redesign it requires. What differs now is the pace of the production-side change, the breadth of domains it is entering simultaneously, and how cleanly the output can be made to look finished before it is.

---

Once that pattern comes into view in software pull requests, it is recognizable elsewhere. It is not specific to AI or to any particular technology. It is the architecture of what happens when generation outpaces review in any domain where the signed artifact carries consequence.

A physician at the end of a long clinic day opens a queue of chart notes that the hospital's documentation system has drafted. The notes are polished. The histories of present illness read naturally. The billing codes are suggested. What her signature transfers is not only a name on a record but responsibility for the accuracy of every sentence above it—whether the right allergy is present, whether the symptom that matters survived the summary, whether the code fits the encounter or fits the model's training better. Verification is harder work than signing a careful human draft because fluency makes it difficult to see where the uncertainty lives.

An air-traffic controller monitoring a sector that better tools have made more orderly faces quiet intervals that a staffing model might read as idle capacity. What they are, in the work itself, is recovery time: the margin that keeps attention available when the unexpected arrives—weather that rearranges the sky, equipment that fails mid-sequence, a conflict the automation did not anticipate.

In each case the structure is similar. Generation or coordination becomes faster. Organizations interpret the new capacity as an obligation to fill it. The bottleneck migrates into review, verification, sustained attention, and care. Dashboards measure what they were built to count. The constraint settles in what they were not built to count.

---

This book does not argue that speed is wrong, that automation is a mistake, or that better outcomes follow from returning to older methods. Urgency can be genuine. Documentation toil is not a form of medical care worth protecting. Clerical coordination in aviation is not where controllers' attention belongs. Code generation can remove work that was repetitive, error-prone, and low-stakes without being worth defending. Throughput gains can reduce waiting, improve access, and free people for work that could not happen when routine work consumed all available capacity. Those goods are real.

The difficulty is not that acceleration helps. The difficulty is that institutions tend to harvest the benefit of a faster step without redesigning around the constraint that step created. The benefit is immediate and visible. The constraint is deferred and structural. The organization that understands this difference can capture the benefit and staff the new bottleneck. The organization that does not will find the constraint eventually—in a maintenance failure, a signed note that should not have been signed, a decision that looked efficient on the throughput chart while missing something.

Thought is not simply an individual virtue that people can summon on demand regardless of conditions. Judgment requires time, attention, context, and rest. It requires contact with consequence—some way for the person deciding to encounter what the decision does after it leaves the screen. It requires institutional permission to pause and enough slack in the workflow for a second look. Without those conditions, intelligence is present and still cannot do the work it has been assigned.

Bottlenecks are not always waste. Sometimes a bottleneck is a safety boundary: the place where the system still requires a human to hold the work long enough for understanding to arrive. Eliminate that friction without replacing its function, and the system may move faster while becoming less able to know what it is doing.

---

The chapters that follow begin with three contemporary cases—software throughput, medical documentation, and air-traffic control staffing—in which AI, automation, staffing pressure, and throughput targets move work faster than review or understanding can follow. They then examine older precedents, from scientific management and the assembly line through aviation procedure design and nuclear reactor operations, not to argue that today's tools are equivalent to yesterday's machines, but to show that technological acceleration has repeatedly relocated the scarce work and that institutions have repeatedly needed to rediscover the value of pauses, margins, trained judgment, and stop authority. The final section asks what responsible speed requires now—how institutions can recognize when a bottleneck has moved, what it costs to staff the new constraint rather than deny it, and what conditions make judgment possible rather than merely formal.

A companion book, *The Case That Does Not Fit*, asks whether an institution can reconsider a category that failed to represent a particular case. This book asks a prior question: whether the institution still possesses the systemic capacity—time, attention, context, review, and stop authority—to reconsider anything at all.

---

The engineer was good at her job. She wanted to do it carefully. She read what the schedule allowed, made the best judgment available in the time she had, and clicked the green button.

The queue contained twenty-two more.

[^intro-he-2x]: Hao He et al., "AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate," arXiv:2607.01904, July 2, 2026, https://arxiv.org/abs/2607.01904. Panel of 802 developers and 196,212 pull requests (January 2024–April 2026); per-capita throughput reached 2.09× the pre-mandate baseline in April 2026; per-reviewer load roughly doubled; automated review overtook human review; merge and revert rates held steady during the study window. The authors treat the adoption-and-use channel as strongly implicated rather than establishing exact causal attribution from random assignment.
