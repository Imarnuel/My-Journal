// The switch (02-look-and-feel.md "Switches"): for settings that take effect at once. Markup from the frames.
export function Switch({ on, label, onFlip }: { on: boolean; label: string; onFlip: () => void }) {
  return on ? (
    <button
      type="button"
      onClick={onFlip}
      role="switch"
      aria-checked="true"
      aria-label={label}
      style={{ flex: "none", width: "46px", height: "28px", borderRadius: "999px", border: 0, background: "var(--inverse-bg)", position: "relative", cursor: "pointer" }}
    >
      <span style={{ position: "absolute", top: "3px", right: "3px", width: "22px", height: "22px", borderRadius: "11px", background: "var(--surface-inset)" }} />
    </button>
  ) : (
    <button
      type="button"
      onClick={onFlip}
      role="switch"
      aria-checked="false"
      aria-label={label}
      style={{ flex: "none", width: "46px", height: "28px", borderRadius: "999px", border: "1px solid var(--border)", background: "var(--surface-inset)", position: "relative", cursor: "pointer" }}
    >
      <span style={{ position: "absolute", top: "3px", left: "3px", width: "20px", height: "20px", borderRadius: "10px", background: "var(--text-3)" }} />
    </button>
  );
}
