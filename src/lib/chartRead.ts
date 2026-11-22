// Reading a chart screenshot (DESIGN.md › Chart reading): what the server function asks Gemini, and how the
// answer is trusted before it fills anything. The rules come from handoff/docs/01-decisions.md "Charts in a
// story": timeframe captions only from the chart's legend, normalised and only on a clean match; for accounts
// without MT5, entry, stop and target from the position box; prices that can't be read are typed by the user.
import type { Dir } from "./types";
import { instrumentOf, ownSpelling } from "./instruments.ts";

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
  /** When the chart was captured, from TradingView's "created with TradingView.com, <date> UTC" line (ISO, UTC). */
  takenAt?: string | null;
  /** One position box, drawn without any prices printed (its tags show only while it's selected). */
  noPrices?: boolean;
};
/** "quota": the free daily allowance is used up (every model answered 429). */
export type ChartReadResult = ChartRead | { ok: false; reason: "failed" | "offline" | "quota" };

export function chartSchema() {
  const price = { type: ["string", "null"], description: "The price exactly as printed on the chart, digits and decimal point only. Null if not printed or not legible." };
  return {
    type: "object",
    properties: {
      symbol: {
        type: ["string", "null"],
        description:
          "The instrument's standard ticker, from the chart's legend or title. If the legend writes a name, give its ticker (e.g. 'Australian Dollar / U.S. Dollar' is 'AUDUSD', 'Silver / U.S. Dollar' is 'XAGUSD'). Null if not shown.",
      },
      timeframe: { type: ["string", "null"], description: "The timeframe exactly as written in the chart's legend or toolbar (e.g. '240', '4h', 'H4', '15', 'D', '1W'). Null if not shown. Never guess from the time axis." },
      positions: {
        type: "array",
        description: "One item per long or short position tool drawn, from left to right. Empty if there is none.",
        items: {
          type: "object",
          properties: {
            direction: { type: ["string", "null"], enum: ["Long", "Short", null], description: "Long or Short from this position tool." },
            entry: { ...price, description: "Entry price, where this tool's two zones meet. " + price.description },
            stop: { ...price, description: "Stop loss price, at the far edge of this tool's loss zone. " + price.description },
            target: { ...price, description: "Take profit price, at the far edge of this tool's profit zone. " + price.description },
          },
          required: ["direction", "entry", "stop", "target"],
        },
      },
      snapshot_header: {
        type: ["string", "null"],
        description: "The line at the very top of a TradingView snapshot that says who created it with TradingView.com and when (e.g. 'trader created with TradingView.com, Nov 12, 2026 04:39 UTC'), copied exactly. Null if there is none.",
      },
      prices_legible: { type: "boolean", description: "False if a position tool is drawn but its prices are too small or blurry to read with confidence." },
      price_text: {
        type: ["string", "null"],
        description:
          "The printed text the prices were read from, copied character for character: the position tool's labels and the coloured price tags on the price axis at its edges (e.g. 'Stop: 1.27010 (17.0) | 1.26840 | Target: 1.26480 (36.0)'). Null if no price text can be read.",
      },
    },
    required: ["symbol", "timeframe", "positions", "snapshot_header", "prices_legible", "price_text"],
  };
}

