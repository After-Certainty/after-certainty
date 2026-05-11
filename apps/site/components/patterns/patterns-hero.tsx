import Image from "next/image";
import { Container } from "@/components/ui/container";

const backdropSrc = "/images/hero/hero-backdrop.png";

export function PatternsHero() {
  return (
    <section className="relative min-h-[min(48vh,520px)] overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={backdropSrc}
          alt=""
          fill
          priority
          className="object-cover object-[center_40%] opacity-[0.5]"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/[0.9] via-bg/[0.65] to-bg/[0.92]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.03] mix-blend-soft-light md:opacity-[0.04]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.04] mix-blend-soft-light md:opacity-[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.05] mix-blend-soft-light md:opacity-[0.065]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.48] md:opacity-[0.58]" aria-hidden />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center md:max-w-3xl">
          <p className="text-xs uppercase tracking-[0.42em] text-muted">Recurring structures</p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.06] tracking-tight text-fg md:text-6xl">
            Patterns
          </h1>
          <p className="mx-auto mt-10 max-w-xl text-base leading-[1.8] text-muted md:text-lg">
            Patterns are recurring structures that emerge across leadership, communication, meaning, authority, trust,
            and human systems. They are not rigid laws or final answers, but lenses for noticing what repeats.
          </p>
        </div>
        <div className="mx-auto mt-16 h-px max-w-md bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden />
      </Container>
    </section>
  );
}
