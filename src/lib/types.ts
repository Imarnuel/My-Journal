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
};

export type Account = {
  name: string;
  type: string; // Live, Prop firm, Demo, Backtest, or own
  practice: boolean;
  archived: boolean;
};

export type Week = { monday: string; takeaway: string | null; watched: number; not_filled: number };

export type Tag = { t: string; n: number; k: TagKind };

export type Period = "week" | "month" | "3m";
