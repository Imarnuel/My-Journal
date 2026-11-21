import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import "./styles/globals.css";
import { App } from "./app/App";
import { REAL } from "./app/mode";
import { useStore } from "./data/store";
import { usePlaybook } from "./data/playbook";
import { useStoryExtras } from "./screens/story/extras";
import { useAccountMeta } from "./screens/accounts/meta";
import { sweepVoiceAudio } from "./data/voiceAudio";

type Persisted = { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } };

/** Resolve once a store has read what was saved in the browser (or found nothing). */
const hydrated = (s: Persisted) =>
  new Promise<void>((resolve) => {
    if (s.persist.hasHydrated()) return resolve();
    const off = s.persist.onFinishHydration(() => {
      off();
      resolve();
    });
  });

// Inside a claude.ai artifact the page can't own the address bar, so navigation stays in memory there
// (built with `npm run build:artifact`). Everywhere else the URL follows the page.
const Router = import.meta.env.VITE_ROUTER === "memory" ? MemoryRouter : BrowserRouter;

// Render after the saved journal has loaded, so a reload never flashes the sample data.
// A slow or broken store never blocks the app for more than a second.
const stores: Persisted[] = [useStore, usePlaybook, useStoryExtras, useAccountMeta];
Promise.race([Promise.all(stores.map(hydrated)), new Promise((r) => setTimeout(r, 1000))]).then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>,
  );
});

// Recordings of deleted stories go once the journal has really loaded (never on the one-second fallback, when
// the stories may not be read yet). DESIGN.md › Real app.
Promise.all(stores.map(hydrated)).then(() => {
  const ids = new Set(useStore.getState().entries.map((e) => e.id));
  void sweepVoiceAudio((id) => ids.has(id));
});

// The real journal works offline once loaded (public/sw.js). Only in its production build: never in the
// sample preview, the dev server or tests.
if (REAL && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
