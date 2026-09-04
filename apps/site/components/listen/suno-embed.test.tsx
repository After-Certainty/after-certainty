import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SunoEmbed } from "@/components/listen/suno-embed";

const RECORDING_ID = "84c5ec6d-da90-4213-a114-27a4bd1fa556";

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

describe("SunoEmbed", () => {
  let observers: ObserverInstance[];

  beforeEach(() => {
    observers = [];

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin = "";
      readonly thresholds: ReadonlyArray<number> = [];
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];

      constructor(callback: IntersectionObserverCallback) {
        observers.push({
          callback,
          observe: this.observe,
          disconnect: this.disconnect,
        });
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a placeholder until Load player is pressed", async () => {
    const user = userEvent.setup();
    render(<SunoEmbed externalId={RECORDING_ID} title="The Truth Got a Side Door" />);

    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /load player/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /load player/i }));

    const iframe = screen.getByTitle("The Truth Got a Side Door — Suno player");
    expect(iframe).toHaveAttribute("src", `https://suno.com/embed/${RECORDING_ID}`);
    expect(iframe).toHaveAttribute(
      "allow",
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
    );
    expect(iframe).toHaveAttribute("loading", "lazy");
  });

  it("mounts the iframe when the container intersects the viewport", () => {
    render(<SunoEmbed externalId={RECORDING_ID} title="Side Door" />);
    expect(observers).toHaveLength(1);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();

    act(() => {
      observers[0]!.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observers[0] as unknown as IntersectionObserver,
      );
    });

    const iframe = screen.getByTitle("Side Door — Suno player");
    expect(iframe).toHaveAttribute("src", `https://suno.com/embed/${RECORDING_ID}`);
    expect(observers[0]!.disconnect).toHaveBeenCalled();
  });

  it("does not mount an iframe for an invalid recording id", () => {
    render(<SunoEmbed externalId="not-valid" title="Broken" />);
    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();
  });
});
