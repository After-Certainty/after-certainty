import { beforeEach, describe, expect, it, vi } from "vitest";

import { bookGithubDownloads } from "@/lib/books/when-others-look-to-you/content";
import { WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import type { Book } from "@/types/content";

vi.mock("@/lib/content-data", () => ({
  getBooks: vi.fn(),
}));

import { getBooks } from "@/lib/content-data";
import {
  buildWoltyBookPageContent,
  getWoltyManifestDownloadUrls,
} from "@/lib/books/when-others-look-to-you/catalog-downloads";

function book(partial: Partial<Book> & Pick<Book, "slug">): Book {
  return {
    title: "Title",
    description: "Desc",
    status: "published",
    authors: ["Author"],
    ...partial,
  };
}

describe("buildWoltyBookPageContent", () => {
  beforeEach(() => {
    vi.mocked(getBooks).mockReset();
  });

  it("uses manifest EPUB/DOCX for primary when set", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({
        slug: WOLTY_V1_SLUG,
        epubUrl: "https://manifest/epub",
        docxUrl: "https://manifest/docx",
      }),
    ]);
    const content = await buildWoltyBookPageContent();
    expect(content.readLinks[0].label).toBe("Buy on Amazon");
    expect(content.readLinks.find((l) => l.label === "Download EPUB")?.href).toBe("https://manifest/epub");
    expect(content.readLinks.find((l) => l.label === "Download DOCX")?.href).toBe("https://manifest/docx");
    expect(content.companionDownloadSections).toBeUndefined();
  });

  it("falls back to bookGithubDownloads when primary has no URLs", async () => {
    vi.mocked(getBooks).mockResolvedValue([book({ slug: WOLTY_V1_SLUG })]);
    const content = await buildWoltyBookPageContent();
    expect(content.readLinks.find((l) => l.label === "Download EPUB")?.href).toBe(bookGithubDownloads.epub);
    expect(content.readLinks.find((l) => l.label === "Download DOCX")?.href).toBe(bookGithubDownloads.docx);
  });

  it("uses legacy when-others-look-to-you slug when v1 row absent", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({
        slug: "when-others-look-to-you",
        epubUrl: "https://legacy/epub",
      }),
    ]);
    const content = await buildWoltyBookPageContent();
    expect(content.readLinks.find((l) => l.label === "Download EPUB")?.href).toBe("https://legacy/epub");
  });

  it("adds companion sections only when companion has manifest URLs", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({
        slug: WOLTY_V1_SLUG,
        epubUrl: "https://v1/e",
        companionBooks: ["v2"],
      }),
      book({ slug: "v2", title: "Companion", epubUrl: "https://v2/e" }),
    ]);
    const content = await buildWoltyBookPageContent();
    expect(content.companionDownloadSections).toHaveLength(1);
    expect(content.companionDownloadSections![0].heading).toContain("Companion");
    expect(content.companionDownloadSections![0].links).toEqual([{ label: "Download EPUB", href: "https://v2/e" }]);
  });

  it("resolves companions via companionOf when companionBooks absent", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({ slug: WOLTY_V1_SLUG, epubUrl: "https://v1/e" }),
      book({
        slug: "orphan-v2",
        title: "V2",
        subtitle: "Sub",
        epubUrl: "https://v2-only/e",
        companionOf: WOLTY_V1_SLUG,
      }),
    ]);
    const content = await buildWoltyBookPageContent();
    expect(content.companionDownloadSections).toHaveLength(1);
    expect(content.companionDownloadSections![0].heading).toContain("Sub");
  });

  it("omits companion sections when companion has no EPUB or DOCX", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({ slug: WOLTY_V1_SLUG, epubUrl: "https://v1/e", companionBooks: ["v2"] }),
      book({ slug: "v2", title: "Empty" }),
    ]);
    const content = await buildWoltyBookPageContent();
    expect(content.companionDownloadSections).toBeUndefined();
  });
});

describe("getWoltyManifestDownloadUrls", () => {
  beforeEach(() => {
    vi.mocked(getBooks).mockReset();
  });

  it("returns primary URLs and companion optional URLs", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      book({ slug: WOLTY_V1_SLUG, epubUrl: "https://p/e", docxUrl: "https://p/d", companionBooks: ["v2"] }),
      book({ slug: "v2", epubUrl: "https://c/e" }),
    ]);
    const { primary, companions } = await getWoltyManifestDownloadUrls();
    expect(primary).toEqual({ epubUrl: "https://p/e", docxUrl: "https://p/d" });
    expect(companions).toHaveLength(1);
    expect(companions[0].epubUrl).toBe("https://c/e");
    expect(companions[0].docxUrl).toBeUndefined();
  });
});
