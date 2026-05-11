"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = { readonly href: string; readonly label: string };

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border/60 text-fg transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Portal avoids header `backdrop-blur` turning fixed layers into header-bound overlays */}
            <button
              type="button"
              className="fixed inset-0 z-[500] bg-bg/75 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
              onClick={close}
            />
            <div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="fixed inset-y-0 right-0 z-[501] flex w-[min(100vw-2.5rem,19rem)] flex-col border-l border-border/60 bg-bg shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <span className="text-xs uppercase tracking-[0.22em] text-muted">Menu</span>
                <button
                  type="button"
                  className="rounded-sm px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={close}
                >
                  Close
                </button>
              </div>
              <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-sm px-3 py-3 text-sm uppercase tracking-[0.18em] text-fg transition-colors hover:bg-accent-soft/40 hover:text-accent"
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
