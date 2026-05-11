import { describe, expect, it } from "vitest";

import { getLibraryPatterns } from "@/lib/patterns/registry";

import { generateStaticParams } from "./page";

describe("patterns/[slug] page", () => {
  it("generateStaticParams lists every library pattern slug", () => {
    const params = generateStaticParams();
    const expected = getLibraryPatterns().map((p) => ({ slug: p.slug }));

    expect(params).toEqual(expected);
  });
});
