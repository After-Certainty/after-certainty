import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/explore/books",
}));

import { ExploreSidebar } from "@/components/explore/explore-sidebar";

describe("ExploreSidebar", () => {
  it("marks Books as the current page on the books index", () => {
    render(<ExploreSidebar />);
    expect(screen.getByRole("link", { name: "Books" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Concepts" })).not.toHaveAttribute("aria-current");
  });
});
