// Frame 02 · Dashboard (home). Markup from handoff/prototype/Dashboard.dc.html; every number is computed from the
// shared store with src/lib/calc.ts and src/lib/dashboard.ts, so the period and the account picker change all of them.
import { useCallback, useMemo, useState } from "react";
import { Shell } from "../app/Shell";
import { useStore, useCountedAccounts } from "../data/store";
import type { Entry, Period } from "../lib/types";
import {
  breakdown, mistakeRows, noChartTrades, periodNumbers, PERIODS, recentStories, setupOrder, subtitle,
} from "../lib/dashboard";
import { SESSIONS } from "../lib/calc";
import { useKit, useMenu } from "./useKit";
import { Header } from "./dashboard/Header";
import { NoChartsNotice } from "./dashboard/Notices";
import { BySetup, Charts, SessionsAndMistakes, StatRow } from "./dashboard/Numbers";
import { Footnote, Recent } from "./dashboard/Stories";

export function Dashboard() {
  const menu = useMenu<"ap" | "period">();
  const kit = useKit(menu as ReturnType<typeof useMenu>);
  const entries = useStore((s) => s.entries);
  const picked = useCountedAccounts(); // ticked accounts, plus trades with no account (DESIGN.md)
  const today = useStore((s) => s.today);
  const setups = useStore((s) => s.setups);

  const [period, setPeriod] = useState<Period>("month");
  const [eqTab, setEqTab] = useState(false);
  const [barTab, setBarTab] = useState(false);
  // The line draws in once on first load; after that it only morphs.
  const [drawn, setDrawn] = useState(false);
  const onDrawn = useCallback(() => setDrawn(true), []);

  const p = useMemo(() => periodNumbers(entries, picked, period, today), [entries, picked, period, today]);
  const setupRows = useMemo(() => breakdown(p.T, setupOrder(setups, p.T), (e: Entry) => e.setup), [p.T, setups]);
  const sessRows = useMemo(() => breakdown(p.T, SESSIONS, (e: Entry) => e.session), [p.T]);
  const mist = useMemo(() => mistakeRows(p.T), [p.T]);
  const thumbs = useMemo(() => Object.fromEntries(setups.filter((s) => s.chart).map((s) => [s.name, s.chart])), [setups]);
  const recent = useMemo(() => recentStories(entries), [entries]);
  const noCharts = useMemo(() => noChartTrades(entries), [entries]);

  const counts = useMemo(
    () => Object.fromEntries(PERIODS.map((o) => [o.key, periodNumbers(entries, picked, o.key, today).T.length])) as Record<Period, number>,
    [entries, picked, today],
  );
  const periodMenu = { open: menu.isOpen("period"), toggle: () => menu.toggle("period"), close: menu.close };

  const pick = (x: Period) => {
    menu.close();
    setPeriod(x);
  };

  return (
    <Shell active="dashboard">
      <Header sub={subtitle(period, today)} period={period} setPeriod={pick} counts={counts} periodMenu={periodMenu} kit={kit} />
      <NoChartsNotice trades={noCharts} />
      {/* The numbers always show, as far as they go: rates wait for 5 trades (DESIGN.md › Dashboard with few trades). */}
      <StatRow p={p} />
      {/* With no trades in the period, charts and tables have nothing to show: only the counts above. */}
      {p.T.length ? (
        <>
      <Charts
        p={p}
        period={period}
        eqTab={eqTab}
        barTab={barTab}
        flipEq={() => setEqTab((x) => !x)}
        flipBar={() => setBarTab((x) => !x)}
        drawIn={!drawn}
        onDrawn={onDrawn}
      />
      <BySetup rows={setupRows} thumbs={thumbs} />
      <SessionsAndMistakes sessions={sessRows} mistakes={mist.rows} untagged={mist.untagged} n={p.s.n} />
        </>
      ) : null}

      <Recent stories={recent} />
      <Footnote />
    </Shell>
  );
}
