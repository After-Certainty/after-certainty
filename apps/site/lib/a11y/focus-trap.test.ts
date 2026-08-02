import { describe, expect, it, vi } from "vitest";

import { getFocusableElements, trapFocusKeydown } from "@/lib/a11y/focus-trap";

describe("focus-trap", () => {
  it("lists enabled focusable controls", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <button type="button">One</button>
      <button type="button" disabled>Two</button>
      <a href="/x">Link</a>
      <input type="text" />
      <button type="button" aria-hidden="true">Hidden</button>
    `;
    expect(getFocusableElements(root).map((el) => el.textContent?.trim() || el.tagName)).toEqual([
      "One",
      "Link",
      "INPUT",
    ]);
  });

  it("wraps Tab from last to first", () => {
    const root = document.createElement("div");
    root.innerHTML = `<button type="button" id="a">A</button><button type="button" id="b">B</button>`;
    document.body.appendChild(root);
    const a = root.querySelector("#a") as HTMLButtonElement;
    const b = root.querySelector("#b") as HTMLButtonElement;
    b.focus();

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    const prevent = vi.spyOn(event, "preventDefault");
    trapFocusKeydown(event, root);
    expect(prevent).toHaveBeenCalled();
    expect(a).toHaveFocus();
    root.remove();
  });
});
