import { describe, expect, it } from "vitest";

import { isSunoRecordingId } from "@/lib/security/urls";
import {
  primaryRecording,
  sunoEmbedUrl,
  sunoSongUrl,
} from "@/lib/songs/recordings";
import type { ManifestSong, SongRecording } from "@/types/semanticGraph";

function recording(partial: Partial<SongRecording> & Pick<SongRecording, "externalId" | "primary">): SongRecording {
  return {
    platform: "suno",
    recordingTitle: partial.recordingTitle ?? "Rec",
    ...partial,
  };
}

function song(recordings: SongRecording[]): ManifestSong {
  return {
    id: "song-test",
    slug: "test",
    title: "Test Song",
    shortDescription: "short",
    longDescription: "long",
    creatorNames: [],
    lyricsPath: "corpus/songs/test.md",
    lyricLanguages: ["en"],
    relatedConcepts: [],
    relatedPatterns: [],
    relatedBooks: [],
    recordings,
  };
}

describe("isSunoRecordingId", () => {
  it("accepts canonical UUIDs", () => {
    expect(isSunoRecordingId("84c5ec6d-da90-4213-a114-27a4bd1fa556")).toBe(true);
  });

  it("rejects path-like or empty values", () => {
    expect(isSunoRecordingId("")).toBe(false);
    expect(isSunoRecordingId("../x")).toBe(false);
    expect(isSunoRecordingId("not-a-uuid")).toBe(false);
  });
});

describe("primaryRecording", () => {
  it("returns the recording marked primary", () => {
    const primary = recording({
      externalId: "11111111-1111-1111-1111-111111111111",
      primary: true,
      recordingTitle: "Primary",
    });
    const other = recording({
      externalId: "22222222-2222-2222-2222-222222222222",
      primary: false,
      recordingTitle: "Other",
    });
    expect(primaryRecording(song([other, primary]))).toEqual(primary);
  });

  it("falls back to the first recording when none is primary", () => {
    const first = recording({
      externalId: "11111111-1111-1111-1111-111111111111",
      primary: false,
    });
    const second = recording({
      externalId: "22222222-2222-2222-2222-222222222222",
      primary: false,
    });
    expect(primaryRecording(song([first, second]))).toEqual(first);
  });

  it("returns undefined when recordings are empty", () => {
    expect(primaryRecording(song([]))).toBeUndefined();
  });
});

describe("sunoSongUrl / sunoEmbedUrl", () => {
  const id = "84c5ec6d-da90-4213-a114-27a4bd1fa556";

  it("builds song and embed URLs from a valid id", () => {
    expect(sunoSongUrl(id)).toBe(`https://suno.com/song/${id}`);
    expect(sunoEmbedUrl(id)).toBe(`https://suno.com/embed/${id}`);
  });

  it("returns null for invalid ids", () => {
    expect(sunoSongUrl("bad")).toBeNull();
    expect(sunoEmbedUrl("bad")).toBeNull();
  });
});
