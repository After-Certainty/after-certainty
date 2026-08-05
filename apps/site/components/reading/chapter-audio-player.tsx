"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import { registerChapterAudioElement } from "@/lib/reading/navigate-chapter";

export type ChapterAudioPlayerProps = {
  audio: ChapterAudioUnit;
};

/**
 * Native-reader Listen control. Renders only when a parent passes an available
 * audio unit (no site feature-flag env).
 */
export function ChapterAudioPlayer({ audio }: ChapterAudioPlayerProps) {
  const disclosureId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    return registerChapterAudioElement(el);
  }, [audio.audioUrl, expanded]);

  return (
    <div
      className="rounded-sm border border-border/40 bg-bg-elevated/30 px-4 py-3"
      data-testid="chapter-audio-player"
      data-unit-id={audio.unitId}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center border border-accent/45 bg-accent-soft px-4 py-2 text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={expanded}
          aria-controls={expanded ? disclosureId : undefined}
          data-testid="chapter-audio-listen"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide player" : "Listen"}
        </button>
        <p className="text-xs leading-relaxed text-muted" id={`${disclosureId}-summary`}>
          {audio.disclosure}
        </p>
      </div>

      {expanded ? (
        <div id={disclosureId} className="mt-3 space-y-2">
          <audio
            ref={audioRef}
            controls
            preload="metadata"
            className="h-10 w-full max-w-xl opacity-95 [&::-webkit-media-controls-panel]:bg-bg-elevated/90"
            src={audio.audioUrl}
            data-testid="chapter-audio-element"
          >
            Your browser does not support audio playback.
          </audio>
          {typeof audio.durationSeconds === "number" ? (
            <p className="text-[11px] tabular-nums text-muted/80">
              About {Math.max(1, Math.round(audio.durationSeconds))}s
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
