// Whether voice notes work here. The sample journal always has its simulated voice note. The real journal
// asks its server function once per visit (it is ready when the Gemini key is set on Netlify) and remembers
// the last answer, so Talk it through still shows offline (the note is then kept to read later).
import { useEffect, useState } from "react";
import { REAL } from "./mode";

const KEY = "journal:voice-ready";
let asked: Promise<boolean> | null = null;

function remembered(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function ask(): Promise<boolean> {
  asked ??= fetch("/api/voice-note", { headers: { accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      const ready = !!(j && (j as { ready?: boolean }).ready);
      try {
        localStorage.setItem(KEY, ready ? "1" : "0");
      } catch {
        /* per-visit only */
      }
      return ready;
    })
    .catch(() => remembered());
  return asked;
}

export function useVoice(): boolean {
  const [ready, setReady] = useState(() => !REAL || remembered());
  useEffect(() => {
    if (!REAL) return;
    let live = true;
    ask().then((r) => live && setReady(r));
    return () => void (live = false);
  }, []);
  return ready;
}
