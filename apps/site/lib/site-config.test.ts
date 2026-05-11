import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_PODCAST_RSS_URL,
  resolveDeploymentUrl,
  resolvePodcastPlatformLinks,
  resolvePodcastRssUrl,
} from "@/lib/site-config";

describe("resolveDeploymentUrl", () => {
  let prevSite: string | undefined;
  let prevVercel: string | undefined;

  beforeEach(() => {
    prevSite = process.env.NEXT_PUBLIC_SITE_URL;
    prevVercel = process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSite;
    process.env.VERCEL_URL = prevVercel;
  });

  it("uses explicit NEXT_PUBLIC_SITE_URL and strips trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    expect(resolveDeploymentUrl()).toBe("https://example.com");
  });

  it("falls back to https://VERCEL_URL when site URL is unset", () => {
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(resolveDeploymentUrl()).toBe("https://my-app.vercel.app");
  });

  it("defaults to localhost when no env is set", () => {
    expect(resolveDeploymentUrl()).toBe("http://localhost:3000");
  });
});

describe("resolvePodcastRssUrl", () => {
  let prevRss: string | undefined;

  beforeEach(() => {
    prevRss = process.env.PODCAST_RSS_URL;
  });

  afterEach(() => {
    process.env.PODCAST_RSS_URL = prevRss;
  });

  it("returns PODCAST_RSS_URL when set", () => {
    process.env.PODCAST_RSS_URL = "https://feeds.example.com/podcast.xml";
    expect(resolvePodcastRssUrl()).toBe("https://feeds.example.com/podcast.xml");
  });

  it("returns default Anchor feed when env is empty", () => {
    delete process.env.PODCAST_RSS_URL;
    expect(resolvePodcastRssUrl()).toBe(DEFAULT_PODCAST_RSS_URL);
  });
});

describe("resolvePodcastPlatformLinks", () => {
  let prev: Record<string, string | undefined>;

  beforeEach(() => {
    prev = {
      NEXT_PUBLIC_PODCAST_SPOTIFY_URL: process.env.NEXT_PUBLIC_PODCAST_SPOTIFY_URL,
      NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL: process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL,
      PODCAST_RSS_URL: process.env.PODCAST_RSS_URL,
    };
    delete process.env.NEXT_PUBLIC_PODCAST_SPOTIFY_URL;
    delete process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL;
    delete process.env.PODCAST_RSS_URL;
  });

  afterEach(() => {
    Object.assign(process.env, prev);
  });

  it("fills rss from resolvePodcastRssUrl and githubDiscussions with default repo path", () => {
    const links = resolvePodcastPlatformLinks();
    expect(links.rss).toBe(DEFAULT_PODCAST_RSS_URL);
    expect(links.githubDiscussions).toBe("https://github.com/ksteffe/after-certainty/discussions");
    expect(links.spotify).toContain("podcasters.spotify.com");
  });
});
