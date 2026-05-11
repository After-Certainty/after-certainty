"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * `next-themes` can resolve the theme on the client before hydration finishes, which
 * would make the first client render (button) differ from the server HTML (placeholder).
 * We render the static placeholder until the client has mounted; then we read the theme.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only: keep SSR + first client paint identical to avoid hydration errors.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration gate
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-9 w-10 items-center justify-center rounded-sm border border-border/60 text-xs text-muted"
        aria-hidden
      >
        ···
      </span>
    );
  }

  if (!resolvedTheme) {
    return (
      <span
        className="inline-flex h-9 w-10 items-center justify-center rounded-sm border border-border/60 text-xs text-muted"
        aria-hidden
      >
        ···
      </span>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-sm border border-border/60 px-3 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activate light appearance" : "Activate dark appearance"}
    >
      <span aria-hidden className="text-accent">
        {isDark ? "◐" : "◑"}
      </span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
