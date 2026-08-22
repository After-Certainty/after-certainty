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

function IconConcepts(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={12} cy={12} r={3} />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
        strokeLinecap="round"
      />
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

function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={11} cy={11} r={7} />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

const pathways = [
  {
    href: "/explore/books",
    title: "Books",
    description: "Long-form works and serialized texts from the open After Certainty corpus.",
    Icon: IconBooks,
  },
  {
    href: "/explore/patterns",
    title: "Patterns",
    description: "Reusable ideas—named, documented, and open to remix under commons terms.",
    Icon: IconPatterns,
  },
  {
    href: "/explore/concepts",
    title: "Concepts",
    description: "Named ideas in the semantic graph—definitions, recognition signals, and related works.",
    Icon: IconConcepts,
  },
  {
    href: "/podcast",
    title: "Podcast",
    description: "Conversations on uncertainty, institutions, and the texture of leadership.",
    Icon: IconPodcast,
  },
  {
    href: "/start",
    title: "Start Here",
    description: "How to read this project, where ideas live, and how to contribute responsibly.",
    Icon: IconStart,
  },
  {
    href: "/search",
    title: "Search",
    description: "Find books, concepts, patterns, and paths across the open corpus.",
    Icon: IconSearch,
  },
] as const;

export function PathwayGrid() {
  return (
    <section
      className="border-b border-border/40 bg-bg-elevated/22 py-6 md:py-12 lg:py-14"
      aria-label="Explore the commons"
    >
      <Container>
        <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-accent md:mb-5 md:text-xs">
          Explore the commons
        </p>
        {/* Mobile/tablet: compact 2-col tiles. lg+: single horizontal navigation band. */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-6 lg:gap-0 lg:overflow-hidden lg:border lg:border-border/50 lg:bg-bg-elevated/35 light:lg:bg-bg-elevated">
          {pathways.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-11 flex-col border border-border/50 bg-bg-elevated/40 p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-5 lg:min-h-0 lg:border-0 lg:border-r lg:border-border/40 lg:bg-transparent lg:p-4 lg:shadow-none lg:last:border-r-0 lg:hover:bg-bg-elevated/40 light:bg-bg-elevated light:shadow-none light:hover:bg-bg-elevated light:lg:bg-transparent light:lg:hover:bg-bg/60"
            >
              <Icon className="mb-2.5 h-6 w-6 shrink-0 text-accent md:mb-3 md:h-7 md:w-7 lg:mb-2.5 lg:h-5 lg:w-5" />
              <h3 className="text-[10px] font-medium uppercase tracking-[0.22em] text-accent md:text-xs lg:text-[10px] lg:tracking-[0.18em]">
                {title}
              </h3>
              <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-muted md:mt-2.5 md:block lg:mt-2 lg:text-xs lg:leading-snug">
                {description}
              </p>
              <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:mt-4 md:text-xs lg:mt-3 lg:text-[10px]">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
