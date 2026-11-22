// What can go in a story's Pair (DESIGN.md › Pair picker): anything the owner trades. A short dictionary makes
// the menu useful from the first story (every forex major, cross and the common exotics, plus metals, indices,
// crypto and energy), makes search understand names and traders' nicknames, and maps broker spellings to the
// owner's own. Nothing here limits what can be typed.

export const GROUPS = ["Majors", "Crosses", "Exotics", "Metals", "Indices", "Crypto", "Energy"] as const;
export type Group = (typeof GROUPS)[number];

export type Instrument = {
  /** The ticker as the menu shows it. */
  t: string;
  group: Group;
  /** A quiet name beside the ticker (not for forex: the ticker says it). */
  name?: string;
  /** Other spellings brokers use (GOLD, XAUUSD.a is handled by suffix rules), matched exactly. */
  aliases?: string[];
  /** Words search understands: currency names, nicknames, shorthand like "gj". Lower case. */
  words?: string[];
};

const CUR: Record<string, string[]> = {
  USD: ["dollar", "us dollar", "greenback"],
  EUR: ["euro"],
  GBP: ["pound", "sterling"],
  JPY: ["yen"],
  CHF: ["franc", "swissy", "swissie"],
  AUD: ["aussie", "australian dollar"],
  CAD: ["loonie", "canadian dollar"],
  NZD: ["kiwi", "new zealand dollar"],
  ZAR: ["rand"],
  MXN: ["peso"],
  TRY: ["lira"],
  SGD: ["singapore dollar"],
  HKD: ["hong kong dollar"],
  NOK: ["krone", "norwegian krone"],
  SEK: ["krona", "swedish krona"],
  PLN: ["zloty"],
};

/** Traders' nicknames and two-letter shorthand. */
const NICK: Record<string, string[]> = {
  EURUSD: ["fiber", "eu"],
  GBPUSD: ["cable", "gu"],
  USDJPY: ["uj", "gopher"],
  USDCHF: ["swissie", "swissy", "uchf"],
  AUDUSD: ["aussie", "au"],
  USDCAD: ["loonie", "ucad", "uc"],
  NZDUSD: ["kiwi", "nu"],
  GBPJPY: ["gj", "guppy", "geppy", "beast"],
  EURJPY: ["ej", "yuppy"],
  EURGBP: ["eg", "chunnel"],
  AUDJPY: ["aj"],
  CADJPY: ["cj"],
  NZDJPY: ["nj"],
  CHFJPY: ["chfj"],
  GBPAUD: ["ga"],
  EURAUD: ["ea"],
  GBPCHF: ["gchf"],
  GBPNZD: ["gn"],
  AUDNZD: ["an"],
};

const fx = (t: string, group: Group): Instrument => ({ t, group, words: [...(CUR[t.slice(0, 3)] ?? []), ...(CUR[t.slice(3)] ?? []), ...(NICK[t] ?? [])] });

const MAJORS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD"];
const CROSSES = [
  "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURCAD", "EURNZD",
  "GBPJPY", "GBPCHF", "GBPAUD", "GBPCAD", "GBPNZD",
  "AUDJPY", "AUDCHF", "AUDCAD", "AUDNZD",
  "CADJPY", "CADCHF", "CHFJPY",
  "NZDJPY", "NZDCHF", "NZDCAD",
];
const EXOTICS = ["USDZAR", "USDMXN", "USDTRY", "EURTRY", "USDSGD", "USDHKD", "USDNOK", "USDSEK", "USDPLN", "EURPLN"];

