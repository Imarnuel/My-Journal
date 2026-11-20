// Checks for the owner's rules that can be found by reading the source (DESIGN.md, Principles):
// no em dashes in the app's text, radii only from the --r-* tokens, and one typeface set once in --font-sans.
// A failure names the file and line; fix the code, don't loosen the check.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** Every line in the app's source that matches, as "path:line: text". */
function find(re: RegExp, only: RegExp = /./): string[] {
  const hits: string[] = [];
  for (const f of files(ROOT).filter((x) => only.test(x))) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (re.test(line)) hits.push(`${f.slice(ROOT.length + 1)}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
  }
  return hits;
}

describe("the owner's rules, checked in the source (DESIGN.md, Principles)", () => {
  it("no em dash anywhere in the app (copy rule: use commas, full stops or colons)", () => {
    expect(find(/—/)).toEqual([]);
  });

  it("control, card and dialog radii come from the --r-* tokens, never a hard-coded value", () => {
    // Circles, pills (999px, 50%) and the tiny 2 to 4px marks stay as they are; these are the token values.
    const inline = /borderRadius"?\s*:\s*"(5|7|8|9|12|13|14|16|18|20)px"/;
    const css = /border-radius\s*:\s*(5|7|8|9|12|13|14|16|18|20)px/;
    expect([...find(inline, /\.tsx?$/), ...find(css, /\.css$/)]).toEqual([]);
  });

  it("one typeface, named once in --font-sans (DESIGN.md, Typeface: Geist)", () => {
    const named = /(fontFamily"?\s*:\s*"(?!var\(--font-sans\)"|inherit")[^"]+"|font-family\s*:(?!\s*(var\(--font-sans\)|inherit))[^;}]+)/;
    expect(find(named)).toEqual([]);
  });
});
