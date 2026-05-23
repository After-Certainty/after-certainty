"use client";

import Link from "next/link";

import { useConsent } from "@/components/consent/consent-provider";

export function CookieBanner() {
  const { consent, acceptAnalytics, rejectAnalytics } = useConsent();

  if (consent !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-bg-elevated/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p id="cookie-banner-title" className="text-sm font-medium text-fg">
            Cookies & analytics
          </p>
          <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed text-muted">
            We use Google Analytics to understand how visitors use this site. Analytics cookies are off until you
            choose. See our{" "}
            <Link href="/privacy" className="text-accent underline-offset-4 hover:underline">
              privacy & cookies
            </Link>{" "}
            page for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={rejectAnalytics}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border/70 px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={acceptAnalytics}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-accent/55 bg-accent-soft px-5 py-2.5 text-sm text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