export function chartPrompt(ctx: ChartReadContext): string {
  return [
    "This is a screenshot of one trading chart (TradingView or MT5) from a trader's journal.",
    "Read only what is printed. Never estimate a price from where something sits on the axis; if a price isn't printed and legible, leave it null.",
    // The position tool, by where its zones sit (colours can be changed by the trader).
    "Entry, stop and target come from the long or short position tool: two shaded zones that meet at the entry, usually red (loss) and green or blue (profit), though the trader may have changed the colours. The zone on the stop side is the loss zone: its far edge is the stop; the far edge of the other zone is the target.",
    "The tool's prices are often printed only as coloured tags on the right-hand price axis, level with its edges: a red tag for the stop, a grey tag for the entry, a green or blue tag for the target. Read them there, or from the tool's own labels.",
    // What is not a trade.
    "Ignore everything else that prints a number: the current-price tag (often with a countdown), tags of horizontal lines (often black or grey), the legend's open, high, low and close, indicator values (RSI, moving averages and the like), and drawings such as shaded zones, arrows and hand-drawn paths.",
    // MetaTrader.
    "On an MT5 or MT4 chart, an open trade shows as a line at the entry price with its order details, and lines labelled 'sl' (stop) and 'tp' (target), each with its price on the axis. Read those as one position.",
    "If more than one position tool or trade is drawn, give each one its own item with its own prices; don't mix the tags of different tools.",
    "If the screenshot holds several chart panes, read the symbol and timeframe of the pane with the trade; if the panes show different instruments and none has a trade, leave the symbol null.",
    "Copy the printed text you read each price from into price_text, separators and all (e.g. '1.26840', '4,068.70' or '4.068,70'). If you can't make out the characters, set prices_legible to false and leave the prices and price_text null: a wrong price is worse than none.",
    `Pairs the trader uses: ${ctx.pairs.slice(0, 60).join(", ") || "any"}.`,
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
  // A known instrument in any spelling ("GOLD", "XAUUSD.a", "US30.cash") takes the owner's spelling.
  if (instrumentOf(raw)) return ownSpelling(raw, pairs);
  const bare = raw.split(":").pop()!.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (bare.length < 3 || bare.length > 10) return null;
  // The owner's own spelling when it is one of their pairs; otherwise only something shaped like a ticker
  // ("EURUSD", "US30", "NAS100"), never a name run together ("EUROUSDOLLAR").
  return pairs.find((p) => p.replace(/[^a-z0-9]/gi, "").toUpperCase() === bare) ?? (/^[A-Z][A-Z0-9]{2,9}$/.test(bare) ? bare : null);
}

/**
 * Whether a chart writes decimals with a comma ("4.068,70", "1,26840"), decided from all its printed prices at
 * once, so "4,068.70" (thousands) and "1,26840" (a European decimal) are never confused.
 */
export function commaDecimals(prices: string[]): boolean {
  const all = prices.map((p) => p.replace(/\s/g, ""));
  if (all.some((p) => /\d\.\d{3},\d/.test(p) || /,\d+$/.test(p) && /\.\d{3}(,|$)/.test(p))) return true; // 4.068,70
  if (all.some((p) => /\d,\d{3}\.\d/.test(p) || /\.\d+$/.test(p))) return false; // 4,068.70 or 1.26840
  // Only commas: a comma before anything but exactly three digits is a decimal mark ("1,26840", "211,840" stays
  // ambiguous and is read as thousands, the common case for the indices that print it).
  return all.some((p) => /,(\d{1,2}|\d{4,})$/.test(p));
}

/** A printed price as a plain number string ("4068.70"), or null if it isn't one. */
export function plainPrice(v: unknown, comma: boolean): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  let s = String(v).replace(/\s/g, "");
  s = comma ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  return /^\d+(\.\d+)?$/.test(s) ? s : null;
}

const num = (v: string | null): number | null => (v == null ? null : Number(v));

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
  const text = typeof a.price_text === "string" ? a.price_text : "";
  const tools = (Array.isArray(a.positions) ? a.positions : []).map((p) => (p && typeof p === "object" ? p : {}) as Record<string, unknown>);
  const read = tools.map((p) => readPosition(p, text));
  const legend = { ok: true as const, pair: normalisePair(a.symbol, ctx.pairs), timeframe: normaliseTimeframe(a.timeframe), takenAt: snapshotTime(a.snapshot_header) };
  const none = { dir: null, entry: null, stop: null, target: null };
  if (tools.length === 0) return { ...legend, ...none, unreadable: false, noPrices: false };
  if (tools.length > 1) {
    // Several position tools (the owner's choice, 2026-11-21): which one is this trade isn't clear, so only the
    // direction, and only when every tool's readable prices give the same one. The owner types the prices.
    const dirs = read.map((r) => r?.dir ?? null);
    const dir = dirs.every((d) => d && d === dirs[0]) ? dirs[0] : null;
    return { ...legend, ...none, dir, unreadable: false, noPrices: false };
  }
  const one = read[0];
  // A box whose prices weren't printed legibly or weren't quoted counts as unreadable (the user types them); a box
  // read clearly but with no prices printed at all is told apart (DESIGN.md › Chart reading, #12).
  const hadPrices = [tools[0].entry, tools[0].stop, tools[0].target].some((v) => v != null);
  const unreadable = a.prices_legible === false || (!one && hadPrices);
  return { ...legend, ...(one ?? none), unreadable, noPrices: !one && !unreadable };
}

