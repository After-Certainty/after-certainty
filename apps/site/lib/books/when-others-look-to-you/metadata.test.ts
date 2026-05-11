import { describe, expect, it } from "vitest";

import { assets, getPatternBySlug } from "@/lib/books/when-others-look-to-you/content";
import {
  buildHomeMetadata,
  buildPageMetadata,
  buildPatternJsonLd,
  buildPatternMetadata,
  SITE_TITLE,
  STRUCTURED_DATA_AUTHOR,
} from "@/lib/books/when-others-look-to-you/metadata";

describe("buildPageMetadata", () => {
  it("normalizes path to leading slash for canonical and openGraph.url", () => {
    const m = buildPageMetadata({
      title: "About",
      description: "About page",
      path: "about",
    });
    expect(m.alternates?.canonical).toBe("/about");
    expect(m.openGraph?.url).toBe("/about");
  });

  it("sets title, description, and OG/Twitter from base fields", () => {
    const m = buildPageMetadata({
      title: "T",
      description: "D",
      path: "/x",
    });
    expect(m.title).toBe("T");
    expect(m.description).toBe("D");
    expect(m.openGraph?.title).toBe("T");
    expect(m.openGraph?.description).toBe("D");
    expect(m.twitter?.title).toBe("T");
    expect(m.twitter?.description).toBe("D");
  });

  it("uses openGraphTitle and openGraphDescription overrides for OG/Twitter only", () => {
    const m = buildPageMetadata({
      title: "Doc title",
      description: "Doc desc",
      path: "/p",
      openGraphTitle: "OG title",
      openGraphDescription: "OG desc",
    });
    expect(m.title).toBe("Doc title");
    expect(m.description).toBe("Doc desc");
    expect(m.openGraph?.title).toBe("OG title");
    expect(m.openGraph?.description).toBe("OG desc");
    expect(m.twitter?.title).toBe("OG title");
    expect(m.twitter?.description).toBe("OG desc");
    expect(m.openGraph?.images?.[0]?.alt).toBe("OG title");
  });

  it("uses custom image path when provided", () => {
    const m = buildPageMetadata({
      title: "T",
      description: "D",
      path: "/",
      image: "/custom.png",
    });
    expect(m.openGraph?.images?.[0]?.url).toBe("/custom.png");
    expect(m.twitter?.images).toEqual(["/custom.png"]);
  });

  it("defaults OG image to hero background when image omitted", () => {
    const m = buildPageMetadata({
      title: "T",
      description: "D",
      path: "/",
    });
    expect(m.openGraph?.images?.[0]?.url).toBe(assets.heroBackground);
  });
});

describe("buildPatternMetadata", () => {
  const base = getPatternBySlug("attention-finds-a-focus")!;

  it("uses seo.description when present", () => {
    const m = buildPatternMetadata({
      ...base,
      seo: {
        ...base.seo,
        description: "Custom SEO description",
      },
    });
    expect(m.description).toBe("Custom SEO description");
  });

  it("falls back to summary when seo.description is absent", () => {
    const m = buildPatternMetadata({
      ...base,
      seo: { title: base.seo.title },
      summary: "Summary fallback",
    });
    expect(m.description).toBe("Summary fallback");
  });

  it("falls back to card description when seo.description and summary are absent", () => {
    const m = buildPatternMetadata({
      ...base,
      seo: { title: base.seo.title },
    });
    expect(m.description).toBe(base.description);
  });
});

describe("buildPatternJsonLd", () => {
  const pattern = getPatternBySlug("attention-finds-a-focus")!;
  const siteUrl = "https://example.com";

  it("returns CreativeWork shape with expected fields", () => {
    const json = buildPatternJsonLd(pattern, siteUrl);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("CreativeWork");
    expect(json.name).toBe(pattern.title);
    expect(json.description).toBeTruthy();
    expect(json.author).toEqual(STRUCTURED_DATA_AUTHOR);
    expect(typeof json.keywords).toBe("string");
    expect(json.keywords).toContain("leadership pattern");
    expect(json.url).toBe(`${siteUrl}${pattern.href}`);
    expect(json.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `${siteUrl}${pattern.href}`,
    });
  });

  it("strips trailing slash from siteUrl", () => {
    const json = buildPatternJsonLd(pattern, "https://example.com/");
    expect(json.url).toBe(`https://example.com${pattern.href}`);
  });
});

describe("buildHomeMetadata", () => {
  it("uses absolute title so layout template is not applied twice", () => {
    const m = buildHomeMetadata();
    expect(m.title).toEqual({ absolute: SITE_TITLE });
  });

  it("includes description and openGraph from base builder", () => {
    const m = buildHomeMetadata();
    expect(m.description).toContain("leader");
    expect(m.openGraph?.title).toBe(SITE_TITLE);
  });
});
