import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export type CTAButtonProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

const base =
  "inline-flex min-h-[44px] items-center justify-center rounded-sm px-5 py-2.5 text-sm font-normal tracking-[0.06em] transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function CTAButton({ href, variant = "primary", className, children, ...rest }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        variant === "primary" &&
          "border border-accent/35 bg-accent-soft/80 text-fg hover:border-accent/50 hover:bg-accent-soft",
        variant === "secondary" &&
          "border border-border/55 bg-bg-elevated/[0.12] text-fg hover:border-accent/30 hover:bg-bg-elevated/[0.18]",
        variant === "quiet" && "border border-transparent text-muted hover:border-border/40 hover:text-fg",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
