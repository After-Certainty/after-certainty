import Link from "next/link";
import { Book3D } from "@/components/books/when-others-look-to-you/ui/Book3D";
import { Button } from "@/components/books/when-others-look-to-you/ui/Button";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";
import { cn } from "@/lib/books/when-others-look-to-you/cn";
import { assets, type BookPageContent } from "@/lib/books/when-others-look-to-you/content";

const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold";

const secondaryLinkClass = cn(
  "inline-flex items-center justify-center rounded-lg border border-neutral-300/90 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-sm",
  "transition-all duration-200 ease-out hover:border-neutral-400 hover:bg-[color:var(--color-brand-paper)] hover:shadow",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
);

function isOutboundHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export type BookLandingProps = {
  content: BookPageContent;
};

export function BookLanding({ content }: BookLandingProps) {
  const {
    eyebrow,
    title,
    subtitle,
    paragraphs,
    readLinks,
    coverAlt,
  } = content;

  return (
    <Section variant="light">
      <Container>
        <div className="grid grid-cols-1 items-start gap-12 overflow-visible lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="flex min-h-0 min-w-0 justify-center overflow-visible pb-[min(10%,3rem)]">
            <Book3D src={assets.bookCover} alt={coverAlt} priority />
          </div>

          <article className="mx-auto max-w-xl space-y-6 lg:mx-0">
            <header className="space-y-4">
              <p className={eyebrowClass}>{eyebrow}</p>
              <h1 className="heading-lg text-brand-navy">{title}</h1>
              <p className="font-[family-name:var(--font-heading)] text-lg italic leading-snug text-neutral-600">
                {subtitle}
              </p>
            </header>

            <section className="space-y-4" aria-label="About the book">
              {paragraphs.map((para, i) => (
                <p key={i} className="body-lg text-pretty text-neutral-600">
                  {para}
                </p>
              ))}
            </section>

            <nav
              aria-label="Get the book"
              className="flex flex-col gap-3 pt-2"
            >
              {readLinks.map((link, i) => {
                const outbound = isOutboundHref(link.href);
                const outboundProps = outbound
                  ? ({
                      target: "_blank",
                      rel: "noopener noreferrer",
                    } as const)
                  : {};

                const stackClass =
                  "w-full min-w-0 justify-center whitespace-nowrap";

                if (i === 0) {
                  return (
                    <Button
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      variant="primary"
                      className={stackClass}
                      target={outbound ? "_blank" : undefined}
                      rel={outbound ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Button>
                  );
                }

                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={cn(secondaryLinkClass, stackClass)}
                    {...outboundProps}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </article>
        </div>
      </Container>
    </Section>
  );
}
