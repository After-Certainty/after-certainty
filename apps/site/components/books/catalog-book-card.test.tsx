import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CatalogBookCard } from "@/components/books/catalog-book-card";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";

const sampleBook: CatalogBookView = {
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
  shelfIds: ["core-after-certainty"],
  availability: ["online", "download"],
  recommendedRank: 0,
  href: "/explore/books/after-certainty",
};

describe("CatalogBookCard", () => {
  it("renders title, type badge, and download availability", () => {
    render(<CatalogBookCard book={sampleBook} location="catalog" />);
    expect(screen.getByRole("heading", { name: "After Certainty" })).toBeInTheDocument();
    expect(screen.getByText("Nonfiction")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.queryByText("Read online")).not.toBeInTheDocument();
  });

  it("shows upcoming badge for forthcoming books", () => {
    render(<CatalogBookCard book={{ ...sampleBook, status: "forthcoming" }} location="catalog" />);
    expect(screen.getByLabelText("Upcoming")).toBeInTheDocument();
  });

  it("shows companion chip and omits primary volume badge", () => {
    render(
      <CatalogBookCard
        book={{
          ...sampleBook,
          slug: "when-others-look-to-you-v2",
          isCanonicalEdition: false,
          editionRelationship: "companion",
          editionLabel: "Companion edition",
        }}
        location="catalog"
      />,
    );
    expect(screen.getByLabelText("Companion edition")).toBeInTheDocument();

    render(
      <CatalogBookCard
        book={{
          ...sampleBook,
          editionRelationship: "primary",
          editionLabel: "Primary volume",
        }}
        location="catalog"
      />,
    );
    expect(screen.queryByText("Primary volume")).not.toBeInTheDocument();
  });
});
