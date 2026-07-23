/**
 * Maps manifest relationship predicates to SVG-friendly edge styles.
 * Extension: weight-based stroke width, temporal styling, multi-label edges.
 */

export type RelationshipVisualStyle = {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
};

const DEFAULT_STYLE: RelationshipVisualStyle = {
  /** Token-driven so edges stay legible in both `html.light` and default dark. */
  stroke: "color-mix(in srgb, var(--muted) 82%, transparent)",
  strokeWidth: 1.05,
};

const RULES: { test: (p: string) => boolean; style: RelationshipVisualStyle }[] = [
  {
    test: (p) => /structural_tension/i.test(p),
    style: {
      stroke: "color-mix(in srgb, #c49a6c 55%, #6a8fb8)",
      strokeWidth: 1.65,
      strokeDasharray: "6 4",
    },
  },
  {
    test: (p) => /preserves/i.test(p),
    style: { stroke: "var(--accent)", strokeWidth: 1.5 },
  },
  {
    test: (p) => /renews/i.test(p),
    style: { stroke: "#5a9b6e", strokeWidth: 1.5 },
  },
  {
    test: (p) => /reproduces/i.test(p),
    style: { stroke: "#4d9b7a", strokeWidth: 1.45 },
  },
  {
    test: (p) => /\bthins\b/i.test(p),
    style: { stroke: "#9b4d6a", strokeWidth: 1.5 },
  },
  {
    test: (p) => /pressures/i.test(p),
    style: { stroke: "#a85a72", strokeWidth: 1.5 },
  },
  {
    test: (p) => /threatens/i.test(p),
    style: { stroke: "#9b4d6a", strokeWidth: 1.5 },
  },
  {
    test: (p) => /enables/i.test(p),
    style: { stroke: "#5a9b6e", strokeWidth: 1.5 },
  },
  {
    test: (p) => /distorts/i.test(p),
    style: { stroke: "#5ab0c4", strokeWidth: 1.5 },
  },
  {
    test: (p) => /stabilizes/i.test(p),
    style: { stroke: "#7a8fb8", strokeWidth: 1.5 },
  },
  {
    test: (p) => /outruns/i.test(p),
    style: { stroke: "#8b6bc9", strokeWidth: 1.5 },
  },
  {
    test: (p) => /decouples/i.test(p),
    style: {
      stroke: "color-mix(in srgb, var(--muted) 58%, transparent)",
      strokeWidth: 1,
      strokeDasharray: "4 6",
    },
  },
  {
    test: (p) => /weakens/i.test(p),
    style: { stroke: "#a8526a", strokeWidth: 1.5 },
  },
  {
    test: (p) => /hardens/i.test(p),
    style: { stroke: "#9b3d55", strokeWidth: 1.5 },
  },
  {
    test: (p) => /constrains/i.test(p),
    style: {
      stroke: "#8b5a72",
      strokeWidth: 1.4,
      strokeDasharray: "5 3",
    },
  },
  {
    test: (p) => /contrasts/i.test(p),
    style: {
      stroke: "color-mix(in srgb, var(--muted) 70%, var(--accent) 30%)",
      strokeWidth: 1.2,
    },
  },
  {
    test: (p) => /requires/i.test(p),
    style: { stroke: "#7a8fb8", strokeWidth: 1.3 },
  },
  {
    test: (p) => /precedes/i.test(p),
    style: {
      stroke: "#8b7ab8",
      strokeWidth: 1.25,
      strokeDasharray: "8 4",
    },
  },
  {
    test: (p) => /intensifies/i.test(p),
    style: { stroke: "#c47a4d", strokeWidth: 1.5 },
  },
  {
    test: (p) => /complements/i.test(p),
    style: { stroke: "#6aa89b", strokeWidth: 1.4 },
  },
];

export function normalizePredicateKey(predicate: string): string {
  return predicate.trim().toLowerCase();
}

/** Readable label for UI only. Matching keys still use {@link normalizePredicateKey}. */
export function formatRelationshipLabelForDisplay(predicate: string): string {
  const spaced = predicate.trim().replaceAll("_", " ");
  return spaced.replace(/\s+/g, " ");
}

export function styleForRelationshipPredicate(predicate: string): RelationshipVisualStyle {
  for (const rule of RULES) {
    if (rule.test(predicate)) return rule.style;
  }
  return DEFAULT_STYLE;
}
