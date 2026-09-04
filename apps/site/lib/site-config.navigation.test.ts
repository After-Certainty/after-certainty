import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site-config";

describe("siteConfig.navigation listen entry", () => {
  it("includes Listen after Podcast", () => {
    const hrefs = siteConfig.navigation.map((item) => item.href);
    expect(hrefs).toContain("/listen");
    const podcastIdx = hrefs.indexOf("/podcast");
    const listenIdx = hrefs.indexOf("/listen");
    expect(listenIdx).toBe(podcastIdx + 1);
    expect(siteConfig.navigation[listenIdx]?.label).toBe("Listen");
  });
});
