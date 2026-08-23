import { loadInstalledManifestJson } from "@/lib/graph/manifest/installed-io";
import { isCompatibleSchemaVersion } from "@/lib/graph/manifest/schema-version";
import { validateSemanticGraph } from "@/lib/graph/manifest/validate";
import type { SemanticGraph } from "@/types/semanticGraph";

let cached: SemanticGraph | undefined;

/**
 * Synchronous access to the installed local semantic manifest.
 * For server-side sync helpers and tests that already generated/installed the
 * same-checkout artifact. Not for client components (uses fs).
 */
export function loadInstalledSemanticGraphSync(rootDir?: string): SemanticGraph {
  if (cached && rootDir === undefined) return cached;
  const raw = loadInstalledManifestJson(rootDir);
  const validated = validateSemanticGraph(raw);
  if (!validated.success) {
    throw new Error(
      "Installed local-semantic-manifest.json failed validation. " +
        "Regenerate with: npm run corpus:build-manifest && npm run site:install-local-manifest",
    );
  }
  if (!isCompatibleSchemaVersion(validated.data.schemaVersion)) {
    throw new Error(
      `Installed local-semantic-manifest.json has incompatible schemaVersion ${validated.data.schemaVersion}. ` +
        "Regenerate with: npm run corpus:build-manifest && npm run site:install-local-manifest",
    );
  }
  if (rootDir === undefined) cached = validated.data;
  return validated.data;
}

/** Test helper — clear the sync graph cache. */
export function resetInstalledSemanticGraphCacheForTests(): void {
  cached = undefined;
}
