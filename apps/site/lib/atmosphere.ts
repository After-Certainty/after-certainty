/**
 * Atmospheric layering — implementation lives in `styles/atmosphere.css`.
 *
 * **Opacity philosophy (dark theme):**
 * - Global grain on `html::after`: ~3–5% felt luminance (never crisp noise).
 * - Hero topology/bloom/grain: topology weakest at frame edge; bloom & grain below headline contrast needs.
 * - Section `transition`: amber wash + faint topology ghost between bands.
 * - Section `quote`: bloom + grain + paper hint for contemplative blocks.
 * - Footer: vignette + faint topology + whisper grain.
 *
 * **Mobile:** `@media (max-width: 768px)` reduces `--atm-*` variables slightly (fewer pixels = textures read louder).
 *
 * **Reduced motion:** Extra taper on bloom/topology so motion-sensitive users get calmer fields.
 *
 * **Tuning:** Edit `--atm-*` in `styles/atmosphere.css` — avoid stacking many blend modes on one node.
 */

export type { SectionAtmosphere } from "@/components/ui/section";
