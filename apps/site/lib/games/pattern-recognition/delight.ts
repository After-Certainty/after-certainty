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
export const CONSTELLATION_VIEWBOX = { width: 360, height: 320 } as const;

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

export type LabelPosition =
  | "above"
  | "below"
  | "left"
  | "right"
  | "above-left"
  | "above-right"
  | "below-left"
  | "below-right";

export type ConstellationNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  /** Circle radius in viewBox units. */
  r: number;
  isDominant: boolean;
  /** Resolved label placement (close to the node, inward at edges). */
  label: {
    position: LabelPosition;
    x: number;
    y: number;
    anchor: "start" | "middle" | "end";
    /** SVG dominant-baseline. */
    baseline: "auto" | "middle" | "hanging";
    /** One or two display lines. */
    lines: string[];
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

/** Distance from node rim to label (~10–18px in viewBox units). */
const LABEL_GAP = 12;
const LABEL_LINE_HEIGHT = 12;
const LABEL_PAD = 10;
const LABEL_MAX_LINE_CHARS = 17;
/** Soft cap — one extra character is preferred over ellipsis when a word fits. */
const LABEL_SOFT_LINE_CHARS = 18;
/** Approximate SVG user-unit width per character at label font size. */
const LABEL_CHAR_WIDTH = 4.6;

/**
 * Prefer full title → two-line wrap at a word boundary → ellipsis only as last resort.
 */
export function wrapPatternLabel(
  title: string,
  maxCharsPerLine = LABEL_MAX_LINE_CHARS,
): string[] {
  const trimmed = title.trim().replace(/\s+/g, " ");
  if (!trimmed) return [""];
  if (trimmed.length <= maxCharsPerLine) return [trimmed];

  const words = trimmed.split(" ");
  if (words.length === 1) {
    // Single long token — soft split, ellipsis only if still too long for two lines.
    const first = trimmed.slice(0, maxCharsPerLine);
    const rest = trimmed.slice(maxCharsPerLine);
    if (rest.length <= maxCharsPerLine) return [first, rest];
    return [first, `${rest.slice(0, maxCharsPerLine - 1)}…`];
  }

  const soft = Math.max(maxCharsPerLine, LABEL_SOFT_LINE_CHARS);
  let best = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let split = 1; split < words.length; split += 1) {
    const a = words.slice(0, split).join(" ");
    const b = words.slice(split).join(" ");
    if (a.length > soft) continue;
    const hardOverflow =
      Math.max(0, a.length - maxCharsPerLine) + Math.max(0, b.length - maxCharsPerLine);
    // Ellipsis on line 2 is a last resort — prefer a slightly long full line.
    const needsEllipsis = b.length > soft ? 200 : b.length > maxCharsPerLine ? 40 : 0;
    const balance = Math.abs(a.length - b.length);
    const score =
      hardOverflow * 12 + needsEllipsis + balance - (a.length <= maxCharsPerLine ? split * 0.01 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = split;
    }
  }

  const line1 = words.slice(0, best).join(" ");
  let line2 = words.slice(best).join(" ");
  if (line2.length > soft) {
    line2 = `${line2.slice(0, maxCharsPerLine - 1).trimEnd()}…`;
  }
  return [line1, line2];
}

/** @deprecated Prefer {@link wrapPatternLabel}. */
export function shortenPatternLabel(title: string, maxChars = 22): string {
  const lines = wrapPatternLabel(title, Math.min(maxChars, LABEL_MAX_LINE_CHARS));
  return lines.join(" ");
}

/**
 * Place a label close to its node (~10–18px gap), with anchors suited to direction.
 * Clamps into the viewBox so mobile edges never clip.
 */
