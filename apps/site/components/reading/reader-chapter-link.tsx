"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import type { LinkAnalytics } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";
import { trackNextChapter } from "@/lib/analytics/track-reader";
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
          if (
            analytics.event === AnalyticsEvents.nextChapter &&
            typeof analytics.params?.book_id === "string" &&
            typeof analytics.params?.from_chapter_id === "string" &&
            typeof analytics.params?.to_chapter_id === "string"
          ) {
            trackNextChapter({
              book_id: analytics.params.book_id,
              from_chapter_id: analytics.params.from_chapter_id,
              to_chapter_id: analytics.params.to_chapter_id,
            });
          } else {
            trackEvent(analytics.event, analytics.params);
          }
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
