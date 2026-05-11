import type { Metadata } from "next";
import { StartClosing } from "@/components/start/start-closing";
import { StartExplore } from "@/components/start/start-explore";
import { StartHero } from "@/components/start/start-hero";
import { StartHow } from "@/components/start/start-how";
import { StartQuote } from "@/components/start/start-quote";
import { StartSuggestions } from "@/components/start/start-suggestions";
import { StartWhat } from "@/components/start/start-what";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Start Here",
  description:
    "Orientation for After Certainty — an open publishing commons for books, podcast, patterns, and collaboration.",
});

export default async function StartPage() {
  return (
    <article>
      <StartHero />
      <StartWhat />
      <StartExplore />
      <StartQuote />
      <StartHow />
      <StartSuggestions />
      <StartClosing />
    </article>
  );
}