export function resolveLabelPlacement(input: {
  nodeX: number;
  nodeY: number;
  r: number;
  position: LabelPosition;
  lines: readonly string[];
  nudge?: { x?: number; y?: number };
  viewWidth?: number;
  viewHeight?: number;
}): ConstellationNode["label"] {
  const {
    nodeX,
    nodeY,
    r,
    position,
    lines,
    nudge,
    viewWidth = CONSTELLATION_VIEWBOX.width,
    viewHeight = CONSTELLATION_VIEWBOX.height,
  } = input;
  const gap = LABEL_GAP;
  const blockHeight = Math.max(1, lines.length) * LABEL_LINE_HEIGHT;
  const reach = r + gap;

  let x = nodeX;
  let y = nodeY;
  let anchor: "start" | "middle" | "end" = "middle";
  let baseline: "auto" | "middle" | "hanging" = "middle";

  // Multi-line blocks: keep the line nearest the node at `reach`, stack away from it.
  const aboveStack = lines.length > 1 ? blockHeight - LABEL_LINE_HEIGHT : 0;

  switch (position) {
    case "right":
      // Stack above the hub spoke: last line ~12px above node center.
      x = nodeX + reach;
      y = nodeY - 12 - (lines.length > 1 ? (lines.length - 1) * LABEL_LINE_HEIGHT : 0);
      anchor = "start";
      baseline = "auto";
      break;
    case "left":
      x = nodeX - reach;
      y = nodeY - 12 - (lines.length > 1 ? (lines.length - 1) * LABEL_LINE_HEIGHT : 0);
      anchor = "end";
      baseline = "auto";
      break;
    case "below":
      x = nodeX;
      y = nodeY + reach;
      anchor = "middle";
      baseline = "hanging";
      break;
    case "above":
      x = nodeX;
      y = nodeY - reach - aboveStack;
      anchor = "middle";
      baseline = "auto";
      break;
    case "below-right":
      x = nodeX + r + 5;
      y = nodeY + reach;
      anchor = "start";
      baseline = "hanging";
      break;
    case "below-left":
      x = nodeX - r - 5;
      y = nodeY + reach;
      anchor = "end";
      baseline = "hanging";
      break;
    case "above-right":
      x = nodeX + r + 5;
      y = nodeY - reach - aboveStack;
      anchor = "start";
      baseline = "auto";
      break;
    case "above-left":
      x = nodeX - r - 5;
      y = nodeY - reach - aboveStack;
      anchor = "end";
      baseline = "auto";
      break;
    default:
      break;
  }

  if (nudge?.x) x += nudge.x;
  if (nudge?.y) y += nudge.y;

  // Keep full label glyphs inside the SVG — prefer inward clamp over clipping.
  const maxLineLen = Math.max(...lines.map((line) => line.length), 1);
  const approxWidth = maxLineLen * LABEL_CHAR_WIDTH;
  const approxHalfWidth = approxWidth / 2;
  if (anchor === "start") {
    x = Math.min(x, viewWidth - LABEL_PAD - approxWidth);
    x = Math.max(x, LABEL_PAD);
  } else if (anchor === "end") {
    x = Math.max(x, LABEL_PAD + approxWidth);
    x = Math.min(x, viewWidth - LABEL_PAD);
  } else {
    x = Math.min(Math.max(x, LABEL_PAD + approxHalfWidth), viewWidth - LABEL_PAD - approxHalfWidth);
  }

  const minY =
    baseline === "hanging" ? LABEL_PAD : baseline === "middle" ? LABEL_PAD + 6 : LABEL_PAD + 10;
  // `auto`/`middle` y marks the first line; keep the full block inside the viewBox.
  const maxY =
    baseline === "hanging"
      ? viewHeight - LABEL_PAD - blockHeight
      : baseline === "middle"
        ? viewHeight - LABEL_PAD - blockHeight * 0.5
        : viewHeight - LABEL_PAD - Math.max(0, blockHeight - LABEL_LINE_HEIGHT);
  y = Math.min(Math.max(y, minY), maxY);

  return {
    position,
    x,
    y,
    anchor,
    baseline,
    lines: [...lines],
  };
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
  /** Intentional annotation direction — edge nodes face clear space. */
  labelPosition: LabelPosition;
  /** Fine nudge in viewBox units after directional placement. */
  labelNudge?: { x?: number; y?: number };
};

