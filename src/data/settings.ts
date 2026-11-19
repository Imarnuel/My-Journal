// Settings preferences (frame 15, handoff/docs/01-decisions.md "Settings"): keys and defaults.
// Values live in the shared store's `settings` (setSetting); this file only names them and holds the defaults.
import { useStore } from "./store";

export type SessionTimes = [name: string, start: string, end: string][];

export const DEFAULT_SESSIONS: SessionTimes = [
  ["Asia", "01:00", "10:00"],
  ["London", "09:00", "17:30"],
  ["New York", "14:00", "23:00"],
];

export const REVIEW_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const REMINDER_TIMES = ["6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm"];
export const TIME_ZONES = ["Lagos (UTC+1)", "London (UTC+0)", "New York (UTC−5)", "Dubai (UTC+4)", "Singapore (UTC+8)"];
export const VOICE_LANGUAGES = ["English", "French", "Spanish", "Portuguese", "Arabic"];

/** Every preference Settings owns, with its default (the frame's values). */
export const SETTINGS_DEFAULTS = {
  reviewDay: "Saturday",
  reminderOn: true,
  reminderTime: "8:00 pm",
  timeZone: "Lagos (UTC+1)",
  sessions: DEFAULT_SESSIONS,
  voiceLanguage: "English",
  keepRecordings: true,
  /** Look-alike tag pairs already merged or no longer relevant ("from>into"). */
  mergedLookalikes: [] as string[],
};

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;

/** Read one Settings preference from the shared store, falling back to its default. */
export function usePref<K extends SettingKey>(key: K): [(typeof SETTINGS_DEFAULTS)[K], (v: (typeof SETTINGS_DEFAULTS)[K]) => void] {
  const raw = useStore((s) => s.settings[key]);
  const setSetting = useStore((s) => s.setSetting);
  const value = (raw === undefined ? SETTINGS_DEFAULTS[key] : raw) as (typeof SETTINGS_DEFAULTS)[K];
  return [value, (v) => setSetting(key, v)];
}
