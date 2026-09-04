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

  it("marks editorial density and optional count label for Patterns", () => {
    const { container } = render(
      <ExploreIndexHero
        eyebrow="Structures"
        title="Patterns"
        lede="Directional, recurring forms."
        headingId="patterns-heading"
        density="editorial"
        countLabel="43 patterns"
      />,
    );
    expect(container.querySelector('[data-density="editorial"]')).toBeInTheDocument();
    expect(container.querySelector("[data-mobile-tighten]")).not.toBeInTheDocument();
    expect(container.querySelector(".explore-page__media")).toBeInTheDocument();
    expect(container.querySelector(".explore-page__media")?.className).not.toMatch(/\bhidden\b/);
    expect(screen.getByText("43 patterns")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Patterns", level: 1 })).toBeInTheDocument();
  });

  it("marks mobileTighten only when opted in on editorial heroes", () => {
    const { container } = render(
      <ExploreIndexHero
        eyebrow="Listen"
        title="Songs from After Certainty"
        lede="Another register."
        headingId="listen-heading"
        density="editorial"
        mobileTighten
        countLabel="32 songs"
      />,
    );
    expect(container.querySelector('[data-density="editorial"]')).toBeInTheDocument();
    expect(container.querySelector('[data-mobile-tighten="true"]')).toBeInTheDocument();
    expect(screen.getByText("32 songs")).toBeInTheDocument();
  });
});

