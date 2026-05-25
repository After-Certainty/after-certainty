# Chapter 06 — Investigation Widens

Monday arrived, a week into Sev One, the way Sev Ones always arrived for people who had been backup anchor over a weekend: already in progress and slightly offended that Nate had slept.

He logged in from his kitchen at six-forty Pacific with coffee and the particular dread of returning to a problem that had not waited for him to feel ready. Caleb had been on the bridge for sixty-eight hours. The executive template for `SEV1-DELEGATED-AUTH-2026-05-15` had sprouted a new tab labeled *Investigation Workstreams* with seventeen rows and no owners filled in on eight of them.

Nate’s calendar had three meetings before nine, all of them titled some variation of *sync* and none of them promising synchronization.

His mother had texted while the coffee cooled: *Dad asked if you're coming for the neurologist follow-up. I told him you're at work. Call when you can—not urgent.*

He starred the message and did not call yet.

The first was not a meeting so much as a pile-on.

Eli Moreno had posted four variant reproductions overnight—different invitation timing, different account states, one path that only failed when profile sync ran before consent acknowledgment rendered in the audit log. Each variant had its own thread. Each thread had attracted a different theory within twenty minutes.

Nate read them standing at the counter, toast forgotten.

Variant one had Infrastructure arguing clock skew in the policy service. Variant two had Product insisting the failure was a review-screen skip users could not see on mobile. Variant three had Security proposing invitation enumeration with language that sounded like a budget request. Variant four had Customer Systems posting staging parity logs that did not match production timestamps and calling the mismatch *smoking gun* in a thread where nobody had defined what the gun was smoking.

The customer-systems lead from the weekend’s frame fight had returned with logs showing staging parity gaps. Infrastructure insisted production flag states matched the runbook. Product asked whether the variants changed customer messaging. Security asked whether any variant implied active exploitation in the wild.

Nobody asked whether the variants were the same bug wearing different clothes.

Nate tagged Caleb in the operational channel.

*Can we get one table—variant, repro owner, what it proves, what it doesn’t—before the ten o’clock bridge?*

Caleb replied in seconds.

*Already asked. Got back four spreadsheets and a Miro board.*

*Of course you did.*

*Nate. I need you in the war room at nine. Warren scheduled “technical convergence.”*

Warren’s phrase for *please stop describing different disasters*.

---

The war room was a glass conference area on the fourth floor, renamed Incident Focus Area for the week—whiteboards, extra monitors, a snack table with untouched granola bars because eating during a Sev One felt like betrayal. Fluorescent light flattened everyone’s faces the same way.

By eight-fifty the center table had laptops, chargers, and three printed runbooks nobody was using because the runbooks described a system that had stopped matching the diagram on the wall.

Priya Raman was already at the center board when Nate walked in, drawing boxes with the calm focus of someone who had stopped pretending diagrams were optional.

“Blast radius,” she said without preamble. “Not customer count yet. Authorization surface.”

She drew delegated onboarding as a spine—invitation, link, policy evaluation, profile object, sync job, audit trail—and then shaded everything that could receive a write from a session that was not the primary account holder.

Nate set his laptop down and leaned in.

“Talk me through the shaded area,” he said.

“Shaded region is any write path that inherits scope from the relationship record,” Priya said. “Product: onboarding orchestration. Identity: policy service. Customer Systems: profile lifecycle. Security: exposure. Same boxes. Different labels on the RACI.”

Eli stood beside her with a notebook, looking younger in fluorescent light than he had at Nate’s desk on Thursday.

“Start at invitation,” Nate said to Eli. “Where do the four variants enter the shaded region?”

Eli stepped to the board without taking the marker from Priya—a small courtesy Nate had learned meant Eli respected her ownership of the truth layer.

“Variant one,” Eli said, “enters after policy evaluation returns allow, before profile object creation completes. The session token inherits write scope from the relationship record, not from the primary holder’s current consent state.”

Priya nodded once.

“Variant two?” Nate asked.

“Review screen,” Eli said. “User taps through on mobile. Audit shows consent language rendered. Policy service shows consent not bound to the delegated write scope. The write still lands in profile lifecycle.”

Owen Patel joined late, audio only, voice rough with morning.

“If we tell enterprise customers we are pausing assisted onboarding, I need segment counts by noon,” Owen said. “Not approximate. Counts.”

“Variant three?” Nate said, staying on the board.

Eli did not look at Owen’s speakerphone. “Invitation retry path. Enumeration is plausible. Exploitation is not proven. The failure is still inside the shaded write region.”

Priya added a small box at the edge of the shaded area and labeled it *retry budget*.

“Variant four?” Nate asked.

“Sync job runs before consent acknowledgment renders in audit,” Eli said. “That is the ugliest one for Customer Systems because their logs look like staging parity until you line up timestamps with policy events.”

