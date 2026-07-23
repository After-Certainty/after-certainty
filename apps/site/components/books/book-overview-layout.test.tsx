import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookOverviewLayout } from "@/components/books/book-overview-layout";
import type { BookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import { buildGraphIndex } from "@/lib/graph/graph";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

const book: Book = {
  id: "book-after-certainty",
  slug: "after-certainty",
  title: "After Certainty",
  subtitle: "A subtitle",
  summary: "A short summary for the overview.",
  status: "published",
  concepts: ["concept-agency"],
  patterns: [],
};

const graph = {
  books: [book],
  glossary: [
    {
      id: "concept-agency",
      slug: "agency",
      title: "Agency",
      shortDefinition: "Capacity to act.",
    },
  ],
  patterns: [],
  sources: [],
  relationships: [],
} as SemanticGraph;

const vm: BookOverviewViewModel = {
  book,
  overview: {
    bookId: book.id,
    slug: book.slug,
    centralQuestion: "How do we live when understanding is not enough?",
    whyItExists: "It orients the project after explanation reaches its limits.",
    audience: "Readers ready for the capstone thesis.",
    nonGoals: ["It does not install a new totalizing certainty."],
    selectedConceptIds: ["concept-agency"],
  },
  edition: {
    bookId: book.id,
    slug: book.slug,
    workId: "work-after-certainty",
    isCanonical: true,
    relationship: "sole",
    siblingCount: 1,
    canonicalSlug: book.slug,
  },
  selectedConcepts: [
    {
      concept: {
        id: "concept-agency",
        slug: "agency",
        title: "Agency",
        shortDefinition: "Capacity to act.",
      },
      roleInWork:
        "Names the practical stake of the capstone: capacity to act once explanation no longer guarantees control.",
    },
  ],
  selectedPatterns: [],
  readBefore: [],
  readNext: [{ id: "book-coupling", slug: "coupling", title: "Coupling" }],
  structure: null,
};

describe("BookOverviewLayout", () => {
  it("renders orientation sections for overlay books", () => {
    render(
      <BookOverviewLayout
        vm={vm}
        actions={{
          primary: {
            label: "Download PDF",
            href: "https://cdn.example/after.pdf",
            kind: "download",
          },
          secondary: [],
        }}
        relatedQuestions={[]}
        relatedWhatsNew={[
          {
            id: "event-book-after-certainty-published",
            type: "book_published",
            title: "After Certainty is published",
            summary: "Available to read.",
            date: "2026-01-15",
            entityType: "book",
            entityId: book.id,
            href: "/explore/books/after-certainty",
            visibility: "public",
            source: "authored",
            published: true,
          },
        ]}
        inventory={{
          concepts: [],
          patterns: [],
          thinkers: [],
          researchSources: [],
          useLegacyThinkersSection: false,
        }}
        hasRelationships={false}
        index={buildGraphIndex(graph)}
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: "Books", href: "/explore/books" },
          { label: book.title },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "After Certainty" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The question this book explores" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How do we live when understanding is not enough?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Why this book exists" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Central ideas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore the concept" })).toHaveAttribute(
      "href",
      "/explore/concepts/agency",
    );
    expect(screen.getByText(/Names the practical stake of the capstone/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download PDF" })).toBeInTheDocument();
    expect(screen.getByText(/open publishing terms/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Coupling" })[0]).toHaveAttribute(
      "href",
      "/explore/books/coupling",
    );
    expect(screen.getByRole("link", { name: "After Certainty is published" })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty",
    );
  });
});
