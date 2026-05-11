/**
 * Same footprint everywhere (home hero, `/book`, etc.): compact on small phones, ~400px cap from `md`.
 */
export const bookResponsiveMaxWidthClass =
  "mx-auto max-w-[200px] sm:max-w-[220px] md:max-w-[min(100%,25rem)]";

/** Spine width — % of the tilt parent (same width as cover face). */
export const spineWidthClass = "w-[5%] min-w-0";

/**
 * Spine anchored to the cover’s right edge: extends outward by `right` (% of container width).
 */
export const spineRightClass = "right-[-4%]";

/** Ambient cast shadow on the tilted book block (not the ground contact shadow) */
export const bookAmbientShadowClass =
  "shadow-[0_1.75rem_2.75rem_-0.875rem_rgba(0,0,0,0.55)]";

/** Perspective only — pairs with `bookTransformInnerClass` (see `app/globals.css`) */
export const bookPerspectiveHostClass = "book-perspective-host";

/** Rotations + preserve-3d — must not share an element with perspective */
export const bookTransformInnerClass = "book-transform-inner";
