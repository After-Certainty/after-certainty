import { cn } from "@/lib/books/when-others-look-to-you/cn";

/**
 * Soft ellipse under the book — all geometry is % of the aspect-ratio host so it scales.
 * Horizontal anchor accounts for rotateY tilt (shadow sits slightly right of center).
 */
export function BookShadow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-[53%] z-0 -translate-x-1/2",
        "bottom-[-6%] h-[8%] w-[92%] rounded-[100%]",
        "bg-black/[0.15] blur-3xl",
        className,
      )}
    />
  );
}
