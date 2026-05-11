import type { ReactNode } from "react";

export function ThemeTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/55 bg-bg-elevated/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-colors duration-500 hover:border-accent/35 hover:text-fg">
      {children}
    </span>
  );
}
