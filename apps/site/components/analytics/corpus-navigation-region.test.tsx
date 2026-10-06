import Link from "next/link";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { CorpusNavigationRegion } from "@/components/analytics/corpus-navigation-region";
import { RelatedChaptersSection } from "@/components/explore/related-chapters-section";
import { corpusDestination } from "@/lib/analytics/vercel-intent";

const sdk = vi.hoisted(() => ({ calls: vi.fn(), fail: false }));
const trackMock = sdk.calls;
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => {
    sdk.calls(...args);
    if (sdk.fail) throw new Error("Unavailable");
  },
}));
beforeEach(() => {
  trackMock.mockReset();
  sdk.fail = false;
});

it("attributes only supported curated links and leaves activation uncancelled", () => {
  render(
    <CorpusNavigationRegion fromType="source" relation="creator">
      <Link href="/explore/thinkers/arendt">
        <span>Thinker</span>
      </Link>
      <Link href="https://example.com/explore/books/example">External</Link>
      <Link href="/explore/books">Index</Link>
      <button>Disclosure</button>
    </CorpusNavigationRegion>,
  );
  expect(trackMock).not.toHaveBeenCalled();
  expect(fireEvent.click(screen.getByText("Thinker"), { ctrlKey: true })).toBe(true);
  fireEvent.click(screen.getByText("External"));
  fireEvent.click(screen.getByText("Index"));
  fireEvent.click(screen.getByRole("button"));
  expect(trackMock.mock.calls).toEqual([
    ["corpus_navigation", { from_type: "source", to_type: "thinker", relation: "creator" }],
  ]);
});

it("classifies chapter destinations without emitting slugs, titles, or queries", () => {
  render(
    <RelatedChaptersSection
      fromType="concept"
      chapters={[
        {
          id: "chapter-secret",
          title: "Arbitrary chapter title",
          href: "/explore/books/a-book/chapters/a-chapter?query=private",
          position: 1,
          bookSlug: "a-book",
          bookTitle: "Arbitrary book title",
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("link", { name: "Arbitrary chapter title" }), { ctrlKey: true });
  expect(trackMock.mock.calls).toEqual([
    ["corpus_navigation", { from_type: "concept", to_type: "chapter", relation: "related" }],
  ]);
});

it("ignores non-node routes, download links, and regions with no source attribution", () => {
  for (const href of [
    "https://example.com/explore/books/a",
    "//evil.test/listen",
    "#related",
    "/contact",
    "/explore/books/shelves/featured",
    "/explore?focus=source:a",
  ]) {
    expect(corpusDestination(href)).toBeNull();
  }
  render(
    <CorpusNavigationRegion>
      <Link href="/explore/books/a">Unattributed</Link>
    </CorpusNavigationRegion>,
  );
  fireEvent.click(screen.getByRole("link"), { ctrlKey: true });
  expect(trackMock).not.toHaveBeenCalled();
});

it("does not block normal link activation if analytics throws", () => {
  sdk.fail = true;
  render(
    <CorpusNavigationRegion fromType="source">
      <Link href="/explore/books/a">Read</Link>
    </CorpusNavigationRegion>,
  );
  expect(fireEvent.click(screen.getByRole("link"), { ctrlKey: true })).toBe(true);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/explore/books/a");
});
