// Frame 12 · Accounts: list, Archived group, set-once rules (default account for screenshots, copied trades).
// Markup from handoff/prototype/Accounts.dc.html; rows come from the shared store.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore } from "../data/store";
import { defaultScreenshotAccount } from "../data/seed";
import type { Account } from "../lib/types";
import { ChoiceSelect } from "../components/primitives/ChoiceSelect";
import { toast } from "../components/primitives/toast";
import { useMenu } from "./useKit";

const COLS = "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) 20px";
const COPY_OPTS = ["Attach to both", "Only the first account", "Ask me each time"];

const badge = { fontSize: "12px", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "999px", padding: "2px 8px", marginLeft: "12px", lineHeight: "16px" } as const;

function Source({ a }: { a: Account }) {
  if (a.source === "mt5")
    return (
      <>
        <span className="kstatus-ic">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
        </span>
        MT5 · synced 2 min ago
      </>
    );
  if (a.source === "mt5-reconnect")
    return (
      <>
        <span className="kstatus-ic" style={{ color: "var(--attention)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></svg>
        </span>
        MT5 · reconnect needed
      </>
    );
  return (
    <>
      <span className="kstatus-ic">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="9" cy="9" r="1.8" /><path d="M21 15l-5-5L5 21" /></svg>
      </span>
      Your screenshots
    </>
  );
}

export function Accounts() {
  const menu = useMenu<"dflt" | "copy">();
  const accounts = useStore((s) => s.accounts);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const updateAccount = useStore((s) => s.updateAccount);
  const active = accounts.filter((a) => !a.archived);
  const archived = accounts.filter((a) => a.archived);
  const dflt = (settings.defaultAccount as string) ?? defaultScreenshotAccount;
  const copy = (settings.copiedTrades as string) ?? "Attach to both";
  const arcOpen = !!settings.accountsArchivedOpen;

  return (
    <Shell active="accounts">
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" }}>
            Accounts <span style={{ fontWeight: 400, color: "var(--text-3)" }}>({active.length})</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/accounts/new" className="btn btn-p">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            Add account
          </Link>
        </div>
      </header>

      <section aria-label="Your accounts" className="card" style={{ borderRadius: "var(--r-card)", overflow: "hidden" }}>
        <div aria-hidden="true" className="acct-head" style={{ display: "grid", gridTemplateColumns: COLS, gap: "16px", padding: "12px 16px", fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>
          <span>Name</span>
          <span>Type</span>
          <span>Trade numbers from</span>
          <span />
        </div>
        <ul style={{ margin: 0, padding: 0 }}>
          {active.map((a) => (
            <li key={a.name} style={{ listStyle: "none" }}>
              <Link
                to={`/accounts/${slug(a.name)}`}
                className="krow acct-row"
                style={{ display: "grid", gridTemplateColumns: COLS, gap: "16px", alignItems: "center", minHeight: "60px", padding: "0 16px", borderTop: "1px solid var(--border-subtle)", textDecoration: "none", color: "var(--text-1)" }}
              >
                <span style={{ fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: "4px" }}>
                  {a.name}
                  {a.name === dflt ? <span style={badge}>Default for screenshots</span> : a.practice ? <span style={badge}>Practice</span> : null}
                </span>
                <span style={{ fontSize: "14px", color: "var(--text-2)" }}>{a.type}</span>
                <span style={{ fontSize: "14px", color: "var(--text-2)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Source a={a} />
                </span>
                <span style={{ color: "var(--text-3)", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {archived.length ? (
          <>
            <button
              type="button"
              aria-expanded={arcOpen ? "true" : "false"}
              onClick={() => setSetting("accountsArchivedOpen", !arcOpen)}
              style={{ font: "inherit", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "0 16px", minHeight: "56px", border: 0, borderTop: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-2)", cursor: "pointer", fontSize: "14px" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></svg>
                {`Archived (${archived.length}) · ${archived.map((a) => a.name).join(", ")}`}
              </span>
              <span style={{ display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </button>
            {arcOpen
              ? archived.map((a) => (
                  <Fragment key={a.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 16px", borderTop: "1px solid var(--border-subtle)", minHeight: "44px" }}>
                      <span style={{ fontSize: "14px" }}>{a.name}</span>
                      <span className="lbl">{[a.type, a.archivedNote].filter(Boolean).join(" · ")}</span>
                      <button
                        type="button"
                        className="btn btn-q"
                        onClick={() => {
                          updateAccount(a.name, { archived: false });
                          toast(`${a.name} restored`, () => updateAccount(a.name, { archived: true }), "restored");
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  </Fragment>
                ))
              : null}
          </>
        ) : null}
      </section>

      <p className="meta" style={{ margin: 0 }}>Practice accounts never mix into your numbers unless you tick them. They always feed your playbook.</p>

      <section aria-labelledby="auto" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
            <span id="auto">When logging</span>
          </h2>
          <span className="lbl">Set once, never asked again</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px 24px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)", marginTop: "12px" }}>
          <span style={{ fontSize: "14px" }}>Screenshots with no MT5 match go to</span>
          <ChoiceSelect
            name="Screenshots with no MT5 match go to"
            value={dflt}
            options={active.map((a) => a.name)}
            open={menu.isOpen("dflt")}
            onToggle={() => menu.toggle("dflt")}
            onClose={menu.close}
            onPick={(o) => {
              setSetting("defaultAccount", o);
              menu.close();
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px 24px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "14px" }}>When one trade shows up on two accounts</span>
          <ChoiceSelect
            name="When one trade shows up on two accounts"
            triggerName="Copied trades"
            value={copy}
            options={COPY_OPTS}
            open={menu.isOpen("copy")}
            onToggle={() => menu.toggle("copy")}
            onClose={menu.close}
            onPick={(o) => {
              setSetting("copiedTrades", o);
              menu.close();
            }}
          />
        </div>
      </section>
    </Shell>
  );
}
