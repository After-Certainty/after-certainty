import type { Icon, IconProps, IconWeight } from "@/components/icons/approved";
import {
  SITE_ICON_DEFAULT_WEIGHT,
  siteIconSizes,
  type SiteIconSizeToken,
} from "@/components/icons/sizes";

export type SiteIconProps = {
  icon: Icon;
  /** Named size token or pixel number. Default `md` (20). */
  size?: SiteIconSizeToken | number;
  weight?: IconWeight;
  /** When true (default), sets aria-hidden — adjacent text carries meaning. */
  decorative?: boolean;
  className?: string;
} & Omit<IconProps, "size" | "weight" | "className" | "ref">;

/**
 * Thin Phosphor wrapper with After Certainty defaults (light weight, currentColor).
 * Prefer this for repeated UI affordances; direct Phosphor usage is fine in primitives.
 */
export function SiteIcon({
  icon: IconComponent,
  size = "md",
  weight = SITE_ICON_DEFAULT_WEIGHT,
  decorative = true,
  className = "",
  ...rest
}: SiteIconProps) {
  const pixelSize = typeof size === "number" ? size : siteIconSizes[size];
  const a11yProps = decorative ? { "aria-hidden": true as const } : {};

  return (
    <IconComponent
      size={pixelSize}
      weight={weight}
      className={`shrink-0 ${className}`.trim()}
      {...a11yProps}
      {...rest}
    />
  );
}
