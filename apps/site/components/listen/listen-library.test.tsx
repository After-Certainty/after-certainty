import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
let mockParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/listen",
  useSearchParams: () => mockParams,
}));

vi.mock("@/components/listen/suno-embed", () => ({
  SunoEmbed: ({ externalId, title }: { externalId: string; title: string }) => (
    <iframe
      title={`${title} — Suno player`}
      src={`https://suno.com/embed/${externalId}`}
      data-testid="suno-iframe"
      data-external-id={externalId}
    />
  ),
}));

import { ListenLibrary } from "@/components/listen/listen-library";

const items = [
  {
    slug: "the-truth-got-a-side-door",
    title: "The Truth Got a Side Door",
    shortDescription: "Early-seventies psychedelic soul-funk about revisable sight.",
    recordingExternalId: "84c5ec6d-da90-4213-a114-27a4bd1fa556",
  },
  {
    slug: "dont-let-the-score-fool-you",
    title: "Don't Let the Score Fool You",
    shortDescription: "A groove about metrics that mislead.",
    recordingExternalId: "fdf8353b-6440-4f2d-a2cf-515a8418cb45",
  },
  {
    slug: "after-nothing-happens",
    title: "After Nothing Happens",
    shortDescription: "A quieter edit about aftermath and stillness.",
    recordingExternalId: "82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    versionTitle: "Shorter Version",
  },
];

describe("ListenLibrary", () => {
  beforeEach(() => {
    replace.mockReset();
    mockParams = new URLSearchParams();
  });

  it("renders all playable songs and exactly one Suno iframe", () => {
    render(<ListenLibrary items={items} />);

    // Player (h2) and list row (h3) share the current title — scope list by level.
    expect(screen.getByRole("heading", { level: 2, name: "The Truth Got a Side Door" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "The Truth Got a Side Door" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Don't Let the Score Fool You" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "After Nothing Happens" })).toBeInTheDocument();

    const iframes = screen.getAllByTestId("suno-iframe");
    expect(iframes).toHaveLength(1);
    expect(iframes[0]).toHaveAttribute(
      "data-external-id",
      "84c5ec6d-da90-4213-a114-27a4bd1fa556",
    );
  });

  it("starts on the first playlist song and disables Previous", () => {
    render(<ListenLibrary items={items} />);

    const player = screen.getByTestId("suno-iframe").closest("[data-listen-player]")!;
    expect(within(player as HTMLElement).getByRole("button", { name: "Previous song" })).toBeDisabled();
    expect(within(player as HTMLElement).getByRole("button", { name: "Next song" })).toBeEnabled();
  });

  it("selecting another song changes iframe source without adding a second iframe", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.click(screen.getByRole("button", { name: "Play Don't Let the Score Fool You" }));

    const iframes = screen.getAllByTestId("suno-iframe");
    expect(iframes).toHaveLength(1);
    expect(iframes[0]).toHaveAttribute(
      "data-external-id",
      "fdf8353b-6440-4f2d-a2cf-515a8418cb45",
    );
    expect(screen.getByText("Now playing")).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/listen?song=dont-let-the-score-fool-you", {
      scroll: false,
    });
  });

  it("Next and Previous move through playlist order and disable at ends", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.click(screen.getByRole("button", { name: "Next song" }));
    expect(screen.getByTestId("suno-iframe")).toHaveAttribute(
      "data-external-id",
      "fdf8353b-6440-4f2d-a2cf-515a8418cb45",
    );

    await user.click(screen.getByRole("button", { name: "Next song" }));
    expect(screen.getByTestId("suno-iframe")).toHaveAttribute(
      "data-external-id",
      "82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    );
    expect(screen.getByRole("button", { name: "Next song" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Previous song" }));
    expect(screen.getByTestId("suno-iframe")).toHaveAttribute(
      "data-external-id",
      "fdf8353b-6440-4f2d-a2cf-515a8418cb45",
    );
  });

  it("keeps canonical composition title and correct About / Suno links on the player", () => {
    render(<ListenLibrary items={items} initialSongSlug="after-nothing-happens" />);

    const player = document.querySelector("[data-listen-player]")!;
    expect(
      within(player as HTMLElement).getByRole("heading", { name: "After Nothing Happens" }),
    ).toBeInTheDocument();
    expect(within(player as HTMLElement).getByText("Shorter Version")).toBeInTheDocument();
    expect(screen.queryByText("After Nothing Happens (Shorter Version)")).not.toBeInTheDocument();

    expect(within(player as HTMLElement).getByRole("link", { name: /about this song/i })).toHaveAttribute(
      "href",
      "/explore/songs/after-nothing-happens",
    );
    expect(within(player as HTMLElement).getByRole("link", { name: /listen on suno/i })).toHaveAttribute(
      "href",
      "https://suno.com/song/82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    );
  });

  it("search filters the list without clearing the current player", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.type(screen.getByRole("searchbox", { name: /search songs/i }), "aftermath");

    expect(
      screen.queryByRole("heading", { name: "The Truth Got a Side Door", level: 3 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "After Nothing Happens", level: 3 })).toBeInTheDocument();

    expect(screen.getByTestId("suno-iframe")).toHaveAttribute(
      "data-external-id",
      "84c5ec6d-da90-4213-a114-27a4bd1fa556",
    );
    const player = document.querySelector("[data-listen-player]")!;
    expect(
      within(player as HTMLElement).getByRole("heading", { name: "The Truth Got a Side Door" }),
    ).toBeInTheDocument();
  });

  it("selecting a visible filtered song updates the player", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.type(screen.getByRole("searchbox", { name: /search songs/i }), "aftermath");
    await user.click(screen.getByRole("button", { name: "Play After Nothing Happens" }));

    expect(screen.getByTestId("suno-iframe")).toHaveAttribute(
      "data-external-id",
      "82ca255e-4a41-4a3f-9392-0cc46287f7ba",
    );
  });

  it("places Explore songs above search for mobile listening-first flow", () => {
    render(<ListenLibrary items={items} />);

    const explore = screen.getByRole("link", { name: "Explore songs →" });
    expect(explore).toHaveAttribute("href", "/explore/songs");

    const search = screen.getByRole("searchbox", { name: /search songs/i });
    expect(
      explore.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("announces empty search results without clearing the player", async () => {
    const user = userEvent.setup();
    render(<ListenLibrary items={items} />);

    await user.type(screen.getByRole("searchbox", { name: /search songs/i }), "zzzz-no-match");

    expect(screen.getByText(/try another title or phrase/i)).toBeInTheDocument();
    expect(screen.getByTestId("suno-iframe")).toBeInTheDocument();
  });
});
