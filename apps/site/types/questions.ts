export type QuestionStatus = "draft" | "published" | "archived";

export type PathEntityType =
  | "book"
  | "concept"
  | "pattern"
  | "situation"
  | "thinker"
  | "source"
  | "podcast_episode"
  | "external";

export type PathStopInput = {
  position: number;
  entityType: PathEntityType;
  entityId?: string;
  bookSlug?: string;
  externalUrl?: string;
  titleOverride?: string;
  description: string;
  whyThisFollows?: string;
  estimatedMinutes?: number;
  optional?: boolean;
  excerpt?: string;
  fictionDoorway?: boolean;
};

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
  pathStops: PathStopInput[];
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

export type EnrichedPathStop = PathStopInput & {
  resolvedEntityId: string;
  title: string;
  href: string;
  external: boolean;
  entityTypeLabel: string;
  estimatedMinutes: number;
};

export type EnrichedQuestion = QuestionDefinition & {
  pathStopsEnriched: EnrichedPathStop[];
  totalEstimatedMinutes: number;
  primaryBookTitle: string;
  primaryBookHref: string;
  primaryBookCover?: string;
};
