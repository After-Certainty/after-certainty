import Image from "next/image";
import type { Pattern } from "@/types/semanticGraph";
import { patternHasMedia, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/explore/entity-media";

type ExplorePatternMediaProps = {
  pattern: Pattern;
};

/** Pattern hero media from the semantic manifest — video, infographic, Medium link. */
export function ExplorePatternMedia({ pattern }: ExplorePatternMediaProps) {
  if (!patternHasMedia(pattern)) {
    return null;
  }

  const { youtubeVideoId, mediumArticleUrl, infographic } = pattern;
  const showVideo = Boolean(youtubeVideoId);
  const showInfographic = Boolean(infographic?.url);

  return (
    <div className="mt-10 max-w-2xl space-y-8 border-t border-border/30 pt-10">
      {showVideo ? (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Related video</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/60">
            <iframe
              title={`${pattern.title} — related video`}
              className="absolute inset-0 h-full w-full"
              src={youtubeEmbedUrl(youtubeVideoId!)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <p className="text-sm text-muted">
            Having trouble playing the video?{" "}
            <a
              href={youtubeWatchUrl(youtubeVideoId!)}
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open it on YouTube
            </a>
            .
          </p>
        </div>
      ) : null}

      {showInfographic && infographic ? (
        <figure className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Infographic</p>
          <Image
            src={infographic.url}
            alt={infographic.alt ?? `Infographic illustrating ${pattern.title}`}
            width={infographic.width}
            height={infographic.height}
            className="h-auto w-full rounded-lg border border-border/40"
            sizes="(max-width: 768px) 100vw, 42rem"
          />
        </figure>
      ) : null}

      {mediumArticleUrl ? (
        <p className="text-base leading-relaxed text-muted">
          <a
            href={mediumArticleUrl}
            className="text-accent underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read on Medium
          </a>
        </p>
      ) : null}
    </div>
  );
}