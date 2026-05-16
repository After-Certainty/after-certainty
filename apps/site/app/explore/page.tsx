import type { Metadata } from "next";
import { ExploreObservatory } from "@/components/explore/observatory/ExploreObservatory";
import { buildExploreCoverBySlug } from "@/lib/explore/buildExploreCoverBySlug";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { isValidExploreFocusKind, resolveExploreFocusCanonicalId } from "@/lib/explore/resolveExploreFocus";
import { buildGraphIndex } from "@/lib/graph/graph";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Explore",
  description:
    "A semantic observatory for the After Certainty graph — traverse concepts, patterns, books, and thinkers as a calm, navigable landscape.",
});

type ExplorePageProps = {
  searchParams?: Promise<{ focusKind?: string; focusSlug?: string }>;
};

export default async function ExploreObservatoryPage({ searchParams }: ExplorePageProps) {
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const coverBySlug = buildExploreCoverBySlug(graph, catalogBooks);

  const sp = searchParams ? await searchParams : {};
  let initialFocusCanonicalId: string | null = null;
  const fk = sp.focusKind;
  const fs = sp.focusSlug;
  if (typeof fk === "string" && typeof fs === "string" && isValidExploreFocusKind(fk)) {
    const index = buildGraphIndex(graph);
    initialFocusCanonicalId = resolveExploreFocusCanonicalId(index, fk, fs, catalogBooks);
  }

  return (
    <article className="relative">
      <ExploreObservatory
        key={`${fk ?? ""}-${fs ?? ""}`}
        initialGraph={graph}
        coverBySlug={coverBySlug}
        initialFocusCanonicalId={initialFocusCanonicalId}
      />
    </article>
  );
}
