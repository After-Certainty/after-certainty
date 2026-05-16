import { describe, expect, it } from "vitest";

import { createPageMetadata, defaultMetadata } from "@/lib/metadata";
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
});

describe("defaultMetadata", () => {
  it("uses a share title in the 50–60 character range for Open Graph", () => {
    expect(OG_SHARE_TITLE.length).toBeGreaterThanOrEqual(50);
    expect(OG_SHARE_TITLE.length).toBeLessThanOrEqual(60);
    expect(defaultMetadata.openGraph?.title).toBe(OG_SHARE_TITLE);
    expect(defaultMetadata.twitter?.title).toBe(OG_SHARE_TITLE);
  });
});
