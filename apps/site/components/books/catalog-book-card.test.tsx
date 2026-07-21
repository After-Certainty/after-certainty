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
  contentType: "nonfiction",
  themes: [],
  shelfIds: ["core-after-certainty"],
  availability: ["online", "download"],
  recommendedRank: 0,
  href: "/explore/books/after-certainty",
};

describe("CatalogBookCard", () => {
  it("renders title, type badge, and availability", () => {
    render(<CatalogBookCard book={sampleBook} location="catalog" />);
    expect(screen.getByRole("heading", { name: "After Certainty" })).toBeInTheDocument();
    expect(screen.getByText("Nonfiction")).toBeInTheDocument();
    expect(screen.getByText("Read online")).toBeInTheDocument();
  });

  it("shows upcoming badge for forthcoming books", () => {
    render(<CatalogBookCard book={{ ...sampleBook, status: "forthcoming" }} location="catalog" />);
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });
});
