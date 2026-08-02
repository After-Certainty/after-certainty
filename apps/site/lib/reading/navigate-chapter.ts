/**
 * Full-document chapter navigation for the native reader.
 *
 * Mobile Safari “Listen to Page” / Speak Screen binds to a document snapshot.
 * Next.js soft navigations swap chapter HTML in place, so speech can stay stuck
 * on the previous chapter until a real page load occurs. Prefer this helper
 * (or a plain <a>) for chapter→chapter moves inside the reader.
 */

export function cancelSpokenContent(): void {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // speechSynthesis can throw when unavailable or mid-teardown.
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
