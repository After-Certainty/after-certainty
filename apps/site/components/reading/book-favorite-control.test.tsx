import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BookFavoriteControl } from "@/components/reading/book-favorite-control";
import { isFavoriteBook, listFavoriteBookIds } from "@/lib/reading/readingFavorites";

describe("BookFavoriteControl", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("toggles favorite with device-only labeling", async () => {
    const user = userEvent.setup();
    render(<BookFavoriteControl bookId="book-after-certainty" />);

    const button = screen.getByTestId("book-favorite-control");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/saved on this device only/i)).toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Remove favorite");
    expect(isFavoriteBook("book-after-certainty")).toBe(true);
    expect(listFavoriteBookIds()).toEqual(["book-after-certainty"]);

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(isFavoriteBook("book-after-certainty")).toBe(false);
  });
});
