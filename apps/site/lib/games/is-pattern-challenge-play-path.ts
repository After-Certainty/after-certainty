import { gamePaths } from "@/lib/games/paths";

/**
 * True for focused Pattern Recognition play routes (daily / practice / single challenge).
 * Lobby remains under normal site chrome.
 */
export function isPatternChallengePlayPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const base = gamePaths.patternRecognition.replace(/\/$/, "");
  if (pathname === `${base}/daily` || pathname === `${base}/daily/`) return true;
  if (pathname === `${base}/practice` || pathname === `${base}/practice/`) return true;
  const challengePattern = new RegExp(`^${escapeRegExp(base)}/challenge/[^/]+/?$`);
  return challengePattern.test(pathname);
}

export function isFocusedExperiencePath(pathname: string | null | undefined): boolean {
  // Lazy import avoidance: callers that need reader OR game pass through a shared gate.
  return isPatternChallengePlayPath(pathname);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
