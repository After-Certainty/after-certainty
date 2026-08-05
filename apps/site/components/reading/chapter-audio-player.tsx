"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import {
  canHighlightAlignment,
  findActiveAlignmentSegment,
  parseChapterAudioAlignment,
  type ChapterAudioAlignment,
} from "@/lib/reading/chapter-audio-alignment";
import { registerChapterAudioElement } from "@/lib/reading/navigate-chapter";

export type ChapterAudioPlayerProps = {
  audio: ChapterAudioUnit;
};

const ACTIVE_CLASS = "is-audio-active";

function clearActiveSegments(root: ParentNode | null): void {
  if (!root) return;
  root.querySelectorAll(`[data-audio-segment].${ACTIVE_CLASS}`).forEach((el) => {
    el.classList.remove(ACTIVE_CLASS);
  });
}

function setActiveSegment(root: ParentNode | null, segmentId: string | null): void {
  if (!root) return;
  clearActiveSegments(root);
  if (!segmentId) return;
  const nodes = root.querySelectorAll(`[data-audio-segment="${CSS.escape(segmentId)}"]`);
  nodes.forEach((el) => el.classList.add(ACTIVE_CLASS));
  const first = nodes[0];
  if (first instanceof HTMLElement) {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    first.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }
}

/**
 * Native-reader Listen control. Renders only when a parent passes an available
 * audio unit (no site feature-flag env).
 */
export function ChapterAudioPlayer({ audio }: ChapterAudioPlayerProps) {
  const disclosureId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [alignment, setAlignment] = useState<ChapterAudioAlignment | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    return registerChapterAudioElement(el);
  }, [audio.audioUrl, expanded]);

  useEffect(() => {
    if (!expanded) return;
    if (!canHighlightAlignment(audio.alignmentGranularity) || !audio.alignmentUrl) {
      setAlignment(null);
      return;
    }
    let cancelled = false;
    void fetch(audio.alignmentUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (cancelled) return;
        const parsed = parseChapterAudioAlignment(raw);
        if (parsed && parsed.generationHash === audio.generationHash) {
          setAlignment(parsed);
        } else {
          setAlignment(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAlignment(null);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, audio.alignmentUrl, audio.alignmentGranularity, audio.generationHash]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !expanded) return;

    const chapterRoot = document.getElementById("chapter-content");

    const sync = () => {
      if (!alignment?.segments.length) {
        if (activeIdRef.current) {
          clearActiveSegments(chapterRoot);
          activeIdRef.current = null;
        }
        return;
      }
      const seg = findActiveAlignmentSegment(alignment.segments, el.currentTime * 1000);
      const nextId = seg?.id ?? null;
      if (nextId === activeIdRef.current) return;
      activeIdRef.current = nextId;
      setActiveSegment(chapterRoot, nextId);
    };

    const onEndedOrPause = () => {
      // Keep last highlight on pause; clear on ended.
    };

    const onEnded = () => {
      clearActiveSegments(chapterRoot);
      activeIdRef.current = null;
    };

    el.addEventListener("timeupdate", sync);
    el.addEventListener("seeked", sync);
    el.addEventListener("play", sync);
    el.addEventListener("pause", onEndedOrPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("seeked", sync);
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", onEndedOrPause);
      el.removeEventListener("ended", onEnded);
      clearActiveSegments(chapterRoot);
      activeIdRef.current = null;
    };
  }, [alignment, expanded, audio.audioUrl]);

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
