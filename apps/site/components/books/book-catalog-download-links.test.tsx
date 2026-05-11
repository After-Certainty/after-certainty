import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookCatalogDownloadLinks } from "./book-catalog-download-links";

describe("BookCatalogDownloadLinks", () => {
  it("renders nothing when there are no links", () => {
    const { container } = render(<BookCatalogDownloadLinks links={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders download links with outbound attributes", () => {
    render(
      <BookCatalogDownloadLinks
        links={[
          { label: "EPUB", href: "https://example.com/a.epub" },
          { label: "PDF", href: "https://example.com/a.pdf" },
        ]}
      />,
    );

    const region = screen.getByRole("region", { name: /downloads/i });
    expect(region).toBeInTheDocument();

    const epub = screen.getByRole("link", { name: /download epub/i });
    expect(epub).toHaveAttribute("href", "https://example.com/a.epub");
    expect(epub).toHaveAttribute("target", "_blank");
    expect(epub).toHaveAttribute("rel", "noopener noreferrer");

    const pdf = screen.getByRole("link", { name: /download pdf/i });
    expect(pdf).toHaveAttribute("href", "https://example.com/a.pdf");
  });
});
