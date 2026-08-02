"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import type { LinkAnalytics } from "@/components/analytics/tracked-link";
import { trackEvent } from "@/lib/analytics/track";
import { cancelSpokenContent } from "@/lib/reading/navigate-chapter";

type ReaderChapterLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  analytics?: LinkAnalytics;
};

/**
 * Chapter-to-chapter link that forces a full document load (plain anchor).
 * Avoids Next.js soft navigation so Mobile Safari Listen to Page / Speak Screen
 * picks up the new chapter instead of staying on the previous one.
 */
export function ReaderChapterLink({
  href,
  analytics,
  onClick,
  children,
  ...props
}: ReaderChapterLinkProps) {
  return (
    <a
      {...props}
      href={href}
      data-reader-hard-nav=""
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // Modified clicks (new tab, download, etc.) keep native browser behavior.
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          onClick?.(event);
          return;
        }
        if (analytics) {
          trackEvent(analytics.event, analytics.params);
        }
        cancelSpokenContent();
        onClick?.(event);
        // Do not preventDefault — allow the browser to perform a full navigation.
      }}
    >
      {children}
    </a>
  );
}
