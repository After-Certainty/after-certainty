import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SUNO_EMBED_ENTER_ROOT_MARGIN,
  SUNO_EMBED_EXIT_ROOT_MARGIN,
  SunoEmbed,
} from "@/components/listen/suno-embed";

const RECORDING_ID = "84c5ec6d-da90-4213-a114-27a4bd1fa556";
const RECORDING_ID_B = "11111111-1111-1111-1111-111111111111";
const RECORDING_ID_C = "22222222-2222-2222-2222-222222222222";

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  rootMargin: string;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

function fire(observer: ObserverInstance, isIntersecting: boolean) {
  act(() => {
    observer.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
  });
}

describe("SunoEmbed", () => {
  let observers: ObserverInstance[];

  beforeEach(() => {
    observers = [];

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string;
      readonly thresholds: ReadonlyArray<number> = [];
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];

      constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        this.rootMargin = options?.rootMargin ?? "0px";
        observers.push({
          callback,
          rootMargin: this.rootMargin,
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

  function enterObservers(): ObserverInstance[] {
    return observers.filter((o) => o.rootMargin === SUNO_EMBED_ENTER_ROOT_MARGIN);
  }

  function exitObservers(): ObserverInstance[] {
    return observers.filter((o) => o.rootMargin === SUNO_EMBED_EXIT_ROOT_MARGIN);
  }

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

  it("mounts when the enter observer reports intersecting and keeps observers connected", () => {
    render(<SunoEmbed externalId={RECORDING_ID} title="Side Door" />);
    expect(enterObservers()).toHaveLength(1);
    expect(exitObservers()).toHaveLength(1);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();

    fire(enterObservers()[0]!, true);

    const iframe = screen.getByTitle("Side Door — Suno player");
    expect(iframe).toHaveAttribute("src", `https://suno.com/embed/${RECORDING_ID}`);
    expect(enterObservers()[0]!.disconnect).not.toHaveBeenCalled();
    expect(exitObservers()[0]!.disconnect).not.toHaveBeenCalled();
  });

  it("unmounts when the exit observer reports the card is far away", () => {
    render(<SunoEmbed externalId={RECORDING_ID} title="Side Door" />);

    fire(enterObservers()[0]!, true);
    expect(screen.getByTitle("Side Door — Suno player")).toBeInTheDocument();

    fire(exitObservers()[0]!, false);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /load player/i })).toBeInTheDocument();
  });

  it("does not unmount while still inside the exit hysteresis band", () => {
    render(<SunoEmbed externalId={RECORDING_ID} title="Side Door" />);

    fire(enterObservers()[0]!, true);
    expect(screen.getByTitle("Side Door — Suno player")).toBeInTheDocument();

    // Left the enter band but still inside the exit band — stay mounted.
    fire(enterObservers()[0]!, false);
    fire(exitObservers()[0]!, true);
    expect(screen.getByTitle("Side Door — Suno player")).toBeInTheDocument();
  });

  it("does not mount an iframe for an invalid recording id", () => {
    render(<SunoEmbed externalId="not-valid" title="Broken" />);
    expect(screen.getByRole("status")).toHaveTextContent(/unavailable/i);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();
    expect(observers).toHaveLength(0);
  });

  it("keeps only near-viewport embeds mounted across many instances", () => {
    render(
      <>
        <SunoEmbed externalId={RECORDING_ID} title="One" />
        <SunoEmbed externalId={RECORDING_ID_B} title="Two" />
        <SunoEmbed externalId={RECORDING_ID_C} title="Three" />
      </>,
    );

    expect(enterObservers()).toHaveLength(3);
    expect(exitObservers()).toHaveLength(3);

    // Only the first two enter the near band.
    fire(enterObservers()[0]!, true);
    fire(enterObservers()[1]!, true);
    fire(exitObservers()[0]!, true);
    fire(exitObservers()[1]!, true);
    // Third stays far outside the exit band.
    fire(enterObservers()[2]!, false);
    fire(exitObservers()[2]!, false);

    expect(screen.getByTitle("One — Suno player")).toBeInTheDocument();
    expect(screen.getByTitle("Two — Suno player")).toBeInTheDocument();
    expect(screen.queryByTitle("Three — Suno player")).not.toBeInTheDocument();
    expect(document.querySelectorAll("iframe")).toHaveLength(2);

    // Scroll past the first: leave the exit band → unmount.
    fire(exitObservers()[0]!, false);
    expect(screen.queryByTitle("One — Suno player")).not.toBeInTheDocument();
    expect(screen.getByTitle("Two — Suno player")).toBeInTheDocument();
    expect(document.querySelectorAll("iframe")).toHaveLength(1);

    // Bring the third near; still only a small set mounted.
    fire(enterObservers()[2]!, true);
    fire(exitObservers()[2]!, true);
    expect(document.querySelectorAll("iframe")).toHaveLength(2);
    expect(within(document.body).getByTitle("Three — Suno player")).toBeInTheDocument();
  });
});
