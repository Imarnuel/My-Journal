// Chart reading (DESIGN.md › Chart reading): the legend and position box rules, and the server function.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agreeReads, normalisePair, normaliseTimeframe, readFromAnswer } from "./chartRead";
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
    expect(normalisePair("US30", ctx.pairs)).toBe("US30");
    expect(normalisePair("Euro / U.S. Dollar", ctx.pairs)).toBeNull(); // a name run together is never a pair
  });
});

describe("trusting the position box", () => {
  const box = { direction: "Long", entry: "1.26840", stop: "1.26670", target: "1.27180" };
  const top = { symbol: "FX:GBPUSD", timeframe: "15", prices_legible: true, price_text: "Target: 1.27180 (34.0) | 1.26840 | Stop: 1.26670 (17.0)" };
  /** A chart with one position tool, changed where a test says. */
  const one = (p: Record<string, unknown> = {}, t: Record<string, unknown> = {}) => ({ ...top, positions: [{ ...box, ...p }], ...t });
  it("a long whose prices agree fills everything", () => {
    expect(readFromAnswer(one(), ctx)).toEqual({ ok: true, pair: "GBPUSD", dir: "Long", entry: "1.26840", stop: "1.26670", target: "1.27180", timeframe: "15m", unreadable: false });
  });
  it("a direction the prices contradict drops the prices, never guesses", () => {
    expect(readFromAnswer(one({ direction: "Short" }), ctx)).toMatchObject({ dir: null, entry: null, stop: null, target: null });
  });
  it("a target on the wrong side drops the set", () => {
    expect(readFromAnswer(one({ target: "1.26000" }, { price_text: "1.26000 | 1.26840 | 1.26670" }), ctx)).toMatchObject({ entry: null, stop: null, target: null });
  });
  it("direction comes from the prices when the tool's own direction isn't given", () => {
    const r = readFromAnswer(one({ direction: null, entry: "2340.5", stop: "2348", target: "2320" }, { price_text: "Stop: 2348 | 2340.5 | Target: 2,320" }), ctx);
    expect(r).toMatchObject({ dir: "Short", entry: "2340.5", target: "2320" });
  });
  it("no direction without readable prices (read from the colours alone it was wrong in testing)", () => {
    expect(readFromAnswer(one({ entry: null, stop: null, target: null }, { price_text: null }), ctx)).toMatchObject({ dir: null });
    expect(readFromAnswer(one({ stop: null }), ctx)).toMatchObject({ dir: null, entry: null });
  });
  it("no position tool: no direction or prices, the legend still reads", () => {
    expect(readFromAnswer({ ...top, positions: [] }, ctx)).toMatchObject({ pair: "GBPUSD", timeframe: "15m", dir: null, entry: null, stop: null, unreadable: false });
  });
  it("prices too small to read are flagged for the designed card", () => {
    expect(readFromAnswer(one({ entry: null, stop: null, target: null }, { prices_legible: false }), ctx)).toMatchObject({ unreadable: true, entry: null });
  });
  it("prices not found in the printed text it quotes were guessed: dropped, and the box counts as unreadable", () => {
    // A tiny chart once came back with plausible, made-up prices on the right sides of the entry.
    expect(readFromAnswer(one({}, { price_text: "Target: 1.27180 | 1.26840" }), ctx)).toMatchObject({ entry: null, stop: null, target: null, unreadable: true, pair: "GBPUSD" });
    expect(readFromAnswer(one({}, { price_text: null }), ctx)).toMatchObject({ entry: null, unreadable: true });
    expect(readFromAnswer(one({ entry: null, stop: null, target: null }, { price_text: null }), ctx)).toMatchObject({ unreadable: false });
  });
  it("two reads: prices and direction only when both match exactly; a mismatch is unreadable", () => {
    const first = readFromAnswer(one(), ctx);
    expect(agreeReads(first, readFromAnswer(one(), ctx))).toEqual(first);
    // A guessed set: the second read's stop differs (as a blurry chart's did, three reads, three stops).
    const second = readFromAnswer(one({ stop: "1.26650" }, { price_text: top.price_text.replace("1.26670", "1.26650") }), ctx);
    expect(agreeReads(first, second)).toMatchObject({ pair: "GBPUSD", timeframe: "15m", dir: null, entry: null, stop: null, target: null, unreadable: true });
    expect(agreeReads(first, { ...first, timeframe: "1H" })).toMatchObject({ timeframe: null, entry: "1.26840" });
  });
  it("only one read came back: the legend only, nothing to check prices against", () => {
    expect(agreeReads(readFromAnswer(one(), ctx), null)).toMatchObject({ pair: "GBPUSD", dir: null, entry: null, unreadable: false });
  });
  it("several position tools (the owner's Gold chart): pair and direction only, when every tool's prices agree", () => {
    const gold = {
      symbol: "XAUUSD",
      timeframe: "30",
      prices_legible: true,
      price_text: "4,068.70 | 4,065.89 | 4,060.04 | 4,055.77 | 3,982.48 | 3,981.79",
      positions: [
        { direction: "Short", entry: "4060.04", stop: "4068.70", target: "3982.48" },
        { direction: "Short", entry: "4055.77", stop: "4065.89", target: "3981.79" },
      ],
    };
    expect(readFromAnswer(gold, ctx)).toEqual({ ok: true, pair: "XAUUSD", timeframe: "30m", dir: "Short", entry: null, stop: null, target: null, unreadable: false });
    // A tool whose prices can't be read, or that points the other way: no direction either.
    expect(readFromAnswer({ ...gold, positions: [gold.positions[0], { direction: "Short", entry: null, stop: null, target: null }] }, ctx)).toMatchObject({ dir: null, unreadable: false });
    expect(readFromAnswer({ ...gold, positions: [gold.positions[0], { direction: null, entry: "4055.77", stop: "3981.79", target: "4065.89" }] }, ctx)).toMatchObject({ dir: null });
  });
  it("prices must be plain numbers", () => {
    expect(readFromAnswer(one({ entry: "about 1.27" }), ctx)).toMatchObject({ entry: null, stop: null });
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
    const answer = { symbol: "OANDA:XAUUSD", timeframe: "240", positions: [{ direction: "Short", entry: "2340.5", stop: "2348.0", target: "2320.0" }], prices_legible: true, price_text: "Stop: 2348.0 (7.5) | 2340.5 | Target: 2320.0 (20.5)" };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(answer) }] }] })));
    vi.stubGlobal("fetch", fetchMock);
    const out = JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/png", context: ctx }))).text()).trim());
    expect(out).toEqual({ ok: true, pair: "XAUUSD", dir: "Short", entry: "2340.5", stop: "2348.0", target: "2320.0", timeframe: "4H", unreadable: false, via: ["gemini-4-hydrogen", "gemini-4-hydrogen"], tried: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2); // read twice at once
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.input[1]).toEqual({ type: "image", data: "AAAA", mime_type: "image/png" });
    expect(sent.input[0].text).toContain("Never estimate a price");
    expect(sent.response_format.schema.required).toContain("price_text");
    expect(sent.store).toBe(false);
    expect(out.raw).toBeUndefined();
    const dbg = JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/png", context: ctx, debug: true }))).text()).trim());
    expect(dbg.raw).toEqual([answer, answer]); // the model's own answers, for tuning
  });
  it("two reads that disagree fill no prices; a busy model's hand-over is recorded", async () => {
    const reply = (stop: string) =>
      new Response(JSON.stringify({ steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify({ symbol: "FX:GBPUSD", timeframe: "15", prices_legible: true, price_text: `Stop: ${stop} | 1.26550 | Target: 1.25150`, positions: [{ direction: "Short", entry: "1.26550", stop, target: "1.25150" }] }) }] }] }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(reply("1.27000")).mockResolvedValueOnce(new Response("busy", { status: 503 })).mockResolvedValueOnce(reply("1.27092")));
    const out = JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/png", context: ctx }))).text()).trim());
    expect(out).toMatchObject({ ok: true, pair: "GBPUSD", entry: null, stop: null, dir: null, unreadable: true, tried: ["gemini-4-hydrogen: 503"] });
  });
  it("only images; no key or a Gemini error is 'failed'", async () => {
    expect((await handler(post({ image: "AAAA", mime: "text/html", context: ctx }))).status).toBe(400);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad", { status: 400 })));
    expect(JSON.parse((await (await handler(post({ image: "AAAA", mime: "image/jpeg", context: ctx }))).text()).trim())).toMatchObject({ ok: false, reason: "failed" });
    env.Gemini_API_Key = undefined;
    expect((await handler(post({ image: "AAAA", mime: "image/png", context: ctx }))).status).toBe(503);
  });
});
