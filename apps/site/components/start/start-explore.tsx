import Link from "next/link";
import type { SVGProps } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

function IconBooks(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M12 2v20" opacity={0.35} />
    </svg>
  );
}

function IconPodcast(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <path d="M12 18v3M8 21h8" strokeLinecap="round" />
      <path d="M12 15a4 4 0 004-4v-3a4 4 0 10-8 0v3a4 4 0 004 4z" />
    </svg>
  );
}

function IconPatterns(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={8} cy={8} r={3} />
      <circle cx={16} cy={8} r={3} />
      <circle cx={12} cy={16} r={3} />
    </svg>
  );
}

function IconCollaborators(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={9} cy={7} r={3} />
      <circle cx={16} cy={8} r={2.5} />
      <path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5M14 19c0-2 1.5-3 4-3s4 1 4 3" strokeLinecap="round" />
    </svg>
  );
}

const pathways = [
  {
    href: "/explore/books",
    title: "Books",
    description: "Long-form explorations of leadership, meaning, authority, and human systems.",
    Icon: IconBooks,
  },
  {
    href: "/podcast",
    title: "Podcast",
    description: "Conversations examining uncertainty, trust, communication, and complexity.",
    Icon: IconPodcast,
  },
  {
    href: "/explore/patterns",
    title: "Patterns",
    description: "A growing library of recurring structures and dynamics across human systems.",
    Icon: IconPatterns,
  },
  {
    href: "/collaborators",
    title: "Collaborators",
    description: "An open invitation to contribute essays, discussions, conversations, and ideas.",
    Icon: IconCollaborators,
  },
] as const;

export function StartExplore() {
  return (
    <Section atmosphere="transition" className="border-b border-border/35 bg-bg-elevated/[0.08] py-24 md:py-32">
      <Container>
        <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          Explore the project
        </h2>
        <p className="mt-5 max-w-2xl text-muted">
          Choose a thread — each surface opens onto the same evolving commons.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {pathways.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex h-full flex-col border border-border/55 bg-bg-elevated/25 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors duration-300 hover:border-accent/35 hover:bg-bg-elevated/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className="mb-5 h-7 w-7 text-accent transition-colors group-hover:text-fg" />
              <h3 className="font-display text-xl font-medium tracking-tight text-fg">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>
              <span className="mt-8 text-[11px] uppercase tracking-[0.22em] text-accent/90 transition-colors group-hover:text-accent">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
