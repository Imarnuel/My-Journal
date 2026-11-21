// Kept recordings (DESIGN.md › Real app): only the written notes are kept by default; recordings of deleted
// stories go when the journal opens; the recordings kept before 2026-11-21 are cleared once.
import { beforeEach, describe, expect, it, vi } from "vitest";

const saved = new Map<string, string>();
vi.mock("./persist", () => ({
  idbStorage: {
    getItem: async (k: string) => saved.get(k) ?? null,
    setItem: async (k: string, v: string) => void saved.set(k, v),
    removeItem: async (k: string) => void saved.delete(k),
  },
  keysWith: async (p: string) => [...saved.keys()].filter((k) => k.startsWith(p)),
  persistOptions: {},
  toDataUrl: async (u: string) => u,
}));

const { sweepVoiceAudio } = await import("./voiceAudio");
const { migrateData } = await import("./store");

beforeEach(() => {
  saved.clear();
  saved.set("voice:e1", "data:audio/webm;base64,AAAA");
  saved.set("voice:e2", "data:audio/webm;base64,BBBB");
  saved.set("journal:main", "{}");
});

describe("kept recordings", () => {
  it("a deleted story's recording goes when the journal opens; the others and the journal stay", async () => {
    expect(await sweepVoiceAudio((id) => id === "e1")).toBe(1);
    expect([...saved.keys()].sort()).toEqual(["journal:main", "voice:e1"]);
  });
  it("the upgrade to version 3 clears every recording once; later versions don't", async () => {
    await migrateData({ entries: [] }, 3);
    expect(saved.has("voice:e1")).toBe(true);
    await migrateData({ entries: [] }, 2);
    expect([...saved.keys()]).toEqual(["journal:main"]);
  });
});
