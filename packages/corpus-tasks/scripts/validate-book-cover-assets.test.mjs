import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { validateBookCoverAssets } from "./validate-book-cover-assets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("validate passes for freshly generated corpus covers", async () => {
  const result = await validateBookCoverAssets({
    repo: ROOT,
    out: path.join(ROOT, "build/site-assets/book-covers"),
  });
  assert.equal(result.ok, true, result.errors.join("\n"));
});
