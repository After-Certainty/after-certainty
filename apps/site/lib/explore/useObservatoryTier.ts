"use client";

import { useEffect, useState } from "react";

export type ObservatoryTier = "mobile" | "tablet" | "desktop";

function tierFromWidth(width: number): ObservatoryTier {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

function readTier(): ObservatoryTier {
  if (typeof window === "undefined") return "desktop";
  return tierFromWidth(window.innerWidth);
}

/** Breakpoints align with Tailwind `md` (768px) and `lg` (1024px) in the observatory. */
export function useObservatoryTier(): { tier: ObservatoryTier; isCompact: boolean } {
  const [tier, setTier] = useState<ObservatoryTier>(readTier);

  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      const w = window.innerWidth;
      setTier(tierFromWidth(w));
    };

    md.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    sync();
    return () => {
      md.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
    };
  }, []);

  return { tier, isCompact: tier !== "desktop" };
}

/** Max new neighbors per entity kind when progressively expanding the graph. */
export function progressiveNeighborsPerKindForTier(tier: ObservatoryTier): number {
  switch (tier) {
    case "mobile":
      return 3;
    case "tablet":
      return 4;
    default:
      return 5;
  }
}
