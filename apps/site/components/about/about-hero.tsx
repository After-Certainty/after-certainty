import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CTAButton } from "@/components/collaborators/cta-button";

const backdropSrc = "/images/hero/hero-backdrop.png";

export function AboutHero() {
  return (
    <section className="relative min-h-[min(52vh,600px)] overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_40%] opacity-[0.48]"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/[0.9] via-bg/[0.58] to-bg/[0.94]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.026] mix-blend-soft-light md:opacity-[0.034]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.03] mix-blend-soft-light md:opacity-[0.048]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.046] mix-blend-soft-light md:opacity-[0.058]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.42] md:opacity-[0.52]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_44%,color-mix(in_srgb,var(--bg)_50%,transparent)_74%,var(--bg)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="animate-start-reveal md:text-left">
          <p className="text-xs uppercase tracking-[0.42em] text-muted">About the project</p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.06] tracking-[0.03em] text-balance text-fg md:text-7xl">
            About After Certainty
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg">
            After Certainty is an open publishing and conversation project exploring meaning, leadership, communication,
            trust, authority, interpretation, and human systems in a world where certainty increasingly struggles to hold.
          </p>
          <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-4 sm:flex-row sm:flex-wrap md:mx-0">
            <CTAButton href="/start" variant="primary">
              Start Here
            </CTAButton>
            <CTAButton href="/books" variant="secondary">
              Explore the Books
            </CTAButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
