export type { PathEntityType, PathStopInput, EnrichedPathStop } from "@/types/paths";

export type QuestionStatus = "draft" | "published" | "archived";

export type QuestionDefinition = {
  id: string;
  slug: string;
  question: string;
  shortLabel?: string;
  summary: string;
  orientation: string;
  whatThisIsNot: string[];
  status: QuestionStatus;
  featured?: boolean;
  featuredRank?: number;
  families: string[];
  primaryBookId: string;
  relatedQuestionIds?: string[];
  pathStops: import("@/types/paths").PathStopInput[];
  closingReflection: string;
  carryForwardQuestion?: string;
  searchHints?: string[];
  createdDate?: string;
  updatedDate?: string;
  editorialOwner?: string;
  reviewNotes?: string;
};

export type QuestionSearchBridge = {
  terms: string[];
  questionIds: string[];
  note?: string;
};

export type QuestionsManifest = {
  manifestVersion: number;
  updatedAt?: string;
  questions: QuestionDefinition[];
  searchBridges?: QuestionSearchBridge[];
};

export type EnrichedQuestion = QuestionDefinition & {
  pathStopsEnriched: import("@/types/paths").EnrichedPathStop[];
  totalEstimatedMinutes: number;
  primaryBookTitle: string;
  primaryBookHref: string;
  primaryBookCover?: string;
};
