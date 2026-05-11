"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useMotionValue, useTransform } from "framer-motion";

import { cn } from "@/lib/books/when-others-look-to-you/cn";
import { sectionVariantSurface } from "@/components/books/when-others-look-to-you/ui/Section";
import { assets } from "@/lib/books/when-others-look-to-you/content";

/** Scroll-linked atmospheric lighting — shared stops; position animates via backgroundPosition */
const SECTION_LIGHTING_GRADIENT =
  "linear-gradient(to right, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.18) 100%)";

/**
 * Same viewport band (section top at ~92% → ~8% of viewport height), but driven by
 * **document scrollY** between the two scroll positions that achieve those alignments.
 * Using only rect.top + clamp created a one-way “plateau”: once the top passed ~8%vh,
 * progress stuck at 1 until rect.re-entered the band — scrolling back up didn’t dim Erosion.
 */
function progressFromSectionScroll(
  scrollY: number,
  rectTop: number,
  viewportHeight: number,
): number {
  const vh = viewportHeight || 1;
  const docTop = scrollY + rectTop;
  const scrollAt0 = docTop - vh * 0.92;
  const scrollAt1 = docTop - vh * 0.08;
  const span = scrollAt1 - scrollAt0;
  if (span <= 0) return 0;
  const raw = (scrollY - scrollAt0) / span;
  return Math.min(1, Math.max(0, raw));
}

/** SVG turbulence grain — no extra assets; one filter id per column (renewal | erosion). */
function FilmGrainLayer({
  tone,
  className,
}: {
  tone: "renewal" | "erosion";
  className?: string;
}) {
  const fid =
    tone === "renewal" ? "re-film-grain-renewal" : "re-film-grain-erosion";
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 z-[7] h-full w-full overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <defs>
        <filter
          id={fid}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={tone === "renewal" ? "0.72" : "0.68"}
            numOctaves="3"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="saturate"
            values="0"
            result="gray"
          />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="white"
        filter={`url(#${fid})`}
        className={tone === "renewal" ? "opacity-[0.04]" : "opacity-[0.045]"}
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  );
}

export type RenewalErosionColumn = {
  label: string;
  heading: string;
  paragraph: string;
  items: string[];
};

export type RenewalErosionSectionProps = {
  /** Same asset as the hero (e.g. hero-bg.png); each column crops a different region */
  textureSrc?: string;
  renewal: RenewalErosionColumn;
  erosion: RenewalErosionColumn;
};

/** Distinct cool-tone icons per row */
function RenewalItemIcon({ index }: { index: number }) {
  const cls = "h-5 w-5 shrink-0 text-cyan-200/95";
  if (index === 0) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 7v10M8 12h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 4v4M12 16v4M6 12h3m6 0h3"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 14s2 3 8 3 8-3 8-3M8 10s2-3 8-3 8 3 8 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** Distinct warm-tone icons per row */
function ErosionItemIcon({ index }: { index: number }) {
  const cls = "h-5 w-5 shrink-0 text-orange-200/95";
  if (index === 0) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 9v5M12 17h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.29 3.86L2 18h20L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 16l4-6 4 4 4-8 4 10"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8v4l2 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OrDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-gold bg-brand-navy/95 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-gold shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md",
        className,
      )}
      aria-hidden
    >
      OR
    </div>
  );
}

