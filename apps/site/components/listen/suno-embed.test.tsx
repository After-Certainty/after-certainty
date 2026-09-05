import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SunoEmbed } from "@/components/listen/suno-embed";

const RECORDING_ID = "84c5ec6d-da90-4213-a114-27a4bd1fa556";
const RECORDING_ID_B = "11111111-1111-1111-1111-111111111111";

describe("SunoEmbed", () => {
  it("mounts a single iframe with the Suno embed URL and accessible title", () => {
    render(<SunoEmbed externalId={RECORDING_ID} title="The Truth Got a Side Door" />);

    const iframe = screen.getByTitle("The Truth Got a Side Door — Suno player");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", `https://suno.com/embed/${RECORDING_ID}`);
    expect(iframe.tagName).toBe("IFRAME");
    expect(document.querySelectorAll('iframe[title$="— Suno player"]')).toHaveLength(1);
    expect(document.querySelector('[data-suno-embed="mounted"]')).toBeInTheDocument();
  });

  it("shows unavailable status for an invalid recording id", () => {
    render(<SunoEmbed externalId="not-valid" title="Broken" />);

    expect(screen.getByRole("status")).toHaveTextContent(/player unavailable/i);
    expect(screen.queryByTitle(/Suno player/i)).not.toBeInTheDocument();
  });

  it("replaces iframe src when externalId changes without accumulating iframes", () => {
    const { rerender } = render(<SunoEmbed externalId={RECORDING_ID} title="One" />);
    expect(document.querySelectorAll("iframe")).toHaveLength(1);

    rerender(<SunoEmbed externalId={RECORDING_ID_B} title="Two" />);

    const iframes = document.querySelectorAll('iframe[title$="— Suno player"]');
    expect(iframes).toHaveLength(1);
    expect(iframes[0]).toHaveAttribute("src", `https://suno.com/embed/${RECORDING_ID_B}`);
    expect(iframes[0]).toHaveAttribute("title", "Two — Suno player");
  });
});
