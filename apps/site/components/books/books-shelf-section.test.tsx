import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BooksShelfSection } from "@/components/books/books-shelf-section";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import type { ShelfDefinition } from "@/lib/books/shelves";

const shelf: ShelfDefinition = {
  id: "shelf-start-here",
  slug: "start-here",
  title: "Start Here",
  description: "A short doorway into the library.",
  displayOrder: 1,
  featured: true,
  selection: { mode: "curated", bookSlugs: ["after-certainty"] },
  maxPreview: 4,
  status: "active",
};

const book: CatalogBookView = {
  id: "book-1",
  slug: "after-certainty",
  title: "After Certainty",
  subtitle: "Subtitle",
  description: "Description text",
  status: "published",
  isPublic: true,
  isCanonicalEdition: true,
  editionRelationship: "sole",
  contentType: "nonfiction",
  contentTypeLabel: "Nonfiction",
  themes: [],
  shelfIds: ["start-here"],
  availability: ["online"],
  recommendedRank: 0,
  href: "/explore/books/after-certainty",
};

describe("BooksShelfSection", () => {
  it("renders a mobile accordion button with count and aria attributes", () => {
    render(
      <BooksShelfSection
        shelf={shelf}
        books={[book]}
        totalCount={4}
        defaultOpen={false}
        showViewAll={false}
      />,
    );

    const toggle = screen.getByRole("button", { name: /Start Here/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
    expect(screen.getByText("4 books")).toBeInTheDocument();
  });

  it("starts open when defaultOpen is true and toggles on click", async () => {
    const user = userEvent.setup();
    render(
      <BooksShelfSection
        shelf={shelf}
        books={[book]}
        totalCount={1}
        defaultOpen
        showViewAll={false}
      />,
    );

    const toggle = screen.getByRole("button", { name: /Start Here/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: /After Certainty/i }).length).toBeGreaterThan(0);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders mobile list layout cards when expanded", () => {
    const { container } = render(
      <BooksShelfSection
        shelf={shelf}
        books={[book]}
        totalCount={1}
        defaultOpen
        showViewAll={false}
      />,
    );
    expect(container.querySelector('[data-books-layout="list"]')).toBeInTheDocument();
  });
});
