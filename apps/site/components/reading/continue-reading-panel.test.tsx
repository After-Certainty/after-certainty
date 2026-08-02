import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ContinueReadingForBook,
  ContinueReadingStartSection,
} from "@/components/reading/continue-reading-panel";
import { buildContinueReadingCatalog } from "@/lib/reading/continueReading";
import { READING_PROGRESS_STORAGE_KEY, recordReadingProgress } from "@/lib/reading/readingProgress";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");
const catalog = buildContinueReadingCatalog(enriched);
const EDITION = "book-after-certainty";
const CHAPTER = "chapter-after-certainty-front-matter-introduction";

describe("ContinueReading panels", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("hides book CTA when there is no progress", async () => {
    const { container } = render(<ContinueReadingForBook editionId={EDITION} catalog={catalog} />);
    await waitFor(() => {
      expect(screen.queryByTestId("continue-reading-book")).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("shows book CTA for valid progress and clears on request", async () => {
    const user = userEvent.setup();
    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER });

    render(<ContinueReadingForBook editionId={EDITION} catalog={catalog} />);

    expect(await screen.findByTestId("continue-reading-book")).toHaveTextContent("Introduction");
    expect(screen.getByRole("link", { name: "Resume chapter" })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );

    await user.click(screen.getByRole("button", { name: "Clear progress" }));
    expect(screen.queryByTestId("continue-reading-book")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY)).not.toContain(EDITION);
  });

  it("shows start section only with valid progress", async () => {
    const first = render(<ContinueReadingStartSection catalog={catalog} />);
    await waitFor(() => {
      expect(screen.queryByTestId("continue-reading-start")).not.toBeInTheDocument();
    });
    first.unmount();

    recordReadingProgress({ editionId: EDITION, chapterId: CHAPTER });
    render(<ContinueReadingStartSection catalog={catalog} />);

    expect(await screen.findByTestId("continue-reading-start")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Continue reading" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute(
      "href",
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
  });

  it("hides start section when progress points at an unknown chapter", async () => {
    recordReadingProgress({
      editionId: EDITION,
      chapterId: "chapter-does-not-exist",
    });
    const { container } = render(<ContinueReadingStartSection catalog={catalog} />);
    await waitFor(() => {
      expect(screen.queryByTestId("continue-reading-start")).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });
  });
});
