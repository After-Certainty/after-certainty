import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NewsletterForm } from "./NewsletterForm";

describe("NewsletterForm", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs JSON to /api/subscribe on submit", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<NewsletterForm />);

    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/on the list/i);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subscribe",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      email: "reader@example.com",
    });
  });

  it("shows loading label while fetch is pending", async () => {
    const user = userEvent.setup();
    let resolve!: (value: Response) => void;
    const pending = new Promise<Response>((res) => {
      resolve = res;
    });
    fetchMock.mockImplementationOnce(() => pending);

    render(<NewsletterForm />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    expect(screen.getByRole("button")).toHaveTextContent(/subscribing/i);

    resolve!(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("shows API error message when response is not ok", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Already on list" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<NewsletterForm />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Already on list");
    });
  });

  it("shows network error when fetch throws", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<NewsletterForm />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network error/i);
    });
  });

  it("disables input and submit after success", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<NewsletterForm />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: /^subscribe$/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
