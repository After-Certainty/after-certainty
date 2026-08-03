import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompactBookRow } from "@/components/explore/compact-book-row";
import type { Book } from "@/types/semanticGraph";

const sampleBook = {
  id: "book-1",
  slug: "after-certainty",
  title: "After Certainty",
  subtitle: "A short subtitle",
  summary: "Concise summary for related-book rows.",
  coverImage: "/generated/book-covers/after-certainty/card.webp",
  coverImages: {
    detail: {
      path: "detail.webp",
      url: "/generated/book-covers/after-certainty/detail.webp",
      width: 800,
      height: 1200,
      format: "webp" as const,
      bytes: 1,
      sha256: "a",
    },
    card: {
      path: "card.webp",
      url: "/generated/book-covers/after-certainty/card.webp",
      width: 400,
      height: 600,
      format: "webp" as const,
      bytes: 1,
      sha256: "b",
    },
    thumbnail: {
      path: "thumbnail.webp",
      url: "/generated/book-covers/after-certainty/thumbnail.webp",
      width: 112,
      height: 168,
      format: "webp" as const,
      bytes: 1,
      sha256: "c",
    },
  },
} satisfies CompactBookRowFixture;

type CompactBookRowFixture = Pick<
  Book,
  "id" | "slug" | "title" | "subtitle" | "summary" | "coverImage" | "coverImages"
>;

describe("CompactBookRow", () => {
  it("renders eyebrow, title, subtitle, summary, and view link", () => {
    render(<CompactBookRow book={sampleBook} />);

    expect(screen.getByText("Book")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "After Certainty" })).toBeInTheDocument();
    expect(screen.getByText("A short subtitle")).toBeInTheDocument();
    expect(screen.getByText("Concise summary for related-book rows.")).toBeInTheDocument();
    expect(screen.getByText("View book")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /After Certainty/i });
    expect(link).toHaveAttribute("href", "/explore/books/after-certainty");
  });

  it("reserves cover box dimensions via explore tokens", () => {
    const { container } = render(<CompactBookRow book={sampleBook} />);
    const cover = container.querySelector("[data-cover-box]");
    expect(cover).toBeTruthy();
    expect(cover).toHaveStyle({
      width: "var(--explore-cover-list-w)",
      height: "var(--explore-cover-list-h)",
    });
  });

  it("clamps long titles without overflowing the row", () => {
    render(
      <CompactBookRow
        book={{
          ...sampleBook,
          title:
            "An Extremely Long Book Title That Should Clamp Rather Than Stretch The Layout Horizontally",
        }}
      />,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.className).toMatch(/line-clamp-2/);
    expect(heading.parentElement?.className).toMatch(/min-w-0/);
  });

  it("omits description when showDescription is false", () => {
    render(<CompactBookRow book={sampleBook} showDescription={false} />);
    expect(screen.getByText("A short subtitle")).toBeInTheDocument();
    expect(
      screen.queryByText("Concise summary for related-book rows."),
    ).not.toBeInTheDocument();
  });

  it("renders without a cover image when none is available", () => {
    render(
      <CompactBookRow
        book={{ id: "book-2", slug: "untitled", title: "Untitled Work" }}
        coverImage={null}
      />,
    );
    expect(screen.getByRole("heading", { name: "Untitled Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Untitled Work/i })).toHaveAttribute(
      "href",
      "/explore/books/untitled",
    );
  });
});
