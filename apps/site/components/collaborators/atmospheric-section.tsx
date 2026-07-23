import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AtmosphericVariant = "hero" | "subtle" | "quoteBand";

type AtmosphericSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: AtmosphericVariant;
  as?: "section" | "div";
};

const variantLayers: Record<
  AtmosphericVariant,
  { grain: string; topology: string; bloom: string; vignette?: string }
> = {
  hero: {
    grain: "opacity-[0.028] md:opacity-[0.038]",
    topology: "opacity-[0.035] md:opacity-[0.055]",
    bloom: "opacity-[0.05] md:opacity-[0.065]",
    vignette: "opacity-[0.48] md:opacity-[0.58]",
  },
  subtle: {
    grain: "opacity-[0.022] md:opacity-[0.032]",
    topology: "opacity-[0.03] md:opacity-[0.048]",
    bloom: "opacity-[0.035] md:opacity-[0.052]",
  },
  quoteBand: {
    grain: "opacity-[0.032] md:opacity-[0.045]",
    topology: "opacity-[0.04] md:opacity-[0.06]",
    bloom: "opacity-[0.055] md:opacity-[0.075]",
    vignette: "opacity-[0.35] md:opacity-[0.42]",
  },
};

/**
 * Local texture stack — complements global html grain/paper; kept lighter on small screens.
 */
export function AtmosphericSection({
  children,
  className,
  variant = "subtle",
  as: Tag = "section",
  ...rest
}: AtmosphericSectionProps) {
  const layers = variantLayers[variant];

  return (
    <Tag className={cn("relative isolate overflow-hidden", className)} {...rest}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-texture-grain bg-cover bg-center mix-blend-soft-light",
          layers.grain,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-texture-topology-fade-start bg-cover bg-left mix-blend-soft-light",
          layers.topology,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-texture-light-bloom bg-cover bg-center mix-blend-soft-light",
          layers.bloom,
        )}
        aria-hidden
      />
      {layers.vignette ? (
        <div className={cn("atm-vignette-soft pointer-events-none absolute inset-0 z-[1]", layers.vignette)} aria-hidden />
      ) : null}
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
