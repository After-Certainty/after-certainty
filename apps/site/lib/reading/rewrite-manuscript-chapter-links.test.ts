import { describe, expect, it } from "vitest";

import {
  normalizeManuscriptLinkTitle,
  resolveManuscriptMdTarget,
  rewriteManuscriptChapterLinks,
} from "@/lib/reading/rewrite-manuscript-chapter-links";
import { renderManuscriptHtml } from "@/lib/reading/render-manuscript-html";

const economyChapters = [
  {
    sourcePath: "front-matter/contents.md",
    routeKey: "/explore/books/the-economy-we-dont-experience/chapters/front-matter-contents",
    title: "Contents",
  },
  {
    sourcePath: "front-matter/introduction-the-chart-and-the-receipt.md",
    routeKey:
      "/explore/books/the-economy-we-dont-experience/chapters/front-matter-introduction-the-chart-and-the-receipt",
    title: "Introduction — The Chart and the Receipt",
  },
  {
    sourcePath: "parts/part-1-the-economy-we-describe/chapter-1-what-the-average-leaves-out.md",
    routeKey:
      "/explore/books/the-economy-we-dont-experience/chapters/parts-part-1-the-economy-we-describe-chapter-1-what-the-average-leaves-out",
    title: "Chapter 1 — What the Average Leaves Out",
  },
];

describe("resolveManuscriptMdTarget", () => {
  it("resolves relative paths within the book", () => {
    expect(
      resolveManuscriptMdTarget(
        "front-matter/introduction.md",
        "how-to-read-this-book.md",
      ),
    ).toBe("front-matter/how-to-read-this-book.md");
    expect(
      resolveManuscriptMdTarget(
        "front-matter/introduction.md",
        "../parts/part-1/bridge.md",
      ),
    ).toBe("parts/part-1/bridge.md");
  });

  it("rejects paths that escape the book root", () => {
    expect(resolveManuscriptMdTarget("front-matter/introduction.md", "../../etc/passwd.md")).toBeNull();
  });
});

describe("rewriteManuscriptChapterLinks", () => {
  it("rewrites Contents-style fragment links by chapter title", () => {
    const md = `- [Introduction — The Chart and the Receipt](#introduction)
- [Chapter 1 — What the Average Leaves Out](#chapter-1)
- [About the Series](#about-the-series)
`;
    const out = rewriteManuscriptChapterLinks(md, {
      sourcePath: "front-matter/contents.md",
      chapters: economyChapters,
    });
    expect(out).toContain(
      "](/explore/books/the-economy-we-dont-experience/chapters/front-matter-introduction-the-chart-and-the-receipt)",
    );
    expect(out).toContain(
      "](/explore/books/the-economy-we-dont-experience/chapters/parts-part-1-the-economy-we-describe-chapter-1-what-the-average-leaves-out)",
    );
    // Unmatched fragment stays for same-page / unknown targets.
    expect(out).toContain("[About the Series](#about-the-series)");
  });

  it("rewrites relative .md links to chapter routes and demotes unknowns", () => {
    const md = `See [Chapter 1](../parts/part-1-the-economy-we-describe/chapter-1-what-the-average-leaves-out.md).

See [Missing](no-such-file.md).

![Map](export-assets/diagrams/map.png)
`;
    const out = rewriteManuscriptChapterLinks(md, {
      sourcePath: "front-matter/contents.md",
      chapters: economyChapters,
    });
    expect(out).toContain(
      "[Chapter 1](/explore/books/the-economy-we-dont-experience/chapters/parts-part-1-the-economy-we-describe-chapter-1-what-the-average-leaves-out)",
    );
    expect(out).toContain("See Missing.");
    expect(out).not.toContain("no-such-file.md");
    expect(out).toContain("![Map](export-assets/diagrams/map.png)");
  });

  it("normalizes curly quotes in titles", () => {
    expect(normalizeManuscriptLinkTitle('Appendix — Why “Just Tell the Truth” Is Not a Strategy')).toBe(
      normalizeManuscriptLinkTitle('Appendix — Why "Just Tell the Truth" Is Not a Strategy'),
    );
  });
});

describe("renderManuscriptHtml chapter links", () => {
  it("emits live chapter hrefs for Contents fragment links", async () => {
    const markdown = `# **Contents**

- [Introduction — The Chart and the Receipt](#introduction)
`;
    const html = await renderManuscriptHtml({
      markdown,
      bookDir: "books/the-economy-we-dont-experience",
      sourcePath: "front-matter/contents.md",
      chapterLinkTargets: economyChapters,
      stripLeadingH1: true,
    });
    expect(html).toContain(
      'href="/explore/books/the-economy-we-dont-experience/chapters/front-matter-introduction-the-chart-and-the-receipt"',
    );
  });
});
