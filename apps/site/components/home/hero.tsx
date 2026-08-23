import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { HERO_SCRIM_HOME_CLASS } from "@/lib/ui/hero-scrim";

const heroBackdropSrc = "/images/hero/hero-backdrop.png";

export function Hero() {
  return (
    <section className="hero-home relative overflow-hidden border-b border-border/50 md:min-h-[min(78vh,820px)]">
      <div className="hero-home__media pointer-events-none absolute inset-0 z-0">
        <Image
          src={heroBackdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_42%] md:object-[center_38%]"
          sizes="100vw"
        />
      </div>
      {/* Single scrim: transparent across most of the frame; darkens only the lower band for type.
          (Separate bloom/grain layers were stacking soft-light blends and hid the photo.)
          Light theme overrides this in atmosphere.css with a pale left wash for dark type. */}
      <div className={HERO_SCRIM_HOME_CLASS} aria-hidden />
      {/* Mobile: content-sized hero (no tall min-height) so the opening viewport isn’t mostly empty image.
          Desktop keeps a cinematic frame with bottom-aligned type — slightly shorter than before. */}
      <Container className="relative z-10 py-8 md:flex md:min-h-[inherit] md:flex-col md:justify-end md:py-28 lg:py-36">
        {/* Light: near-black type on a pale paper wash (see atmosphere.css). Soft cream edge keeps letterforms crisp over midtones without muddy glow. */}
        <p className="hero-home__eyebrow text-[10px] uppercase tracking-[0.32em] md:text-xs md:tracking-[0.45em] dark:text-muted dark:drop-shadow-sm light:text-[rgb(20_18_16/0.62)] light:[text-shadow:0_1px_0_rgb(255_252_248/0.55)]">
          Intellectual commons · Publishing · Podcast
        </p>
        <h1 className="hero-home__title mt-3 max-w-4xl font-display text-4xl font-medium leading-[1.02] tracking-[0.08em] text-balance sm:text-5xl md:mt-6 md:text-7xl md:leading-[1.05] lg:text-8xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] light:text-[rgb(18_16_14)] light:[text-shadow:0_1px_0_rgb(255_252_248/0.7),0_0_1px_rgb(255_252_248/0.35)]">
          AFTER
          <span className="block">CERTAINTY</span>
        </h1>
        <p className="hero-home__lede mt-3 max-w-2xl text-base leading-relaxed md:mt-6 md:max-w-xl md:text-xl dark:text-fg/90 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.92),0_0_22px_rgba(0,0,0,0.65),0_3px_36px_rgba(0,0,0,0.55)] light:text-[rgb(28_26_22/0.82)] light:[text-shadow:0_1px_0_rgb(255_252_248/0.65)]">
          Exploring meaning, trust, leadership, and human systems in a world beyond certainty.
        </p>
        <div className="hero-home__actions mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center md:mt-10 md:gap-4">
          <ButtonLink
            href="/start"
            variant="primary"
            className="light:border-[rgb(20_18_16/0.28)] light:bg-[rgb(255_252_248/0.72)] light:text-[rgb(18_16_14)] light:shadow-[0_1px_0_0_rgb(20_18_16/0.06)] light:hover:border-accent/55 light:hover:bg-[rgb(255_252_248/0.92)] light:hover:text-accent"
          >
            Start Here
          </ButtonLink>
          <Link
            href="/podcast"
            className="inline-flex min-h-10 items-center text-xs uppercase tracking-[0.2em] text-fg/90 underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden dark:drop-shadow-sm light:text-[rgb(28_26_22/0.82)] light:[text-shadow:0_1px_0_rgb(255_252_248/0.65)]"
          >
            Listen to the Podcast
          </Link>
          <span className="hidden md:inline-flex">
            <ButtonLink
              className="hero-home__ghost-cta light:border-[rgb(20_18_16/0.28)] light:bg-[rgb(255_252_248/0.55)] light:text-[rgb(18_16_14)] light:shadow-[0_1px_0_0_rgb(20_18_16/0.05)] light:backdrop-blur-[2px] light:hover:border-accent/55 light:hover:bg-[rgb(255_252_248/0.88)] light:hover:text-accent"
              href="/podcast"
              variant="ghost"
            >
              Listen to the Podcast
            </ButtonLink>
          </span>
        </div>
      </Container>
    </section>
  );
}
