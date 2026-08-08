/**
 * Session Completion Delight — variant registry and pure helpers.
 * Cosmetic only; never touches scoring, XP, or persistence.
 */

export type DelightVariantId =
  | "pattern-constellation"
  | "certainty-shatters"
  | "reality-pushes-back"
  | "book-burst"
  | "rare-surprise";

/** V1 ships one deterministic variant. */
export const V1_DELIGHT_VARIANT: DelightVariantId = "pattern-constellation";

/** Wall-clock ms for the full constellation play, then cleanup. */
export const DELIGHT_DURATION_MS = 1600;

/** Reduced-motion: brief opacity presence only. */
export const DELIGHT_REDUCED_MOTION_MS = 150;

export type DelightVariantMeta = {
  id: DelightVariantId;
  /** Placeholder for later weighted selection. */
  weight: "common" | "uncommon" | "rare";
  implemented: boolean;
};

export const DELIGHT_VARIANTS: readonly DelightVariantMeta[] = [
  { id: "pattern-constellation", weight: "common", implemented: true },
  { id: "certainty-shatters", weight: "uncommon", implemented: false },
  { id: "reality-pushes-back", weight: "uncommon", implemented: false },
  { id: "book-burst", weight: "uncommon", implemented: false },
  { id: "rare-surprise", weight: "rare", implemented: false },
] as const;

export type ConstellationNode = {
  id: string;
  x: number;
  y: number;
};

export type ConstellationEdge = {
  from: number;
  to: number;
};

/** Deterministic V1 selection — no randomness. */
export function selectDelightVariant(): DelightVariantId {
  return V1_DELIGHT_VARIANT;
}

/** Unique dominant pattern ids from a finished session (max 5). */
export function sessionPatternIds(
  challenges: ReadonlyArray<{ dominantPattern: string }>,
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const challenge of challenges) {
    const id = challenge.dominantPattern.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= 5) break;
  }
  return ids;
}

/**
 * Layout nodes on a calm arc / small graph inside a 320×120 viewBox.
 * Falls back to a 3-node default constellation when the session has no ids.
 */
export function layoutConstellation(patternIds: readonly string[]): {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
} {
  const ids =
    patternIds.length > 0
      ? [...patternIds]
      : ["node-a", "node-b", "node-c"];

  const count = ids.length;
  const width = 320;
  const height = 120;
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radiusX = Math.min(120, 28 + count * 18);
  const radiusY = 36;

  const nodes: ConstellationNode[] = ids.map((id, i) => {
    if (count === 1) {
      return { id, x: cx, y: cy };
    }
    const t = count === 1 ? 0 : i / (count - 1);
    const angle = Math.PI * (0.15 + 0.7 * t);
    return {
      id,
      x: cx + Math.cos(angle) * radiusX,
      y: cy - Math.sin(angle) * radiusY,
    };
  });

  const edges: ConstellationEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({ from: i, to: i + 1 });
  }
  // One cross-link when we have enough nodes — keeps the “constellation” feel.
  if (nodes.length >= 4) {
    edges.push({ from: 0, to: nodes.length - 1 });
  }

  return { nodes, edges };
}
