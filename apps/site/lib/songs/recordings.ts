import { isSunoRecordingId } from "@/lib/security/urls";
import type { ManifestSong, SongRecording } from "@/types/semanticGraph";

/** Prefer the recording marked `primary`, else the first recording (defensive). */
export function primaryRecording(song: ManifestSong): SongRecording | undefined {
  return song.recordings.find((r) => r.primary) ?? song.recordings[0];
}

/** Public Suno song page for a recording clip UUID. */
export function sunoSongUrl(externalId: string): string | null {
  const id = externalId.trim();
  if (!isSunoRecordingId(id)) return null;
  return `https://suno.com/song/${id}`;
}

/**
 * Official Suno embed player URL for a recording clip UUID.
 * Constructed locally — do not call Suno oEmbed/API at runtime.
 */
export function sunoEmbedUrl(externalId: string): string | null {
  const id = externalId.trim();
  if (!isSunoRecordingId(id)) return null;
  return `https://suno.com/embed/${id}`;
}
