import { describe, expect, it } from "vitest";

import {
  catalogExceptionalChip,
  formatPublicationMonthYear,
  publicStatusLabel,
} from "@/lib/books/public-status";

describe("public-status", () => {
  it("collapses upcoming workflow statuses to Upcoming", () => {
    expect(publicStatusLabel("forthcoming")).toBe("Upcoming");
    expect(publicStatusLabel("in_progress")).toBe("Upcoming");
    expect(publicStatusLabel("collaborative")).toBe("Upcoming");
    expect(publicStatusLabel("published")).toBeUndefined();
    expect(publicStatusLabel("draft")).toBeUndefined();
  });

  it("prefers a single upcoming chip over edition labels on cards", () => {
    expect(
      catalogExceptionalChip({
        status: "forthcoming",
        editionRelationship: "companion",
        editionLabel: "Companion edition",
      }),
    ).toEqual({ kind: "upcoming", label: "Upcoming" });
  });

  it("shows companion chip when published and non-canonical companion", () => {
    expect(
      catalogExceptionalChip({
        status: "published",
        editionRelationship: "companion",
        editionLabel: "Companion edition",
      }),
    ).toEqual({ kind: "companion", label: "Companion edition" });
  });

  it("omits primary and sole labels on cards", () => {
    expect(
      catalogExceptionalChip({
        status: "published",
        editionRelationship: "primary",
        editionLabel: "Primary volume",
      }),
    ).toBeUndefined();
    expect(
      catalogExceptionalChip({
        status: "published",
        editionRelationship: "sole",
      }),
    ).toBeUndefined();
  });

  it("formats ISO dates as month year", () => {
    expect(formatPublicationMonthYear("2026-07-01")).toBe("July 2026");
    expect(formatPublicationMonthYear("not-a-date")).toBeUndefined();
  });
});
