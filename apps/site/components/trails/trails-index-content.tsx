import Link from "next/link";
import { TrailCard } from "@/components/trails/trail-card";
import { TrailSectionAnalytics } from "@/components/trails/trail-section-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedPublishedTrails } from "@/lib/trails/getEnrichedTrails";
import { slugifyTheme } from "@/lib/trails/loadTrails";
import type { EnrichedTrail } from "@/types/trails";

type TrailsIndexContentProps = {
  themeFilter?: string;
};

function groupEnrichedByTheme(
  trails: EnrichedTrail[],
): { theme: string; trails: EnrichedTrail[] }[] {
  const themeMap = new Map<string, EnrichedTrail[]>();
  for (const trail of trails) {
    for (const theme of trail.themes) {
      const bucket = themeMap.get(theme) ?? [];
      bucket.push(trail);
      themeMap.set(theme, bucket);
    }
  }
  return [...themeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([theme, grouped]) => ({ theme, trails: grouped }));
}

function filterByTheme(trails: EnrichedTrail[], themeFilter?: string): EnrichedTrail[] {
  if (!themeFilter) return trails;
  const normalized = themeFilter.toLowerCase();
  return trails.filter((trail) => trail.themes.some((theme) => slugifyTheme(theme) === normalized));
}

export async function TrailsIndexContent({ themeFilter }: TrailsIndexContentProps) {
  const allTrails = await getEnrichedPublishedTrails();
  const trails = filterByTheme(allTrails, themeFilter);
  const featured = allTrails.filter((t) => t.featured).slice(0, 4);
  const grouped = groupEnrichedByTheme(trails);
  const themes = [...new Set(allTrails.flatMap((t) => t.themes))].sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <>
      <TrailSectionAnalytics location="index" />
      <Section atmosphere="transition" className="border-b border-border/40 py-16 md:py-24">
        <Container>
          <p className="text-xs uppercase tracking-[0.42em] text-muted">Curated Reading Trails</p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium tracking-tight text-fg md:text-5xl lg:text-6xl">
            Follow a deliberate path through the commons
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Each trail is a finite, editorially composed sequence through books, concepts, patterns,
            and more—designed to help you move through a tension in order, with context for why each
            stop belongs and why one follows another.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Trails differ from{" "}
            <Link href="/questions" className="text-accent underline-offset-4 hover:underline">
              Start with a Question
            </Link>{" "}
            (tension-framed entrances) and{" "}
            <Link href="/search" className="text-accent underline-offset-4 hover:underline">
              Global Search
            </Link>{" "}
            (open-ended retrieval). They are reusable paths you can return to or share directly.
          </p>
        </Container>
      </Section>

      {featured.length > 0 && !themeFilter ? (
        <Section atmosphere="transition" className="border-b border-border/35 py-14 md:py-20">
          <Container>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
              Featured trails
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((trail) => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  location="index"
                  analytics={{
                    event: "trail_select",
                    params: { trail_id: trail.id, location: "index_featured" },
                  }}
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {themes.length > 1 ? (
        <Section atmosphere="none" className="border-b border-border/25 py-8">
          <Container>
            <nav aria-label="Trail themes" className="flex flex-wrap gap-3">
              <Link
                href="/trails"
                aria-current={themeFilter ? undefined : "page"}
                className="min-h-11 rounded-sm border border-border/50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:border-accent/50 aria-[current=page]:text-accent"
              >
                All trails
              </Link>
              {themes.map((theme) => {
                const slug = slugifyTheme(theme);
                const isActive = themeFilter === slug;
                return (
                  <Link
                    key={theme}
                    href={`/trails?theme=${slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className="min-h-11 rounded-sm border border-border/50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:border-accent/50 aria-[current=page]:text-accent"
                  >
                    {theme}
                  </Link>
                );
              })}
            </nav>
          </Container>
        </Section>
      ) : null}

      {trails.length === 0 ? (
        <Section atmosphere="none" className="border-b border-border/35 py-14 md:py-20">
          <Container>
            <p className="text-muted">
              {themeFilter
                ? "No published trails match that theme yet."
                : "No reading trails are published yet."}
            </p>
            {themeFilter ? (
              <p className="mt-4">
                <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
                  View all trails
                </Link>
              </p>
            ) : null}
          </Container>
        </Section>
      ) : (
        grouped.map(({ theme, trails: themeTrails }) => (
          <Section
            key={theme}
            id={`theme-${slugifyTheme(theme)}`}
            atmosphere="none"
            className="scroll-mt-24 border-b border-border/35 py-14 md:py-20"
          >
            <Container>
              <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
                {theme}
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {themeTrails.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    location="index"
                    analytics={{
                      event: "trail_select",
                      params: { trail_id: trail.id, location: "index" },
                    }}
                  />
                ))}
              </div>
            </Container>
          </Section>
        ))
      )}

      <Section atmosphere="none" className="py-14 md:py-20">
        <Container>
          <p className="max-w-2xl text-muted">
            Arriving with a human tension rather than a theme? Try{" "}
            <Link href="/questions" className="text-accent underline-offset-4 hover:underline">
              Start with a Question
            </Link>
            . Looking for a specific phrase?{" "}
            <Link href="/search" className="text-accent underline-offset-4 hover:underline">
              Search the commons
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
