import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedBooksSection } from "@/components/explore/related-books-section";
import { RelatedConceptsSection } from "@/components/explore/related-concepts-section";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { RelationshipList } from "@/components/explore/relationship-list";
import type { GraphIndex } from "@/lib/graph/graph";
import type { GlossaryConcept, Relationship } from "@/types/semanticGraph";

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

vi.mock("next/image", () => ({
  default: function MockImage(props: { alt?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt ?? ""} />;
  },
}));

vi.mock("@/components/explore/concept-card", () => ({
  ConceptCard: function MockConceptCard({ concept }: { concept: { title: string } }) {
    return <div>{concept.title}</div>;
  },
}));

vi.mock("@/components/explore/relationship-card", () => ({
  RelationshipCard: function MockRelationshipCard({
    counterpartyLabel,
    direction,
  }: {
    counterpartyLabel: string;
    direction: string;
  }) {
    return (
      <div>
        {direction}: {counterpartyLabel}
      </div>
    );
  },
}));

vi.mock("@/lib/books/resolve-book-cover", () => ({
  resolveBookCover: () => ({ src: "/covers/test.webp", kind: "generated" }),
}));

vi.mock("@/lib/graph/query/graphTraversal", () => ({
  relationshipEndpointsResolved: () => ({
    sourceId: "pattern:p",
    targetId: "concept:x",
  }),
}));

vi.mock("@/lib/graph/explorePaths", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/graph/explorePaths")>();
  return {
    ...actual,
    exploreHrefForCanonicalId: () => "/explore/concepts/x",
    exploreObservatoryRelationshipHref: () => "/explore?view=observatory",
  };
});

vi.mock("@/lib/graph/presentation/graphVizModel", () => ({
  vizEdgeDedupKey: () => "edge",
}));

vi.mock("@/lib/graph/graph", async () => {
  const actual = await vi.importActual<typeof import("@/lib/graph/graph")>("@/lib/graph/graph");
  return {
    ...actual,
    graphNodeTitle: () => "X",
  };
});

describe("RelatedSectionDisclosure", () => {
  it("collapses on mobile with count and keeps children in the document", async () => {
    const user = userEvent.setup();
    render(
      <RelatedSectionDisclosure
        id="related-concepts"
        title="Related concepts"
        countLabel="2 concepts"
      >
        <p>Concept body</p>
      </RelatedSectionDisclosure>,
    );

    expect(screen.getByText("Concept body")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /related concepts/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByText("2 concepts").length).toBeGreaterThan(0);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

describe("RelatedConceptsSection", () => {
  it("renders a count and concept cards", () => {
    const concepts = [
      { id: "c1", slug: "certainty", title: "Certainty" },
      { id: "c2", slug: "doubt", title: "Doubt" },
    ] as GlossaryConcept[];

    render(<RelatedConceptsSection concepts={concepts} />);
    expect(screen.getByText("Certainty")).toBeInTheDocument();
    expect(screen.getByText("Doubt")).toBeInTheDocument();
    expect(screen.getAllByText("2 concepts").length).toBeGreaterThan(0);
  });
});

describe("RelatedBooksSection", () => {
  it("renders CompactBookRow entries instead of full-bleed covers", () => {
    const { container } = render(
      <RelatedBooksSection
        books={[
          {
            id: "b1",
            slug: "after-certainty",
            title: "After Certainty",
            summary: "A book.",
          } as never,
        ]}
      />,
    );
    expect(container.querySelector("[data-compact-book-row]")).toBeInTheDocument();
    expect(container.querySelector("[data-cover-box]")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /after certainty/i })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty",
    );
  });
});

describe("RelationshipList collapsible", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps dynamics in a disclosure while preserving mode labels", () => {
    const index = {
      getNodeByCanonicalId: () => ({ kind: "concept", slug: "x", title: "X" }),
    } as unknown as GraphIndex;

    const relationships = [
      {
        source: "pattern:p",
        target: "concept:x",
        relationship: "expresses",
      },
    ] as Relationship[];

    render(
      <RelationshipList
        index={index}
        relationships={relationships}
        mode="outgoing"
        title="Outgoing dynamics"
        collapsible
      />,
    );

    expect(screen.getByRole("button", { name: /outgoing dynamics/i })).toBeInTheDocument();
    expect(screen.getByText(/outgoing: x/i)).toBeInTheDocument();
  });
});

describe("ExploreAdjacentNav", () => {
  it("wraps long titles without truncating to a single line", () => {
    render(
      <ExploreAdjacentNav
        basePath="/explore/patterns"
        entityLabel="pattern"
        prev={{
          slug: "very-long",
          title: "A Remarkably Long Pattern Title That Must Wrap Cleanly At Narrow Widths",
        }}
        next={{ slug: "next", title: "Short" }}
      />,
    );

    const title = screen.getByText(/Remarkably Long Pattern Title/);
    expect(title.className).toMatch(/break-words/);
  });
});
