import Link from "next/link";
import type { SVGProps } from "react";
import { Container } from "@/components/ui/container";

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
    <section className="atm-section atm-section--transition border-b border-border/35 bg-bg-elevated/[0.08] py-6 md:py-28">
      <Container>
        <h2 className="max-w-xl font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
          Explore the project
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:mt-5 md:text-base">
          Choose a thread — each surface opens onto the same evolving commons.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:mt-14 md:gap-5 lg:grid-cols-4 lg:gap-4">
          {pathways.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex h-full flex-col border border-border/55 bg-bg-elevated/25 p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors duration-300 hover:border-accent/35 hover:bg-bg-elevated/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-6"
            >
              <Icon className="mb-3 h-6 w-6 text-accent transition-colors group-hover:text-fg md:mb-5 md:h-7 md:w-7" />
              <h3 className="font-display text-lg font-medium tracking-tight text-fg md:text-xl">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-snug text-muted md:mt-3 md:text-sm md:leading-relaxed">
                {description}
              </p>
              <span className="mt-4 text-[10px] uppercase tracking-[0.22em] text-accent/90 transition-colors group-hover:text-accent md:mt-8 md:text-[11px]">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
