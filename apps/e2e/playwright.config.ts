import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // The photos-api runs from its own repo; this only checks that it's up.
  globalSetup: "./global-setup.ts",
  webServer: [
    {
      command: "pnpm --filter @ethannet/ui dev",
      // Wait on the port, not on `/`: the home page needs the photos-api, and a
      // missing api should fail in global setup with a clear message instead.
      port: 3000,
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
    },
  ],
  use: { baseURL: "http://localhost:3000" },
});
