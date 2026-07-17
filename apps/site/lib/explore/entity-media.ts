import type { Book, Pattern } from "@/types/semanticGraph";
import { isYouTubeVideoId } from "@/lib/security/urls";

export function patternHasMedia(pattern: Pattern): boolean {
  return Boolean(pattern.youtubeVideoId || pattern.mediumArticleUrl || pattern.infographic?.url);
}

export function bookHasMedia(book: Book): boolean {
  return Boolean(book.media?.intro?.youtubeVideoId || book.media?.patterns?.youtubePlaylistUrl);
}

/** Books that publish a patterns playlist in the semantic manifest. */
export function booksWithPatternsPlaylist(books: readonly Book[]): Book[] {
  return books.filter((b) => Boolean(b.media?.patterns?.youtubePlaylistUrl?.trim()));
}

export function youtubeWatchUrl(videoId: string): string | null {
  if (!isYouTubeVideoId(videoId)) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeEmbedUrl(videoId: string): string | null {
  if (!isYouTubeVideoId(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}
