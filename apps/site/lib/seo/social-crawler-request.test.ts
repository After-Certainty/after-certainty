import { describe, expect, it } from "vitest";

import {
  isSocialPreviewCrawler,
  shouldStripRangeForSocialCrawler,
} from "./social-crawler-request";

describe("social-crawler-request", () => {
  it("detects facebookexternalhit", () => {
    expect(
      isSocialPreviewCrawler(
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      ),
    ).toBe(true);
  });

  it("ignores normal browsers", () => {
    expect(
      isSocialPreviewCrawler(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      ),
    ).toBe(false);
  });

  it("strips range only for social crawlers that send Range", () => {
    expect(
      shouldStripRangeForSocialCrawler("facebookexternalhit/1.1", true),
    ).toBe(true);
    expect(
      shouldStripRangeForSocialCrawler(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        true,
      ),
    ).toBe(false);
    expect(shouldStripRangeForSocialCrawler("facebookexternalhit/1.1", false)).toBe(
      false,
    );
  });
});
