// Voice note recordings of the real journal, kept in the browser's database apart from the journal data
// (one record per story, so the journal itself stays small). Settings › Voice notes › Keep recordings off
// means none are kept. DESIGN.md › Real app.
import { idbStorage, keysWith } from "./persist";

const PREFIX = "voice:";
const key = (id: string) => `${PREFIX}${id}`;

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

/**
 * Remove every kept recording whose story isn't kept (DESIGN.md › Real app): run when the journal opens, so a
 * deleted story's recording goes once its Undo can no longer bring it back (an Undo never outlives the visit).
 */
export async function sweepVoiceAudio(isKept: (id: string) => boolean): Promise<number> {
  const gone = (await keysWith(PREFIX)).filter((k) => !isKept(k.slice(PREFIX.length)));
  await Promise.all(gone.map((k) => idbStorage.removeItem(k)));
  return gone.length;
}
