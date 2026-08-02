import Link from "next/link";
import type { ReactNode } from "react";

export type ExploreCatalogCardLayout = "responsive" | "compact" | "detailed";

type ExploreCatalogCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  blurb?: string | null;
  ctaLabel: string;
  /** `responsive` = compact below md, detailed from md up (default). */
  layout?: ExploreCatalogCardLayout;
  /** Soften chrome (concepts index uses transparent cards). */
  appearance?: "default" | "plain";
  titleClassName?: string;
  blurbClassName?: string;
  /** Optional badge/chip row after the eyebrow (detailed + compact). */
  badge?: ReactNode;
};

const shellDefault =
  "group min-w-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/30 shadow-sm backdrop-blur-sm transition-colors hover:border-accent/35";
const shellPlain =
  "group min-w-0 overflow-hidden rounded-md border border-border/40 bg-transparent shadow-none backdrop-blur-none transition-colors hover:border-accent/35";

function CompactBody({
  eyebrow,
  title,
  blurb,
  ctaLabel,
  titleClassName = "",
  blurbClassName = "",
  badge,
}: Omit<ExploreCatalogCardProps, "href" | "layout" | "appearance">) {
  return (
    <div className="space-y-1 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        {badge}
      </div>
      <h3
        className={`font-display text-base font-medium leading-snug tracking-tight text-fg line-clamp-2 transition-colors group-hover:text-accent sm:text-lg ${titleClassName}`}
      >
        {title}
      </h3>
      {blurb ? (
        <p className={`line-clamp-2 text-sm leading-snug text-muted ${blurbClassName}`}>{blurb}</p>
      ) : null}
      <p className="pt-0.5 text-xs text-accent">{ctaLabel}</p>
    </div>
  );
}

function DetailedBody({
  eyebrow,
  title,
  blurb,
  titleClassName = "",
  blurbClassName = "",
  badge,
}: Omit<ExploreCatalogCardProps, "href" | "layout" | "appearance" | "ctaLabel">) {
  return (
    <div className="space-y-2 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        {badge}
      </div>
      <h3
        className={`font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent ${titleClassName}`}
      >
        {title}
      </h3>
      {blurb ? (
        <p className={`line-clamp-3 text-sm leading-relaxed text-muted ${blurbClassName}`}>
          {blurb}
        </p>
      ) : null}
    </div>
  );
}

export function ExploreCatalogCard({
  href,
  eyebrow,
  title,
  blurb,
  ctaLabel,
  layout = "responsive",
  appearance = "default",
  titleClassName,
  blurbClassName,
  badge,
}: ExploreCatalogCardProps) {
  const showCompact = layout === "compact" || layout === "responsive";
  const showDetailed = layout === "detailed" || layout === "responsive";
  const isResponsive = layout === "responsive";
  const shell = appearance === "plain" ? shellPlain : shellDefault;

  return (
    <article className={shell}>
      <Link href={href} className="group block">
        {showCompact ? (
          <div className={isResponsive ? "md:hidden" : undefined}>
            <CompactBody
              eyebrow={eyebrow}
              title={title}
              blurb={blurb}
              ctaLabel={ctaLabel}
              titleClassName={titleClassName}
              blurbClassName={blurbClassName}
              badge={badge}
            />
          </div>
        ) : null}
        {showDetailed ? (
          <div className={isResponsive ? "hidden md:block" : undefined}>
            <DetailedBody
              eyebrow={eyebrow}
              title={title}
              blurb={blurb}
              titleClassName={titleClassName}
              blurbClassName={blurbClassName}
              badge={badge}
            />
          </div>
        ) : null}
      </Link>
    </article>
  );
}

/** Shared responsive grid for explore index catalogs. */
export const exploreIndexCatalogGridClassName =
  "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 xl:grid-cols-3";
