import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Prefer the installed same-checkout local manifest during Vitest runs
process.env.SEMANTIC_MANIFEST_OFFLINE ??= "1";
process.env.SEMANTIC_MANIFEST_USE_LOCAL ??= "1";

afterEach(() => {
  cleanup();
});
