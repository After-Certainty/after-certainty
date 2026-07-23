import type { HTMLAttributes } from "react";

export type SectionAtmosphere = "none" | "transition" | "quote";

export function Section({
  className = "",
  id,
  atmosphere = "none",
  ...props
}: HTMLAttributes<HTMLElement> & { atmosphere?: SectionAtmosphere }) {
  const atm =
    atmosphere === "none" ? "" : `atm-section atm-section--${atmosphere}`;

  return <section id={id} className={`py-20 md:py-28 ${atm} ${className}`} {...props} />;
}
