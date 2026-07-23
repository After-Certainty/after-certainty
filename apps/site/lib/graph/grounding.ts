import { explorePaths } from "@/lib/graph/explorePaths";
import type { SemanticGrounding, SemanticGraph } from "@/types/semanticGraph";

export type PublicGroundingLabel =
  | "Original synthesis"
  | "Adapted from source"
  | "Established term"
  | "Composite pattern"
  | "Manuscript-specific";

export type PublicGroundingViewModel = {
  label: PublicGroundingLabel;
  description: string;
  supportingWorks: { slug: string; title: string; href: string }[];
  supportingSources: { slug: string; title: string; href: string; external?: boolean }[];
  note?: string;
};

const GROUNDING_COPY: Record<string, { label: PublicGroundingLabel; description: string }> = {
  original_synthesis: {
    label: "Original synthesis",
    description:
      "An original After Certainty synthesis developed across works and supporting sources.",
  },
  adapted_from_source: {
    label: "Adapted from source",
    description: "Adapted and extended from an existing framework.",
  },
  established_term: {
    label: "Established term",
    description: "An established term used here in its recognized sense.",
  },
  composite_pattern: {
    label: "Composite pattern",
    description: "A composite pattern drawing together several related ideas.",
  },
  manuscript_specific: {
    label: "Manuscript-specific",
    description: "Developed primarily within this work’s argument.",
  },
};

const MAX_SUPPORTING = 4;

/**
 * Translate internal grounding into restrained public language.
 * Unknown types return null (fail closed — no empty UI).
 */
export function buildPublicGroundingViewModel(
  grounding: SemanticGrounding | undefined,
  graph: SemanticGraph,
): PublicGroundingViewModel | null {
  if (!grounding?.type?.trim()) return null;
  const copy = GROUNDING_COPY[grounding.type];
  if (!copy) return null;

  const booksBySlug = new Map(graph.books.map((b) => [b.slug, b]));
  const sourcesBySlug = new Map(graph.sources.map((s) => [s.slug, s]));

  const supportingWorks: PublicGroundingViewModel["supportingWorks"] = [];
  const supportingSources: PublicGroundingViewModel["supportingSources"] = [];

  for (const ref of grounding.developedFrom ?? []) {
    if (supportingWorks.length + supportingSources.length >= MAX_SUPPORTING) break;
    if (ref.work) {
      const book = booksBySlug.get(ref.work);
      if (!book) continue;
      supportingWorks.push({
        slug: book.slug,
        title: book.title,
        href: `${explorePaths.books}/${book.slug}`,
      });
      continue;
    }
    if (ref.source) {
      const source = sourcesBySlug.get(ref.source);
      if (!source) continue;
      const external = Boolean(source.url);
      supportingSources.push({
        slug: source.slug,
        title: source.title ?? source.name,
        href: external ? source.url! : `${explorePaths.sources}/${source.slug}`,
        external,
      });
    }
  }

  const note = grounding.note?.trim() || undefined;

  return {
    label: copy.label,
    description: copy.description,
    supportingWorks,
    supportingSources,
    note,
  };
}
