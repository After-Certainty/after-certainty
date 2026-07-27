import { describe, expect, it } from "vitest";

import {
  buildContinueReadingCatalog,
  continueReadingCatalogForEdition,
  continueReadingHref,
  resolveContinueReadingTarget,
  resolveContinueReadingTargets,
} from "@/lib/reading/continueReading";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";

const enriched = loadManifestFixture("enriched-book");

describe("continueReading", () => {
  const catalog = buildContinueReadingCatalog(enriched);
  const editionId = "book-after-certainty";
  const introId = "chapter-after-certainty-front-matter-introduction";

  it("indexes public chapters for catalog editions", () => {
    const edition = catalog[editionId];
    expect(edition?.bookSlug).toBe("after-certainty");
    expect(edition?.bookTitle).toBe("After Certainty");
    expect(edition?.chapters[introId]?.href).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
  });

  it("resolves valid progress to a chapter route", () => {
    const target = resolveContinueReadingTarget(
      {
        editionId,
        chapterId: introId,
        updatedAt: "2026-07-27T12:00:00.000Z",
      },
      catalog,
    );
    expect(target).toMatchObject({
      bookTitle: "After Certainty",
      chapterTitle: "Introduction",
      href: "/explore/books/after-certainty/chapters/front-matter-introduction",
    });
  });

  it("appends fragment ids to hrefs", () => {
    expect(continueReadingHref("/explore/books/x/chapters/y", "section-one")).toBe(
      "/explore/books/x/chapters/y#section-one",
    );
    expect(continueReadingHref("/explore/books/x/chapters/y", "#section-one")).toBe(
      "/explore/books/x/chapters/y#section-one",
    );

    const target = resolveContinueReadingTarget(
      {
        editionId,
        chapterId: introId,
        fragmentId: "opening",
        updatedAt: "2026-07-27T12:00:00.000Z",
      },
      catalog,
    );
    expect(target?.href).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction#opening",
    );
  });

  it("returns null for unknown edition or chapter", () => {
    expect(
      resolveContinueReadingTarget(
        {
          editionId: "book-missing",
          chapterId: introId,
          updatedAt: "2026-07-27T12:00:00.000Z",
        },
        catalog,
      ),
    ).toBeNull();
    expect(
      resolveContinueReadingTarget(
        {
          editionId,
          chapterId: "chapter-does-not-exist",
          updatedAt: "2026-07-27T12:00:00.000Z",
        },
        catalog,
      ),
    ).toBeNull();
  });

  it("slims catalog to one edition for book pages", () => {
    const slim = continueReadingCatalogForEdition(catalog, editionId);
    expect(Object.keys(slim)).toEqual([editionId]);
    expect(slim[editionId]?.chapters[introId]).toBeTruthy();
  });

  it("lists newest valid targets and skips invalid or duplicate editions", () => {
    const targets = resolveContinueReadingTargets(
      [
        {
          editionId: "book-missing",
          chapterId: introId,
          updatedAt: "2026-07-27T13:00:00.000Z",
        },
        {
          editionId,
          chapterId: introId,
          updatedAt: "2026-07-27T12:00:00.000Z",
        },
        {
          editionId,
          chapterId: introId,
          updatedAt: "2026-07-27T11:00:00.000Z",
        },
      ],
      catalog,
      3,
    );

    expect(targets).toHaveLength(1);
    expect(targets[0]?.editionId).toBe(editionId);
  });
});
