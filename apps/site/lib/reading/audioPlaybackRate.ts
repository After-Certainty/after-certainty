import {
  canUseLocalStorage,
  readVersionedLocalState,
  removeLocalStorageKey,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

/**
 * Device-only chapter audio playback speed (native HTMLMediaElement.playbackRate).
 * Standard audiobook presets in [0.8, 2.0]; default 1×. No server sync.
 */

export const AUDIO_PLAYBACK_RATES = [0.8, 1, 1.25, 1.5, 1.75, 2] as const;
export type AudioPlaybackRate = (typeof AUDIO_PLAYBACK_RATES)[number];

export const DEFAULT_AUDIO_PLAYBACK_RATE: AudioPlaybackRate = 1;

const STORAGE_KEY = "ac_audio_playback_rate";
const STORAGE_VERSION = 1;

export function isAudioPlaybackRate(value: unknown): value is AudioPlaybackRate {
  return typeof value === "number" && (AUDIO_PLAYBACK_RATES as readonly number[]).includes(value);
}

export function normalizeAudioPlaybackRate(value: unknown): AudioPlaybackRate {
  return isAudioPlaybackRate(value) ? value : DEFAULT_AUDIO_PLAYBACK_RATE;
}

export function formatAudioPlaybackRateLabel(rate: AudioPlaybackRate): string {
  if (rate === 1) return "1×";
  // Avoid trailing zeros from float stringification (e.g. 0.8 stays "0.8×").
  return `${rate}×`;
}

export function getAudioPlaybackRate(): AudioPlaybackRate {
  if (!canUseLocalStorage()) return DEFAULT_AUDIO_PLAYBACK_RATE;
  const stored = readVersionedLocalState<unknown>(STORAGE_KEY, STORAGE_VERSION);
  if (!stored) return DEFAULT_AUDIO_PLAYBACK_RATE;
  return normalizeAudioPlaybackRate(stored.data);
}

export function setAudioPlaybackRate(rate: AudioPlaybackRate): AudioPlaybackRate {
  const next = normalizeAudioPlaybackRate(rate);
  if (!canUseLocalStorage()) return next;
  writeVersionedLocalState(STORAGE_KEY, STORAGE_VERSION, next);
  return next;
}

export function clearAudioPlaybackRate(): void {
  removeLocalStorageKey(STORAGE_KEY);
}

export const AUDIO_PLAYBACK_RATE_STORAGE_KEY = STORAGE_KEY;
export const AUDIO_PLAYBACK_RATE_STORAGE_VERSION = STORAGE_VERSION;
