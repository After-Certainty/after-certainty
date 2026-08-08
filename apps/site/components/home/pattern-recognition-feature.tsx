import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Container } from "@/components/ui/container";
import { gamePaths } from "@/lib/games/paths";

/** Dedicated gold constellation on dark — not a cropped homepage mockup. */
const constellationSrc = "/images/home/pattern-recognition-constellation.webp";

/**
 * Homepage invitation to the Pattern Recognition Challenge.
 * Compact two-column card on normal mobile widths; stacks only on very narrow screens.
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
        <TrackedLink
          href={href}
          className="group grid grid-cols-1 items-center gap-4 border border-border/50 bg-bg-elevated/40 px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-[360px]:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] min-[360px]:gap-5 md:gap-8 md:px-6 md:py-6"
          data-testid="home-pattern-recognition-cta"
          aria-labelledby="home-pattern-recognition-heading"
          analytics={{
            event: "click",
            params: {
              link_url: href,
              link_text: linkText,
              location: "home_pattern_recognition",
            },
          }}
        >
          <div className="relative mx-auto aspect-[3/2] w-full max-w-[9.5rem] min-[360px]:mx-0 min-[360px]:max-w-none md:max-w-[11rem]">
            <Image
              src={constellationSrc}
              alt=""
              width={900}
              height={600}
              className="h-full w-full object-contain object-center"
              sizes="(max-width: 359px) 152px, (max-width: 768px) 34vw, 176px"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent">See what you notice</p>
            <h2
              id="home-pattern-recognition-heading"
              className="mt-1.5 font-display text-xl font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent md:text-2xl"
            >
              Can you recognize the pattern?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Five situations. No trivia. Look beneath what happened and identify the structure at
              work.
            </p>
            <span className="mt-3 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
              {linkText} →
            </span>
            <p className="mt-1 text-xs text-muted">~3 minutes</p>
          </div>
        </TrackedLink>
      </Container>
    </section>
  );
}
