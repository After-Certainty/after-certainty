import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  AUDIO_PLAYBACK_RATE_STORAGE_KEY,
  AUDIO_PLAYBACK_RATES,
  clearAudioPlaybackRate,
  DEFAULT_AUDIO_PLAYBACK_RATE,
  formatAudioPlaybackRateLabel,
  getAudioPlaybackRate,
  isAudioPlaybackRate,
  normalizeAudioPlaybackRate,
  setAudioPlaybackRate,
} from "@/lib/reading/audioPlaybackRate";
import { readVersionedLocalState } from "@/lib/storage/safe-local-storage";

describe("audioPlaybackRate", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("exposes standard presets in 0.8–2.0 including default 1", () => {
    expect(AUDIO_PLAYBACK_RATES).toEqual([0.8, 1, 1.25, 1.5, 1.75, 2]);
    expect(DEFAULT_AUDIO_PLAYBACK_RATE).toBe(1);
  });

  it("returns default when nothing is stored", () => {
    expect(getAudioPlaybackRate()).toBe(DEFAULT_AUDIO_PLAYBACK_RATE);
  });

  it("persists a valid rate in a versioned envelope", () => {
    expect(setAudioPlaybackRate(1.5)).toBe(1.5);
    expect(getAudioPlaybackRate()).toBe(1.5);
    expect(readVersionedLocalState(AUDIO_PLAYBACK_RATE_STORAGE_KEY, 1)?.data).toBe(1.5);
  });

  it("rejects invalid stored values and falls back to default", () => {
    window.localStorage.setItem(
      AUDIO_PLAYBACK_RATE_STORAGE_KEY,
      JSON.stringify({ version: 1, data: 3 }),
    );
    expect(getAudioPlaybackRate()).toBe(DEFAULT_AUDIO_PLAYBACK_RATE);
    expect(normalizeAudioPlaybackRate(0.9)).toBe(DEFAULT_AUDIO_PLAYBACK_RATE);
    expect(normalizeAudioPlaybackRate("1.5")).toBe(DEFAULT_AUDIO_PLAYBACK_RATE);
    expect(isAudioPlaybackRate(1.25)).toBe(true);
    expect(isAudioPlaybackRate(1.1)).toBe(false);
  });

  it("formats labels with multiplication sign", () => {
    expect(formatAudioPlaybackRateLabel(1)).toBe("1×");
    expect(formatAudioPlaybackRateLabel(0.8)).toBe("0.8×");
    expect(formatAudioPlaybackRateLabel(1.25)).toBe("1.25×");
  });

  it("clears stored rate", () => {
    setAudioPlaybackRate(2);
    clearAudioPlaybackRate();
    expect(window.localStorage.getItem(AUDIO_PLAYBACK_RATE_STORAGE_KEY)).toBeNull();
    expect(getAudioPlaybackRate()).toBe(DEFAULT_AUDIO_PLAYBACK_RATE);
  });
});
