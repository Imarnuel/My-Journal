// Frame 14 · Edit account: rename, type, Practice, MT5 status, Save changes, Archive (bar with Restore),
// Delete (deleted state with Undo and a way back). Markup from handoff/prototype/EditAccount.dc.html.
import { Breadcrumbs } from "../components/primitives/Breadcrumbs";
import { Icon } from "../components/primitives/Icon";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore } from "../data/store";
import type { Account, Entry } from "../lib/types";
import { toast } from "../components/primitives/toast";
import { AccountFields, draftFrom, type AccountDraft } from "./accounts/AccountFields";
import { addedLabel, useAccountMeta } from "./accounts/meta";

type Gone = { account: Account; index: number; entries: [Entry, number][]; picked: string[]; stories: number };

const row = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px 24px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" } as const;

function EditForm({ account, onDelete }: { account: Account; onDelete: () => void }) {
  const nav = useNavigate();
  const accounts = useStore((s) => s.accounts);
  const entries = useStore((s) => s.entries);
  const today = useStore((s) => s.today);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const updateAccount = useStore((s) => s.updateAccount);
  const meta = useAccountMeta((s) => s.meta[account.name]) ?? {};
  const renameMeta = useAccountMeta((s) => s.renameMeta);
  const [d, setD] = useState<AccountDraft>(() => draftFrom(account));
  const [nameInvalid, setNameInvalid] = useState(false);
  const [synced, setSynced] = useState("Synced 2 min ago");
  const nameRef = useRef<HTMLInputElement>(null);

  const stories = entries.filter((e) => e.account === account.name).length;
  const sub = [account.type, meta.added ? `added ${addedLabel(meta.added, today)}` : null, `${stories} chart ${stories === 1 ? "story" : "stories"}`].filter(Boolean).join(" · ");

  const save = (e: React.MouseEvent) => {
    e.preventDefault();
    const name = d.name.trim();
    const clash = accounts.some((a) => a.name !== account.name && a.name.toLowerCase() === name.toLowerCase());
    if (!name || clash) {
      // Name errors aren't designed (06-open-items.md item 2): keep the user on the field.
      setNameInvalid(true);
      nameRef.current?.focus();
      return;
    }
    updateAccount(account.name, { name, type: d.type.trim() || account.type, practice: d.practice });
    if (name !== account.name) {
      renameMeta(account.name, name);
      if (settings.defaultAccount === account.name) setSetting("defaultAccount", name);
    }
    nav("/accounts");
  };

  const archive = () => {
    updateAccount(account.name, { archived: true });
    toast(`${account.name} archived`, () => updateAccount(account.name, { archived: false }));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const reconnect = () => {
    if (account.source === "mt5-reconnect") updateAccount(account.name, { source: "mt5" });
    setSynced("Synced just now");
    toast("Reconnected. Synced just now.");
  };

  return (
    <>
      {account.archived ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <span className="meta">Archived. It has left your account lists; its chart stories stay in your playbook.</span>
          <button type="button" className="btn btn-q" onClick={() => updateAccount(account.name, { archived: false })} style={{ marginLeft: "auto" }}>
            Restore
          </button>
        </div>
      ) : null}
      <div style={{ maxWidth: "620px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Breadcrumbs items={[{ label: "Accounts", to: "/accounts", icon: <Icon name="acct" size={16} /> }, { label: account.name, icon: <Icon name="fact-acct" size={16} /> }]} />
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" }}>{account.name}</h1>
            <p className="meta" style={{ margin: 0 }}>{sub}</p>
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
            practiceHint="Kept out of your numbers by default"
            nameRef={nameRef}
            nameInvalid={nameInvalid}
          />
        </section>

        {account.source !== "screenshots" ? (
          <section aria-labelledby="mt5h" className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", display: "flex", flexDirection: "column", gap: "12px", padding: "24px", borderRadius: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h2 id="mt5h" style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>MT5</h2>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                {account.source === "mt5-reconnect" ? (
                  <span className="kstatus-ic" style={{ color: "var(--attention)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></svg>
                  </span>
                ) : (
                  <span className="kstatus-ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
                  </span>
                )}
                {[account.source === "mt5-reconnect" ? "Reconnect needed" : synced, meta.server].filter(Boolean).join(" · ")}
              </span>
            </div>
            <p className="meta" style={{ margin: 0 }}>Prop firms often issue a new investor password when an account resets. If syncing stops, reconnect here.</p>
            <button type="button" onClick={reconnect} className="btn btn-g" style={{ alignSelf: "flex-start" }}>
              Reconnect
            </button>
          </section>
        ) : null}

        <Link to="/accounts" onClick={save} className="btn btn-p" style={{ width: "100%" }}>
          Save changes
        </Link>

        <section aria-label="Archive or delete" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={row}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Archive account</div>
              <div className="lbl">Passed, failed or reset? Archive it. Its chart stories stay in your playbook; it just leaves your lists.</div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button type="button" onClick={archive} className="btn btn-g" disabled={account.archived} style={account.archived ? { opacity: 0.45, cursor: "not-allowed" } : undefined}>
                Archive
              </button>
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Delete account</div>
              <div className="lbl">{`Removes the account and all ${stories} of its chart stories. You can undo it straight after.`}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button type="button" onClick={onDelete} className="btn btn-q" style={{ color: "var(--loss)" }}>
                Delete
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function EditAccount() {
  const { id } = useParams();
  const accounts = useStore((s) => s.accounts);
  const [gone, setGone] = useState<Gone | null>(null);
  const account = accounts.find((a) => slug(a.name) === id);

  const del = (a: Account) => {
    const s = useStore.getState();
    const index = s.accounts.findIndex((x) => x.name === a.name);
    const mine: [Entry, number][] = [];
    s.entries.forEach((e, i) => e.account === a.name && mine.push([e, i]));
    setGone({ account: a, index, entries: mine, picked: s.picked, stories: mine.length });
    s.removeAccount(a.name);
    for (const [e] of mine) s.removeEntry(e.id);
    window.scrollTo({ top: 0 });
  };

  const undo = () => {
    if (!gone) return;
    const s = useStore.getState();
    s.restoreAccount(gone.account, gone.index);
    for (const [e, i] of gone.entries) s.restoreEntry(e, i);
    s.setPicked(gone.picked);
    setGone(null);
  };

  if (gone)
    return (
      <Shell active="accounts">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "120px 0" }}>
          <div className="medal" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 32 32"><rect x="9" y="11" width="14" height="15" rx="2.5" style={{ fill: "var(--medal-glyph)" }} /><rect x="7" y="7" width="18" height="3" rx="1.5" style={{ fill: "var(--medal-glyph-2)" }} /><rect x="13" y="5" width="6" height="3" rx="1.5" style={{ fill: "var(--medal-glyph-2)" }} /></svg>
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: "16px", fontWeight: 500, lineHeight: "24px", letterSpacing: 0 }}>{`${gone.account.name} deleted`}</h1>
          <span className="meta">{`Its ${gone.stories} chart ${gone.stories === 1 ? "story is" : "stories are"} gone and your numbers no longer include them.`}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="btn btn-g" onClick={undo}>
              Undo
            </button>
            <Link to="/accounts" className="btn btn-p">
              Back to accounts
            </Link>
          </div>
        </div>
      </Shell>
    );

  // An address that matches no account (renamed or deleted elsewhere) goes back to the list.
  if (!account) return <Navigate to="/accounts" replace />;

  return (
    <Shell active="accounts">
      <EditForm key={account.name} account={account} onDelete={() => del(account)} />
    </Shell>
  );
}
