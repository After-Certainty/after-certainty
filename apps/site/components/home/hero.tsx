import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const heroBackdropSrc = "/images/hero/hero-backdrop.png";

export function Hero() {
  return (
    <section className="hero-home relative min-h-[min(68vh,720px)] overflow-hidden border-b border-border/50 md:min-h-[min(88vh,920px)]">
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
      <Container className="relative z-10 flex min-h-[inherit] flex-col justify-end py-14 md:py-36 lg:py-44">
        <p className="hero-home__eyebrow text-[10px] uppercase tracking-[0.4em] md:text-xs md:tracking-[0.45em] dark:text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.85)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55),0_0_18px_rgb(0_0_0/0.35)]">
          Intellectual commons
          <span className="mt-1 block tracking-[0.32em] md:mt-0 md:inline md:before:content-['_|_']">
            Publishing · Podcast
          </span>
        </p>
        <h1 className="hero-home__title mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[0.08em] text-balance sm:text-5xl md:mt-8 md:text-7xl lg:text-8xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_32px_rgb(0_0_0/0.5),0_1px_3px_rgb(0_0_0/0.45)]">
          AFTER
          <span className="block">CERTAINTY</span>
        </h1>
        <p className="hero-home__lede mt-4 max-w-2xl text-base leading-relaxed md:mt-8 md:text-xl dark:text-fg/90 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.92),0_0_22px_rgba(0,0,0,0.65),0_3px_36px_rgba(0,0,0,0.55)] light:text-[rgb(255_252_248/0.94)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.65),0_0_26px_rgb(0_0_0/0.48),0_3px_36px_rgb(0_0_0/0.4)]">
          Exploring meaning, trust, leadership, and human systems in a world beyond certainty.
        </p>
        <div className="hero-home__actions mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center md:mt-12 md:gap-4">
          <ButtonLink href="/start" variant="primary">
            Start Here
          </ButtonLink>
          <Link
            href="/podcast"
            className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-fg/90 underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden dark:drop-shadow-sm light:text-[rgb(255_252_248/0.94)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55)]"
          >
            Listen to the Podcast
          </Link>
          <span className="hidden md:inline-flex">
            <ButtonLink
              className="hero-home__ghost-cta light:border-border light:bg-bg/90 light:text-fg light:shadow-[0_2px_22px_rgb(0_0_0/0.2)] light:backdrop-blur-[2px] light:hover:border-accent/55 light:hover:bg-bg light:hover:text-accent"
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
