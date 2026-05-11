import { cache } from "react";
import fallbackCatalog from "@/data/books-manifest.json";
import {
  isGeneratedBooksManifest,
  normalizeGeneratedBooksManifest,
} from "@/lib/books/generated-manifest";
import type { BooksCatalogManifest } from "@/types/content";
import { isBooksManifestOffline, resolveBooksManifestUrl } from "@/lib/site-config";

export const BOOKS_MANIFEST_REVALIDATE_SECONDS = (() => {
  const raw = process.env.BOOKS_MANIFEST_REVALIDATE_SECONDS?.trim();
  if (!raw) return 3600;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 3600;
})();

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isLegacyBooksCatalogManifest(data: unknown): data is BooksCatalogManifest {
  if (!isRecord(data)) return false;
  if (typeof data.featuredSlug !== "string") return false;
  if (!Array.isArray(data.books)) return false;
  return true;
}

function loadFallbackCatalog(): BooksCatalogManifest {
  return fallbackCatalog as BooksCatalogManifest;
}

/** Parse fetched JSON into a catalog manifest (exported for unit tests). */
export function parseBooksCatalogManifestJson(data: unknown): BooksCatalogManifest {
  if (isGeneratedBooksManifest(data)) {
    return normalizeGeneratedBooksManifest(data);
  }
  if (isLegacyBooksCatalogManifest(data)) {
    return data;
  }
  throw new Error("books manifest: unrecognized JSON shape");
}

/**
 * Fetch release manifest (ISR) or return bundled legacy JSON when offline / on failure.
 */
/** Uncached fetch (exported for tests; production uses `getBooksCatalogCached`). */
export async function fetchBooksCatalogUncached(): Promise<BooksCatalogManifest> {
  if (isBooksManifestOffline()) {
    return loadFallbackCatalog();
  }

  const url = resolveBooksManifestUrl();

  try {
    const res = await fetch(url, {
      next: { revalidate: BOOKS_MANIFEST_REVALIDATE_SECONDS },
      headers: { Accept: "application/json, */*" },
    });

    if (!res.ok) {
      throw new Error(`books manifest HTTP ${res.status}`);
    }

    const data: unknown = await res.json();
    return parseBooksCatalogManifestJson(data);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[books/manifest] Catalog fetch failed, using fallback:", err);
    }
    return loadFallbackCatalog();
  }
}

const cachedBooksCatalog = cache(fetchBooksCatalogUncached);

export async function getBooksCatalogCached(): Promise<BooksCatalogManifest> {
  return cachedBooksCatalog();
}
