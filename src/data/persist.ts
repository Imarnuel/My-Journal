// Saving to the browser, so the journal survives a reload (local-first until there is a back end).
// Everything lives in one IndexedDB database ("journal", store "kv"), one record per zustand store.
// If IndexedDB is unavailable (private window, blocked site data) it falls back to localStorage, and if
// that fails too the app still works for the visit. Uploaded chart images are turned from temporary
// blob: URLs into data URLs so they can be saved with their entry.
import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { REAL } from "../app/mode";

// The real journal keeps its own database, so it never meets the sample one (DESIGN.md › Real app).
const DB = REAL ? "journal-real" : "journal";
const STORE = "kv";
export const DATA_VERSION = 1;

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbp)
    dbp = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("IndexedDB blocked"));
      } catch (e) {
        reject(e);
      }
    });
  return dbp;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const t = d.transaction(STORE, mode);
        const r = fn(t.objectStore(STORE));
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }),
  );
}

const ls: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* full or blocked: keep working for this visit */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

/** IndexedDB first, localStorage as a fallback. */
export const idbStorage: StateStorage = {
  getItem: async (k) => {
    try {
      return ((await tx("readonly", (s) => s.get(k))) as string | undefined) ?? null;
    } catch {
      return ls.getItem(k);
    }
  },
  setItem: async (k, v) => {
    try {
      await tx("readwrite", (s) => s.put(v, k));
    } catch {
      ls.setItem(k, v);
    }
  },
  removeItem: async (k) => {
    try {
      await tx("readwrite", (s) => s.delete(k));
    } catch {
      ls.removeItem(k);
    }
  },
};

export const storage = createJSONStorage(() => idbStorage);

/** Common options for every persisted store. */
export const persistOptions = { storage, version: DATA_VERSION } as const;

/** Read a blob: URL into a data URL so it can be saved. Returns the input if it can't be read. */
export async function toDataUrl(url: string): Promise<string> {
  if (!url.startsWith("blob:")) return url;
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/** Wipe everything saved (used by tests and for a future "start fresh"). */
export async function clearSaved() {
  try {
    await tx("readwrite", (s) => s.clear());
  } catch {
    /* ignore */
  }
}
