// Voice notes in the real journal: what Gemini is asked, how its answer is trusted, and the server function.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fillFromAnswer, voicePrompt, voiceSchema, type VoiceContext } from "./voicePrompt";
import handler from "../../netlify/edge-functions/voice-note.ts";

const ctx: VoiceContext = {
  setups: ["4H supply pullback", "London breakout"],
  tags: [
    { t: "Break of structure", k: "Good" },
    { t: "Moved stop", k: "Mistake" },
  ],
  headspaces: ["Calm", "Rushed"],
  language: "English",
};

const answer = {
  unclear: false,
  transcript: "Took the [[4H supply pullback]], waited for the [[break of structure]], felt [[calm]].",
  before: "Short from the 4H supply zone after a 15m break of structure.",
  reflection: "Waiting for the close kept it calm.",
  reflection_inferred: true,
  setup: "4h supply pullback",
  tags: [
    { tag: "break of structure", kind: "Neutral" },
    { tag: "news spike", kind: "Neutral" },
    { tag: "made up", kind: "Excellent" },
    { tag: "Break of structure", kind: "Good" },
  ],
  plan_followed: true,
  headspace: "calm",
};

describe("what Gemini is asked", () => {
  it("names the user's own setups, tags, headspaces and language", () => {
    const p = voicePrompt(ctx);
    expect(p).toContain("4H supply pullback, London breakout");
    expect(p).toContain("Moved stop (Mistake)");
    expect(p).toContain("in English");
  });
  it("the answer's setup and headspace can only be from the user's lists, or null", () => {
    const sc = voiceSchema(ctx) as { properties: Record<string, { enum?: unknown[] }> };
    expect(sc.properties.setup.enum).toEqual(["4H supply pullback", "London breakout", null]);
    expect(sc.properties.headspace.enum).toEqual(["Calm", "Rushed", null]);
    expect((voiceSchema({ ...ctx, setups: [] }) as { properties: Record<string, { type: unknown }> }).properties.setup.type).toBe("null");
  });
});

describe("how the answer is trusted", () => {
  it("maps onto the user's own spellings and kinds; drops tags without a valid kind; keeps the length", () => {
    const r = fillFromAnswer(answer, ctx, 84);
    expect(r).toMatchObject({
      ok: true,
      length: "1:24",
      setup: "4H supply pullback",
      headspace: "Calm",
      followed: true,
      suggested: true,
      tags: [
        { t: "Break of structure", k: "Good" },
        { t: "News spike", k: "Neutral" },
      ],
    });
  });
  it("anything off the lists becomes empty, never invented", () => {
    const r = fillFromAnswer({ ...answer, setup: "Asian sweep", headspace: "Euphoric", plan_followed: "yes" }, ctx, 10);
    expect(r).toMatchObject({ ok: true, setup: null, headspace: null, followed: null });
  });
  it("no understandable speech is the designed 'Couldn't make out your note'", () => {
    expect(fillFromAnswer({ ...answer, unclear: true }, ctx, 5)).toEqual({ ok: false, reason: "unclear" });
    expect(fillFromAnswer({}, ctx, 5)).toEqual({ ok: false, reason: "unclear" });
  });
  it("a reflection that was said is not marked Suggested", () => {
    const r = fillFromAnswer({ ...answer, reflection_inferred: false }, ctx, 5);
    expect(r.ok && r.suggested).toBe(false);
  });
});

describe("the server function", () => {
  const env: Record<string, string | undefined> = {};
  const post = (body: unknown) => new Request("https://x/api/voice-note", { method: "POST", body: JSON.stringify(body) });
  beforeEach(() => {
    (globalThis as unknown as { Netlify: unknown }).Netlify = { env: { get: (k: string) => env[k] } };
    env.GEMINI_API_KEY = "test-key";
    env.GEMINI_MODEL = undefined;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("says whether it is ready (a key is set), without revealing it", async () => {
    const r = await (await handler(new Request("https://x/api/voice-note"))).json();
    expect(r).toEqual({ ready: true });
    env.GEMINI_API_KEY = undefined;
    expect(await (await handler(new Request("https://x/api/voice-note"))).json()).toEqual({ ready: false });
  });

  it("sends the audio to Gemini's Interactions API with the key in a header and JSON output, then trusts nothing", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ status: "completed", steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(answer) }] }] })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await handler(post({ audio: "AAAA", mime: "audio/mp4", seconds: 24, context: ctx }));
    const out = await res.json();
    expect(out).toMatchObject({ ok: true, setup: "4H supply pullback", length: "0:24" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    const sent = JSON.parse(String(init.body));
    expect(sent.model).toBe("gemini-4-hydrogen");
    expect(sent.store).toBe(false);
    expect(sent.input[1]).toEqual({ type: "audio", data: "AAAA", mime_type: "audio/m4a" });
    expect(sent.response_format).toMatchObject({ type: "text", mime_type: "application/json" });
    expect(String(init.body)).not.toContain("test-key");
  });

  it("GEMINI_MODEL overrides the model", async () => {
    env.GEMINI_MODEL = "gemini-4-neon";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(answer) }] }] })));
    vi.stubGlobal("fetch", fetchMock);
    await handler(post({ audio: "AAAA", mime: "audio/webm;codecs=opus", seconds: 3, context: ctx }));
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.model).toBe("gemini-4-neon");
    expect(sent.input[1].mime_type).toBe("audio/webm");
  });

  it("no key, a Gemini error or an unreadable answer is 'failed' (the recording is kept to try again)", async () => {
    env.GEMINI_API_KEY = undefined;
    expect(await (await handler(post({ audio: "A", mime: "audio/webm", seconds: 1, context: ctx }))).json()).toMatchObject({ ok: false, reason: "failed" });
    env.GEMINI_API_KEY = "k";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("quota", { status: 429 })));
    expect(await (await handler(post({ audio: "A", mime: "audio/webm", seconds: 1, context: ctx }))).json()).toMatchObject({ ok: false, reason: "failed" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: "not json" }] }] }))));
    expect(await (await handler(post({ audio: "A", mime: "audio/webm", seconds: 1, context: ctx }))).json()).toMatchObject({ ok: false, reason: "failed" });
  });
});
