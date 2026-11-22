// Voice notes for the real journal (DESIGN.md › Real app): the app posts a recording and the user's own
// lists; this asks Gemini for the notes and details as JSON and returns a VoiceNoteResult. The key is the
// Netlify variable Gemini_API_Key (src/lib/geminiServer.ts); GEMINI_MODEL can override the model. An edge
// function: it waits on Gemini without the 10-second limit of ordinary functions on the free plan.
import { fillFromAnswer, voicePrompt, voiceSchema, type VoiceContext } from "../../src/lib/voicePrompt.ts";
import { askGeminiJson, geminiKey, outOfRequests } from "../../src/lib/geminiServer.ts";

declare const Netlify: { env: { get(name: string): string | undefined } };

const MAX_BYTES = 12 * 1024 * 1024;

/** Chrome records audio/webm, Safari audio/mp4; Gemini lists audio/webm and audio/m4a among its formats. */
const geminiMime = (mime: string) => (mime.startsWith("audio/mp4") ? "audio/m4a" : mime.split(";")[0] || "audio/webm");

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

type Body = { audio?: string; mime?: string; seconds?: number; context?: VoiceContext };
type Ctx = { deploy?: { id?: string } };

export default async (req: Request, context?: Ctx): Promise<Response> => {
  const env = (n: string) => Netlify.env.get(n);
  if (req.method === "GET") {
    const { key: k, from } = geminiKey(env);
    // ?check: harmless facts about the key in use (never the key): which variable, its first 4 characters,
    // its length, and which publish is running. For setting it up.
    if (new URL(req.url).searchParams.has("check")) {
      return json({ ready: !!k, from, startsLike: k.slice(0, 4), length: k.length, spaces: /\s/.test(k), deploy: context?.deploy?.id ?? null });
    }
    return json({ ready: !!k });
  }
  if (req.method !== "POST") return json({ ok: false, reason: "failed" }, 405);
  const { key } = geminiKey(env);
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

  // Answer at once and keep the line open with a space every few seconds while Gemini reads, so a long note
  // never runs into the platform's wait limit; the app reads the JSON at the end (spaces before it are fine).
  // A tab tells the app the first model was busy and another is trying (whitespace too, so the JSON stays valid).
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const beat = setInterval(() => ctrl.enqueue(enc.encode(" ")), 4000);
      const answer = await askGeminiJson({
        key,
        model: env("GEMINI_MODEL"),
        input: [
          { type: "text", text: voicePrompt(ctx) },
          { type: "audio", data: body.audio!, mime_type: geminiMime(body.mime!) },
        ],
        schema: voiceSchema(ctx),
        onBusy: () => ctrl.enqueue(enc.encode("\t")),
      }).catch(() => ({ ok: false as const, detail: "error", tried: [] as string[] }));
      clearInterval(beat);
      // `quota`: the free daily allowance is used up; the app says reading is paused until tomorrow (Settings).
      const result = answer.ok ? fillFromAnswer(answer.json, ctx, Number(body.seconds) || 0) : { ok: false, reason: "failed", detail: answer.detail, ...(outOfRequests([answer]) ? { quota: true } : {}) };
      ctrl.enqueue(enc.encode(JSON.stringify(result)));
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};

export const config = { path: "/api/voice-note" };
