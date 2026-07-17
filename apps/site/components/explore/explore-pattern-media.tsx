import Image from "next/image";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { patternHasMedia, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/explore/entity-media";
import type { Pattern } from "@/types/semanticGraph";

type ExplorePatternMediaProps = {
  pattern: Pattern;
};

/** Pattern hero media from the semantic manifest — video, infographic, Medium link. */
export function ExplorePatternMedia({ pattern }: ExplorePatternMediaProps) {
  if (!patternHasMedia(pattern)) {
    return null;
  }

  const { youtubeVideoId, mediumArticleUrl, infographic } = pattern;
  const embedUrl = youtubeVideoId ? youtubeEmbedUrl(youtubeVideoId) : null;
  const watchUrl = youtubeVideoId ? youtubeWatchUrl(youtubeVideoId) : null;
  const showVideo = Boolean(embedUrl);
  const showInfographic = Boolean(infographic?.url);

  return (
    <div className="mt-10 max-w-2xl space-y-8 border-t border-border/30 pt-10">
      {showVideo && embedUrl ? (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Related video</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/60">
            <iframe
              title={`${pattern.title} — related video`}
              className="absolute inset-0 h-full w-full"
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          {watchUrl ? (
            <p className="text-sm text-muted">
              Having trouble playing the video?{" "}
              <TrackedLink
                href={watchUrl}
                className="text-accent underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                analytics={outboundLinkAnalytics(
                  watchUrl,
                  "Open it on YouTube",
                  "explore_pattern_media",
                  "youtube",
                )}
              >
                Open it on YouTube
              </TrackedLink>
              .
            </p>
          ) : null}
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
          <TrackedLink
            href={mediumArticleUrl}
            className="text-accent underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            analytics={outboundLinkAnalytics(
              mediumArticleUrl,
              "Read on Medium",
              "explore_pattern_media",
              "medium",
            )}
          >
            Read on Medium
          </TrackedLink>
        </p>
      ) : null}
    </div>
  );
}
