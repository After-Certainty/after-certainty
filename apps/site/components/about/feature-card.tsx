import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  className?: string;
};

export function FeatureCard({ title, description, icon, href, className }: FeatureCardProps) {
  const body = (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-sm opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.06] md:opacity-[0.05]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-texture-topology bg-cover bg-center mix-blend-soft-light" />
      </div>
      <div className="relative flex gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border/30 bg-bg/[0.35] text-muted transition-colors duration-300 group-hover:border-accent/22 group-hover:text-accent"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg tracking-tight text-fg">{title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
          {href ? (
            <span className="mt-4 inline-block text-[11px] uppercase tracking-[0.18em] text-accent transition-colors group-hover:text-fg">
              Explore →
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group relative block rounded-sm border border-border/35 bg-bg-elevated/[0.06] p-6 transition-colors duration-300 md:p-7",
          "hover:border-accent/20 hover:bg-bg-elevated/[0.09]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className,
        )}
      >
        {body}
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "group relative rounded-sm border border-border/35 bg-bg-elevated/[0.06] p-6 transition-colors duration-300 md:p-7",
        "hover:border-accent/20 hover:bg-bg-elevated/[0.09]",
        className,
      )}
    >
      {body}
    </article>
  );
}
