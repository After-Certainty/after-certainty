import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CaretDownIcon } from "@/components/icons/approved";
import { SiteIcon } from "@/components/icons/site-icon";
import { siteIconSizes } from "@/components/icons/sizes";

describe("SiteIcon", () => {
  it("defaults to decorative aria-hidden and md size", () => {
    const { container } = render(<SiteIcon icon={CaretDownIcon} className="text-muted" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", String(siteIconSizes.md));
    expect(svg).toHaveAttribute("height", String(siteIconSizes.md));
  });

  it("honors size tokens and non-decorative mode", () => {
    const { container } = render(
      <SiteIcon icon={CaretDownIcon} size="sm" decorative={false} aria-label="Expand" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", String(siteIconSizes.sm));
    expect(svg).not.toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("aria-label", "Expand");
  });
});
