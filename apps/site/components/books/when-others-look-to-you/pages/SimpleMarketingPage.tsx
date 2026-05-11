import type { ReactNode } from "react";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

export type SimpleMarketingPageProps = {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  children?: ReactNode;
};

/**
 * Two-section marketing shell: light hero band + dark body — matches homepage rhythm.
 */
export function SimpleMarketingPage({
  eyebrow,
  title,
  lead,
  children,
}: SimpleMarketingPageProps) {
  return (
    <>
      <Section variant="light">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6">
            <header className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold">
                {eyebrow}
              </p>
              <h1 className="heading-lg text-brand-navy">{title}</h1>
              <div className="space-y-4 body-lg text-pretty text-neutral-600">
                {lead}
              </div>
            </header>
          </div>
        </Container>
      </Section>
      <Section variant="dark">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4">
            {children ?? (
              <p className="body-lg text-pretty text-zinc-300/95">
                Placeholder content for this page will go here.
              </p>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
