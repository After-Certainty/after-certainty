import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CollaborationCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
};

export function CollaborationCard({ title, description, icon, className }: CollaborationCardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-sm border border-border/35 bg-bg-elevated/[0.06] p-6 transition-colors duration-300 md:p-7",
        "hover:border-accent/22 hover:bg-bg-elevated/[0.1]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-sm opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.08] md:opacity-[0.06]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-texture-topology bg-cover bg-center mix-blend-soft-light" />
      </div>
      <div className="relative flex gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border/30 bg-bg/[0.35] text-muted transition-colors duration-300 group-hover:border-accent/25 group-hover:text-accent"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg tracking-tight text-fg">{title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
        </div>
      </div>
    </article>
  );
}
