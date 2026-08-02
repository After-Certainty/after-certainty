"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function useLocationHash(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("hashchange", handler);
      return () => window.removeEventListener("hashchange", handler);
    },
    () => window.location.hash,
    () => "",
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
}

function sectionUrl(pathname: string, fragmentId?: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base = `${origin}${pathname}`;
  const fragment = fragmentId?.replace(/^#/, "").trim();
  return fragment ? `${base}#${fragment}` : base;
}

type CopySectionLinkControlProps = {
  /** Chapter pathname without fragment (e.g. routeKey). */
  chapterPath: string;
};

/**
 * Copies the current chapter URL, including `#` section when present (READ-015).
 */
export function CopySectionLinkControl({ chapterPath }: CopySectionLinkControlProps) {
  const isClient = useIsClient();
  const hash = useLocationHash();
  const [feedback, setFeedback] = useState<{
    kind: "copied" | "error";
    atHash: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const onCopy = useCallback(async () => {
    const fragment = hash.replace(/^#/, "").trim() || undefined;
    const url = sectionUrl(chapterPath, fragment);
    const ok = await copyText(url);
    setFeedback({ kind: ok ? "copied" : "error", atHash: hash });
  }, [chapterPath, hash]);

  if (!isClient) return null;

  const hasSection = Boolean(hash.replace(/^#/, "").trim());
  const activeFeedback = feedback?.atHash === hash ? feedback : null;
  const label =
    activeFeedback?.kind === "copied"
      ? "Link copied"
      : activeFeedback?.kind === "error"
        ? "Copy failed"
        : hasSection
          ? "Copy section link"
          : "Copy chapter link";

  return (
    <button
      type="button"
      className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      data-testid="copy-section-link"
      aria-live="polite"
      onClick={() => {
        void onCopy();
      }}
    >
      {label}
    </button>
  );
}

const HEADING_SELECTOR = "h2[id], h3[id], h4[id], h5[id], h6[id]";

/**
 * Adds per-heading “Copy link” controls inside the manuscript body (READ-015).
 */
export function ManuscriptHeadingCopyLinks() {
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const root = document.getElementById("chapter-content");
    if (!root) return;

    const enhanced = new WeakSet<Element>();
    const cleanups: Array<() => void> = [];

    const enhance = () => {
      const headings = root.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
      headings.forEach((heading) => {
        if (enhanced.has(heading)) return;
        const id = heading.id?.trim();
        if (!id) return;
        enhanced.add(heading);

        heading.classList.add("group/heading", "relative");

        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "ms-2 inline-flex align-middle text-[10px] uppercase tracking-[0.16em] text-muted opacity-0 underline-offset-2 transition-opacity hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover/heading:opacity-100 focus-visible:opacity-100";
        button.textContent = "Copy link";
        button.setAttribute(
          "aria-label",
          `Copy link to ${heading.textContent?.trim() || "section"}`,
        );
        button.dataset.testid = "heading-copy-link";

        const onClick = async (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const url = sectionUrl(window.location.pathname, id);
          const ok = await copyText(url);
          const previous = button.textContent;
          button.textContent = ok ? "Copied" : "Failed";
          window.setTimeout(() => {
            button.textContent = previous;
          }, 1600);
          if (ok && window.location.hash !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
            window.dispatchEvent(new Event("hashchange"));
          }
        };

        button.addEventListener("click", onClick);
        heading.appendChild(button);
        cleanups.push(() => {
          button.removeEventListener("click", onClick);
          button.remove();
        });
      });
    };

    enhance();
    const observer = new MutationObserver(() => enhance());
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, [isClient]);

  return null;
}

/** Test helper — builds absolute section URLs the same way the UI does. */
export function buildSectionShareUrl(pathname: string, fragmentId?: string): string {
  return sectionUrl(pathname, fragmentId);
}
