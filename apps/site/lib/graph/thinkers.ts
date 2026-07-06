import type { SemanticGraph, Source } from "@/types/semanticGraph";

/** Person or institution aggregated from enriched source metadata. */
export interface DerivedThinker {
  id: string;
  slug: string;
  name: string;
  type: "person" | "organization";
  summary?: string;
  works: string[];
  concepts: string[];
  patterns: string[];
  relatedBooks: string[];
  whyThisMatters?: string;
}

const INSTITUTIONAL_SOURCE_KINDS = new Set(["institutional_document", "report", "standard"]);

function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set(values)];
}

function parseAuthorFromSourceName(name: string): string | null {
  const sep = " — ";
  const idx = name.indexOf(sep);
  if (idx <= 0) return null;
  return name.slice(0, idx).trim() || null;
}

function slugifyThinkerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function thinkerSlugForSource(source: Source): string | null {
  const fromSlug = source.creatorSlugs?.[0]?.trim();
  if (fromSlug) return fromSlug;

  const author = source.creatorNames?.[0]?.trim() ?? parseAuthorFromSourceName(source.name);
  if (!author) return null;

  const slug = slugifyThinkerName(author);
  return slug || null;
}

function thinkerNameForSource(source: Source, slug: string): string {
  if (source.creatorNames?.[0]?.trim()) return source.creatorNames[0].trim();
  const parsed = parseAuthorFromSourceName(source.name);
  if (parsed) return parsed;
  return slug.replace(/-/g, " ");
}

function isInstitutionalSource(source: Source): boolean {
  const kind = source.sourceKind ?? source.type;
  return INSTITUTIONAL_SOURCE_KINDS.has(kind);
}

/**
 * Aggregate thinkers from enriched sources when `manifest.thinkers` is absent.
 * Returns an empty array when no source has `creatorSlugs`.
 */
export function deriveThinkersFromSources(
  sources: Source[],
  _graph?: SemanticGraph,
): DerivedThinker[] {
  const hasCreatorSlugs = sources.some((s) => (s.creatorSlugs?.length ?? 0) > 0);
  if (!hasCreatorSlugs) return [];

  const bySlug = new Map<string, { sources: Source[] }>();

  for (const source of sources) {
    const slug = thinkerSlugForSource(source);
    if (!slug) continue;

    const bucket = bySlug.get(slug);
    if (bucket) {
      bucket.sources.push(source);
    } else {
      bySlug.set(slug, { sources: [source] });
    }
  }

  const thinkers: DerivedThinker[] = [];

  for (const [slug, { sources: grouped }] of bySlug) {
    const representative = grouped[0]!;
    const allInstitutional = grouped.every(isInstitutionalSource);

    thinkers.push({
      id: `thinker-${slug}`,
      slug,
      name: thinkerNameForSource(representative, slug),
      type: allInstitutional ? "organization" : "person",
      summary: representative.whyThisMatters ?? representative.summary,
      works: uniqueStrings(grouped.map((s) => s.id)),
      concepts: uniqueStrings(grouped.flatMap((s) => s.concepts ?? [])),
      patterns: uniqueStrings(grouped.flatMap((s) => s.patterns ?? [])),
      relatedBooks: uniqueStrings(grouped.flatMap((s) => s.relatedBooks ?? [])),
      whyThisMatters: representative.whyThisMatters,
    });
  }

  return thinkers.sort((a, b) => a.name.localeCompare(b.name));
}
