import { Container } from "@/components/ui/container";

export function StartWhat() {
  return (
    <section className="border-b border-border/35 bg-bg py-6 md:py-28">
      <Container className="max-w-2xl text-center">
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
          What Is After Certainty?
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted md:mt-10 md:space-y-6 md:text-lg">
          <p>
            After Certainty is a collaborative publishing and conversation project exploring meaning,
            trust, leadership, communication, authority, interpretation, and human coordination under
            uncertainty.
          </p>
          <p>
            The project includes books, essays, podcasts, patterns, and open collaboration. It is
            intentionally open-ended and evolving.
          </p>
        </div>
        <div
          className="mx-auto mt-6 h-px max-w-xs bg-gradient-to-r from-transparent via-accent/35 to-transparent md:mt-14"
          aria-hidden
        />
      </Container>
    </section>
  );
}
