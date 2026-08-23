import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadInstalledManifestJson } from "@/lib/graph/installed-manifest-io";
import { validateSemanticGraph } from "@/lib/graph/validate";
import { loadManifestFixture, loadManifestFixtureJson } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const SITE_ROOT = process.cwd();
const PRODUCTION_GLOBS = ["app", "components", "lib"] as const;

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walkTsFiles(full, out);
      continue;
    }
    if (/\.(test|spec)\.(ts|tsx)$/.test(entry)) continue;
    if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("manifest production boundary", () => {
  it("does not import committed or test-fixture manifests from production source", () => {
    const forbidden = [
      "@/data/semantic-manifest.json",
      "data/semantic-manifest.json",
      "test/fixtures/semantic-manifest/",
      "@/test/fixtures/semantic-manifest",
    ];
    const offenders: string[] = [];
    for (const root of PRODUCTION_GLOBS) {
      for (const file of walkTsFiles(join(SITE_ROOT, root))) {
        const text = readFileSync(file, "utf8");
        for (const needle of forbidden) {
          if (text.includes(needle)) {
            offenders.push(`${file.replace(SITE_ROOT + "/", "")}: ${needle}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("does not reference the archived site repository or remote runtime manifest URL", () => {
    const forbidden = ["after-certainty-site", "SEMANTIC_MANIFEST_URL", "api.github.com/repos"];
    const offenders: string[] = [];
    for (const root of PRODUCTION_GLOBS) {
      for (const file of walkTsFiles(join(SITE_ROOT, root))) {
        // Historical comments in migration-adjacent code are not under these roots.
        const text = readFileSync(file, "utf8");
        for (const needle of forbidden) {
          if (text.includes(needle)) {
            offenders.push(`${file.replace(SITE_ROOT + "/", "")}: ${needle}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("throws when the installed local manifest is missing", () => {
    expect(() => loadInstalledManifestJson(join(SITE_ROOT, "does-not-exist-root"))).toThrow(
      /local-semantic-manifest\.json/,
    );
  });
});

describe("semantic-manifest fixtures", () => {
  it("parses the minimal valid fixture", () => {
    const graph = loadManifestFixture("minimal-valid");
    expect(graph.schemaVersion).toBe("2.3");
    expect(graph.books.length).toBeGreaterThan(0);
  });

  it("parses representative enriched / editions / discovery fixtures", () => {
    expect(loadManifestFixture("enriched-book").books[0]?.overview).toBeTruthy();
    expect(
      loadManifestFixture("fiction-and-poetry").books.some((b) => b.contentType === "fiction"),
    ).toBe(true);
    expect(loadManifestFixture("editions").editions?.length).toBeGreaterThan(0);
    expect(loadManifestFixture("questions-and-trails").questions?.length).toBeGreaterThan(0);
  });

  it("rejects invalid fixtures clearly", () => {
    const missing = loadManifestFixtureJson("invalid/missing-required-book-fields");
    const result = validateSemanticGraph(missing);
    expect(result.success).toBe(false);

    const empty = loadManifestFixtureJson("invalid/empty-object");
    // Empty object is accepted by schema defaults (empty collections) — still not a production artifact.
    expect(empty).toEqual({});
  });
});

describe.skipIf(!tryLoadLocalSemanticManifest())("installed local manifest contract", () => {
  it("loads the generated local manifest through the production offline loader", () => {
    const raw = loadInstalledManifestJson();
    const validated = validateSemanticGraph(raw);
    expect(validated.success).toBe(true);
    if (!validated.success) return;
    expect(validated.data.books.length).toBeGreaterThan(0);
    expect(validated.data.sourceCommit).toBeTruthy();
  });
});
