import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import type { GraphIndex } from "@/lib/graph/graph";
import { explorePaths } from "@/lib/graph/explorePaths";
import {
  resolvePodcastPlatformLinks,
  resolvePodcastRssUrl,
  resolveSiteSocialLinks,
  siteConfig,
} from "@/lib/site-config";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type {
  Book as SemanticBook,
  GlossaryConcept,
  Pattern,
  Source,
} from "@/types/semanticGraph";

export const SCHEMA_ORG_CONTEXT = "https://schema.org";

export type JsonLdBreadcrumbItem = {
  label: string;
  href?: string;
};

export type JsonLdNode = Record<string, unknown>;

export type JsonLdDocument = {
  "@context": typeof SCHEMA_ORG_CONTEXT;
  "@graph": JsonLdNode[];
};

/** Build an absolute URL from a site path (or pass through absolute URLs). */
export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

function compact<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value === undefined || value === null) delete out[key];
    if (Array.isArray(value) && value.length === 0) delete out[key];
  }
  return out;
}

export function jsonLdGraph(nodes: JsonLdNode[]): JsonLdDocument {
  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@graph": nodes,
  };
}

export function buildBreadcrumbListJsonLd(items: JsonLdBreadcrumbItem[]): JsonLdNode {
  const listItems = items.map((item, index) =>
    compact({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? absoluteUrl(item.href) : undefined,
    }),
  );

  return {
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

function organizationPublisher(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

function personNodes(names: string[]): JsonLdNode[] {
  return names.map((name) => ({
    "@type": "Person",
    name,
  }));
}

function retailerLabel(retailer: string): string {
  const labels: Record<string, string> = {
    amazon: "Amazon",
    apple_books: "Apple Books",
    google_play: "Google Play",
    barnes_noble: "Barnes & Noble",
    bookshop: "Bookshop.org",
    other: "Retailer",
  };
  return labels[retailer] ?? retailer;
}

function formatEncodings(book: SemanticBook): JsonLdNode[] {
  const encodings: JsonLdNode[] = [];
  const formats: { block: SemanticBook["epub"]; mime: string }[] = [
    { block: book.epub, mime: "application/epub+zip" },
    { block: book.pdf, mime: "application/pdf" },
    {
      block: book.docx,
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ];

  for (const { block, mime } of formats) {
    if (block?.enabled && block.url) {
      encodings.push({
        "@type": "MediaObject",
        encodingFormat: mime,
        contentUrl: block.url,
      });
    }
  }

  return encodings;
}

export function resolveCatalogBookForSemanticBook(
  book: SemanticBook,
  catalogBooks: CatalogBook[],
): CatalogBook | undefined {
  const canonical = resolveBookCanonicalSlug(book.slug, catalogBooks) ?? book.slug;
  return catalogBooks.find((b) => b.slug === canonical);
}

export function buildBookJsonLd(params: {
  book: SemanticBook;
  catalogBook?: CatalogBook;
  pageUrl: string;
}): JsonLdNode {
  const { book, catalogBook, pageUrl } = params;
  const image = book.openGraphImage ?? book.coverImage;
  const authors = catalogBook?.authors ?? [];
  const encodings = formatEncodings(book);

  const offers =
    book.purchaseLinks?.map((link) => ({
      "@type": "Offer",
      url: link.url,
      seller: {
        "@type": "Organization",
        name: link.label ?? retailerLabel(link.retailer),
      },
    })) ?? [];

  return compact({
    "@type": "Book",
    "@id": `${pageUrl}#book`,
    name: book.title,
    alternateName: book.subtitle,
    description: book.summary ?? book.subtitle,
    url: pageUrl,
    image: image ? absoluteUrl(image) : undefined,
    isbn: book.isbns?.length === 1 ? book.isbns[0] : book.isbns,
    author: authors.length > 0 ? personNodes(authors) : undefined,
    datePublished: catalogBook?.year ? String(catalogBook.year) : undefined,
    publisher: organizationPublisher(),
    license: siteConfig.license.url,
    offers: offers.length > 0 ? offers : undefined,
    encoding: encodings.length > 0 ? encodings : undefined,
  });
}

const GLOSSARY_TERM_SET_ID = absoluteUrl(`${explorePaths.concepts}#glossary`);

function glossaryTermSet(): JsonLdNode {
  return {
    "@type": "DefinedTermSet",
    "@id": GLOSSARY_TERM_SET_ID,
    name: "After Certainty Glossary",
    url: absoluteUrl(explorePaths.concepts),
    publisher: organizationPublisher(),
  };
}

export function buildDefinedTermJsonLd(params: {
  concept: GlossaryConcept;
  pageUrl: string;
  relatedUrls?: string[];
}): JsonLdNode {
  const { concept, pageUrl, relatedUrls = [] } = params;

  return compact({
    "@type": "DefinedTerm",
    "@id": `${pageUrl}#term`,
    name: concept.title,
    description: concept.definition ?? concept.shortDefinition,
    url: pageUrl,
    termCode: concept.id,
    inDefinedTermSet: { "@id": GLOSSARY_TERM_SET_ID },
    isRelatedTo: relatedUrls.length > 0 ? relatedUrls : undefined,
  });
}

export function buildPatternJsonLd(params: {
  pattern: Pattern;
  pageUrl: string;
  relatedConceptUrls?: string[];
}): JsonLdNode {
  const { pattern, pageUrl, relatedConceptUrls = [] } = params;

  const video = pattern.youtubeVideoId
    ? compact({
        "@type": "VideoObject",
        name: pattern.title,
        description: pattern.summary,
        embedUrl: `https://www.youtube.com/embed/${pattern.youtubeVideoId}`,
        url: `https://www.youtube.com/watch?v=${pattern.youtubeVideoId}`,
      })
    : undefined;

  const image = pattern.infographic
    ? compact({
        "@type": "ImageObject",
        url: pattern.infographic.url,
        width: pattern.infographic.width,
        height: pattern.infographic.height,
        caption: pattern.infographic.alt,
      })
    : undefined;

  return compact({
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: pattern.title,
    description: pattern.summary,
    url: pageUrl,
    image,
    video,
    mainEntityOfPage: pageUrl,
    publisher: organizationPublisher(),
    about: relatedConceptUrls.length > 0 ? relatedConceptUrls : undefined,
    sameAs: pattern.mediumArticleUrl,
  });
}

export function buildSourceJsonLd(params: { source: Source; pageUrl: string }): JsonLdNode {
  const { source, pageUrl } = params;
  const schemaType = source.type === "article" ? "Article" : "Book";

  return compact({
    "@type": schemaType,
    "@id": `${pageUrl}#source`,
    name: source.name,
    description: source.summary,
    url: pageUrl,
    publisher: organizationPublisher(),
  });
}

export function buildWebsiteJsonLd(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function buildOrganizationJsonLd(): JsonLdNode {
  const social = resolveSiteSocialLinksForJsonLd();

  return compact({
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    sameAs: social.length > 0 ? social : undefined,
  });
}

function resolveSiteSocialLinksForJsonLd(): string[] {
  const links = resolveSiteSocialLinks();
  return [links.github, links.medium, links.linkedIn, links.youtube].filter(Boolean);
}

export function buildAboutPageJsonLd(): JsonLdDocument {
  return jsonLdGraph([
    buildOrganizationJsonLd(),
    {
      "@type": "AboutPage",
      "@id": absoluteUrl("/about#webpage"),
      name: `About · ${siteConfig.name}`,
      description: siteConfig.description,
      url: absoluteUrl("/about"),
      isPartOf: { "@id": absoluteUrl("/#website") },
      about: { "@id": absoluteUrl("/#organization") },
    },
  ]);
}

export function buildPodcastSeriesJsonLd(params: {
  episodes: PodcastEpisode[];
  pageUrl: string;
}): JsonLdDocument {
  const { episodes, pageUrl } = params;
  const platforms = resolvePodcastPlatformLinks();
  const rssUrl = resolvePodcastRssUrl();

  const sameAs = [platforms.spotify, platforms.apple, platforms.youtube, rssUrl].filter(Boolean);

  const episodeNodes: JsonLdNode[] = episodes.slice(0, 10).map((episode) =>
    compact({
      "@type": "PodcastEpisode",
      name: episode.title,
      description: episode.description,
      datePublished: episode.publishedAt || undefined,
      url: episode.episodeUrl || undefined,
      associatedMedia: episode.audioUrl
        ? {
            "@type": "MediaObject",
            contentUrl: episode.audioUrl,
            encodingFormat: "audio/mpeg",
          }
        : undefined,
      image: episode.image,
      partOfSeries: { "@id": `${pageUrl}#podcast` },
    }),
  );

  return jsonLdGraph([
    compact({
      "@type": "PodcastSeries",
      "@id": `${pageUrl}#podcast`,
      name: `${siteConfig.name} Podcast`,
      description:
        "Reflective conversations on meaning, trust, leadership, and systems — audio inquiries beyond rehearsed certainty.",
      url: pageUrl,
      webFeed: rssUrl,
      publisher: organizationPublisher(),
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    }),
    ...episodeNodes,
  ]);
}

export function buildBookPageJsonLd(params: {
  book: SemanticBook;
  catalogBook?: CatalogBook;
  breadcrumbs: JsonLdBreadcrumbItem[];
}): JsonLdDocument {
  const pageUrl = absoluteUrl(`${explorePaths.books}/${params.book.slug}`);
  return jsonLdGraph([
    buildBookJsonLd({ ...params, pageUrl }),
    buildBreadcrumbListJsonLd(params.breadcrumbs),
  ]);
}

export function buildConceptPageJsonLd(params: {
  concept: GlossaryConcept;
  breadcrumbs: JsonLdBreadcrumbItem[];
  relatedUrls?: string[];
}): JsonLdDocument {
  const pageUrl = absoluteUrl(`${explorePaths.concepts}/${params.concept.slug}`);
  return jsonLdGraph([
    glossaryTermSet(),
    buildDefinedTermJsonLd({ concept: params.concept, pageUrl, relatedUrls: params.relatedUrls }),
    buildBreadcrumbListJsonLd(params.breadcrumbs),
  ]);
}

export function buildPatternPageJsonLd(params: {
  pattern: Pattern;
  breadcrumbs: JsonLdBreadcrumbItem[];
  relatedConceptUrls?: string[];
}): JsonLdDocument {
  const pageUrl = absoluteUrl(`${explorePaths.patterns}/${params.pattern.slug}`);
  return jsonLdGraph([
    buildPatternJsonLd({ ...params, pageUrl }),
    buildBreadcrumbListJsonLd(params.breadcrumbs),
  ]);
}

export function buildSourcePageJsonLd(params: {
  source: Source;
  breadcrumbs: JsonLdBreadcrumbItem[];
}): JsonLdDocument {
  const pageUrl = absoluteUrl(`${explorePaths.sources}/${params.source.slug}`);
  return jsonLdGraph([
    buildSourceJsonLd({ source: params.source, pageUrl }),
    buildBreadcrumbListJsonLd(params.breadcrumbs),
  ]);
}

export function buildHomePageJsonLd(): JsonLdDocument {
  return jsonLdGraph([buildWebsiteJsonLd(), buildOrganizationJsonLd()]);
}

/** Resolve related entity canonical ids to absolute explore URLs for JSON-LD cross-links. */
export function relatedBookUrls(index: GraphIndex, ids: string[] | undefined): string[] {
  return (ids ?? [])
    .map((id) => index.getNodeByCanonicalId(id)?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => absoluteUrl(`${explorePaths.books}/${slug}`));
}

export function relatedPatternUrls(index: GraphIndex, ids: string[] | undefined): string[] {
  return (ids ?? [])
    .map((id) => index.getNodeByCanonicalId(id)?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => absoluteUrl(`${explorePaths.patterns}/${slug}`));
}

export function relatedConceptUrls(index: GraphIndex, ids: string[] | undefined): string[] {
  return (ids ?? [])
    .map((id) => index.getNodeByCanonicalId(id)?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => absoluteUrl(`${explorePaths.concepts}/${slug}`));
}
