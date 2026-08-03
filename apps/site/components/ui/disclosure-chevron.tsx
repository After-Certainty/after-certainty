type DisclosureChevronProps = {
  expanded: boolean;
  /** `down` rotates when open (accordion). `right` is a static forward affordance. */
  direction?: "down" | "right";
  className?: string;
};

/**
 * Shared disclosure / list chevron used by Books shelves, Explore index groups,
 * and Patterns mobile foundations.
 */
export function DisclosureChevron({
  expanded,
  direction = "down",
  className = "",
}: DisclosureChevronProps) {
  if (direction === "right") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className={`h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-accent ${className}`.trim()}
      >
        <path
          d="M7.5 5L12.5 10L7.5 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      } ${className}`.trim()}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
