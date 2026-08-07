import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChapterAudioPlayer } from "@/components/reading/chapter-audio-player";
import {
  AUDIO_PLAYBACK_RATE_STORAGE_KEY,
  clearAudioPlaybackRate,
  setAudioPlaybackRate,
} from "@/lib/reading/audioPlaybackRate";
import type { ChapterAudioUnit } from "@/lib/reading/chapter-audio";
import type { ChapterAudioAlignment } from "@/lib/reading/chapter-audio-alignment";

vi.mock("@/lib/reading/navigate-chapter", () => ({
  registerChapterAudioElement: () => () => undefined,
}));

const digest = `sha256:${"a".repeat(64)}`;

const unit: ChapterAudioUnit = {
  unitId: "chapter-observer-patterns-front-matter-introduction",
  editionSlug: "observer-patterns",
  chapterSlug: "front-matter-introduction",
  routeKey: "/explore/books/observer-patterns/chapters/front-matter-introduction",
  audioUrl: "/generated/audio/observer-patterns/front-matter-introduction.mp3",
  durationSeconds: 12,
  alignmentUrl: "/generated/audio/observer-patterns/front-matter-introduction.alignment.json",
  alignmentGranularity: "segment-only",
  generationHash: digest,
  disclosure: "AI-generated narration",
};

const alignment: ChapterAudioAlignment = {
  schemaVersion: 1,
  unitId: unit.unitId,
  generationHash: digest,
  granularity: "segment-only",
  segments: [{ id: "s0001", text: "Hi.", startMs: 0, endMs: 100 }],
};

describe("ChapterAudioPlayer", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAudioPlaybackRate();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders an always-visible dock without a Listen expand CTA", () => {
    render(<ChapterAudioPlayer audio={unit} alignment={alignment} />);

    expect(screen.getByTestId("chapter-audio-player")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Chapter audio" })).toBeInTheDocument();
    expect(screen.getByTestId("chapter-audio-element")).toHaveAttribute("src", unit.audioUrl);
    expect(screen.getByText("AI-generated narration")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /listen/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("chapter-audio-listen")).not.toBeInTheDocument();
  });

  it("renders a playback speed control defaulting to 1×", () => {
    render(<ChapterAudioPlayer audio={unit} alignment={alignment} />);

    const speed = screen.getByRole("combobox", { name: "Playback speed" });
    expect(speed).toHaveValue("1");
    expect(screen.getByTestId("chapter-audio-element")).toHaveProperty("playbackRate", 1);
  });

  it("applies the selected playback rate to the audio element and persists it", async () => {
    const user = userEvent.setup();
    render(<ChapterAudioPlayer audio={unit} alignment={alignment} />);

    const speed = screen.getByRole("combobox", { name: "Playback speed" });
    await user.selectOptions(speed, "1.5");

    expect(speed).toHaveValue("1.5");
    expect(screen.getByTestId("chapter-audio-element")).toHaveProperty("playbackRate", 1.5);
    expect(window.localStorage.getItem(AUDIO_PLAYBACK_RATE_STORAGE_KEY)).toContain("1.5");
  });

  it("restores a previously stored playback rate on mount", () => {
    setAudioPlaybackRate(1.75);
    render(<ChapterAudioPlayer audio={unit} alignment={alignment} />);

    expect(screen.getByRole("combobox", { name: "Playback speed" })).toHaveValue("1.75");
    expect(screen.getByTestId("chapter-audio-element")).toHaveProperty("playbackRate", 1.75);
  });
});
