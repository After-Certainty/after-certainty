"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import type { LinkAnalytics } from "@/components/analytics/tracked-link";
import { trackEvent } from "@/lib/analytics/track";
import { navigateToChapter } from "@/lib/reading/navigate-chapter";

type ReaderChapterLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  analytics?: LinkAnalytics;
};

/**
 * Chapter-to-chapter link that forces a full document load.
 * Uses preventDefault + location.assign so Next.js cannot soft-navigate the
 * click (soft nav leaves Speak Screen / Listen to Page stuck on the prior chapter).
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
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigateToChapter(href);
      }}
    >
      {children}
    </a>
  );
}
