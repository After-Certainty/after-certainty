import type { AboutPageContent } from "@/lib/books/when-others-look-to-you/content";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold";

type AboutPageProps = {
  content: AboutPageContent;
};

function TextBlock({
  id,
  heading,
  paragraphs,
}: {
  id: string;
  heading: string;
  paragraphs: readonly string[];
}) {
  return (
    <section className="space-y-5" aria-labelledby={id}>
      <h2
        id={id}
        className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight text-brand-navy sm:text-2xl"
      >
        {heading}
      </h2>
      {paragraphs.map((p, i) => (
        <p key={i} className="body-lg text-pretty text-neutral-600">
          {p}
        </p>
      ))}
    </section>
  );
}

export function AboutPage({ content }: AboutPageProps) {
  const { eyebrow, title, intro, whyWritten, exploring } = content;

  return (
    <>
      <Section variant="light">
        <Container>
          <article className="mx-auto max-w-[38rem] space-y-14 sm:space-y-16">
            <header className="space-y-6">
              <p className={eyebrowClass}>{eyebrow}</p>
              <h1 className="heading-lg text-brand-navy">{title}</h1>
              <section className="space-y-4" aria-label="Introduction">
                {intro.map((p, i) => (
                  <p key={i} className="body-lg text-pretty text-neutral-600">
                    {p}
                  </p>
                ))}
              </section>
            </header>

            <TextBlock
              id="why-the-book"
              heading={whyWritten.heading}
              paragraphs={whyWritten.paragraphs}
            />
            <TextBlock
              id="what-im-exploring"
              heading={exploring.heading}
              paragraphs={exploring.paragraphs}
            />
          </article>
        </Container>
      </Section>
    </>
  );
}
