// One Gemini request with structured JSON output, shared by the server functions (voice notes, chart reading).
// Gemini's Interactions API (/v1beta/interactions): the docs changed after training, so read them before
// changing the request shape. Runs on Netlify's edge (Deno), so it uses only web-standard APIs.

const API = "https://generativelanguage.googleapis.com/v1beta/interactions";
const API_REVISION = "2026-05-20";
export const DEFAULT_MODEL = "gemini-4-hydrogen"; // fast and efficient, on the free tier
/** Free-tier models that read audio and images, tried in turn when the one before is busy or rate-limited. */
export const BACKUP_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
/** How long one model may take at most; past this its answer is no longer waited for. */
const MODEL_LIMIT_MS = 40_000;
/**
 * How long a model may stay silent before the next one is asked as well (a hedged request): whichever answers
 * first wins and the others are stopped. Measured 2026-11-22 on the free tier: a model that answers does so in
 * 6 to 7 s; a busy one either says so within 4 s or stays silent for the full 40 s.
 */
export const HEDGE_MS = 6_000;
/** A model that said it was busy (429 or 503) is asked last for this long. */
export const BUSY_FOR_MS = 2 * 60_000;
/** The model that answered last is asked first for this long, then the usual order comes back. */
export const STICKY_MS = 10 * 60_000;

export type GeminiPart = { type: "text"; text: string } | { type: "audio" | "image"; data: string; mime_type: string };

/**
 * `model`: which model answered (a backup when the first was busy); `tried`: why the others didn't
 * ("gemini-4-hydrogen: 503", or "timeout"). For checking speed and quality; never holds the key.
 */
export type GeminiAnswer = { ok: true; json: unknown; model: string; tried: string[] } | { ok: false; detail: string; tried: string[] };

/**
 * What this server instance has learnt about the models (kept in memory while the instance is warm, never
 * stored): which one answered last, and which said they were busy.
 */
const health: { lastGood: string | null; lastGoodAt: number; busyUntil: Record<string, number> } = { lastGood: null, lastGoodAt: 0, busyUntil: {} };

/** For tests: forget what was learnt. */
export function resetModelHealth() {
  health.lastGood = null;
  health.lastGoodAt = 0;
  health.busyUntil = {};
}

/**
 * The order to ask in: the model that answered last first (for STICKY_MS), then the usual order, with models
 * that just said they were busy moved to the end.
 */
export function modelOrder(first: string, now = Date.now()): string[] {
  const all = [first, ...BACKUP_MODELS].filter((m, i, a) => a.indexOf(m) === i);
  const busy = (m: string) => (health.busyUntil[m] ?? 0) > now;
  const order = [...all.filter((m) => !busy(m)), ...all.filter(busy)];
  const sticky = health.lastGood && now - health.lastGoodAt < STICKY_MS && order.includes(health.lastGood) && !busy(health.lastGood) ? health.lastGood : null;
  return sticky ? [sticky, ...order.filter((m) => m !== sticky)] : order;
}

type Try = { ok: true; json: unknown } | { ok: false; status: number; detail: string };

async function askOne(model: string, opts: { key: string; input: GeminiPart[]; schema: unknown }, signal: AbortSignal): Promise<Try> {
  const res = await fetch(API, {
    signal,
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
  if (!res) return { ok: false, status: 0, detail: signal.aborted ? "timeout" : "network" };
  if (!res.ok) {
    // Google's own message (never the key) helps when the request shape or a limit is the problem.
    const why = (await res.text().catch(() => "")).slice(0, 400);
    return { ok: false, status: res.status, detail: `gemini ${res.status}: ${why}` };
  }
  const interaction = (await res.json().catch(() => null)) as { steps?: { type?: string; content?: { type?: string; text?: string }[] }[] } | null;
  const out = (interaction?.steps ?? [])
    .filter((st) => st.type === "model_output")
    .flatMap((st) => st.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
  try {
    return { ok: true, json: JSON.parse(out) };
  } catch {
    return { ok: false, status: 0, detail: "unreadable answer" };
  }
}

/**
 * Ask Gemini for JSON in `schema` (hedged). The first model in `modelOrder` is asked; when it says it is busy
 * (429, 500, 503), fails, or stays silent for HEDGE_MS, the next one is asked too and `onBusy` is called. The
 * first good answer wins and the rest are stopped. A request Google refuses for its shape (400) isn't retried.
 * Nothing is stored.
 */
export function askGeminiJson(opts: { key: string; input: GeminiPart[]; schema: unknown; model?: string; onBusy?: () => void }): Promise<GeminiAnswer> {
  const order = modelOrder(opts.model || DEFAULT_MODEL);
  const tried: string[] = [];
  const stops: AbortController[] = [];
  let next = 0;
  let running = 0;
  let done = false;
  let last: Try & { ok: false } = { ok: false, status: 0, detail: "network" };
  let hedge: ReturnType<typeof setTimeout> | undefined;
  return new Promise((resolve) => {
    const finish = (a: GeminiAnswer) => {
      if (done) return;
      done = true;
      clearTimeout(hedge);
      stops.forEach((c) => c.abort());
      resolve(a);
    };
    const launch = () => {
      if (done || next >= order.length) return;
      const model = order[next++];
      if (next > 1) opts.onBusy?.();
      running++;
      const stop = new AbortController();
      stops.push(stop);
      const limit = setTimeout(() => stop.abort(), MODEL_LIMIT_MS);
      clearTimeout(hedge);
      hedge = setTimeout(launch, HEDGE_MS);
      askOne(model, opts, stop.signal).then((r) => {
        clearTimeout(limit);
        running--;
        if (done) return;
        if (r.ok) {
          health.lastGood = model;
          health.lastGoodAt = Date.now();
          return finish({ ok: true, json: r.json, model, tried });
        }
        tried.push(`${model}: ${r.status || r.detail}`);
        if (r.status === 429 || r.status === 503) health.busyUntil[model] = Date.now() + BUSY_FOR_MS;
        last = r;
        const retry = r.status === 0 || [429, 500, 503].includes(r.status);
        if (retry && next < order.length) return launch();
        if (running === 0) finish({ ok: false, detail: last.detail, tried });
      });
    };
    launch();
  });
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

/** Every model said 429 ("too many requests"): the free daily allowance is used up, so asking again won't help. */
export function outOfRequests(answers: GeminiAnswer[]): boolean {
  return answers.length > 0 && answers.every((a) => !a.ok && /^gemini 429/.test(a.detail) && a.tried.every((t) => t.endsWith(": 429")));
}
