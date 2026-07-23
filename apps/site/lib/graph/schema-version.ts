/**
 * Minimal major.minor schema version parsing for semantic-manifest compatibility.
 * Do not compare version strings lexicographically.
 */

export type ParsedSchemaVersion = {
  major: number;
  minor: number;
  raw: string;
};

/** Fully supported production contract. */
export const INTENDED_SCHEMA_VERSION = "2.3";

/** Schema majors the site can consume. Major 3+ is refused. */
export const SUPPORTED_SCHEMA_MAJOR = 2;

/** Oldest minor still accepted in compatibility mode (enrichment optional). */
export const COMPAT_SCHEMA_MINOR_FLOOR = 2;

export function parseSchemaVersion(schemaVersion: string | undefined): ParsedSchemaVersion | null {
  if (!schemaVersion?.trim()) return null;
  const trimmed = schemaVersion.trim();
  const match = /^(\d+)(?:\.(\d+))?(?:\.\d+)*(?:[-+].*)?$/.exec(trimmed);
  if (!match) return null;
  const major = Number.parseInt(match[1] ?? "", 10);
  const minor = Number.parseInt(match[2] ?? "0", 10);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) return null;
  return { major, minor, raw: trimmed };
}

export function compareSchemaVersions(a: ParsedSchemaVersion, b: ParsedSchemaVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  return a.minor - b.minor;
}

export function isSchemaAtLeast(schemaVersion: string | undefined, minimum: string): boolean {
  const parsed = parseSchemaVersion(schemaVersion);
  const min = parseSchemaVersion(minimum);
  if (!parsed || !min) return false;
  return compareSchemaVersions(parsed, min) >= 0;
}

/**
 * Supported: missing (legacy), major 2 with any minor (2.2 compat, 2.3 intended).
 * Refused: major >= 3 or unparseable non-empty strings.
 */
export function isCompatibleSchemaVersion(schemaVersion: string | undefined): boolean {
  if (!schemaVersion?.trim()) return true;
  const parsed = parseSchemaVersion(schemaVersion);
  if (!parsed) return false;
  return parsed.major <= SUPPORTED_SCHEMA_MAJOR;
}

/** True when the version is the intended production contract (2.3+ within major 2). */
export function isIntendedSchemaVersion(schemaVersion: string | undefined): boolean {
  return isSchemaAtLeast(schemaVersion, INTENDED_SCHEMA_VERSION);
}

/** True when 2.2-compatible but not yet at intended 2.3. */
export function isCompatibilitySchemaVersion(schemaVersion: string | undefined): boolean {
  const parsed = parseSchemaVersion(schemaVersion);
  if (!parsed) return false;
  if (parsed.major !== SUPPORTED_SCHEMA_MAJOR) return false;
  if (parsed.minor < COMPAT_SCHEMA_MINOR_FLOOR) return false;
  return !isIntendedSchemaVersion(schemaVersion);
}
