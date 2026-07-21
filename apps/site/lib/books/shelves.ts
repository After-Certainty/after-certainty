import { FRONT_SHELF_ENTRIES } from "@/lib/start/front-shelf";
import type { BookStatus } from "@/types/content";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { BookAvailabilityFlag } from "@/lib/books/book-metadata";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";

export type ShelfRule =
  | { type: "status"; values: BookStatus[] }
  | { type: "contentType"; values: ContentType[] }
  | { type: "availability"; values: BookAvailabilityFlag[] }
  | { type: "allPublic" };

export type ShelfSelection =
  { mode: "curated"; bookSlugs: string[] } | { mode: "rule"; rule: ShelfRule };

export type ShelfDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  displayOrder: number;
  featured: boolean;
  selection: ShelfSelection;
  maxPreview: number;
  status: "active" | "hidden";
};

export const BOOK_SHELVES: readonly ShelfDefinition[] = [
  {
    id: "start-here",
    slug: "start-here",
    title: "Start Here",
    description:
      "Different doors into the same terrain — curiosity, systems, trust, perspective, story, and judgment after certainty fails.",
    displayOrder: 1,
    featured: false,
    maxPreview: FRONT_SHELF_ENTRIES.length,
    status: "active",
    selection: {
      mode: "curated",
      bookSlugs: FRONT_SHELF_ENTRIES.map((e) => e.slug),
    },
  },
  {
    id: "core-after-certainty",
    slug: "core-after-certainty",
    title: "Core After Certainty",
    description: "Central volumes that anchor the project’s thesis and recurring tensions.",
    displayOrder: 2,
    featured: true,
    maxPreview: 4,
    status: "active",
    selection: {
      mode: "curated",
      bookSlugs: [
        "after-certainty",
        "curiosity-before-certainty",
        "trust-beyond-similarity",
        "what-we-cannot-see",
        "coupling",
        "how-serious-systems-learn",
      ],
    },
  },
  {
    id: "trust-and-difference",
    slug: "trust-and-difference",
    title: "Trust and Difference",
    description:
      "How trust forms, drifts, and remains possible across disagreement and partial perspective.",
    displayOrder: 3,
    featured: true,
    maxPreview: 4,
    status: "active",
    selection: {
      mode: "curated",
      bookSlugs: [
        "trust-beyond-similarity",
        "how-trust-forms",
        "when-trust-stops-tracking-reality",
        "why-diversity-matters",
      ],
    },
  },
  {
    id: "leadership-and-authority",
    slug: "leadership-and-authority",
    title: "Leadership and Authority",
    description:
      "When others look to you — and when authority, accountability, and moral seriousness scale.",
    displayOrder: 4,
    featured: false,
    maxPreview: 4,
    status: "active",
    selection: {
      mode: "curated",
      bookSlugs: [
        "when-others-look-to-you-v1",
        "when-authority-is-misread",
        "when-authority-outlives-accountability",
        "when-moral-seriousness-scales",
        "when-others-become-leaders",
      ],
    },
  },
  {
    id: "systems-and-organizations",
    slug: "systems-and-organizations",
    title: "Systems and Organizations",
    description:
      "Coupling, learning under pressure, collaboration, and incentive design in serious systems.",
    displayOrder: 5,
    featured: true,
    maxPreview: 4,
    status: "active",
    selection: {
      mode: "curated",
      bookSlugs: [
        "coupling",
        "how-serious-systems-learn",
        "why-collaboration-is-so-hard",
        "when-incentives-become-the-moral-language",
        "when-accountability-no-longer-expires",
      ],
    },
  },
  {
    id: "fiction",
    slug: "fiction",
    title: "Fiction",
    description:
      "Story doorways into uncertainty, coordination, and what people build when no one has the complete map.",
    displayOrder: 6,
    featured: false,
    maxPreview: 4,
    status: "active",
    selection: { mode: "rule", rule: { type: "contentType", values: ["fiction"] } },
  },
  {
    id: "practical-handbooks",
    slug: "practical-handbooks",
    title: "Practical Handbooks",
    description:
      "Applied guides for teams and institutions improving under pressure without perfect information.",
    displayOrder: 7,
    featured: false,
    maxPreview: 4,
    status: "active",
    selection: { mode: "rule", rule: { type: "contentType", values: ["handbook"] } },
  },
  {
    id: "upcoming",
    slug: "upcoming",
    title: "Upcoming",
    description: "Forthcoming and in-progress volumes not yet fully available.",
    displayOrder: 8,
    featured: false,
    maxPreview: 6,
    status: "active",
    selection: {
      mode: "rule",
      rule: { type: "status", values: ["forthcoming", "in_progress", "collaborative"] },
    },
  },
  {
    id: "complete-catalog",
    slug: "complete-catalog",
    title: "Complete catalog",
    description: "Every published volume in the library.",
    displayOrder: 99,
    featured: false,
    maxPreview: 999,
    status: "hidden",
    selection: { mode: "rule", rule: { type: "allPublic" } },
  },
] as const;

const UPCOMING_STATUSES = new Set<BookStatus>(["forthcoming", "in_progress", "collaborative"]);

export function getActiveShelves(): ShelfDefinition[] {
  return BOOK_SHELVES.filter((s) => s.status === "active").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function getShelfBySlug(slug: string): ShelfDefinition | undefined {
  return BOOK_SHELVES.find((s) => s.slug === slug && s.status === "active");
}

function bookMatchesRule(book: CatalogBookView, rule: ShelfRule): boolean {
  switch (rule.type) {
    case "allPublic":
      return book.isPublic;
    case "status":
      return rule.values.includes(book.status);
    case "contentType":
      return rule.values.includes(book.contentType);
    case "availability":
      return rule.values.some((flag) => book.availability.includes(flag));
  }
}

/** Resolve shelf membership preserving curated order. */
export function resolveShelfBooks(
  shelf: ShelfDefinition,
  viewModel: readonly CatalogBookView[],
): CatalogBookView[] {
  const bySlug = new Map(viewModel.map((b) => [b.slug, b]));

  if (shelf.selection.mode === "curated") {
    const out: CatalogBookView[] = [];
    for (const slug of shelf.selection.bookSlugs) {
      const book = bySlug.get(slug);
      if (book?.isPublic && book.isCanonicalEdition) out.push(book);
    }
    return out;
  }

  const rule = shelf.selection.rule;
  return viewModel.filter(
    (book) => book.isPublic && book.isCanonicalEdition && bookMatchesRule(book, rule),
  );
}

export function bookOnShelf(shelf: ShelfDefinition, book: CatalogBookView): boolean {
  if (!book.isPublic || !book.isCanonicalEdition) return false;
  if (shelf.selection.mode === "curated") {
    return shelf.selection.bookSlugs.includes(book.slug);
  }
  return bookMatchesRule(book, shelf.selection.rule);
}

export function assignShelfIds(viewModel: CatalogBookView[]): CatalogBookView[] {
  const activeShelves = getActiveShelves();
  return viewModel.map((book) => {
    const shelfIds = activeShelves.filter((s) => bookOnShelf(s, book)).map((s) => s.id);
    return { ...book, shelfIds };
  });
}

export function isUpcomingStatus(status: BookStatus): boolean {
  return UPCOMING_STATUSES.has(status);
}
