import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

import { validateSemanticGraph } from "@/lib/graph/manifest/validate";

const PROP = { seed: 20260919, numRuns: 100 } as const;

test.prop([fc.jsonValue()], PROP)(
  "validateSemanticGraph never throws on arbitrary JSON values",
  (raw) => {
    let result: ReturnType<typeof validateSemanticGraph> | undefined;
    expect(() => {
      result = validateSemanticGraph(raw);
    }).not.toThrow();
    expect(result).toBeDefined();
    expect(result!.success === true || result!.success === false).toBe(true);
    if (result!.success) {
      expect(result!.data).toBeDefined();
      expect(result!.error).toBeUndefined();
    } else {
      expect(result!.data).toBeUndefined();
      expect(result!.error).toBeDefined();
    }
  },
);

test.prop(
  [
    fc.oneof(
      fc.constant(null),
      fc.constant(42),
      fc.constant("not-a-graph"),
      fc.constant([]),
      fc.constant(true),
    ),
  ],
  PROP,
)("non-object JSON values fail validation without throwing", (raw) => {
  const result = validateSemanticGraph(raw);
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
