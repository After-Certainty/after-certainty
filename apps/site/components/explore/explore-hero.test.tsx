import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExploreIndexHero } from "@/components/explore/explore-hero";

vi.mock("next/image", () => ({
  default: function MockImage(props: { alt?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt ?? ""} />;
  },
}));

describe("ExploreIndexHero", () => {
  it("marks compact density for Books-style tighter heroes", () => {
    const { container } = render(
      <ExploreIndexHero
        eyebrow="Library"
        title="Books"
        lede="A reading library."
        headingId="books-heading"
        density="compact"
      />,
    );
    expect(container.querySelector('[data-density="compact"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Books", level: 1 })).toBeInTheDocument();
  });

  it("defaults to the standard explore density", () => {
    const { container } = render(
      <ExploreIndexHero
        eyebrow="Semantic atlas"
        title="Explore"
        lede="Enter the atlas."
        headingId="explore-heading"
      />,
    );
    expect(container.querySelector('[data-density="default"]')).toBeInTheDocument();
  });
});
