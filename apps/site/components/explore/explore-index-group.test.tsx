import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ExploreIndexGroup } from "@/components/explore/explore-index-group";

describe("ExploreIndexGroup", () => {
  it("renders a mobile accordion button with count and aria attributes", () => {
    render(
      <ExploreIndexGroup title="Portfolio patterns" countLabel="3 patterns" defaultOpen={false}>
        <p>Card content</p>
      </ExploreIndexGroup>,
    );

    const toggle = screen.getByRole("button", { name: /Portfolio patterns/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
    expect(screen.getByText("3 patterns")).toBeInTheDocument();
  });

  it("starts open when defaultOpen is true and toggles on click", async () => {
    const user = userEvent.setup();
    render(
      <ExploreIndexGroup
        title="After Certainty Pattern Language"
        countLabel="12 patterns"
        defaultOpen
      >
        <p>Language cards</p>
      </ExploreIndexGroup>,
    );

    const toggle = screen.getByRole("button", { name: /After Certainty Pattern Language/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Language cards")).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
