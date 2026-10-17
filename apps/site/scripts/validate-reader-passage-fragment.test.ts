import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveMonorepoRoot } from "@/lib/reading/repo-root";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "validate-reader-passage-fragment.mjs",
);
const malformedFixture = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/malformed-footnote-chapter.md",
);

function run(args: string[]): { code: number; json: Record<string, unknown> } {
  const repo = resolveMonorepoRoot();
  const result = spawnSync("node", [script, ...args, "--repo", repo], {
    cwd: path.join(repo, "apps/site"),
    encoding: "utf8",
  });
  const stdout = (result.stdout ?? "").trim();
  const line =
    stdout
      .split("\n")
      .reverse()
      .find((l) => l.trim().startsWith("{")) ?? "{}";
  return {
    code: result.status ?? 1,
    json: JSON.parse(line) as Record<string, unknown>,
  };
}

describe("validate-reader-passage-fragment", () => {
  it("accepts the Goodhart citation fnref in rendered HTML", () => {
    const { code, json } = run([
      "--book-dir",
      "books/when-authority-outlives-accountability",
      "--source-path",
      "parts/part-1-the-three-dimensions/chapter-3-effectiveness.md",
      "--fragment",
      "user-content-fnref-c3-goodhart-monetary-management",
    ]);
    expect(json.ok).toBe(true);
    expect(code).toBe(0);
  });

  it("rejects a missing fragment as a defect", () => {
    const { code, json } = run([
      "--book-dir",
      "books/when-authority-outlives-accountability",
      "--source-path",
      "parts/part-1-the-three-dimensions/chapter-3-effectiveness.md",
      "--fragment",
      "user-content-fnref-does-not-exist",
    ]);
    expect(json.ok).toBe(false);
    expect(code).not.toBe(0);
  });

  it("accepts Amershi and Kahneman–Klein pilot citation anchors", () => {
    for (const caseRow of [
      {
        bookDir: "books/coupling",
        sourcePath:
          "parts/part-3-ai-and-structural-entropy/16-the-new-professional-literacy.md",
        fragment: "user-content-fnref-c16-opening",
      },
      {
        bookDir: "books/what-we-cannot-see",
        sourcePath:
          "parts/part-1-bias-learning-to-see-your-own-mind/chapter-4-who-and-what-we-trust.md",
        fragment: "user-content-fnref-c4-kahneman-klein-intuitive-expertise",
      },
    ]) {
      const { json } = run([
        "--book-dir",
        caseRow.bookDir,
        "--source-path",
        caseRow.sourcePath,
        "--fragment",
        caseRow.fragment,
      ]);
      expect(json.ok, JSON.stringify(caseRow)).toBe(true);
    }
  });

  it("rejects a malformed footnote that never mints the claimed fnref id", () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fn-malformed-"));
    const bookDir = "books/fixture-malformed";
    const sourcePath = "parts/part-1/chapter-1.md";
    const manuscript = path.join(tmpRoot, bookDir, sourcePath);
    fs.mkdirSync(path.dirname(manuscript), { recursive: true });
    fs.copyFileSync(malformedFixture, manuscript);

    const result = spawnSync(
      "node",
      [
        script,
        "--book-dir",
        bookDir,
        "--source-path",
        sourcePath,
        "--fragment",
        "user-content-fnref-claimed-id",
        "--repo",
        tmpRoot,
      ],
      {
        cwd: path.join(resolveMonorepoRoot(), "apps/site"),
        encoding: "utf8",
      },
    );
    const stdout = (result.stdout ?? "").trim();
    const line =
      stdout
        .split("\n")
        .reverse()
        .find((l) => l.trim().startsWith("{")) ?? "{}";
    const json = JSON.parse(line) as Record<string, unknown>;
    expect(json.ok).toBe(false);
    expect(result.status ?? 1).not.toBe(0);
  });
});