export const INSTRUMENTS: Instrument[] = [
  ...MAJORS.map((t) => fx(t, "Majors")),
  ...CROSSES.map((t) => fx(t, "Crosses")),
  ...EXOTICS.map((t) => fx(t, "Exotics")),
  { t: "XAUUSD", group: "Metals", name: "Gold", aliases: ["GOLD", "XAU", "GOLDSPOT", "XAUUSDSPOT"], words: ["gold"] },
  { t: "XAGUSD", group: "Metals", name: "Silver", aliases: ["SILVER", "XAG"], words: ["silver"] },
  { t: "US30", group: "Indices", name: "Dow Jones", aliases: ["DJ30", "DJI", "DOW", "WS30", "DJIA", "US30CASH", "YM"], words: ["dow", "dow jones"] },
  { t: "NAS100", group: "Indices", name: "Nasdaq 100", aliases: ["USTEC", "NDX", "NAS", "US100", "NQ", "USTECH", "NASDAQ"], words: ["nasdaq", "tech"] },
  { t: "US500", group: "Indices", name: "S&P 500", aliases: ["SPX500", "SPX", "SP500", "ES", "SPX500USD", "USSPX500"], words: ["s&p", "sp500", "spx"] },
  { t: "GER40", group: "Indices", name: "DAX", aliases: ["DE40", "GER30", "DE30", "DAX", "DAX40", "GDAXI"], words: ["dax", "germany"] },
  { t: "UK100", group: "Indices", name: "FTSE 100", aliases: ["FTSE", "FTSE100", "UKX"], words: ["ftse", "footsie"] },
  { t: "JPN225", group: "Indices", name: "Nikkei 225", aliases: ["JP225", "NIKKEI", "NI225", "N225", "JPN225CASH"], words: ["nikkei"] },
  { t: "BTCUSD", group: "Crypto", name: "Bitcoin", aliases: ["BTC", "BTCUSDT", "XBTUSD", "BITCOIN"], words: ["bitcoin"] },
  { t: "ETHUSD", group: "Crypto", name: "Ethereum", aliases: ["ETH", "ETHUSDT", "ETHEREUM"], words: ["ethereum", "ether"] },
  { t: "USOIL", group: "Energy", name: "WTI oil", aliases: ["WTI", "CL", "XTIUSD", "OIL", "USOUSD", "CRUDE"], words: ["oil", "wti", "crude"] },
  { t: "UKOIL", group: "Energy", name: "Brent oil", aliases: ["BRENT", "XBRUSD", "UKOUSD"], words: ["brent", "oil"] },
];

const BY_TICKER = new Map(INSTRUMENTS.map((i) => [i.t, i]));
const BY_ALIAS = new Map(INSTRUMENTS.flatMap((i) => (i.aliases ?? []).map((a) => [a, i] as const)));

export const MAX_PAIR = 15;

/**
 * How a typed or read pair is written: capitals, no broker prefix ("OANDA:"), no slashes or spaces, and only
 * letters, digits, "." and "-" (no emoji, no spreadsheet-formula tricks), at most 15 characters.
 */
export function tidyPair(raw: string): string {
  const noPrefix = raw.includes(":") ? raw.slice(raw.lastIndexOf(":") + 1) : raw;
  return noPrefix.toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, MAX_PAIR);
}

/**
 * The dictionary's instrument a spelling stands for, if any: the ticker itself, a known alias ("GOLD"), or a
 * broker's suffix on either ("XAUUSD.a", "EURUSDm", "US30.cash", "XAUUSD_i", "GBPJPY-ECN", "EURUSD.pro").
 * Uses the raw text, so a lower-case broker suffix ("m") is told apart from the name.
 */
export function instrumentOf(raw: string): Instrument | null {
  const noPrefix = raw.includes(":") ? raw.slice(raw.lastIndexOf(":") + 1) : raw;
  const clean = noPrefix.replace(/[\s/]/g, "");
  const look = (s: string) => BY_TICKER.get(s.toUpperCase()) ?? BY_ALIAS.get(s.toUpperCase()) ?? null;
  const whole = look(clean);
  if (whole) return whole;
  // A separator starts a broker suffix: "XAUUSD.a", "US30.cash", "XAUUSD_i", "GBPJPY-ECN".
  const head = clean.split(/[._\-+]/)[0];
  if (head && head !== clean) {
    const h = look(head);
    if (h) return h;
  }
  // Lower-case letters glued on after a known ticker: "EURUSDm", "XAUUSDpro", "GBPJPYecn".
  const glued = /^([A-Z0-9]{3,})([a-z]{1,4})$/.exec(clean);
  if (glued) return look(glued[1]);
  return null;
}

