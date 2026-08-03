import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MobileDisclosure, MobileDisclosureGroup } from "@/components/ui/mobile-disclosure";

describe("MobileDisclosure", () => {
  it("exposes aria-expanded and aria-controls on the toggle", () => {
    render(
      <MobileDisclosure summary={<span>Row title</span>} regionLabel="Row title">
        <p>Panel body</p>
      </MobileDisclosure>,
    );

    const toggle = screen.getByRole("button", { name: /Row title/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panelId = toggle.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveAttribute("role", "region");
    expect(document.getElementById(panelId!)).toHaveAttribute("aria-label", "Row title");
  });

  it("toggles open and closed via click and keyboard", async () => {
    const user = userEvent.setup();
    render(
      <MobileDisclosure summary={<span>Disclosure</span>} regionLabel="Disclosure">
        <p>Panel copy</p>
      </MobileDisclosure>,
    );

    const toggle = screen.getByRole("button", { name: /Disclosure/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    toggle.focus();
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("starts open when defaultOpen is true", () => {
    render(
      <MobileDisclosure summary={<span>Open row</span>} regionLabel="Open row" defaultOpen>
        <p>Already visible</p>
      </MobileDisclosure>,
    );

    expect(screen.getByRole("button", { name: /Open row/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Already visible")).toBeInTheDocument();
  });
});

describe("MobileDisclosureGroup", () => {
  it("keeps only one item open at a time when type is single", async () => {
    const user = userEvent.setup();
    render(
      <MobileDisclosureGroup type="single" defaultOpenId="a">
        <MobileDisclosure id="a" summary={<span>First</span>} regionLabel="First">
          <p>Body A</p>
        </MobileDisclosure>
        <MobileDisclosure id="b" summary={<span>Second</span>} regionLabel="Second">
          <p>Body B</p>
        </MobileDisclosure>
      </MobileDisclosureGroup>,
    );

    const first = screen.getByRole("button", { name: /First/i });
    const second = screen.getByRole("button", { name: /Second/i });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("allows multiple open items when type is multiple", async () => {
    const user = userEvent.setup();
    render(
      <MobileDisclosureGroup type="multiple">
        <MobileDisclosure id="a" summary={<span>Alpha</span>} regionLabel="Alpha" defaultOpen>
          <p>Body Alpha</p>
        </MobileDisclosure>
        <MobileDisclosure id="b" summary={<span>Beta</span>} regionLabel="Beta">
          <p>Body Beta</p>
        </MobileDisclosure>
      </MobileDisclosureGroup>,
    );

    const alpha = screen.getByRole("button", { name: /Alpha/i });
    const beta = screen.getByRole("button", { name: /Beta/i });
    expect(alpha).toHaveAttribute("aria-expanded", "true");

    await user.click(beta);
    expect(alpha).toHaveAttribute("aria-expanded", "true");
    expect(beta).toHaveAttribute("aria-expanded", "true");
  });
});
