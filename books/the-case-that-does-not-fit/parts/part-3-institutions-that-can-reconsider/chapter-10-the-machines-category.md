\newpage

# **Chapter 10**

## **The Machine's Category**

The screen has three fields.

Classification: ineligible.

Confidence: 0.87.

Recommended action: deny.

Other details sit around the edges: a case number, a date, a file link, a button that records the final decision. But the eye goes first to the category and then to the score. The system has placed a person somewhere, measured its own confidence, and told the institution what to do next.

This is the ordinary face of automated classification. It may appear in a benefits office, bank, insurance claim, school discipline platform, fraud screen, employment system, hospital review, or public agency's case-management software. The language varies: eligibility, risk, priority, misconduct, medical necessity, identity match. The movement is similar. A messy set of facts becomes a category an institution can act on.

Classification is not new. A form with checkboxes classifies. A sentencing table classifies. A doctor's note classifies. An appeal stamp classifies. The difference is not that machines introduce categories into a category-free world. It is that automated categories can arrive with a special institutional authority: more objective because no visible person authored them, more precise because they carry a number, and harder to challenge because the path from life to category is buried inside data, code, model behavior, vendor documentation, and administrative habit.

The category may be wrong in an ordinary way. The data may be stale. Two people may have been merged into one file. A household may have changed. A diagnosis code may not capture the reason treatment is needed. A name may not match across databases because one source uses an old spelling and another a transliteration. None of this is exotic. It is the ordinary friction of reality entering institutional records.

What changes is the difficulty of making the friction visible.

---

A human clerk who says no can be questioned in the human grammar of reasons. Why? What did you see? What rule are you applying? What fact would change your mind? The clerk may answer badly; human judgment can be partial, inconsistent, and unfair. One reason rules exist is to restrain that danger.

But human authorship is at least visible. The person affected can often tell that someone made a judgment. They can ask whether the judgment was authorized, whether the rule was applied correctly, and whether the decision-maker misunderstood something.

Automated classification can make judgment disappear into infrastructure. The person at the desk may say, "The system says you are not eligible." The call-center representative may say, "I can only see the status." The notice may reproduce a code without explaining the pathway. The final decision still affects a human life, but its authorship has become distributed among policy designers, engineers, data sources, adopting agencies, reviewers, and model behavior that may not be directly legible even to the institution using it.

The confidence score deepens the problem. A number looks like humility; it seems to say that the system knows it might be wrong. In practice, it can give the institution a way to treat uncertainty as a reason for action. A score of 0.87 may be read as "high confidence," even if the person affected cannot know what population it was calibrated on, what error rate it carries for people like them, or whether it depends on a missing fact the system never asked for.

Precision is not the same as truth. A wrong category can be expressed with great precision. So can an incomplete one.

---

Explainability has to mean more than a technical artifact stored somewhere inside the vendor file.

For the institution, explainability means knowing enough about the system to govern it. What inputs mattered? Which sources supplied them? Which parts apply fixed rules and which apply statistical inference? What kinds of errors does the system make, for whom, and under what conditions? What is the difference between the model's confidence and the institution's legal or ethical confidence in acting on the result?

For the affected person, explainability means something more practical. It means receiving reasons in a form they can understand and use. Not "adverse action code 14." Not "risk score exceeds threshold." Not "insufficient documentation" when the person does not know which document mattered. A usable explanation identifies the fact, assumption, rule, or inference that drove the decision enough that a person can ask whether it is true.

An institution can possess a technical explanation and still provide no meaningful explanation to the person outside it. A model card or validation memo may help governance without telling a denied applicant why the system treated their household as ineligible. Conversely, a simple notice may help the person without revealing patterned errors across many cases. Both forms are needed. One governs the machine. The other opens the decision to contradiction.

The European Union's General Data Protection Regulation frames part of this issue through safeguards attached to certain solely automated decisions with legal or similarly significant effects: human intervention, the ability to express one's point of view, and the ability to contest the decision.[^c10-gdpr] Article 22(3) does not, by itself, create a universal right to explanation. The wider institutional principle is that a consequential automated category must not become final before the person has a meaningful way to say what it missed.

Explainability without contradictability is only narration. It tells a person why the institution thinks it is right without telling them what would make the institution change course.

---

A decision is contradictable when the institution has named the kinds of evidence, correction, or argument that can defeat the initial classification. This is not the same as allowing someone to complain. Complaint is expression. Contradiction is a designed relationship between counter-evidence and decision authority.

If a benefits screen classifies a person as over the income threshold, contradictability means the person can identify the income source counted, correct whether it belongs to the current household, submit evidence of a change, and receive a decision from someone authorized to revise the category. If a fraud model flags a claim, the institution must say what kind of benign explanation would matter. If a medical-necessity tool recommends denial, the treating clinician must be able to supply case-specific facts that change the assumption.

Contradictability requires more than a final appeal. It has to be built into the ordinary path of decision. The person must know where to send the correction. The correction must reach a place where it can alter the relevant data or assumption. The institution must preserve a record of what was corrected so the same error does not reappear at the next renewal, claim, or review. Otherwise the appeal becomes a temporary exception to an error-producing system, and the person has to defeat the same mistake repeatedly.

That repetition is one of the common signs of uncorrectability. A person proves that the address is wrong, and the next notice goes to the wrong address again. A person proves that two files were merged, and the next eligibility check merges them again. A person proves that the treatment is not elective in their case, and the next authorization request begins from the same generic assumption. The institution experiences each correction as a one-off. The person experiences the institution as incapable of learning.

