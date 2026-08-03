import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PatternAtAGlance } from "@/components/explore/pattern-at-a-glance";
import { PatternForceAccordion } from "@/components/explore/pattern-force-accordion";
import { PatternIntroDisclosure } from "@/components/explore/pattern-intro-disclosure";

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/components/explore/explore-observatory-focus-link", () => ({
  ExploreObservatoryFocusLink: function MockObs({ slug }: { slug: string }) {
    return <a href={`#obs-${slug}`}>Open in graph</a>;
  },
}));

describe("PatternIntroDisclosure", () => {
  it("shows a mobile teaser and keeps full prose in the document", async () => {
    const user = userEvent.setup();
    render(
      <PatternIntroDisclosure teaser="Short teaser for the first screen.">
        <p>Full summary stays in the document.</p>
      </PatternIntroDisclosure>,
    );

    expect(screen.getByText("Short teaser for the first screen.")).toBeInTheDocument();
    expect(screen.getByText("Full summary stays in the document.")).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: /read full description/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

describe("PatternAtAGlance", () => {
  it("renders only provided slots", () => {
    const { container } = render(
      <PatternAtAGlance
        items={[
          { slot: "whatItDoes", label: "What it does", text: "Names a pressure." },
          { slot: "counterbalance", label: "Counterbalance", text: "Return to contact." },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "At a glance" })).toBeInTheDocument();
    expect(screen.getByText("Names a pressure.")).toBeInTheDocument();
    expect(screen.getByText("Return to contact.")).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<PatternAtAGlance items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("PatternForceAccordion", () => {
  it("exposes force panels with related patterns and observatory link", async () => {
    const user = userEvent.setup();
    render(
      <PatternForceAccordion
        forces={[
          {
            force: {
              id: "force:perception",
              slug: "perception",
              title: "Perception",
              description: "How seeing shapes what can be known.",
            },
            supports: [
              {
                id: "pattern:a",
                slug: "a",
                title: "Attention Finds a Focus",
                summary: "s",
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Organizing forces")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /perception/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");
    expect(screen.getAllByText("How seeing shapes what can be known.").length).toBeGreaterThan(0);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panelId = toggle.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveAttribute("role", "region");
    expect(screen.getByRole("link", { name: "Attention Finds a Focus" })).toHaveAttribute(
      "href",
      "/explore/patterns/a",
    );
    expect(screen.getByRole("link", { name: "Open in graph" })).toBeInTheDocument();
  });
});
