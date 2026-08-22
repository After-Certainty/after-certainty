import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Container } from "@/components/ui/container";
import { gamePaths } from "@/lib/games/paths";

/** Dedicated gold constellation on dark — not a cropped homepage mockup. */
const constellationDarkSrc = "/images/home/pattern-recognition-constellation.webp";
/** Transparent charcoal/gold network for light surfaces (no baked black rectangle). */
const constellationLightSrc = "/images/home/pattern-recognition-constellation-light.svg";

/**
 * Homepage invitation to the Pattern Recognition Challenge.
 * Compact two-column card on normal mobile widths; stacks only on very narrow screens.
 * Desktop: larger editorial feature with theme-aware constellation treatment.
 */
export function PatternRecognitionFeature() {
  const href = gamePaths.patternRecognition;
  const linkText = "Play Pattern Recognition";

  return (
    <section
      className="border-b border-border/40 bg-bg py-6 md:py-12 lg:py-14"
      aria-labelledby="home-pattern-recognition-heading"
      data-home-feature="pattern-recognition"
    >
      <Container>
        <TrackedLink
          href={href}
          className="group grid grid-cols-1 items-center gap-3 border border-border/50 bg-bg-elevated/40 px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-[360px]:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] min-[360px]:gap-3.5 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-10 md:px-8 md:py-8 light:bg-bg-elevated light:shadow-none light:hover:border-accent/50"
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
          <div className="relative mx-auto flex w-[5.25rem] shrink-0 items-center justify-center min-[360px]:mx-0 min-[360px]:w-full min-[360px]:max-w-[5.75rem] md:max-w-none md:justify-center md:px-4">
            <Image
              src={constellationDarkSrc}
              alt=""
              width={420}
              height={343}
              className="hidden h-auto w-full max-w-[14rem] object-contain object-center dark:block lg:max-w-[16rem]"
              sizes="(max-width: 359px) 84px, (max-width: 768px) 92px, 256px"
            />
            <Image
              src={constellationLightSrc}
              alt=""
              width={420}
              height={343}
              className="h-auto w-full max-w-[14rem] object-contain object-center dark:hidden lg:max-w-[16rem]"
              sizes="(max-width: 359px) 84px, (max-width: 768px) 92px, 256px"
            />
          </div>
          <div className="min-w-0 text-left md:pr-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent">See what you notice</p>
            <h2
              id="home-pattern-recognition-heading"
              className="mt-2 font-display text-lg font-medium leading-[1.2] tracking-tight text-fg transition-colors group-hover:text-accent md:text-3xl md:leading-snug"
            >
              Can you recognize the pattern?
            </h2>
            <p className="mt-2 text-sm leading-[1.4] text-muted md:mt-3 md:max-w-md md:text-base md:leading-relaxed">
              Five situations. No trivia. Look beneath what happened and identify the structure at
              work.
            </p>
            <span className="mt-3 inline-flex min-h-9 items-center text-[11px] uppercase tracking-[0.14em] text-accent transition-colors group-hover:text-fg min-[375px]:whitespace-nowrap md:mt-5 md:text-xs md:tracking-[0.2em]">
              {linkText} →
            </span>
            <p className="mt-1.5 text-xs text-muted">~3 minutes</p>
          </div>
        </TrackedLink>
      </Container>
    </section>
  );
}
