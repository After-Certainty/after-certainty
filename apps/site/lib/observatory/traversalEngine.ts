/**
 * Curated pathway playback helpers for the Observatory.
 */

export type TraversalPlaybackState = {
  activePathwayId: string | null;
  stepIndex: number;
  isPlaying: boolean;
};

export const initialTraversalPlaybackState: TraversalPlaybackState = {
  activePathwayId: null,
  stepIndex: 0,
  isPlaying: false,
};

export function clampPathwayStepIndex(stepIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(Math.max(stepIndex, 0), totalSteps - 1);
}

export function nextPathwayStepIndex(stepIndex: number, totalSteps: number): number {
  return clampPathwayStepIndex(stepIndex + 1, totalSteps);
}

export function previousPathwayStepIndex(stepIndex: number, totalSteps: number): number {
  return clampPathwayStepIndex(stepIndex - 1, totalSteps);
}
