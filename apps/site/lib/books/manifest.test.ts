import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fallbackCatalog from "@/data/books-manifest.json";
import { WOLTY_PUBLIC_ALIAS, WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import { DEFAULT_BOOKS_MANIFEST_URL } from "@/lib/site-config";
import { fetchBooksCatalogUncached, parseBooksCatalogManifestJson } from "./manifest";

describe("parseBooksCatalogManifestJson", () => {
  it("throws for unrecognized JSON", () => {
    expect(() => parseBooksCatalogManifestJson({})).toThrow(/unrecognized JSON shape/);
  });

  it("normalizes generated manifest roots", () => {
    const catalog = parseBooksCatalogManifestJson({
      manifestVersion: 1,
      repository: "ksteffe/after-certainty",
      books: [
        {
          slug: "coupling",
          status: "published",
          title: "Coupling",
          description: "D",
          authors: ["K"],
          epub: { enabled: true, file: "c.epub", url: "https://releases/c.epub" },
        },
      ],
    });
    expect(catalog.books).toHaveLength(1);
    expect(catalog.books[0].slug).toBe("coupling");
    expect(catalog.books[0].epubUrl).toBe("https://releases/c.epub");
    expect(catalog.books[0].repositoryUrl).toBe("https://github.com/ksteffe/after-certainty");
  });

  it("passes through legacy bundled manifest shape", () => {
    const raw = JSON.parse(JSON.stringify(fallbackCatalog)) as unknown;
    const catalog = parseBooksCatalogManifestJson(raw);
    expect(catalog.featuredSlug).toBe((fallbackCatalog as { featuredSlug: string }).featuredSlug);
    expect(catalog.books.length).toBe((fallbackCatalog as { books: unknown[] }).books.length);
  });
});

describe("fetchBooksCatalogUncached", () => {
  let prevOffline: string | undefined;
  let prevManifestUrl: string | undefined;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    prevOffline = process.env.BOOKS_MANIFEST_OFFLINE;
    prevManifestUrl = process.env.BOOKS_MANIFEST_URL;
    delete process.env.BOOKS_MANIFEST_URL;
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    process.env.BOOKS_MANIFEST_OFFLINE = prevOffline;
    if (prevManifestUrl === undefined) delete process.env.BOOKS_MANIFEST_URL;
    else process.env.BOOKS_MANIFEST_URL = prevManifestUrl;
    fetchSpy.mockRestore();
  });

  it("returns bundled catalog when offline", async () => {
    process.env.BOOKS_MANIFEST_OFFLINE = "1";
    const catalog = await fetchBooksCatalogUncached();
    expect(catalog.featuredSlug).toBe("when-others-look-to-you");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches and parses remote JSON when online", async () => {
    delete process.env.BOOKS_MANIFEST_OFFLINE;
    const payload = {
      manifestVersion: 1,
      repository: "ksteffe/after-certainty",
      books: [
        {
          slug: WOLTY_V1_SLUG,
          status: "published" as const,
          title: "W",
          description: "D",
          authors: ["A"],
          slugAliases: [WOLTY_PUBLIC_ALIAS],
        },
      ],
    };
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    const catalog = await fetchBooksCatalogUncached();

    expect(fetchSpy).toHaveBeenCalledWith(
      DEFAULT_BOOKS_MANIFEST_URL,
      expect.objectContaining({
        headers: { Accept: "application/json, */*" },
      }),
    );
    expect(catalog.featuredSlug).toBe(WOLTY_V1_SLUG);
    expect(catalog.books[0].slug).toBe(WOLTY_V1_SLUG);
  });

  it("falls back to bundled catalog when fetch fails", async () => {
    delete process.env.BOOKS_MANIFEST_OFFLINE;
    fetchSpy.mockRejectedValue(new Error("network"));

    const catalog = await fetchBooksCatalogUncached();

    expect(catalog.featuredSlug).toBe("when-others-look-to-you");
  });

  it("falls back when response is not ok", async () => {
    delete process.env.BOOKS_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({ ok: false, status: 500 } as Response);

    const catalog = await fetchBooksCatalogUncached();

    expect(catalog.featuredSlug).toBe("when-others-look-to-you");
  });
});

