import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

export type EditorialSectionProps = {
  eyebrow?: string;
  heading?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Narrow editorial column (default true) */
  prose?: boolean;
};

export function EditorialSection({
  eyebrow,
  heading,
  children,
  className,
  id,
  prose = true,
}: EditorialSectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-28", className)}>
      <Container>
        <div className={cn(prose && "mx-auto max-w-2xl")}>
          {eyebrow ? <p className="text-xs uppercase tracking-[0.42em] text-muted">{eyebrow}</p> : null}
          {heading ? (
            <h2 className={cn("font-display text-3xl tracking-tight text-fg md:text-4xl", eyebrow && "mt-6")}>
              {heading}
            </h2>
          ) : null}
          <div
            className={cn(
              "text-[17px] leading-[1.75] text-muted md:text-lg",
              heading || eyebrow ? "mt-10 space-y-6" : "space-y-6",
            )}
          >
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
