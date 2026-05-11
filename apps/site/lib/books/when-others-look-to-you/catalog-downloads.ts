import { WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import {
  bookGithubDownloads,
  bookPageContent,
  type BookCompanionDownloadSection,
  type BookPageContent,
  type BookPageLink,
} from "@/lib/books/when-others-look-to-you/content";
import { getBooks } from "@/lib/content-data";
import type { Book } from "@/types/content";

function findWoltyPrimaryBook(books: Book[]): Book | undefined {
  return books.find((b) => b.slug === WOLTY_V1_SLUG) ?? books.find((b) => b.slug === "when-others-look-to-you");
}

function companionEditionBooks(primary: Book, books: Book[]): Book[] {
  const linked = (primary.companionBooks ?? [])
    .map((slug) => books.find((b) => b.slug === slug))
    .filter((b): b is Book => Boolean(b));
  if (linked.length > 0) return linked;
  return books.filter((b) => b.companionOf === primary.slug);
}

function pushEpubDocxWithFallback(
  target: BookPageLink[],
  epub: string | undefined,
  docx: string | undefined,
  fallbackEpub: string,
  fallbackDocx: string,
): void {
  const e = epub ?? fallbackEpub;
  const d = docx ?? fallbackDocx;
  if (e) target.push({ label: "Download EPUB", href: e });
  if (d) target.push({ label: "Download DOCX", href: d });
}

function pushEpubDocxManifestOnly(target: BookPageLink[], epub: string | undefined, docx: string | undefined): void {
  if (epub) target.push({ label: "Download EPUB", href: epub });
  if (docx) target.push({ label: "Download DOCX", href: docx });
}

/**
 * WoLTY `/book` page content — `readLinks` EPUB/DOCX come from the fetched books manifest when present
 * (via merged catalog), with `bookGithubDownloads` as fallback. Companion editions get their own block.
 */
export async function buildWoltyBookPageContent(): Promise<BookPageContent> {
  const books = await getBooks();
  const primary = findWoltyPrimaryBook(books);
  const fb = bookGithubDownloads;
  const amazon = bookPageContent.readLinks[0];
  const readLinks: BookPageLink[] = [amazon];
  pushEpubDocxWithFallback(readLinks, primary?.epubUrl, primary?.docxUrl, fb.epub, fb.docx);

  const companionDownloadSections: BookCompanionDownloadSection[] = [];
  if (primary) {
    for (const edition of companionEditionBooks(primary, books)) {
      const sectionLinks: BookPageLink[] = [];
      pushEpubDocxManifestOnly(sectionLinks, edition.epubUrl, edition.docxUrl);
      if (sectionLinks.length === 0) continue;
      companionDownloadSections.push({
        heading: edition.subtitle ? `${edition.title} — ${edition.subtitle}` : `${edition.title} (companion)`,
        links: sectionLinks,
      });
    }
  }

  return {
    ...bookPageContent,
    readLinks,
    companionDownloadSections: companionDownloadSections.length > 0 ? companionDownloadSections : undefined,
  };
}

export type WoltyPrimaryDownloadUrls = {
  epubUrl: string;
  docxUrl: string;
};

export type WoltyCompanionDownloadUrls = {
  heading: string;
  epubUrl?: string;
  docxUrl?: string;
};

/** Primary + companion EPUB/DOCX URLs for microsite pages (e.g. `/resources`). */
export async function getWoltyManifestDownloadUrls(): Promise<{
  primary: WoltyPrimaryDownloadUrls;
  companions: WoltyCompanionDownloadUrls[];
}> {
  const books = await getBooks();
  const primaryBook = findWoltyPrimaryBook(books);
  const fb = bookGithubDownloads;
  const primary: WoltyPrimaryDownloadUrls = {
    epubUrl: primaryBook?.epubUrl ?? fb.epub,
    docxUrl: primaryBook?.docxUrl ?? fb.docx,
  };

  const companions: WoltyCompanionDownloadUrls[] = [];
  if (primaryBook) {
    for (const edition of companionEditionBooks(primaryBook, books)) {
      companions.push({
        heading: edition.subtitle ? `${edition.title} — ${edition.subtitle}` : `${edition.title} (companion)`,
        epubUrl: edition.epubUrl,
        docxUrl: edition.docxUrl,
      });
    }
  }

  return { primary, companions };
}
