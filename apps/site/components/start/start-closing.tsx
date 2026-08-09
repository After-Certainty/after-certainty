import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

/**
 * Compact participation close for Start Here — process detail lives on About / Collaborators.
 */
export function StartClosing() {
  return (
    <section className="atm-section atm-section--transition relative bg-bg py-10 md:py-20">
      <Container className="relative z-10 mx-auto max-w-2xl text-center">
        <div
          className="mx-auto mb-5 h-px max-w-sm bg-gradient-to-r from-transparent via-border/80 to-transparent md:mb-10"
          aria-hidden
        />
        <p className="font-display text-xl leading-snug text-fg md:text-2xl md:leading-snug">
          Conversations continue through participation.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 md:mt-8">
          <ButtonLink href="/explore/books" variant="primary">
            Explore the commons
          </ButtonLink>
          <ButtonLink href="/collaborators" variant="ghost">
            Collaborators
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
