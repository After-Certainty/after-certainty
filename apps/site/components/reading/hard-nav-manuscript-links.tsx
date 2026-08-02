"use client";

import { useEffect } from "react";

import { isChapterReaderPath } from "@/lib/reading/is-chapter-reader-path";
import { navigateToChapter } from "@/lib/reading/navigate-chapter";

/**
 * Forces full-document navigation for in-manuscript chapter links
 * (e.g. Contents pages), so Mobile Safari Listen to Page / Speak Screen
 * rescans the destination instead of soft-navigating in place.
 */
export function HardNavManuscriptLinks({ contentId = "chapter-content" }: { contentId?: string }) {
  useEffect(() => {
    const root = document.getElementById(contentId);
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement) || !root.contains(anchor)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!isChapterReaderPath(url.pathname)) return;

      event.preventDefault();
      event.stopPropagation();
      navigateToChapter(`${url.pathname}${url.search}${url.hash}`);
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [contentId]);

  return null;
}
