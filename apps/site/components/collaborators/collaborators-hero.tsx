import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CTAButton } from "@/components/collaborators/cta-button";
import { siteConfig } from "@/lib/site-config";

const backdropSrc = "/images/hero/hero-backdrop.png";

export function CollaboratorsHero() {
  return (
    <section className="relative min-h-[min(56vh,640px)] overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_36%] opacity-[0.52]"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/[0.88] via-bg/[0.55] to-bg/[0.94]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.026] mix-blend-soft-light md:opacity-[0.036]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.032] mix-blend-soft-light md:opacity-[0.052]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.048] mix-blend-soft-light md:opacity-[0.062]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.45] md:opacity-[0.56]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_42%,color-mix(in_srgb,var(--bg)_48%,transparent)_72%,var(--bg)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:py-32">
        <div className="animate-start-reveal md:text-left">
          <p className="text-xs uppercase tracking-[0.42em] text-muted">Open collaboration</p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.06] tracking-[0.04em] text-balance text-fg md:text-7xl">
            Collaborators
          </h1>

          <div className="mx-auto mt-10 max-w-2xl space-y-6 text-left text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg">
            <p>
              After Certainty is intentionally designed as an evolving conversation rather than a finished system.
            </p>
            <p className="text-fg/80">
              Some people contribute books.
              <br />
              Some contribute essays.
              <br />
              Some contribute conversations, criticism, questions, patterns, podcasts, or interpretations.
            </p>
            <p>The project grows through thoughtful participation.</p>
          </div>

          <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-4 sm:flex-row sm:flex-wrap md:mx-0">
            <CTAButton href={siteConfig.githubUrl} variant="primary" target="_blank" rel="noreferrer">
              View the GitHub Project
            </CTAButton>
            <CTAButton href="#future-conversations" variant="secondary">
              Join Future Discussions
            </CTAButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
