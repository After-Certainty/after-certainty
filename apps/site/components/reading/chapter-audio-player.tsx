"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  AUDIO_PLAYBACK_RATES,
  DEFAULT_AUDIO_PLAYBACK_RATE,
  formatAudioPlaybackRateLabel,
  getAudioPlaybackRate,
  isAudioPlaybackRate,
  setAudioPlaybackRate,
  subscribeAudioPlaybackRate,
} from "@/lib/reading/audioPlaybackRate";
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
  /** SSR-loaded alignment when available; client fetch is the fallback. */
  alignment?: ChapterAudioAlignment | null;
};

const ACTIVE_CLASS = "is-audio-active";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
}

function clearActiveSegments(root: ParentNode | null): void {
  if (!root) return;
  root.querySelectorAll(`[data-audio-segment].${ACTIVE_CLASS}`).forEach((el) => {
    el.classList.remove(ACTIVE_CLASS);
  });
}

function setActiveSegment(
  root: ParentNode | null,
  segmentId: string | null,
  options: { followScroll: boolean },
): void {
  if (!root) return;
  clearActiveSegments(root);
  if (!segmentId) return;
  const nodes = root.querySelectorAll(`[data-audio-segment="${CSS.escape(segmentId)}"]`);
  nodes.forEach((el) => el.classList.add(ACTIVE_CLASS));
  if (!options.followScroll) return;
  const first = nodes[0];
  if (!(first instanceof HTMLElement)) return;
  first.scrollIntoView({
    block: "center",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Always-visible bottom dock for available chapter TTS (no expand CTA).
 * Follow-scrolls the active manuscript segment while playing.
 */
export function ChapterAudioPlayer({
  audio,
  alignment: alignmentProp = null,
}: ChapterAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fetchedAlignment, setFetchedAlignment] = useState<ChapterAudioAlignment | null>(null);
  const playbackRate = useSyncExternalStore(
    subscribeAudioPlaybackRate,
    getAudioPlaybackRate,
    () => DEFAULT_AUDIO_PLAYBACK_RATE,
  );
  const activeIdRef = useRef<string | null>(null);
  const followPausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const highlightCapable =
    canHighlightAlignment(audio.alignmentGranularity) && Boolean(audio.alignmentUrl);
  const alignment = alignmentProp ?? (highlightCapable ? fetchedAlignment : null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    return registerChapterAudioElement(el);
  }, [audio.audioUrl]);

  // Browsers reset playbackRate when the media source changes; re-apply after src updates.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate, audio.audioUrl]);

  useEffect(() => {
    if (alignmentProp || !highlightCapable || !audio.alignmentUrl) return;
    let cancelled = false;
    void fetch(audio.alignmentUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (cancelled) return;
        const parsed = parseChapterAudioAlignment(raw);
        if (parsed && parsed.generationHash === audio.generationHash) {
          setFetchedAlignment(parsed);
        } else {
          setFetchedAlignment(null);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedAlignment(null);
      });
    return () => {
      cancelled = true;
    };
  }, [alignmentProp, highlightCapable, audio.alignmentUrl, audio.generationHash]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

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
      setActiveSegment(chapterRoot, nextId, { followScroll: !followPausedRef.current });
    };

    const stopRaf = () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = () => {
      sync();
      if (!el.paused && !el.ended) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const onPlay = () => {
      followPausedRef.current = false;
      stopRaf();
      rafRef.current = window.requestAnimationFrame(tick);
      sync();
    };

    const onPause = () => {
      stopRaf();
    };

    const onSeeked = () => {
      followPausedRef.current = false;
      sync();
    };

    const onEnded = () => {
      stopRaf();
      clearActiveSegments(chapterRoot);
      activeIdRef.current = null;
      followPausedRef.current = false;
    };

    const onUserScrollIntent = () => {
      if (!el.paused && !el.ended) {
        followPausedRef.current = true;
      }
    };

    el.addEventListener("timeupdate", sync);
    el.addEventListener("seeked", onSeeked);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    window.addEventListener("wheel", onUserScrollIntent, { passive: true });
    window.addEventListener("touchmove", onUserScrollIntent, { passive: true });

    return () => {
      stopRaf();
      el.removeEventListener("timeupdate", sync);
      el.removeEventListener("seeked", onSeeked);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      window.removeEventListener("wheel", onUserScrollIntent);
      window.removeEventListener("touchmove", onUserScrollIntent);
      clearActiveSegments(chapterRoot);
      activeIdRef.current = null;
      followPausedRef.current = false;
    };
  }, [alignment, audio.audioUrl]);

  const onSpeedChange = (value: string) => {
    const parsed = Number(value);
    if (!isAudioPlaybackRate(parsed)) return;
    setAudioPlaybackRate(parsed);
  };

  return (
    <div
      role="region"
      aria-label="Chapter audio"
      className="chapter-audio-dock fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-bg/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      data-testid="chapter-audio-player"
      data-unit-id={audio.unitId}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-relaxed text-muted">{audio.disclosure}</p>
          <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
            Speed
            <select
              className="h-8 min-w-[4.5rem] rounded-sm border border-border/60 bg-bg-elevated/30 px-2 text-xs normal-case tracking-normal text-fg/85 transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Playback speed"
              value={String(playbackRate)}
              onChange={(event) => onSpeedChange(event.target.value)}
              data-testid="chapter-audio-speed"
            >
              {AUDIO_PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {formatAudioPlaybackRateLabel(rate)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          className="h-10 w-full opacity-95 [&::-webkit-media-controls-panel]:bg-bg-elevated/90"
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
    </div>
  );
}
