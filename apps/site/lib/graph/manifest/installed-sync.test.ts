import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadInstalledSemanticGraphSync,
  resetInstalledSemanticGraphCacheForTests,
} from "@/lib/graph/installed-manifest";
import { fetchSemanticGraphLoadResultUncached } from "@/lib/graph/manifest";
import { LOCAL_SEMANTIC_MANIFEST_RELATIVE } from "@/lib/graph/installed-manifest-io";
import * as installedManifestIo from "@/lib/graph/installed-manifest-io";
import { loadManifestFixtureJson } from "@/test/helpers/load-manifest-fixture";

const MINIMAL_VALID = loadManifestFixtureJson("minimal-valid");

function writeManifest(root: string, data: unknown): void {
  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(
    join(root, LOCAL_SEMANTIC_MANIFEST_RELATIVE),
    JSON.stringify(data),
    "utf8",
  );
}

describe("loadInstalledSemanticGraphSync", () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    resetInstalledSemanticGraphCacheForTests();
    if (tempRoot) {
      rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = undefined;
    }
  });

  it("loads and validates a minimal graph from a temp root", () => {
    tempRoot = mkdtempSync(join(tmpdir(), "installed-sync-valid-"));
    writeManifest(tempRoot, MINIMAL_VALID);
    const graph = loadInstalledSemanticGraphSync(tempRoot);
    expect(graph.books).toHaveLength(1);
    expect(graph.books[0]?.slug).toBe("fixture-minimal");
  });

  it("throws when the manifest file is missing", () => {
    tempRoot = mkdtempSync(join(tmpdir(), "installed-sync-missing-"));
    expect(() => loadInstalledSemanticGraphSync(tempRoot)).toThrow(/local-semantic-manifest\.json/);
  });

  it("throws when Zod validation fails", () => {
    tempRoot = mkdtempSync(join(tmpdir(), "installed-sync-zod-"));
    writeManifest(tempRoot, loadManifestFixtureJson("invalid/missing-required-book-fields"));
    expect(() => loadInstalledSemanticGraphSync(tempRoot)).toThrow(/failed validation/);
  });

  it("throws when schemaVersion major is incompatible", () => {
    tempRoot = mkdtempSync(join(tmpdir(), "installed-sync-schema-"));
    writeManifest(tempRoot, { ...MINIMAL_VALID, schemaVersion: "3.0" });
    expect(() => loadInstalledSemanticGraphSync(tempRoot)).toThrow(/incompatible schemaVersion/);
  });
});

describe("async/sync loader agreement", () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    vi.restoreAllMocks();
    resetInstalledSemanticGraphCacheForTests();
    delete process.env.SEMANTIC_MANIFEST_USE_LOCAL;
    delete process.env.VERCEL;
    delete process.env.NEXT_PHASE;
    if (tempRoot) {
      rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = undefined;
    }
  });

  it("both reject Zod-invalid payloads", async () => {
    delete process.env.SEMANTIC_MANIFEST_USE_LOCAL;
    delete process.env.VERCEL;
    delete process.env.NEXT_PHASE;

    const invalid = loadManifestFixtureJson("invalid/missing-required-book-fields");
    vi.spyOn(installedManifestIo, "loadInstalledManifestJson").mockReturnValue(invalid);

    tempRoot = mkdtempSync(join(tmpdir(), "installed-parity-zod-"));
    writeManifest(tempRoot, invalid);
    expect(() => loadInstalledSemanticGraphSync(tempRoot)).toThrow(/failed validation/);

    await expect(fetchSemanticGraphLoadResultUncached()).rejects.toThrow(/failed validation/);
  });

  it("both reject incompatible schemaVersion (major 3)", async () => {
    const incompatible = { ...MINIMAL_VALID, schemaVersion: "3.0" };
    vi.spyOn(installedManifestIo, "loadInstalledManifestJson").mockReturnValue(incompatible);

    tempRoot = mkdtempSync(join(tmpdir(), "installed-parity-schema-"));
    writeManifest(tempRoot, incompatible);
    expect(() => loadInstalledSemanticGraphSync(tempRoot)).toThrow(/incompatible schemaVersion/);

    await expect(fetchSemanticGraphLoadResultUncached()).rejects.toThrow(/incompatible/);
  });

  it("both accept the same minimal-valid fixture", async () => {
    vi.spyOn(installedManifestIo, "loadInstalledManifestJson").mockReturnValue(MINIMAL_VALID);

    tempRoot = mkdtempSync(join(tmpdir(), "installed-parity-valid-"));
    writeManifest(tempRoot, MINIMAL_VALID);
    const syncGraph = loadInstalledSemanticGraphSync(tempRoot);

    const result = await fetchSemanticGraphLoadResultUncached();
    expect(result.graph.books).toEqual(syncGraph.books);
    expect(result.graph.glossary).toEqual(syncGraph.glossary);
    expect(result.source.reason).toBe("installed");
  });
});

describe("fetchSemanticGraphLoadResultUncached hard-fail policy", () => {
  const envKeys = [
    "SEMANTIC_MANIFEST_USE_LOCAL",
    "VERCEL",
    "NEXT_PHASE",
    "SEMANTIC_MANIFEST_OFFLINE",
  ] as const;
  const saved: Partial<Record<(typeof envKeys)[number], string>> = {};

  function captureEnv(): void {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
  }

  function restoreEnv(): void {
    for (const k of envKeys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }

  afterEach(() => {
    vi.restoreAllMocks();
    restoreEnv();
  });

  function mockMissingManifest(): void {
    vi.spyOn(installedManifestIo, "loadInstalledManifestJson").mockImplementation(() => {
      throw new Error("data/local-semantic-manifest.json is missing.");
    });
  }

  async function expectHardFail(env: Record<string, string>): Promise<void> {
    captureEnv();
    for (const k of envKeys) delete process.env[k];
    Object.assign(process.env, env);
    mockMissingManifest();
    await expect(fetchSemanticGraphLoadResultUncached()).rejects.toThrow(
      /local-semantic-manifest\.json is missing/,
    );
  }

  it("throws under VERCEL=1 when manifest is missing or invalid", async () => {
    await expectHardFail({ VERCEL: "1" });
  });

  it("throws under SEMANTIC_MANIFEST_USE_LOCAL=1 when manifest is missing or invalid", async () => {
    await expectHardFail({ SEMANTIC_MANIFEST_USE_LOCAL: "1" });
  });

  it("throws under NEXT_PHASE=phase-production-build when manifest is missing or invalid", async () => {
    await expectHardFail({ NEXT_PHASE: "phase-production-build" });
  });

  it("throws when hard-fail env is off and manifest is missing", async () => {
    captureEnv();
    delete process.env.SEMANTIC_MANIFEST_USE_LOCAL;
    delete process.env.VERCEL;
    delete process.env.NEXT_PHASE;
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    mockMissingManifest();

    await expect(fetchSemanticGraphLoadResultUncached()).rejects.toThrow(
      /local-semantic-manifest\.json is missing/,
    );
  });
});
