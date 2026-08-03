/** Shared Phosphor size tokens for After Certainty UI icons. */
export const siteIconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  /** Upper bound for prominent semantic icons. */
  xl: 28,
} as const;

export type SiteIconSizeToken = keyof typeof siteIconSizes;

/** Default editorial weight — prefer light; controls may use regular. */
export const SITE_ICON_DEFAULT_WEIGHT = "light" as const;
