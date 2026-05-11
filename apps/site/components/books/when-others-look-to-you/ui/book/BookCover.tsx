import Image from "next/image";
import { cn } from "@/lib/books/when-others-look-to-you/cn";

type BookCoverProps = {
  src?: string;
  alt: string;
  priority?: boolean;
};

/**
 * Front face only (placeholder or artwork). Lighting lives in global `.book-cover-lighting`.
 * With `src`, uses `next/image` `fill` + `h-full w-full object-cover` inside a relative,
 * min-sized wrapper so the bitmap tracks the responsive parent (no intrinsic px layout).
 */
export function BookCover({ src, alt, priority }: BookCoverProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-center gap-[6%] rounded-l-lg rounded-r-none border border-white/25 bg-brand-navy/75 p-[8%] text-center",
        )}
        role="img"
        aria-label={alt}
      >
        <div className="aspect-[5/6] w-[18%] max-h-[22%] rounded-sm bg-gradient-to-br from-brand-teal/50 to-brand-navy" />
        <span className="body-sm text-brand-teal/90">Book cover</span>
      </div>
    );
  }

  return (
    <div className="relative z-[2] h-full min-h-0 w-full min-w-0 overflow-hidden rounded-l-lg rounded-r-none">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={priority ? 90 : 75}
        sizes="(max-width: 768px) min(100vw, 28rem), (max-width: 1024px) 40vw, 320px"
        className="h-full w-full object-cover"
        decoding="async"
      />
    </div>
  );
}

/** Gradient overlay — left-key lighting in `app/globals.css` (`.book-cover-lighting`). */
export function BookCoverLighting() {
  return <div className="book-cover-lighting" aria-hidden />;
}
