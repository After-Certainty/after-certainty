"use client";

import { useEffect } from "react";

import { trackBooksCatalogView } from "@/lib/analytics/track-books-catalog";

export function BooksCatalogAnalytics() {
  useEffect(() => {
    trackBooksCatalogView();
  }, []);

  return null;
}
