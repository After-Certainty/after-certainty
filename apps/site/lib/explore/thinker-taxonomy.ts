import type { ThinkerType } from "@/types/semanticGraph";

/** Display labels for thinker type facets and eyebrows. */
export const THINKER_TYPE_LABELS: Record<ThinkerType, string> = {
  person: "Person",
  organization: "Organization",
  author_group: "Author group",
  collective: "Collective",
};

export function thinkerTypeLabel(type: ThinkerType): string {
  return THINKER_TYPE_LABELS[type] ?? "Person";
}

/** Stable facet order for filter chrome. */
export const THINKER_TYPE_FACET_ORDER: readonly ThinkerType[] = [
  "person",
  "organization",
  "author_group",
  "collective",
];
