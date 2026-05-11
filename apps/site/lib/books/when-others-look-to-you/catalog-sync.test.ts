import { describe, expect, it } from "vitest";

import { mergeWhenOthersLookToYouCatalog } from "@/lib/books/when-others-look-to-you/catalog-sync";
import { bookPageContent } from "@/lib/books/when-others-look-to-you/content";
import { WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import type { Book } from "@/types/content";

const baseBook = (slug: string): Book => ({
  slug,
  title: "Remote title",
  subtitle: "Remote sub",
  description: "Remote description",
  status: "published",
  authors: ["X"],
});

describe("mergeWhenOthersLookToYouCatalog", () => {
  it("overlays microsite content for legacy slug", () => {
    const merged = mergeWhenOthersLookToYouCatalog(baseBook("when-others-look-to-you"));
    expect(merged.title).toBe(bookPageContent.title);
    expect(merged.subtitle).toBe(bookPageContent.subtitle);
    expect(merged.description).toBe(bookPageContent.paragraphs.join(" "));
  });

  it("overlays microsite content for generated v1 slug", () => {
    const merged = mergeWhenOthersLookToYouCatalog(baseBook(WOLTY_V1_SLUG));
    expect(merged.title).toBe(bookPageContent.title);
    expect(merged.slug).toBe(WOLTY_V1_SLUG);
  });

  it("leaves other slugs unchanged", () => {
    const b = baseBook("how-meaning-moves");
    expect(mergeWhenOthersLookToYouCatalog(b)).toEqual(b);
  });
});
