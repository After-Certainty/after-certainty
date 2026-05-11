import { cn } from "@/lib/books/when-others-look-to-you/cn";

export type SectionVariant = "light" | "dark";

/** Shared outer styles for full-bleed sections that don’t use `<Section>` (e.g. split layouts). */
export const sectionVariantSurface: Record<SectionVariant, string> = {
  light:
    "border-b border-neutral-200/80 bg-[color:var(--color-brand-paper)] text-neutral-900",
  dark:
    "border-b border-white/10 bg-gradient-to-b from-brand-navy from-[15%] via-[#071522] to-brand-navy text-zinc-200",
};

type SectionProps = {
  children: React.ReactNode;
  id?: string;
  variant?: SectionVariant;
  className?: string;
};

const paddingClass =
  "px-[var(--padding-inline-section)] py-10 sm:py-section-md md:py-section-lg";

/**
 * Page section shell: alternating surfaces + consistent vertical padding.
 */
export function Section({
  children,
  id,
  variant = "dark",
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(paddingClass, sectionVariantSurface[variant], className)}
    >
      {children}
    </section>
  );
}
