"use client";

import { useId, useState, type ReactNode } from "react";

type ExploreIndexGroupProps = {
  title: string;
  countLabel: string;
  description?: string;
  /** When true, the mobile accordion starts expanded. */
  defaultOpen?: boolean;
  children: ReactNode;
  /** Stable slug for heading ids (defaults from title). */
  id?: string;
};

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ExploreIndexGroup({
  title,
  countLabel,
  description,
  defaultOpen = false,
  children,
  id,
}: ExploreIndexGroupProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const slug = id ?? slugify(title);
  const mobileHeadingId = `explore-group-${slug}-heading`;
  const desktopHeadingId = `explore-group-${slug}-heading-desktop`;

  return (
    // Avoid Section's default py-20 — it fights compact mobile accordion rows.
    <section className="border-b border-border/35 py-0 md:border-b-0 md:py-0" aria-label={title}>
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 flex-1 leading-tight">
          <h2 id={mobileHeadingId} className="font-display text-lg font-medium tracking-tight text-fg">
            {title}
          </h2>
          <span className="mt-0.5 block text-[11px] leading-none text-muted">{countLabel}</span>
        </span>
        <Chevron expanded={open} />
      </button>

      <div className="hidden space-y-3 md:block">
        <h2
          id={desktopHeadingId}
          className="font-display text-2xl font-medium tracking-tight text-fg"
        >
          {title}
        </h2>
        {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
      </div>

      <div
        id={panelId}
        className={open ? "block md:block" : "hidden md:block"}
        role="region"
        aria-label={title}
      >
        {description ? (
          <p className="pb-2 max-w-2xl text-sm text-muted md:hidden">{description}</p>
        ) : null}
        <div className="mt-2 md:mt-5">{children}</div>
      </div>
    </section>
  );
}
