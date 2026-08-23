/**
 * Substack stack mark (monochrome).
 * Path matches Simple Icons / Substack’s classic brand symbol.
 * Brand assets: https://substack.com/brand
 * Simple Icons: https://simpleicons.org/?q=substack
 */
export function SubstackSymbol({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className ? `shrink-0 ${className}` : "shrink-0"}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"
      />
    </svg>
  );
}
