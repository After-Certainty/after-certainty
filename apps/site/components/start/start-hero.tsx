import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const backdropSrc = "/images/hero/hero-backdrop.png";

export function StartHero() {
  return (
    <section className="start-page-hero relative overflow-hidden border-b border-border/50 md:min-h-[min(82vh,840px)]">
      <div className="start-page__media pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_42%] md:object-[center_38%]"
          sizes="100vw"
        />
      </div>

      {/* Mobile: content-sized hero (no tall min-height), matching homepage.
          Desktop keeps the tall cinematic frame. */}
      <div
        className="start-page__scrim pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_0%,transparent_28%,color-mix(in_srgb,var(--bg)_40%,transparent)_58%,color-mix(in_srgb,var(--bg)_86%,transparent)_100%)] md:bg-[linear-gradient(to_bottom,transparent_0%,transparent_38%,color-mix(in_srgb,var(--bg)_42%,transparent)_66%,color-mix(in_srgb,var(--bg)_78%,transparent)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 py-8 md:flex md:min-h-[inherit] md:flex-col md:justify-end md:py-32 lg:py-40">
        <div className="animate-start-reveal max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted md:text-xs md:tracking-[0.42em] dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.5),0_0_14px_rgb(0_0_0/0.3)]">
            An open publishing project
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.06] tracking-[0.12em] text-balance sm:text-5xl md:mt-8 md:text-6xl lg:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_28px_rgb(0_0_0/0.48),0_1px_3px_rgb(0_0_0/0.4)]">
            Start here
          </h1>
          <div className="mt-3 max-w-2xl space-y-3 text-base leading-relaxed md:mt-10 md:space-y-6 md:text-lg dark:text-fg/88 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_0_20px_rgba(0,0,0,0.35)] light:text-[rgb(255_252_248/0.92)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55),0_0_22px_rgb(0_0_0/0.38)]">
            <p>
              We live in a world filled with information, certainty, and reaction — but often lacking
              shared understanding.
            </p>
            <p>
              After Certainty explores how people create meaning together through leadership,
              communication, trust, systems, institutions, and conversation.
            </p>
          </div>
          <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center md:mt-12 md:gap-4">
            <ButtonLink href="/explore/books" variant="primary">
              Explore the Books
            </ButtonLink>
            <Link
              href="/podcast"
              className="inline-flex min-h-10 items-center text-xs uppercase tracking-[0.2em] text-fg/90 underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden dark:drop-shadow-sm light:text-[rgb(255_252_248/0.94)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.55)]"
            >
              Listen to the Podcast
            </Link>
            <span className="hidden md:inline-flex">
              <ButtonLink
                className="light:border-border light:bg-bg/88 light:text-fg light:shadow-[0_2px_20px_rgb(0_0_0/0.18)] light:backdrop-blur-[2px] light:hover:border-accent/55 light:hover:bg-bg light:hover:text-accent"
                href="/podcast"
                variant="ghost"
              >
                Listen to the Podcast
              </ButtonLink>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
