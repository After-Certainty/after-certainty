/**
 * Representative search-quality fixtures for Phase B+ ranking tests.
 * See docs/roadmaps/global-search-plan.md §16.2.
 *
 * `acceptableTopIds`: any of these as the #1 hit is a pass.
 * `mustIncludeInTop`: all listed ids must appear within the first `n` hits.
 * Soft fixtures (`required: false`) document thematic gaps without failing CI.
 */

export type SearchRankingFixture = {
  id: string;
  query: string;
  acceptableTopIds?: string[];
  mustIncludeInTop?: { ids: string[]; n: number };
  expectEmpty?: boolean;
  /** When false, failures are reported as soft skips in tests. Default true. */
  required?: boolean;
  note?: string;
};

export const SEARCH_RANKING_FIXTURES: SearchRankingFixture[] = [
  {
    id: "exact-concept-certainty",
    query: "certainty",
    acceptableTopIds: ["concept-certainty"],
  },
  {
    id: "exact-book-trust-beyond-similarity",
    query: "Trust Beyond Similarity",
    acceptableTopIds: ["book-trust-beyond-similarity"],
  },
  {
    id: "edition-title-wolty",
    query: "When Others Look to You",
    acceptableTopIds: ["book-when-others-look-to-you-v1"],
    mustIncludeInTop: {
      ids: ["book-when-others-look-to-you-v1", "book-when-others-look-to-you-v2"],
      n: 5,
    },
    note: "Canonical v1 should rank above superseded v2 for the shared title",
  },
  {
    id: "slug-alias-wolty",
    query: "when-others-look-to-you",
    acceptableTopIds: ["book-when-others-look-to-you-v1"],
  },
  {
    id: "pattern-exceptions",
    query: "Exceptions Are Forever",
    acceptableTopIds: ["pattern-exceptions-are-forever"],
  },
  {
    id: "person-rebecca-solnit",
    query: "Rebecca Solnit",
    acceptableTopIds: ["thinker-rebecca-solnit"],
  },
  {
    id: "person-simone-biles",
    query: "Simone Biles",
    expectEmpty: true,
    note: "Not in the current corpus — honest no-result",
  },
  {
    id: "person-john-dewey",
    query: "John Dewey",
    acceptableTopIds: ["thinker-john-dewey"],
  },
  {
    id: "concept-moral-licensing",
    query: "moral licensing",
    required: false,
    expectEmpty: true,
    note: "No dedicated concept in bundled manifest yet — keep soft until authored",
  },
  {
    id: "concept-scoreboard",
    query: "scoreboard",
    required: false,
    expectEmpty: true,
    note: "No dedicated concept in bundled manifest yet — keep soft until authored",
  },
  {
    id: "thematic-accountability",
    query: "accountability",
    acceptableTopIds: ["concept-accountability"],
  },
  {
    id: "nl-temporary-exceptions",
    query: "temporary exceptions becoming permanent",
    acceptableTopIds: ["pattern-exceptions-are-forever"],
  },
  {
    id: "nl-collaboration-fail",
    query: "Why does collaboration fail?",
    acceptableTopIds: ["book-why-collaboration-is-so-hard"],
    mustIncludeInTop: {
      ids: [
        "book-why-collaboration-is-so-hard",
        "pattern-learning-collapses",
        "pattern-disagreement-is-suppressed",
      ],
      n: 10,
    },
    note: "Related bridges surface the collaboration book and adjacent patterns without synonym collapse",
  },
  {
    id: "nl-trust-disagreement",
    query: "trust and disagreement",
    mustIncludeInTop: {
      ids: ["book-trust-beyond-similarity", "concept-trust", "pattern-disagreement-is-suppressed"],
      n: 10,
    },
    note: "Multi-token thematic query bridged by authored related phrases",
  },
  {
    id: "nl-books-authority",
    query: "authority",
    mustIncludeInTop: {
      ids: ["concept-authority", "book-when-authority-is-misread"],
      n: 10,
    },
  },
  {
    id: "misspelling-accountability",
    query: "acountability",
    acceptableTopIds: ["concept-accountability"],
  },
  {
    id: "acronym-wolty",
    query: "wolty",
    acceptableTopIds: ["book-when-others-look-to-you-v1"],
  },
  {
    id: "draft-observer-patterns",
    query: "observer patterns",
    acceptableTopIds: ["book-observer-patterns", "catalog:observer-patterns"],
  },
  {
    id: "no-result-sentinel",
    query: "xyzzy-no-such-term-12345",
    expectEmpty: true,
  },
  {
    id: "partial-dewey",
    query: "Dewey",
    acceptableTopIds: ["thinker-john-dewey"],
  },
  {
    id: "podcast-or-book-how-meaning-moves",
    query: "How Meaning Moves",
    mustIncludeInTop: {
      ids: ["book-how-meaning-moves", "podcast:how-meaning-moves"],
      n: 5,
    },
  },
  {
    id: "related-bridge-temporary-rules",
    query: "temporary rules",
    acceptableTopIds: ["pattern-exceptions-are-forever"],
    mustIncludeInTop: {
      ids: ["pattern-exceptions-are-forever"],
      n: 5,
    },
  },
];
