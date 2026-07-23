import { describe, expect, it } from "vitest";

import {
  INTENDED_SCHEMA_VERSION,
  compareSchemaVersions,
  isCompatibilitySchemaVersion,
  isCompatibleSchemaVersion,
  isIntendedSchemaVersion,
  isSchemaAtLeast,
  parseSchemaVersion,
} from "@/lib/graph/schema-version";

describe("schema-version", () => {
  it("parses major.minor without string comparison pitfalls", () => {
    expect(parseSchemaVersion("2.3")).toEqual({ major: 2, minor: 3, raw: "2.3" });
    expect(parseSchemaVersion("2.10")).toEqual({ major: 2, minor: 10, raw: "2.10" });
    expect(parseSchemaVersion(undefined)).toBeNull();
    expect(parseSchemaVersion("not-a-version")).toBeNull();
  });

  it("accepts schema 2.3 and compatibility 2.2; rejects major 3+", () => {
    expect(isCompatibleSchemaVersion(undefined)).toBe(true);
    expect(isCompatibleSchemaVersion("2.2")).toBe(true);
    expect(isCompatibleSchemaVersion("2.3")).toBe(true);
    expect(isCompatibleSchemaVersion("3.0")).toBe(false);
    expect(isCompatibleSchemaVersion("abc")).toBe(false);
  });

  it("identifies intended vs compatibility modes", () => {
    expect(isIntendedSchemaVersion("2.3")).toBe(true);
    expect(isIntendedSchemaVersion("2.4")).toBe(true);
    expect(isIntendedSchemaVersion("2.2")).toBe(false);
    expect(isCompatibilitySchemaVersion("2.2")).toBe(true);
    expect(isCompatibilitySchemaVersion("2.3")).toBe(false);
    expect(isSchemaAtLeast("2.3", INTENDED_SCHEMA_VERSION)).toBe(true);
    expect(
      compareSchemaVersions(parseSchemaVersion("2.10")!, parseSchemaVersion("2.3")!),
    ).toBeGreaterThan(0);
  });
});
