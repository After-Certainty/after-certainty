import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReaderToolbar } from "@/components/reading/reader-toolbar";

const toolbarProps = {
  bookTitle: "After Certainty",
  bookHref: "/explore/books/after-certainty",
  chapterTitle: "Introduction",
  editionId: "edition-after-certainty",
  chapterId: "chapter-after-certainty-front-matter-introduction",
  onOpenControls: () => undefined,
};

describe("ReaderToolbar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders exit link, chapter position, and progressbar", () => {
    document.body.innerHTML = `<div id="chapter-content" style="height:2000px"></div>`;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });

    render(<ReaderToolbar {...toolbarProps} chapterIndex={1} chapterCount={12} />);

    expect(screen.getByTestId("reader-exit")).toHaveAttribute(
      "href",
      "/explore/books/after-certainty",
    );
    expect(screen.getByTestId("reader-chapter-position")).toHaveAttribute(
      "aria-label",
      "Chapter 1 of 12",
    );
    expect(screen.getByRole("progressbar", { name: "Chapter scroll progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByTestId("reader-scroll-percent")).toHaveTextContent("0%");
    expect(screen.getByTestId("reader-controls-open")).toBeInTheDocument();
  });

  it("updates scroll percent on scroll", () => {
    const contentAbsoluteTop = 200;
    const contentHeight = 4000;
    const content = document.createElement("div");
    content.id = "chapter-content";
    Object.defineProperty(content, "offsetHeight", {
      configurable: true,
      value: contentHeight,
    });
    content.getBoundingClientRect = () => {
      const top = contentAbsoluteTop - scrollY;
      return {
        top,
        bottom: top + contentHeight,
        height: contentHeight,
        width: 600,
        left: 0,
        right: 600,
        x: 0,
        y: top,
        toJSON: () => ({}),
      } as DOMRect;
    };
    document.body.appendChild(content);

    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    let scrollY = contentAbsoluteTop + (contentHeight - 800) / 2;
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });

    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

    render(<ReaderToolbar {...toolbarProps} chapterIndex={2} chapterCount={10} />);

    expect(screen.getByTestId("reader-scroll-percent")).toHaveTextContent("50%");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");

    scrollY = 10_000;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.getByTestId("reader-scroll-percent")).toHaveTextContent("100%");
    expect(raf).toHaveBeenCalled();
  });
});
