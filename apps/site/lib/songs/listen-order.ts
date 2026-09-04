import { primaryRecording } from "@/lib/songs/recordings";
import type { ManifestPlaylist, ManifestSong, SemanticGraph } from "@/types/semanticGraph";

/** Preferred curated playlist for `/listen` library order. */
export const LISTEN_PLAYLIST_SLUG = "after-certainty";

export type ListenSongEntry = {
  song: ManifestSong;
  /** Primary (or first) recording used for embed + outbound Suno link. */
  recordingExternalId: string;
  versionTitle?: string;
};

function titleSort(a: ManifestSong, b: ManifestSong): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

function playableEntry(song: ManifestSong): ListenSongEntry | null {
  const recording = primaryRecording(song);
  if (!recording?.externalId?.trim()) return null;
  const versionTitle = recording.versionTitle?.trim();
  return {
    song,
    recordingExternalId: recording.externalId.trim(),
    ...(versionTitle ? { versionTitle } : {}),
  };
}

function resolvePlaylist(
  playlists: readonly ManifestPlaylist[] | undefined,
): ManifestPlaylist | undefined {
  if (!playlists?.length) return undefined;
  const preferred = playlists.find((p) => p.slug === LISTEN_PLAYLIST_SLUG && p.tracks.length > 0);
  if (preferred) return preferred;
  return playlists.find((p) => p.tracks.length > 0);
}

/**
 * Order songs for `/listen`.
 *
 * Rule:
 * 1. Prefer tracks from playlist slug `after-certainty` (by ascending `position`).
 * 2. If that playlist is missing, use the first playlist that has tracks.
 * 3. If no playlist applies, sort all playable songs A–Z by title.
 * 4. Songs in the graph but not on the playlist append A–Z after playlist tracks.
 * 5. Songs without a usable primary recording are omitted (never throw).
 *
 * Playlist membership is display order only — the recording played is always
 * {@link primaryRecording}, not the playlist's `recordingExternalId`.
 */
export function orderListenSongs(graph: Pick<SemanticGraph, "songs" | "playlists">): ListenSongEntry[] {
  const songs = graph.songs ?? [];
  const bySlug = new Map(songs.map((s) => [s.slug, s]));
  const playlist = resolvePlaylist(graph.playlists);

  if (!playlist) {
    return songs
      .map(playableEntry)
      .filter((e): e is ListenSongEntry => e != null)
      .sort((a, b) => titleSort(a.song, b.song));
  }

  const ordered: ListenSongEntry[] = [];
  const seen = new Set<string>();

  const tracks = [...playlist.tracks].sort((a, b) => a.position - b.position);
  for (const track of tracks) {
    const song = bySlug.get(track.songSlug);
    if (!song || seen.has(song.slug)) continue;
    const entry = playableEntry(song);
    if (!entry) continue;
    ordered.push(entry);
    seen.add(song.slug);
  }

  const leftovers = songs
    .filter((s) => !seen.has(s.slug))
    .map(playableEntry)
    .filter((e): e is ListenSongEntry => e != null)
    .sort((a, b) => titleSort(a.song, b.song));

  return [...ordered, ...leftovers];
}
