import type { LibraryPattern } from "@/types/patterns-library";

export { howMeaningMovesPatterns } from "@/lib/patterns/how-meaning-moves-patterns";

/** Draft observational lenses — extend when Observer Patterns manuscript indexes land */
export const observerPatternsPlaceholders: LibraryPattern[] = [
  {
    id: "observer-patterns::institutional-blind-spots",
    slug: "institutional-blind-spots",
    title: "Institutional Blind Spots",
    summary: "Organizations optimize what they measure—and learn not to see what they don’t.",
    description:
      "Attention budgets are finite. What falls outside dashboards, deadlines, and incentives often stops registering—even when people privately worry about it.",
    bookSlug: "observer-patterns",
    bookTitle: "Observer Patterns",
    themes: ["Institutions", "Attention", "Systems"],
    excerpt: "Silence is also a signal—about what the institution cannot afford to hear.",
  },
  {
    id: "observer-patterns::signal-latency",
    slug: "signal-latency",
    title: "Signal Latency",
    summary: "Feedback arrives after commitments have already hardened.",
    description:
      "By the time discomfort surfaces in metrics or meetings, earlier choices have already shaped budgets, habits, and reputations—making reversal costly.",
    bookSlug: "observer-patterns",
    bookTitle: "Observer Patterns",
    themes: ["Systems", "Time", "Coordination"],
  },
];
