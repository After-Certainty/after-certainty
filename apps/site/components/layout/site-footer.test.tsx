import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    return <img src={src} alt={alt} />;
  },
}));

vi.mock("@/lib/graph/manifest", () => ({
  getSemanticGraph: vi.fn().mockResolvedValue({
    books: [],
    glossary: [],
    patterns: [],
    situations: [],
    sources: [],
    relationships: [],
    generatedAt: "2026-07-06T01:36:29.934513+00:00",
  }),
}));

import { SiteFooter } from "./site-footer";
import { resolveSiteSocialLinks } from "@/lib/site-config";

describe("SiteFooter", () => {
  it("renders social links pointing at resolved profile URLs", async () => {
    const social = resolveSiteSocialLinks();
    const { container } = render(await SiteFooter());

    const socialRegion =
      container.querySelector('[data-footer-social="mobile"]') ??
      screen.getAllByLabelText("Social profiles")[0];
    expect(socialRegion).toBeTruthy();

    expect(within(socialRegion as HTMLElement).getByLabelText("After Certainty on GitHub")).toHaveAttribute(
      "href",
      social.github,
    );
    expect(within(socialRegion as HTMLElement).getByLabelText("Kevin Steffensen on Substack")).toHaveAttribute(
      "href",
      social.substack,
    );
    expect(within(socialRegion as HTMLElement).getByLabelText("Kevin Steffensen on Medium")).toHaveAttribute(
      "href",
      social.medium,
    );
    expect(within(socialRegion as HTMLElement).getByLabelText("Kevin Steffensen on LinkedIn")).toHaveAttribute(
      "href",
      social.linkedIn,
    );
    expect(within(socialRegion as HTMLElement).getByLabelText(/kstefftube on YouTube/i)).toHaveAttribute(
      "href",
      social.youtube,
    );

    for (const link of within(socialRegion as HTMLElement).getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("exposes compact mobile nav and fuller desktop Together links", async () => {
    const { container } = render(await SiteFooter());

    const mobileNav = container.querySelector('[data-footer-nav="mobile"]');
    expect(mobileNav).toBeTruthy();
    expect(within(mobileNav as HTMLElement).getByRole("link", { name: /^Explore$/i })).toHaveAttribute(
      "href",
      "/explore/books",
    );
    expect(within(mobileNav as HTMLElement).getByRole("link", { name: /^About$/i })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(within(mobileNav as HTMLElement).getByRole("link", { name: /^Search$/i })).toHaveAttribute(
      "href",
      "/search",
    );

    const desktopNav = container.querySelector('[data-footer-nav="desktop"]');
    expect(desktopNav).toBeTruthy();
    expect(within(desktopNav as HTMLElement).getByRole("link", { name: /^Search$/i })).toHaveAttribute(
      "href",
      "/search",
    );
    expect(
      within(desktopNav as HTMLElement).getByRole("link", { name: /RSS \/ Podcast feed/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^GitHub$/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("describes the monorepo corpus without sibling-repository language", async () => {
    const social = resolveSiteSocialLinks();
    const { container } = render(await SiteFooter());
    const text = container.textContent ?? "";

    expect(text).toMatch(/open corpus/i);
    expect(text).toMatch(/built directly from that shared corpus/i);
    expect(text).not.toMatch(/sibling repositories/i);
    expect(text).not.toMatch(/aggregates manifests/i);
    expect(text).not.toContain("after-certainty-site");

    expect(screen.getAllByRole("link", { name: /^GitHub$/i })[0]).toHaveAttribute(
      "href",
      social.github,
    );
    expect(social.github).toBe("https://github.com/After-Certainty/after-certainty");
  });

  it("shows semantic data date and license in the compact meta row", async () => {
    render(await SiteFooter());
    expect(screen.getByText(/Semantic data:/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /CC BY-SA 4\.0/i })).toBeInTheDocument();
  });

  it("keeps essential Together and Explore destinations in the desktop columns", async () => {
    const { container } = render(await SiteFooter());
    const togetherNav = container.querySelector('[data-footer-nav="desktop"]') as HTMLElement;
    const exploreNav = container.querySelector(
      '[data-footer-nav="desktop-explore"]',
    ) as HTMLElement;

    expect(within(togetherNav).getByRole("link", { name: /Reading Trails/i })).toHaveAttribute(
      "href",
      "/trails",
    );
    expect(within(togetherNav).getByRole("link", { name: /Collaborators/i })).toBeInTheDocument();

    expect(within(exploreNav).getByRole("link", { name: /Explore patterns/i })).toHaveAttribute(
      "href",
      "/explore/patterns",
    );
    expect(within(exploreNav).getByRole("link", { name: /Privacy & cookies/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
