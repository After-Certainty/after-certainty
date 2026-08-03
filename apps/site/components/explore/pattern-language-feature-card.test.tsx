import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PatternLanguageFeatureCard } from "@/components/explore/pattern-language-feature-card";
import type { OrganizingForce, Pattern } from "@/types/semanticGraph";

const master = {
  id: "pattern-master",
  slug: "reality-answers-back",
  title: "Reality Answers Back",
  summary: "Master summary.",
  patternRole: "master",
} as Pattern;

const forces = [
  { id: "force-perception", slug: "perception", title: "Perception", description: "d" },
  { id: "force-power", slug: "power", title: "Power", description: "d" },
  { id: "force-time", slug: "time", title: "Time", description: "d" },
  { id: "force-contact", slug: "contact", title: "Contact", description: "d" },
] as OrganizingForce[];

describe("PatternLanguageFeatureCard", () => {
  it("links to the master pattern and force filters", () => {
    render(<PatternLanguageFeatureCard master={master} forces={forces} />);

    expect(screen.getByText("After Certainty Pattern Language")).toBeInTheDocument();
    expect(screen.getByText("Master pattern")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reality Answers Back/i })).toHaveAttribute(
      "href",
      "/explore/patterns/reality-answers-back",
    );
    expect(screen.getByRole("link", { name: "Perception" })).toHaveAttribute(
      "href",
      "/explore/patterns?force=perception",
    );
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("href", "/explore/patterns");
  });
});
