/** Join non-empty string fragments into a single searchText blob. */
export function joinSearchText(parts: Array<string | undefined | null | false>): string {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    if (typeof part !== "string") continue;
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out.join("\n");
}

/** Unique, trimmed strings preserving first-seen order. */
export function uniqueStrings(values: Iterable<string | undefined | null>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}
