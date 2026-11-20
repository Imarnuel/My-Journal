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
