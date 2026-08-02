import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HardNavManuscriptLinks } from "@/components/reading/hard-nav-manuscript-links";

const navigateToChapter = vi.fn();

vi.mock("@/lib/reading/navigate-chapter", () => ({
  navigateToChapter: (...args: unknown[]) => navigateToChapter(...args),
  cancelSpokenContent: vi.fn(),
}));

describe("HardNavManuscriptLinks", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    navigateToChapter.mockReset();
  });

  it("hard-navigates same-origin chapter links inside the manuscript", () => {
    document.body.innerHTML = `
      <div id="chapter-content">
        <div class="chapter-manuscript">
          <a href="/explore/books/demo/chapters/intro">Introduction</a>
        </div>
      </div>
    `;

    render(<HardNavManuscriptLinks />);
    const link = document.querySelector("a")!;
    fireEvent.click(link);
    expect(navigateToChapter).toHaveBeenCalledWith("/explore/books/demo/chapters/intro");
  });

  it("ignores hash-only and non-chapter links", () => {
    document.body.innerHTML = `
      <div id="chapter-content">
        <a href="#section">Section</a>
        <a href="/explore/books/demo">Book</a>
      </div>
    `;

    render(<HardNavManuscriptLinks />);
    fireEvent.click(document.querySelector('a[href="#section"]')!);
    fireEvent.click(document.querySelector('a[href="/explore/books/demo"]')!);
    expect(navigateToChapter).not.toHaveBeenCalled();
  });
});
