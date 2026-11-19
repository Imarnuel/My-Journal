// Frame 15 · Settings: Appearance, Weekly review, Reminders, Time and sessions, Your tags, Voice notes.
// Markup from handoff/prototype/Settings.dc.html. Appearance is the store's theme; preferences live in the
// store's settings (src/data/settings.ts); tag changes update every entry that carries the tag.
import { Fragment, useState } from "react";
import { Shell } from "../app/Shell";
import { useStore, type Appearance } from "../data/store";
import { DEFAULT_SESSIONS, REMINDER_TIMES, REVIEW_DAYS, TIME_ZONES, VOICE_LANGUAGES, usePref } from "../data/settings";
import { ChoiceSelect } from "../components/primitives/ChoiceSelect";
import { useMenu } from "./useKit";
import { Switch } from "./settings/Switch";
import { YourTags } from "./settings/YourTags";

const APPEARANCE: { label: string; value: Appearance }[] = [
  { label: "System", value: "system" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

const h2 = { margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" } as const;
const row = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px 24px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" } as const;
const timeInput = { font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 8px", colorScheme: "dark" } as const;

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={row}>
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{title}</div>
        {hint ? <div className="lbl">{hint}</div> : null}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>{children}</div>
    </div>
  );
}

type MenuKey = "rday" | "rtime" | "tz" | "lang";

export function Settings() {
  const menu = useMenu<MenuKey>();
  const appearance = useStore((s) => s.appearance);
  const setAppearance = useStore((s) => s.setAppearance);
  const [rday, setRday] = usePref("reviewDay");
  const [remind, setRemind] = usePref("reminderOn");
  const [rtime, setRtime] = usePref("reminderTime");
  const [tz, setTz] = usePref("timeZone");
  const [sess, setSess] = usePref("sessions");
  const [lang, setLang] = usePref("voiceLanguage");
  const [keep, setKeep] = usePref("keepRecordings");
  const [sessEdit, setSessEdit] = useState(false);

  const select = (key: MenuKey, name: string, value: string, options: string[], pick: (v: string) => void, triggerName?: string) => (
    <ChoiceSelect
      name={name}
      triggerName={triggerName}
      value={value}
      options={options}
      open={menu.isOpen(key)}
      onToggle={() => menu.toggle(key)}
      onClose={menu.close}
      onPick={(o) => {
        pick(o);
        menu.close();
      }}
    />
  );

  const setTime = (i: number, j: 1 | 2, v: string) => setSess(sess.map((x, k) => (k === i ? (j === 1 ? [x[0], v, x[2]] : [x[0], x[1], v]) : x)) as typeof sess);

  return (
    <Shell active="settings">
      <div style={{ maxWidth: "760px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" }}>Settings</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }} />
        </header>

        <section aria-labelledby="set-appearance" style={{ display: "flex", flexDirection: "column" }}>
          <h2 id="set-appearance" style={h2}>Appearance</h2>
          <div style={{ marginTop: "12px" }}>
            <Row title="Theme" hint="System follows your computer. Light is the default.">
              <div role="group" aria-label="Appearance" className="kseg-track" style={{ display: "flex" }}>
                {APPEARANCE.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={appearance === o.value ? "true" : "false"}
                    onClick={() => setAppearance(o.value)}
                    style={{ font: "inherit", fontSize: "14px", border: 0, borderRadius: "var(--r-sm)", padding: "0 16px", minHeight: "32px", cursor: "pointer" }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Row>
          </div>
        </section>

        <section aria-labelledby="set-review" style={{ display: "flex", flexDirection: "column" }}>
          <h2 id="set-review" style={h2}>Weekly review</h2>
          <div style={{ marginTop: "12px" }}>
            <Row title="Review day" hint="One reminder that day, only if you traded that week.">
              {select("rday", "Review day", rday, REVIEW_DAYS, setRday)}
            </Row>
          </div>
        </section>

        <section aria-labelledby="set-reminders" style={{ display: "flex", flexDirection: "column" }}>
          <h2 id="set-reminders" style={h2}>Reminders</h2>
          <div style={{ marginTop: "12px" }}>
            <Row title="One gentle reminder" hint="Only when a trade from MT5 has no charts yet. Never more than one, and nothing piles up.">
              {select("rtime", "Reminder time", rtime, REMINDER_TIMES, setRtime)}
              <Switch on={remind} label="Reminder" onFlip={() => setRemind(!remind)} />
            </Row>
          </div>
        </section>

        <section aria-labelledby="set-time" style={{ display: "flex", flexDirection: "column" }}>
          <h2 id="set-time" style={h2}>Time and sessions</h2>
          <p className="meta" style={{ margin: "4px 0 0" }}>Shown in your time zone. They shift automatically when clocks change.</p>
          <div style={{ marginTop: "12px" }}>
            <Row title="Time zone" hint="Detected from your computer. Sessions and days are worked out from it.">
              {select("tz", "Time zone", tz, TIME_ZONES, setTz)}
            </Row>
            <div style={{ marginTop: "8px" }}>
              {sess.map((x, i) => (
                <Fragment key={x[0]}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "1px solid var(--border-subtle)", fontSize: "14px", minHeight: "44px" }}>
                    <span>{x[0]}</span>
                    {sessEdit ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
                        <input type="time" aria-label={`${x[0]} starts`} value={x[1]} onChange={(e) => setTime(i, 1, e.target.value)} style={timeInput} />
                        to
                        <input type="time" aria-label={`${x[0]} ends`} value={x[2]} onChange={(e) => setTime(i, 2, e.target.value)} style={timeInput} />
                      </span>
                    ) : (
                      <span className="num">{`${x[1]} to ${x[2]}`}</span>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button type="button" onClick={() => setSessEdit(!sessEdit)} className="btn btn-q" style={{ padding: "0 4px" }}>
                {sessEdit ? "Done" : "Edit session times"}
              </button>
              {sessEdit ? (
                <button type="button" onClick={() => setSess(DEFAULT_SESSIONS)} className="btn btn-q" style={{ padding: "0 4px", color: "var(--text-3)" }}>
                  Reset to defaults
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <YourTags />

        <section aria-labelledby="set-voice" style={{ display: "flex", flexDirection: "column" }}>
          <h2 id="set-voice" style={h2}>Voice notes</h2>
          <div style={{ marginTop: "12px" }}>
            <Row title="Language">{select("lang", "Voice note language", lang, VOICE_LANGUAGES, setLang)}</Row>
            <Row title="Keep recordings" hint="Turn off to keep only the written transcript.">
              <Switch on={keep} label="Keep recordings" onFlip={() => setKeep(!keep)} />
            </Row>
          </div>
        </section>
      </div>
    </Shell>
  );
}
