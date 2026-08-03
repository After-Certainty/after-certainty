import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

vi.mock("@/components/search/search-palette-provider", () => ({
  SearchPaletteProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSearchPalette: () => ({
    open: false,
    openSearch: vi.fn(),
    triggerRef: { current: null },
  }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button type="button" aria-label="Activate light appearance" />,
}));

vi.mock("@/components/layout/mobile-nav", () => ({
  MobileNav: () => <button type="button" aria-label="Open menu" />,
}));

vi.mock("@/components/search/header-search-button", () => ({
  HeaderSearchButton: () => <button type="button">Search</button>,
}));

import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("gives the mobile header row extra right inset so the menu clears the edge", () => {
    const { container } = render(<SiteHeader />);
    const row = container.querySelector("header > div");
    expect(row?.className).toMatch(/pr-\[max\(1\.75rem/);
    expect(row?.className).toMatch(/pl-\[max\(1rem/);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });
});
