import { describe, expect, it } from "vitest";
import {
  bookHasMedia,
  booksWithPatternsPlaylist,
  patternHasMedia,
  youtubeEmbedUrl,
} from "@/lib/explore/entity-media";
import type { Book, Pattern } from "@/types/semanticGraph";

describe("entity-media", () => {
  it("detects pattern media fields", () => {
    const bare: Pattern = {
      id: "pattern-x",
      slug: "x",
      title: "X",
      summary: "s",
    };
    expect(patternHasMedia(bare)).toBe(false);

    const withVideo: Pattern = { ...bare, youtubeVideoId: "abc123" };
    expect(patternHasMedia(withVideo)).toBe(true);
  });

  it("lists books with pattern playlists", () => {
    const books: Book[] = [
      { id: "book-a", slug: "a", title: "A" },
      {
        id: "book-b",
        slug: "when-others-look-to-you-v1",
        title: "WoLTY",
        media: {
          patterns: {
            youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLtest",
          },
        },
      },
    ];
    expect(booksWithPatternsPlaylist(books)).toHaveLength(1);
    expect(bookHasMedia(books[1]!)).toBe(true);
  });

  it("builds youtube embed URLs", () => {
    expect(youtubeEmbedUrl("ma1UbSajuVI")).toBe(
      "https://www.youtube.com/embed/ma1UbSajuVI",
    );
  });
});
