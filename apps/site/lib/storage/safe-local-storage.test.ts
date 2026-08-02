import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  canUseLocalStorage,
  readLocalStorageJson,
  readLocalStorageRaw,
  readVersionedLocalState,
  removeLocalStorageKey,
  writeLocalStorageJson,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

const KEY = "ac_test_safe_storage";

describe("safe-local-storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("reports storage availability in jsdom", () => {
    expect(canUseLocalStorage()).toBe(true);
  });

  it("reads and writes JSON safely", () => {
    expect(writeLocalStorageJson(KEY, { hello: "world" })).toBe(true);
    expect(readLocalStorageJson<{ hello: string }>(KEY)).toEqual({ hello: "world" });
    expect(readLocalStorageRaw(KEY)).toContain("hello");
  });

  it("returns null for malformed JSON", () => {
    window.localStorage.setItem(KEY, "{not-json");
    expect(readLocalStorageJson(KEY)).toBeNull();
  });

  it("removes keys", () => {
    writeLocalStorageJson(KEY, { a: 1 });
    expect(removeLocalStorageKey(KEY)).toBe(true);
    expect(readLocalStorageRaw(KEY)).toBeNull();
  });

  it("round-trips versioned envelopes and rejects wrong versions", () => {
    expect(writeVersionedLocalState(KEY, 1, { favorite: true })).toBe(true);
    expect(readVersionedLocalState<{ favorite: boolean }>(KEY, 1)).toEqual({
      version: 1,
      data: { favorite: true },
    });
    expect(readVersionedLocalState(KEY, 2)).toBeNull();
  });
});
