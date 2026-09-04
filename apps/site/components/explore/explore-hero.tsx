import Image from "next/image";
import { Container } from "@/components/ui/container";
import { HERO_SCRIM_EXPLORE_CLASS } from "@/lib/ui/hero-scrim";

const backdropSrc = "/images/hero/hero-backdrop.png";

export type ExploreIndexHeroDensity = "default" | "compact" | "editorial";

export type ExploreIndexHeroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  /** Unique id for `aria-labelledby` (per page). */
  headingId: string;
  /**
   * `compact` — shorter first viewport (Books index Phase B).
   * `editorial` — denser text-first Patterns intro with a short image-backed plane
   *   (not a near-full-viewport hero). Does not change other Explore index pages
   *   unless opted in.
   */
  density?: ExploreIndexHeroDensity;
  /**
   * Opt-in mobile-only tighter padding/min-height for listening-first pages.
   * Desktop (`md:`) classes stay aligned with the chosen density.
   */
  mobileTighten?: boolean;
  /** Optional meta line under the lede (e.g. pattern count). */
  countLabel?: string;
};

/**
 * Full-bleed explore section hero — same backdrop stack as the main Explore landing and Books / Start.
 * Parent should live inside the explore `Container`; this section breaks out to viewport width.
 */
export function ExploreIndexHero({
  eyebrow,
  title,
  lede,
  headingId,
  density = "default",
  mobileTighten = false,
  countLabel,
}: ExploreIndexHeroProps) {
  const compact = density === "compact";
  const editorial = density === "editorial";
  const tightMobile = mobileTighten && editorial;

  const sectionClass = editorial
    ? tightMobile
      ? "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] overflow-hidden border-b border-border/45 md:min-h-[min(42vh,480px)]"
      : "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(28vh,240px)] overflow-hidden border-b border-border/45 md:min-h-[min(42vh,480px)]"
    : compact
      ? "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(34vh,280px)] overflow-hidden border-b border-border/45 md:min-h-[min(48vh,520px)]"
      : "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(52vh,600px)] overflow-hidden border-b border-border/45 md:min-h-[min(56vh,640px)]";

  const containerClass = editorial
    ? tightMobile
      ? "relative z-10 mx-auto max-w-4xl px-6 py-5 text-left md:py-16 lg:py-20"
      : "relative z-10 mx-auto max-w-4xl px-6 py-8 text-left md:py-16 lg:py-20"
    : compact
      ? "relative z-10 mx-auto max-w-4xl px-6 py-10 text-center md:py-20 md:text-left lg:py-24"
      : "relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:py-28 md:text-left lg:py-32";

  const titleClass = editorial
    ? tightMobile
      ? "mt-1.5 font-display text-[2rem] font-medium leading-[1.05] tracking-[0.06em] text-balance md:mt-6 md:text-6xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
      : "mt-2 font-display text-4xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:mt-6 md:text-6xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
    : compact
      ? "mt-4 font-display text-4xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:mt-8 md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
      : "mt-8 font-display text-5xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]";

  const ledeClass = editorial
    ? tightMobile
      ? "mt-2 max-w-2xl text-sm leading-snug text-fg/88 md:mt-6 md:text-lg md:leading-relaxed dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]"
      : "mt-3 max-w-2xl text-sm leading-relaxed text-fg/88 md:mt-6 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]"
    : compact
      ? "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-fg/88 md:mx-0 md:mt-10 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]"
      : "mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]";

  const ruleClass = editorial
    ? tightMobile
      ? "mt-3 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mt-10"
      : "mt-4 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mt-10"
    : compact
      ? "mx-auto mt-6 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0 md:mt-14"
      : "mx-auto mt-14 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0";

  const eyebrowClass = editorial
    ? "text-[11px] uppercase tracking-[0.28em] text-accent dark:drop-shadow-sm light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]"
    : "text-xs uppercase tracking-[0.42em] text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]";

  const countClass = editorial
    ? tightMobile
      ? "mt-1.5 text-xs uppercase tracking-[0.22em] text-fg/75 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.85)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.4)]"
      : "mt-2 text-xs uppercase tracking-[0.22em] text-fg/75 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.85)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.4)]"
    : "mx-auto mt-3 text-xs uppercase tracking-[0.22em] text-muted md:mx-0";

  return (
    <section
      className={sectionClass}
      aria-labelledby={headingId}
      data-density={density}
      {...(mobileTighten ? { "data-mobile-tighten": "true" } : {})}
    >
      <div className="explore-page__media pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_38%]"
          sizes="100vw"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/80 via-bg/[0.15] to-bg/88"
        aria-hidden
      />
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
      <div
        className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.55] md:opacity-[0.68]"
        aria-hidden
      />
      <div className={HERO_SCRIM_EXPLORE_CLASS} aria-hidden />

      <Container className={containerClass}>
        <div className="animate-start-reveal">
          <p className={eyebrowClass}>{eyebrow}</p>
          <h1 id={headingId} className={titleClass}>
            {title}
          </h1>
          <p className={ledeClass}>{lede}</p>
          {countLabel ? <p className={countClass}>{countLabel}</p> : null}
          <div className={ruleClass} aria-hidden />
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
