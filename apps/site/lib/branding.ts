/** Resolved paths under `/public/branding` — PNG marks split from the master sprite sheet. */
export const brandMarks = {
  /** Gold spark on transparent — default on dark UI chrome */
  goldClear: "/branding/mark-gold-clear.png",
  /** White spark on transparent — legible on mixed / footer surfaces */
  whiteClear: "/branding/mark-white-clear.png",
  /** Gold mark on black disc with soft transparent halo */
  goldDisc: "/branding/mark-gold-disc.png",
  /** Gold mark inside rounded “chip” / button treatment */
  goldChip: "/branding/mark-gold-chip.png",
} as const;
