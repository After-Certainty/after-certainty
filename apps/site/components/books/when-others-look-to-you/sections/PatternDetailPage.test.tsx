import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPatternBySlug, type PatternCardItem } from "@/lib/books/when-others-look-to-you/content";

import { PatternDetailPage } from "./PatternDetailPage";

function patternFromBase(
  baseSlug: string,
  overrides: Partial<PatternCardItem["detail"]>,
): PatternCardItem {
  const base = getPatternBySlug(baseSlug)!;
  return {
    ...base,
    detail: { ...base.detail, ...overrides },
  };
}

describe("PatternDetailPage", () => {
  it("renders a YouTube iframe when detail.youtubeVideoId is set", () => {
    const pattern = patternFromBase("attention-finds-a-focus", {
      youtubeVideoId: "testVideoId123",
    });
    render(<PatternDetailPage pattern={pattern} />);

    const iframe = screen.getByTitle(/attention finds a focus — related video/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/testVideoId123");
  });

  it("does not render a YouTube iframe when detail.youtubeVideoId is absent", () => {
    const pattern = patternFromBase("attention-finds-a-focus", {
      youtubeVideoId: undefined,
    });
    render(<PatternDetailPage pattern={pattern} />);

    expect(screen.queryByTitle(/related video/i)).not.toBeInTheDocument();
    const iframes = document.querySelectorAll("iframe");
    expect(iframes.length).toBe(0);
  });

  it("renders Read on Medium when detail.mediumArticleHref is set", () => {
    const pattern = patternFromBase("dissent-is-welcomed", {
      mediumArticleHref: "https://medium.com/@example/test-article",
    });
    render(<PatternDetailPage pattern={pattern} />);

    const link = screen.getByRole("link", { name: /read on medium/i });
    expect(link).toHaveAttribute("href", "https://medium.com/@example/test-article");
  });

  it("renders an infographic when detail.infographic is set", () => {
    const pattern = patternFromBase("attention-finds-a-focus", {
      infographic: {
        src: "/books/when-others-look-to-you/assets/attention-finds-a-focus.png",
        width: 100,
        height: 100,
        alt: "Test infographic alt",
      },
    });
    render(<PatternDetailPage pattern={pattern} />);

    const img = screen.getByRole("img", { name: /test infographic alt/i });
    expect(img).toHaveAttribute("src");
    expect(img.getAttribute("src")).toMatch(/attention-finds-a-focus/);
  });

  it("shows the infographic above Related ideas when there is no YouTube video", () => {
    const pattern = patternFromBase("attention-finds-a-focus", {
      youtubeVideoId: undefined,
      infographic: {
        src: "/books/when-others-look-to-you/assets/attention-finds-a-focus.png",
        width: 10,
        height: 10,
        alt: "Infographic without video",
      },
    });
    render(<PatternDetailPage pattern={pattern} />);

    expect(screen.queryByTitle(/related video/i)).not.toBeInTheDocument();
    const img = screen.getByRole("img", {
      name: /infographic without video/i,
    });
    const relatedIdeas = screen.getByText("Related ideas");
    expect(img.compareDocumentPosition(relatedIdeas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("lists the YouTube iframe before the infographic when both are set", () => {
    const pattern = patternFromBase("attention-finds-a-focus", {
      youtubeVideoId: "abc123",
      infographic: {
        src: "/books/when-others-look-to-you/assets/attention-finds-a-focus.png",
        width: 10,
        height: 10,
        alt: "Infographic alt",
      },
    });
    render(<PatternDetailPage pattern={pattern} />);

    const iframe = screen.getByTitle(/related video/i);
    const img = screen.getByRole("img", { name: /infographic alt/i });
    const relatedIdeas = screen.getByText("Related ideas");
    expect(iframe.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(img.compareDocumentPosition(relatedIdeas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
