"use client";

import Link from "next/link";

import type { SearchHit } from "@/lib/search/query";
import { snippetSegments } from "@/lib/search/snippets";

type SearchResultItemProps = {
  hit: SearchHit;
  rank: number;
  onSelect?: (hit: SearchHit, rank: number) => void;
};

function SearchSnippetText({ hit }: { hit: SearchHit }) {
  if (!hit.snippet?.text) return null;
  const segments = snippetSegments(hit.snippet);

  return (
    <p className="mt-3 text-sm leading-relaxed text-muted">
      {segments.map((segment, index) =>
        segment.highlight ? (
          <mark key={`h-${index}-${segment.text}`} className="bg-accent-soft/80 text-fg">
            {segment.text}
          </mark>
        ) : (
          <span key={`t-${index}-${segment.text.slice(0, 12)}`}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

export function SearchResultItem({ hit, rank, onSelect }: SearchResultItemProps) {
  const { document, explanations } = hit;
  const isExternal = Boolean(document.external);

  const metaBits = [
    document.contextLabel ?? document.resultLabel,
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
      <SearchSnippetText hit={hit} />
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
