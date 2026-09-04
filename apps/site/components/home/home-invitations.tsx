import Link from "next/link";
import type { SVGProps } from "react";
import { Container } from "@/components/ui/container";

function IconStart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function IconAbout(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

const invitations = [
  {
    href: "/start",
    title: "Start Here",
    description: "Find a doorway that matches what brought you here—a question, a trail, or a book.",
    Icon: IconStart,
  },
  {
    href: "/explore/books",
    title: "Books",
    description: "Long-form explorations you can read at your own pace.",
    Icon: IconBooks,
  },
  {
    href: "/podcast",
    title: "Podcast",
    description: "Conversations that carry the themes into dialogue and reflection.",
    Icon: IconPodcast,
  },
  {
    href: "/about",
    title: "About",
    description: "The idea behind the project, and how the work is published and shared.",
    Icon: IconAbout,
  },
] as const;

/**
 * Compact invitation band — four clear ways in, not a full content catalog.
 * Patterns, concepts, and search remain reachable from header / Explore.
 */
export function HomeInvitations() {
  return (
    <section
      className="border-b border-border/40 bg-bg-elevated/22 py-6 md:py-12 lg:py-14"
      aria-label="Where to begin"
    >
      <Container>
        <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-accent md:mb-5 md:text-xs">
          Where to begin
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-0 lg:overflow-hidden lg:border lg:border-border/50 lg:bg-bg-elevated/35 light:lg:bg-bg-elevated">
          {invitations.map(({ href, title, description, Icon }) => (
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
                Continue →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
