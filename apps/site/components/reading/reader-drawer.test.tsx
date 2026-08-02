import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReaderDrawer } from "@/components/reading/reader-drawer";

describe("ReaderDrawer", () => {
  it("traps focus in a dialog and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <ReaderDrawer
        open
        onOpenChange={onOpenChange}
        title="Reading controls"
        description="Adjust preferences"
        contentTestId="reader-controls-drawer"
      >
        <button type="button">Inside</button>
      </ReaderDrawer>,
    );

    const dialog = await screen.findByTestId("reader-controls-drawer");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(screen.getByRole("heading", { name: "Reading controls" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <ReaderDrawer
        open={false}
        onOpenChange={onOpenChange}
        title="Reading controls"
        description="Adjust preferences"
        contentTestId="reader-controls-drawer"
      >
        <button type="button">Inside</button>
      </ReaderDrawer>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("reader-controls-drawer")).not.toBeInTheDocument();
    });
  });
});
