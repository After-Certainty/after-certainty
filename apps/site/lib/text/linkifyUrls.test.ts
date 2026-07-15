import { describe, expect, it } from "vitest";

import { splitTextWithUrls } from "@/lib/text/linkifyUrls";

describe("splitTextWithUrls", () => {
  it("returns a single text segment when there are no URLs", () => {
    expect(splitTextWithUrls("Plain citation without a link.")).toEqual([
      { type: "text", value: "Plain citation without a link." },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(splitTextWithUrls("")).toEqual([]);
  });

  it("linkifies a URL at the end without trailing punctuation", () => {
    expect(splitTextWithUrls("See https://example.com/path")).toEqual([
      { type: "text", value: "See " },
      { type: "url", value: "https://example.com/path", href: "https://example.com/path" },
    ]);
  });

  it("strips trailing citation period from href (Agile Manifesto style)", () => {
    const text =
      'Beck et al. "Manifesto for Agile Software Development." 2001. https://agilemanifesto.org/.';
    expect(splitTextWithUrls(text)).toEqual([
      {
        type: "text",
        value: 'Beck et al. "Manifesto for Agile Software Development." 2001. ',
      },
      {
        type: "url",
        value: "https://agilemanifesto.org/",
        href: "https://agilemanifesto.org/",
      },
      { type: "text", value: "." },
    ]);
  });

  it("strips trailing period from DOI URLs", () => {
    const text = "Amershi et al. https://doi.org/10.1145/3290605.3300233.";
    expect(splitTextWithUrls(text)).toEqual([
      { type: "text", value: "Amershi et al. " },
      {
        type: "url",
        value: "https://doi.org/10.1145/3290605.3300233",
        href: "https://doi.org/10.1145/3290605.3300233",
      },
      { type: "text", value: "." },
    ]);
  });

  it("keeps a mid-sentence URL and following text", () => {
    expect(splitTextWithUrls("Visit https://example.com for more.")).toEqual([
      { type: "text", value: "Visit " },
      { type: "url", value: "https://example.com", href: "https://example.com" },
      { type: "text", value: " for more." },
    ]);
  });

  it("splits multiple URLs", () => {
    expect(splitTextWithUrls("A https://one.example.com/ and B https://two.example.com/.")).toEqual(
      [
        { type: "text", value: "A " },
        {
          type: "url",
          value: "https://one.example.com/",
          href: "https://one.example.com/",
        },
        { type: "text", value: " and B " },
        {
          type: "url",
          value: "https://two.example.com/",
          href: "https://two.example.com/",
        },
        { type: "text", value: "." },
      ],
    );
  });

  it("accepts http as well as https", () => {
    expect(splitTextWithUrls("http://example.com")).toEqual([
      { type: "url", value: "http://example.com", href: "http://example.com" },
    ]);
  });
});
