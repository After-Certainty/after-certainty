import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PathwayGrid } from "@/components/home/pathway-grid";

describe("PathwayGrid", () => {
  it("offers compact explore destinations without Start Here", () => {
    render(<PathwayGrid />);

    expect(screen.getByRole("link", { name: /^Books/i })).toHaveAttribute("href", "/explore/books");
    expect(screen.getByRole("link", { name: /^Patterns/i })).toHaveAttribute(
      "href",
      "/explore/patterns",
    );
    expect(screen.getByRole("link", { name: /^Concepts/i })).toHaveAttribute(
      "href",
      "/explore/concepts",
    );
    expect(screen.getByRole("link", { name: /^Podcast/i })).toHaveAttribute("href", "/podcast");
    expect(screen.getByRole("link", { name: /^Search/i })).toHaveAttribute("href", "/search");
    expect(screen.queryByRole("link", { name: /Start Here/i })).not.toBeInTheDocument();
  });
});
