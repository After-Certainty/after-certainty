import { describe, expect, it } from "vitest";
import { getPatternBySlug } from "@/lib/books/when-others-look-to-you/content";
import { mergePatternWithManifestMedia } from "@/lib/books/when-others-look-to-you/manifest-media";
import type { Pattern } from "@/types/semanticGraph";

describe("mergePatternWithManifestMedia", () => {
  it("overlays youtube, medium, and infographic from the manifest", () => {
    const base = getPatternBySlug("dissent-is-welcomed");
    expect(base).toBeDefined();

    const manifestPattern: Pattern = {
      id: "pattern-dissent-is-welcomed",
      slug: "dissent-is-welcomed",
      title: "Dissent is Welcomed",
      summary: "sum",
      youtubeVideoId: "from-manifest",
      mediumArticleUrl: "https://medium.com/@example/from-manifest",
      infographic: {
        url: "https://raw.githubusercontent.com/ksteffe/after-certainty/main/semantic/media/patterns/dissent-is-welcomed.png",
        path: "semantic/media/patterns/dissent-is-welcomed.png",
        width: 1200,
        height: 669,
        alt: "Manifest alt",
      },
    };

    const merged = mergePatternWithManifestMedia(base!, manifestPattern);
    expect(merged.detail.youtubeVideoId).toBe("from-manifest");
    expect(merged.detail.mediumArticleHref).toBe("https://medium.com/@example/from-manifest");
    expect(merged.detail.infographic?.src).toContain("raw.githubusercontent.com");
    expect(merged.detail.infographic?.alt).toBe("Manifest alt");
  });

  it("returns the local pattern when manifest has no media fields", () => {
    const base = getPatternBySlug("attention-finds-a-focus");
    expect(base).toBeDefined();
    const merged = mergePatternWithManifestMedia(base!, {
      id: "pattern-attention-finds-a-focus",
      slug: "attention-finds-a-focus",
      title: "Attention Finds a Focus",
      summary: "sum",
    });
    expect(merged).toBe(base);
  });
});
