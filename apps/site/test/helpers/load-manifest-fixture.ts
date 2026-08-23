import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateSemanticGraph } from "@/lib/graph/manifest/validate";
import type { SemanticGraph } from "@/types/semanticGraph";

export type ManifestFixtureName =
  | "minimal-valid"
  | "enriched-book"
  | "fiction-and-poetry"
  | "editions"
  | "questions-and-trails";

const FIXTURE_DIR = join(process.cwd(), "test/fixtures/semantic-manifest");

/** Load a purpose-built semantic-manifest test fixture (raw JSON). */
export function loadManifestFixtureJson(name: ManifestFixtureName | `invalid/${string}`): unknown {
  const path = join(FIXTURE_DIR, `${name}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

/** Load and Zod-validate a purpose-built fixture as a SemanticGraph. */
export function loadManifestFixture(name: ManifestFixtureName): SemanticGraph {
  const raw = loadManifestFixtureJson(name);
  const validated = validateSemanticGraph(raw);
  if (!validated.success) {
    throw new Error(`Fixture ${name}.json failed semantic graph validation`);
  }
  return validated.data;
}
