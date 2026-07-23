import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileNav } from "@/components/layout/mobile-nav";
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

describe("MobileNav search entry", () => {
  it("lists Search in the drawer and opens the quick search palette", async () => {
    resetSearchIndexCacheForTests();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 1,
          generatedAt: "2026-07-19T00:00:00.000Z",
          documentCount: 0,
          aliasConfig: { version: 1, entries: [] },
          documents: [],
        }),
      }),
    );

    const user = userEvent.setup();
    render(
      <SearchPaletteProvider>
        <MobileNav items={[{ href: "/explore", label: "Explore" }]} />
      </SearchPaletteProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Open menu/i }));
    const searchItem = screen.getByTestId("mobile-nav-search");
    expect(searchItem).toHaveTextContent(/^Search$/i);

    await user.click(searchItem);
    expect(trackSearchOpen).toHaveBeenCalledWith({ method: "mobile" });
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Quick search/i })).toBeInTheDocument();
    });
  });
});
