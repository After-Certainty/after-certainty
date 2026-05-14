import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types/content";
import { ThemeTag } from "@/components/books/theme-tag";
import { getBookDetailHref } from "@/lib/content-data";
import { siteConfig } from "@/lib/site-config";

function statusLabel(status: Book["status"]): string {
  switch (status) {
    case "forthcoming":
      return "Forthcoming";
    case "published":
      return "Published";
    case "draft":
      return "In revision";
    case "in_progress":
      return "In progress";
    case "collaborative":
      return "Collaborative";
    default:
      return status;
  }
}

export function FeaturedBook({ book }: { book: Book }) {
  const githubHref = book.githubUrl ?? book.repositoryUrl ?? siteConfig.githubUrl;
  const podcastHref = book.relatedPodcastHref ?? "/podcast";
  const hasEpub = Boolean(book.epubUrl);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16 xl:gap-24">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-sm border border-border/45 bg-bg-elevated shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] lg:mx-0 lg:max-w-none">
        {book.coverImage ? (
          <Image src={book.coverImage} alt="" fill className="object-cover" sizes="(max-width:1024px) 90vw, 340px" priority />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/[0.14] via-bg-elevated to-[#050506]"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent opacity-70 md:opacity-50" aria-hidden />
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.32em] text-accent">{statusLabel(book.status)}</p>
        <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">{book.title}</h2>
        {book.subtitle ? <p className="mt-4 text-lg text-muted md:text-xl">{book.subtitle}</p> : null}
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">{book.description}</p>

        {book.themes && book.themes.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {book.themes.map((t) => (
              <li key={t}>
                <ThemeTag>{t}</ThemeTag>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-6 text-sm text-muted">
          <span className="text-fg/90">{book.authors.join(", ")}</span>
          {book.year ? <span className="text-muted"> · {book.year}</span> : null}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={getBookDetailHref(book.slug)}
            className="inline-flex items-center justify-center rounded-sm border border-accent/55 bg-accent-soft px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent shadow-[0_0_24px_var(--glow)] transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Read more
          </Link>
          <Link
            href={podcastHref}
            className="inline-flex items-center justify-center rounded-sm border border-border/70 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Listen to related podcast
          </Link>
          <Link
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm border border-border/70 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View on GitHub
          </Link>
          {hasEpub ? (
            <Link
              href={book.epubUrl!}
              className="inline-flex items-center justify-center rounded-sm border border-border/70 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Download EPUB
            </Link>
          ) : (
            <span
              className="inline-flex cursor-not-allowed items-center justify-center rounded-sm border border-border/35 px-6 py-3 text-sm uppercase tracking-[0.2em] text-muted/55"
              title="Digital edition not yet released"
            >
              EPUB — soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