The customer-systems lead—Mara, Nate remembered from Sunday’s frame fight—unmuted from the back row.

“My team is not owning a sync ordering bug,” Mara said. “We own profile lifecycle. If Identity’s job runs early, that is Identity’s job.”

Priya turned from the board.

“Your lifecycle accepts writes from sessions that are not the primary account holder,” she said. “That is the shaded area. Sync ordering is how Eli proves the write lands. It is not a separate disaster.”

Mara opened her mouth, closed it, and typed something into her laptop instead of saying it aloud.

Warren Hale came in with two staff members and the expression of a man who had slept in fragments. Coffee rings on the war-room table. Nobody had touched the snack table.

“We need convergence,” Warren said. “Not more theories.”

Priya did not look away from the board.

“We have convergence on surface area,” Priya said. “We do not have convergence on who owns the failure inside it.”

“Failure is a strong word,” Owen said from the speakerphone, audio crackling.

“Failure is an accurate word,” Priya said.

Silence.

Warren turned to Nate.

Nate felt the center gravity settle on him the way Warren had promised on Sunday—*fresh Monday*, meaning available.

“What do you need to make today productive?” Warren asked.

“One investigation lead for cross-boundary repro,” Nate said. “Priya owns technical truth on the diagram. Eli owns the variant matrix. Customer Systems and Infrastructure embedded, not parallel. New theories post in the table or they do not post.”

Caleb, at the head of the table, raised a hand like a student.

“I can enforce the table,” Caleb said. “I cannot enforce feelings.”

“Enforce the table,” Nate said.

Warren said, “Caleb stays primary on coordination. Nate backs him up. We clear?”

“Clear,” Caleb said.

---

At nine-fifteen Caleb shared his screen on the room monitor.

The table was a single tab in the executive template, which was either progress or a new form of violence depending on whether you had to maintain it.

Columns: *Variant*, *Repro owner*, *Proves*, *Does not prove*, *Mitigation status*, *Theory posts*.

Four rows populated. Three empty cells in *Proves* still said *TBD* in yellow.

A Security architect immediately posted in the bridge channel: *Enumeration attack via invitation retries—see variant three.*

Caleb replied in-thread with a link to the table and one sentence: *Post evidence in column C or delete.*

The architect posted a log snippet sixty seconds later.

Infrastructure posted: *Race in sync workers explains variant four.*

Caleb: *Column C. Evidence. Variant number.*

Infrastructure posted timestamps.

Product posted a UX sequence diagram that proved users could skip a screen and did not prove the skip caused the write scope failure.

Caleb: *Diagram goes in column D as “does not prove.” Column C needs policy binding.*

Owen said, “Can we add a revenue column.”

“Not in this table,” Nate said. “Owen, you get a separate sheet. This table is what fails and who can reproduce it.”

Owen muttered something about footnotes that Warren pretended not to hear.

By ten the bridge had stopped being a theory free-for-all and started being an argument about what counted as evidence—which was worse for feelings and better for Monday.

Nate spent the mute windows copying Eli’s repro steps into the *Proves* cells and translating Mara’s staging language into timestamps Priya could put on the board.

Warren watched the table refresh and said, quietly, to Nate, “This is the first thing today that looks like narrowing.”

“It is mapping,” Nate said. “Narrowing is what we do after we agree on the map.”

Warren nodded as if mapping were close enough to narrowing for an executive summary, which Nate supposed was his job now too.

---

By noon the table existed in a form executives could screenshot—four variants, three confirmed paths into the shaded write region, theories still arriving with budget lines attached.

Nate spent the afternoon moving between threads the way he had spent the weekend moving between airports—translating, clarifying, asking people to post evidence next to adjectives.

His name appeared in seventeen channels before two. He answered eleven DMs marked urgent that were not urgent and one that was.

Priya’s DM held a link to a consent-path audit draft and a single line: *Policy export attached. Rows 14–22 still show delegated write scope without consent bound at action time. Sync-only mitigation does not change those rows.*

He forwarded it to Caleb with a note to put it in the executive template’s open questions box before Warren’s staff softened it into something about “ongoing monitoring.”

At three-thirty Mara cornered him by the snack table nobody used.

“If Eli’s fifth path is real,” she said, “my team gets blamed for legacy cohort cleanup we were told was dormant.”

“If it is real,” Nate said, “your team is not blamed alone. The shaded area is shared. Post what you know about the cohort size before Eli posts it without you.”

Mara looked at the rice cakes on the table as if they might offer diplomatic advice.

“We have maybe four hundred accounts,” she said. “Could be six if you count merged households twice.”

“Post the range,” Nate said. “Do not call it small in the thread. Small is how executives decide not to comms.”

---

