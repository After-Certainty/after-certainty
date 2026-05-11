import { getAllPatterns, patternGroups } from "@/lib/books/when-others-look-to-you/content";
import type { PatternCardItem } from "@/lib/books/when-others-look-to-you/content";
import patternsFile from "@/data/patterns.json";
import type { Pattern as LegacyPattern } from "@/types/content";
import type { LibraryPattern, PatternBookSection } from "@/types/patterns-library";
import { howMeaningMovesPatterns } from "@/lib/patterns/how-meaning-moves-patterns";
import { observerPatternsPlaceholders } from "@/lib/patterns/placeholders";

const WOLTY_BOOK_SLUG = "when-others-look-to-you";
const WOLTY_BOOK_TITLE = "When Others Look to You";

function fromWolty(p: PatternCardItem): LibraryPattern {
  const groupMeta = patternGroups[p.detail.group];
  const themes = [groupMeta.title];

  return {
    id: `${WOLTY_BOOK_SLUG}::${p.slug}`,
    slug: p.slug,
    title: p.title,
    description: p.detail.observation,
    summary: p.description,
    excerpt: p.detail.quote,
    bookSlug: WOLTY_BOOK_SLUG,
    bookTitle: WOLTY_BOOK_TITLE,
    themes,
    relatedPatterns: p.detail.relatedPatterns.map((r) => r.slug),
    href: p.href,
  };
}

function fromLegacy(p: LegacyPattern): LibraryPattern {
  return {
    id: `after-certainty::${p.slug}`,
    slug: p.slug,
    title: p.title,
    description: p.summary,
    summary: p.summary,
    bookSlug: "after-certainty",
    bookTitle: "After Certainty",
    themes: p.domain ? [titleCaseDomain(p.domain)] : ["General"],
  };
}

function titleCaseDomain(domain: string): string {
  return domain
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Flat list — all sources merged */
export function getLibraryPatterns(): LibraryPattern[] {
  const wolty = getAllPatterns().map(fromWolty);
  const legacy = (patternsFile.patterns as LegacyPattern[]).map(fromLegacy);
  return [...wolty, ...howMeaningMovesPatterns, ...observerPatternsPlaceholders, ...legacy];
}

/** Ordered sections for the explorer UI */
export function getPatternBookSections(): PatternBookSection[] {
  const wolty = getAllPatterns().map(fromWolty);

  return [
    {
      bookSlug: WOLTY_BOOK_SLUG,
      bookTitle: WOLTY_BOOK_TITLE,
      intro:
        "Named dynamics from the book—how influence gathers, renews, erodes, and spreads when others are watching you lead. Hold them lightly: they describe what tends to repeat, not what must hold in every room.",
      patterns: wolty,
    },
    {
      bookSlug: "how-meaning-moves",
      bookTitle: "How Meaning Moves",
      intro:
        "A language for how meaning moves—grouped as Formation, Completion, Movement, Resolution, and Reinforcement. Each entry names a familiar dynamic in live conversation before anyone has settled the words; use them to notice, not to prescribe.",
      patterns: howMeaningMovesPatterns,
    },
    {
      bookSlug: "observer-patterns",
      bookTitle: "Observer Patterns",
      intro: "Draft observational lenses on institutional attention—what gets noticed, deferred, or renamed.",
      patterns: observerPatternsPlaceholders,
    },
    {
      bookSlug: "after-certainty",
      bookTitle: "After Certainty",
      intro: "Cross-cutting notes documented early for the commons—subject to revision as conversations accumulate.",
      patterns: (patternsFile.patterns as LegacyPattern[]).map(fromLegacy),
    },
    {
      bookSlug: "future-works",
      bookTitle: "Future Works",
      intro:
        "Additional titles and collaborators may contribute patterns as manuscripts mature—this shelf stays deliberately open.",
      patterns: [],
    },
  ];
}

export function getLibraryPatternBySlug(slug: string): LibraryPattern | undefined {
  return getLibraryPatterns().find((p) => p.slug === slug);
}

/** Distinct theme labels across the registry */
export function getAllPatternThemes(patterns: LibraryPattern[]): string[] {
  const set = new Set<string>();
  for (const p of patterns) {
    for (const t of p.themes) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
