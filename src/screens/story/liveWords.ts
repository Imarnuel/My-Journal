// Live words while a voice note is recorded (DESIGN.md › Voice note: recording). The browser's own speech
// recognition shows what it hears as you talk, so you can see the note is being heard. It is only a preview: after
// Stop, Gemini still reads the recording and writes the notes, and the live words are never saved. Where the browser
// has no speech recognition (Firefox), or it is refused, the card keeps its waveform and its usual line.

/** What has been heard so far: settled phrases, and the words still being worked out (shown grey). */
export type Heard = { final: string[]; partial: string };
export const NOTHING_HEARD: Heard = { final: [], partial: "" };

type SR = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type SRClass = new () => SR;

function recognition(): SRClass | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRClass; webkitSpeechRecognition?: SRClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** The voice note language (Settings › Voice notes) as a speech recognition locale, near the browser's own. */
export function speechLocale(language: string): string {
  const base: Record<string, string> = { English: "en-US", French: "fr-FR", Spanish: "es-ES", Portuguese: "pt-BR", Arabic: "ar-SA" };
  const code = (base[language] ?? "en-US").slice(0, 2);
  const mine = (typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : []).find((l) => l?.toLowerCase().startsWith(code));
  return mine ?? base[language] ?? "en-US";
}

/** Errors that mean live words won't work here; others (a pause with no speech) just carry on. */
const GIVE_UP = new Set(["not-allowed", "service-not-allowed", "language-not-supported", "audio-capture", "network"]);

/**
 * Start listening for live words. `onHeard` gets the whole picture each time; `onUnavailable` says live words
 * aren't available here (the card then keeps its usual line). Returns null when the browser has no speech
 * recognition at all. Chrome ends a session after a pause, so listening restarts until stopped.
 */
export function startLiveWords(language: string, onHeard: (h: Heard) => void, onUnavailable: () => void): { stop: () => void } | null {
  const Rec = recognition();
  if (!Rec) return null;
  let on = true;
  let before: string[] = []; // phrases from earlier sessions
  let rec: SR | null = null;
  const begin = () => {
    const r = new Rec();
    r.lang = speechLocale(language);
    r.continuous = true;
    r.interimResults = true;
    let fin: string[] = [];
    r.onresult = (e) => {
      const done: string[] = [];
      let partial = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.trim();
        if (!t) continue;
        if (e.results[i].isFinal) done.push(t);
        else partial += (partial ? " " : "") + t;
      }
      fin = done;
      onHeard({ final: [...before, ...fin], partial });
    };
    r.onerror = (e) => {
      if (!GIVE_UP.has(e.error)) return;
      on = false;
      onUnavailable();
    };
    r.onend = () => {
      before = [...before, ...fin];
      fin = [];
      if (on) {
        try {
          begin();
        } catch {
          on = false;
        }
      }
    };
    rec = r;
    r.start();
  };
  try {
    begin();
  } catch {
    return null;
  }
  return {
    stop: () => {
      on = false;
      try {
        rec?.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

/** The whole note as one line of text (for the reading card, after Stop). */
export const heardText = (h: Heard) => [...h.final, h.partial].filter(Boolean).join(" ");

// ---- The sample journal: a simulated speaker, so the card can be seen working without a microphone. It takes a
// breath before talking (the first two seconds are quiet), then says the sample note at an easy pace.

const SAMPLE = [
  "Short from last week's four hour supply zone,",
  "weekly and daily both bearish.",
  "Entered on the fifteen minute retest",
  "after a break of structure, on plan.",
  "Waiting for the candle to close",
  "kept the entry calm.",
  "Worth repeating.",
];
const START = 2000; // ms of quiet before the sample speaker talks
const PER_WORD = 380; // ms

/** What the sample speaker has said `ms` after recording started. */
export function sampleHeard(ms: number): Heard {
  const words = Math.max(0, Math.floor((ms - START) / PER_WORD));
  const final: string[] = [];
  let n = 0;
  for (const phrase of SAMPLE) {
    const w = phrase.split(" ");
    if (n + w.length <= words - 3) final.push(phrase), (n += w.length);
    else {
      const all = SAMPLE.join(" ").split(" ");
      return { final, partial: all.slice(n, Math.min(words, all.length)).join(" ") };
    }
  }
  return { final, partial: "" };
}

/** How loud the sample speaker is `ms` after recording started: quiet first, then syllables and short pauses. */
export function sampleLevel(ms: number): number {
  if (ms < START) return 0;
  const t = (ms - START) / 1000;
  if (t > (SAMPLE.join(" ").split(" ").length * PER_WORD) / 1000 + 0.6) return 0; // finished talking
  // Syllables (fast) inside words (slower), louder and softer phrases, and a short pause now and then.
  const syllable = Math.abs(Math.sin(t * 8.3)) ** 1.6;
  const word = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.1 + 0.4));
  const phrase = 0.65 + 0.35 * Math.sin(t * 0.7);
  const breath = Math.sin(t * 0.9) > 0.92 ? 0.05 : 1;
  return Math.min(1, Math.max(0, syllable * word * phrase * breath));
}
