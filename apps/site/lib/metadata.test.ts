import { describe, expect, it } from "vitest";

import { createPageMetadata, defaultMetadata, resolveOpenGraphUrl } from "@/lib/metadata";
import { OG_SHARE_TITLE } from "@/lib/site-config";

describe("createPageMetadata", () => {
  it("sets title and description and forwards them to openGraph and twitter", () => {
    const m = createPageMetadata({
      title: "About",
      description: "Orientation into the project.",
    });
    expect(m.title).toBe("About");
    expect(m.description).toBe("Orientation into the project.");
    expect(m.openGraph?.title).toBe("About");
    expect(m.openGraph?.description).toBe("Orientation into the project.");
    expect(m.twitter?.title).toBe("About");
    expect(m.twitter?.description).toBe("Orientation into the project.");
  });

  it("replaces default openGraph and twitter images when overrides are provided", () => {
    const bookOgUrl = "https://example.com/books/after-certainty/open-graph.png";
    const m = createPageMetadata({
      title: "After Certainty",
      description: "A book.",
      openGraph: {
        images: [{ url: bookOgUrl, alt: "After Certainty" }],
      },
      twitter: {
        images: [bookOgUrl],
      },
    });
    expect(m.openGraph?.images).toEqual([{ url: bookOgUrl, alt: "After Certainty" }]);
    expect(m.twitter?.images).toEqual([bookOgUrl]);
    expect(m.openGraph?.title).toBe("After Certainty");
    expect(m.openGraph?.description).toBe("A book.");
  });

  it("merges alternates.canonical without dropping RSS types", () => {
    const m = createPageMetadata({
      title: "Concept",
      description: "A definition.",
      alternates: { canonical: "/explore/concepts/certainty" },
    });
    expect(m.alternates?.canonical).toBe("/explore/concepts/certainty");
    expect(m.alternates?.types?.["application/rss+xml"]).toBeTruthy();
  });

  it("sets openGraph.url from alternates.canonical so Facebook does not re-scrape the homepage", () => {
    const m = createPageMetadata({
      title: "Curiosity Before Certainty",
      description: "A book.",
      alternates: { canonical: "/explore/books/curiosity-before-certainty" },
    });
    expect(m.openGraph?.url).toBe("/explore/books/curiosity-before-certainty");
  });

  it("does not inherit the homepage openGraph.url when no canonical is provided", () => {
    const m = createPageMetadata({
      title: "About",
      description: "Orientation into the project.",
    });
    expect(m.openGraph?.url).toBeUndefined();
  });

  it("prefers an explicit openGraph.url over alternates.canonical", () => {
    const m = createPageMetadata({
      title: "Custom",
      description: "Custom share URL.",
      alternates: { canonical: "/explore/books/demo" },
      openGraph: { url: "https://www.after-certainty.com/custom-share" },
    });
    expect(m.openGraph?.url).toBe("https://www.after-certainty.com/custom-share");
  });
});

describe("resolveOpenGraphUrl", () => {
  it("reads string and descriptor canonical forms", () => {
    expect(resolveOpenGraphUrl({ alternates: { canonical: "/a" } })).toBe("/a");
    expect(resolveOpenGraphUrl({ alternates: { canonical: { url: "/b" } } })).toBe("/b");
  });
});

describe("defaultMetadata", () => {
  it("uses a share title in the 50–60 character range for Open Graph", () => {
    expect(OG_SHARE_TITLE.length).toBeGreaterThanOrEqual(50);
    expect(OG_SHARE_TITLE.length).toBeLessThanOrEqual(60);
    expect(defaultMetadata.openGraph?.title).toBe(OG_SHARE_TITLE);
    expect(defaultMetadata.twitter?.title).toBe(OG_SHARE_TITLE);
  });
});
