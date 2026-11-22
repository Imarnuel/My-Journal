// ui-polish's code check (.agents/skills/ui-polish): lists every value off the app's scales, with file and line.
// Usage: node scripts/ui-lint.mjs [--all]   (--all also reads the prototype copies in screens/views, body, logic)
// Exit code 1 when anything is listed, so it can run in CI once the app is clean.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const ALL = process.argv.includes("--all");

const SCALE = {
  fontSize: [12, 14, 16, 24],
  lineHeight: [16, 20, 24, 32],
  fontWeight: [400, 500, 600],
  space: [0, 1, 2, 4, 8, 12, 16, 24, 32, 48], // 1px only for hairline offsets (borders), checked by eye
  minHeight: [24, 28, 32, 34, 36],
};
/** The line height that goes with each size (TOKENS.md › Type). */
const PAIR = { 12: 16, 14: 20, 16: 24, 24: 32 };

/**
 * Deliberate one-offs: "file:snippet" → why. Keep this short; every entry needs a reason a reviewer accepts.
 */
const ALLOW = {
  "StorySprite.tsx": "drawn sample chart artwork: its own colours, not UI",
  "playbook/sprite.data.ts": "drawn sample chart artwork for the playbook: its own colours, not UI",
  "charts/": "hand-drawn SVG chart geometry",
};

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!ALL && /^(views|body|logic)$/.test(name)) continue; // prototype copies (frame previews)
      files(p, out);
    } else if (/\.(tsx|ts|css)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const found = [];
const add = (file, line, what) => found.push({ file: relative(ROOT, file), line, what });
const px = (v) => Number(String(v).replace("px", ""));

for (const file of files(join(ROOT, "src"))) {
  const rel = relative(ROOT, file);
  if (Object.keys(ALLOW).some((k) => rel.includes(k))) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    const n = i + 1;
    if (/ui-lint-ignore/.test(text)) return;
    // Font sizes and line heights, in JS styles and CSS.
    for (const m of text.matchAll(/(?:fontSize"?\s*:\s*"|font-size\s*:\s*)(\d+)px/g))
      if (!SCALE.fontSize.includes(+m[1])) add(file, n, `font size ${m[1]}px (scale: 12, 14, 16, 24)`);
    for (const m of text.matchAll(/(?:lineHeight"?\s*:\s*"|line-height\s*:\s*)(\d+)px/g))
      if (!SCALE.lineHeight.includes(+m[1])) add(file, n, `line height ${m[1]}px (scale: 16, 20, 24, 32)`);
    // A size and line height in the same style object must pair.
    const fs = /fontSize"?\s*:\s*"(\d+)px"/.exec(text);
    const lh = /lineHeight"?\s*:\s*"(\d+)px"/.exec(text);
    if (fs && lh && PAIR[+fs[1]] && PAIR[+fs[1]] !== +lh[1] && (text.match(/fontSize/g) ?? []).length === 1)
      add(file, n, `${fs[1]}px text with a ${lh[1]}px line height (goes with ${PAIR[+fs[1]]}px)`);
    for (const m of text.matchAll(/(?:fontWeight"?\s*:\s*|font-weight\s*:\s*)(\d{3})/g))
      if (!SCALE.fontWeight.includes(+m[1])) add(file, n, `font weight ${m[1]} (400, 500, 600)`);
    // Spacing: gap, padding and margin values.
    for (const m of text.matchAll(/(?:\b(?:gap|rowGap|columnGap|padding\w*|margin\w*)"?\s*:\s*"([^"]+)"|\b(?:gap|row-gap|column-gap|padding[\w-]*|margin[\w-]*)\s*:\s*([^;}"]+))/g)) {
      const v = m[1] ?? m[2];
      for (const t of v.split(/\s+/)) {
        const p = /^-?(\d+(?:\.\d+)?)px$/.exec(t);
        if (p && !SCALE.space.includes(+p[1])) add(file, n, `spacing ${t} (steps: 2, 4, 8, 12, 16, 24, 32, 48)`);
      }
    }
    // Control heights.
    for (const m of text.matchAll(/(?:minHeight"?\s*:\s*"|min-height\s*:\s*)(\d+)px/g))
      if (!SCALE.minHeight.includes(+m[1]) && +m[1] <= 64) add(file, n, `control height ${m[1]}px (24, 28, 32, 34, 36)`);
    // Raw colours outside the token file.
    if (!rel.endsWith("tokens.css") && !rel.endsWith("canvas.css"))
      for (const m of text.matchAll(/(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\))/g))
        if (!/var\(--/.test(m[0])) add(file, n, `raw colour ${m[0]} (use a token)`);
  });
}

const byFile = {};
for (const f of found) (byFile[f.file] ??= []).push(f);
for (const [file, list] of Object.entries(byFile)) {
  console.log(`\n${file}`);
  for (const f of list) console.log(`  ${f.line}: ${f.what}`);
}
console.log(`\n${found.length} off-scale value${found.length === 1 ? "" : "s"} in ${Object.keys(byFile).length} file${Object.keys(byFile).length === 1 ? "" : "s"}.`);
process.exit(found.length ? 1 : 0);