Correctability design has to distinguish between correcting the outcome and correcting the source. Changing this denial to an approval may be necessary. It is not sufficient if the mistaken data, proxy, threshold, or assumption remains untouched. A category that can be reversed for one person but not repaired for the next one is still an institutional design problem.

---

Human reconsideration is not a decorative humane gesture. It is an architectural requirement for certain kinds of decisions.

Not every automated classification requires the same review. Institutions classify constantly. A spam filter, a routing tool, a duplicate-record suggestion, a queue priority, and a final denial of housing, care, employment, liberty, education, or public support do not carry the same stakes. The entitlement to human reconsideration should be proportional to the consequence, the uncertainty, the reversibility of harm, and the person's ability to protect themselves elsewhere.

Where the consequence is serious, the human reviewer must possess real authority. A reviewer who can only confirm that the model ran correctly is not reconsidering the decision. A reviewer who is measured primarily on alignment with the model's recommendation is not independent of it. A reviewer who lacks access to the underlying information, cannot request additional facts, cannot override the recommendation, cannot repair the data, and cannot send the case back for system-level correction is performing a ritual of review.

Many systems preserve the form of judgment while removing its substance. The final screen asks a worker to click approve or deny. Departures require explanation. Departing creates work, scrutiny, or risk. The model has no formal authority, yet practical authority sits with it. Human review becomes a liability transfer without giving the reviewer the power required to make the transfer honest.

Real authority has several marks. The reviewer can ask for missing information, receive the person's account in a form not already anticipated by the system's fields, identify when the model's category is inapplicable, decide against the recommendation without treating departure as misconduct, record why the case exposed a system problem, and send that record to someone responsible for patterns.

The reviewer does not have to be free to do anything. That would recreate the danger rules were designed to prevent. Human reconsideration also needs guardrails: comparable-case checks, written reasons, conflict rules, supervisory review for unusual departures, and data on patterned bias. The point is not to replace machine opacity with local arbitrariness. It is to make judgment accountable enough to protect the person whom the automated category has misunderstood.

---

Review capacity has to be proportional to classification capacity.

This sentence sounds administrative. It is one of the central protections. When an institution expands automated classification, it expands the number of people who can be placed into consequential categories. If reconsideration remains obscure, understaffed, linguistically inaccessible, legally intimidating, or practically unreachable, automation has changed the balance of power even if the formal appeal right remains unchanged.

Not every first decision should receive full human review. But people for whom the category matters need a review path matched to the seriousness and distribution of the decision.

Matched capacity includes ordinary details that determine whether a right exists in practice. Notices must reach people. Deadlines must allow evidence gathering. Translation and disability access must be part of the path, not favors added after failure. Reviewers must understand the subject matter. The institution must monitor whether certain groups appeal less often, lose more often, or disappear because the path is too difficult to enter.

Matched capacity also requires escalation from individual error to system learning. If reviewers repeatedly overturn one kind of classification, the model, rule, data source, or threshold has to be examined. Otherwise review becomes a pressure valve rather than a learning mechanism. It may prevent the worst outcome for the person who reaches it. It does not keep the machine from producing the same pressure tomorrow.

The National Institute of Standards and Technology's AI Risk Management Framework treats AI risk as a lifecycle governance problem, not a one-time validation exercise.[^c10-nist] That matters because reconsideration is one way an institution learns whether its categories still fit the world they classify.

---

The system also has to preserve uncertainty.

Many institutional systems prefer binaries because binaries move cleanly through workflows. Eligible or ineligible. Fraud or no fraud. Approve or deny. A binary is not always wrong; institutions often need a decision. But an automated system can make a binary feel more settled than it is.

A model may be uncertain because the data is incomplete, the case is rare, the person belongs to a group poorly represented in training data, the relevant fact is not in the database, the policy question was converted into a proxy, or the model is being asked to classify something it should not classify. Collapsing all of these into deny, approve, flag, or clear hides the reason for uncertainty.

A correctable institution needs categories for uncertainty itself. Not enough information. Conflicting data. Outside validated scope. Human facts required. Policy ambiguity. Model not applicable. These are not signs of weakness. They are signs that the institution knows the difference between a case that fits the category and a case the category has not yet understood.

Preserving uncertainty also protects rules. If every uncertain case becomes a discretionary exception, review will drift toward favoritism or inconsistency. If every uncertain case becomes a binary automated answer, the institution will mistake decisiveness for fairness. The better design makes uncertainty visible, routes it according to rule-governed criteria, and records what was learned when a person supplied the fact the system lacked.

The machine's category can help an institution notice patterns no individual worker could see. It can reduce some forms of inconsistent treatment. It can identify cases that deserve attention. It can make certain decisions more uniform and auditable. Those are real protections. The danger is not classification itself. The danger is a category that becomes unanswerable.

The screen still shows three fields.

Classification: ineligible.

Confidence: 0.87.

Recommended action: deny.

The number looks precise. The category looks settled. The recommended action waits for a click.

But somewhere in the system there has to be another field, even if it is not on that first screen. A place for the person to say: this is not my household; that code is old; the treatment is different; the rule has mistaken me for someone I am not.

The confidence score looks precise. The person still needs a place to write what the model did not ask.

[^c10-gdpr]: Regulation (EU) 2016/679, General Data Protection Regulation, Article 22(3), provides that, for decisions covered by Article 22, the data controller shall implement suitable measures including "at least the right to obtain human intervention on the part of the controller, to express his or her point of view and to contest the decision," https://eur-lex.europa.eu/eli/reg/2016/679/oj. The provision applies to certain solely automated decisions; it does not by itself establish a general right to explanation.

[^c10-nist]: National Institute of Standards and Technology, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)* (2023), https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf.
