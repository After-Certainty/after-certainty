import Image from "next/image";
import { Container } from "@/components/ui/container";

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
   * `editorial` — text-first mobile intro without a tall image hero (Patterns Phase 2);
   *   desktop may still use a compact image-backed presentation.
   * Does not change other Explore index pages unless opted in.
   */
  density?: ExploreIndexHeroDensity;
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
  countLabel,
}: ExploreIndexHeroProps) {
  const compact = density === "compact";
  const editorial = density === "editorial";

  const sectionClass = editorial
    ? "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] overflow-hidden border-b border-border/45 md:min-h-[min(42vh,480px)]"
    : compact
      ? "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(34vh,280px)] overflow-hidden border-b border-border/45 md:min-h-[min(48vh,520px)]"
      : "explore-page-hero relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] min-h-[min(52vh,600px)] overflow-hidden border-b border-border/45 md:min-h-[min(56vh,640px)]";

  const containerClass = editorial
    ? "relative z-10 mx-auto max-w-4xl px-6 py-6 text-left md:py-16 md:text-left lg:py-20"
    : compact
      ? "relative z-10 mx-auto max-w-4xl px-6 py-10 text-center md:py-20 md:text-left lg:py-24"
      : "relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:py-28 md:text-left lg:py-32";

  const titleClass = editorial
    ? "mt-2 font-display text-4xl font-medium leading-[1.05] tracking-[0.06em] text-balance text-fg md:mt-6 md:text-6xl md:dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] md:light:text-[rgb(255_250_244/0.98)] md:light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
    : compact
      ? "mt-4 font-display text-4xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:mt-8 md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]"
      : "mt-8 font-display text-5xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]";

  const ledeClass = editorial
    ? "mt-3 max-w-2xl text-sm leading-relaxed text-muted md:mt-6 md:text-lg md:text-fg/88 dark:md:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
    : compact
      ? "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-fg/88 md:mx-0 md:mt-10 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]"
      : "mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]";

  const ruleClass = editorial
    ? "mt-4 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mt-10"
    : compact
      ? "mx-auto mt-6 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0 md:mt-14"
      : "mx-auto mt-14 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0";

  const eyebrowClass = editorial
    ? "text-[11px] uppercase tracking-[0.28em] text-accent"
    : "text-xs uppercase tracking-[0.42em] text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]";

  return (
    <section className={sectionClass} aria-labelledby={headingId} data-density={density}>
      {/* Image stack: hidden on mobile for editorial; retained from md up */}
      <div
        className={
          editorial
            ? "explore-page__media pointer-events-none absolute inset-0 z-0 hidden md:block"
            : "explore-page__media pointer-events-none absolute inset-0 z-0"
        }
      >
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority={!editorial}
          className="object-cover object-[center_38%]"
          sizes="100vw"
        />
      </div>
      <div
        className={
          editorial
            ? "pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-b from-bg/80 via-bg/[0.15] to-bg/88 md:block"
            : "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/80 via-bg/[0.15] to-bg/88"
        }
        aria-hidden
      />
      <div
        className={
          editorial
            ? "pointer-events-none absolute inset-0 z-[1] hidden bg-texture-grain bg-cover bg-center opacity-[0.028] mix-blend-soft-light md:block md:opacity-[0.038]"
            : "pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.028] mix-blend-soft-light md:opacity-[0.038]"
        }
        aria-hidden
      />
      <div
        className={
          editorial
            ? "pointer-events-none absolute inset-0 z-[1] hidden bg-texture-topology-fade-start bg-cover bg-left opacity-[0.035] mix-blend-soft-light md:block md:opacity-[0.055]"
            : "pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.035] mix-blend-soft-light md:opacity-[0.055]"
        }
        aria-hidden
      />
      <div
        className={
          editorial
            ? "pointer-events-none absolute inset-0 z-[1] hidden bg-texture-light-bloom bg-cover bg-center opacity-[0.05] mix-blend-soft-light md:block md:opacity-[0.065]"
            : "pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.05] mix-blend-soft-light md:opacity-[0.065]"
        }
        aria-hidden
      />
      <div
        className={
          editorial
            ? "atm-vignette-soft pointer-events-none absolute inset-0 z-[2] hidden opacity-[0.55] md:block md:opacity-[0.68]"
            : "atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.55] md:opacity-[0.68]"
        }
        aria-hidden
      />
      <div
        className={
          editorial
            ? "explore-page__scrim pointer-events-none absolute inset-0 z-[3] hidden bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,color-mix(in_srgb,var(--bg)_44%,transparent)_68%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%)] md:block"
            : "explore-page__scrim pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,color-mix(in_srgb,var(--bg)_44%,transparent)_68%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%)]"
        }
        aria-hidden
      />

      <Container className={containerClass}>
        <div className="animate-start-reveal">
          <p className={eyebrowClass}>{eyebrow}</p>
          <h1 id={headingId} className={titleClass}>
            {title}
          </h1>
          <p className={ledeClass}>{lede}</p>
          {countLabel ? (
            <p
              className={
                editorial
                  ? "mt-2 text-xs uppercase tracking-[0.22em] text-muted"
                  : "mx-auto mt-3 text-xs uppercase tracking-[0.22em] text-muted md:mx-0"
              }
            >
              {countLabel}
            </p>
          ) : null}
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
