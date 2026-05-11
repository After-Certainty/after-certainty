import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  href?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Do not pass `<a>` / `<Link>` here when `href` is set — the card root is already a link. */
  footer?: ReactNode;
};

export function Card({
  href,
  eyebrow,
  title,
  description,
  footer,
  className = "",
  ...props
}: CardProps) {
  const inner = (
    <>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      ) : null}
      <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
        {title}
      </h3>
      {description ? <p className="mt-3 text-base leading-relaxed text-muted">{description}</p> : null}
      {footer ? <div className="mt-6">{footer}</div> : null}
    </>
  );

  const shellClass = `group relative overflow-hidden rounded-sm border border-border/80 bg-bg-elevated/35 p-6 shadow-[0_0_0_1px_var(--glow)] backdrop-blur-sm transition-colors hover:border-accent/35 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${shellClass} block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
        {inner}
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        </span>
      </Link>
    );
  }

  return (
    <div className={shellClass} {...props}>
      {inner}
    </div>
  );
}
