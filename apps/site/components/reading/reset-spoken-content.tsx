"use client";

import { useEffect } from "react";

import { cancelSpokenContent } from "@/lib/reading/navigate-chapter";

type ResetSpokenContentProps = {
  /** Changes when the reader opens a different chapter. */
  chapterId: string;
  chapterTitle: string;
};

/**
 * Clears Web Speech API utterances when a chapter mounts and announces the
 * new chapter for assistive tech. Complements full-document chapter links for
 * Mobile Safari Listen to Page / Speak Screen.
 */
export function ResetSpokenContent({ chapterId, chapterTitle }: ResetSpokenContentProps) {
  useEffect(() => {
    cancelSpokenContent();
  }, [chapterId]);

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {chapterTitle}
    </p>
  );
}
