"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function PodcastError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="max-w-2xl py-24 text-center md:py-32">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">Podcast</p>
      <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-6 text-muted">
        The page could not be rendered. Podcast episodes may still be available via the RSS feed or your podcast app.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <p className="mt-4 font-mono text-xs text-muted/80">{error.message}</p>
      ) : null}
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center justify-center border border-border/55 px-8 py-3 text-xs uppercase tracking-[0.22em] text-fg transition-colors hover:border-accent/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try again
        </button>
        <Link
          href="/feed.xml"
          className="inline-flex min-h-[44px] items-center justify-center border border-accent/35 bg-accent-soft px-8 py-3 text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Open RSS
        </Link>
      </div>
    </Container>
  );
}
