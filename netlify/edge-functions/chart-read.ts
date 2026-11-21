// Chart reading for the real journal (DESIGN.md › Chart reading): the app posts one chart screenshot and the
// user's pairs; this asks Gemini to read the legend and the position box, then trusts nothing it returns
// (src/lib/chartRead.ts). Same key and models as voice notes (src/lib/geminiServer.ts). Nothing is stored.
import { chartPrompt, chartSchema, readFromAnswer, type ChartReadContext } from "../../src/lib/chartRead.ts";
import { askGeminiJson, geminiKey } from "../../src/lib/geminiServer.ts";

declare const Netlify: { env: { get(name: string): string | undefined } };

const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE = /^image\/(png|jpeg|webp|heic|heif)$/;

type Body = { image?: string; mime?: string; context?: ChartReadContext };

export default async (req: Request): Promise<Response> => {
  const env = (n: string) => Netlify.env.get(n);
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  if (req.method !== "POST") return json({ ok: false, reason: "failed" }, 405);
  const { key } = geminiKey(env);
  if (!key) return json({ ok: false, reason: "failed", detail: "no key" }, 503);
  const text = await req.text();
  if (text.length > MAX_BYTES) return json({ ok: false, reason: "failed", detail: "too large" }, 413);
  let body: Body;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, reason: "failed" }, 400);
  }
  const ctx = body.context ?? { pairs: [] };
  if (!body.image || !body.mime || !IMAGE.test(body.mime)) return json({ ok: false, reason: "failed" }, 400);

  // Like voice notes: answer at once and keep the line open while Gemini reads, so it can't time out.
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const beat = setInterval(() => ctrl.enqueue(enc.encode(" ")), 4000);
      const answer = await askGeminiJson({
        key,
        model: env("GEMINI_MODEL"),
        input: [
          { type: "text", text: chartPrompt(ctx) },
          { type: "image", data: body.image!, mime_type: body.mime! },
        ],
        schema: chartSchema(),
      }).catch(() => ({ ok: false as const, detail: "error" }));
      clearInterval(beat);
      const result = answer.ok ? readFromAnswer(answer.json, ctx) : { ok: false, reason: "failed", detail: answer.detail };
      ctrl.enqueue(enc.encode(JSON.stringify(result)));
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};

export const config = { path: "/api/chart-read" };
