import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const backdropSrc = "/images/hero/hero-backdrop.png";

export function StartHero() {
  return (
    <section className="start-page-hero relative min-h-[min(82vh,840px)] overflow-hidden border-b border-border/50">
      <div className="start-page__media pointer-events-none absolute inset-0 z-0">
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
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/78 via-bg/[0.18] to-bg/86"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.032] mix-blend-soft-light md:opacity-[0.042]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.04] mix-blend-soft-light md:opacity-[0.065]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.055] mix-blend-soft-light md:opacity-[0.075]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.65] md:opacity-75" aria-hidden />

      <div
        className="start-page__scrim pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_38%,color-mix(in_srgb,var(--bg)_42%,transparent)_66%,color-mix(in_srgb,var(--bg)_78%,transparent)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 flex flex-col items-center py-24 text-center md:items-start md:py-32 md:text-left lg:py-40">
        <div className="animate-start-reveal max-w-3xl">
          <p className="text-xs uppercase tracking-[0.42em] text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.5),0_0_14px_rgb(0_0_0/0.3)]">
            An open publishing project
          </p>
          <h1 className="mt-8 font-display text-4xl font-medium leading-[1.06] tracking-[0.12em] text-balance md:text-6xl lg:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_28px_rgb(0_0_0/0.48),0_1px_3px_rgb(0_0_0/0.4)]">
            Start here
          </h1>
          <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed md:text-lg dark:text-fg/88 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_0_20px_rgba(0,0,0,0.35)] light:text-[rgb(255_252_248/0.92)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55),0_0_22px_rgb(0_0_0/0.38)]">
            <p>
              We live in a world filled with information, certainty, and reaction — but often lacking shared
              understanding.
            </p>
            <p>
              After Certainty explores how people create meaning together through leadership, communication, trust,
              systems, institutions, and conversation.
            </p>
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row md:items-start">
            <ButtonLink href="/explore/books" variant="primary">
              Explore the Books
            </ButtonLink>
            <ButtonLink
              className="light:border-border light:bg-bg/88 light:text-fg light:shadow-[0_2px_20px_rgb(0_0_0/0.18)] light:backdrop-blur-[2px] light:hover:border-accent/55 light:hover:bg-bg light:hover:text-accent"
              href="/podcast"
              variant="ghost"
            >
              Listen to the Podcast
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
