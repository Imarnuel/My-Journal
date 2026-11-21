// Voice notes in the real journal (DESIGN.md › Real app): a real recording (Chromium's fake microphone) goes
// to /api/voice-note, faked here; the server function itself is unit tested (src/lib/voicePrompt.test.ts).
import { expect, test, type Page, type Route } from "@playwright/test";

const fill = {
  ok: true,
  length: "0:03",
  transcript: "Took the [[London breakout]] on the retest, felt [[calm]].",
  before: "Long on the London breakout retest.",
  refl: "Waiting for the retest paid.",
  suggested: true,
  setup: null,
  tags: [{ t: "Retest", k: "Good" }],
  followed: true,
  headspace: "Calm",
};

/** Fake the server: ready, and answer each POST with the next reply in the list. */
async function server(page: Page, replies: unknown[], ready = true) {
  const posts: string[] = [];
  await page.route("**/api/voice-note", async (route: Route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: { ready } });
    posts.push(route.request().postData() ?? "");
    const r = replies.shift() ?? fill;
    await new Promise((f) => setTimeout(f, 300)); // Gemini takes a moment
    return route.fulfill({ json: r });
  });
  return posts;
}

async function talk(page: Page) {
  await page.getByRole("button", { name: /Talk it through/ }).click();
  await expect(page.getByText(/Listening/)).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
}

test("hidden until the server is set up", async ({ page }) => {
  await server(page, [], false);
  await page.goto("/new");
  await expect(page.getByText("Drop, paste or choose charts")).toBeVisible();
  await expect(page.getByRole("button", { name: /Talk it through/ })).toHaveCount(0);
});

test("record, read, fill what is empty; only the written notes are kept", async ({ page }) => {
  const posts = await server(page, [fill]);
  await page.goto("/new");
  await page.locator("#nR").fill("My own reflection.");
  await talk(page);
  // While it reads: an honest step, and only the empty fields shimmer (the reflection typed by hand doesn't).
  await expect(page.getByRole("status").filter({ hasText: /Sending your note|Listening to your note/ })).toBeVisible();
  await expect(page.locator('.kfx[data-fx="awaiting"]').filter({ has: page.locator("#nB") })).toHaveCount(1);
  await expect(page.locator('.kfx[data-fx="awaiting"]').filter({ has: page.locator("#nR") })).toHaveCount(0);
  // The answer lands: what it filled glows briefly, the new tag arrives.
  await expect(page.locator('.kfx[data-fx="filled"]').filter({ has: page.locator("#nB") })).toHaveCount(1);
  await expect(page.locator(".pill.knew", { hasText: "Retest" })).toBeVisible();
  await expect(page.locator('.kfx[data-fx="filled"]')).toHaveCount(0); // the glow clears, it never replays
  await expect(page.locator("#nB")).toHaveValue("Long on the London breakout retest.");
  await expect(page.locator("#nR")).toHaveValue("My own reflection."); // set by hand: never overwritten
  await expect(page.getByRole("status").filter({ hasText: "Filled from your note" })).toBeVisible();
  await expect(page.getByRole("button", { name: /What you said/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play your voice note" })).toHaveCount(0); // no recording kept
  const sent = JSON.parse(posts[0]);
  expect(sent.mime).toMatch(/^audio\//);
  expect(sent.audio.length).toBeGreaterThan(100);
  expect(sent.context.headspaces).toContain("Calm");
});

test("the service fails: the recording is kept and Try again reads it", async ({ page }) => {
  const posts = await server(page, [{ ok: false, reason: "failed" }, fill]);
  await page.goto("/new");
  await talk(page);
  await expect(page.getByText("Couldn't read your note just now")).toBeVisible();
  await expect(page.getByText("Your recording is kept. Try again in a moment.")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("#nB")).toHaveValue("Long on the London breakout retest.");
  expect(posts.length).toBe(2);
  expect(posts[1]).toBe(posts[0]); // the same recording, sent again
});

test("no understandable speech: the designed message, Record again", async ({ page }) => {
  await server(page, [{ ok: false, reason: "unclear" }]);
  await page.goto("/new");
  await talk(page);
  await expect(page.getByText("Couldn't make out your note")).toBeVisible();
  await expect(page.getByRole("button", { name: "Record again" })).toBeVisible();
});

test("the microphone is blocked: say so, Record again", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
  });
  await server(page, []);
  await page.goto("/new");
  await page.getByRole("button", { name: /Talk it through/ }).click();
  await expect(page.getByText("The microphone is off")).toBeVisible();
  await expect(page.getByText("Allow the microphone for this site in your browser, then record again.")).toBeVisible();
});

async function saveTalkedStory(page: Page) {
  await page.goto("/new");
  await expect(page.getByText("Drop, paste or choose charts")).toBeVisible();
  await page.locator('#main input[type="file"]').first().setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: Buffer.from("89504e470d0a1a0a", "hex") });
  await talk(page);
  await expect(page.locator("#nB")).toHaveValue("Long on the London breakout retest.");
  await page.getByRole("button", { name: "Save story" }).click();
  await expect(page).toHaveURL(/\/story\//);
  await page.reload();
}

