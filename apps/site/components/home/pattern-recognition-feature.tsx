import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Container } from "@/components/ui/container";
import { gamePaths } from "@/lib/games/paths";

const patternRecognitionSrc = "/images/home/pattern-recognition.webp";

/**
 * Homepage invitation to the Pattern Recognition Challenge — image-led, not a directory tile.
 */
export function PatternRecognitionFeature() {
  const href = gamePaths.patternRecognition;
  const linkText = "Play Pattern Recognition";

  return (
    <section
      className="border-b border-border/40 bg-bg py-8 md:py-14"
      aria-labelledby="home-pattern-recognition-heading"
      data-home-feature="pattern-recognition"
    >
      <Container>
        <div className="overflow-hidden border border-border/50 bg-bg-elevated/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-stretch">
          <div className="relative aspect-[4/5] max-h-[280px] w-full bg-bg-elevated/60 md:aspect-auto md:max-h-none md:min-h-[280px]">
            <Image
              src={patternRecognitionSrc}
              alt="Constellation of connected situations suggesting pattern recognition"
              fill
              className="object-cover object-[center_28%]"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-6 md:px-8 md:py-8">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent">See what you notice</p>
            <h2
              id="home-pattern-recognition-heading"
              className="mt-2 font-display text-2xl font-medium tracking-tight text-fg md:text-3xl"
            >
              Can you recognize the pattern?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Five situations. No trivia. Look beneath what happened and identify the structure at
              work.
            </p>
            <TrackedLink
              href={href}
              className="mt-5 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              data-testid="home-pattern-recognition-cta"
              analytics={{
                event: "click",
                params: {
                  link_url: href,
                  link_text: linkText,
                  location: "home_pattern_recognition",
                },
              }}
            >
              {linkText} →
            </TrackedLink>
            <p className="mt-2 text-xs text-muted">~3 minutes</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
