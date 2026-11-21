// The app's side of a real voice note: honest progress from the server's stream, and its time limit.
import { afterEach, describe, expect, it, vi } from "vitest";
import { readVoiceNote, type VoicePhase } from "./voiceNote";

const rec = { blob: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" }), mime: "audio/webm", seconds: 3 };
const ctx = { setups: [], tags: [], headspaces: ["Calm"], language: "English" };
const answer = { ok: true, length: "0:03", transcript: "x", before: "b", refl: "", suggested: false, setup: null, tags: [], followed: null, headspace: null };

function streamOf(...chunks: string[]) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("reading a note on the server", () => {
  it("reports sending, listening, and busy when another model takes over; reads the JSON after the heartbeat", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(streamOf("  ", "\t", "  ", JSON.stringify(answer)))));
    const phases: VoicePhase[] = [];
    const r = await readVoiceNote(3, rec, ctx, { onPhase: (p) => phases.push(p) });
    expect(r).toMatchObject({ ok: true, before: "b" });
    expect(phases).toEqual(["sending", "listening", "busy"]);
  });
  it("Stop waiting (or the time limit) ends it as 'failed', so the recording can be tried again", async () => {
    // Like a browser's fetch: an already-stopped signal rejects at once, a later stop rejects then.
    const aborted = () => new DOMException("aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn((_u: string, init: RequestInit) => new Promise((_res, rej) => (init.signal?.aborted ? rej(aborted()) : init.signal?.addEventListener("abort", () => rej(aborted()))))));
    const stop = new AbortController();
    const p = readVoiceNote(3, rec, ctx, { signal: stop.signal });
    stop.abort();
    expect(await p).toEqual({ ok: false, reason: "failed" });
  });
  it("an unreadable answer is 'failed', a server 'unclear' stays 'unclear'", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(streamOf("  not json"))));
    expect(await readVoiceNote(3, rec, ctx)).toEqual({ ok: false, reason: "failed" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(streamOf(" ", JSON.stringify({ ok: false, reason: "unclear" })))));
    expect(await readVoiceNote(3, rec, ctx)).toEqual({ ok: false, reason: "unclear" });
  });
});
