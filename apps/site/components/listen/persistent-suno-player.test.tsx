import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PersistentSunoPlayer } from "@/components/listen/persistent-suno-player";

vi.mock("@/components/listen/suno-embed", () => ({
  SunoEmbed: ({ externalId, title }: { externalId: string; title: string }) => (
    <div data-testid="suno-embed" data-external-id={externalId} data-title={title} />
  ),
}));

const song = {
  slug: "the-truth-got-a-side-door",
  title: "The Truth Got a Side Door",
  recordingExternalId: "84c5ec6d-da90-4213-a114-27a4bd1fa556",
  versionTitle: "Album Version",
};

describe("PersistentSunoPlayer", () => {
  it("renders canonical title, embed, About and Suno links", () => {
    render(
      <PersistentSunoPlayer
        song={song}
        hasPrevious={false}
        hasNext
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Now Playing")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Truth Got a Side Door" })).toBeInTheDocument();
    expect(screen.getByText("Album Version")).toBeInTheDocument();
    expect(screen.queryByText(/The Truth Got a Side Door \(Album/)).not.toBeInTheDocument();

    const embed = screen.getByTestId("suno-embed");
    expect(embed).toHaveAttribute("data-external-id", song.recordingExternalId);
    expect(embed).toHaveAttribute("data-title", "The Truth Got a Side Door");

    expect(screen.getByRole("link", { name: /about this song/i })).toHaveAttribute(
      "href",
      "/explore/songs/the-truth-got-a-side-door",
    );
    expect(screen.getByRole("link", { name: /listen on suno/i })).toHaveAttribute(
      "href",
      `https://suno.com/song/${song.recordingExternalId}`,
    );
  });

  it("disables Previous on the first item and calls onNext", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <PersistentSunoPlayer
        song={song}
        hasPrevious={false}
        hasNext
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous song" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next song" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next song" }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(onPrevious).not.toHaveBeenCalled();
  });

  it("disables Next on the final item and calls onPrevious", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <PersistentSunoPlayer
        song={song}
        hasPrevious
        hasNext={false}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(screen.getByRole("button", { name: "Next song" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous song" }));
    expect(onPrevious).toHaveBeenCalledOnce();
  });
});
