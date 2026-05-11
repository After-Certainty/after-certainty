import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a link when href is provided", () => {
    render(<Button href="/book">Read the book</Button>);
    const link = screen.getByRole("link", { name: /read the book/i });
    expect(link).toHaveAttribute("href", "/book");
  });

  it("renders a native button when href is omitted", () => {
    render(
      <Button type="button" onClick={() => undefined}>
        Press me
      </Button>,
    );
    expect(screen.getByRole("button", { name: /press me/i })).toBeInTheDocument();
  });
});
