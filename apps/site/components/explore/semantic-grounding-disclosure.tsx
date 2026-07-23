import Link from "next/link";

import type { PublicGroundingViewModel } from "@/lib/graph/grounding";

type SemanticGroundingDisclosureProps = {
  grounding: PublicGroundingViewModel;
};

/**
 * Restrained provenance disclosure for pattern / concept detail pages.
 */
export function SemanticGroundingDisclosure({ grounding }: SemanticGroundingDisclosureProps) {
  const hasSupport = grounding.supportingWorks.length > 0 || grounding.supportingSources.length > 0;

  return (
    <aside className="mt-10 max-w-2xl border-t border-border/30 pt-8" aria-label="Grounding">
      <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Grounding</p>
      <p className="mt-2 font-display text-lg font-medium tracking-tight text-fg">
        {grounding.label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{grounding.description}</p>

      {hasSupport ? (
        <details className="group mt-4">
          <summary className="cursor-pointer list-none text-sm text-accent marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Developed through</span>
            <span className="hidden group-open:inline">Hide supporting works</span>
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {grounding.supportingWorks.map((work) => (
              <li key={work.slug}>
                <Link
                  href={work.href}
                  className="text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {work.title}
                </Link>
              </li>
            ))}
            {grounding.supportingSources.map((source) => (
              <li key={source.slug}>
                {source.external ? (
                  <a
                    href={source.href}
                    className="text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link
                    href={source.href}
                    className="text-fg underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {source.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </aside>
  );
}
