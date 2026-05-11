import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { Book } from "@/types/content";

const backdropSrc = "/images/hero/hero-backdrop.png";

function catalogSummaryLine(books: Book[]): string {
  const n = books.length;
  const published = books.filter((b) => b.status === "published").length;
  const forthcoming = books.filter((b) => b.status === "forthcoming").length;
  if (published === 0) {
    return `The catalog lists ${n} long-form works—forthcoming editions, drafts in revision, and collaborative threads—offered openly as they mature.`;
  }
  return `Currently featuring ${published} published work${published === 1 ? "" : "s"} and ${Math.max(0, n - published)} active lines of inquiry across the commons (${forthcoming} forthcoming).`;
}

export function BooksHero({ books }: { books: Book[] }) {
  return (
    <section className="books-page-hero relative min-h-[min(58vh,680px)] overflow-hidden border-b border-border/45">
      <div className="books-page__media pointer-events-none absolute inset-0 z-0">
        <Image src={backdropSrc} alt="" fill priority className="object-cover object-[center_38%]" sizes="100vw" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-bg/80 via-bg/[0.15] to-bg/88" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-grain bg-cover bg-center opacity-[0.028] mix-blend-soft-light md:opacity-[0.038]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-topology-fade-start bg-cover bg-left opacity-[0.035] mix-blend-soft-light md:opacity-[0.055]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-texture-light-bloom bg-cover bg-center opacity-[0.05] mix-blend-soft-light md:opacity-[0.065]"
        aria-hidden
      />
      <div className="atm-vignette-soft pointer-events-none absolute inset-0 z-[2] opacity-[0.55] md:opacity-[0.68]" aria-hidden />
      <div
        className="books-page__scrim pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,transparent_0%,transparent_40%,color-mix(in_srgb,var(--bg)_44%,transparent)_68%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%)]"
        aria-hidden
      />

      <Container className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center md:py-32 md:text-left">
        <div className="animate-start-reveal">
          <p className="text-xs uppercase tracking-[0.42em] text-muted dark:drop-shadow-sm light:text-[rgb(255_252_248/0.82)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">
            The library
          </p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.05] tracking-[0.06em] text-balance md:text-7xl dark:text-fg dark:drop-shadow-[0_2px_28px_rgba(0,0,0,0.5)] light:text-[rgb(255_250_244/0.98)] light:[text-shadow:0_2px_26px_rgb(0_0_0/0.42)]">
            Books
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fg/88 md:mx-0 md:text-lg dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] light:text-[rgb(255_252_248/0.9)] light:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]">
            Long-form explorations of meaning, leadership, communication, authority, trust, interpretation, and human
            systems under uncertainty.
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-muted md:mx-0 md:text-[15px] dark:text-fg/65 dark:[text-shadow:0_0_18px_rgba(0,0,0,0.35)] light:text-[rgb(236_232_225/0.78)]">
            {catalogSummaryLine(books)}
          </p>
          <div className="mx-auto mt-14 h-px max-w-md bg-gradient-to-r from-transparent via-border/70 to-transparent md:mx-0" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
