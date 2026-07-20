import { describe, expect, it } from "vitest";

import {
  aliasTermsByTargetId,
  getSearchAliasConfig,
  parseSearchAliasConfig,
  relatedTermsByTargetId,
} from "@/lib/search/aliases";

describe("parseSearchAliasConfig", () => {
  it("drops invalid entries and keeps alias vs related kinds", () => {
    const config = parseSearchAliasConfig({
      version: 2,
      entries: [
        { terms: ["wolty"], kind: "alias", targetIds: ["book-1"] },
        { terms: ["temporary rules"], kind: "related", targetIds: ["pattern-1"] },
        { terms: [], kind: "alias", targetIds: ["book-1"] },
        { terms: ["x"], kind: "synonym", targetIds: ["book-1"] },
        null,
      ],
    });
    expect(config.version).toBe(2);
    expect(config.entries).toHaveLength(2);
    expect(config.entries[0]?.kind).toBe("alias");
    expect(config.entries[1]?.kind).toBe("related");
  });
});

describe("getSearchAliasConfig", () => {
  it("loads the bundled authored alias file", () => {
    const config = getSearchAliasConfig();
    expect(config.version).toBe(1);
    expect(config.entries.length).toBeGreaterThan(0);
    expect(aliasTermsByTargetId(config).get("book-when-others-look-to-you-v1")).toEqual(
      expect.arrayContaining(["wolty"]),
    );
    expect(relatedTermsByTargetId(config).get("pattern-exceptions-are-forever")).toEqual(
      expect.arrayContaining(["temporary rules"]),
    );
    expect(
      relatedTermsByTargetId(config).get("situation-temporary-fixes-become-permanent"),
    ).toEqual(expect.arrayContaining(["temporary rules"]));
  });
});

describe("aliasTermsByTargetId", () => {
  it("does not attach related terms as aliases", () => {
    const config = parseSearchAliasConfig({
      version: 1,
      entries: [
        { terms: ["aka"], kind: "alias", targetIds: ["id-1"] },
        { terms: ["nearby"], kind: "related", targetIds: ["id-1"] },
      ],
    });
    expect(aliasTermsByTargetId(config).get("id-1")).toEqual(["aka"]);
    expect(relatedTermsByTargetId(config).get("id-1")).toEqual(["nearby"]);
  });
});
