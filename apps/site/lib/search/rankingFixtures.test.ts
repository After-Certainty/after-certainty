import { describe, expect, it } from "vitest";

import { getSearchAliasConfig } from "@/lib/search/aliases";
import { loadBundledSearchDocuments } from "@/lib/search/loadBundledSearchDocuments";
import { createSearchEngine } from "@/lib/search/miniSearch";
import { searchWithIndex } from "@/lib/search/query";
import { SEARCH_RANKING_FIXTURES, type SearchRankingFixture } from "@/lib/search/rankingFixtures";

function evaluateFixture(
  fixture: SearchRankingFixture,
  hits: Array<{ document: { id: string } }>,
): { ok: boolean; detail: string } {
  if (fixture.expectEmpty) {
    return hits.length === 0
      ? { ok: true, detail: "empty" }
      : { ok: false, detail: `expected empty, got ${hits.map((h) => h.document.id).join(", ")}` };
  }

  if (fixture.acceptableTopIds?.length) {
    const top = hits[0]?.document.id;
    if (!top || !fixture.acceptableTopIds.includes(top)) {
      return {
        ok: false,
        detail: `top=${top ?? "(none)"}; accepted=${fixture.acceptableTopIds.join("|")}; got=${hits
          .slice(0, 5)
          .map((h) => h.document.id)
          .join(",")}`,
      };
    }
  }

  if (fixture.mustIncludeInTop) {
    const window = hits.slice(0, fixture.mustIncludeInTop.n).map((h) => h.document.id);
    const missing = fixture.mustIncludeInTop.ids.filter((id) => !window.includes(id));
    if (missing.length) {
      return {
        ok: false,
        detail: `missing in top ${fixture.mustIncludeInTop.n}: ${missing.join(", ")}; got=${window.join(",")}`,
      };
    }
  }

  if (!fixture.acceptableTopIds?.length && !fixture.mustIncludeInTop && !fixture.expectEmpty) {
    return { ok: true, detail: "no hard assertion" };
  }

  return { ok: true, detail: "pass" };
}

describe("SEARCH_RANKING_FIXTURES", () => {
  const documents = loadBundledSearchDocuments();
  const aliasConfig = getSearchAliasConfig();
  const engine = createSearchEngine(documents);

  it("has at least 20 representative queries", () => {
    expect(SEARCH_RANKING_FIXTURES.length).toBeGreaterThanOrEqual(20);
  });

  for (const fixture of SEARCH_RANKING_FIXTURES) {
    const required = fixture.required !== false;
    it(`${required ? "" : "(soft) "}${fixture.id}: “${fixture.query}”`, () => {
      const hits = searchWithIndex(engine, fixture.query, {
        limit: 24,
        aliasConfig,
      });
      const result = evaluateFixture(fixture, hits);

      if (!result.ok && !required) {
        // Soft fixtures document thematic gaps without failing CI.
        return;
      }

      expect(result.ok, result.detail).toBe(true);

      if (
        fixture.id === "edition-title-wolty" &&
        hits[0]?.document.id === "book-when-others-look-to-you-v1"
      ) {
        const v2Index = hits.findIndex((h) => h.document.id === "book-when-others-look-to-you-v2");
        expect(v2Index).toBeGreaterThan(0);
      }
    });
  }
});
