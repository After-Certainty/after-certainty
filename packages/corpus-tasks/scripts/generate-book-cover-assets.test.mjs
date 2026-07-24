import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

import { generateBookCoverAssets } from "./generate-book-cover-assets.mjs";
import { GENERATOR_VERSION, VARIANTS } from "./book-cover-variants.mjs";

async function writePng(filePath, width, height, { alpha = false } = {}) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: alpha ? 4 : 3,
      background: alpha ? { r: 20, g: 40, b: 60, alpha: 0.5 } : { r: 20, g: 40, b: 60 },
    },
  })
    .png()
    .toFile(filePath);
}

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function makeRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "cover-gen-"));
  mkdirSync(path.join(dir, "books"), { recursive: true });
  return dir;
}

test("generates detail/card/thumbnail WebP without enlargement or crop aspect drift", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "demo", "book-cover.png");
    await writePng(cover, 900, 1350);
    const out = path.join(repo, "out");
    const result = await generateBookCoverAssets({
      repo,
      out,
      force: true,
      books: [
        {
          slug: "demo",
          status: "published",
          source: "books",
          coverPath: "books/demo/book-cover.png",
          eligible: true,
        },
      ],
    });
    assert.equal(result.failed, 0);
    assert.ok(result.books.demo);
    for (const key of Object.keys(VARIANTS)) {
      const meta = result.books.demo.coverImages[key];
      assert.equal(meta.format, "webp");
      assert.ok(meta.width <= VARIANTS[key].maxWidth);
      assert.ok(meta.width <= 900);
      assert.ok(Math.abs(meta.width / meta.height - 900 / 1350) < 0.02);
      const file = path.join(out, "demo", `${key}.webp`);
      assert.equal(sha256(file), meta.sha256);
    }
    assert.equal(result.books.demo.generatorVersion, GENERATOR_VERSION);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("does not enlarge small sources", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "tiny", "book-cover.png");
    await writePng(cover, 120, 180);
    const out = path.join(repo, "out");
    const result = await generateBookCoverAssets({
      repo,
      out,
      force: true,
      books: [
        {
          slug: "tiny",
          status: "published",
          source: "books",
          coverPath: "books/tiny/book-cover.png",
          eligible: true,
        },
      ],
    });
    assert.equal(result.books.tiny.coverImages.detail.width, 120);
    assert.equal(result.books.tiny.coverImages.card.width, 120);
    assert.equal(result.books.tiny.coverImages.thumbnail.width, 120);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("skips regeneration when inputs match", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "skip", "book-cover.png");
    await writePng(cover, 800, 1200);
    const out = path.join(repo, "out");
    const books = [
      {
        slug: "skip",
        status: "published",
        source: "books",
        coverPath: "books/skip/book-cover.png",
        eligible: true,
      },
    ];
    const first = await generateBookCoverAssets({ repo, out, force: true, books });
    assert.equal(first.generated, 1);
    const second = await generateBookCoverAssets({ repo, out, books });
    assert.equal(second.generated, 0);
    assert.equal(second.skipped, 1);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("rejects corrupt source images", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "bad", "book-cover.png");
    mkdirSync(path.dirname(cover), { recursive: true });
    writeFileSync(cover, "not-an-image");
    const out = path.join(repo, "out");
    await assert.rejects(
      () =>
        generateBookCoverAssets({
          repo,
          out,
          force: true,
          books: [
            {
              slug: "bad",
              status: "published",
              source: "books",
              coverPath: "books/bad/book-cover.png",
              eligible: true,
            },
          ],
        }),
      /failed for 1/,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("preserves non-2:3 aspect ratio", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "wide", "book-cover.png");
    await writePng(cover, 1000, 1200);
    const out = path.join(repo, "out");
    const result = await generateBookCoverAssets({
      repo,
      out,
      force: true,
      books: [
        {
          slug: "wide",
          status: "published",
          source: "books",
          coverPath: "books/wide/book-cover.png",
          eligible: true,
        },
      ],
    });
    const d = result.books.wide.coverImages.detail;
    assert.ok(Math.abs(d.width / d.height - 1000 / 1200) < 0.02);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("deletes stale slug directories", async () => {
  const repo = makeRepo();
  try {
    const cover = path.join(repo, "books", "keep", "book-cover.png");
    await writePng(cover, 600, 900);
    const out = path.join(repo, "out");
    await generateBookCoverAssets({
      repo,
      out,
      force: true,
      books: [
        {
          slug: "keep",
          status: "published",
          source: "books",
          coverPath: "books/keep/book-cover.png",
          eligible: true,
        },
        {
          slug: "gone",
          status: "published",
          source: "books",
          coverPath: "books/keep/book-cover.png",
          eligible: true,
        },
      ],
    });
    assert.ok(readFileSync(path.join(out, "gone", "detail.webp")));
    await generateBookCoverAssets({
      repo,
      out,
      force: true,
      books: [
        {
          slug: "keep",
          status: "published",
          source: "books",
          coverPath: "books/keep/book-cover.png",
          eligible: true,
        },
      ],
    });
    assert.equal(existsSync(path.join(out, "gone")), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
