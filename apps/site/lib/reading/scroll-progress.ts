/**
 * Compute reading scroll progress through a content block (0–1).
 * Does not invent page counts — percent of chapter content scrolled through the viewport.
 */
export function computeScrollProgress(input: {
  scrollY: number;
  viewportHeight: number;
  contentOffsetTop: number;
  contentHeight: number;
}): number {
  const { scrollY, viewportHeight, contentOffsetTop, contentHeight } = input;
  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(contentOffsetTop) ||
    !Number.isFinite(contentHeight) ||
    contentHeight <= 0 ||
    viewportHeight <= 0
  ) {
    return 0;
  }

  // Content shorter than the viewport: fully "read" once any of it is on screen.
  if (contentHeight <= viewportHeight) {
    const visible =
      scrollY + viewportHeight > contentOffsetTop && scrollY < contentOffsetTop + contentHeight;
    return visible ? 1 : 0;
  }

  const start = contentOffsetTop;
  const end = contentOffsetTop + contentHeight - viewportHeight;
  if (end <= start) return 1;
  if (scrollY <= start) return 0;
  if (scrollY >= end) return 1;
  return (scrollY - start) / (end - start);
}

/** Clamp and format for aria / visible percent labels. */
export function formatScrollPercent(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.round(Math.min(1, Math.max(0, progress)) * 100);
}
