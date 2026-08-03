import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { GraphNeighborhoodCards } from "@/components/explore/graph-neighborhood-cards";
import { RelatedBooksSection } from "@/components/explore/related-books-section";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import type { GraphNode } from "@/lib/graph/graph";
import type { GlossaryConcept, Pattern } from "@/types/semanticGraph";

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

vi.mock("@/components/explore/pattern-card", () => ({
  PatternCard: function MockPatternCard({ pattern }: { pattern: { title: string } }) {
    return <div>{pattern.title}</div>;
  },
}));

vi.mock("@/lib/books/resolve-book-cover", () => ({
  resolveBookCover: () => ({ src: "/covers/test.webp", kind: "generated" }),
}));

vi.mock("@/lib/graph/explorePaths", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/graph/explorePaths")>();
  return {
    ...actual,
    exploreHrefForNode: () => "/explore/concepts/x",
  };
});

vi.mock("@/lib/graph/conceptFormatting", () => ({
  getConceptDisplayDefinition: () => "A definition.",
}));

vi.mock("@/lib/graph/graph", async () => {
  const actual = await vi.importActual<typeof import("@/lib/graph/graph")>("@/lib/graph/graph");
  return {
    ...actual,
    graphNodeTitle: (n: { entity?: { title?: string; name?: string } }) =>
      n.entity?.title ?? n.entity?.name ?? "Node",
  };
});

describe("RelatedContentGrid collapsible", () => {
  it("collapses on mobile with an accurate count label", async () => {
    const user = userEvent.setup();
    const concepts = [
      { id: "c1", slug: "certainty", title: "Certainty" },
      { id: "c2", slug: "doubt", title: "Doubt" },
    ] as GlossaryConcept[];

    render(
      <RelatedContentGrid heading="Related concepts" concepts={concepts} collapsible />,
    );

    expect(screen.getByText("Certainty")).toBeInTheDocument();
    expect(screen.getAllByText("2 concepts").length).toBeGreaterThan(0);
    const toggle = screen.getByRole("button", { name: /related concepts/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps the always-visible heading when not collapsible", () => {
    const patterns = [{ id: "p1", slug: "master", title: "Master" }] as Pattern[];
    render(<RelatedContentGrid heading="Related patterns" patterns={patterns} />);
    expect(screen.getByRole("heading", { name: "Related patterns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /related patterns/i })).not.toBeInTheDocument();
  });
});

describe("RelatedBooksSection collapsible", () => {
  it("uses CompactBookRow and collapses with a book count", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RelatedBooksSection
        collapsible
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
    expect(screen.getAllByText("1 book").length).toBeGreaterThan(0);
    const toggle = screen.getByRole("button", { name: /related books/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

describe("GraphNeighborhoodCards collapsible", () => {
  it("collapses neighbors with a count on mobile", async () => {
    const user = userEvent.setup();
    const nodes = [
      {
        id: "concept:certainty",
        kind: "concept",
        entity: { id: "concept:certainty", slug: "certainty", title: "Certainty" },
      },
      {
        id: "pattern:master",
        kind: "pattern",
        entity: { id: "pattern:master", slug: "master", title: "Master", summary: "Sum" },
      },
    ] as unknown as GraphNode[];

    render(
      <GraphNeighborhoodCards
        nodes={nodes}
        title="Neighboring terrain"
        collapsible
      />,
    );

    expect(screen.getAllByText("2 neighbors").length).toBeGreaterThan(0);
    const toggle = screen.getByRole("button", { name: /neighboring terrain/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

describe("ExploreAdjacentNav overflow safety", () => {
  it("clips overflow and allows long titles to wrap", () => {
    const { container } = render(
      <ExploreAdjacentNav
        basePath="/explore/concepts"
        entityLabel="concept"
        prev={{
          slug: "a-very-long-previous-concept-title-that-must-wrap",
          title: "A very long previous concept title that must wrap without horizontal scroll",
        }}
        next={{
          slug: "another-extremely-long-next-concept-title",
          title: "Another extremely long next concept title that must also wrap safely",
        }}
      />,
    );

    const nav = container.querySelector("nav");
    expect(nav?.className).toMatch(/overflow-x-clip/);
    expect(screen.getByText(/very long previous/i).className).toMatch(/break-words/);
  });
});