test("a saved story keeps only the written notes; Keep recordings on keeps the recording too", async ({ page }) => {
  await server(page, [fill, fill]);
  await saveTalkedStory(page);
  await expect(page.locator("#nB")).toHaveValue("Long on the London breakout retest.");
  await expect(page.getByRole("button", { name: /What you said/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play your voice note" })).toHaveCount(0);
  await page.goto("/settings");
  const keep = page.getByRole("switch", { name: "Keep recordings" });
  await expect(keep).toHaveAttribute("aria-checked", "false");
  await keep.click();
  await saveTalkedStory(page);
  await expect(page.getByRole("button", { name: "Play your voice note" })).toBeVisible();
});

test("slow: steps give way to reassurance; the time limit keeps the recording to play or try again", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/voice-note", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: { ready: true } });
    // Never answers: only the clock moves on.
  });
  await page.goto("/new");
  await page.getByRole("button", { name: /Talk it through/ }).click();
  await expect(page.getByText(/Listening/)).toBeVisible();
  await page.clock.runFor(1500);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByText("Sending your note…")).toBeVisible();
  await page.clock.runFor(21_000);
  await expect(page.getByText("Still writing.")).toBeVisible();
  await expect(page.getByText("Longer notes take a little longer.")).toBeVisible();
  await page.clock.runFor(25_000);
  await expect(page.getByText("Taking longer than usual")).toBeVisible();
  await page.clock.runFor(45_000);
  await expect(page.getByText("Couldn't read your note just now")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play your recording" })).toBeVisible();
});

test("Cancel while reading: stops at once, fills nothing, lets the note go; Undo reads it again", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/voice-note", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: { ready: true } });
    posts++; // never answers
  });
  await page.goto("/new");
  await page.getByRole("button", { name: /Talk it through/ }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByText(/Sending your note|Listening to your note/)).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: /your note/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Talk it through/ })).toBeVisible();
  await expect(page.getByText("Voice note deleted")).toBeVisible();
  await expect(page.locator("#nB")).toHaveValue("");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText(/Sending your note|Listening to your note/)).toBeVisible();
  await expect.poll(() => posts).toBe(2);
});

test("reduced motion: the same steps, no shimmer sweep; new tags only fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await server(page, [fill]);
  await page.goto("/new");
  await talk(page);
  const line = page.locator(".kshimmer").first();
  await expect(line).toBeVisible();
  expect(await line.evaluate((el) => getComputedStyle(el, "::after").animationName)).toBe("none");
  await expect(page.locator(".pill.knew", { hasText: "Retest" })).toBeVisible();
  expect(await page.locator(".pill.knew").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("kfadein"); // a fade, no movement or delay
});
