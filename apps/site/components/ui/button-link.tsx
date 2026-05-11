import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "border border-accent/60 bg-accent-soft px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent shadow-[0_0_24px_var(--glow)] transition-colors hover:bg-accent/15",
  ghost:
    "border border-border/80 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
