// One Gemini request with structured JSON output, shared by the server functions (voice notes, chart reading).
// Gemini's Interactions API (/v1beta/interactions): the docs changed after training, so read them before
// changing the request shape. Runs on Netlify's edge (Deno), so it uses only web-standard APIs.

const API = "https://generativelanguage.googleapis.com/v1beta/interactions";
const API_REVISION = "2026-05-20";
export const DEFAULT_MODEL = "gemini-4-hydrogen"; // fast and efficient, on the free tier
/** Free-tier models that read audio and images, tried in turn when the one before is busy or rate-limited. */
export const BACKUP_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
/** How long one model may take before it counts as busy and the next one tries. */
const MODEL_LIMIT_MS = 40_000;

export type GeminiPart = { type: "text"; text: string } | { type: "audio" | "image"; data: string; mime_type: string };

export type GeminiAnswer = { ok: true; json: unknown } | { ok: false; detail: string };

/**
 * Ask Gemini for JSON in `schema`. `model` (from GEMINI_MODEL) goes first, then the backups; a busy (503),
 * rate-limited (429), failing (500) or silent model hands over to the next and calls `onBusy`. Nothing is stored.
 */
export async function askGeminiJson(opts: { key: string; input: GeminiPart[]; schema: unknown; model?: string; onBusy?: () => void }): Promise<GeminiAnswer> {
  const models = [opts.model || DEFAULT_MODEL, ...BACKUP_MODELS].filter((m, i, a) => a.indexOf(m) === i);
  let res: Response | null = null;
  for (const [i, model] of models.entries()) {
    if (i > 0) opts.onBusy?.();
    const timer = new AbortController();
    const t = setTimeout(() => timer.abort(), MODEL_LIMIT_MS);
    res = await fetch(API, {
      signal: timer.signal,
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": opts.key, "Api-Revision": API_REVISION },
      body: JSON.stringify({
        model,
        input: opts.input,
        response_format: { type: "text", mime_type: "application/json", schema: opts.schema },
        // A short note or one chart needs little reasoning; low thinking keeps the wait short (Gemini 4).
        ...(model.startsWith("gemini-4") ? { generation_config: { thinking_level: "low" } } : {}),
        store: false,
      }),
    }).catch(() => null);
    clearTimeout(t);
    if (res && (res.ok || ![429, 500, 503].includes(res.status))) break;
  }
  if (!res || !res.ok) {
    // Google's own message (never the key) helps when the request shape or a limit is the problem.
    const why = res ? (await res.text().catch(() => "")).slice(0, 400) : "";
    return { ok: false, detail: res ? `gemini ${res.status}: ${why}` : "network" };
  }
  const interaction = (await res.json().catch(() => null)) as { steps?: { type?: string; content?: { type?: string; text?: string }[] }[] } | null;
  const out = (interaction?.steps ?? [])
    .filter((s) => s.type === "model_output")
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
  try {
    return { ok: true, json: JSON.parse(out) };
  } catch {
    return { ok: false, detail: "unreadable answer" };
  }
}

/** Forgive the usual paste slips around a key: spaces, line breaks, quotation marks. */
export const tidyKey = (v: string | undefined) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();

/**
 * The owner's own Gemini key, sent straight to Google (free tier): the Netlify variable `Gemini_API_Key`
 * (names are case-sensitive). Netlify fills `GEMINI_API_KEY` itself with a token for its own AI service, which
 * Google doesn't accept, so that one is used only if it holds a real Google key ("AIza…").
 */
export function geminiKey(get: (name: string) => string | undefined): { key: string; from: string | null } {
  const own = tidyKey(get("Gemini_API_Key"));
  if (own) return { key: own, from: "Gemini_API_Key" };
  const std = tidyKey(get("GEMINI_API_KEY"));
  if (std.startsWith("AIza")) return { key: std, from: "GEMINI_API_KEY" };
  return { key: "", from: null };
}
