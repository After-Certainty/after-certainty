import Link from "next/link";
import type { PatternCardItem } from "@/lib/books/when-others-look-to-you/content";
import { PatternCard, type PatternCardTone } from "@/components/books/when-others-look-to-you/ui/PatternCard";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

export type { PatternCardItem };

export type PatternSectionProps = {
  label: string;
  title: string;
  intro?: string;
  /** Optional second centered paragraph under `intro` */
  introLine2?: string;
  patterns: PatternCardItem[];
  viewAll?: { label: string; href: string };
};

const toneCycle: PatternCardTone[] = ["blue", "teal", "gold"];

export function PatternSection({
  label,
  title,
  intro,
  introLine2,
  patterns,
  viewAll,
}: PatternSectionProps) {
  return (
    <Section
      id="pattern"
      variant="light"
      className="rounded-t-[1.75rem] shadow-[0_-3px_20px_-10px_rgba(0,0,0,0.08)]"
    >
      <Container>
        <div className="space-y-10 sm:space-y-14 md:space-y-16">
          <header className="mx-auto max-w-3xl space-y-4 text-center sm:space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold">
              {label}
            </p>
            <h2 className="heading-lg text-brand-navy">{title}</h2>
            {intro ? (
              <p className="body-lg text-pretty text-neutral-600">{intro}</p>
            ) : null}
            {introLine2 ? (
              <p className="body-lg text-pretty text-neutral-600">{introLine2}</p>
            ) : null}
          </header>

          <ul className="grid grid-cols-1 gap-7 sm:gap-8 lg:grid-cols-3 lg:gap-10">
            {patterns.map((card, index) => (
              <li key={`${card.href}-${card.number}`}>
                <PatternCard
                  number={card.number}
                  title={card.title}
                  description={card.description}
                  exploreHref={card.href}
                  tone={toneCycle[index % toneCycle.length]!}
                />
              </li>
            ))}
          </ul>

          {viewAll ? (
            <nav
              aria-label="More patterns"
              className="flex justify-center pt-2"
            >
              <Link
                href={viewAll.href}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-navy transition-colors duration-200 ease-out hover:text-brand-gold"
              >
                {viewAll.label}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </nav>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
