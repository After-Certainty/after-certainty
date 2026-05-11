import { describe, expect, it } from "vitest";

import { createPageMetadata } from "@/lib/metadata";

describe("createPageMetadata", () => {
  it("sets title and description and forwards them to openGraph and twitter", () => {
    const m = createPageMetadata({
      title: "About",
      description: "Orientation into the project.",
    });
    expect(m.title).toBe("About");
    expect(m.description).toBe("Orientation into the project.");
    expect(m.openGraph?.title).toBe("About");
    expect(m.openGraph?.description).toBe("Orientation into the project.");
    expect(m.twitter?.title).toBe("About");
    expect(m.twitter?.description).toBe("Orientation into the project.");
  });
});
