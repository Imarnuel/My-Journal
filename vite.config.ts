import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // The real journal is installable: app manifest and icons in the page head (DESIGN.md › Real app).
    {
      name: "real-journal-head",
      transformIndexHtml: (html: string) =>
        mode === "real"
          ? html
              .replace("<title>Journal</title>", "<title>Journal</title>\n    <link rel=\"manifest\" href=\"/manifest.webmanifest\" />\n    <link rel=\"apple-touch-icon\" href=\"/icons/apple-touch-icon.png\" />\n    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n    <meta name=\"apple-mobile-web-app-title\" content=\"Journal\" />")
          : html,
    },
  ],
  // The claude.ai artifact build: relative paths, fonts inlined into the stylesheet.
  // Fixed file names, so each republish replaces the same files.
  ...(mode === "artifact"
    ? { base: "./", build: { assetsInlineLimit: 1_000_000, rollupOptions: { output: { entryFileNames: "assets/app.js", assetFileNames: "assets/app[extname]" } } } }
    : {}),
  server: { port: mode === "real" ? 5174 : 5173, strictPort: true },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
})) as never;
