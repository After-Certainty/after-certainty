import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListenLibrary } from "@/components/listen/listen-library";

vi.mock("@/components/listen/suno-embed", () => ({
  SunoEmbed: ({ externalId, title }: { externalId: string; title: string }) => (
    <div data-testid="suno-embed" data-external-id={externalId} data-title={title} />
  ),
}));

const items = [
  {
    slug: "after-nothing-happens",
    title: "After Nothing Happens",
    shortDescription: "A quieter edit about aftermath and stillness.",
    recordingExternalId: "82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    versionTitle: "Shorter Version",
  },
  {
    slug: "the-truth-got-a-side-door",
    title: "The Truth Got a Side Door",
    shortDescription: "Early-seventies psychedelic soul-funk about revisable sight.",
    recordingExternalId: "84c5ec6d-da90-4213-a114-27a4bd1fa556",
  },
];

describe("ListenLibrary", () => {
  it("renders composition titles and about / suno links with clear hierarchy", () => {
    render(<ListenLibrary items={items} />);

    expect(screen.getByRole("heading", { name: "After Nothing Happens" })).toBeInTheDocument();
    expect(screen.getByText("Shorter Version")).toBeInTheDocument();
    expect(screen.queryByText("After Nothing Happens (Shorter Version)")).not.toBeInTheDocument();

    const about = screen.getAllByRole("link", { name: /about this song/i });
    expect(about[0]).toHaveAttribute("href", "/explore/songs/after-nothing-happens");

    const suno = screen.getAllByRole("link", { name: /listen on suno/i });
    expect(suno[0]).toHaveAttribute(
      "href",
      "https://suno.com/song/82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    );
    expect(suno[0]).toHaveTextContent("Listen on Suno ↗");
    expect(suno[0].className).not.toMatch(/border-border/);

    const embeds = screen.getAllByTestId("suno-embed");
    expect(embeds[0]).toHaveAttribute(
      "data-external-id",
      "82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    );
    expect(embeds[0]).toHaveAttribute("data-title", "After Nothing Happens");
  });

  it("filters by title and short description", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    const input = screen.getByRole("searchbox", { name: /search songs/i });
    await user.type(input, "psychedelic");

    expect(screen.getByRole("heading", { name: "The Truth Got a Side Door" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "After Nothing Happens" })).not.toBeInTheDocument();
  });

  it("announces empty search results", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.type(screen.getByRole("searchbox", { name: /search songs/i }), "zzzz-no-match");

    expect(screen.getByText(/try another title or phrase/i)).toBeInTheDocument();
  });
});
