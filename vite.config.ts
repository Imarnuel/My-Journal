import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // The claude.ai artifact build: relative paths, fonts inlined into the stylesheet.
  // Fixed file names, so each republish replaces the same files.
  ...(mode === "artifact"
    ? { base: "./", build: { assetsInlineLimit: 1_000_000, rollupOptions: { output: { entryFileNames: "assets/app.js", assetFileNames: "assets/app[extname]" } } } }
    : {}),
  server: { port: 5173, strictPort: true },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
})) as never;
