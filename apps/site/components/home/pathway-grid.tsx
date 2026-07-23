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
      <path d="M8 10V8a4 4 0 018 0v2M16 10v2a4 4 0 01-8 0v-2" opacity={0.45} />
    </svg>
  );
}

function IconPatterns(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={8} cy={8} r={3} />
      <circle cx={16} cy={8} r={3} />
      <circle cx={12} cy={16} r={3} />
      <path d="M10.5 9.5l1 1M13.5 9.5l-1 1M11 12.5v2" opacity={0.5} />
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

function IconStart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pathways = [
  {
    href: "/explore/books",
    title: "Books",
    description: "Long-form works and serialized texts sourced from companion repositories.",
    Icon: IconBooks,
  },
  {
    href: "/podcast",
    title: "Podcast",
    description: "Conversations on uncertainty, institutions, and the texture of leadership.",
    Icon: IconPodcast,
  },
  {
    href: "/explore/patterns",
    title: "Patterns",
    description: "Reusable ideas—named, documented, and open to remix under commons terms.",
    Icon: IconPatterns,
  },
  {
    href: "/collaborators",
    title: "Collaborators",
    description: "Editors, researchers, and partners stewarding this space together.",
    Icon: IconCollaborators,
  },
  {
    href: "/start",
    title: "Start Here",
    description: "How to read this project, where ideas live, and how to contribute responsibly.",
    Icon: IconStart,
  },
] as const;

export function PathwayGrid() {
  return (
    <section className="border-b border-border/40 bg-bg-elevated/22 py-12 md:py-14">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {pathways.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex h-full flex-col border border-border/50 bg-bg-elevated/40 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon className="mb-4 h-8 w-8 shrink-0 text-accent" />
              <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-accent">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>
              <span className="mt-6 text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
