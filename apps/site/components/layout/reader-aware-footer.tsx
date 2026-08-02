"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";

/**
 * Omits site footer on chapter reader routes so the reading surface stays focused (Phase E).
 * Server footer is passed as children so async SiteFooter stays a Server Component.
 */
export function ReaderAwareFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isChapterReaderPath(pathname)) return null;
  return children;
}
