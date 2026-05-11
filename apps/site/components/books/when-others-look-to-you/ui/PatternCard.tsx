import Link from "next/link";
import { cn } from "@/lib/books/when-others-look-to-you/cn";

export type PatternCardTone = "blue" | "teal" | "gold";

const toneStyles: Record<PatternCardTone, string> = {
  blue: "border-t-[3px] border-t-[#3d5a80]",
  teal: "border-t-[3px] border-t-brand-teal",
  gold: "border-t-[3px] border-t-brand-gold",
};

const iconShell: Record<PatternCardTone, string> = {
  blue: "bg-[#e8eef6] text-[#2d4a6e]",
  teal: "bg-brand-teal/15 text-brand-teal",
  gold: "bg-brand-gold/15 text-brand-gold",
};

function PatternIcon({ tone }: { tone: PatternCardTone }) {
  const cls = "h-6 w-6";
  if (tone === "blue") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  if (tone === "teal") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 4s7 7 7 12a7 7 0 11-14 0c0-5 7-12 7-12z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l2.4 7.4h7.8l-6.3 4.6 2.4 7.4L12 17.8 5.7 22.4l2.4-7.4L2 10.4h7.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type PatternCardProps = {
  number: string;
  title: string;
  description: string;
  exploreHref: string;
  tone: PatternCardTone;
};

export function PatternCard({
  number,
  title,
  description,
  exploreHref,
  tone,
}: PatternCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col rounded-xl border border-neutral-200/90 bg-white p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft-hover sm:p-7",
        toneStyles[tone],
      )}
    >
      <div
        className={cn(
          "mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-[1.03]",
          iconShell[tone],
        )}
      >
        <PatternIcon tone={tone} />
      </div>

      <div className="space-y-2">
        <p className="body-sm font-semibold tabular-nums tracking-wide text-neutral-400">
          {number}
        </p>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold leading-snug tracking-tight text-neutral-900">
          {title}
        </h3>
      </div>

      <p className="mt-4 flex-1 body-sm leading-relaxed text-neutral-600">
        {description}
      </p>

      <Link
        href={exploreHref}
        className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-navy/90 transition-colors duration-200 ease-out hover:text-brand-gold"
      >
        EXPLORE
        <span
          aria-hidden
          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </article>
  );
}
