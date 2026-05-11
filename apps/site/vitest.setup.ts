import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Avoid fetching the release manifest from GitHub during Vitest runs
process.env.BOOKS_MANIFEST_OFFLINE ??= "1";

afterEach(() => {
  cleanup();
});
