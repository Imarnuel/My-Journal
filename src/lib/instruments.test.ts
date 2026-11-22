// The Pair picker's dictionary (DESIGN.md › Pair picker): nothing is limited, search understands traders, and
// broker spellings map to the owner's own.
import { describe, expect, it } from "vitest";
import { GROUPS, INSTRUMENTS, instrumentOf, ownSpelling, pairResults, tidyPair, yourPairs } from "./instruments";

const tickers = (q: string, yours: string[] = []) => pairResults(q, yours).sections.flatMap((s) => s.rows.map((r) => r.t));

describe("the dictionary", () => {
  it("has every major and every cross of the eight major currencies (28), once each", () => {
    const ccy = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD"];
    const fx = INSTRUMENTS.filter((i) => i.group === "Majors" || i.group === "Crosses").map((i) => i.t);
    expect(fx).toHaveLength(28);
    expect(new Set(fx).size).toBe(28);
    for (let a = 0; a < ccy.length; a++)
      for (let b = a + 1; b < ccy.length; b++) expect(fx.some((t) => t === ccy[a] + ccy[b] || t === ccy[b] + ccy[a])).toBe(true);
    expect(new Set(INSTRUMENTS.map((i) => i.t)).size).toBe(INSTRUMENTS.length);
  });
});

describe("tidying what is typed", () => {
  it("capitals, no prefix, slashes, spaces or symbols; 15 characters at most", () => {
    expect(tidyPair("eur/usd")).toBe("EURUSD");
    expect(tidyPair("OANDA:xau_usd")).toBe("XAUUSD");
    expect(tidyPair("US 30")).toBe("US30");
    expect(tidyPair("=cmd|'calc'!A1")).toBe("CMDCALCA1");
    expect(tidyPair("my gold trade 🙂")).toBe("MYGOLDTRADE");
    expect(tidyPair("A".repeat(30))).toHaveLength(15);
  });
});

describe("broker spellings", () => {
  it("aliases and suffixes find the instrument", () => {
    for (const s of ["GOLD", "XAUUSD.a", "XAUUSDm", "XAUUSD_i", "xauusd", "OANDA:XAUUSD", "XAU/USD"]) expect(instrumentOf(s)?.t).toBe("XAUUSD");
    expect(instrumentOf("EURUSDm")?.t).toBe("EURUSD");
    expect(instrumentOf("GBPJPY-ECN")?.t).toBe("GBPJPY");
    expect(instrumentOf("US30.cash")?.t).toBe("US30");
    expect(instrumentOf("USTEC")?.t).toBe("NAS100");
    expect(instrumentOf("AAPL")).toBeNull();
  });
  it("readings take the owner's spelling; unknown ones are only tidied", () => {
    expect(ownSpelling("XAUUSD", ["GOLD"])).toBe("GOLD");
    expect(ownSpelling("GOLD", ["XAUUSD"])).toBe("XAUUSD");
    expect(ownSpelling("XAUUSD.a", [])).toBe("XAUUSD");
    expect(ownSpelling("aapl", [])).toBe("AAPL");
    expect(ownSpelling("NAS100", ["USTEC"])).toBe("USTEC");
  });
});

describe("your pairs", () => {
  it("most used first, most recent breaks ties; several pairs in one story each count", () => {
    const e = [
      { pair: "EURUSD", date: "2026-11-01" },
      { pair: "XAUUSD", date: "2026-11-02" },
      { pair: "XAUUSD, GBPJPY", date: "2026-11-03" },
      { pair: "GBPJPY", date: "2026-11-05" },
    ];
    expect(yourPairs(e)).toEqual(["GBPJPY", "XAUUSD", "EURUSD"]);
  });
});

describe("the menu's list", () => {
  it("without a search: your 8 most used, then every group in full (yours stay in their group too)", () => {
    const yours = ["GBPJPY", "XAUUSD", "AAPL", "EURUSD", "US30", "BTCUSD", "AUDNZD", "CADJPY", "NZDCHF"];
    const r = pairResults("", yours);
    expect(r.sections.map((s) => s.label)).toEqual(["Your pairs", ...GROUPS]);
    expect(r.sections[0].rows.map((x) => x.t)).toEqual(yours.slice(0, 8));
    expect(r.sections.find((s) => s.label === "Crosses")!.rows).toHaveLength(21);
    expect(r.sections.find((s) => s.label === "Crosses")!.rows.map((x) => x.t)).toContain("GBPJPY");
    expect(r.use).toBeNull();
    expect(pairResults("", []).sections[0].label).toBe("Majors"); // a new journal starts with the full list
  });
  it("one currency lists every pair with it; names and nicknames work", () => {
    const jpy = tickers("jpy");
    expect(jpy).toHaveLength(7);
    expect(jpy).toEqual(expect.arrayContaining(["USDJPY", "GBPJPY", "EURJPY", "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY"]));
    expect(tickers("gj")[0]).toBe("GBPJPY");
    expect(tickers("cable")[0]).toBe("GBPUSD");
    expect(tickers("gold")[0]).toBe("XAUUSD");
    expect(tickers("nasdaq")[0]).toBe("NAS100");
  });
  it("a typo finds the real pair first; Use is last and only for what isn't an exact ticker", () => {
    const r = pairResults("gbpjyp", []);
    expect(r.sections[0].rows[0].t).toBe("GBPJPY");
    expect(r.use).toBe("GBPJYP");
    expect(pairResults("GBPJPY", []).use).toBeNull();
    expect(pairResults("aapl", []).use).toBe("AAPL");
    expect(pairResults("aapl", []).sections).toHaveLength(0);
  });
  it("your own pairs come first among matches", () => {
    expect(tickers("eur", ["EURNZD"])[0]).toBe("EURNZD");
  });
});
