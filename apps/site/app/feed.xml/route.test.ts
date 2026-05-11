import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /feed.xml", () => {
  let prevRssUrl: string | undefined;

  beforeEach(() => {
    prevRssUrl = process.env.PODCAST_RSS_URL;
    process.env.PODCAST_RSS_URL = "https://feeds.integration-test.example/podcast.xml";
  });

  afterEach(() => {
    process.env.PODCAST_RSS_URL = prevRssUrl;
  });

  it("returns 307 redirect to the resolved podcast RSS URL", () => {
    const res = GET();

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://feeds.integration-test.example/podcast.xml");
  });
});