/**
 * Write a pair the way the owner already does. A chart reading "XAUUSD" fills "GOLD" for someone who writes
 * GOLD, and the reverse; an unknown spelling is only tidied. Used for readings, never to rewrite what the
 * owner typed by hand.
 */
export function ownSpelling(raw: string, yours: string[]): string {
  const t = tidyPair(raw);
  if (!t) return t;
  if (yours.includes(t)) return t;
  const inst = instrumentOf(raw);
  if (!inst) return t;
  const mine = yours.find((p) => instrumentOf(p)?.t === inst.t);
  return mine ?? inst.t;
}

/** The owner's pairs, most used first (most recent breaks ties). */
export function yourPairs(entries: { pair: string; date?: string; time?: string }[]): string[] {
  const n = new Map<string, { count: number; last: string }>();
  for (const e of entries) {
    const when = `${e.date ?? ""}T${e.time ?? ""}`;
    for (const raw of e.pair.split(",")) {
      const p = raw.trim();
      if (!p) continue;
      const cur = n.get(p) ?? { count: 0, last: "" };
      n.set(p, { count: cur.count + 1, last: when > cur.last ? when : cur.last });
    }
  }
  return [...n.entries()].sort((a, b) => b[1].count - a[1].count || b[1].last.localeCompare(a[1].last)).map(([p]) => p);
}

/** Letters that differ between two spellings (insertions, removals, swaps of neighbours count once). */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

export type PairRow = { t: string; name?: string };
/** A group of rows; search results are one list without a label. */
export type PairSection = { label: "Your pairs" | Group | null; rows: PairRow[] };
export type PairResults = { sections: PairSection[]; use: string | null };

const row = (t: string): PairRow => ({ t, name: BY_TICKER.get(t)?.name ?? instrumentOf(t)?.name });

/**
 * What the Pair menu lists. Without a search: Your pairs (8 most used), then every group in full (a pair of
 * yours also stays in its group, so no group ever looks incomplete). With a search: one list of matches, best
 * first (your pairs, exact ticker, ticker starting with it, one currency, a close spelling, names and
 * nicknames), and "Use" for what was typed unless it is already a ticker in the list.
 */
export function pairResults(query: string, yours: string[]): PairResults {
  const own = yours.slice(0, 8);
  const q = query.trim();
  if (!q) {
    return {
      sections: [
        ...(own.length ? [{ label: "Your pairs" as const, rows: own.map(row) }] : []),
        ...GROUPS.map((g) => ({ label: g, rows: INSTRUMENTS.filter((i) => i.group === g).map((i) => row(i.t)) })),
      ],
      use: null,
    };
  }
  const T = tidyPair(q);
  const lower = q.toLowerCase();
  const all = [...new Set([...yours, ...INSTRUMENTS.map((i) => i.t)])];
  const score = (t: string): number | null => {
    const inst = BY_TICKER.get(t) ?? instrumentOf(t);
    const mine = yours.includes(t) ? -0.5 : 0;
    if (T && t === T) return 0 + mine;
    if (T && inst && (inst.aliases ?? []).includes(T)) return 1 + mine;
    if (T && t.startsWith(T)) return 2 + mine;
    if (T.length === 3 && /^[A-Z]{3}$/.test(T) && inst && ["Majors", "Crosses", "Exotics"].includes(inst.group) && t.includes(T)) return 3 + mine;
    if (inst?.words?.some((w) => w === lower || (lower.length >= 3 && w.startsWith(lower)))) return 4 + mine;
    if (inst?.name && lower.length >= 2 && inst.name.toLowerCase().startsWith(lower)) return 4 + mine;
    if (T.length >= 5 && distance(T, t) <= (T.length >= 6 ? 2 : 1)) return 5 + mine;
    if (T.length >= 3 && t.includes(T)) return 6 + mine;
    return null;
  };
  const hits = all
    .map((t) => ({ t, s: score(t) }))
    .filter((h): h is { t: string; s: number } => h.s != null)
    .sort((a, b) => a.s - b.s || all.indexOf(a.t) - all.indexOf(b.t));
  const exact = hits.some((h) => h.t === T);
  return { sections: hits.length ? [{ label: null, rows: hits.map((h) => row(h.t)) }] : [], use: T && !exact ? T : null };
}
