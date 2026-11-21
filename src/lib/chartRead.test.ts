// Chart reading (DESIGN.md › Chart reading): the legend and position box rules, and the server function.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalisePair, normaliseTimeframe, readFromAnswer } from "./chartRead";
import handler from "../../netlify/edge-functions/chart-read.ts";

const ctx = { pairs: ["GBPUSD", "XAUUSD", "EURUSD"] };

describe("timeframe captions: only a clean match", () => {
  it("240, 4h and H4 all become 4H; daily, weekly and minute forms too", () => {
    for (const r of ["240", "4h", "H4", " 4H "]) expect(normaliseTimeframe(r)).toBe("4H");
    expect(normaliseTimeframe("15")).toBe("15m");
    expect(normaliseTimeframe("M15")).toBe("15m");
    expect(normaliseTimeframe("D")).toBe("Daily");
    expect(normaliseTimeframe("1W")).toBe("Weekly");
    expect(normaliseTimeframe("M")).toBe("Monthly");
  });
  it("anything unclear is no caption", () => {
    for (const r of ["m", "4 hours-ish", "", null, 240]) expect(normaliseTimeframe(r)).toBeNull();
  });
});

describe("symbols", () => {
  it("broker prefixes and slashes go; the user's own spelling wins", () => {
    expect(normalisePair("OANDA:XAUUSD", ctx.pairs)).toBe("XAUUSD");
    expect(normalisePair("eur/usd", ctx.pairs)).toBe("EURUSD");
    expect(normalisePair("FX:USDJPY", ctx.pairs)).toBe("USDJPY");
    expect(normalisePair("", ctx.pairs)).toBeNull();
  });
});

describe("trusting the position box", () => {
  const long = { symbol: "FX:GBPUSD", timeframe: "15", position_box: true, direction: "Long", entry: "1.26840", stop: "1.26670", target: "1.27180", prices_legible: true, price_text: "Target: 1.27180 (34.0) | 1.26840 | Stop: 1.26670 (17.0)" };
  it("a long whose prices agree fills everything", () => {
    expect(readFromAnswer(long, ctx)).toEqual({ ok: true, pair: "GBPUSD", dir: "Long", entry: "1.26840", stop: "1.26670", target: "1.27180", timeframe: "15m", unreadable: false });
  });
  it("a direction the prices contradict drops the prices, never guesses", () => {
    const r = readFromAnswer({ ...long, direction: "Short" }, ctx);
    expect(r).toMatchObject({ dir: "Short", entry: null, stop: null, target: null });
  });
  it("a target on the wrong side drops the set", () => {
    expect(readFromAnswer({ ...long, target: "1.26000" }, ctx)).toMatchObject({ entry: null, stop: null, target: null });
  });
  it("direction comes from the prices when only the box is there", () => {
    expect(readFromAnswer({ ...long, direction: null, entry: "2340.5", stop: "2348", target: "2320", price_text: "Stop: 2348 | 2340.5 | Target: 2,320" }, ctx)).toMatchObject({ dir: "Short", entry: "2340.5", target: "2320" });
  });
  it("no position box: no direction or prices, the legend still reads", () => {
    expect(readFromAnswer({ ...long, position_box: false }, ctx)).toMatchObject({ pair: "GBPUSD", timeframe: "15m", dir: null, entry: null, stop: null });
  });
  it("prices too small to read are flagged for the designed card", () => {
    expect(readFromAnswer({ ...long, entry: null, stop: null, target: null, prices_legible: false }, ctx)).toMatchObject({ unreadable: true, entry: null });
  });
  it("prices not found in the printed text it quotes were guessed: dropped, and the box counts as unreadable", () => {
    // A tiny chart once came back with plausible, made-up prices on the right sides of the entry.
    expect(readFromAnswer({ ...long, price_text: "Target: 1.27180 | 1.26840" }, ctx)).toMatchObject({ entry: null, stop: null, target: null, unreadable: true, pair: "GBPUSD" });
    expect(readFromAnswer({ ...long, price_text: null }, ctx)).toMatchObject({ entry: null, unreadable: true });
    expect(readFromAnswer({ ...long, entry: null, stop: null, target: null, price_text: null }, ctx)).toMatchObject({ unreadable: false });
  });
  it("prices must be plain numbers", () => {
    expect(readFromAnswer({ ...long, entry: "about 1.27" }, ctx)).toMatchObject({ entry: null, stop: null });
  });
});

describe("the server function", () => {
  const env: Record<string, string | undefined> = {};
  const post = (body: unknown) => new Request("https://x/api/chart-read", { method: "POST", body: JSON.stringify(body) });
  beforeEach(() => {
    (globalThis as unknown as { Netlify: unknown }).Netlify = { env: { get: (k: string) => env[k] } };
    env.Gemini_API_Key = "AIza-test";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends the screenshot as an image with the reading rules, and checks the answer", async () => {
    const answer = { symbol: "OANDA:XAUUSD", timeframe: "240", position_box: true, direction: "Short", entry: "2340.5", stop: "2348.0", target: "2320.0", prices_legible: true, price_text: "Stop: 2348.0 (7.5) | 2340.5 | Target: 2320.0 (20.5)" };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(answer) }] }] })));
    vi.stubGlobal("fetch", fetchMock);
    const out = JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/png", context: ctx }))).text()).trim());
    expect(out).toEqual({ ok: true, pair: "XAUUSD", dir: "Short", entry: "2340.5", stop: "2348.0", target: "2320.0", timeframe: "4H", unreadable: false, via: "gemini-4-hydrogen" });
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.input[1]).toEqual({ type: "image", data: "AAAA", mime_type: "image/png" });
    expect(sent.input[0].text).toContain("Never estimate a price");
    expect(sent.response_format.schema.required).toContain("price_text");
    expect(sent.store).toBe(false);
  });
  it("only images; no key or a Gemini error is 'failed'", async () => {
    expect((await handler(post({ image: "AAAA", mime: "text/html", context: ctx }))).status).toBe(400);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 400 })));
    expect(JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/jpeg", context: ctx }))).text()).trim())).toMatchObject({ ok: false, reason: "failed" });
    env.Gemini_API_Key = undefined;
    expect((await handler(post({ image: "AAAA", mime: "image/png", context: ctx }))).status).toBe(503);
  });
});
