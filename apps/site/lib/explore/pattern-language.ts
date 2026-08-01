import type { GraphIndex } from "@/lib/graph/graph";
import type { OrganizingForce, Pattern } from "@/types/semanticGraph";

/** Patterns that participate in a typed pattern language (master or supporting). */
export function isPatternLanguagePattern(pattern: Pattern): boolean {
  return pattern.patternRole === "master" || pattern.patternRole === "supporting";
}

export function getForceForPattern(
  index: GraphIndex,
  pattern: Pattern,
): OrganizingForce | null {
  const slug = pattern.organizingForce?.trim();
  if (!slug) return null;
  return index.forceBySlug.get(slug) ?? null;
}

export function getMasterPattern(index: GraphIndex): Pattern | null {
  return index.graph.patterns.find((p) => p.patternRole === "master") ?? null;
}

export function supportingPatternsForForce(
  index: GraphIndex,
  forceSlug: string,
): Pattern[] {
  return index.graph.patterns
    .filter((p) => p.patternRole === "supporting" && p.organizingForce === forceSlug)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function realityDynamicLabel(dynamic: Pattern["realityDynamic"]): string | null {
  if (dynamic === "obscuring") return "Obscuring dynamic";
  if (dynamic === "corrective") return "Corrective dynamic";
  return null;
}

export function patternRoleLabel(role: Pattern["patternRole"]): string | null {
  if (role === "master") return "Master pattern";
  if (role === "supporting") return "Supporting pattern";
  return null;
}

/** Forces ordered Perception → Power → Time → Contact when present; otherwise title order. */
export function forcesInCycleOrder(index: GraphIndex): OrganizingForce[] {
  const preferred = ["perception", "power", "time", "contact"];
  const bySlug = index.forceBySlug;
  const ordered: OrganizingForce[] = [];
  for (const slug of preferred) {
    const force = bySlug.get(slug);
    if (force) ordered.push(force);
  }
  const seen = new Set(ordered.map((f) => f.slug));
  for (const force of index.graph.forces ?? []) {
    if (!seen.has(force.slug)) ordered.push(force);
  }
  return ordered;
}
