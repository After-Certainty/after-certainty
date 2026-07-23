import type { ContentType } from "@/lib/books/catalog-taxonomy";
import { CONTENT_TYPE_LABELS } from "@/lib/books/catalog-taxonomy";
import type { Book, BookContentType, BookLiteraryForm } from "@/types/semanticGraph";

/** Manifest content types the site understands for public filters and labels. */
export const KNOWN_CONTENT_TYPES = [
  "fiction",
  "nonfiction",
  "handbook",
  "essay_collection",
  "poetry",
] as const satisfies readonly BookContentType[];

const KNOWN_SET = new Set<string>(KNOWN_CONTENT_TYPES);

const KNOWN_LITERARY_FORMS = new Set<string>([
  "monograph",
  "novel",
  "handbook",
  "poetry_collection",
]);

export type NormalizedContentType = ContentType;

export type PublicContentTypeInfo = {
  /** Stable site enum; `unknown` when missing or unsupported. */
  contentType: NormalizedContentType;
  literaryForm?: BookLiteraryForm;
  /** Accessible public label (never empty). */
  label: string;
  /** URL/filter value when the type is filterable; undefined for unknown. */
  filterValue?: Exclude<NormalizedContentType, "unknown">;
  isKnown: boolean;
  /** Raw manifest string when present and not in the known vocabulary. */
  rawValue?: string;
};

export type ContentTypeNormalizationDiagnostic = {
  bookId: string;
  bookSlug: string;
  category: "missing" | "unsupported";
  rawValue?: string;
};

let loggedUnknownKeys = new Set<string>();

/** Reset one-shot unknown-type logging (tests only). */
export function resetContentTypeDiagnosticLog(): void {
  loggedUnknownKeys = new Set();
}

function parseLiteraryForm(raw: unknown): BookLiteraryForm | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!KNOWN_LITERARY_FORMS.has(trimmed)) return undefined;
  return trimmed as BookLiteraryForm;
}

/**
 * Central site adapter for public content types.
 * Reads authoritative manifest fields only — no title/shelf/route inference.
 */
export function normalizePublicContentType(input: {
  contentType?: string | null;
  literaryForm?: string | null;
  bookId?: string;
  bookSlug?: string;
}): PublicContentTypeInfo {
  const literaryForm = parseLiteraryForm(input.literaryForm);
  const raw = typeof input.contentType === "string" ? input.contentType.trim() : "";

  if (!raw) {
    return {
      contentType: "unknown",
      literaryForm,
      label: CONTENT_TYPE_LABELS.unknown,
      isKnown: false,
    };
  }

  if (KNOWN_SET.has(raw)) {
    const contentType = raw as Exclude<NormalizedContentType, "unknown">;
    return {
      contentType,
      literaryForm,
      label: CONTENT_TYPE_LABELS[contentType],
      filterValue: contentType,
      isKnown: true,
    };
  }

  return {
    contentType: "unknown",
    literaryForm,
    label: CONTENT_TYPE_LABELS.unknown,
    isKnown: false,
    rawValue: raw,
  };
}

/** Normalize a book row and optionally emit a one-shot console diagnostic. */
export function contentTypeFromBook(
  book: Pick<Book, "id" | "slug" | "contentType" | "literaryForm">,
  options?: { collectDiagnostics?: ContentTypeNormalizationDiagnostic[] },
): NormalizedContentType {
  const info = normalizePublicContentType({
    contentType: book.contentType,
    literaryForm: book.literaryForm,
    bookId: book.id,
    bookSlug: book.slug,
  });

  if (!info.isKnown) {
    const category = book.contentType ? "unsupported" : "missing";
    const diagnostic: ContentTypeNormalizationDiagnostic = {
      bookId: book.id,
      bookSlug: book.slug,
      category,
      rawValue: info.rawValue,
    };
    options?.collectDiagnostics?.push(diagnostic);

    const key = `${category}:${info.rawValue ?? ""}`;
    if (!loggedUnknownKeys.has(key)) {
      loggedUnknownKeys.add(key);
      console.error("[semantic-graph] Unsupported or missing public content type", {
        category,
        rawValue: info.rawValue,
        exampleBookId: book.id,
        exampleBookSlug: book.slug,
      });
    }
  }

  return info.contentType;
}

export function contentTypeInfoFromBook(
  book: Pick<Book, "id" | "slug" | "contentType" | "literaryForm">,
): PublicContentTypeInfo {
  return normalizePublicContentType({
    contentType: book.contentType,
    literaryForm: book.literaryForm,
    bookId: book.id,
    bookSlug: book.slug,
  });
}

/** Filterable public types only (excludes unknown). */
export function isFilterableContentType(
  type: NormalizedContentType,
): type is Exclude<NormalizedContentType, "unknown"> {
  return type !== "unknown" && KNOWN_SET.has(type);
}
