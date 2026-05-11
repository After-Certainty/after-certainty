import type { Book } from "@/types/content";

/** Editorial vocabulary — merged with themes declared on books for the `/books` themes band */
const EDITORIAL_THEMES = [
  "Leadership",
  "Meaning",
  "Trust",
  "Authority",
  "Communication",
  "Interpretation",
  "Coordination",
  "Systems",
  "Uncertainty",
] as const;

export function mergeCatalogThemes(books: Book[]): string[] {
  const set = new Set<string>();
  for (const t of EDITORIAL_THEMES) set.add(t);
  for (const b of books) {
    for (const t of b.themes ?? []) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
