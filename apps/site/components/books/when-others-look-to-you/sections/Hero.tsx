import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@/components/books/when-others-look-to-you/ui/Button";
import { HeroBookImage } from "@/components/books/when-others-look-to-you/ui/HeroBookImage";
import type { HeroLeadSegment } from "@/lib/books/when-others-look-to-you/content";
import { cn } from "@/lib/books/when-others-look-to-you/cn";

export type HeroProps = {
  titleLines: readonly string[];
  leadSegments: readonly HeroLeadSegment[];
  primaryCta: { label: string; href: string };
  secondaryCta: {
    label: string;
    href: string;
    showPlayIcon?: boolean;
  };
  /** From `lib/content` / public URLs — never hardcode paths inside the Hero */
  imageSrc?: string;
  imageAlt: string;
  /** Full-bleed background from `/public/assets` (e.g. hero-bg.png) */
  backgroundSrc?: string;
};

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

export function Hero({
  titleLines,
  leadSegments,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  backgroundSrc,
}: HeroProps) {
  return (
    <section
      id="idea"
      className="relative flex min-h-0 flex-col justify-start overflow-visible border-b border-white/10 px-[var(--padding-inline-section)] py-16 sm:py-20 md:min-h-[min(82svh,52rem)] md:py-20 lg:min-h-[min(85svh,56rem)] lg:py-24"
    >
      {/* Full-bleed photo — softer on small screens so overlays dominate */}
      {backgroundSrc ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <Image
            src={backgroundSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            className="object-cover object-center opacity-[0.72] md:opacity-100"
            decoding="async"
          />
        </div>
      ) : null}

      {/* Mobile / tablet: strong uniform scrim for readability */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-black/50 md:bg-black/42 lg:hidden"
        aria-hidden
      />

      {/* Desktop: left-weighted gradient scrim */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-black/88 via-black/55 from-[8%] via-45% to-transparent to-[62%] lg:block"
        aria-hidden
      />
      {/* Vertical balance */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/25 via-transparent to-black/35 lg:to-black/45"
        aria-hidden
      />
      {/* Vignette — lighter on mobile so center copy stays clear */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.42)_100%)] opacity-75 lg:opacity-100 lg:bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-brand-navy/25 via-transparent to-brand-teal/10"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center gap-12 overflow-visible text-center",
          "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-x-12 md:gap-y-0 md:text-left",
          "lg:gap-x-16 xl:gap-x-20",
        )}
      >
        {/* Copy block: headline → lead → CTAs (mobile order; left column on md+) */}
        <div
          className={cn(
            "hero-mobile-text-in flex w-full min-w-0 max-w-2xl flex-col items-center",
            "space-y-8 md:space-y-7 lg:space-y-8",
            "md:max-w-none md:items-start md:pr-2 lg:pr-4",
          )}
        >
          <header className="contents">
            <h1
              aria-label={titleLines.join(" ")}
              className={cn(
                "w-full max-w-[95%] font-[family-name:var(--font-heading)] font-semibold text-white",
                "text-3xl leading-tight tracking-tight sm:text-4xl",
                "md:max-w-none md:text-5xl md:leading-tight lg:text-6xl",
                "drop-shadow-[0_4px_32px_rgba(0,0,0,0.85)] [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]",
              )}
            >
              {titleLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p
              className={cn(
                "hero-lead w-full max-w-[min(100%,22rem)] text-base leading-relaxed text-zinc-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.65)]",
                "sm:max-w-md sm:text-lg sm:leading-relaxed",
                "md:max-w-xl md:leading-[1.75]",
              )}
            >
              {leadSegments.map((segment, i) =>
                segment.emphasize ? (
                  <span key={i} className="font-medium text-brand-gold">
                    {segment.text}
                  </span>
                ) : (
                  <span key={i}>{segment.text}</span>
                ),
              )}
            </p>
          </header>
          <nav
            aria-label="Primary calls to action"
            className={cn(
              "flex w-full max-w-md flex-col gap-5 pt-2",
              "md:max-w-none md:flex-row md:flex-wrap md:gap-4 md:pt-1",
            )}
          >
            <Button
              className={cn(
                "w-full justify-center rounded-xl px-6 transition-all duration-300 ease-out",
                "min-h-[44px] max-md:py-3",
                "md:min-h-0 md:w-auto md:rounded-lg md:px-5 md:py-2.5",
              )}
              href={primaryCta.href}
            >
              {primaryCta.label}
            </Button>
            <Button
              href={secondaryCta.href}
              variant="secondary"
              className={cn(
                "w-full justify-center rounded-xl px-6 text-white backdrop-blur-sm",
                "min-h-[44px] transition-all duration-300 ease-out max-md:py-3",
                "md:min-h-0 md:w-auto md:rounded-lg md:px-5 md:py-2.5",
              )}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {secondaryCta.showPlayIcon ? (
                  <PlayIcon className="opacity-95" />
                ) : null}
                {secondaryCta.label}
              </span>
            </Button>
          </nav>
        </div>

        {/* Book — below copy on mobile; right column from md+ */}
        <div
          className={cn(
            "order-2 mt-8 flex w-full justify-center overflow-visible sm:mt-10",
            "md:order-2 md:mt-0 md:justify-end md:self-start",
          )}
        >
          <HeroBookImage src={imageSrc} alt={imageAlt} />
        </div>
      </div>
    </section>
  );
}
