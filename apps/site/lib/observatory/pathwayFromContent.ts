import type { EnrichedPathStop } from "@/types/paths";
import type { Pathway, PathwaySourceType } from "@/types/observatory";

export function pathwayFromEnrichedStops(input: {
  id: string;
  slug: string;
  title: string;
  description: string;
  sourceType: PathwaySourceType;
  sourceHref: string;
  stops: EnrichedPathStop[];
}): Pathway {
  const sorted = [...input.stops].sort((a, b) => a.position - b.position);

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    sourceType: input.sourceType,
    sourceHref: input.sourceHref,
    steps: sorted.map((stop, index) => ({
      position: stop.position,
      stopIndex: index + 1,
      canonicalId: stop.external ? null : stop.resolvedEntityId,
      title: stop.title,
      caption: stop.whyThisFollows ?? stop.description,
    })),
  };
}

export function pathwayGraphNodeIds(pathway: Pathway): string[] {
  return pathway.steps.map((step) => step.canonicalId).filter((id): id is string => Boolean(id));
}

export function undirectedPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function pathwayGraphPairKeys(nodeIds: readonly string[]): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    keys.add(undirectedPairKey(nodeIds[i]!, nodeIds[i + 1]!));
  }
  return keys;
}

export function resolvePathwayStepIndex(pathway: Pathway, stepParam: string | null): number {
  if (!stepParam) return 0;
  const parsed = Number.parseInt(stepParam, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  const byPosition = pathway.steps.findIndex((step) => step.position === parsed);
  if (byPosition >= 0) return byPosition;
  return Math.min(Math.max(parsed - 1, 0), pathway.steps.length - 1);
}

export function pathwayStepHrefParam(step: Pathway["steps"][number]): number {
  return step.position;
}
