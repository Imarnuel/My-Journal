// Dashboard header: title, period line, period dropdown, account picker, New chart story. Markup from the prototype.
import { Link } from "react-router-dom";
import type { Period } from "../../lib/types";
import { PERIODS } from "../../lib/dashboard";
import type { useKit } from "../useKit";
import { instantNext } from "../../components/charts/tween";
import { AccountPicker } from "../../components/primitives/AccountPicker";
import { FilterMenu, type Opt } from "../tradelog/FilterMenu";
import { IcCalendar } from "../tradelog/icons";

type Kit = ReturnType<typeof useKit>;

type PeriodMenu = { open: boolean; toggle: () => void; close: () => void };

/** Trades counted in each period (the ticked accounts), shown beside each option; empty periods are dimmed. */
export function Header({ sub, period, setPeriod, counts, periodMenu, kit }: { sub: string; period: Period; setPeriod: (p: Period) => void; counts: Record<Period, number>; periodMenu: PeriodMenu; kit: Kit }) {
  const label = PERIODS.find((o) => o.key === period)!.label;
  const periodOpts: Opt[] = PERIODS.map((o) => ({ label: o.label, count: String(counts[o.key]), dim: counts[o.key] === 0, sel: o.key === period, pick: () => setPeriod(o.key) }));
  return (
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
        <h1 style={{ margin: "0", fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: "600", lineHeight: "32px", letterSpacing: "-0.025em" }}>Dashboard</h1>
        <p className="meta" style={{ margin: "0" }}>
          {sub}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* The period is a dropdown like the Trade log's Date filter (DESIGN.md › Dashboard period). */}
        <span onKeyDownCapture={instantNext} style={{ display: "inline-flex" }}>
          <FilterMenu
            name="Period"
            icon={<IcCalendar />}
            label={label}
            aria={`Period: ${label}`}
            active={false}
            open={periodMenu.open}
            onToggle={periodMenu.toggle}
            onClose={periodMenu.close}
            opts={periodOpts}
            width={240}
            align="right"
          />
        </span>
        <AccountPicker kit={kit} onKeyDownCapture={instantNext} />
        <Link to="/new" className="btn btn-p">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          New chart story
        </Link>
      </div>
    </header>
  );
}
