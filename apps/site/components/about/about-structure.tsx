import type { ReactNode } from "react";
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

const items: {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
}[] = [
  {
    title: "Books",
    description:
      "Long-form explorations of recurring human problems—leadership, trust, meaning, authority, and the systems we build to live together.",
    icon: <IconBooks className="h-5 w-5" />,
    href: "/explore/books",
  },
  {
    title: "Essays",
    description:
      "Shorter writing that extends the conversation—reflections, experiments, and threads published as they mature.",
    icon: <IconEssays className="h-5 w-5" />,
  },
  {
    title: "Podcast",
    description:
      "Conversations that carry the themes into discussion, reflection, critique, and exploration.",
    icon: <IconPodcast className="h-5 w-5" />,
    href: "/podcast",
  },
  {
    title: "Patterns",
    description:
      "Named structures that show up again and again across institutions, relationships, and everyday decisions.",
    icon: <IconPatterns className="h-5 w-5" />,
    href: "/explore/patterns",
  },
  {
    title: "Open Collaboration",
    description:
      "A GitHub-first publishing ecosystem designed for evolving participation, critique, and extension.",
    icon: <IconCollaboration className="h-5 w-5" />,
    href: "/collaborators",
  },
  {
    title: "Publishing Infrastructure",
    description:
      "The repository, metadata, and pipelines that keep the work legible, revisable, and publicly accessible.",
    icon: <IconInfrastructure className="h-5 w-5" />,
    href: "/collaborators",
  },
];

export function AboutStructure() {
  return (
    <section id="what-the-project-includes" className="border-t border-border/25 py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center md:text-left">
          <h2 className="font-display text-3xl tracking-tight text-fg md:text-4xl">
            What After Certainty Is
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted md:mx-0">
            Around that idea, the project gathers several formats—each with its own pace, none
            pretending to be exhaustive on its own.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
