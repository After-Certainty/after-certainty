import type { ReactNode } from "react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

export type QuoteSectionProps = {
  quote: string;
  supporting?: ReactNode;
  className?: string;
};

export function QuoteSection({ quote, supporting, className }: QuoteSectionProps) {
  return (
    <Section atmosphere="quote" className={cn("relative py-24 md:py-32", className)}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] md:opacity-[0.05]" aria-hidden>
        <div className="atm-quote-paper-hint absolute inset-0" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-texture-topology-fade-start bg-cover bg-left opacity-[0.04] mix-blend-soft-light md:opacity-[0.055]"
        aria-hidden
      />
      <Container className="relative z-10">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="whitespace-pre-line font-display text-2xl font-normal leading-snug text-fg/95 md:text-3xl md:leading-[1.35]">
            {quote}
          </p>
          {supporting ? (
            <footer className="mx-auto mt-10 max-w-xl text-[15px] leading-relaxed text-muted md:text-base">{supporting}</footer>
          ) : null}
        </blockquote>
      </Container>
    </Section>
  );
}
