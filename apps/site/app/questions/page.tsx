import type { Metadata } from "next";

import { QuestionsIndexContent } from "@/components/questions/questions-index-content";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/metadata";
import { buildQuestionsIndexJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
  title: "Start with a Question",
  description:
    "Curated questions that open finite paths through After Certainty—books, concepts, patterns, and more—for visitors who begin with a human tension.",
});

export default function QuestionsIndexPage() {
  return (
    <>
      <JsonLd data={buildQuestionsIndexJsonLd()} />
      <QuestionsIndexContent />
    </>
  );
}