/**
 * Deliberate constellation slots — irregular night-sky composition, not a grid.
 * Index 0 is reserved for the visually dominant / highest-score pattern (center).
 * Node coordinates are unchanged; only label directions are assigned here.
 */
const SLOTS_BY_COUNT: Record<number, readonly Slot[]> = {
  1: [{ x: 180, y: 150, labelPosition: "below" }],
  2: [
    { x: 180, y: 130, labelPosition: "below" },
    { x: 250, y: 190, labelPosition: "above-left" },
  ],
  3: [
    { x: 180, y: 140, labelPosition: "below" },
    { x: 70, y: 150, labelPosition: "right" },
    { x: 290, y: 120, labelPosition: "left" },
  ],
  4: [
    { x: 175, y: 145, labelPosition: "below" },
    { x: 60, y: 155, labelPosition: "right" },
    { x: 120, y: 70, labelPosition: "below-right" },
    { x: 295, y: 130, labelPosition: "left" },
  ],
  5: [
    { x: 175, y: 145, labelPosition: "below", labelNudge: { y: 2 } },
    { x: 55, y: 150, labelPosition: "right" },
    { x: 115, y: 65, labelPosition: "above", labelNudge: { x: -6 } },
    { x: 265, y: 55, labelPosition: "above", labelNudge: { x: 6 } },
    { x: 300, y: 160, labelPosition: "left" },
  ],
  6: [
    { x: 175, y: 145, labelPosition: "below", labelNudge: { y: 2 } },
    { x: 52, y: 148, labelPosition: "right" },
    { x: 110, y: 62, labelPosition: "above", labelNudge: { x: -6 } },
    { x: 260, y: 52, labelPosition: "above", labelNudge: { x: 6 } },
    { x: 305, y: 155, labelPosition: "left" },
    { x: 240, y: 235, labelPosition: "above", labelNudge: { x: 10 } },
  ],
  7: [
    // Hub: drop into the open lower-left pocket (no spoke toward bottom-left).
    { x: 175, y: 140, labelPosition: "below-left", labelNudge: { x: -6, y: 4 } },
    // Far-left: inward/right, stacked above the hub spoke.
    { x: 48, y: 145, labelPosition: "right", labelNudge: { x: 2, y: -4 } },
    // Top: outside above, slight outward flare so two-line blocks clear nodes.
    { x: 105, y: 58, labelPosition: "above", labelNudge: { x: -10, y: -1 } },
    { x: 255, y: 48, labelPosition: "above", labelNudge: { x: 10, y: -1 } },
    // Far-right: inward/left, stacked above the hub spoke (extra lift).
    { x: 312, y: 150, labelPosition: "left", labelNudge: { x: -2, y: -6 } },
    // Bottom-right: spokes above fan through the upper pocket — sit beside the node.
    { x: 245, y: 238, labelPosition: "right", labelNudge: { x: 2, y: 14 } },
    // Bottom-left: upward into the open wedge (no hub spoke).
    { x: 95, y: 230, labelPosition: "above-right", labelNudge: { x: 6, y: -2 } },
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
    const r = nodeRadius(pattern, i === 0);
    const lines = wrapPatternLabel(pattern.title);
    return {
      id: pattern.id,
      title: pattern.title,
      x: slot.x,
      y: slot.y,
      r,
      isDominant: pattern.isDominant || i === 0,
      label: resolveLabelPlacement({
        nodeX: slot.x,
        nodeY: slot.y,
        r,
        position: slot.labelPosition,
        lines,
        nudge: slot.labelNudge,
      }),
    };
  });

  const edges = edgeTemplate.filter(
    (edge) => edge.from < nodes.length && edge.to < nodes.length,
  );

  return { nodes, edges };
}
