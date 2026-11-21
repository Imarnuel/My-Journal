// Voice notes for the real journal (DESIGN.md › Real app): the app posts a recording and the user's own
// lists; this asks Gemini (Interactions API) for the notes and details as JSON and returns a VoiceNoteResult.
// The Gemini key lives only here, as the Netlify environment variable GEMINI_API_KEY; GEMINI_MODEL can
// override the model. Runs as an edge function: it waits on Gemini without the 10-second limit of ordinary
// functions on the free plan. Nothing is stored (store: false).
import { fillFromAnswer, voicePrompt, voiceSchema, type VoiceContext } from "../../src/lib/voicePrompt.ts";

declare const Netlify: { env: { get(name: string): string | undefined } };

const API = "https://generativelanguage.googleapis.com/v1beta/interactions";
const API_REVISION = "2026-05-20";
const DEFAULT_MODEL = "gemini-4-hydrogen"; // fast and efficient, on the free tier
const MAX_BYTES = 12 * 1024 * 1024;

/** Chrome records audio/webm, Safari audio/mp4; Gemini lists audio/webm and audio/m4a among its formats. */
const geminiMime = (mime: string) => (mime.startsWith("audio/mp4") ? "audio/m4a" : mime.split(";")[0] || "audio/webm");

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

type Body = { audio?: string; mime?: string; seconds?: number; context?: VoiceContext };

type Ctx = { deploy?: { id?: string } };

const tidy = (v: string | undefined) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();

/**
 * The owner's own Gemini key, sent straight to Google (free tier). It is the Netlify variable
 * `Gemini_API_Key` (the owner's name for it; names are case-sensitive). Netlify fills `GEMINI_API_KEY` itself
 * with a token for its own AI service, which Google doesn't accept, so that one is used only if it holds a
 * real Google key ("AIza…").
 */
function geminiKey(): { key: string; from: string | null } {
  const own = tidy(Netlify.env.get("Gemini_API_Key"));
  if (own) return { key: own, from: "Gemini_API_Key" };
  const std = tidy(Netlify.env.get("GEMINI_API_KEY"));
  if (std.startsWith("AIza")) return { key: std, from: "GEMINI_API_KEY" };
  return { key: "", from: null };
}

export default async (req: Request, context?: Ctx): Promise<Response> => {
  if (req.method === "GET") {
    const { key: k, from } = geminiKey();
    // ?check: harmless facts about the key in use (never the key): which variable, its first 4 characters
    // (the same for every Google key, "AIza"), its length, and which publish is running. For setting it up.
    if (new URL(req.url).searchParams.has("check")) {
      return json({ ready: !!k, from, startsLike: k.slice(0, 4), length: k.length, spaces: /\s/.test(k), deploy: context?.deploy?.id ?? null });
    }
    return json({ ready: !!k });
  }
  if (req.method !== "POST") return json({ ok: false, reason: "failed" }, 405);
  // The owner's key; the usual paste slips around it (spaces, line breaks, quotation marks) are forgiven.
  const { key } = geminiKey();
  if (!key) return json({ ok: false, reason: "failed", detail: "no key" }, 503);

  const text = await req.text();
  if (text.length > MAX_BYTES) return json({ ok: false, reason: "failed", detail: "too long" }, 413);
  let body: Body;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, reason: "failed" }, 400);
  }
  const ctx = body.context;
  if (!body.audio || !body.mime || !ctx) return json({ ok: false, reason: "failed" }, 400);

  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key, "Api-Revision": API_REVISION },
    body: JSON.stringify({
      model: Netlify.env.get("GEMINI_MODEL") || DEFAULT_MODEL,
      input: [
        { type: "text", text: voicePrompt(ctx) },
        { type: "audio", data: body.audio, mime_type: geminiMime(body.mime) },
      ],
      response_format: { type: "text", mime_type: "application/json", schema: voiceSchema(ctx) },
      store: false,
    }),
  }).catch(() => null);
  if (!res || !res.ok) {
    // Google's own message (never the key) helps when the request shape or a limit is the problem.
    const why = res ? (await res.text().catch(() => "")).slice(0, 400) : "";
    return json({ ok: false, reason: "failed", detail: res ? `gemini ${res.status}: ${why}` : "network" }, 502);
  }

  const interaction = (await res.json().catch(() => null)) as { steps?: { type?: string; content?: { type?: string; text?: string }[] }[] } | null;
  const out = (interaction?.steps ?? [])
    .filter((s) => s.type === "model_output")
    .flatMap((s) => s.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");
  let answer: unknown;
  try {
    answer = JSON.parse(out);
  } catch {
    return json({ ok: false, reason: "failed", detail: "unreadable answer" }, 502);
  }
  return json(fillFromAnswer(answer, ctx, Number(body.seconds) || 0));
};

export const config = { path: "/api/voice-note" };
