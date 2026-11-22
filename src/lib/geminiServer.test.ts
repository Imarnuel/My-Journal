// The hedged Gemini client (src/lib/geminiServer.ts): a silent model gets company after HEDGE_MS, a busy one
// hands over at once and is asked last for a while, the model that answered is asked first next time.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BACKUP_MODELS, BUSY_FOR_MS, DEFAULT_MODEL, HEDGE_MS, askGeminiJson, modelOrder, outOfRequests, resetModelHealth } from "./geminiServer";

type Plan = { status?: number; after: number; json?: unknown };

/** fetch stand-in: each model answers per its plan after `after` ms, or never (Infinity); aborts are honoured. */
function fakeGemini(plans: Record<string, Plan>) {
  const asked: string[] = [];
  const aborted: string[] = [];
  vi.stubGlobal("fetch", (_url: string, init: { body: string; signal: AbortSignal }) => {
    const model = JSON.parse(init.body).model as string;
    asked.push(model);
    const plan = plans[model] ?? { after: Infinity };
    return new Promise((resolve, reject) => {
      init.signal.addEventListener("abort", () => (aborted.push(model), reject(new Error("aborted"))));
      if (plan.after === Infinity) return;
      setTimeout(() => {
        const status = plan.status ?? 200;
        const body = status === 200 ? { steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(plan.json ?? { model }) }] }] } : { error: "busy" };
        resolve(new Response(JSON.stringify(body), { status }));
      }, plan.after);
    });
  });
  return { asked, aborted };
}

const ask = (onBusy?: () => void) => askGeminiJson({ key: "k", input: [{ type: "text", text: "hi" }], schema: {}, onBusy });
const [A, B, C] = [DEFAULT_MODEL, ...BACKUP_MODELS];

describe("askGeminiJson", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetModelHealth();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("asks the next model too when the first is silent for HEDGE_MS, and takes the first answer", async () => {
    const g = fakeGemini({ [A]: { after: Infinity }, [B]: { after: 2000 } });
    const busy = vi.fn();
    const p = ask(busy);
    await vi.advanceTimersByTimeAsync(HEDGE_MS - 1);
    expect(g.asked).toEqual([A]);
    await vi.advanceTimersByTimeAsync(2001);
    const a = await p;
    expect(a).toMatchObject({ ok: true, model: B });
    expect(busy).toHaveBeenCalledTimes(1);
    expect(g.aborted).toContain(A); // the silent one is stopped
  });

  it("the first answer wins even when it comes from the model asked first", async () => {
    const g = fakeGemini({ [A]: { after: 7000 }, [B]: { after: 5000 } });
    const p = ask();
    await vi.advanceTimersByTimeAsync(7000);
    expect(await p).toMatchObject({ ok: true, model: A });
    expect(g.aborted).toContain(B);
  });

  it("a busy model hands over at once and is asked last for a while", async () => {
    const g = fakeGemini({ [A]: { status: 503, after: 500 }, [B]: { after: 1000 } });
    const p = ask();
    await vi.advanceTimersByTimeAsync(1500);
    expect(await p).toMatchObject({ ok: true, model: B, tried: [`${A}: 503`] });
    expect(g.asked).toEqual([A, B]);
    // B answered, so it goes first; A said it was busy, so it goes last.
    expect(modelOrder(A)).toEqual([B, C, A]);
    expect(modelOrder(A, Date.now() + BUSY_FOR_MS + 1)[0]).toBe(B);
  });

  it("every model out of requests: quota", async () => {
    fakeGemini({ [A]: { status: 429, after: 100 }, [B]: { status: 429, after: 100 }, [C]: { status: 429, after: 100 } });
    const p = ask();
    await vi.advanceTimersByTimeAsync(1000);
    const a = await p;
    expect(a.ok).toBe(false);
    expect(outOfRequests([a])).toBe(true);
  });

  it("a request Google refuses for its shape isn't sent to the other models", async () => {
    const g = fakeGemini({ [A]: { status: 400, after: 100 } });
    const p = ask();
    await vi.advanceTimersByTimeAsync(200);
    expect((await p).ok).toBe(false);
    expect(g.asked).toEqual([A]);
  });
});
