import Image from "next/image";
import { Container } from "@/components/ui/container";

const backdropSrc = "/images/hero/hero-backdrop.png";

export type ExploreIndexHeroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  /** Unique id for `aria-labelledby` (per page). */
  headingId: string;
};

/**
 * Full-bleed explore section hero — same backdrop stack as the main Explore landing and Books / Start.
 * Parent should live inside the explore `Container`; this section breaks out to viewport width.
 */
export function ExploreIndexHero({ eyebrow, title, lede, headingId }: ExploreIndexHeroProps) {
  return (
    <section
      className="explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(52vh,600px)] overflow-hidden border-b border-border/45 md:min-h-[min(56vh,640px)]"
      aria-labelledby={headingId}
    >
      <div className="explore-page__media pointer-events-none absolute inset-0 z-0">
        <Image src={backdropSrc} alt="" fill priority className="object-cover object-[center_38%]" sizes="100vw" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/80 via-bg/[0.15] to-bg/88" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.028] mix-blend-soft-light md:opacity-[0.038]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.035] mix-blend-soft-light md:opacity-[0.055]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.05] mix-blend-soft-light md:opacity-[0.065]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.55] md:opacity-[0.68]" aria-hidden />
      <div
        className="explore-page__scrim pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,color-mix(in_srgb,var(--bg)_44%,transparent)_68%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:py-28 md:text-left lg:py-32">
        <div className="animate-start-reveal">
          <p className="text-xs uppercase tracking-[0.42em] text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">
            {eyebrow}
          </p>
          <h1
            id={headingId}
            className="mt-8 font-display text-5xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
          >
            {title}
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">
            {lede}
          </p>
          <div className="mx-auto mt-14 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0" aria-hidden />
        </div>
      </Container>
    </section>
  );
}

/** Explore landing (`/explore`) — canonical copy for the atlas home. */
export function ExploreHero() {
  return (
    <ExploreIndexHero
      eyebrow="Semantic atlas"
      title="Explore"
      headingId="explore-hero-heading"
      lede="Enter a conceptual observatory — move across books, patterns, glossary entries, and thinkers as connected terrain rather than isolated pages."
    />
  );
}
