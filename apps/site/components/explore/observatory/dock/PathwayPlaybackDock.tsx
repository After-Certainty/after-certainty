"use client";

import Link from "next/link";

import { ExplorePathwayReturnLink } from "@/components/paths/explore-pathway-link";
import {
  exploreObservatoryPathwayHref,
  EXPLORE_PATHWAY_STEP_PARAM,
} from "@/lib/graph/explorePaths";
import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { nextPathwayStepIndex, previousPathwayStepIndex } from "@/lib/observatory/traversalEngine";
import { pathwayStepHrefParam } from "@/lib/observatory/pathwayFromContent";
import type { Pathway } from "@/types/observatory";

type PathwayPlaybackDockProps = {
  index: GraphIndex;
  pathway: Pathway;
  stepIndex: number;
  onStepChange: (stepIndex: number) => void;
  compact?: boolean;
};

export function PathwayPlaybackDock({
  index,
  pathway,
  stepIndex,
  onStepChange,
  compact = false,
}: PathwayPlaybackDockProps) {
  const step = pathway.steps[stepIndex];
  const totalSteps = pathway.steps.length;
  const hasPrevious = stepIndex > 0;
  const hasNext = stepIndex < totalSteps - 1;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? (
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Reading pathway</p>
      ) : null}
      <div>
        <p className="font-display text-sm text-fg">{pathway.title}</p>
        <p className="mt-1 text-xs text-muted">
          Step {step?.stopIndex ?? stepIndex + 1} of {totalSteps}
          {step?.canonicalId
            ? (() => {
                const node = index.getNodeByCanonicalId(step.canonicalId);
                return node ? ` · ${graphNodeTitle(node)}` : "";
              })()
            : step
              ? ` · ${step.title}`
              : ""}
        </p>
      </div>
      {step?.caption ? <p className="text-xs leading-relaxed text-muted">{step.caption}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-10 rounded-sm border border-border/60 px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40"
          disabled={!hasPrevious}
          onClick={() => onStepChange(previousPathwayStepIndex(stepIndex, totalSteps))}
        >
          Previous
        </button>
        <button
          type="button"
          className="min-h-10 rounded-sm border border-border/60 px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40"
          disabled={!hasNext}
          onClick={() => onStepChange(nextPathwayStepIndex(stepIndex, totalSteps))}
        >
          Next
        </button>
        {step ? (
          <Link
            href={exploreObservatoryPathwayHref({
              kind: pathway.sourceType,
              slug: pathway.slug,
              step: pathwayStepHrefParam(step),
            })}
            className="min-h-10 rounded-sm border border-border/60 px-3 py-2 text-xs uppercase tracking-[0.16em] text-accent transition-colors hover:border-accent/40"
          >
            Share step
          </Link>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        <ExplorePathwayReturnLink href={pathway.sourceHref} title={pathway.title} />
      </p>
      {!step?.canonicalId ? (
        <p className="text-xs text-muted">
          This stop is not in the semantic graph; use Previous/Next to move through the curated
          sequence.
        </p>
      ) : null}
    </div>
  );
}

export function pathwayStepSearchParam(step: Pathway["steps"][number] | undefined): string | null {
  if (!step) return null;
  return String(pathwayStepHrefParam(step));
}

export { EXPLORE_PATHWAY_STEP_PARAM };
