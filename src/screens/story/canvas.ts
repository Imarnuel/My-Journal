// Values the chart story frames show that the sample data (handoff/data) doesn't carry.
// From handoff/prototype/Story.dc.html and NewStory.dc.html (INIT.saved and INIT.new).
import type { Story, StoryExtras } from "../../lib/story";
import { sessionOf } from "../../lib/story";
import { localDate, localTime, REAL } from "../../app/mode";
import { useStore } from "../../data/store";
import { DEFAULT_SESSIONS } from "../../data/settings";

/** Chart captions are read from the chart's legend; for the frame's drawings they are known. */
export const CAPTION: Record<string, string> = { gW: "Weekly", gD: "", g4H: "4H", gE: "15m", gA: "15m" };
export const captionOf = (key: string) => CAPTION[key] ?? "";

/**
 * The saved story on the canvas (e20, GBPUSD Short, Mon 16 Nov 09:45, Funded 100K) and the analysis it
 * links to (e26). Applied until the story is first edited; after that the entry holds its own values.
 */
export const CANVAS_EXTRAS: Record<string, StoryExtras> = {
  e20: {
    before: "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.",
    refl: "Patience paid off: no rushing, held to target. Bring the same patience to Gold.",
    suggested: false,
    headspace: "Calm",
    transcript:
      '"Weekly and daily both bearish, so I took the [[4H supply pullback]]. Price came into last week\'s [[supply zone]], the fifteen minute [[broke structure]], I waited for the candle to close and got in on the [[retest]]. Felt [[calm]]. Stuck to the [[plan]]."',
    chartList: ["gW", "gD", "g4H", "gE", "gA"],
    numbers: { entry: "1.26840", stop: "1.27010", target: "1.26480", exit: "1.26482", size: "0.50 lots" },
    voiceLen: "0:24",
    closeTime: "13:20",
  },
  e26: { chartList: ["gW", "gD"] },
};

/**
 * Where New chart story starts (frame 05): four charts already dropped, the facts and numbers read from
 * them and MT5, nothing else set. Stands in for the chart reader and MT5 match, which have no back end
 * yet (handoff/docs/06-open-items.md, Back end).
 */
export function newStoryStart(): Story {
  return REAL ? blankStory() : {
    pair: "GBPUSD",
    dir: "Short",
    status: "Taken",
    account: "Funded 100K",
    date: "2026-11-16",
    time: "09:45",
    session: "London",
    numbers: { entry: "1.26840", stop: "1.27010", target: "1.26480", exit: "1.26482", size: "0.50 lots" },
    r: 2.1,
    rByHand: false,
    charts: ["gW", "gD", "g4H", "gE"],
    before: "",
    refl: "",
    suggested: false,
    setup: null,
    tags: [],
    followed: null,
    headspace: null,
    voice: false,
    voiceLen: null,
    transcript: "",
    textbook: false,
    excluded: false,
    closeTime: null,
  };
}

/**
 * Where New chart story starts in the real journal: nothing read, nothing set, dated now (until a
 * screenshot or the owner gives it a date), on the first real account if there is one.
 */
function blankStory(): Story {
  const now = new Date();
  const time = localTime(now);
  const accounts = useStore.getState().accounts.filter((a) => !a.archived);
  return {
    pair: "",
    dir: null,
    status: "Taken",
    account: (accounts.find((a) => !a.practice) ?? accounts[0])?.name ?? "",
    date: localDate(now),
    time,
    session: sessionOf(time, (useStore.getState().settings.sessions as [string, string, string][] | undefined) ?? DEFAULT_SESSIONS),
    numbers: { entry: "", stop: "", target: "", exit: "", size: "" },
    r: null,
    rByHand: false,
    charts: [],
    before: "",
    refl: "",
    suggested: false,
    setup: null,
    tags: [],
    followed: null,
    headspace: null,
    voice: false,
    voiceLen: null,
    transcript: "",
    textbook: false,
    excluded: false,
    closeTime: null,
  };
}

export const PAIRS = ["GBPUSD", "EURUSD", "XAUUSD", "GBPJPY", "USDJPY", "AUDUSD", "EURJPY", "USDCAD", "NZDUSD"];
