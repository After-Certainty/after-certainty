import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditionNotice } from "@/components/books/edition-notice";
import { StatusLabel } from "@/components/books/status-label";

describe("StatusLabel", () => {
  it("exposes the label text to assistive tech", () => {
    render(<StatusLabel label="Companion edition" kind="companion" />);
    expect(screen.getByLabelText("Companion edition")).toHaveTextContent("Companion edition");
  });
});

describe("EditionNotice", () => {
  it("renders a companion notice with link to the primary volume", () => {
    render(
      <EditionNotice
        bookId="book-when-others-look-to-you-v2"
        status="published"
        relationship="companion"
        editionLabel="Companion edition"
        relatedHref="/explore/books/when-others-look-to-you-v1"
        relatedTitle="When Others Look to You"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/Companion edition/i);
    expect(screen.getByRole("link", { name: "When Others Look to You" })).toHaveAttribute(
      "href",
      "/explore/books/when-others-look-to-you-v1",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/not a replacement/i);
  });

  it("renders a superseded notice with continue link", () => {
    render(
      <EditionNotice
        bookId="book-old"
        status="published"
        relationship="superseded"
        relatedHref="/explore/books/current"
        relatedTitle="Current Book"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/has been superseded/i);
    expect(screen.getByRole("link", { name: "Current Book" })).toHaveAttribute(
      "href",
      "/explore/books/current",
    );
  });

  it("renders upcoming notice without edition relationship", () => {
    render(<EditionNotice bookId="book-soon" status="forthcoming" relationship="sole" />);
    expect(screen.getByRole("status")).toHaveTextContent(/Upcoming/i);
  });

  it("links companion from primary volume", () => {
    render(
      <EditionNotice
        bookId="book-when-others-look-to-you-v1"
        status="published"
        relationship="primary"
        companionHref="/explore/books/when-others-look-to-you-v2"
        companionTitle="When Others Look to You: Companion Edition"
      />,
    );
    expect(
      screen.getByRole("link", { name: "When Others Look to You: Companion Edition" }),
    ).toHaveAttribute("href", "/explore/books/when-others-look-to-you-v2");
  });
});
