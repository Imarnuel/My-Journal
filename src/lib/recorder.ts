// Recording a voice note in the browser (the real journal; DESIGN.md › Real app). Chrome and Firefox record
// audio/webm (Opus), Safari audio/mp4; Gemini reads both. The microphone is released when recording ends.

export type Recording = { blob: Blob; mime: string; seconds: number };
/** `level()`: how loud the microphone is right now, 0 to 1, for the live waveform (DESIGN.md › Voice note: recording). */
export type Recorder = { stop: () => Promise<Recording>; cancel: () => void; level: () => number };
export type RecorderError = "mic" | "unsupported";

const MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function recordingSupported(): boolean {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
}

/** Ask for the microphone and start recording. Rejects with "mic" when the user (or the browser) says no. */
export async function startRecorder(): Promise<Recorder> {
  if (!recordingSupported()) throw "unsupported" as RecorderError;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    throw "mic" as RecorderError;
  }
  const mime = MIMES.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? "";
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
  const chunks: Blob[] = [];
  const started = performance.now();
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start(1000);
  const meter = levelMeter(stream);
  const release = () => (stream.getTracks().forEach((t) => t.stop()), meter.close());
  return {
    stop: () =>
      new Promise<Recording>((resolve) => {
        rec.onstop = () => {
          release();
          const type = rec.mimeType || mime || "audio/webm";
          resolve({ blob: new Blob(chunks, { type }), mime: type, seconds: Math.max(1, Math.round((performance.now() - started) / 1000)) });
        };
        rec.state === "inactive" ? rec.onstop(new Event("stop")) : rec.stop();
      }),
    cancel: () => {
      rec.onstop = release;
      if (rec.state !== "inactive") rec.stop();
      else release();
    },
    level: meter.level,
  };
}

/** The microphone's loudness, read from the same stream as the recording (no second permission). */
function levelMeter(stream: MediaStream): { level: () => number; close: () => void } {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) throw new Error("no audio context");
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    return {
      level: () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        // Speech sits around 0.02 to 0.2 RMS; a square root spreads quiet talk across the bar's height.
        return Math.min(1, Math.sqrt(Math.sqrt(sum / buf.length) * 5));
      },
      close: () => void ctx.close().catch(() => undefined),
    };
  } catch {
    return { level: () => 0, close: () => undefined };
  }
}

/** A blob as base64 (no data: prefix), for sending. */
export async function toBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}
