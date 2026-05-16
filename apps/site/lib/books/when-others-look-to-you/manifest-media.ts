import type { Book, Pattern } from "@/types/semanticGraph";
import type {
  IntroVideoPageContent,
  PatternCardItem,
  PatternDetailBody,
  PatternsPageContent,
} from "@/lib/books/when-others-look-to-you/content";

/** WoLTY v1 book row in the semantic manifest (canonical or alias slug). */
export function findWoltyBook(books: readonly Book[]): Book | undefined {
  return books.find(
    (b) => b.slug === "when-others-look-to-you-v1" || b.slug === "when-others-look-to-you",
  );
}

/** Overlay manifest media onto local pattern content when the manifest supplies fields. */
export function mergePatternWithManifestMedia(
  pattern: PatternCardItem,
  manifestPattern: Pattern | undefined,
): PatternCardItem {
  if (!manifestPattern) {
    return pattern;
  }
  const overlay: Partial<PatternDetailBody> = {};
  if (manifestPattern.youtubeVideoId) {
    overlay.youtubeVideoId = manifestPattern.youtubeVideoId;
  }
  if (manifestPattern.mediumArticleUrl) {
    overlay.mediumArticleHref = manifestPattern.mediumArticleUrl;
  }
  if (manifestPattern.infographic?.url) {
    const { url, width, height, alt } = manifestPattern.infographic;
    overlay.infographic = {
      src: url,
      width,
      height,
      alt: alt ?? `Infographic for ${pattern.title}`,
    };
  }
  if (Object.keys(overlay).length === 0) {
    return pattern;
  }
  return { ...pattern, detail: { ...pattern.detail, ...overlay } };
}

export function mergePatternsPageContent(
  content: PatternsPageContent,
  book: Book | undefined,
): PatternsPageContent {
  const playlistUrl = book?.media?.patterns?.youtubePlaylistUrl;
  if (!playlistUrl) {
    return content;
  }
  return {
    ...content,
    youtubePlaylist: {
      href: playlistUrl,
      label:
        content.youtubePlaylist?.label ?? "Watch the pattern playlist on YouTube",
    },
  };
}

export function mergeIntroVideoContent(
  content: IntroVideoPageContent,
  book: Book | undefined,
): IntroVideoPageContent {
  const videoId = book?.media?.intro?.youtubeVideoId;
  if (!videoId) {
    return content;
  }
  return { ...content, youtubeVideoId: videoId };
}
