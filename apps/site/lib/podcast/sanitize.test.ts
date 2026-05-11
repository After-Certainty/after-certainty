import { describe, expect, it } from "vitest";

import { stripHtml, truncatePlaintext } from "@/lib/podcast/sanitize";

describe("stripHtml", () => {
  it("removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });

  it("decodes common entities", () => {
    expect(stripHtml("Tom &amp; Jerry")).toBe("Tom & Jerry");
  });
});

describe("truncatePlaintext", () => {
  it("returns short text unchanged", () => {
    expect(truncatePlaintext("short", 100)).toBe("short");
  });

  it("truncates with ellipsis when longer than maxChars", () => {
    const long = "one two three four five six seven eight nine ten";
    const out = truncatePlaintext(long, 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(20);
  });
});