function SplitColumn({
  tone,
  label,
  heading,
  paragraph,
  items,
  textureSrc,
  textureAlign,
  lightingBgPosition,
  lightingBleed,
  textOpacity,
  textScale,
  className,
}: RenewalErosionColumn & {
  tone: "renewal" | "erosion";
  textureSrc?: string;
  textureAlign?: "left" | "right";
  /** Full-viewport-width strip clipped per column — stacks above BGs, below copy */
  lightingBgPosition?: MotionValue<string>;
  lightingBleed?: "left" | "right";
  /** Scroll-linked copy emphasis (subtle; stacks with column opacity on parent) */
  textOpacity: MotionValue<number>;
  textScale: MotionValue<number>;
  className?: string;
}) {
  const insetLine =
    tone === "renewal"
      ? "shadow-[inset_0_1px_0_0_rgba(125,211,252,0.18)]"
      : "shadow-[inset_0_1px_0_0_rgba(251,146,60,0.2)]";

  const ItemIcon = tone === "renewal" ? RenewalItemIcon : ErosionItemIcon;

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden px-[var(--padding-inline-section)] py-8 sm:py-12 lg:min-h-[min(100%,36rem)] lg:justify-center lg:py-24",
        insetLine,
        className,
      )}
    >
      {tone === "renewal" ? (
        <>
          {/* Base — multi-stop avoids banding */}
          <div
            className="pointer-events-none absolute inset-0 isolate z-0 bg-[linear-gradient(148deg,#0c1424_0%,#142a47_38%,#1a3558_72%,#1e3f63_100%)]"
            aria-hidden
          />
          {/* Photo hint — single image, barely-there */}
          {textureSrc ? (
            <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
              <Image
                src={textureSrc}
                alt=""
                fill
                priority={false}
                quality={70}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
                className={cn(
                  "object-cover opacity-[0.045]",
                  textureAlign === "left"
                    ? "object-left"
                    : textureAlign === "right"
                      ? "object-right"
                      : "object-center",
                )}
              />
            </div>
          ) : null}
          {/* Paper grain — next/image (avoids multi‑MB raw PNG via CSS url()) */}
          <div
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-[0.09] mix-blend-soft-light"
            aria-hidden
          >
            <Image
              src={assets.pageTexture}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={70}
              loading="lazy"
              className="object-cover"
              decoding="async"
            />
          </div>
          {/* Key light — long smooth falloff */}
          <div
            className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_120%_85%_at_12%_8%,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_28%,rgba(255,255,255,0.01)_48%,transparent_72%)]"
            aria-hidden
          />
          {/* Readability veil — ultra-soft */}
          <div
            className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(165deg,transparent_20%,rgba(15,23,42,0.12)_55%,rgba(15,23,42,0.22)_100%)]"
            aria-hidden
          />
          {/* Split seam handoff */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-16 bg-gradient-to-l from-black/22 via-black/10 to-transparent to-85% lg:block xl:w-24"
            aria-hidden
          />
          <FilmGrainLayer tone="renewal" />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 isolate z-0 bg-[linear-gradient(148deg,#2c1518_0%,#4a2619_35%,#6b3418_68%,#7a3d1c_100%)]"
            aria-hidden
          />
          {textureSrc ? (
            <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
              <Image
                src={textureSrc}
                alt=""
                fill
                priority={false}
                quality={70}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
                className={cn(
                  "object-cover object-bottom opacity-[0.055]",
                  textureAlign === "right"
                    ? "object-right"
                    : textureAlign === "left"
                      ? "object-left"
                      : "object-center",
                )}
              />
            </div>
          ) : null}
          <div
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-[0.11] mix-blend-soft-light"
            aria-hidden
          >
            <Image
              src={assets.pageTexture}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={70}
              loading="lazy"
              className="object-cover"
              decoding="async"
            />
          </div>
          {/* Warm depth — gradual pool */}
          <div
            className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_130%_90%_at_88%_92%,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.08)_32%,rgba(0,0,0,0.02)_55%,transparent_78%)]"
            aria-hidden
          />
          {/* Bottom anchor — long fade, no hard line */}
          <div
            className="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(to_top,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.06)_28%,transparent_58%)]"
            aria-hidden
          />
          {/* Split seam handoff */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-16 bg-gradient-to-r from-black/26 via-black/12 to-transparent to-85% lg:block xl:w-24"
            aria-hidden
          />
          <FilmGrainLayer tone="erosion" />
        </>
      )}

      {lightingBgPosition != null && lightingBleed != null ? (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 z-[10] w-[200vw] mix-blend-soft-light",
            lightingBleed === "left" ? "left-0" : "right-0",
          )}
          style={{
            backgroundImage: SECTION_LIGHTING_GRADIENT,
            backgroundSize: "220% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: lightingBgPosition,
          }}
        />
      ) : null}

      <motion.div
        className="relative z-20 mx-auto flex w-full max-w-lg origin-left flex-col space-y-7"
        style={{ opacity: textOpacity, scale: textScale }}
      >
        <header className="space-y-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold">
            {label}
          </p>
          <h2
            className={cn(
              "heading-lg drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
              tone === "renewal"
                ? "text-cyan-100"
                : "text-orange-100",
            )}
          >
            {heading}
          </h2>
          <p className="body-lg text-pretty text-white/95 [text-shadow:0_1px_14px_rgba(0,0,0,0.35)]">
            {paragraph}
          </p>
        </header>

        <ul className="space-y-4">
          {items.map((text, i) => (
            <li
              key={`${tone}-${i}`}
              className="flex gap-4 rounded-lg py-1 transition-colors duration-200 ease-out hover:bg-white/[0.04]"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 transition-transform duration-200">
                <ItemIcon index={i} />
              </span>
              <p className="min-w-0 flex-1 body-lg leading-snug text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.25)]">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export function RenewalErosionSection({
  textureSrc,
  renewal,
  erosion,
}: RenewalErosionSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollYProgress = useMotionValue(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const scrollY =
        window.scrollY ?? document.documentElement.scrollTop ?? 0;
      scrollYProgress.set(
        progressFromSectionScroll(scrollY, rect.top, window.innerHeight),
      );
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [scrollYProgress]);
  const renewalOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const erosionOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  /** Lighting sweep: emphasis moves left → right with scroll (attention toward Erosion) */
  const lightingBgPosition = useTransform(
    scrollYProgress,
    [0, 1],
    ["5% 50%", "95% 50%"],
  );
  /** Nudge divider toward Renewal (left) as that side yields dominance — subtle balance cue */
  const dividerShiftX = useTransform(scrollYProgress, [0, 1], [0, -8]);
  /** Copy emphasis — guides attention as column dominance shifts (very subtle) */
  const renewalTextOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const renewalTextScale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);
  const erosionTextOpacity = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const erosionTextScale = useTransform(scrollYProgress, [0, 1], [0.985, 1]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={cn(sectionVariantSurface.dark, "relative overflow-hidden")}
    >
      {/* 50/50 on lg (`gap-px` shows a soft seam via grid bg); mobile: Renewal → OR → Erosion */}
      <div className="relative z-[1] grid min-h-0 w-full grid-cols-1 gap-0 lg:grid-cols-2 lg:grid-rows-1 lg:gap-px lg:bg-gradient-to-b lg:from-white/10 lg:via-white/20 lg:to-white/10">
        <motion.div
          className="order-1 min-w-0 lg:min-h-[min(100%,36rem)]"
          style={{ opacity: renewalOpacity }}
        >
          <SplitColumn
            tone="renewal"
            className="h-full min-h-0"
            textureSrc={textureSrc}
            textureAlign="left"
            lightingBgPosition={lightingBgPosition}
            lightingBleed="left"
            textOpacity={renewalTextOpacity}
            textScale={renewalTextScale}
            {...renewal}
          />
        </motion.div>
        <div className="order-2 flex justify-center border-y border-white/15 bg-gradient-to-r from-[#0f172a]/35 via-black/30 to-[#3a1f1f]/35 py-6 sm:py-8 lg:hidden">
          <motion.div style={{ x: dividerShiftX }}>
            <OrDivider />
          </motion.div>
        </div>
        <motion.div
          className="order-3 min-w-0 lg:order-2 lg:min-h-[min(100%,36rem)]"
          style={{ opacity: erosionOpacity }}
        >
          <SplitColumn
            tone="erosion"
            className="h-full min-h-0"
            textureSrc={textureSrc}
            textureAlign="right"
            lightingBgPosition={lightingBgPosition}
            lightingBleed="right"
            textOpacity={erosionTextOpacity}
            textScale={erosionTextScale}
            {...erosion}
          />
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 lg:flex lg:items-center lg:justify-center"
        aria-hidden
      >
        <motion.div style={{ x: dividerShiftX }}>
          <OrDivider />
        </motion.div>
      </div>
    </section>
  );
}
