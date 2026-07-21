/** Editorial content-type labels — slug references only. */
export type ContentType = "nonfiction" | "fiction" | "handbook" | "essay_collection";

const CONTENT_TYPE_BY_SLUG: Readonly<Record<string, ContentType>> = {
  "the-relay": "fiction",
  velorum: "fiction",
  "before-certainty-arrives": "fiction",
  "living-in-sediment": "fiction",
  "how-serious-systems-learn": "handbook",
  "the-discipline-of-uncertainty": "handbook",
};

/** Editorial sort order for the default “Recommended” catalog sort. */
export const RECOMMENDED_RANK_SLUGS: readonly string[] = [
  "after-certainty",
  "curiosity-before-certainty",
  "trust-beyond-similarity",
  "what-we-cannot-see",
  "coupling",
  "how-serious-systems-learn",
  "when-others-look-to-you-v1",
  "the-relay",
  "everyone-knows-love",
  "how-trust-forms",
  "why-diversity-matters",
  "why-collaboration-is-so-hard",
  "the-discipline-of-uncertainty",
  "learning-to-see",
  "when-others-become-leaders",
];

export function contentTypeForSlug(slug: string): ContentType {
  return CONTENT_TYPE_BY_SLUG[slug] ?? "nonfiction";
}

export function recommendedRankForSlug(slug: string): number {
  const idx = RECOMMENDED_RANK_SLUGS.indexOf(slug);
  return idx >= 0 ? idx : RECOMMENDED_RANK_SLUGS.length + 1;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  nonfiction: "Nonfiction",
  fiction: "Fiction",
  handbook: "Handbook",
  essay_collection: "Essays",
};
