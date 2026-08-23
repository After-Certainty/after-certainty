import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const rootAlias = {
  "@": path.resolve(process.cwd()),
};

const sharedExclude = ["node_modules", ".next", "out", "build", "e2e", "**/e2e/**"];

/** Pure Node tests that still touch DOM APIs (localStorage, document, etc.). */
const jsdomTsTests = [
  "lib/a11y/focus-trap.test.ts",
  "lib/analytics/track-reader.test.ts",
  "lib/analytics/track.test.ts",
  "lib/consent/storage.test.ts",
  "lib/consent/update-consent.test.ts",
  "lib/games/pattern-recognition/analytics.test.ts",
  "lib/games/pattern-recognition/storage.test.ts",
  "lib/paths/pathProgress.test.ts",
  "lib/reading/audioPlaybackRate.test.ts",
  "lib/reading/navigate-chapter.test.ts",
  "lib/reading/readingBookmarks.test.ts",
  "lib/reading/readingFavorites.test.ts",
  "lib/reading/readingPreferences.test.ts",
  "lib/reading/readingProgress.test.ts",
  "lib/reading/resolveReadingBookmarks.test.ts",
  "lib/search/miniSearch.test.ts",
  "lib/search/rankingFixtures.test.ts",
  "lib/search/recentSearches.test.ts",
  "lib/search/searchWithinBook.test.ts",
  "lib/storage/safe-local-storage.test.ts",
];

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: rootAlias },
        test: {
          name: "node",
          environment: "node",
          setupFiles: ["./vitest.setup.node.ts"],
          include: ["**/*.test.ts"],
          exclude: [...sharedExclude, ...jsdomTsTests],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: rootAlias },
        test: {
          name: "jsdom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["**/*.test.tsx", ...jsdomTsTests],
          exclude: sharedExclude,
        },
      },
    ],
  },
});
