import type { HTMLAttributes } from "react";

type Level = 1 | 2 | 3;

const sizes: Record<Level, string> = {
  1: "font-display text-4xl tracking-tight text-fg md:text-5xl lg:text-6xl",
  2: "font-display text-3xl tracking-tight text-fg md:text-4xl",
  3: "font-display text-2xl tracking-tight text-fg md:text-3xl",
};

export function DisplayHeading({
  level = 1,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: Level }) {
  const merged = `${sizes[level]} ${className}`;

  if (level === 2) {
    return <h2 className={merged} {...props} />;
  }

  if (level === 3) {
    return <h3 className={merged} {...props} />;
  }

  return <h1 className={merged} {...props} />;
}
