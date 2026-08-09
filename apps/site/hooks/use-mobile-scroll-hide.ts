"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type ScrollDirection = "up" | "down" | null;

type UseMobileScrollHideOptions = {
  /** When true, the chrome stays visible (e.g. mobile menu open). */
  forceVisible?: boolean;
  /** Minimum scroll delta before direction changes (reduces jitter). */
  thresholdPx?: number;
  /** Only activate below this width (Tailwind `md` = 768). */
  maxWidthPx?: number;
};

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Mobile sticky-chrome helper: hide after scrolling down, show on scroll up.
 * Disabled for reduced motion and when `forceVisible` is set.
 */
export function useMobileScrollHide({
  forceVisible = false,
  thresholdPx = 8,
  maxWidthPx = 768,
}: UseMobileScrollHideOptions = {}): { hidden: boolean; direction: ScrollDirection } {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const [scrollHidden, setScrollHidden] = useState(false);
  const [direction, setDirection] = useState<ScrollDirection>(null);

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      if (forceVisible || window.innerWidth >= maxWidthPx) {
        setScrollHidden(false);
        setDirection(null);
        lastY = window.scrollY;
        return;
      }

      const y = window.scrollY;
      const delta = y - lastY;

      if (y < 8) {
        setScrollHidden(false);
        setDirection(null);
        lastY = y;
        return;
      }

      if (Math.abs(delta) < thresholdPx) return;

      if (delta > 0) {
        setDirection("down");
        setScrollHidden(true);
      } else {
        setDirection("up");
        setScrollHidden(false);
      }
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    const onResize = () => {
      if (window.innerWidth >= maxWidthPx || forceVisible) {
        setScrollHidden(false);
        setDirection(null);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [forceVisible, maxWidthPx, reduceMotion, thresholdPx]);

  const disabled = forceVisible || reduceMotion;
  return {
    hidden: disabled ? false : scrollHidden,
    direction: disabled ? null : direction,
  };
}
