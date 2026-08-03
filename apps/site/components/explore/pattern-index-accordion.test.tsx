import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PatternIndexAccordion } from "@/components/explore/pattern-index-accordion";
import type { Pattern } from "@/types/semanticGraph";

const patterns = [
  {
    id: "pattern-a",
    slug: "certainty-hardens",
    title: "Certainty Hardens",
    summary: "Composed summary.",
    patternRole: "supporting",
    realityDynamic: "obscuring",
    observation: "Certainty settles before the situation has finished speaking.",
    problem: "Inquiry closes too early.",
  },
  {
    id: "pattern-b",
    slug: "contact-renews",
    title: "Contact Renews Perception",
    summary: "Other summary.",
    patternRole: "supporting",
    realityDynamic: "corrective",
    observation: "Contact reopens what certainty sealed.",
  },
] as Pattern[];

describe("PatternIndexAccordion", () => {
  it("renders compact rows with eyebrows and single-open behavior", async () => {
    const user = userEvent.setup();
    render(<PatternIndexAccordion patterns={patterns} />);

    const first = screen.getByRole("button", { name: /Certainty Hardens/i });
    const second = screen.getByRole("button", { name: /Contact Renews Perception/i });
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Supporting · Obscuring")).toBeInTheDocument();
    expect(screen.getByText("Supporting · Corrective")).toBeInTheDocument();

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Certainty settles/i)).toBeInTheDocument();
    const firstRegion = screen.getByRole("region", { name: "Certainty Hardens" });
    expect(within(firstRegion).getByRole("link", { name: /View pattern/i })).toHaveAttribute(
      "href",
      "/explore/patterns/certainty-hardens",
    );

    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });
});
