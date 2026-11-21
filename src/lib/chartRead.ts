// Reading a chart screenshot (DESIGN.md › Chart reading): what the server function asks Gemini, and how the
// answer is trusted before it fills anything. The rules come from handoff/docs/01-decisions.md "Charts in a
// story": timeframe captions only from the chart's legend, normalised and only on a clean match; for accounts
// without MT5, entry, stop and target from the position box; prices that can't be read are typed by the user.
import type { Dir } from "./types";

export type ChartReadContext = {
  /** Pairs the user trades (the facts menu), so symbols map to the user's own spelling. */
  pairs: string[];
};

/** What one chart gave, every field optional. `unreadable`: a position box is there but its prices aren't legible. */
export type ChartRead = {
  ok: true;
  pair: string | null;
  dir: Dir | null;
  entry: string | null;
  stop: string | null;
  target: string | null;
  timeframe: string | null;
  unreadable: boolean;
};
export type ChartReadResult = ChartRead | { ok: false; reason: "failed" | "offline" };

export function chartSchema() {
  const price = { type: ["string", "null"], description: "The price exactly as printed on the chart, digits and decimal point only. Null if not printed or not legible." };
  return {
    type: "object",
    properties: {
      symbol: { type: ["string", "null"], description: "The instrument in the chart's legend or title, as written (e.g. 'GBPUSD', 'OANDA:XAUUSD', 'EUR/USD'). Null if not shown." },
      timeframe: { type: ["string", "null"], description: "The timeframe exactly as written in the chart's legend or toolbar (e.g. '240', '4h', 'H4', '15', 'D', '1W'). Null if not shown. Never guess from the time axis." },
      position_box: { type: "boolean", description: "True if a long or short position tool (the two shaded zones for profit and loss) is drawn." },
      direction: { type: ["string", "null"], enum: ["Long", "Short", null], description: "Long or Short from the position tool. Null without one." },
      entry: price,
      stop: { ...price, description: "Stop loss price from the position tool's loss zone edge. " + price.description },
      target: { ...price, description: "Take profit price from the position tool's profit zone edge. " + price.description },
      prices_legible: { type: "boolean", description: "False if a position tool is drawn but its prices are too small or blurry to read with confidence." },
      price_text: {
        type: ["string", "null"],
        description:
          "The printed text the prices were read from, copied character for character: the position tool's labels and the price tags at its edges (e.g. 'Stop: 1.27010 (17.0) | 1.26840 | Target: 1.26480 (36.0)'). Null if no price text can be read.",
      },
    },
    required: ["symbol", "timeframe", "position_box", "direction", "entry", "stop", "target", "prices_legible", "price_text"],
  };
}

export function chartPrompt(ctx: ChartReadContext): string {
  return [
    "This is a screenshot of one trading chart (TradingView or MT5) from a trader's journal.",
    "Read only what is printed. Never estimate a price from where something sits on the axis; if a price isn't printed and legible, leave it null.",
    "Entry, stop and target come from the long or short position tool: the line between the two zones is the entry, the far edge of the loss zone is the stop, the far edge of the profit zone is the target.",
    "Copy the printed text you read each price from into price_text. If you can't make out the characters, set prices_legible to false and leave the prices and price_text null: a wrong price is worse than none.",
    `Pairs the trader uses: ${ctx.pairs.join(", ") || "any"}.`,
  ].join("\n");
}

const TF: Record<string, string> = {
  "1": "1m", "1m": "1m", m1: "1m", "3": "3m", "3m": "3m", m3: "3m", "5": "5m", "5m": "5m", m5: "5m", "15": "15m", "15m": "15m", m15: "15m",
  "30": "30m", "30m": "30m", m30: "30m", "60": "1H", "1h": "1H", h1: "1H", "120": "2H", "2h": "2H", h2: "2H", "240": "4H", "4h": "4H", h4: "4H",
  d: "Daily", "1d": "Daily", d1: "Daily", daily: "Daily", w: "Weekly", "1w": "Weekly", w1: "Weekly", weekly: "Weekly", m: "Monthly", "1mo": "Monthly", mn: "Monthly", mn1: "Monthly", monthly: "Monthly",
};

/** "240", "4h", "H4" all become "4H"; anything else is no caption (an unread caption is simply blank). */
export function normaliseTimeframe(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const k = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (k === "m") return raw.trim() === "M" ? "Monthly" : null; // "M" is monthly; "m" alone means nothing
  return TF[k] ?? null;
}

/** "OANDA:XAUUSD", "EUR/USD", "gbpusd" → the user's own spelling when it is one of their pairs. */
export function normalisePair(raw: unknown, pairs: string[]): string | null {
  if (typeof raw !== "string") return null;
  const bare = raw.split(":").pop()!.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (bare.length < 3 || bare.length > 12) return null;
  return pairs.find((p) => p.replace(/[^a-z0-9]/gi, "").toUpperCase() === bare) ?? bare;
}

const num = (v: unknown): number | null => {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const s = String(v).replace(/[\s,]/g, "");
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};

/** A price counts as printed only if its digits appear in the text quoted from the chart. */
const quoted = (price: unknown, text: string) => {
  const p = String(price).replace(/[\s,]/g, "");
  return p.length > 0 && text.replace(/[\s,]/g, "").includes(p);
};

/**
 * Trust nothing: prices must be plain numbers copied from printed text the model quotes back, and together they
 * must make sense for the direction (a long's stop below its entry and its target above). A set that doesn't fit
 * is dropped, never half-used. A box whose prices aren't quoted counts as unreadable (the user types them).
 */
export function readFromAnswer(raw: unknown, ctx: ChartReadContext): ChartRead {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const entry = num(a.entry);
  const stop = num(a.stop);
  const target = num(a.target);
  let dir: Dir | null = a.direction === "Long" || a.direction === "Short" ? a.direction : null;
  const box = a.position_box === true;
  const text = typeof a.price_text === "string" ? a.price_text : "";
  let prices = { entry, stop, target };
  // A price not found in the quoted text was guessed (a blurry chart still gets plausible numbers): drop the set.
  const unquoted = [entry != null && !quoted(a.entry, text), stop != null && !quoted(a.stop, text), target != null && !quoted(a.target, text)].some(Boolean);
  if (!box || unquoted) {
    // Prices only ever come from the position box, never from the axis.
    prices = { entry: null, stop: null, target: null };
  } else if (entry != null && stop != null) {
    const fromPrices: Dir = stop < entry ? "Long" : "Short";
    if (!dir) dir = fromPrices;
    const fits = dir === fromPrices && (target == null || (dir === "Long" ? target > entry : target < entry));
    if (!fits) prices = { entry: null, stop: null, target: null };
  } else {
    // Without both entry and stop nothing can be checked: keep only the entry.
    prices = { entry, stop: null, target: null };
  }
  const str = (n: number | null, src: unknown) => (n == null ? null : String(src).replace(/[\s,]/g, ""));
  return {
    ok: true,
    pair: normalisePair(a.symbol, ctx.pairs),
    dir: box ? dir : null,
    entry: str(prices.entry, a.entry),
    stop: str(prices.stop, a.stop),
    target: str(prices.target, a.target),
    timeframe: normaliseTimeframe(a.timeframe),
    unreadable: box && (a.prices_legible === false || unquoted),
  };
}
