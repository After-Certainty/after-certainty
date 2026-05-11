import type { IntroVideoPageContent } from "@/lib/books/when-others-look-to-you/content";
import { Container } from "@/components/books/when-others-look-to-you/ui/Container";
import { Section } from "@/components/books/when-others-look-to-you/ui/Section";

const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold";

type IntroVideoPageProps = {
  content: IntroVideoPageContent;
};

export function IntroVideoPage({ content }: IntroVideoPageProps) {
  const { eyebrow, title, description, youtubeVideoId } = content;
  const embedSrc = `https://www.youtube.com/embed/${youtubeVideoId}`;

  return (
    <>
      <Section variant="light">
        <Container>
          <article className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
            <header className="space-y-5">
              <p className={eyebrowClass}>{eyebrow}</p>
              <h1 className="heading-lg text-brand-navy">{title}</h1>
              <p className="body-lg text-pretty text-neutral-600">{description}</p>
            </header>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-200 shadow-soft ring-1 ring-neutral-200/80">
              <iframe
                title={title}
                className="absolute inset-0 h-full w-full"
                src={embedSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <p className="body-sm text-neutral-500">
              Having trouble playing the video?{" "}
              <a
                href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                className="font-medium text-brand-navy underline-offset-2 hover:text-brand-gold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open it on YouTube
              </a>
              .
            </p>
          </article>
        </Container>
      </Section>
    </>
  );
}
