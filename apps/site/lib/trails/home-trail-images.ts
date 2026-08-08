/**
 * Homepage Reading Trails card imagery — dedicated landscape assets by trail slug.
 * Keeps image association out of React conditionals without requiring YAML schema changes.
 */
export const HOME_TRAIL_IMAGES: Record<
  string,
  { src: string; objectPosition?: string }
> = {
  "judgment-before-certainty": {
    src: "/images/home/trails/judgment-before-certainty.webp",
    objectPosition: "object-[center_45%]",
  },
  "leadership-after-the-person": {
    src: "/images/home/trails/leadership-after-the-person.webp",
    objectPosition: "object-[center_40%]",
  },
  "meaning-under-pressure": {
    src: "/images/home/trails/meaning-under-pressure.webp",
    objectPosition: "object-[center_50%]",
  },
};

export function resolveHomeTrailImage(slug: string): {
  src: string;
  objectPosition: string;
} {
  const entry = HOME_TRAIL_IMAGES[slug];
  if (entry) {
    return {
      src: entry.src,
      objectPosition: entry.objectPosition ?? "object-center",
    };
  }
  // Fallback: first featured trail image (should not hit for homepage featured set).
  return {
    src: HOME_TRAIL_IMAGES["judgment-before-certainty"]!.src,
    objectPosition: "object-center",
  };
}
