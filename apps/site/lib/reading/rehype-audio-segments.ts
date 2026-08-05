/**
 * Rehype plugin: wrap spoken segments in <span data-audio-segment="…">.
 * Matches alignment/extractor segment text in document order; skips footnotes.
 */

import type { Element, ElementContent, Root, RootContent, Text } from "hast";
import type { Plugin } from "unified";

export type AudioSegmentMarker = {
  id: string;
  text: string;
};

export type RehypeAudioSegmentsOptions = {
  segments: readonly AudioSegmentMarker[];
};

type TextRef = {
  node: Text;
  parent: Element | Root;
  index: number;
  start: number;
  end: number;
};

const SKIP_TAGS = new Set([
  "script",
  "style",
  "svg",
  "math",
  "code",
  "pre",
  "kbd",
  "samp",
]);

function isElement(node: RootContent | ElementContent): node is Element {
  return node.type === "element";
}

function isText(node: RootContent | ElementContent): node is Text {
  return node.type === "text";
}

function elementClassNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(/\s+/);
  return [];
}

function collectTextRefs(tree: Root): TextRef[] {
  const refs: TextRef[] = [];
  let offset = 0;

  const walk = (parent: Element | Root, nodes: (RootContent | ElementContent)[]) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (isText(node)) {
        const value = node.value ?? "";
        refs.push({
          node,
          parent,
          index: i,
          start: offset,
          end: offset + value.length,
        });
        offset += value.length;
        continue;
      }
      if (!isElement(node)) continue;
      const classes = elementClassNames(node.properties?.className);
      if (classes.includes("footnotes")) continue;
      if (SKIP_TAGS.has(String(node.tagName).toLowerCase())) continue;
      if (node.children?.length) walk(node, node.children);
    }
  };

  walk(tree, tree.children);
  return refs;
}

function findMatch(haystack: string, needle: string, from: number): number {
  if (!needle) return -1;
  const exact = haystack.indexOf(needle, from);
  if (exact >= 0) return exact;
  // Soft fallback: collapse whitespace differences between spoken text and HTML.
  const normHay = haystack.replace(/\s+/g, " ");
  const normNeedle = needle.replace(/\s+/g, " ").trim();
  if (!normNeedle) return -1;
  // Map normalized index back only when both are already single-spaced enough;
  // for poetry (exact lines) exact match usually succeeds first.
  const soft = normHay.indexOf(normNeedle, Math.min(from, normHay.length));
  if (soft < 0) return -1;
  // Approximate: scan original for needle with flexible whitespace via regex.
  const escaped = needle
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  const re = new RegExp(escaped);
  re.lastIndex = from;
  const m = re.exec(haystack);
  return m ? m.index : -1;
}

function wrapRange(refs: TextRef[], matchStart: number, matchEnd: number, segmentId: string): void {
  const overlapping = refs.filter((ref) => ref.end > matchStart && ref.start < matchEnd);
  // Reverse so earlier sibling indices stay valid while splicing later ones first.
  for (const ref of [...overlapping].reverse()) {
    const localStart = Math.max(0, matchStart - ref.start);
    const localEnd = Math.min(ref.node.value.length, matchEnd - ref.start);
    if (localEnd <= localStart) continue;

    const before = ref.node.value.slice(0, localStart);
    const mid = ref.node.value.slice(localStart, localEnd);
    const after = ref.node.value.slice(localEnd);

    const replacement: ElementContent[] = [];
    if (before) replacement.push({ type: "text", value: before });
    replacement.push({
      type: "element",
      tagName: "span",
      properties: { dataAudioSegment: segmentId },
      children: [{ type: "text", value: mid }],
    });
    if (after) replacement.push({ type: "text", value: after });

    const siblings = ref.parent.children as ElementContent[];
    // Re-find index in case prior splices shifted siblings in this parent.
    const liveIndex = siblings.indexOf(ref.node);
    if (liveIndex < 0) continue;
    siblings.splice(liveIndex, 1, ...replacement);
  }
}

/**
 * Wrap each segment's text once, in order. Unmatched segments are skipped.
 */
export const rehypeAudioSegments: Plugin<[RehypeAudioSegmentsOptions?], Root> = (
  options,
) => {
  const segments = options?.segments ?? [];
  return (tree) => {
    if (!segments.length) return;
    let searchFrom = 0;
    for (const segment of segments) {
      const refs = collectTextRefs(tree);
      if (!refs.length) break;
      const haystack = refs.map((r) => r.node.value).join("");
      const at = findMatch(haystack, segment.text, searchFrom);
      if (at < 0) continue;
      const end = at + segment.text.length;
      // Soft-match may have different length; locate actual end via regex when needed.
      let matchEnd = end;
      if (haystack.slice(at, end) !== segment.text) {
        const escaped = segment.text
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\s+/g, "\\s+");
        const m = new RegExp(escaped).exec(haystack.slice(at));
        matchEnd = m ? at + m[0].length : end;
      }
      wrapRange(refs, at, matchEnd, segment.id);
      searchFrom = matchEnd;
    }
  };
};

export default rehypeAudioSegments;
