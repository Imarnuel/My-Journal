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
    baseURL: "http://localhost:5173",
    trace: "off",
    viewport: { width: 1440, height: 1000 },
    // The preinstalled Chromium (this project pins a newer @playwright/test than the bundled browser).
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: { command: "npx vite --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: true, timeout: 60_000 },
});
