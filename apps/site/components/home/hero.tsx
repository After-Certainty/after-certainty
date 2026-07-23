import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const heroBackdropSrc = "/images/hero/hero-backdrop.png";

export function Hero() {
  return (
    <section className="hero-home relative min-h-[min(88vh,920px)] overflow-hidden border-b border-border/50">
      <div className="hero-home__media pointer-events-none absolute inset-0 z-0">
        <Image
          src={heroBackdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_38%]"
          sizes="100vw"
        />
      </div>
      {/* Single scrim: transparent across most of the frame; darkens only the lower band for type.
          (Separate bloom/grain layers were stacking soft-light blends and hid the photo.) */}
      <div
        className="hero-home__scrim pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_0%,transparent_42%,color-mix(in_srgb,var(--bg)_45%,transparent)_68%,color-mix(in_srgb,var(--bg)_82%,transparent)_100%)]"
        aria-hidden
      />
      <Container className="relative z-10 py-28 md:py-36 lg:py-44">
        <p className="hero-home__eyebrow text-xs uppercase tracking-[0.45em] dark:text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.85)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55),0_0_18px_rgb(0_0_0/0.35)]">
          Intellectual commons · publishing · podcast
        </p>
        <h1 className="hero-home__title mt-8 max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-[0.08em] text-balance md:text-7xl lg:text-8xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_32px_rgb(0_0_0/0.5),0_1px_3px_rgb(0_0_0/0.45)]">
          AFTER CERTAINTY
        </h1>
        <p className="hero-home__lede mt-8 max-w-2xl text-lg leading-relaxed md:text-xl dark:text-fg/90 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.92),0_0_22px_rgba(0,0,0,0.65),0_3px_36px_rgba(0,0,0,0.55)] light:text-[rgb(255_252_248/0.94)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.65),0_0_26px_rgb(0_0_0/0.48),0_3px_36px_rgb(0_0_0/0.4)]">
          Exploring meaning, trust, leadership, and human systems in a world beyond certainty.
        </p>
        <div className="hero-home__actions mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <ButtonLink href="/start" variant="primary">
            Start Here
          </ButtonLink>
          <ButtonLink
            className="hero-home__ghost-cta light:border-border light:bg-bg/90 light:text-fg light:shadow-[0_2px_22px_rgb(0_0_0/0.2)] light:backdrop-blur-[2px] light:hover:border-accent/55 light:hover:bg-bg light:hover:text-accent"
            href="/podcast"
            variant="ghost"
          >
            Listen to the Podcast
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
