import { bookIsPublic } from "@/lib/books/book-metadata";
import type { WhatsNewEvent, WhatsNewManifest } from "@/lib/whats-new/schema";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

export type WhatsNewHealthSeverity = "error" | "warning";

export type WhatsNewHealthIssue = {
  severity: WhatsNewHealthSeverity;
  code: string;
  eventId?: string;
  detail: string;
};

function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * Structural + entity-reference health for What’s New events.
 * Technical rebuilds and draft entities must not appear as public published events.
 */
export function collectWhatsNewHealthIssues(input: {
  manifest: WhatsNewManifest;
  graph?: SemanticGraph;
  podcastEpisodes?: readonly PodcastEpisode[];
}): WhatsNewHealthIssue[] {
  const { manifest, graph, podcastEpisodes } = input;
  const issues: WhatsNewHealthIssue[] = [];
  const ids = new Set<string>();
  const booksById = new Map(graph?.books.map((b) => [b.id, b]) ?? []);
  const episodesById = new Map(podcastEpisodes?.map((e) => [e.id, e]) ?? []);

  const dedupeKeys = new Set<string>();

  for (const event of manifest.events) {
    if (ids.has(event.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_event_id",
        eventId: event.id,
        detail: `Duplicate event id "${event.id}"`,
      });
    }
    ids.add(event.id);

    if (event.visibility === "public" && event.published) {
      const key = `${event.type}:${event.entityType}:${event.entityId ?? event.href}:${event.date}`;
      if (dedupeKeys.has(key)) {
        issues.push({
          severity: "error",
          code: "duplicate_public_event",
          eventId: event.id,
          detail: `Duplicate public event for ${key}`,
        });
      }
      dedupeKeys.add(key);
    }

    if (!event.summary.trim()) {
      issues.push({
        severity: "error",
        code: "missing_summary",
        eventId: event.id,
        detail: "Event summary is required",
      });
    }

    if (event.visibility === "public" && event.published && !isInternalPath(event.href)) {
      // External hrefs are allowed for podcast deep links, but prefer on-site paths.
      if (!/^https?:\/\//i.test(event.href)) {
        issues.push({
          severity: "error",
          code: "invalid_href",
          eventId: event.id,
          detail: `Invalid href "${event.href}"`,
        });
      }
    }

    if (manifest.launchFrom && event.published && event.date < manifest.launchFrom) {
      issues.push({
        severity: "warning",
        code: "before_launch_from",
        eventId: event.id,
        detail: `Event date ${event.date} is before launchFrom ${manifest.launchFrom}`,
      });
    }

    if (event.entityType === "book" && event.entityId && graph) {
      const book = booksById.get(event.entityId);
      if (!book) {
        issues.push({
          severity: "error",
          code: "unknown_book",
          eventId: event.id,
          detail: `Unknown book entityId "${event.entityId}"`,
        });
      } else if (event.published && event.visibility === "public" && !bookIsPublic(book)) {
        issues.push({
          severity: "error",
          code: "draft_book_exposed",
          eventId: event.id,
          detail: `Public event references non-public book "${event.entityId}"`,
        });
      }
    }

    if (event.entityType === "podcast" && event.entityId && podcastEpisodes) {
      if (!episodesById.has(event.entityId)) {
        issues.push({
          severity: "error",
          code: "unknown_podcast",
          eventId: event.id,
          detail: `Unknown podcast entityId "${event.entityId}"`,
        });
      }
    }

    if (event.relatedEditionId && graph) {
      if (!booksById.has(event.relatedEditionId)) {
        issues.push({
          severity: "error",
          code: "unknown_related_edition",
          eventId: event.id,
          detail: `Unknown relatedEditionId "${event.relatedEditionId}"`,
        });
      }
    }

    if (event.type === "book_revised" && event.source !== "authored") {
      issues.push({
        severity: "error",
        code: "revised_not_authored",
        eventId: event.id,
        detail: "book_revised must be authored",
      });
    }

    if (event.published && event.visibility === "public" && !event.image) {
      issues.push({
        severity: "warning",
        code: "missing_image",
        eventId: event.id,
        detail: "Public event has no image",
      });
    }
  }

  return issues;
}

export function assertWhatsNewHealthy(input: {
  manifest: WhatsNewManifest;
  graph?: SemanticGraph;
  podcastEpisodes?: readonly PodcastEpisode[];
}): void {
  const errors = collectWhatsNewHealthIssues(input).filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const detail = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`What’s New health failed:\n${detail}`);
  }
}

/** Policy helper for tests / docs: these change kinds must never become public events. */
export function isTechnicalOnlyChange(description: string): boolean {
  const text = description.toLowerCase();
  const patterns = [
    "typo",
    "dependency",
    "npm audit",
    "manifest rebuild",
    "generatedat",
    "cover optimization",
    "ci configuration",
    "lockfile",
    "eslint",
    "prettier",
  ];
  return patterns.some((p) => text.includes(p));
}

export type { WhatsNewEvent };
