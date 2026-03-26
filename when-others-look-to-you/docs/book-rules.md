# **Writing Style Directive — Book 1 (Revised Edition)**

## **Core Tone**

This book must be written in calm, universal, structurally precise
language.

It should feel:

- Observational, not preachy.

- Serious, not dramatic.

- Clear, not academic.

- Human, not technical.

- Durable, not trendy.

The reader should feel capable, not instructed.

The writing should never sound like a manifesto, a management blog, or a
social media thread.

## **Opening Definition (Anchor Sentence)**

This definition must remain intact in tone and clarity:

> A leader is someone others look to when deciding what to do next.

All subsequent material must remain consistent with this universal
framing.

## **Book Scope and File Structure**

### **Manuscript Layout**

- The manuscript is organized into front matter, three parts, and back matter.

- Each chapter must live in its own markdown file.

- Each part must include its own bridge file.

- `index.md` is the manuscript hub and must link to all front matter files, part bridges, chapter files, and back matter files.

### **Front Matter and Back Matter Files**

- Each front matter section must be in its own markdown file (for example: Author's Note, Preface, Typographical Conventions, Introduction, Prologue, Copyright).

- Each back matter section must be in its own markdown file (for example: Epilogue, Bibliography, Notes).

- Front/back matter files should be scaffolds during structure setup; full prose is drafted later in sequence.

### **Part and Chapter Grouping**

- Chapters must be grouped under part directories.

- Each part directory must contain:
  - One bridge file.
  - The chapter files assigned to that part.

- Bridge files should frame the transition between parts without pre-drafting full chapter prose.

## **Inspirational Materials and Lineage**

This book should be substantially informed by:

- Hannah Arendt (authority, responsibility, action, judgment under plurality).

- Max Weber (authority forms, legitimacy, institutional structure, social order).

- Alistair Cockburn's writing on Guest Leadership, especially "How to Step Up Stepping Up: Promoting Guest Leadership for Successful Collaboration" (Cutter): https://www.cutter.com/article/how-step-stepping-promoting-guest-leadership-successful-collaboration-494516.

- Alistair Cockburn's plain, direct style in *Heart of Agile* (book page): https://heartofagile.com/book/.

### **Source Use Rule**

- Use Arendt and Weber primarily for conceptual scaffolding, not for dense academic voice.

- Explain concepts in ordinary language first, then connect them to lineage where helpful.

- Favor structural translation over quotation density.

- Keep references accurate but readable; the goal is illumination, not display.

### **Style Translation Rule**

- Keep sentences simple and durable, even when concepts are philosophically heavy.

- Prefer universal human situations before abstract terminology.

- Avoid sounding like a scholarly commentary on Arendt or Weber.

- Keep the cadence practical and clean in the spirit of Cockburn's writing.

### **Originality and Non-Imitation Guardrail**

- These sources are for style and conceptual inspiration, not for reusable wording, structure, or proprietary framing.

- Do not copy distinctive labels, taxonomies, or named frameworks from source authors unless explicitly quoted and cited.

- Specifically, do not reuse Cockburn's "Leader 0, Leader 1, Leader 2, Leader 3" schema in this manuscript.

- Do not mirror source sentence sequences or example chains closely enough to appear derivative.

- If a passage feels too close to a source, rewrite from first principles in this book's own vocabulary.

## **Sentence & Paragraph Structure Rules**

### **Sentence Discipline**

- Prefer short declarative sentences.

- Use medium-length sentences intentionally to add rhythm.

- Avoid multi-clause academic constructions.

- Avoid rhetorical flourish.

- Avoid sarcasm or irony.

- Avoid dramatic metaphors.

Clarity before cleverness.

### **Paragraph Grouping Rules**

- Avoid stacking single-sentence paragraphs unless emphasis is
  structurally necessary.

- Group related short sentences into cohesive paragraphs.

- Allow paragraphs to develop a thought before breaking.

- Use paragraph breaks to signal conceptual shift, not dramatic effect.

- Avoid visual fragmentation that resembles a manifesto or sermon.

- Prefer fuller paragraphs over line-by-line emphasis, especially in front and back matter.

- Even scene-based openings should favor coherent paragraph flow over sentence-by-sentence staccato, unless a brief staccato beat is structurally necessary.

- Avoid repeating the same sentence opener three or more times in a row unless deliberate repetition is structurally essential.

- When adjacent short sentences can be merged without losing clarity, prefer consolidation.

- Selective bulleted lists are allowed when they materially improve scanability (for example, short sets of examples, contrasts, or structural options), but should not replace sustained prose as the default mode.

Prose should feel breathable but grounded — not staccato.

### **Rhythm Guidance**

- Alternate short and medium sentences naturally.

- Let emphasis emerge from structure, not formatting.

- Do not manufacture gravity through spacing.

- Read scene and argument passages aloud during revision; if they sound like line-by-line emphasis rather than sustained prose, rewrite into fuller paragraph flow.

If removing a line break strengthens coherence, remove it.

### **Sub-Heading Discipline**

- Use clear sub-headings to separate major conceptual moves within chapters and long front matter sections.

- Sub-headings should improve navigation and structural clarity, not add decorative language.

- Keep sub-heading wording concise, literal, and consistent with the chapter's core terms.

- Add a new sub-heading only when the argument shifts meaningfully.

- Avoid heading density that fragments prose into isolated fragments.

### **Chapter-End Pull-Quote Convention**

- Each chapter should end with a pull-quote.

- Pull-quotes should be concise and structural, not rhetorical decoration.

- Pull-quotes should compress the chapter's core takeaway in plain language.

- Do not use bold formatting inside pull-quotes.

- Pull-quotes must match the chapter's actual evidence posture; avoid
  absolute claims unless the chapter explicitly justifies that confidence.

- Prefer calibrated wording in pull-quotes (for example: "often," "can,"
  "tends to") when claims are pattern-level rather than universal.

### **Vignette Convention**

- Vignettes are optional and should be used selectively to make abstract claims concrete.

- Start each vignette with a literal sub-heading in this format:
  `### **<short title>**`.

- Do not include the word "Vignette" in the sub-heading; rely on typography
  (heading plus blockquote scene text) for visual distinction.

- Vignette scene text should be wrapped in a custom-style block so it is
  visually distinct from analytical prose:
  `::: {custom-style="Vignette Block"}` ... `:::`.

- Keep the sub-heading outside the custom-style block; only scene text
  should appear inside the vignette block.

- Keep vignettes concise (typically 1-3 short paragraphs) and avoid turning them into standalone mini-chapters.

- Immediately after each vignette, return to normal prose and tie the scene back to the active structural claim.

- Domain-specific language is allowed inside vignette scene text when it
  improves realism and clarity.

- Outside vignette scene blocks, default to domain-agnostic wording so
  claims travel across contexts (for example: family, civic, religious,
  political, organizational).

- If domain-specific terms are used in non-vignette prose, use them only
  when the chapter's claim depends on that domain and name that dependency
  clearly.

- Domain-specific language is also allowed in clearly signposted
  concrete-example passages (for example, short runs of illustrative
  examples) when domain realism materially improves comprehension.

- Vignette domains must be intentionally diverse across the manuscript; avoid repeating the same domain for multiple vignettes unless the repetition is structurally necessary.

- If a domain is reused, include a brief drafting note in `docs/status.md` explaining why reuse clarifies a distinct concept rather than repeating an example pattern.

- Prefer domain spread that improves conceptual clarity (for example: family/household, healthcare, education, civic/government, military, software/product teams, manufacturing/operations, faith/community organizations).

- Use each vignette to illuminate a different structural mechanism, not just a different storyline in the same domain.

## **Vocabulary Constraints**

Avoid:

- Excessive academic jargon.

- Overly technical political theory language.

- Trend-driven management language.

- Inflated moral language.

- Absolutist claims.

Prefer:

- Common, durable words.

- Structurally precise but accessible phrasing.

- Concrete examples before abstraction.

### **Domain-Language Guardrail**

- Keep analytic prose domain-agnostic by default.

- Prefer universal role language in analytic prose (for example: "people
  affected by the decision," "those closest to the consequences,"
  "those making the decision") over domain-bound terms when no specific
  domain is required.

- Avoid business-specific shorthand in analytic prose unless the section
  is explicitly business-specific and that specificity is necessary to the
  claim.

- Exception: in concrete-example passages, domain-specific wording is
  acceptable when it clarifies the point faster than a domain-agnostic
  substitute and does not overtake the chapter's overall universality.

- Exception (protected illustrative run): a brief, intentionally
  mixed-domain or domain-leaning example sequence in non-vignette prose is
  allowed when it is clearly functioning as illustration rather than
  analytic argument.

- If a concrete-example run is intentionally preserved for voice, rhythm,
  or recognizability (for example: "A quarter closes strong. A campaign
  lands. A crisis appears contained."), treat it as protected wording and
  do not rewrite it in later audits unless the author explicitly requests a
  change.

- Outside vignette and clearly signposted concrete-example passages,
  domain-heavy shorthand should be treated as a rewrite trigger, not a
  stylistic preference.

- During audit, any domain-heavy term found in non-vignette prose must be
  dispositioned as either:
  - Keep-Protected-Example (author-approved illustrative wording),
  - Keep (justified by chapter-specific dependency), or
  - Rewrite (replace with domain-agnostic wording).

- If "Keep" is chosen, include a one-line rationale in the section audit
  summary before approval.

### **Book-Identity Terminology Guardrail**

- When referring to this book's method, use "lens" (or "lenses"), not "framework."

- "Framework" may be used for external theories, cited models, or source materials, but not as the identity label for this manuscript.

If a concept is complex, define it in plain language first.

## **Concept Introduction Pattern**

When introducing a technical concept (e.g., outcome bias, structural
blindness, authority circulation):

1.  Begin with a simple human observation.

2.  Describe a recognizable situation.

3.  Only then name the concept.

4.  Define it in one clean sentence.

5.  Expand structurally.

6.  Introduce taxonomy only when necessary.

Never lead with taxonomy.

## **Moral Posture Constraint**

The book must:

- Resist labeling leaders as good or bad.

- Avoid moral superiority.

- Avoid a tone of correction.

- Avoid partisan implication.

The book analyzes structure, not people.

### **Renewal/Erosion Neutrality Guardrail**

- Treat renewal and erosion as structural descriptors, not moral verdicts.

- Do not equate renewal with moral goodness or erosion with moral evil.

- Prefer structural wording (for example: "more revisable," "more
  insulated," "more one-directional," "more open to correction") over
  moralized shorthand (for example: "healthier," "better people,"
  "worse people") when describing renewal/erosion dynamics.

- In plain-language revisions, preserve neutrality: simplify wording
  without converting structural claims into moral praise or blame.

### **Renewal/Erosion Canonical Lexicon**

- Use renewal/erosion as umbrella directions.

- Use these two capacities when precision is needed:
  - **Scalability**: can coordinated action grow in reach?
  - **Adaptability**: can coordinated action change direction when reality
    pushes back?

- Use these four state terms for directional classification:
  - **Regenerative**: high scalability, high adaptability
  - **Adaptive**: lower scalability, high adaptability
  - **Entrenched**: high scalability, low adaptability
  - **Stalled**: low scalability, low adaptability

- Prefer capacity words when discussing one dimension only; prefer state
  words when both dimensions are implied.

## **Universality Constraint**

All arguments must survive:

- Different political ideologies.

- Different religious systems.

- Secular worldviews.

- Cross-cultural contexts.

- Institutional and family settings.

- Even cross-species analogies where appropriate.

If a sentence only resonates inside one worldview, revise it.

## **Authority Treatment**

Never assume:

- Leaders are malicious.

- Leaders are heroic.

- Intent determines morality.

- Outcomes determine legitimacy.

Focus on structural dynamics under attention.

## **Emotional Register**

The book should feel:

- Grounded.

- Slightly sobering.

- Intellectually honest.

- Calm under uncertainty

Never anxious.

Never triumphant.

Never alarmist.

## **Example Usage**

Use small human-scale examples before escalating to institutional scale:

- A parent.

- A meeting.

- A congregation.

- A team.

- A friend.

- A pack of animals.

Examples should anchor abstraction.

## **Structural Discipline**

All chapters must relate back to:

- Attention.

- Influence.

- Harm allocation.

- Revision or insulation.

- Renewal or erosion.

No conceptual drift.

### **Structural Throughline (Non-Back-Matter Rule)**

The manuscript's governing throughline is:

Attention → Influence → Structure → Renewal or Erosion

This throughline is a rule constraint, not a back matter section.

## **Guardrail Against Inflation**

Before finalizing any section, ask:

- Does this sound like I’m trying to impress?

- Does this sound like I’m trying to persuade?

- Does this sound defensive?

- Does this sound urgent?

- Am I using spacing to simulate importance?

If yes, simplify.

## **Final Litmus Test**

The writing should feel like:

A careful person thinking in public.

Not a person trying to win.

## **Front Matter Rules**

### **Front Matter Depth**

- Front matter sections (for example: Author's Note, Preface, Introduction, Typographical Conventions, Prologue) must be substantive drafts, not placeholder blurbs.

- Each front matter section should clearly perform its distinct role in the reading sequence.

- Use clear sub-headings when needed to improve navigation and reduce compressed prose.

- Copyright/legal sections are exempt from depth expectations.

### **Front Matter Scope Discipline**

- Front matter should orient the reader to framing and method, not front-load full argument density.

- Keep framing durable and non-promotional.

- Avoid manifesto tone in prefatory sections.

- Favor sustained, literary paragraph flow over punchy, fragmented cadence.

### **Reader-Facing Language Guardrail (Front and Back Matter)**

- Front and back matter must read as book prose for readers, not internal process instructions.

- Do not include drafting metadata, workflow commands, or editorial control language in reader-facing text (for example: "next step," "draft in sequence," "if this section does not belong, remove it").

- Avoid AI-directed phrasing in manuscript prose (for example: "check," "validate," "run pass," "ensure compliance").

- Keep operational instructions in `docs/book-rules.md`, `docs/drafting-process.md`, and `docs/status.md` only.

### **Meta-Language Guardrail (Manuscript Prose)**

- In reader-facing manuscript prose, avoid meta/book-process wording such
  as "this chapter," "this section," "in this book," "draft," "workflow,"
  or "process" when making analytical claims.

- Prefer direct claim language over structural self-reference (for example:
  "Selective followership matters when judging effectiveness," not
  "Selective followership matters in this chapter.").

- Exception: explicit navigation/handoff lines and headings are allowed
  when they orient the reader between sections or chapters.

## **Footnote and Citation Rules**

### **Footnote Conventions**

- Use Pandoc/Markdown footnote syntax (`[^id]` in text with matching `[^id]:` note definitions).

- Use stable, chapter-scoped IDs in source (for example, `[^c1-attention-definition]`) rather than raw numeric IDs.

- Keep IDs unique within each chapter and semantically tied to the cited claim.

- Place citation markers after punctuation.

- No inline author-date citations in body text.

- Preserve output numbering for `.docx`/Kindle conversion by relying on renderer formatting, not numeric IDs in source.

- Citation density should be moderate: footnote major structural pivots and non-obvious claims, while allowing narrative paragraphs to breathe.

### **Footnote Style**

Footnotes must:

- Expand, not distract.

- Clarify nuance.

- Offer deeper reading where useful.

- Show calibrated confidence when evidence is partial.

Avoid:

- Clever asides.

- Argumentative tangents.

- Self-justification.

## **Back Matter Rules**

### **Required Back Matter**

- The manuscript must include `bibliography.md`.

- Add other back matter sections (for example: Epilogue, Notes) only when they add structural clarity.

### **Bibliography Integrity**

- Bibliography entries should be complete enough to trace source lineage during revision.

- Remove duplicate entries and normalize formatting before final manuscript finalization.

- If source details are pending verification, mark them explicitly during drafting and resolve before publication.

## **Copyright and Legal Rules**

- Maintain a dedicated copyright/legal section in front matter (for example, in `copyright.md` or equivalent front-matter location).

- Legal/copyright language should remain precise, minimal, and non-rhetorical.

- Ensure rights holder, publication year, edition/revision marker, and permissions language are present before release.

- Legal text should not be mixed into conceptual chapters unless structurally necessary.
