import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { preprocessManuscriptMarkdown, rewriteManuscriptAssetUrls } from "@/lib/reading/preprocess-manuscript";
import { renderManuscriptHtml } from "@/lib/reading/render-manuscript-html";
import { resolveManuscriptPath } from "@/lib/reading/resolve-manuscript-path";
import { resolveMonorepoRoot } from "@/lib/reading/repo-root";

describe("preprocessManuscriptMarkdown", () => {
  it("strips leading H1, Pandoc image attrs, and fenced div markers", () => {
    const input = `# **Introduction**

Hello.

![Diagram](export-assets/diagrams/map.png){ width=100% }

::: {custom-style="Vignette Block"}
Vignette text
:::
`;
    const out = preprocessManuscriptMarkdown(input);
    expect(out).not.toMatch(/^#\s/);
    expect(out).toContain("![Diagram](export-assets/diagrams/map.png)");
    expect(out).not.toContain("{ width=100% }");
    expect(out).not.toContain(":::");
    expect(out).toContain("Vignette text");
  });
});

describe("rewriteManuscriptAssetUrls", () => {
  it("rewrites relative images to site manuscript-assets and demotes .md links to text", () => {
    const md = `See [How to Read](how-to-read-this-book.md).

![Map](export-assets/diagrams/map.png)
![Cover](BookCover.png)
`;
    const out = rewriteManuscriptAssetUrls(md, { bookDir: "books/after-certainty" });
    expect(out).toContain("See How to Read.");
    expect(out).not.toContain("](how-to-read-this-book.md)");
    // Export-time PNGs map to committed SVGs under docs/diagrams/.
    expect(out).toContain(
      "![Map](/manuscript-assets/books/after-certainty/docs/diagrams/map.svg)",
    );
    expect(out).toContain("![Cover](/manuscript-assets/books/after-certainty/BookCover.png)");
    expect(out).not.toContain("raw.githubusercontent.com");
  });
});

describe("renderManuscriptHtml", () => {
  it("renders footnotes, heading ids, and sanitizes scripts", async () => {
    const markdown = `## **Section One**

A claim with a note.[^n1]

<script>alert(1)</script>

[^n1]: Citation body with *italics*.
`;
    const html = await renderManuscriptHtml({
      markdown,
      bookDir: "books/after-certainty",
      stripLeadingH1: false,
    });

    expect(html).toContain("Section One");
    expect(html).toMatch(/id="[^"]*section-one"/i);
    expect(html).toContain("data-footnote-ref");
    expect(html).toContain("footnotes");
    expect(html).toContain("Citation body");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(1)");
    // Sanitize must not double-prefix GFM footnote ids (breaks href/id pairs).
    expect(html).not.toMatch(/user-content-user-content-/);

    const hrefTargets = [...html.matchAll(/\shref="#([^"]+)"/g)].map((m) => m[1]);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    expect(hrefTargets.length).toBeGreaterThanOrEqual(2);
    for (const target of hrefTargets) {
      expect(ids.has(target), `missing id for href="#${target}"`).toBe(true);
    }
  });
});

describe("resolveManuscriptPath", () => {
  it("resolves after-certainty introduction under the monorepo books tree", () => {
    const repoRoot = resolveMonorepoRoot();
    const result = resolveManuscriptPath({
      book: { slug: "after-certainty", bookDir: "books/after-certainty" },
      sourcePath: "front-matter/introduction.md",
      repoRoot,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.absolutePath.endsWith("books/after-certainty/front-matter/introduction.md")).toBe(
        true,
      );
      expect(result.source === "checkout" || result.source === "installed").toBe(true);
    }
  });

  it("rejects path escape attempts", () => {
    const repoRoot = resolveMonorepoRoot();
    const result = resolveManuscriptPath({
      book: { slug: "after-certainty", bookDir: "books/after-certainty" },
      sourcePath: "../../etc/passwd",
      repoRoot,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("path_escape");
  });

  it("prefers installed manuscripts under apps/site/data/manuscripts when present", () => {
    const repoRoot = resolveMonorepoRoot();
    const installed = path.join(
      repoRoot,
      "apps/site/data/manuscripts/books/after-certainty/front-matter/introduction.md",
    );
    const checkout = path.join(
      repoRoot,
      "books/after-certainty/front-matter/introduction.md",
    );
    // Only assert preference when an install has been run in this workspace.
    if (!fs.existsSync(installed)) {
      expect(fs.existsSync(checkout)).toBe(true);
      return;
    }
    const result = resolveManuscriptPath({
      book: { slug: "after-certainty", bookDir: "books/after-certainty" },
      sourcePath: "front-matter/introduction.md",
      repoRoot,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("installed");
      expect(result.absolutePath).toBe(path.resolve(installed));
    }
  });
});
