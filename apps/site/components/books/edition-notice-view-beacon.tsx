"use client";

import { useEffect } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

type EditionNoticeViewBeaconProps = {
  bookId: string;
  notice: string;
};

/** Fires once when an edition/status notice is shown on a book page. */
export function EditionNoticeViewBeacon({ bookId, notice }: EditionNoticeViewBeaconProps) {
  useEffect(() => {
    trackEvent(AnalyticsEvents.editionNoticeView, {
      book_id: bookId,
      notice,
    });
  }, [bookId, notice]);

  return null;
}
