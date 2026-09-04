import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListenHero } from "@/components/listen/listen-hero";

vi.mock("next/image", () => ({
  default: function MockImage(props: { alt?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt ?? ""} />;
  },
}));

describe("ListenHero", () => {
  it("keeps editorial copy and opts into mobile-tightened density", () => {
    const { container } = render(<ListenHero countLabel="32 songs" />);

    expect(screen.getByText("Listen")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Songs from After Certainty", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("32 songs")).toBeInTheDocument();
    expect(container.querySelector('[data-density="editorial"]')).toBeInTheDocument();
    expect(container.querySelector('[data-mobile-tighten="true"]')).toBeInTheDocument();
  });

  it("exposes a single Explore songs path without duplicating the mobile CTA in the desktop lede", () => {
    render(<ListenHero countLabel="32 songs" />);

    const exploreLinks = screen.getAllByRole("link", { name: /explore songs/i });
    expect(exploreLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of exploreLinks) {
      expect(link).toHaveAttribute("href", "/explore/songs");
    }

    expect(screen.getByRole("link", { name: "Explore songs →" })).toBeInTheDocument();
    expect(screen.getByText(/prefer the semantic map/i)).toBeInTheDocument();
  });
});
