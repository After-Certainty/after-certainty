import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeInvitations } from "@/components/home/home-invitations";

describe("HomeInvitations", () => {
  it("offers four invitation links without catalog tiles", () => {
    render(<HomeInvitations />);

    expect(screen.getByRole("link", { name: /^Start Here/i })).toHaveAttribute("href", "/start");
    expect(screen.getByRole("link", { name: /^Books/i })).toHaveAttribute("href", "/explore/books");
    expect(screen.getByRole("link", { name: /^Podcast/i })).toHaveAttribute("href", "/podcast");
    expect(screen.getByRole("link", { name: /^About/i })).toHaveAttribute("href", "/about");

    expect(screen.queryByRole("link", { name: /^Patterns/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^Concepts/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /^Search/i })).toBeNull();
  });
});
