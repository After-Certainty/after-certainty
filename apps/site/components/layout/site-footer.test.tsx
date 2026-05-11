import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    return <img src={src} alt={alt} />;
  },
}));

import { SiteFooter } from "./site-footer";
import { resolveSiteSocialLinks } from "@/lib/site-config";

describe("SiteFooter", () => {
  it("renders Elsewhere social links pointing at resolved profile URLs", () => {
    const social = resolveSiteSocialLinks();
    render(<SiteFooter />);

    const socialRegion = screen.getByLabelText("Social profiles");

    expect(within(socialRegion).getByLabelText("After Certainty on GitHub")).toHaveAttribute(
      "href",
      social.github,
    );
    expect(within(socialRegion).getByLabelText("Kevin Steffensen on Medium")).toHaveAttribute(
      "href",
      social.medium,
    );
    expect(within(socialRegion).getByLabelText("Kevin Steffensen on LinkedIn")).toHaveAttribute(
      "href",
      social.linkedIn,
    );
    expect(within(socialRegion).getByLabelText(/kstefftube on YouTube/i)).toHaveAttribute(
      "href",
      social.youtube,
    );

    for (const link of within(socialRegion).getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("lists Together footer links including GitHub and RSS", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: /^GitHub$/i })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com"),
    );
    expect(screen.getByRole("link", { name: /RSS \/ Podcast feed/i })).toBeInTheDocument();
  });
});
