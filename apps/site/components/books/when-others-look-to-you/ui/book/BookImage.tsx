import { cn } from "@/lib/books/when-others-look-to-you/cn";
import {
  bookAmbientShadowClass,
  bookPerspectiveHostClass,
  bookResponsiveMaxWidthClass,
  bookTransformInnerClass,
} from "@/components/books/when-others-look-to-you/ui/book/config";
import { BookCover, BookCoverLighting } from "@/components/books/when-others-look-to-you/ui/book/BookCover";
import { BookShadow } from "@/components/books/when-others-look-to-you/ui/book/BookShadow";
import { BookSpine } from "@/components/books/when-others-look-to-you/ui/book/BookSpine";

export type BookImageProps = {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** @deprecated Use `BookImageProps` */
export type HeroBookImageProps = BookImageProps;

/**
 * Single responsive frame: `aspect-[2/3]` + `max-w` defines the book scale.
 * 3D: `.book-perspective-host` (perspective only) → `.book-transform-inner` (rotate + preserve-3d).
 * Cover, spine, and shadow use percentage sizing relative to this container.
 */
export function HeroBookImage({
  src,
  alt,
  className,
  /** Below-fold / secondary hero art — lazy unless a page sets `priority` for LCP */
  priority = false,
}: BookImageProps) {
  return (
    <div
      className={cn(
        "relative min-w-0 w-full max-w-full overflow-visible",
        bookResponsiveMaxWidthClass,
        "aspect-[2/3]",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full min-h-0 w-full overflow-visible",
          bookPerspectiveHostClass,
        )}
      >
        <div
          className={cn(
            "relative h-full min-h-0 w-full overflow-visible",
            bookTransformInnerClass,
            bookAmbientShadowClass,
          )}
        >
          <div
            className={cn(
              "relative z-[2] h-full min-h-0 w-full min-w-0 overflow-visible shadow-[0.2rem_0_0.85rem_rgba(0,0,0,0.11)]",
            )}
          >
            <BookCover src={src} alt={alt} priority={priority} />
            <BookCoverLighting />
          </div>
          <BookSpine />
        </div>
      </div>

      <BookShadow />
    </div>
  );
}

export const BookImage = HeroBookImage;