/**
 * One position tool. Prices must be plain numbers copied from printed text the model quotes back, and together
 * they must make sense (a long's stop below its entry and its target above). The direction only ever comes from
 * readable prices, never from the model's word or the colours. A set that doesn't fit is dropped whole.
 */
function readPosition(p: Record<string, unknown>, text: string): { dir: Dir; entry: string; stop: string; target: string | null } | null {
  const raw = [p.entry, p.stop, p.target].filter((v): v is string => typeof v === "string");
  const comma = commaDecimals([...raw, ...(text.match(/[\d.,]+\d/g) ?? [])]);
  const [e, st, tg] = [plainPrice(p.entry, comma), plainPrice(p.stop, comma), plainPrice(p.target, comma)];
  const entry = num(e);
  const stop = num(st);
  const target = num(tg);
  if (entry == null || stop == null) return null;
  // A price not found in the quoted text was guessed (a blurry chart still gets plausible numbers).
  if (!quoted(p.entry, text) || !quoted(p.stop, text) || (target != null && !quoted(p.target, text))) return null;
  // The prices decide the direction; the model's own "Long"/"Short" is ignored (on the owner's GBPJPY chart it
  // read every price right and still called a short "Long"). Stop and target must sit on opposite sides.
  const dir: Dir = stop < entry ? "Long" : "Short";
  if (stop === entry) return null;
  if (target != null && (dir === "Long" ? target <= entry : target >= entry)) return null;
  return { dir, entry: e!, stop: st!, target: tg };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "… created with TradingView.com, Nov 12, 2026 04:39 UTC" → "2026-11-12T04:39:00.000Z"; anything else, null. */
export function snapshotTime(header: unknown): string | null {
  if (typeof header !== "string" || !/TradingView/i.test(header)) return null;
  const m = /([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}), (\d{4}),? (\d{1,2}):(\d{2}) UTC/.exec(header);
  if (!m) return null;
  const mon = MONTHS.indexOf(m[1].toLowerCase());
  const [d, y, h, mi] = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])];
  if (mon < 0 || d < 1 || d > 31 || h > 23 || mi > 59 || y < 2000) return null;
  const t = new Date(Date.UTC(y, mon, d, h, mi));
  return t.getUTCDate() === d ? t.toISOString() : null;
}

/**
 * Every chart is read twice at once. Printed prices come back the same both times; guessed ones don't (a blurry
 * chart gave three different stops in three reads), so prices and direction are kept only when both reads match
 * exactly; a mismatch fills nothing and says nothing. Pair, timeframe and date are kept where the two agree.
 */
export function agreeReads(a: ChartRead, b: ChartRead | null): ChartRead {
  const same = <T,>(x: T, y: T) => (x === y ? x : null);
  if (!b) {
    // Only one read came back: nothing to check the prices against, so only the legend is used, and nothing is
    // said about the prices: the owner simply types them, as when reading fails.
    return { ...a, dir: null, entry: null, stop: null, target: null, unreadable: false, noPrices: false };
  }
  const match = a.dir === b.dir && a.entry === b.entry && a.stop === b.stop && a.target === b.target;
  return {
    ok: true,
    pair: same(a.pair, b.pair),
    timeframe: same(a.timeframe, b.timeframe),
    takenAt: same(a.takenAt ?? null, b.takenAt ?? null),
    dir: match ? a.dir : null,
    entry: match ? a.entry : null,
    stop: match ? a.stop : null,
    target: match ? a.target : null,
    // Reads that disagree stay silent (the owner's choice, 2026-11-22): the prices are left empty and no card
    // claims they're too small. A card only shows when both reads say the same thing.
    unreadable: a.unreadable && b.unreadable,
    noPrices: !!(a.noPrices && b.noPrices),
  };
}
