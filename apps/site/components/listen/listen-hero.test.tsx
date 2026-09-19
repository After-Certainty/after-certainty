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
  it("keeps editorial copy and opts into mobile- and desktop-tightened density", () => {
    const { container } = render(<ListenHero countLabel="32 songs" />);

    expect(screen.getByText("Listen")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Songs from After Certainty", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText("The same questions, carried in another register."),
    ).toBeInTheDocument();
    expect(screen.getByText("32 songs")).toBeInTheDocument();
    expect(container.querySelector('[data-density="editorial"]')).toBeInTheDocument();
    expect(container.querySelector('[data-mobile-tighten="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-desktop-tighten="true"]')).toBeInTheDocument();
  });

  it("places Explore songs beside the count without the semantic-map sentence", () => {
    render(<ListenHero countLabel="32 songs" />);

    const exploreLinks = screen.getAllByRole("link", { name: /explore songs/i });
    expect(exploreLinks).toHaveLength(1);
    expect(exploreLinks[0]).toHaveAttribute("href", "/explore/songs");
    expect(screen.queryByText(/prefer the semantic map/i)).not.toBeInTheDocument();
  });
});
