"use client";

import { useEffect, useRef, useState } from "react";

import { sunoEmbedUrl } from "@/lib/songs/recordings";

const EMBED_HEIGHT_PX = 140;

/** Mount when the card is within this distance of the viewport. */
export const SUNO_EMBED_ENTER_ROOT_MARGIN = "200px 0px";

/**
 * Unmount only after leaving this larger band. The gap between enter and exit
 * margins is intentional hysteresis so iframes do not flap at the boundary.
 */
export const SUNO_EMBED_EXIT_ROOT_MARGIN = "1000px 0px";

type SunoEmbedProps = {
  externalId: string;
  /** Accessible iframe title — include the composition title. */
  title: string;
};

/**
 * Deferred Suno iframe with enter/exit hysteresis.
 *
 * Mounts near the viewport (or via "Load player"), then unmounts again once
 * the card is sufficiently far away so scrolling never accumulates dozens of
 * live third-party players. Never autoplays.
 */
export function SunoEmbed({ externalId, title }: SunoEmbedProps) {
  const embedSrc = sunoEmbedUrl(externalId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!embedSrc) return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // Without IntersectionObserver, keep the placeholder until "Load player".
      return;
    }

    const enterObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
        }
      },
      { root: null, rootMargin: SUNO_EMBED_ENTER_ROOT_MARGIN, threshold: 0 },
    );

    const exitObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => !e.isIntersecting)) {
          setShouldMount(false);
        }
      },
      { root: null, rootMargin: SUNO_EMBED_EXIT_ROOT_MARGIN, threshold: 0 },
    );

    enterObserver.observe(node);
    exitObserver.observe(node);

    return () => {
      enterObserver.disconnect();
      exitObserver.disconnect();
    };
  }, [embedSrc]);

  if (!embedSrc) {
    return (
      <p className="text-sm text-muted" role="status">
        Player unavailable for this recording.
      </p>
    );
  }

  const iframeTitle = `${title} — Suno player`;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/50"
      style={{ minHeight: EMBED_HEIGHT_PX }}
      data-suno-embed={shouldMount ? "mounted" : "deferred"}
    >
      {shouldMount ? (
        <iframe
          title={iframeTitle}
          src={embedSrc}
          className="block w-full border-0"
          height={EMBED_HEIGHT_PX}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div
          className="flex h-[140px] flex-col items-start justify-center gap-3 px-4 py-3 sm:px-5"
          role="status"
        >
          <p className="text-sm text-muted">Player loads when this song is near view.</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setShouldMount(true)}
          >
            Load player
          </button>
        </div>
      )}
    </div>
  );
}
