import { describe, expect, it } from "vitest";

import {
  isLegacyCoverFallback,
  resolveBookCover,
} from "@/lib/books/resolve-book-cover";
import type { Book } from "@/types/semanticGraph";

const generated: Book = {
  id: "book-demo",
  slug: "demo",
  title: "Demo",
  coverImage: "https://raw.githubusercontent.com/example/main/books/demo/book-cover.png",
  openGraphImage: "https://raw.githubusercontent.com/example/main/books/demo/open-graph.png",
  coverImages: {
    detail: {
      path: "book-covers/demo/detail.webp",
      url: "/generated/book-covers/demo/detail.webp",
      width: 720,
      height: 1080,
      format: "webp",
      bytes: 1000,
      sha256: "a".repeat(64),
    },
    card: {
      path: "book-covers/demo/card.webp",
      url: "/generated/book-covers/demo/card.webp",
      width: 640,
      height: 960,
      format: "webp",
      bytes: 800,
      sha256: "b".repeat(64),
    },
    thumbnail: {
      path: "book-covers/demo/thumbnail.webp",
      url: "/generated/book-covers/demo/thumbnail.webp",
      width: 240,
      height: 360,
      format: "webp",
      bytes: 400,
      sha256: "c".repeat(64),
    },
  },
};

describe("resolveBookCover", () => {
  it("selects detail / card / thumbnail", () => {
    expect(resolveBookCover(generated, "detail")?.src).toContain("/detail.webp");
    expect(resolveBookCover(generated, "card")?.src).toContain("/card.webp");
    expect(resolveBookCover(generated, "thumbnail")?.src).toContain("/thumbnail.webp");
    expect(resolveBookCover(generated, "detail")?.source).toBe("generated");
    expect(resolveBookCover(generated, "detail")?.width).toBe(720);
  });

  it("falls back across generated variants", () => {
    const noThumb = {
      ...generated,
      coverImages: {
        detail: generated.coverImages!.detail,
        card: generated.coverImages!.card,
        thumbnail: { ...generated.coverImages!.thumbnail, url: "" as unknown as string },
      },
    };
    // invalid thumbnail url filtered → card
    const book = {
      ...generated,
      coverImages: {
        detail: generated.coverImages!.detail,
        card: generated.coverImages!.card,
        thumbnail: {
          ...generated.coverImages!.thumbnail,
          width: 0,
        },
      },
    };
    expect(resolveBookCover(book, "thumbnail")?.variant).toBe("card");
    expect(noThumb).toBeTruthy();
  });

  it("falls back to legacy coverImage", () => {
    const legacyOnly: Book = {
      id: "book-legacy",
      slug: "legacy",
      title: "Legacy",
      coverImage: "https://example.com/cover.png",
    };
    expect(resolveBookCover(legacyOnly, "card")).toEqual({
      src: "https://example.com/cover.png",
      source: "legacy",
    });
  });

  it("returns null when no image", () => {
    expect(
      resolveBookCover({ coverImage: undefined, coverImages: undefined, openGraphImage: undefined }, "card"),
    ).toBeNull();
  });

  it("prefers openGraphImage for openGraph usage", () => {
    expect(resolveBookCover(generated, "openGraph")?.src).toBe(generated.openGraphImage);
    expect(resolveBookCover(generated, "openGraph")?.source).toBe("original");
  });

  it("detects legacy fallback when generated exists", () => {
    const broken: Book = {
      ...generated,
      coverImages: undefined,
    };
    expect(isLegacyCoverFallback(broken, "card")).toBe(false);
    expect(isLegacyCoverFallback(generated, "card")).toBe(false);
  });
});
