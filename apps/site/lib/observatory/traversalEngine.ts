/**
 * Future: curated pathway playback, breadcrumbs, and pinned viewport traversal.
 * Pathways and topology lens modes are deferred until manifest support exists.
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
