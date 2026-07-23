import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy class fragments", () => {
    expect(cn("a", undefined, false, "b")).toBe("a b");
  });
});
