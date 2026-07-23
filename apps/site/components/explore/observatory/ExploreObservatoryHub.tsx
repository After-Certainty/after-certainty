"use client";

import Link from "next/link";

import { exploreObservatoryPresetHref, explorePaths } from "@/lib/graph/explorePaths";

type ExploreObservatoryHubProps = {
  onEnterObservatory: () => void;
};

const landscapeLinks = [
  { href: explorePaths.concepts, label: "Core concepts" },
  { href: explorePaths.patterns, label: "Patterns" },
  { href: explorePaths.books, label: "Books" },
  { href: explorePaths.thinkers, label: "Thinkers" },
  { href: explorePaths.sources, label: "Sources" },
] as const;

export function ExploreObservatoryHub({ onEnterObservatory }: ExploreObservatoryHubProps) {
  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,var(--glow),transparent)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Semantic observatory</p>
        <h1 className="mt-5 font-display text-3xl font-medium text-fg">Explore</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Browse by entity type or open the graph to wander the semantic landscape.
        </p>

        <section className="mt-12 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.26em] text-muted">
            Explore the landscape
          </p>
          <nav className="flex flex-col gap-2 text-sm text-fg">
            {landscapeLinks.map(({ href, label }) => (
              <Link key={href} className="rounded-sm py-2 hover:text-accent" href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="mt-10 space-y-3">
          <button
            type="button"
            className="w-full rounded-sm border border-accent/50 bg-accent/10 px-4 py-4 text-left transition-colors hover:border-accent hover:bg-accent/15"
            onClick={onEnterObservatory}
          >
            <span className="block text-[11px] uppercase tracking-[0.26em] text-accent">
              Observatory
            </span>
            <span className="mt-2 block font-display text-lg text-fg">Open the graph</span>
            <span className="mt-1 block text-sm text-muted">
              Fullscreen semantic map — tap nodes to expand
            </span>
          </button>
          <Link
            href={exploreObservatoryPresetHref("tensions")}
            className="block rounded-sm border border-border/80 px-4 py-3 text-sm text-fg transition-colors hover:border-accent/45"
          >
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted">Preset</span>
            <span className="mt-1 block font-display text-base">Tensions map</span>
          </Link>
          <Link
            href={exploreObservatoryPresetHref("dynamics")}
            className="block rounded-sm border border-border/80 px-4 py-3 text-sm text-fg transition-colors hover:border-accent/45"
          >
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted">Preset</span>
            <span className="mt-1 block font-display text-base">Dynamics map</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
