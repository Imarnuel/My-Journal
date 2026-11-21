// Recording a voice note in the browser (the real journal; DESIGN.md › Real app). Chrome and Firefox record
// audio/webm (Opus), Safari audio/mp4; Gemini reads both. The microphone is released when recording ends.

export type Recording = { blob: Blob; mime: string; seconds: number };
export type Recorder = { stop: () => Promise<Recording>; cancel: () => void };
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
  const release = () => stream.getTracks().forEach((t) => t.stop());
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
  };
}

/** A blob as base64 (no data: prefix), for sending. */
export async function toBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}
