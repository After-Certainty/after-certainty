import type {
  GlossaryConcept,
  Pattern,
  SelectedConceptRole,
  SelectedPatternRole,
} from "@/types/semanticGraph";

export type SelectedConceptWithRole = {
  concept: GlossaryConcept;
  roleInWork?: string;
};

export type SelectedPatternWithRole = {
  pattern: Pattern;
  roleInWork?: string;
};

/**
 * Join curated selected concept ids with optional work-specific roles.
 * Preserves editorial order from selectedConceptIds. Does not invent roles.
 */
export function resolveSelectedConceptsWithRoles(input: {
  selectedConceptIds: readonly string[];
  roles?: readonly SelectedConceptRole[] | undefined;
  conceptsById: Map<string, GlossaryConcept>;
}): SelectedConceptWithRole[] {
  const roleById = new Map((input.roles ?? []).map((r) => [r.conceptId, r.roleInWork] as const));
  const out: SelectedConceptWithRole[] = [];
  for (const id of input.selectedConceptIds) {
    const concept = input.conceptsById.get(id);
    if (!concept) continue;
    const roleInWork = roleById.get(id)?.trim() || undefined;
    out.push({ concept, roleInWork });
  }
  return out;
}

/**
 * Join curated selected pattern ids with optional work-specific roles.
 * Preserves editorial order from selectedPatternIds.
 */
export function resolveSelectedPatternsWithRoles(input: {
  selectedPatternIds: readonly string[] | undefined;
  roles?: readonly SelectedPatternRole[] | undefined;
  patternsById: Map<string, Pattern>;
}): SelectedPatternWithRole[] {
  const roleById = new Map((input.roles ?? []).map((r) => [r.patternId, r.roleInWork] as const));
  const out: SelectedPatternWithRole[] = [];
  for (const id of input.selectedPatternIds ?? []) {
    const pattern = input.patternsById.get(id);
    if (!pattern) continue;
    const roleInWork = roleById.get(id)?.trim() || undefined;
    out.push({ pattern, roleInWork });
  }
  return out;
}
