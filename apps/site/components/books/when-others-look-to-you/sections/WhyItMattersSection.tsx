import Link from "next/link";
import {
  NewsletterForm,
  type NewsletterFormProps,
} from "@/components/books/when-others-look-to-you/ui/NewsletterForm";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

export type WhyItMattersSectionProps = {
  sectionLabel: string;
  title: string;
  paragraph: string;
  learnMore: { label: string; href: string };
  subscribe: NewsletterFormProps;
};

export function WhyItMattersSection({
  sectionLabel,
  title,
  paragraph,
  learnMore,
  subscribe,
}: WhyItMattersSectionProps) {
  return (
    <Section id="book" variant="light">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 lg:gap-x-14">
          <section
            className="min-w-0 space-y-5 sm:space-y-7 lg:max-w-xl lg:pr-4"
            aria-labelledby="why-it-matters-heading"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold">
              {sectionLabel}
            </p>
            <h2 id="why-it-matters-heading" className="heading-lg text-brand-navy">
              {title}
            </h2>
            <p className="body-lg text-pretty text-neutral-700">{paragraph}</p>
            <Link
              href={learnMore.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy underline-offset-4 transition-all duration-200 ease-out hover:text-brand-gold hover:underline"
            >
              {learnMore.label}
              <span aria-hidden>→</span>
            </Link>
          </section>

          <aside
            className="relative min-w-0 border-t border-neutral-200 pt-8 sm:pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
            aria-labelledby="newsletter-form-heading"
          >
            <NewsletterForm {...subscribe} headingId="newsletter-form-heading" />
          </aside>
        </div>
      </div>
    </Section>
  );
}
