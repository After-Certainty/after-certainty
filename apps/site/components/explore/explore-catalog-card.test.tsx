import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExploreCatalogCard } from "@/components/explore/explore-catalog-card";
import { ConceptCard } from "@/components/explore/concept-card";
import { PatternCard } from "@/components/explore/pattern-card";
import type { GlossaryConcept, Pattern } from "@/types/semanticGraph";

const samplePattern: Pattern = {
  id: "pattern-1",
  slug: "attention-finds-a-focus",
  title: "Attention Finds a Focus",
  summary: "A pattern about attention narrowing onto a focal object.",
  patternRole: "supporting",
  realityDynamic: "corrective",
};

const sampleConcept: GlossaryConcept = {
  id: "concept-1",
  slug: "certainty",
  title: "Certainty",
  shortDefinition: "The felt sense that a question has been settled.",
  layer: "core",
};

describe("ExploreCatalogCard", () => {
  it("renders compact content with eyebrow, title, blurb, and CTA", () => {
    render(
      <ExploreCatalogCard
        href="/explore/patterns/attention-finds-a-focus"
        eyebrow="Supporting · corrective"
        title="Attention Finds a Focus"
        blurb="A pattern about attention narrowing onto a focal object."
        ctaLabel="View Pattern →"
        layout="compact"
      />,
    );

    expect(screen.getByRole("heading", { name: "Attention Finds a Focus" })).toBeInTheDocument();
    expect(screen.getByText("Supporting · corrective")).toBeInTheDocument();
    expect(
      screen.getByText("A pattern about attention narrowing onto a focal object."),
    ).toBeInTheDocument();
    expect(screen.getByText("View Pattern →")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Attention Finds a Focus/i })).toHaveAttribute(
      "href",
      "/explore/patterns/attention-finds-a-focus",
    );
  });

  it("uses a single link without nested interactive elements", () => {
    const { container } = render(
      <ExploreCatalogCard
        href="/explore/concepts/certainty"
        eyebrow="Concept"
        title="Certainty"
        blurb="Definition"
        ctaLabel="View Concept →"
        layout="compact"
      />,
    );
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});

describe("PatternCard", () => {
  it("renders compact layout with View Pattern CTA", () => {
    render(<PatternCard pattern={samplePattern} layout="compact" />);
    expect(screen.getByRole("heading", { name: "Attention Finds a Focus" })).toBeInTheDocument();
    expect(screen.getByText("View Pattern →")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Attention Finds a Focus/i })).toHaveAttribute(
      "href",
      "/explore/patterns/attention-finds-a-focus",
    );
  });
});

describe("ConceptCard", () => {
  it("renders compact layout with View Concept CTA", () => {
    render(<ConceptCard concept={sampleConcept} layout="compact" />);
    expect(screen.getByRole("heading", { name: "Certainty" })).toBeInTheDocument();
    expect(screen.getByText("View Concept →")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Certainty/i })).toHaveAttribute(
      "href",
      "/explore/concepts/certainty",
    );
  });
});
