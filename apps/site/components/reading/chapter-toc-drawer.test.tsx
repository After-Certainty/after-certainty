import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChapterToc } from "@/components/reading/chapter-toc";
import {
  buildSectionShareUrl,
  CopySectionLinkControl,
  ManuscriptHeadingCopyLinks,
} from "@/components/reading/copy-section-link";
import { buildChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");

function navigationForIntro() {
  const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
  const chapter = (enriched.chapters ?? []).find(
    (candidate) => candidate.id === "chapter-after-certainty-front-matter-introduction",
  )!;
  return buildChapterReadingNavigation({
    graph: enriched,
    book,
    chapterId: chapter.id,
  })!;
}

function mockClipboardWriteText() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

describe("ChapterToc drawer", () => {
  it("opens a mobile contents drawer with chapter links", async () => {
    const user = userEvent.setup();
    const navigation = navigationForIntro();

    render(<ChapterToc navigation={navigation} />);

    await user.click(screen.getByTestId("chapter-toc-drawer-open"));
    const drawer = await screen.findByTestId("chapter-toc-drawer");
    expect(drawer).toHaveAttribute("role", "dialog");
    expect(
      within(drawer).getByRole("link", { name: /The End of Correctness/i }),
    ).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByTestId("chapter-toc-drawer")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("chapter-toc-drawer-open")).toHaveFocus();
  });

  it("restores focus to Contents after Escape", async () => {
    const user = userEvent.setup();
    const navigation = navigationForIntro();

    render(<ChapterToc navigation={navigation} />);
    const trigger = screen.getByTestId("chapter-toc-drawer-open");
    await user.click(trigger);
    await screen.findByTestId("chapter-toc-drawer");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByTestId("chapter-toc-drawer")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});

describe("copy section link", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
  });

  it("builds section share URLs", () => {
    expect(buildSectionShareUrl("/explore/books/x/chapters/y", "section-one")).toContain(
      "/explore/books/x/chapters/y#section-one",
    );
  });

  it("copies the chapter link and section link from the control", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs its own clipboard — mock after that.
    const writeText = mockClipboardWriteText();
    window.history.replaceState(null, "", "/explore/books/after-certainty/chapters/intro");

    render(<CopySectionLinkControl chapterPath="/explore/books/after-certainty/chapters/intro" />);

    const button = await screen.findByTestId("copy-section-link");
    expect(button).toHaveTextContent("Copy chapter link");
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("/explore/books/after-certainty/chapters/intro"),
    );
    expect(button).toHaveTextContent("Link copied");

    window.history.replaceState(null, "", "/explore/books/after-certainty/chapters/intro#opening");
    window.dispatchEvent(new Event("hashchange"));
    expect(await screen.findByText("Copy section link")).toBeInTheDocument();
  });

  it("adds copy buttons to manuscript headings", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboardWriteText();

    render(
      <div>
        <div id="chapter-content">
          <h2 id="section-one">Section one</h2>
          <p>Body</p>
        </div>
        <ManuscriptHeadingCopyLinks />
      </div>,
    );

    const copy = await screen.findByRole("button", { name: /Copy link to Section one/i });
    await user.click(copy);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("#section-one"));
  });
});
