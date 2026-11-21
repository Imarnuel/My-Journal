import { defineConfig } from "@playwright/test";
import fs from "node:fs";

// This cloud container ships its own Chromium; elsewhere Playwright uses its own browser.
const PRESET = "/opt/pw-browsers/chromium";
const executablePath = process.env.PW_CHROMIUM || (fs.existsSync(PRESET) ? PRESET : undefined);

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    trace: "off",
    viewport: { width: 1440, height: 1000 },
    // The preinstalled Chromium (this project pins a newer @playwright/test than the bundled browser).
    launchOptions: executablePath ? { executablePath } : {},
  },
  // The sample journal (design preview) is tested everywhere; tests/real runs against the owner's real
  // journal build (`--mode real`: empty, today's date, no sample stand-ins). DESIGN.md › Real app.
  projects: [
    { name: "sample", testIgnore: "real/**", use: { baseURL: "http://localhost:5173" } },
    {
      name: "real",
      testMatch: "real/**/*.spec.ts",
      // A fake microphone for voice notes (Chromium's built-in test device; no real audio needed).
      use: { baseURL: "http://localhost:5174", launchOptions: { ...(executablePath ? { executablePath } : {}), args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] } },
    },
  ],
  webServer: [
    { command: "npx vite --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: true, timeout: 60_000 },
    { command: "npx vite --mode real --port 5174 --strictPort", url: "http://localhost:5174", reuseExistingServer: true, timeout: 60_000 },
  ],
});
