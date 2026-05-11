import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ResourcesPage from "./page";

describe("resources page", () => {
  it("lists Medium articles using pattern names as link text", async () => {
    const ui = await ResourcesPage();
    render(ui);

    const section = screen.getByRole("heading", { name: /medium articles/i }).closest("section");

    expect(section).not.toBeNull();
    expect(
      within(section!).getByRole("link", {
        name: "Feedback Drives Change",
      }),
    ).toHaveAttribute(
      "href",
      "https://medium.com/@steffensen.kevin/feedback-drives-change-2c7251f46610",
    );
  });

  it("lists YouTube videos as outbound watch links using pattern names", async () => {
    const ui = await ResourcesPage();
    render(ui);

    const section = screen.getByRole("heading", { name: /youtube videos/i }).closest("section");

    expect(section).not.toBeNull();
    expect(
      within(section!).getByRole("link", {
        name: "Feedback Drives Change",
      }),
    ).toHaveAttribute("href", "https://www.youtube.com/watch?v=duyBPIOz94Y");
  });
});
