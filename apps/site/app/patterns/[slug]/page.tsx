import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getLibraryPatternBySlug, getLibraryPatterns } from "@/lib/patterns/registry";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getLibraryPatterns().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getLibraryPatternBySlug(slug);
  if (!pattern) return {};
  return createPageMetadata({
    title: pattern.title,
    description: pattern.summary ?? pattern.description.slice(0, 160),
  });
}

export default async function PatternDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pattern = getLibraryPatternBySlug(slug);
  if (!pattern) notFound();

  const related =
    pattern.relatedPatterns
      ?.map((s) => getLibraryPatternBySlug(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)) ?? [];

  return (
    <Section className="pt-12 md:pt-16">
      <Container className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{pattern.bookTitle}</p>
        <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] tracking-tight text-fg md:text-5xl">
          {pattern.title}
        </h1>
        <div className="mt-10 space-y-6 text-base leading-[1.85] text-muted md:text-[17px]">
          <p>{pattern.description}</p>
          {pattern.excerpt ? (
            <blockquote className="border-l-2 border-accent/40 pl-6 font-display text-lg italic text-fg/95 md:text-xl">
              &ldquo;{pattern.excerpt}&rdquo;
            </blockquote>
          ) : null}
        </div>

        {related.length > 0 ? (
          <div className="mt-14 border-t border-border/35 pt-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Related structures</p>
            <ul className="mt-4 space-y-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/patterns/${p.slug}`} className="text-accent underline-offset-4 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-14 flex flex-wrap gap-6 border-t border-border/35 pt-10">
          <Link
            href="/patterns"
            className="text-xs uppercase tracking-[0.22em] text-muted transition-colors hover:text-accent"
          >
            ← Pattern library
          </Link>
          {pattern.href ? (
            <a
              href={pattern.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-accent underline-offset-4 hover:underline"
            >
              Context on book microsite →
            </a>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
