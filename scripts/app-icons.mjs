// Render the app icons (public/icons/*.png) from scripts/app-icon.svg with the preinstalled Chromium.
// Run once after changing the icon: node scripts/app-icons.mjs
import fs from "node:fs";
import { chromium } from "playwright";

const svg = fs.readFileSync("scripts/app-icon.svg", "utf8");
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
for (const [file, size, pad] of [["icon-192.png", 192, 0], ["icon-512.png", 512, 0], ["maskable-512.png", 512, 0], ["apple-touch-icon.png", 180, 0]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;padding:${pad}px">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: `public/icons/${file}`, omitBackground: false });
}
await browser.close();
console.log("icons written to public/icons");
