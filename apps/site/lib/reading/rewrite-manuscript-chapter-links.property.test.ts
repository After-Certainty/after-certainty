import { test, fc } from "@fast-check/vitest";
import { expect } from "vitest";

import { resolveManuscriptMdTarget } from "@/lib/reading/rewrite-manuscript-chapter-links";

const PROP = { seed: 20260919, numRuns: 128 } as const;

/** Book-relative manuscript paths: one or more safe segments ending in `.md`. */
const bookRelativeSourcePath = fc
  .array(
    fc
      .stringMatching(/^[a-z0-9][a-z0-9-]{0,24}$/)
      .filter((s) => s.length > 0),
    { minLength: 1, maxLength: 4 },
  )
  .map((segments) => `${segments.join("/")}.md`);

/** Relative href paths (may include `../`, `./`, schemes, absolutes). */
const hrefPath = fc.oneof(
  fc.string({ maxLength: 80 }),
  fc.constantFrom(
    "../escape.md",
    "../../etc/passwd.md",
    "/absolute.md",
    "https://example.com/x.md",
    "./sibling.md",
    "nested/chapter.md",
  ),
);

test.prop([bookRelativeSourcePath, hrefPath], PROP)(
  "resolveManuscriptMdTarget never throws; non-null results stay book-relative",
  (currentSourcePath, href) => {
    let result: string | null = null;
    expect(() => {
      result = resolveManuscriptMdTarget(currentSourcePath, href);
    }).not.toThrow();

    if (result !== null) {
      expect(result.startsWith("../")).toBe(false);
      expect(result).not.toBe("..");
      expect(result.startsWith("/")).toBe(false);
      expect(/^[a-z]+:/i.test(result)).toBe(false);
      // Posix normalize should not reintroduce parent escapes.
      expect(result.includes("/../")).toBe(false);
    }
  },
);

test.prop([bookRelativeSourcePath], PROP)(
  "resolving a same-directory sibling stays under the current directory tree",
  (currentSourcePath) => {
    const sibling = "sibling-chapter.md";
    const result = resolveManuscriptMdTarget(currentSourcePath, sibling);
    expect(result).not.toBeNull();
    expect(result!.startsWith("../")).toBe(false);
    expect(result!.endsWith(sibling)).toBe(true);
  },
);
