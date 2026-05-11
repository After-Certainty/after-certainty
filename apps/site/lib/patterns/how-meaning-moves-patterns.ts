import type { LibraryPattern } from "@/types/patterns-library";

const BOOK_SLUG = "how-meaning-moves";
const BOOK_TITLE = "How Meaning Moves";

/**
 * Appendix A — A Pattern Language of Meaning (five clusters: Formation, Completion,
 * Movement, Resolution, Reinforcement). Observation tools, not prescriptions.
 */
export const howMeaningMovesPatterns: LibraryPattern[] = [
  {
    id: `${BOOK_SLUG}::attention-finds-a-signal`,
    slug: "attention-finds-a-signal",
    title: "Attention Finds a Signal",
    summary: "What stands out first shapes what people notice next.",
    description:
      "What stands out first shapes what people notice next. Meaning begins along a pre-selected path before full language is considered. Later words are filtered through early signal.",
    excerpt:
      "In practice, attention finds a signal in the first cue, and that cue often decides the channel everything else travels through.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Formation"],
    relatedPatterns: ["meaning-forms-early", "meaning-outruns-the-words"],
  },
  {
    id: `${BOOK_SLUG}::meaning-forms-early`,
    slug: "meaning-forms-early",
    title: "Meaning Forms Early",
    summary: "Interpretation begins before language is fully processed.",
    description:
      "Interpretation begins before language is fully processed. A working story stabilizes quickly. New detail is interpreted through an already-forming frame.",
    excerpt:
      "Meaning forms early, so we often decide what is happening while we still think we are listening.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Formation"],
    relatedPatterns: ["gaps-invite-completion", "intent-gets-assigned"],
  },
  {
    id: `${BOOK_SLUG}::meaning-outruns-the-words`,
    slug: "meaning-outruns-the-words",
    title: "Meaning Outruns the Words",
    summary: "Language never carries all of the context, emotion, or intent around it.",
    description:
      "Language never carries all of the context, emotion, or intent around it. Listeners must infer missing structure. Interpretation depends on signal and prior narrative, not words alone.",
    excerpt: "Meaning outruns the words: a line can be precise in grammar and still short on life.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Formation"],
    relatedPatterns: ["attention-finds-a-signal", "gaps-invite-completion"],
  },
  {
    id: `${BOOK_SLUG}::gaps-invite-completion`,
    slug: "gaps-invite-completion",
    title: "Gaps Invite Completion",
    summary: "Missing meaning rarely stays open for long.",
    description:
      "Missing meaning rarely stays open for long. Unstated assumptions become operational truth. People react to inferred meaning as if it were confirmed.",
    excerpt: "Because gaps invite completion, the mind usually supplies missing meaning before the speaker does.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Completion"],
    relatedPatterns: ["meaning-forms-early", "intent-gets-assigned"],
  },
  {
    id: `${BOOK_SLUG}::intent-gets-assigned`,
    slug: "intent-gets-assigned",
    title: "Intent Gets Assigned",
    summary: "People infer motive before certainty is possible.",
    description:
      "People infer motive before certainty is possible. Conversations shift from shared inquiry to motive management. Correction feels personal because intent already feels settled.",
    excerpt: "Intent gets assigned in the same instant impact is noticed.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Completion"],
    relatedPatterns: ["gaps-invite-completion", "meaning-gets-distorted"],
  },
  {
    id: `${BOOK_SLUG}::meaning-shifts-under-pressure`,
    slug: "meaning-shifts-under-pressure",
    title: "Meaning Shifts Under Pressure",
    summary: "Urgency, conflict, and consequence accelerate interpretation.",
    description:
      "Urgency, conflict, and consequence accelerate interpretation. Nuance is traded for speed. Meaning stabilizes faster than correction can catch up.",
    excerpt: "Pressure shrinks the distance between what people notice and what they treat as settled.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Movement"],
    relatedPatterns: ["meaning-forms-early", "meaning-gets-distorted"],
  },
  {
    id: `${BOOK_SLUG}::meaning-drifts-over-time`,
    slug: "meaning-drifts-over-time",
    title: "Meaning Drifts Over Time",
    summary: "Interpretation slowly changes as memory, context, and repetition accumulate.",
    description:
      "Interpretation slowly changes as memory, context, and repetition accumulate. The same event is re-read through evolving frames. Disagreement can grow even without new facts.",
    excerpt: "Meaning drifts over time and rarely stays where it first landed.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Movement"],
    relatedPatterns: ["meaning-outruns-the-words", "meaning-reinforces-itself"],
  },
  {
    id: `${BOOK_SLUG}::contact-keeps-the-read-open`,
    slug: "contact-keeps-the-read-open",
    title: "Contact Keeps the Read Open",
    summary: "Additional context can sharpen understanding without fully resolving it.",
    description:
      "Additional context can sharpen understanding without fully resolving it. Interpretation becomes more precise and less reactive. People can continue without pretending complete certainty.",
    excerpt:
      "Contact keeps the read open when understanding tightens without the story having to close.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Resolution"],
    relatedPatterns: ["meaning-outruns-the-words", "meaning-gets-distorted"],
  },
  {
    id: `${BOOK_SLUG}::meaning-gets-distorted`,
    slug: "meaning-gets-distorted",
    title: "Meaning Gets Distorted",
    summary: "Interpretation can harden in ways that no longer track reality.",
    description:
      "Interpretation can harden in ways that no longer track reality. Correction is experienced as threat rather than update. Communication continues while shared reality shrinks.",
    excerpt: "Meaning gets distorted when certainty outlives contact with what was actually said.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Resolution"],
    relatedPatterns: ["intent-gets-assigned", "meaning-reinforces-itself"],
  },
  {
    id: `${BOOK_SLUG}::meaning-reinforces-itself`,
    slug: "meaning-reinforces-itself",
    title: "Meaning Reinforces Itself",
    summary: "Once established, interpretation begins shaping future interpretation.",
    description:
      "Once established, interpretation begins shaping future interpretation. Meaning self-stabilizes, even when reality has shifted. Interpretive loops become harder to interrupt without deliberate restraint.",
    excerpt: "Meaning reinforces itself when what we conclude once becomes what we are prepared to see again.",
    bookSlug: BOOK_SLUG,
    bookTitle: BOOK_TITLE,
    themes: ["Reinforcement"],
    relatedPatterns: ["meaning-shifts-under-pressure", "meaning-gets-distorted"],
  },
];
