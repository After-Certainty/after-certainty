import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DisclosureChevron } from "@/components/ui/disclosure-chevron";
import { siteIconSizes } from "@/components/icons/sizes";

describe("DisclosureChevron", () => {
  it("renders a decorative caret that rotates when expanded", () => {
    const { container, rerender } = render(<DisclosureChevron expanded={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", String(siteIconSizes.md));
    expect(svg?.className.baseVal || svg?.getAttribute("class") || "").not.toMatch(/rotate-180/);

    rerender(<DisclosureChevron expanded />);
    const expanded = container.querySelector("svg");
    expect(expanded?.className.baseVal || expanded?.getAttribute("class") || "").toMatch(
      /rotate-180/,
    );
  });

  it("renders a right caret for forward affordances", () => {
    const { container } = render(<DisclosureChevron expanded={false} direction="right" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
