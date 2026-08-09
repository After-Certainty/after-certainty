import { Container } from "@/components/ui/container";

/**
 * Compact Start Here orientation — quieter than the homepage cinematic hero.
 * Guides newcomers into the first onboarding choice below.
 */
export function StartHero() {
  return (
    <section className="border-b border-border/40 bg-bg-elevated/20 py-8 md:py-14">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-accent md:text-xs md:tracking-[0.32em]">
            Orientation
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium leading-[1.08] tracking-[0.08em] text-balance text-fg sm:text-4xl md:mt-4 md:text-5xl">
            Start here
          </h1>
          <p className="mt-3 font-display text-xl leading-snug text-fg/90 md:mt-4 md:text-2xl">
            What brought you here?
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:mt-4 md:text-base">
            You don’t need to understand the whole project. Start with a question, a tension, or
            simply something you’re curious about.
          </p>
        </div>
      </Container>
    </section>
  );
}
