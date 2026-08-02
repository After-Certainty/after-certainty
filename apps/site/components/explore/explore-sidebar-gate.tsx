"use client";

import { usePathname } from "next/navigation";

import { ExploreSidebar } from "@/components/explore/explore-sidebar";
import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";

/** Hides Explore section nav on native chapter reader routes (Phase E focused chrome). */
export function ExploreSidebarGate() {
  const pathname = usePathname();
  if (isChapterReaderPath(pathname)) return null;
  return <ExploreSidebar />;
}
