import { describe, expect, it } from "vitest";

import { LISTEN_PLAYLIST_SLUG, orderListenSongs } from "@/lib/songs/listen-order";
import type { ManifestPlaylist, ManifestSong, SongRecording } from "@/types/semanticGraph";

function recording(
  externalId: string,
  primary = true,
  versionTitle?: string,
): SongRecording {
  return {
    platform: "suno",
    externalId,
    primary,
    recordingTitle: "Rec",
    ...(versionTitle ? { versionTitle } : {}),
  };
}

function song(
  slug: string,
  title: string,
  recordings: SongRecording[],
): ManifestSong {
  return {
    id: `song-${slug}`,
    slug,
    title,
    shortDescription: `${title} short`,
    longDescription: `${title} long`,
    creatorNames: [],
    lyricsPath: `corpus/songs/${slug}.md`,
    lyricLanguages: ["en"],
    relatedConcepts: [],
    relatedPatterns: [],
    relatedBooks: [],
    recordings,
  };
}

function playlist(tracks: ManifestPlaylist["tracks"], slug = LISTEN_PLAYLIST_SLUG): ManifestPlaylist {
  return {
    id: `playlist-${slug}`,
    slug,
    title: "After Certainty",
    platform: "suno",
    externalId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    tracks,
  };
}

describe("orderListenSongs", () => {
  const zebra = song("zebra", "Zebra", [
    recording("11111111-1111-1111-1111-111111111111"),
  ]);
  const alpha = song("alpha", "Alpha", [
    recording("22222222-2222-2222-2222-222222222222"),
  ]);
  const mid = song("mid", "Mid", [
    recording("33333333-3333-3333-3333-333333333333", true, "Short Edit"),
  ]);
  const empty = song("empty", "Empty", []);

  it("orders by after-certainty playlist position", () => {
    const ordered = orderListenSongs({
      songs: [zebra, alpha, mid],
      playlists: [
        playlist([
          { position: 2, songSlug: "zebra", recordingExternalId: zebra.recordings[0]!.externalId },
          { position: 1, songSlug: "mid", recordingExternalId: mid.recordings[0]!.externalId },
        ]),
      ],
    });
    expect(ordered.map((e) => e.song.slug)).toEqual(["mid", "zebra", "alpha"]);
  });

  it("uses primary recording externalId even when playlist cites another id", () => {
    const multi = song("multi", "Multi", [
      recording("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", false),
      recording("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", true),
    ]);
    const ordered = orderListenSongs({
      songs: [multi],
      playlists: [
        playlist([
          {
            position: 1,
            songSlug: "multi",
            recordingExternalId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          },
        ]),
      ],
    });
    expect(ordered).toHaveLength(1);
    expect(ordered[0]!.recordingExternalId).toBe("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
  });

  it("omits songs with no recordings without throwing", () => {
    const ordered = orderListenSongs({
      songs: [empty, alpha],
      playlists: [
        playlist([
          { position: 1, songSlug: "empty", recordingExternalId: "x" },
          { position: 2, songSlug: "alpha", recordingExternalId: alpha.recordings[0]!.externalId },
        ]),
      ],
    });
    expect(ordered.map((e) => e.song.slug)).toEqual(["alpha"]);
  });

  it("falls back to alphabetical when no playlist exists", () => {
    const ordered = orderListenSongs({ songs: [zebra, alpha], playlists: [] });
    expect(ordered.map((e) => e.song.slug)).toEqual(["alpha", "zebra"]);
  });

  it("appends leftover songs alphabetically after playlist tracks", () => {
    const ordered = orderListenSongs({
      songs: [zebra, alpha, mid],
      playlists: [
        playlist([
          { position: 1, songSlug: "mid", recordingExternalId: mid.recordings[0]!.externalId },
        ]),
      ],
    });
    expect(ordered.map((e) => e.song.slug)).toEqual(["mid", "alpha", "zebra"]);
  });

  it("preserves versionTitle from the primary recording", () => {
    const ordered = orderListenSongs({
      songs: [mid],
      playlists: undefined,
    });
    expect(ordered[0]!.versionTitle).toBe("Short Edit");
  });
});
