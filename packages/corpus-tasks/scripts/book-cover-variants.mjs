/**
 * Shared variant specification for web-optimized book covers.
 * Keep in sync with docs/book-cover-assets.md and schema coverImages keys.
 */

export const GENERATOR_VERSION = 1;

/** Site-public URL prefix for installed derivatives. */
export const SITE_GENERATED_URL_PREFIX = "/generated/book-covers";

/** Portable path prefix inside release archives / build output. */
export const PORTABLE_PATH_PREFIX = "book-covers";

/**
 * @typedef {{ maxWidth: number, quality: number, softMaxBytes: number, hardMaxBytes: number }} VariantSpec
 */

/** @type {Readonly<Record<"detail" | "card" | "thumbnail", VariantSpec>>} */
export const VARIANTS = Object.freeze({
  detail: Object.freeze({
    maxWidth: 720,
    quality: 84,
    softMaxBytes: 250 * 1024,
    hardMaxBytes: 500 * 1024,
  }),
  card: Object.freeze({
    maxWidth: 640,
    quality: 80,
    softMaxBytes: 140 * 1024,
    hardMaxBytes: 300 * 1024,
  }),
  thumbnail: Object.freeze({
    maxWidth: 240,
    quality: 76,
    softMaxBytes: 50 * 1024,
    hardMaxBytes: 120 * 1024,
  }),
});

export const VARIANT_KEYS = Object.freeze(Object.keys(VARIANTS));

/** Stable fingerprint of variant config for incremental rebuilds. */
export function variantConfigFingerprint() {
  return JSON.stringify(VARIANTS);
}
