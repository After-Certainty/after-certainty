/** Shared predicate string normalization for graph query and presentation layers. */

export function normalizePredicateKey(predicate: string): string {
  return predicate.trim().toLowerCase();
}
