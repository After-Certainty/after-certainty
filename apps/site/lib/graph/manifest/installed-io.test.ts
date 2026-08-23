import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadInstalledManifestJson,
  LOCAL_SEMANTIC_MANIFEST_RELATIVE,
} from "@/lib/graph/manifest/installed-io";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

describe("loadOfflineManifestJson", () => {
  const envKeys = ["SEMANTIC_MANIFEST_USE_LOCAL"] as const;
  const saved: Record<string, string | undefined> = {};
  let tempRoot: string | undefined;

  afterEach(() => {
    for (const k of envKeys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    if (tempRoot) {
      rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = undefined;
    }
  });

  function captureEnv() {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
  }

  it("throws when local file is missing", () => {
    captureEnv();
    process.env.SEMANTIC_MANIFEST_USE_LOCAL = "1";
    tempRoot = mkdtempSync(join(tmpdir(), "offline-manifest-missing-"));
    expect(() => loadInstalledManifestJson(tempRoot)).toThrow(/local-semantic-manifest\.json/);
  });

  it("loads local-semantic-manifest.json when present", () => {
    captureEnv();
    process.env.SEMANTIC_MANIFEST_USE_LOCAL = "1";
    tempRoot = mkdtempSync(join(tmpdir(), "offline-manifest-"));
    mkdirSync(join(tempRoot, "data"), { recursive: true });
    const local = {
      schemaVersion: "2.3",
      sourceCommit: "local-preview",
      books: [],
    };
    writeFileSync(
      join(tempRoot, LOCAL_SEMANTIC_MANIFEST_RELATIVE),
      JSON.stringify(local),
      "utf8",
    );
    expect(loadInstalledManifestJson(tempRoot)).toEqual(local);
  });

  it.skipIf(!tryLoadLocalSemanticManifest())(
    "loads the installed checkout local manifest from process.cwd()",
    () => {
      captureEnv();
      process.env.SEMANTIC_MANIFEST_USE_LOCAL = "1";
      const data = loadInstalledManifestJson();
      expect(data).toBeTruthy();
      expect(typeof data).toBe("object");
    },
  );
});
