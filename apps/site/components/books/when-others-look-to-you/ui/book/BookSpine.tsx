import type { CSSProperties } from "react";

import { cn } from "@/lib/books/when-others-look-to-you/cn";
import { spineRightClass, spineWidthClass } from "./config";

type BookSpineProps = { className?: string };

/**
 * Smooth multi-stop gradient + single soft hinge inset + pseudos only for grain + rim (same element).
 */
const spineStyle: CSSProperties = {
  background:
    "linear-gradient(90deg, #f1f1f1 0%, #ececec 16%, #e8e8e8 34%, #e5e5e5 52%, #e8e8e8 68%, #eeeeee 82%, #f4f4f4 94%, #fafafa 100%)",
  boxShadow: "inset -0.25rem 0 0.875rem rgba(0, 0, 0, 0.065)",
};

/**
 * Paper fore-edge — single DOM node; ::before / ::after avoid extra layout bars.
 */
export function BookSpine({ className }: BookSpineProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-y-0 z-[1] overflow-hidden rounded-r-md",
        spineWidthClass,
        spineRightClass,
        /* Grain — low contrast, soft-light keeps gradient smooth (no harsh multiply bands) */
        "[&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-0 [&::before]:z-[1] [&::before]:rounded-r-md [&::before]:content-['']",
        "[&::before]:bg-[url('/assets/page-texture.png')] [&::before]:bg-[length:8%_8%] [&::before]:bg-repeat",
        "[&::before]:opacity-[0.14] [&::before]:mix-blend-soft-light",
        /* Single outer rim highlight */
        "[&::after]:pointer-events-none [&::after]:absolute [&::after]:inset-y-0 [&::after]:right-0 [&::after]:z-[2] [&::after]:w-[12%] [&::after]:content-['']",
        "[&::after]:bg-[rgba(255,255,255,0.28)]",
        className,
      )}
      style={spineStyle}
    />
  );
}
