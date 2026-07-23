import type { HTMLAttributes, ReactNode } from "react";

type ExploreCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ExploreCard({ children, className = "", ...rest }: ExploreCardProps) {
  return (
    <div
      className={`group min-w-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/30 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-accent/35 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
