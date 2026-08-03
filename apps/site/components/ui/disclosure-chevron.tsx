import { CaretDownIcon, CaretRightIcon } from "@/components/icons/approved";
import { SITE_ICON_DEFAULT_WEIGHT, siteIconSizes } from "@/components/icons/sizes";

type DisclosureChevronProps = {
  expanded: boolean;
  /** `down` rotates when open (accordion). `right` is a static forward affordance. */
  direction?: "down" | "right";
  className?: string;
};

/**
 * Shared disclosure / list chevron used by Books shelves, Explore index groups,
 * and Patterns mobile foundations. Phosphor caret with Books/Patterns parity.
 */
export function DisclosureChevron({
  expanded,
  direction = "down",
  className = "",
}: DisclosureChevronProps) {
  if (direction === "right") {
    return (
      <CaretRightIcon
        aria-hidden
        size={siteIconSizes.md}
        weight={SITE_ICON_DEFAULT_WEIGHT}
        className={`shrink-0 text-muted transition-colors group-hover:text-accent ${className}`.trim()}
      />
    );
  }

  return (
    <CaretDownIcon
      aria-hidden
      size={siteIconSizes.md}
      weight={SITE_ICON_DEFAULT_WEIGHT}
      className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      } ${className}`.trim()}
    />
  );
}
