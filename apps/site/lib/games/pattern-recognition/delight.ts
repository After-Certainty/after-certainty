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

/** Wall-clock ms until the sequence has fully settled (does not unmount). */
export const DELIGHT_DURATION_MS = 2100;

/** Shared SVG coordinate space for Pattern Constellation (labels need height). */
export const CONSTELLATION_VIEWBOX = { width: 360, height: 300 } as const;

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

export type SessionPatternInput = {
  id: string;
  title: string;
  /** Higher = more central / larger (dominant encounters, then presence). */
  score: number;
  isDominant: boolean;
};

export type ConstellationNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  /** Circle radius in viewBox units. */
  r: number;
  isDominant: boolean;
  /** Label placement relative to the node. */
  label: {
    x: number;
    y: number;
    anchor: "start" | "middle" | "end";
    /** Hide on the narrowest viewports when crowded. */
    optional?: boolean;
  };
};

export type ConstellationEdge = {
  from: number;
  to: number;
};

/** Deterministic V1 selection — no randomness. */
export function selectDelightVariant(): DelightVariantId {
  return V1_DELIGHT_VARIANT;
}

/** Truncate pattern titles for SVG labels on mobile. */
export function shortenPatternLabel(title: string, maxChars = 22): string {
  const trimmed = title.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

/**
 * Collect unique patterns from a finished session (dominants first, then secondaries).
 * Caps at 7; prefers higher encounter scores.
 */
export function buildSessionPatterns(
  challenges: ReadonlyArray<{
    dominantPattern: string;
    secondaryPatterns?: readonly string[];
    titleByPatternId?: Record<string, string>;
  }>,
): SessionPatternInput[] {
  const byId = new Map<string, SessionPatternInput>();

  for (const challenge of challenges) {
    const titles = challenge.titleByPatternId ?? {};
    const dominantId = challenge.dominantPattern.trim();
    if (dominantId) {
      const existing = byId.get(dominantId);
      byId.set(dominantId, {
        id: dominantId,
        title: titles[dominantId] ?? existing?.title ?? dominantId,
        score: (existing?.score ?? 0) + 3,
        isDominant: true,
      });
    }
    for (const secondaryId of challenge.secondaryPatterns ?? []) {
      const id = secondaryId.trim();
      if (!id) continue;
      const existing = byId.get(id);
      byId.set(id, {
        id,
        title: titles[id] ?? existing?.title ?? id,
        score: (existing?.score ?? 0) + 1,
        isDominant: existing?.isDominant ?? false,
      });
    }
  }

  return [...byId.values()]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 7);
}

/** @deprecated Prefer {@link buildSessionPatterns}. Kept for call-site migration. */
export function sessionPatternIds(
  challenges: ReadonlyArray<{ dominantPattern: string }>,
): string[] {
  return buildSessionPatterns(challenges).map((pattern) => pattern.id);
}

type Slot = {
  x: number;
  y: number;
  label: ConstellationNode["label"];
};

/**
 * Deliberate constellation slots — irregular night-sky composition, not a grid.
 * Index 0 is reserved for the visually dominant / highest-score pattern (center).
 */
