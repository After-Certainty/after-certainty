export type SmokeUrl = {
  path: string;
  label: string;
};

/** Top-level marketing and explore index pages. */
export const topLevelSmokeUrls: SmokeUrl[] = [
  { path: "/", label: "Home" },
  { path: "/start", label: "Start" },
  { path: "/explore", label: "Explore" },
  { path: "/explore/concepts", label: "Concepts index" },
  { path: "/explore/patterns", label: "Patterns index" },
  { path: "/explore/situations", label: "Situations index" },
  { path: "/explore/books", label: "Books index" },
  { path: "/explore/thinkers", label: "Thinkers index" },
  { path: "/explore/sources", label: "Sources index" },
  { path: "/search", label: "Search" },
  { path: "/podcast", label: "Podcast" },
  { path: "/collaborators", label: "Collaborators" },
  { path: "/about", label: "About" },
];

/** Sample entity detail pages — stable slugs from bundled manifests. */
export const contentSmokeUrls: SmokeUrl[] = [
  { path: "/explore/books/after-certainty", label: "Book: After Certainty" },
  { path: "/explore/books/how-meaning-moves", label: "Book: How Meaning Moves" },
  { path: "/explore/thinkers/john-dewey", label: "Thinker: John Dewey" },
  { path: "/explore/concepts/certainty", label: "Concept: Certainty" },
  { path: "/explore/concepts/abstraction", label: "Concept: Abstraction" },
  { path: "/explore/patterns/attention-finds-a-focus", label: "Pattern: Attention Finds a Focus" },
  {
    path: "/explore/situations/temporary-fixes-become-permanent",
    label: "Situation: Temporary fixes becoming permanent",
  },
  {
    path: "/explore/sources/agamben-giorgio-state-of-exception",
    label: "Source: Agamben — State of Exception",
  },
];

export const smokeUrls: SmokeUrl[] = [...topLevelSmokeUrls, ...contentSmokeUrls];
