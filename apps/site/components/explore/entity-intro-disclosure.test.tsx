import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";

describe("EntityIntroDisclosure", () => {
  it("shows a mobile teaser and keeps full prose in the document", async () => {
    const user = userEvent.setup();
    render(
      <EntityIntroDisclosure
        id="entity-full-description"
        regionLabel="Full entity description"
        teaser="Short teaser for the first screen."
        expandLabel="Read full description"
      >
        <p>Full summary stays in the document.</p>
      </EntityIntroDisclosure>,
    );

    expect(screen.getByText("Short teaser for the first screen.")).toBeInTheDocument();
    expect(screen.getByText("Full summary stays in the document.")).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: /read full description/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "entity-full-description-panel");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("entity-full-description-panel")).toHaveAttribute(
      "role",
      "region",
    );
  });

  it("supports a custom expand label", async () => {
    const user = userEvent.setup();
    render(
      <EntityIntroDisclosure
        id="concept-full-definition"
        regionLabel="Full concept definition"
        teaser="Brief gloss."
        expandLabel="Read full definition"
      >
        <p>Longer definition body.</p>
      </EntityIntroDisclosure>,
    );

    const toggle = screen.getByRole("button", { name: /read full definition/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("renders without a teaser and still discloses children", async () => {
    const user = userEvent.setup();
    render(
      <EntityIntroDisclosure
        id="no-teaser-intro"
        regionLabel="Full description"
        teaser={null}
      >
        <p>Body only.</p>
      </EntityIntroDisclosure>,
    );

    expect(screen.getByText("Body only.")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /read full description/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
