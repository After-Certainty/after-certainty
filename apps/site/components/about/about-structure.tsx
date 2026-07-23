import { FeatureCard } from "@/components/about/feature-card";
import {
  IconBooks,
  IconCollaboration,
  IconEssays,
  IconInfrastructure,
  IconPatterns,
  IconPodcast,
} from "@/components/about/about-feature-icons";
import { Container } from "@/components/ui/container";

const items = [
  {
    title: "Books",
    description:
      "Long-form explorations of recurring human dynamics across leadership, communication, meaning, authority, and systems.",
    icon: <IconBooks className="h-5 w-5" />,
  },
  {
    title: "Essays",
    description:
      "Shorter-form writing that extends the catalog—reflections, experiments, and threads published as they mature.",
    icon: <IconEssays className="h-5 w-5" />,
  },
  {
    title: "Podcast",
    description:
      "Conversations extending the broader themes into discussion, reflection, critique, and exploration.",
    icon: <IconPodcast className="h-5 w-5" />,
  },
  {
    title: "Patterns",
    description:
      "Recurring structures that emerge across human systems, communication, institutions, and relationships.",
    icon: <IconPatterns className="h-5 w-5" />,
  },
  {
    title: "Open Collaboration",
    description:
      "A GitHub-first publishing ecosystem designed for evolving participation and extension.",
    icon: <IconCollaboration className="h-5 w-5" />,
  },
  {
    title: "Publishing Infrastructure",
    description:
      "Repositories, metadata, and pipelines that keep the commons legible, revisable, and publicly accessible.",
    icon: <IconInfrastructure className="h-5 w-5" />,
  },
] as const;

export function AboutStructure() {
  return (
    <section id="what-the-project-includes" className="border-t border-border/25 py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center md:text-left">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">What the Project Includes</h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted md:mx-0">
            The site gathers several parallel formats—each with its own pace, none pretending to be exhaustive on its own.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
          ))}
        </div>
      </Container>
    </section>
  );
}
