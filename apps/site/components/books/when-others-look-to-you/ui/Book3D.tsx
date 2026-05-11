import { HeroBookImage } from "@/components/books/when-others-look-to-you/ui/HeroBookImage";
import { cn } from "@/lib/books/when-others-look-to-you/cn";

export type Book3DProps = {
  /** Cover image URL under `/public` */
  src?: string;
  alt: string;
  className?: string;
  /** Set true when the book is the primary above-the-fold visual (e.g. `/book`) */
  priority?: boolean;
};

/**
 * Book mockup (cover + spine + tilt) — wrapped in `.book-3d-root` (`overflow: visible`) so spine,
 * blur shadow, and 3D overflow aren’t clipped in grids/flex layouts.
 */
export function Book3D({ src, alt, className, priority = false }: Book3DProps) {
  return (
    <div className="book-3d-root min-w-0 w-full max-w-full overflow-visible">
      <HeroBookImage
        src={src}
        alt={alt}
        className={cn(className)}
        priority={priority}
      />
    </div>
  );
}
