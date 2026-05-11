import type { IdeaPageContent } from "@/lib/books/when-others-look-to-you/content";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold";

type IdeaPageProps = {
  content: IdeaPageContent;
};

export function IdeaPage({ content }: IdeaPageProps) {
  const { hero, lenses, whyMatters } = content;
  const d = hero.definitionBlock;
  const termTitle =
    d.term.length > 0
      ? d.term.charAt(0).toUpperCase() + d.term.slice(1)
      : d.term;

  return (
    <>
      {/* 1. Definition hero */}
      <Section
        variant="dark"
        className="!py-[clamp(3.25rem,10vw,6.5rem)] sm:!py-[clamp(4rem,11vw,7.5rem)]"
      >
        <Container>
          <header className="mx-auto max-w-[38rem]">
            <p className={eyebrowClass}>{hero.eyebrow}</p>
            <h1 className="mt-6 heading-xl text-white">{hero.title}</h1>

            <section
              aria-labelledby="idea-definition-heading"
              className="mt-10 scroll-mt-24 rounded-xl border border-white/15 bg-white/[0.05] px-6 py-6 sm:px-8 sm:py-7"
            >
              <h2 id="idea-definition-heading" className={eyebrowClass}>
                {d.label}
              </h2>
              <p className="mt-4 font-[family-name:var(--font-heading)] text-xl leading-snug tracking-tight text-zinc-100 sm:text-2xl sm:leading-snug">
                {d.beforeTerm}
                <dfn
                  id="idea-definition-leader"
                  className="font-semibold text-white not-italic"
                  title={termTitle}
                >
                  {d.term}
                </dfn>
                {d.afterTerm}
              </p>
            </section>

            <p className="mt-8 body-lg text-pretty text-zinc-300/95">
              {hero.lead}
            </p>
          </header>
        </Container>
      </Section>

      {/* 2. Three lenses */}
      <Section variant="light">
        <Container>
          <div className="mx-auto max-w-[40rem]">
            <header className="space-y-5">
              <p className={eyebrowClass}>{lenses.sectionLabel}</p>
              <h2 className="heading-lg text-brand-navy">{lenses.title}</h2>
              <p className="body-lg text-pretty text-neutral-600">{lenses.intro}</p>
            </header>

            <ul className="mt-14 space-y-12 sm:mt-16">
              {lenses.items.map((lens) => (
                <li
                  key={lens.name}
                  className="border-l-[3px] border-brand-gold/90 pl-6 sm:pl-8"
                >
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-brand-navy sm:text-xl">
                    {lens.name}
                  </h3>
                  <p className="mt-3 max-w-prose body-lg text-pretty text-neutral-600">
                    {lens.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* 3. Why this model matters */}
      <Section variant="dark">
        <Container>
          <div className="mx-auto max-w-[40rem] space-y-8">
            <header className="space-y-5">
              <p className={eyebrowClass}>{whyMatters.sectionLabel}</p>
              <h2 className="heading-lg text-zinc-100">{whyMatters.title}</h2>
            </header>
            <div className="space-y-6">
              {whyMatters.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="max-w-prose body-lg text-pretty text-zinc-300/95"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
