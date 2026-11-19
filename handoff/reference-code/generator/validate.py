import re, json, glob, os, subprocess, html
from html.parser import HTMLParser

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr","path","circle","rect","line","polyline","polygon","stop","ellipse"}
canvas = json.load(open("/home/claude/journal/project/canvas.json"))
problems = {}

def add(f, msg):
    problems.setdefault(f, []).append(msg)

class P(HTMLParser):
    def __init__(self, f):
        super().__init__(convert_charrefs=True)
        self.f = f; self.stack = []; self.ids = {}; self.a_depth = 0
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d:
            self.ids[d["id"]] = self.ids.get(d["id"], 0) + 1
        if tag in ("button", "a") and self.a_depth and tag in ("button","a"):
            add(self.f, f"<{tag}> inside <a> (line {self.getpos()[0]})")
        if "onclick" in d and tag not in ("button", "a", "input", "textarea", "select", "label", "summary"):
            add(self.f, f"onClick on <{tag}> (line {self.getpos()[0]})")
        for k, v in attrs:
            if v is None and k not in ("disabled","crossorigin","draggable","hidden","data-dc-script","checked","selected","readonly","required","multiple","open"):
                add(self.f, f"attribute without value: {k} on <{tag}> (line {self.getpos()[0]})")
        if tag == "a":
            self.a_depth += 1
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))
    def handle_startendtag(self, tag, attrs):
        if tag not in VOID:
            add(self.f, f"self-closed non-void <{tag}/> (line {self.getpos()[0]})")
    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if tag == "a":
            self.a_depth = max(0, self.a_depth - 1)
        if not self.stack:
            add(self.f, f"stray </{tag}> (line {self.getpos()[0]})"); return
        if self.stack[-1][0] == tag:
            self.stack.pop(); return
        # find match deeper
        names = [t for t, _ in self.stack]
        if tag in names:
            while self.stack and self.stack[-1][0] != tag:
                t, ln = self.stack.pop()
                add(self.f, f"unclosed <{t}> opened line {ln}, closed by </{tag}> line {self.getpos()[0]}")
            self.stack.pop()
        else:
            add(self.f, f"stray </{tag}> (line {self.getpos()[0]})")

for path in sorted(glob.glob("/home/claude/journal/project/*.dc.html")):
    f = os.path.basename(path)
    s = open(path).read()
    # holes
    for m in re.finditer(r"\{\{(.*?)\}\}", s):
        inner = m.group(1).strip()
        if not re.fullmatch(r"[A-Za-z_$][\w$]*(\.[\w$]+)*|true|false|null|-?\d+(\.\d+)?", inner):
            add(f, f"bad hole {{{{{inner}}}}}")
    body = s.split('<script type="text/x-dc"')[0]
    p = P(f); p.feed(body); p.close()
    for t, ln in p.stack:
        if t not in ("html", "body"):
            add(f, f"never closed <{t}> line {ln}")
    for k, v in p.ids.items():
        if v > 1: add(f, f"duplicate id {k} x{v}")
    m = re.search(r"data-props='(.*?)'>", s, re.S)
    if not m:
        add(f, "no data-props")
    else:
        try:
            dp = json.loads(html.unescape(m.group(1)))
            pv = dp.get("$preview", {})
            b = canvas["boards"].get(f)
            if b and (pv.get("width") != b["w"] or pv.get("height") != b["h"]):
                add(f, f"$preview {pv} != board {b['w']}x{b['h']}")
        except Exception as e:
            add(f, f"data-props JSON error: {e}")
    js = re.search(r'data-dc-script[^>]*>(.*?)</script>', s, re.S)
    if js:
        open("/tmp/chk.js", "w").write("class DCLogic{};\n" + js.group(1))
        r = subprocess.run(["node", "--check", "/tmp/chk.js"], capture_output=True, text=True)
        if r.returncode: add(f, "JS error: " + r.stderr.strip().splitlines()[-1] if r.stderr else "JS error")
    if "./support.js" not in s: add(f, "missing support.js line")
    # holes used in markup but not returned by renderVals
    if js:
        used = set(x.split(".")[0] for x in re.findall(r"\{\{\s*([A-Za-z_$][\w$]*)", body))
        used -= {"true", "false", "null"}
        code = js.group(1)
        missing = [u for u in used if not re.search(r"\b" + re.escape(u) + r"\b", code)]
        if missing: add(f, f"holes not provided by renderVals: {sorted(missing)}")

for f in sorted(problems):
    print("==", f)
    for m in problems[f][:25]:
        print("   ", m)
    if len(problems[f]) > 25: print("    ...", len(problems[f]) - 25, "more")
print("files with problems:", len(problems))
