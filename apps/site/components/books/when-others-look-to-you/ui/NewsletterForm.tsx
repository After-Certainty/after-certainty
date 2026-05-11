"use client";

import { useState } from "react";

export type NewsletterFormProps = {
  /** Uppercase eyebrow (gold in parent layout) */
  heading?: string;
  /** Element id for the heading (pair with `aria-labelledby` on a wrapping region). */
  headingId?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
};

const defaultHeading = "Get updates";
const defaultDescription =
  "Occasional notes—no spam. Unsubscribe anytime.";
const defaultPlaceholder = "you@example.com";
const defaultSubmit = "Subscribe";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function NewsletterForm({
  heading = defaultHeading,
  headingId,
  description = defaultDescription,
  placeholder = defaultPlaceholder,
  submitLabel = defaultSubmit,
}: NewsletterFormProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "success") return;

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data: { error?: string } = {};
      try {
        data = (await res.json()) as { error?: string };
      } catch {
        /* non-JSON response */
      }

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          typeof data.error === "string"
            ? data.error
            : "Could not subscribe. Please try again.",
        );
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const isBusy = status === "loading";
  const isDone = status === "success";

  return (
    <div className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-soft">
      <h3
        id={headingId}
        className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold"
      >
        {heading}
      </h3>
      <p className="mt-2 body-sm text-neutral-600">{description}</p>
      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <label htmlFor="subscribe-email" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={placeholder}
          disabled={isBusy || isDone}
          className="min-h-[44px] w-full flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-inner transition-colors duration-200 placeholder:text-neutral-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/35 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isBusy || isDone}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-brand-gold px-6 py-2.5 text-xs font-semibold tracking-wide text-brand-navy shadow-sm transition-all duration-200 ease-out hover:bg-brand-gold/92 hover:shadow active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:pointer-events-none disabled:opacity-60 sm:text-sm"
        >
          {isBusy ? "Subscribing…" : isDone ? "Subscribed" : submitLabel}
        </button>
      </form>

      {status === "success" ? (
        <p className="mt-3 body-sm text-neutral-700" role="status">
          You&apos;re on the list. Thanks for subscribing.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p className="mt-3 body-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
