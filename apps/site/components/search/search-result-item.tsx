"use client";

import Link from "next/link";

import type { SearchHit } from "@/lib/search/query";

type SearchResultItemProps = {
  hit: SearchHit;
  rank: number;
  onSelect?: (hit: SearchHit, rank: number) => void;
};

function truncate(text: string | undefined, max: number): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function SearchResultItem({ hit, rank, onSelect }: SearchResultItemProps) {
  const { document, explanations } = hit;
  const description = truncate(document.description ?? document.subtitle, 180);
  const isExternal = Boolean(document.external);

  const metaBits = [
    document.resultLabel,
    document.status && document.status !== "published" ? document.status.replace("_", " ") : null,
    document.edition ? `edition ${document.edition}` : null,
  ].filter(Boolean);

  const content = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
          {metaBits.join(" · ")}
        </p>
        {isExternal ? (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">External</span>
        ) : null}
      </div>
      <h2 className="mt-2 font-display text-xl text-fg transition-colors group-hover:text-accent md:text-2xl">
        {document.title}
      </h2>
      {document.subtitle ? <p className="mt-1 text-sm text-muted">{document.subtitle}</p> : null}
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {explanations.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Why this result">
          {explanations.slice(0, 3).map((label) => (
            <li
              key={label}
              className="rounded-sm border border-border/60 px-2 py-0.5 text-[11px] text-muted"
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  const className =
    "group block rounded-sm border border-border/50 bg-transparent px-1 py-5 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:px-2";

  if (isExternal) {
    return (
      <a
        href={document.canonicalUrl}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onSelect?.(hit, rank)}
      >
        {content}
        <span className="sr-only">Opens in a new tab</span>
      </a>
    );
  }

  return (
    <Link href={document.canonicalUrl} className={className} onClick={() => onSelect?.(hit, rank)}>
      {content}
    </Link>
  );
}