At four-thirty Eli found him at a standing desk in the war room, eyes dry from screen light.

“I think there’s a fifth variant,” Eli said.

Nate closed the laptop halfway, then opened it again.

“Show me.”

Eli rotated his screen. This path failed only when a delegated relationship was created from an existing account that already had a pending profile merge from an older onboarding experiment.

“How old?” Nate asked.

“Two years,” Eli said. “Small cohort. Ugly cohort.”

On screen Nate watched the repro twice—once at normal speed, once stepped. The merge flag sat in Customer Systems metadata. The delegated invitation still evaluated policy as if the account were clean. The write landed in profile lifecycle with consent language that described a relationship state the merge had not finished reconciling.

“Who knew the merge experiment was still live?” Nate asked.

“Product thought sunset,” Eli said. “Customer Systems thought flag-gated. Infrastructure thought it was a data hygiene ticket.”

Nate rubbed his eyes.

“Post it in the table,” he said. “Tag it cohort risk. Do not call it edge case in the thread. Edge case is how we got here.”

Eli nodded, already typing.

Caleb appeared in the doorway with two coffees and the look of someone who had heard the word *cohort* and knew the evening bridge would run long.

“Warren wants a six o’clock summary that says we’re narrowing,” Caleb said.

“We’re not narrowing,” Nate said. “We’re mapping.”

“Can you say mapping in a way that sounds like narrowing?”

Nate took the coffee.

“I’ll try.”

---

The six o’clock bridge was forty people and one shared exhaustion.

Caleb walked the table row by row without jokes for the first five minutes. Priya kept the diagram on screen behind him. Owen asked twice for segment counts and got told to wait until cohort validation finished.

When Eli described variant five, the chat filled with the word *legacy* in twelve different moral tones.

Warren said, “Are we narrowing.”

It landed like a weather report, not a question anyone could answer yet.

Nate unmuted, Caleb’s name still on the attendee list as primary.

“We have four confirmed repro paths and a fifth in validation inside one authorization surface,” he said. “Mitigations reduced acute exposure. We do not yet have an owner for cross-boundary consent semantics. That is not narrowing. That is finally using one map.”

Someone typed *map is not owner* in the thread.

Warren said, “Put that in the summary.”

“I already am,” Nate said.

---

He wrote the six o’clock summary at his desk while the investigation table grew another row and three new comments argued about whether *cohort risk* belonged in customer comms.

He wrote that cross-team investigation had expanded with four reproducible variants and a fifth under validation. He wrote that blast-radius analysis had converged on delegated write scope spanning onboarding, identity policy, and profile sync. He wrote that mitigation actions had reduced acute exposure without resolving consent-and-authorization semantics.

He did not write that the company was closer to understanding the failure. He wrote that ownership for cross-boundary fixes remained under discussion—a sentence executives could treat as progress if they needed to sleep.

Warren reacted with a thumbs-up.

Caleb reacted with a gif of a dog in a hard hat—wrong incident, right morale.

Priya reacted in the engineering channel with an updated diagram and a comment that said only: *This is one surface. Stop calling it five bugs.*

Nobody agreed.

Everybody kept working.

Nate’s phone buzzed with a message from Rachel, who had been watching the incident the way family watched a storm on the news from a distance.

*Mom wants to know if you’re eating. Also Mark says hi and means are you alive.*

Nate typed back.

*Alive. Not eating. Tell Mom later.*

He meant to leave at seven. He left at eight-forty with three unread threads and Caleb still on the bridge, voice steady in a stand-up Nate listened to from the elevator.

“We’re wider than Thursday,” Caleb said to the room. “One table. One diagram. Post in column C or delete.”

Nate stepped into the parking garage. The map was larger than it had been that morning. So was his Tuesday calendar, already filling with meetings that would stall the moment he was not in them.

At home he microwaved leftovers and opened the incident channel on his phone while Hadley read on the couch. Variant five had forty-seven comments. Twelve used the word *legacy*. Three tagged Legal. One asked whether Nate could “own narrative” for customer comms.

He did not own narrative. He owned nothing except the habit of answering.

He typed a single reply in-thread: *Cohort size from Customer Systems pending. No comms language until table row validated.*

Then he closed the phone and ate while the food was still warm, which felt like a mitigation with a footnote.

Hadley asked what variant five meant.

“Old experiment flag plus new delegated invite,” he said. “Small cohort. Large argument.”

“Will they fix it?” she asked.

“They’ll fix a piece,” he said. “Then schedule a meeting about the rest.”

She nodded like someone who had watched him schedule meetings about meetings all month.

“Table’s still better than chaos,” she said.

“Barely,” Nate said.

“Barely counts,” she said, and went back to her book.

He went to bed before midnight, which counted as rebellion during a Sev One.
