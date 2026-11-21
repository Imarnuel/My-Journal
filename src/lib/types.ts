export type Status = "Taken" | "Running" | "Watched" | "Not filled" | "Analysis";
export type Dir = "Long" | "Short";
export type Session = "Asia" | "London" | "New York";
export type TagKind = "Good" | "Mistake" | "Neutral";

export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  pair: string;
  dir: Dir | null;
  status: Status;
  account: string;
  also: string | null;
  setup: string; // setup name or "Unsorted"
  session: Session;
  followed: boolean | null;
  tags: string[];
  mistakes: string[];
  r: number | null;
  charts: number;
  chartKey: string | null; // placeholder chart drawing on the canvas
  note: boolean;
  refl: string | null;
  plan: string | null;
  mt5: string | null;
  excluded: boolean;
  textbook: boolean;
  // Fields the sample doesn't carry (05-data-and-calculations.md); filled by the chart story screens.
  before?: string | null; // Before / during note
  suggested?: boolean; // reflection is a "Suggested reflection" (Keep / Delete) until kept or edited
  headspace?: string | null;
  transcript?: string | null;
  chartList?: string[]; // chart keys or image URLs, in the user's order
  numbers?: { entry?: string; stop?: string; target?: string; exit?: string; size?: string };
  rByHand?: boolean; // the result was typed, so editing the prices doesn't work it out again (DESIGN.md, Editing numbers)
  shortTrade?: "ask" | "counted" | "left-out"; // very short trade prompt (Count it / Leave it out)
};

/** "mt5-waiting": MT5 details kept in the real journal until sync exists (DESIGN.md › Real app). */
export type AccountSource = "mt5" | "mt5-reconnect" | "mt5-waiting" | "screenshots";
export type Account = {
  name: string;
  type: string; // Live, Prop firm, Demo, Backtest, or own
  practice: boolean;
  archived: boolean;
  source: AccountSource; // where trade numbers come from
  archivedNote?: string; // e.g. "failed in September · 31 chart stories"
};

export type Week = { monday: string; takeaway: string | null; watched: number; not_filled: number };

export type Tag = { t: string; n: number; k: TagKind };

export type Period = "week" | "month" | "3m";
