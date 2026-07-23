import type { HTMLAttributes } from "react";

type Tone = "default" | "muted" | "accent";

const tones: Record<Tone, string> = {
  default: "text-fg",
  muted: "text-muted",
  accent: "text-accent",
};

export function BodyText({
  tone = "default",
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { tone?: Tone }) {
  return <p className={`text-base leading-relaxed md:text-lg ${tones[tone]} ${className}`} {...props} />;
}
