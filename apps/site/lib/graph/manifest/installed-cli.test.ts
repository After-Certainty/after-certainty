import { describe, expect, it } from "vitest";

import { assertInstalledManifestFresh } from "@/lib/graph/manifest/freshness";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

describe.skipIf(!tryLoadLocalSemanticManifest())("validate:installed-manifest CLI gate", () => {
  it("enforces installed manifest freshness (strict when VALIDATE_INSTALLED_MANIFEST_STRICT=1)", () => {
    const strict =
      process.env.VALIDATE_INSTALLED_MANIFEST_STRICT === "1" ||
      process.env.VALIDATE_FALLBACK_STRICT === "1";
    expect(() => assertInstalledManifestFresh({ strictStale: strict })).not.toThrow();
  });
});
