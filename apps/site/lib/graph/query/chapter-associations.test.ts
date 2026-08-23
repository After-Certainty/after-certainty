import { describe, expect, it } from "vitest";

import {
  publicChaptersForConcept,
  publicChaptersForPattern,
} from "@/lib/graph/query/chapter-associations";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const graph = tryLoadLocalSemanticManifest();

describe.skipIf(!graph)("chapter associations (local manifest)", () => {
  it("returns public chapter links for a concept with authored associations", () => {
    const chapter = (graph!.chapters ?? []).find(
      (c) => c.public && (c.selectedConceptIds?.length ?? 0) > 0,
    );
    expect(chapter).toBeTruthy();
    const conceptId = chapter!.selectedConceptIds![0]!;
    const links = publicChaptersForConcept(graph!, conceptId);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.href.includes("/chapters/"))).toBe(true);
    expect(links.some((link) => link.id === chapter!.id)).toBe(true);
  });

  it("returns empty for an unknown concept id", () => {
    expect(publicChaptersForConcept(graph!, "concept-does-not-exist")).toEqual([]);
  });

  it("returns public chapter links for a pattern with authored associations", () => {
    const chapter = (graph!.chapters ?? []).find(
      (c) => c.public && (c.selectedPatternIds?.length ?? 0) > 0,
    );
    expect(chapter).toBeTruthy();
    const patternId = chapter!.selectedPatternIds![0]!;
    const links = publicChaptersForPattern(graph!, patternId);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.href.startsWith("/explore/books/"))).toBe(true);
  });
});
