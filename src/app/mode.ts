// Which journal this build is (DESIGN.md › Real app). The default is the sample journal: the design preview,
// the dev server and every test, frozen on Monday 16 November 2026 so its numbers match the screenshots.
// `--mode real` (npm run build:real / dev:real) builds the owner's own journal: it starts empty, runs on
// today's date and switches every sample stand-in off.
export const REAL = import.meta.env.VITE_JOURNAL === "real";

const pad = (n: number) => String(n).padStart(2, "0");

/** A local date as YYYY-MM-DD (the user's own day, not UTC). */
export const localDate = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** A local time as HH:MM. */
export const localTime = (d: Date = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** The user's own time zone as Settings shows it: "Lagos (UTC+1)", "New York (UTC−5)". */
export function detectedZone(now: Date = new Date()): string | null {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!iana) return null;
    const city = iana.split("/").pop()!.replace(/_/g, " ");
    const off = new Intl.DateTimeFormat("en-GB", { timeZone: iana, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value; // "GMT+1", "GMT-5", "GMT"
    const utc = !off || off === "GMT" ? "UTC+0" : off.replace("GMT", "UTC").replace("-", "\u2212");
    return `${city} (${utc})`;
  } catch {
    return null;
  }
}

