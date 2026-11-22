// Frame 13 · Add account: name, type, Practice, optional MT5 (login, server, read-only investor password).
// Markup from handoff/prototype/AddAccount.dc.html; adds to the shared store and goes to Accounts.
import { Breadcrumbs } from "../components/primitives/Breadcrumbs";
import { Icon } from "../components/primitives/Icon";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "../app/Shell";
import { useStore } from "../data/store";
import { AccountFields, fieldStyle, labelStyle, type AccountDraft } from "./accounts/AccountFields";
import { useAccountMeta } from "./accounts/meta";
import { testConnection, type Mt5Result } from "./accounts/mt5";
import { Switch } from "./settings/Switch";
import { REAL } from "../app/mode";
import "./accounts/accounts.css";

export function AddAccount() {
  const nav = useNavigate();
  const accounts = useStore((s) => s.accounts);
  const today = useStore((s) => s.today);
  const addAccount = useStore((s) => s.addAccount);
  const setMeta = useAccountMeta((s) => s.setMeta);

  const [d, setD] = useState<AccountDraft>({ name: "", type: "Prop firm", own: "", ownOpen: false, practice: false });
  const [nameInvalid, setNameInvalid] = useState(false);
  const [mt5, setMt5] = useState(true);
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [password, setPassword] = useState("");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<Mt5Result | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLInputElement>(null);
  const serverRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);

  const editMt5 = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    fn(e.target.value);
    setConnected(null);
  };

  const test = () => {
    if (testing) return;
    if (!login.trim()) return loginRef.current?.focus();
    if (!server.trim()) return serverRef.current?.focus();
    setTesting(true);
    testConnection(login.trim(), server.trim(), password).then((r) => {
      if (!alive.current) return;
      setTesting(false);
      setConnected(r);
    });
  };

  const add = (e: React.MouseEvent) => {
    const name = d.name.trim();
    const taken = accounts.some((a) => a.name.toLowerCase() === name.toLowerCase());
    if (!name || taken) {
      // Name errors aren't designed (06-open-items.md item 2): keep the user on the field.
      e.preventDefault();
      setNameInvalid(true);
      nameRef.current?.focus();
      return;
    }
    // The real journal has no MT5 sync yet: it keeps login and server and marks the account as waiting
    // (DESIGN.md › Real app). Missing details keep the user on the field, as name errors do.
    if (REAL && mt5 && (!login.trim() || !server.trim())) {
      e.preventDefault();
      (login.trim() ? serverRef : loginRef).current?.focus();
      return;
    }
    const synced = mt5 && (!!connected || (!!login.trim() && !!server.trim()));
    addAccount({ name, type: d.type.trim() || "Live", practice: d.practice, archived: false, source: synced ? (REAL ? "mt5-waiting" : "mt5") : "screenshots" });
    setMeta(name, { added: today, ...(synced ? { login: login.trim(), server: server.trim() } : {}) });
    e.preventDefault();
    nav("/accounts");
  };

  return (
    <Shell active="accounts">
      <div style={{ maxWidth: "620px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Breadcrumbs items={[{ label: "Accounts", to: "/accounts", icon: <Icon name="acct" size={16} /> }, { label: "Add an account", icon: <Icon name="plus" size={16} /> }]} />
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: "24px", lineHeight: "32px" }}>Add an account</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }} />
        </header>

        <section aria-label="Account details" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AccountFields
            d={d}
            set={(p) => {
              setD((cur) => ({ ...cur, ...p }));
              if (p.name !== undefined) setNameInvalid(false);
            }}
            practiceHint="Kept out of your numbers by default. Ticked for you on Demo and Backtest."
            nameRef={nameRef}
            nameInvalid={nameInvalid}
            placeholder="e.g. Funded 100K"
          />
        </section>

        <section aria-labelledby="mt5h" className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "var(--r-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
            <div>
              <h2 id="mt5h" style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
                Connect MT5 <span style={{ fontWeight: 500, color: "var(--text-3)" }}>· optional</span>
              </h2>
              <p className="meta" style={{ margin: "4px 0 0" }}>Your charts always come from your screenshots. MT5 just fills in each trade's numbers: entry, exit, size and result.</p>
            </div>
            <Switch on={mt5} label="Connect MT5" onFlip={() => setMt5(!mt5)} />
          </div>
          {mt5 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="fld-login" style={labelStyle}>Login</label>
                  <input ref={loginRef} id="fld-login" name="username" autoComplete="username" type="text" inputMode="numeric" value={login} onChange={editMt5(setLogin)} style={fieldStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="fld-server" style={labelStyle}>Server</label>
                  <input ref={serverRef} id="fld-server" name="server" autoComplete="off" type="text" value={server} onChange={editMt5(setServer)} aria-describedby="fld-server-hint" style={fieldStyle} />
                  <span id="fld-server-hint" className="lbl">Start typing your broker's name</span>
                </div>
              </div>
              {REAL ? (
                <p className="lbl" style={{ margin: 0 }}>MT5 sync isn't built yet. Your login and server are kept, and trade numbers fill in once it is.</p>
              ) : (
              <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="fld-investor-password" style={labelStyle}>Investor password</label>
                <input id="fld-investor-password" name="password" autoComplete="current-password" type="password" value={password} onChange={editMt5(setPassword)} aria-describedby="fld-password-hint" style={fieldStyle} />
                <span id="fld-password-hint" className="lbl">Read-only: it can see your trades but can never place or close one. It's in your broker's welcome email.</span>
              </div>
              {connected ? (
                <div role="status" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                  <span style={{ color: "var(--profit)", display: "flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                  {`Connected · ${connected.server} · ${connected.balance}`}
                </div>
              ) : (
                <button type="button" className="btn btn-g kload" style={{ alignSelf: "flex-start" }} onClick={test} aria-busy={testing ? "true" : "false"} aria-disabled={testing ? "true" : undefined}>
                  <span className="kload-label">Test connection</span>
                  <span className="kload-spin" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.56" /></svg>
                  </span>
                </button>
              )}
              </>
              )}
            </div>
          ) : (
            <p className="lbl" style={{ margin: 0 }}>You'll confirm each trade's numbers from your screenshot instead.</p>
          )}
        </section>

        <Link to="/accounts" onClick={add} className="btn btn-p" style={{ width: "100%" }}>
          Add account
        </Link>
      </div>
    </Shell>
  );
}
