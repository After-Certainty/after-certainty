import { CollaborationCard } from "@/components/collaborators/collaboration-card";
import { SectionWrapper } from "@/components/collaborators/section-wrapper";
import {
  IconCritique,
  IconFutureCommunity,
  IconPatterns,
  IconPodcast,
  IconTechnical,
  IconWriting,
} from "@/components/collaborators/participation-icons";

const items = [
  {
    title: "Writing",
    description:
      "Contribute essays, reflections, extensions, critiques, or long-form explorations.",
    icon: <IconWriting className="h-5 w-5" />,
  },
  {
    title: "Podcast Conversations",
    description:
      "Participate in thoughtful discussions around systems, trust, meaning, leadership, and uncertainty.",
    icon: <IconPodcast className="h-5 w-5" />,
  },
  {
    title: "Pattern Contributions",
    description:
      "Help identify recurring structures across communication, institutions, leadership, and human systems.",
    icon: <IconPatterns className="h-5 w-5" />,
  },
  {
    title: "Critique & Discussion",
    description: "Challenge assumptions, reinterpret ideas, and expand conversations thoughtfully.",
    icon: <IconCritique className="h-5 w-5" />,
  },
  {
    title: "Technical Contributions",
    description:
      "Help improve the open publishing infrastructure, website, metadata systems, or tooling.",
    icon: <IconTechnical className="h-5 w-5" />,
  },
  {
    title: "Future Community Conversations",
    description:
      "The project may eventually include Discord-based discussion spaces and collaborative conversations.",
    icon: <IconFutureCommunity className="h-5 w-5" />,
  },
] as const;

export function CollaboratorsParticipate() {
  return (
    <SectionWrapper id="ways-to-participate" className="border-t border-border/25 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center md:text-left">
        <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">Ways to participate</h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted md:mx-0">
          Participation takes many shapes—none of them defined by hype or obligation. Choose what fits your inquiry.
        </p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.map((item) => (
          <CollaborationCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
        ))}
      </div>
    </SectionWrapper>
  );
}
