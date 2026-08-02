import { describe, expect, it } from "vitest";

import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import {
  getAdjacentBooksInShelf,
  getPrimaryShelfContextForBook,
  getShelvesForBook,
  type ShelfDefinition,
} from "@/lib/books/shelves";
import type { ManifestShelf, SemanticGraph } from "@/types/semanticGraph";

function catalogBook(
  partial: Partial<CatalogBookView> & Pick<CatalogBookView, "id" | "slug">,
): CatalogBookView {
  return {
    title: partial.title ?? partial.slug,
    status: "published",
    isPublic: true,
    isCanonicalEdition: true,
    editionRelationship: "sole",
    contentType: "nonfiction",
    contentTypeLabel: "Nonfiction",
    themes: [],
    shelfIds: [],
    availability: ["online"],
    recommendedRank: 0,
    href: `/explore/books/${partial.slug}`,
    ...partial,
  };
}

const startHere: ShelfDefinition = {
  id: "shelf-start-here",
  slug: "start-here",
  title: "Start Here",
  description: "Doorways",
  displayOrder: 1,
  featured: true,
  selection: {
    mode: "curated",
    bookSlugs: [
      "curiosity-before-certainty",
      "how-serious-systems-learn",
      "trust-beyond-similarity",
    ],
  },
  maxPreview: 4,
  status: "active",
};

const fiction: ShelfDefinition = {
  id: "shelf-fiction",
  slug: "fiction",
  title: "Fiction",
  description: "Stories",
  displayOrder: 10,
  featured: false,
  selection: { mode: "rule", rule: { type: "contentType", values: ["fiction"] } },
  maxPreview: 6,
  status: "active",
};

const books = [
  catalogBook({
    id: "b1",
    slug: "curiosity-before-certainty",
    title: "Curiosity Before Certainty",
  }),
  catalogBook({
    id: "b2",
    slug: "how-serious-systems-learn",
    title: "How Serious Systems Learn",
  }),
  catalogBook({
    id: "b3",
    slug: "trust-beyond-similarity",
    title: "Trust Beyond Similarity",
  }),
  catalogBook({
    id: "b4",
    slug: "a-novel",
    title: "A Novel",
    contentType: "fiction",
    contentTypeLabel: "Fiction",
  }),
];

function toManifestShelf(shelf: ShelfDefinition): ManifestShelf {
  return {
    id: shelf.id,
    slug: shelf.slug,
    title: shelf.title,
    description: shelf.description,
    displayOrder: shelf.displayOrder,
    featured: shelf.featured,
    status: shelf.status,
    selection:
      shelf.selection.mode === "curated"
        ? { mode: "curated", bookSlugs: shelf.selection.bookSlugs }
        : { mode: "rule", rule: shelf.selection.rule },
  };
}

function graphWithShelves(...shelves: ShelfDefinition[]): SemanticGraph {
  return {
    books: [],
    glossary: [],
    patterns: [],
    sources: [],
    relationships: [],
    shelves: shelves.map(toManifestShelf),
  };
}

describe("getShelvesForBook", () => {
  it("returns active shelves that include the book, ordered by displayOrder", () => {
    const graph = graphWithShelves(fiction, startHere);
    const result = getShelvesForBook(books[0]!, graph);
    expect(result.map((s) => s.slug)).toEqual(["start-here"]);
  });

  it("includes rule-based shelves for matching content types", () => {
    const graph = graphWithShelves(startHere, fiction);
    const result = getShelvesForBook(books[3]!, graph);
    expect(result.map((s) => s.slug)).toEqual(["fiction"]);
  });
});

describe("getAdjacentBooksInShelf", () => {
  it("returns previous and next neighbors in curated order", () => {
    const adjacent = getAdjacentBooksInShelf(startHere, books[1]!, books);
    expect(adjacent).not.toBeNull();
    expect(adjacent!.index).toBe(1);
    expect(adjacent!.previous?.slug).toBe("curiosity-before-certainty");
    expect(adjacent!.next?.slug).toBe("trust-beyond-similarity");
  });

  it("returns null previous at the start and null next at the end", () => {
    const first = getAdjacentBooksInShelf(startHere, books[0]!, books);
    expect(first!.previous).toBeNull();
    expect(first!.next?.slug).toBe("how-serious-systems-learn");

    const last = getAdjacentBooksInShelf(startHere, books[2]!, books);
    expect(last!.next).toBeNull();
    expect(last!.previous?.slug).toBe("how-serious-systems-learn");
  });

  it("returns null when the book is not on the shelf", () => {
    expect(getAdjacentBooksInShelf(startHere, books[3]!, books)).toBeNull();
  });
});

describe("getPrimaryShelfContextForBook", () => {
  it("prefers a featured shelf for context", () => {
    const graph = graphWithShelves(fiction, startHere);
    const curiosity = books[0]!;
    const ctx = getPrimaryShelfContextForBook(curiosity, graph, books);
    expect(ctx?.shelf.slug).toBe("start-here");
    expect(ctx?.next?.slug).toBe("how-serious-systems-learn");
  });
});
