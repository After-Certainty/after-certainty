import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderSearchButton } from "@/components/search/header-search-button";
import { SearchPaletteProvider } from "@/components/search/search-palette-provider";
import { resetSearchIndexCacheForTests } from "@/components/search/use-search-index";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/analytics/track", () => ({
  trackSearchOpen: vi.fn(),
  trackSearchQuery: vi.fn(),
  trackSearchNoResults: vi.fn(),
  trackSearchSelect: vi.fn(),
  trackSearchExpand: vi.fn(),
}));

import { trackSearchOpen } from "@/lib/analytics/track";

describe("SearchPaletteProvider", () => {
  beforeEach(() => {
    resetSearchIndexCacheForTests();
    vi.mocked(trackSearchOpen).mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 1,
          generatedAt: "2026-07-19T00:00:00.000Z",
          documentCount: 1,
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
          ],
        }),
      }),
    );
  });

  it("opens the quick search dialog from the header button", async () => {
    const user = userEvent.setup();
    render(
      <SearchPaletteProvider>
        <HeaderSearchButton />
      </SearchPaletteProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Search/i }));
    expect(trackSearchOpen).toHaveBeenCalledWith({ method: "header" });
    expect(screen.getByRole("dialog", { name: /Quick search/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("searchbox", { name: /Quick search/i })).toHaveFocus();
    });
  });

  it("opens on Cmd/Ctrl+K and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <SearchPaletteProvider>
        <HeaderSearchButton />
      </SearchPaletteProvider>,
    );

    await user.keyboard("{Control>}k{/Control}");
    expect(trackSearchOpen).toHaveBeenCalledWith({ method: "shortcut" });
    expect(screen.getByRole("dialog", { name: /Quick search/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Quick search/i })).not.toBeInTheDocument();
    });
  });

  it("does not open on / when focus is in an input", async () => {
    const user = userEvent.setup();
    render(
      <SearchPaletteProvider>
        <HeaderSearchButton />
        <input aria-label="Other field" />
      </SearchPaletteProvider>,
    );

    await user.click(screen.getByRole("textbox", { name: /Other field/i }));
    await user.keyboard("/");
    expect(screen.queryByRole("dialog", { name: /Quick search/i })).not.toBeInTheDocument();
  });
});
