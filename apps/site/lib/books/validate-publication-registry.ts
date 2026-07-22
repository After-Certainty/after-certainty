import type {
  PublicationEdition,
  PublicationRegistry,
} from "@/lib/books/publication-registry-schema";
import type { Book } from "@/types/semanticGraph";

export type PublicationRegistryHealthSeverity = "error" | "warning";

export type PublicationRegistryHealthIssue = {
  severity: PublicationRegistryHealthSeverity;
  code: string;
  bookId?: string;
  workId?: string;
  detail: string;
};

/**
 * Structural + cross-reference health for the publication registry.
 * Does not change catalog behavior — Phase B wires the resolver.
 */
export function collectPublicationRegistryHealthIssues(input: {
  registry: PublicationRegistry;
  books?: readonly Book[];
}): PublicationRegistryHealthIssue[] {
  const { registry, books } = input;
  const issues: PublicationRegistryHealthIssue[] = [];

  const byBookId = new Map<string, PublicationEdition>();
  const bySlug = new Map<string, PublicationEdition>();
  const canonicalByWork = new Map<string, string[]>();

  for (const edition of registry.editions) {
    if (byBookId.has(edition.bookId)) {
      issues.push({
        severity: "error",
        code: "duplicate_book_id",
        bookId: edition.bookId,
        detail: `Duplicate bookId "${edition.bookId}"`,
      });
    }
    byBookId.set(edition.bookId, edition);

    if (bySlug.has(edition.slug)) {
      issues.push({
        severity: "error",
        code: "duplicate_slug",
        bookId: edition.bookId,
        detail: `Duplicate slug "${edition.slug}"`,
      });
    }
    bySlug.set(edition.slug, edition);

    if (edition.isCanonical) {
      const bucket = canonicalByWork.get(edition.workId) ?? [];
      bucket.push(edition.bookId);
      canonicalByWork.set(edition.workId, bucket);
    }
  }

  for (const [workId, canonicalIds] of canonicalByWork) {
    if (canonicalIds.length > 1) {
      issues.push({
        severity: "error",
        code: "multiple_canonical_editions",
        workId,
        detail: `Multiple canonical editions for work "${workId}": ${canonicalIds.join(", ")}`,
      });
    }
  }

  const workIds = new Set(registry.editions.map((e) => e.workId));
  for (const workId of workIds) {
    const siblings = registry.editions.filter((e) => e.workId === workId);
    const canonicals = siblings.filter((e) => e.isCanonical);
    if (canonicals.length === 0) {
      issues.push({
        severity: "error",
        code: "missing_canonical_edition",
        workId,
        detail: `Work "${workId}" has no canonical edition`,
      });
    }
  }

  for (const edition of registry.editions) {
    for (const companionId of edition.companionEditionIds ?? []) {
      const target = byBookId.get(companionId);
      if (!target) {
        issues.push({
          severity: "error",
          code: "unknown_companion_edition",
          bookId: edition.bookId,
          detail: `Unknown companionEditionId "${companionId}"`,
        });
        continue;
      }
      if (target.workId !== edition.workId) {
        issues.push({
          severity: "error",
          code: "companion_work_mismatch",
          bookId: edition.bookId,
          detail: `Companion "${companionId}" is on work "${target.workId}", expected "${edition.workId}"`,
        });
      }
      if (target.relationship !== "companion") {
        issues.push({
          severity: "warning",
          code: "companion_relationship_mismatch",
          bookId: edition.bookId,
          detail: `Referenced companion "${companionId}" has relationship "${target.relationship}"`,
        });
      }
    }

    if (edition.companionOfEditionId) {
      const target = byBookId.get(edition.companionOfEditionId);
      if (!target) {
        issues.push({
          severity: "error",
          code: "unknown_companion_of",
          bookId: edition.bookId,
          detail: `Unknown companionOfEditionId "${edition.companionOfEditionId}"`,
        });
      } else if (target.workId !== edition.workId) {
        issues.push({
          severity: "error",
          code: "companion_of_work_mismatch",
          bookId: edition.bookId,
          detail: `companionOfEditionId "${edition.companionOfEditionId}" is on a different work`,
        });
      }
    }

    if (edition.supersededByEditionId) {
      const target = byBookId.get(edition.supersededByEditionId);
      if (!target) {
        issues.push({
          severity: "error",
          code: "unknown_superseded_by",
          bookId: edition.bookId,
          detail: `Unknown supersededByEditionId "${edition.supersededByEditionId}"`,
        });
      } else if (target.bookId === edition.bookId) {
        issues.push({
          severity: "error",
          code: "self_supersession",
          bookId: edition.bookId,
          detail: "Edition cannot supersede itself",
        });
      }
    }

    if (edition.replacesEditionId) {
      const target = byBookId.get(edition.replacesEditionId);
      if (!target) {
        issues.push({
          severity: "error",
          code: "unknown_replaces",
          bookId: edition.bookId,
          detail: `Unknown replacesEditionId "${edition.replacesEditionId}"`,
        });
      } else if (target.bookId === edition.bookId) {
        issues.push({
          severity: "error",
          code: "self_replacement",
          bookId: edition.bookId,
          detail: "Edition cannot replace itself",
        });
      }
    }

    if (!edition.firstPublishedAt) {
      issues.push({
        severity: "warning",
        code: "missing_first_published_at",
        bookId: edition.bookId,
        detail: `Edition "${edition.slug}" has no firstPublishedAt (expected until editorial backfill)`,
      });
    }
  }

  // Detect simple superseded cycles (A → B → A).
  for (const edition of registry.editions) {
    if (!edition.supersededByEditionId) continue;
    const seen = new Set<string>([edition.bookId]);
    let current: string | undefined = edition.supersededByEditionId;
    while (current) {
      if (seen.has(current)) {
        issues.push({
          severity: "error",
          code: "circular_supersession",
          bookId: edition.bookId,
          detail: `Circular supersededBy chain involving "${edition.bookId}"`,
        });
        break;
      }
      seen.add(current);
      current = byBookId.get(current)?.supersededByEditionId;
    }
  }

  if (books) {
    const graphById = new Map(books.map((b) => [b.id, b]));

    for (const edition of registry.editions) {
      const graphBook = graphById.get(edition.bookId);
      if (!graphBook) {
        issues.push({
          severity: "error",
          code: "unknown_graph_book_id",
          bookId: edition.bookId,
          detail: `Registry bookId "${edition.bookId}" not found in semantic graph`,
        });
        continue;
      }
      if (graphBook.slug !== edition.slug) {
        issues.push({
          severity: "error",
          code: "slug_mismatch",
          bookId: edition.bookId,
          detail: `Registry slug "${edition.slug}" does not match graph slug "${graphBook.slug}"`,
        });
      }
    }

    for (const book of books) {
      const registered = byBookId.get(book.id);
      if (!registered) {
        issues.push({
          severity: "error",
          code: "missing_registry_entry",
          bookId: book.id,
          detail: `Graph book "${book.slug}" has no publication-registry entry`,
        });
      }
    }

    // WoLTY companion policy checks when both editions exist in the graph.
    const woltyV1 = bySlug.get("when-others-look-to-you-v1");
    const woltyV2 = bySlug.get("when-others-look-to-you-v2");
    if (woltyV1 && woltyV2) {
      if (woltyV1.workId !== woltyV2.workId) {
        issues.push({
          severity: "error",
          code: "wolty_work_split",
          workId: woltyV1.workId,
          detail: "WoLTY v1 and v2 must share the same workId",
        });
      }
      if (woltyV2.relationship === "superseded") {
        issues.push({
          severity: "error",
          code: "wolty_companion_marked_superseded",
          bookId: woltyV2.bookId,
          detail: "WoLTY v2 must be relationship=companion, not superseded",
        });
      }
      if (woltyV2.relationship !== "companion") {
        issues.push({
          severity: "error",
          code: "wolty_v2_not_companion",
          bookId: woltyV2.bookId,
          detail: `WoLTY v2 relationship must be companion (got "${woltyV2.relationship}")`,
        });
      }
      if (!woltyV1.isCanonical || woltyV2.isCanonical) {
        issues.push({
          severity: "error",
          code: "wolty_canonical_policy",
          workId: woltyV1.workId,
          detail: "WoLTY v1 must be the sole canonical edition",
        });
      }
    }
  }

  return issues;
}

export function assertPublicationRegistryHealthy(input: {
  registry: PublicationRegistry;
  books?: readonly Book[];
}): void {
  const errors = collectPublicationRegistryHealthIssues(input).filter(
    (i) => i.severity === "error",
  );
  if (errors.length > 0) {
    const detail = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`Publication registry health failed:\n${detail}`);
  }
}
