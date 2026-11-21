// Voice note recordings of the real journal, kept in the browser's database apart from the journal data
// (one record per story, so the journal itself stays small). Settings › Voice notes › Keep recordings off
// means none are kept. DESIGN.md › Real app.
import { idbStorage } from "./persist";

const key = (id: string) => `voice:${id}`;

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

export async function saveVoiceAudio(id: string, blob: Blob): Promise<void> {
  try {
    await idbStorage.setItem(key(id), await toDataUrl(blob));
  } catch {
    /* storage full or blocked: the notes are saved, only the recording isn't */
  }
}

/** The story's recording as a playable URL, or null. */
export async function loadVoiceAudio(id: string): Promise<string | null> {
  try {
    const v = await idbStorage.getItem(key(id));
    return typeof v === "string" && v.startsWith("data:") ? v : null;
  } catch {
    return null;
  }
}

export async function removeVoiceAudio(id: string): Promise<void> {
  try {
    await idbStorage.removeItem(key(id));
  } catch {
    /* nothing to remove */
  }
}
