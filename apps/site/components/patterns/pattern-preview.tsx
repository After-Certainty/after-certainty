"use client";

import Link from "next/link";
import type { LibraryPattern } from "@/types/patterns-library";

type PatternPreviewProps = {
  pattern: LibraryPattern | null;
  resolveTitle: (slug: string) => string | undefined;
};

export function PatternPreview({ pattern, resolveTitle }: PatternPreviewProps) {
  if (!pattern) {
    return (
      <aside
        className="rounded-sm border border-border/35 bg-bg-elevated/[0.06] p-8 md:p-10"
        aria-label="Pattern preview"
      >
        <p className="text-sm leading-relaxed text-muted">
          Select a pattern to read a fuller observation—related structures, tensions, and optional links when
          available.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="relative overflow-hidden rounded-sm border border-border/40 bg-bg-elevated/[0.1] p-8 md:p-10"
      aria-label={`Preview: ${pattern.title}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-texture-light-bloom bg-cover bg-center mix-blend-soft-light"
        aria-hidden
      />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{pattern.bookTitle}</p>
        <h3 className="mt-4 font-display text-2xl font-medium leading-snug tracking-tight text-fg md:text-3xl">
          {pattern.title}
        </h3>
        <p className="mt-6 text-base leading-[1.8] text-muted md:text-[17px]">{pattern.description}</p>
        {pattern.excerpt ? (
          <blockquote className="mt-8 border-l-2 border-accent/40 pl-6 font-display text-lg italic leading-relaxed text-fg/90 md:text-xl">
            &ldquo;{pattern.excerpt}&rdquo;
          </blockquote>
        ) : null}
        {pattern.relatedPatterns && pattern.relatedPatterns.length > 0 ? (
          <div className="mt-10 border-t border-border/35 pt-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Related structures</p>
            <ul className="mt-4 space-y-2">
              {pattern.relatedPatterns.map((slug) => {
                const label = resolveTitle(slug);
                if (!label) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/explore/patterns/${slug}`}
                      className="text-sm text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-4 border-t border-border/35 pt-8">
          <Link
            href={`/explore/patterns/${pattern.slug}`}
            className="text-xs uppercase tracking-[0.22em] text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            Stable detail view →
          </Link>
          {pattern.href ? (
            <a
              href={pattern.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Book context (microsite) →
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
