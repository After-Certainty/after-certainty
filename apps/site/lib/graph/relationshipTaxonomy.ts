import type { GraphIndex } from "@/lib/graph/graph";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { normalizePredicateKey } from "@/lib/graph/relationshipVisuals";
import type { Relationship, SemanticGraph } from "@/types/semanticGraph";

export const STRUCTURAL_TENSION_PREDICATE = "structural_tension";

export type RelationshipFamily = "tension" | "dynamic";
export type DynamicVerbGroup = "sustaining" | "erosive" | "reproductive";

export type GroupedPredicates = {
  tension: string[];
  dynamic: string[];
  sustaining: string[];
  erosive: string[];
  reproductive: string[];
};

export type ConceptRelationships = {
  tensions: Relationship[];
  outgoingDynamics: Relationship[];
  incomingDynamics: Relationship[];
};

export function relationshipFamily(predicate: string): RelationshipFamily {
  return normalizePredicateKey(predicate) === STRUCTURAL_TENSION_PREDICATE ? "tension" : "dynamic";
}

export function isSymmetricRelationship(predicate: string): boolean {
  return relationshipFamily(predicate) === "tension";
}

export function dynamicVerbGroup(predicate: string): DynamicVerbGroup | null {
  const key = normalizePredicateKey(predicate);
  if (key === "preserves" || key === "renews" || key === "stabilizes") return "sustaining";
  if (key === "thins" || key === "pressures") return "erosive";
  if (key === "reproduces") return "reproductive";
  return null;
}

export function groupPredicatesByFamily(graph: { relationships: Relationship[] }): GroupedPredicates {
  const tension: string[] = [];
  const dynamic: string[] = [];
  const sustaining: string[] = [];
  const erosive: string[] = [];
  const reproductive: string[] = [];

  const seen = new Set<string>();
  for (const r of graph.relationships) {
    const raw = r.relationship.trim();
    if (!raw) continue;
    const key = normalizePredicateKey(raw);
    if (seen.has(key)) continue;
    seen.add(key);

    if (relationshipFamily(raw) === "tension") {
      tension.push(raw);
      continue;
    }
    dynamic.push(raw);
    const group = dynamicVerbGroup(raw);
    if (group === "sustaining") sustaining.push(raw);
    else if (group === "erosive") erosive.push(raw);
    else if (group === "reproductive") reproductive.push(raw);
  }

  const sort = (a: string, b: string) => a.localeCompare(b);
  return {
    tension: tension.sort(sort),
    dynamic: dynamic.sort(sort),
    sustaining: sustaining.sort(sort),
    erosive: erosive.sort(sort),
    reproductive: reproductive.sort(sort),
  };
}

export function tensionPredicateKeys(graph: { relationships: Relationship[] }): string[] {
  return groupPredicatesByFamily(graph).tension.map((p) => normalizePredicateKey(p));
}

export function dynamicPredicateKeys(graph: { relationships: Relationship[] }): string[] {
  return groupPredicatesByFamily(graph).dynamic.map((p) => normalizePredicateKey(p));
}

export function relationshipsForConcept(index: GraphIndex, canonicalFocalId: string): ConceptRelationships {
  const tensions: Relationship[] = [];
  const outgoingDynamics: Relationship[] = [];
  const incomingDynamics: Relationship[] = [];

  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;

    if (isSymmetricRelationship(r.relationship)) {
      if (ends.sourceId === canonicalFocalId || ends.targetId === canonicalFocalId) {
        tensions.push(r);
      }
      continue;
    }

    if (ends.sourceId === canonicalFocalId) outgoingDynamics.push(r);
    else if (ends.targetId === canonicalFocalId) incomingDynamics.push(r);
  }

  return { tensions, outgoingDynamics, incomingDynamics };
}

export function entityHasSemanticRelationships(index: GraphIndex, canonicalFocalId: string): boolean {
  const { tensions, outgoingDynamics, incomingDynamics } = relationshipsForConcept(index, canonicalFocalId);
  return tensions.length + outgoingDynamics.length + incomingDynamics.length > 0;
}