const SLOTS_BY_COUNT: Record<number, readonly Slot[]> = {
  1: [{ x: 180, y: 150, label: { x: 180, y: 178, anchor: "middle" } }],
  2: [
    { x: 180, y: 130, label: { x: 180, y: 158, anchor: "middle" } },
    { x: 250, y: 190, label: { x: 268, y: 198, anchor: "start" } },
  ],
  3: [
    { x: 180, y: 140, label: { x: 180, y: 168, anchor: "middle" } },
    { x: 70, y: 150, label: { x: 54, y: 156, anchor: "end" } },
    { x: 290, y: 120, label: { x: 306, y: 126, anchor: "start" } },
  ],
  4: [
    { x: 175, y: 145, label: { x: 175, y: 172, anchor: "middle" } },
    { x: 60, y: 155, label: { x: 44, y: 160, anchor: "end" } },
    { x: 120, y: 70, label: { x: 120, y: 52, anchor: "middle" } },
    { x: 295, y: 130, label: { x: 312, y: 136, anchor: "start" } },
  ],
  5: [
    { x: 175, y: 145, label: { x: 175, y: 172, anchor: "middle" } },
    { x: 55, y: 150, label: { x: 40, y: 156, anchor: "end" } },
    { x: 115, y: 65, label: { x: 115, y: 48, anchor: "middle" } },
    { x: 265, y: 55, label: { x: 280, y: 48, anchor: "start" } },
    { x: 300, y: 160, label: { x: 316, y: 166, anchor: "start" } },
  ],
  6: [
    { x: 175, y: 145, label: { x: 175, y: 172, anchor: "middle" } },
    { x: 52, y: 148, label: { x: 38, y: 154, anchor: "end" } },
    { x: 110, y: 62, label: { x: 110, y: 46, anchor: "middle" } },
    { x: 260, y: 52, label: { x: 278, y: 46, anchor: "start" } },
    { x: 305, y: 155, label: { x: 320, y: 160, anchor: "start" } },
    { x: 240, y: 235, label: { x: 255, y: 252, anchor: "start", optional: true } },
  ],
  7: [
    { x: 175, y: 140, label: { x: 175, y: 166, anchor: "middle" } },
    { x: 48, y: 145, label: { x: 34, y: 150, anchor: "end" } },
    { x: 105, y: 58, label: { x: 105, y: 42, anchor: "middle" } },
    { x: 255, y: 48, label: { x: 272, y: 42, anchor: "start" } },
    { x: 312, y: 150, label: { x: 328, y: 156, anchor: "start" } },
    { x: 245, y: 238, label: { x: 260, y: 255, anchor: "start", optional: true } },
    { x: 95, y: 230, label: { x: 80, y: 248, anchor: "end", optional: true } },
  ],
};

/** Sparse edge index pairs for each node count (constellation, not clique). */
const EDGES_BY_COUNT: Record<number, readonly ConstellationEdge[]> = {
  1: [],
  2: [{ from: 0, to: 1 }],
  3: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 2 },
  ],
  4: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 2, to: 3 },
  ],
  5: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 0, to: 4 },
    { from: 2, to: 3 },
    { from: 1, to: 2 },
  ],
  6: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 0, to: 4 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 0, to: 5 },
  ],
  7: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 0, to: 4 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 1, to: 6 },
    { from: 0, to: 5 },
  ],
};

function nodeRadius(pattern: SessionPatternInput, isCenter: boolean): number {
  if (isCenter || (pattern.isDominant && pattern.score >= 3)) return 9;
  if (pattern.isDominant || pattern.score >= 2) return 7;
  return 5.5;
}

/**
 * Layout session patterns into a fixed constellation composition.
 * Highest-score pattern occupies the central slot; remaining fill outer slots in score order.
 */
export function layoutConstellation(patterns: readonly SessionPatternInput[]): {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
} {
  const source =
    patterns.length > 0
      ? [...patterns]
      : ([
          { id: "node-a", title: "Pattern", score: 3, isDominant: true },
          { id: "node-b", title: "Pattern", score: 1, isDominant: false },
          { id: "node-c", title: "Pattern", score: 1, isDominant: false },
        ] satisfies SessionPatternInput[]);

  const sorted = [...source].sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  );
  const count = Math.min(7, Math.max(1, sorted.length));
  const slots = SLOTS_BY_COUNT[count] ?? SLOTS_BY_COUNT[6]!;
  const edgeTemplate = EDGES_BY_COUNT[count] ?? EDGES_BY_COUNT[6]!;

  const nodes: ConstellationNode[] = sorted.slice(0, count).map((pattern, i) => {
    const slot = slots[i] ?? slots[0]!;
    return {
      id: pattern.id,
      title: pattern.title,
      x: slot.x,
      y: slot.y,
      r: nodeRadius(pattern, i === 0),
      isDominant: pattern.isDominant || i === 0,
      label: slot.label,
    };
  });

  const edges = edgeTemplate.filter(
    (edge) => edge.from < nodes.length && edge.to < nodes.length,
  );

  return { nodes, edges };
}
