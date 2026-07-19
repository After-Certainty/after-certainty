import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalSearchPage } from "@/components/search/global-search-page";
import { resetSearchIndexCacheForTests } from "@/components/search/use-search-index";
import type { SearchIndexPayload } from "@/lib/search/indexPayload";

const replace = vi.fn();
const push = vi.fn();
let mockParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => mockParams,
}));

vi.mock("@/lib/analytics/track", () => ({
  trackSearchQuery: vi.fn(),
  trackSearchNoResults: vi.fn(),
  trackSearchRefine: vi.fn(),
  trackSearchSelect: vi.fn(),
}));

function payload(): SearchIndexPayload {
  return {
    version: 1,
    generatedAt: "2026-07-19T00:00:00.000Z",
    documentCount: 2,
    aliasConfig: { version: 1, entries: [] },
    documents: [
      {
        id: "concept-certainty",
        entityType: "concept",
        slug: "certainty",
        title: "Certainty",
        description: "A posture of knowing.",
        resultLabel: "Concept",
        canonicalUrl: "/explore/concepts/certainty",
        visibility: "listed",
        searchText: "Certainty\nA posture of knowing.",
        aliases: [],
        boostWeight: 1.2,
        sourceArtifact: "semantic",
      },
      {
        id: "book-trust-beyond-similarity",
        entityType: "book",
        slug: "trust-beyond-similarity",
        title: "Trust Beyond Similarity",
        description: "On disagreement and trust.",
        resultLabel: "Book",
        canonicalUrl: "/explore/books/trust-beyond-similarity",
        visibility: "listed",
        searchText: "Trust Beyond Similarity\nOn disagreement and trust.",
        aliases: [],
        boostWeight: 1.3,
        sourceArtifact: "semantic",
        status: "published",
      },
    ],
  };
}

describe("GlobalSearchPage", () => {
  beforeEach(() => {
    resetSearchIndexCacheForTests();
    replace.mockReset();
    push.mockReset();
    mockParams = new URLSearchParams("q=certainty");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload(),
      }),
    );
  });

  it("loads the index and shows matching results for the URL query", async () => {
    render(<GlobalSearchPage initialQuery="certainty" />);

    expect(screen.getByRole("heading", { level: 1, name: "Search" })).toBeInTheDocument();
    expect(screen.getByText(/Loading search index/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Certainty/i })).toHaveAttribute(
        "href",
        "/explore/concepts/certainty",
      );
    });

    expect(screen.getByText(/1 result/i)).toBeInTheDocument();
  });

  it("updates the shareable URL when the query changes", async () => {
    const user = userEvent.setup();
    mockParams = new URLSearchParams();
    render(<GlobalSearchPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading search index/i)).not.toBeInTheDocument();
    });

    const input = screen.getByRole("searchbox", { name: /Search the commons/i });
    await user.clear(input);
    await user.type(input, "trust");

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
    });
    const last = replace.mock.calls.at(-1)?.[0] as string;
    expect(last).toContain("/search?");
    expect(last).toContain("q=trust");
  });

  it("shows an error state when the index fails to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );
    mockParams = new URLSearchParams();
    render(<GlobalSearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/Search could not load right now/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });
});
