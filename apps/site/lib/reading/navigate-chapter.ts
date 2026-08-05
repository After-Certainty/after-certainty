/**
 * Full-document chapter navigation for the native reader.
 *
 * Mobile Safari “Listen to Page” / Speak Screen binds to a document snapshot.
 * Next.js soft navigations swap chapter HTML in place, so speech can stay stuck
 * on the previous chapter until a real page load occurs. Prefer this helper
 * (or a plain <a>) for chapter→chapter moves inside the reader.
 */

const chapterAudioElements = new Set<HTMLAudioElement>();

/** Register a chapter TTS <audio> element so nav cleanup can pause it. */
export function registerChapterAudioElement(el: HTMLAudioElement): () => void {
  chapterAudioElements.add(el);
  return () => {
    chapterAudioElements.delete(el);
  };
}

export function cancelSpokenContent(): void {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // speechSynthesis can throw when unavailable or mid-teardown.
  }
  for (const el of chapterAudioElements) {
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // Element may already be detached.
    }
  }
}

/** Full document navigation to another chapter (or any same-origin reader URL). */
export function navigateToChapter(href: string): void {
  if (typeof window === "undefined") return;
  cancelSpokenContent();
  const next = href.trim();
  if (!next) return;
  window.location.assign(next);
}
