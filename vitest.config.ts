import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    coverage: {
      reporter: ["text", "json-summary", "json", "lcov"],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      exclude: [
        "src/hooks/useSpotifyQueries.ts",
        "src/hooks/useSpotifyMutations.ts",
        "src/hooks/useProfileQuery.ts",
        "src/hooks/user-query-keys.ts",
      ],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60,
      },
    },
  },
});
