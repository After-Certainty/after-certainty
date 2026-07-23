import type { PublicStatusKind } from "@/lib/books/public-status";

type StatusLabelProps = {
  label: string;
  kind?: PublicStatusKind;
  className?: string;
};

const KIND_CLASS: Record<PublicStatusKind, string> = {
  upcoming: "border-border/60 text-muted",
  companion: "border-border/60 text-muted",
  superseded: "border-border/60 text-muted",
  revised: "border-border/60 text-muted",
};

/**
 * Text status/edition chip — meaning does not depend on color alone.
 */
export function StatusLabel({ label, kind = "upcoming", className }: StatusLabelProps) {
  return (
    <span
      className={[
        "inline-flex rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]",
        KIND_CLASS[kind],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
    >
      {label}
    </span>
  );
}
