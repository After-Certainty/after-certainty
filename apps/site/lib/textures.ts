/**
 * WebP texture assets under `/public/textures`.
 * Same URLs are exposed as CSS variables in `styles/tokens.css` (`--texture-*`).
 */
export const texturePaths = {
  grain: "/textures/grain.webp",
  topologyOverlay: "/textures/topology-overlay.webp",
  lightBloom: "/textures/light-bloom.webp",
  paperDark: "/textures/paper-dark.webp",
} as const;

export type TextureKey = keyof typeof texturePaths;

/** Early hints so CSS `background-image` layers don’t pop in after the LCP hero photo. */
export const texturePreloadHrefs: readonly string[] = [
  texturePaths.grain,
  texturePaths.topologyOverlay,
  texturePaths.lightBloom,
  texturePaths.paperDark,
  "/images/hero/hero-backdrop.png",
];
