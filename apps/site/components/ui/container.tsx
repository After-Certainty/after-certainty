import type { HTMLAttributes } from "react";

export function Container({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 ${className}`} {...props} />
  );
}
