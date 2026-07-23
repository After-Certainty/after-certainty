import type { Metadata } from "next";
import { CollaboratorsClosing } from "@/components/collaborators/collaborators-closing";
import { CollaboratorsContributorsSection } from "@/components/collaborators/collaborators-contributors-section";
import { CollaboratorsFuture } from "@/components/collaborators/collaborators-future";
import { CollaboratorsGithub } from "@/components/collaborators/collaborators-github";
import { CollaboratorsHero } from "@/components/collaborators/collaborators-hero";
import { CollaboratorsParticipate } from "@/components/collaborators/collaborators-participate";
import { CollaboratorsPhilosophy } from "@/components/collaborators/collaborators-philosophy";
import { CollaboratorsQuote } from "@/components/collaborators/collaborators-quote";
import { getContributors } from "@/lib/content-data";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Collaborators",
  description:
    "An open invitation into collaborative inquiry—writing, patterns, critique, and shared publishing—without recruitment hype or certainty theater.",
});

export default function CollaboratorsPage() {
  const contributors = getContributors();

  return (
    <>
      <CollaboratorsHero />
      <CollaboratorsPhilosophy />
      <CollaboratorsParticipate />
      <CollaboratorsGithub />
      <CollaboratorsFuture />
      <CollaboratorsQuote />
      <CollaboratorsContributorsSection contributors={contributors} />
      <CollaboratorsClosing />
    </>
  );
}
