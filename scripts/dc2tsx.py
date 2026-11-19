"""Convert a prototype frame (handoff/prototype/*.dc.html) into a React view that renders the
same markup from a values object `v` (the frame's renderVals()).

Usage: python3 scripts/dc2tsx.py Main  ->  src/screens/views/Main.view.tsx

The output is a starting point for a screen, so it keeps pixel parity with the prototype.
Screens replace the shell and shared parts (sidebar, menus, toasts) with primitives.
"""
import json
import re
import sys

VOID = {"input", "img", "br", "hr", "meta", "link", "source", "stop", "use", "rect", "line", "path", "circle", "polyline"}
ATTR_MAP = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly",
    "autocomplete": "autoComplete", "inputmode": "inputMode", "onclick": "onClick", "onchange": "onChange",
    "oninput": "onInput", "onkeydown": "onKeyDown", "onfocus": "onFocus", "onblur": "onBlur",
    "ondragstart": "onDragStart", "ondragover": "onDragOver", "ondrop": "onDrop", "pathlength": "pathLength",
    "viewbox": "viewBox", "xlink:href": "href", "maxlength": "maxLength", "colspan": "colSpan", "rowspan": "rowSpan",
}
HOLE = re.compile(r"\{\{\s*([^}]+?)\s*\}\}")


def camel(name):
    if name.startswith(("aria-", "data-")):
        return name
    if name in ATTR_MAP:
        return ATTR_MAP[name]
    if name.lower() in ATTR_MAP:
        return ATTR_MAP[name.lower()]
    return re.sub(r"[-:]([a-z])", lambda m: m.group(1).upper(), name)


def expr(path, scope):
    path = path.strip()
    if path in ("true", "false", "null"):
        return path
    if re.fullmatch(r"-?\d+(\.\d+)?", path):
        return path
    if re.fullmatch(r"'.*'|\".*\"", path):
        return json.dumps(path[1:-1])
    head = path.split(".")[0]
    if head in scope:
        return path.replace(".", "?.") if "." in path else path
    return "v." + path.replace(".", "?.")


def interp(text, scope):
    """A string with holes -> JS expression (template literal)."""
    parts = []
    last = 0
    for m in HOLE.finditer(text):
        parts.append(text[last:m.start()].replace("`", "\\`").replace("${", "\\${"))
        parts.append("${s(" + expr(m.group(1), scope) + ")}")
        last = m.end()
    parts.append(text[last:].replace("`", "\\`").replace("${", "\\${"))
    return "`" + "".join(parts) + "`"


def style_obj(css, scope):
    items = []
    for decl in re.split(r";(?![^(]*\))", css):
        if ":" not in decl:
            continue
        k, val = decl.split(":", 1)
        k = k.strip()
        val = val.strip()
        if not k:
            continue
        key = k if k.startswith("--") else re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        if key.startswith("-webkit") or key.startswith("Webkit"):
            key = "Webkit" + key.split("webkit", 1)[-1][0].upper() + key.split("webkit", 1)[-1][1:] if "webkit" in key.lower() else key
        jsval = interp(val, scope) if HOLE.search(val) else json.dumps(val)
        items = [i for i in items if not i.startswith(json.dumps(key) + ":")]
        items.append(f"{json.dumps(key)}: {jsval}")
    return "{{" + ", ".join(items) + "}}"


TOKEN = re.compile(r"<!--.*?-->|</([A-Za-z][\w:-]*)\s*>|<([A-Za-z][\w:-]*)((?:\s+[^\s=>/]+(?:=\"[^\"]*\")?)*)\s*(/?)>|([^<]+)", re.S)
ATTR = re.compile(r"([^\s=>/]+)(?:=\"([^\"]*)\")?")


def parse(tpl):
    root = {"tag": None, "attrs": [], "kids": []}
    stack = [root]
    for m in TOKEN.finditer(tpl):
        close, tag, attrs, selfclose, text = m.groups()
        if m.group(0).startswith("<!--"):
            continue
        if close:
            if not any(n["tag"] == close for n in stack[1:]):
                continue  # closing tag of a void element, or stray
            while len(stack) > 1:
                n = stack.pop()
                if n["tag"] == close:
                    break
            continue
        if tag:
            node = {"tag": tag, "attrs": ATTR.findall(attrs or ""), "kids": []}
            stack[-1]["kids"].append(node)
            if not selfclose and tag.lower() not in VOID:
                stack.append(node)
            continue
        if text is not None:
            stack[-1]["kids"].append(text)
    return root


def gen(node, scope, ind):
    pad = "  " * ind
    if isinstance(node, str):
        t = node
        if not t.strip():
            return " " if t and "\n" not in t and len(t) < 3 else ""
        out = []
        last = 0
        for m in HOLE.finditer(t):
            if m.start() > last:
                out.append(jsx_text(t[last:m.start()]))
            out.append("{s(" + expr(m.group(1), scope) + ")}")
            last = m.end()
        if last < len(t):
            out.append(jsx_text(t[last:]))
        return "".join(out)
    tag = node["tag"]
    attrs = dict((k, v) for k, v in node["attrs"])
    if tag == "sc-if":
        cond = HOLE.search(attrs.get("value", ""))
        c = expr(cond.group(1), scope) if cond else "false"
        inner = "".join(gen(k, scope, ind + 1) for k in node["kids"])
        return f"{{({c}) ? (<>{inner}</>) : null}}"
    if tag == "sc-for":
        lst = HOLE.search(attrs.get("list", ""))
        L = expr(lst.group(1), scope) if lst else "[]"
        var = attrs.get("as", "item")
        sc = scope | {var, "$index"}
        inner = "".join(gen(k, sc, ind + 1) for k in node["kids"])
        return f"{{(({L}) || []).map(({var}: any, $index: number) => (<Fragment key={{$index}}>{inner}</Fragment>))}}"
    parts = [tag]
    for k, raw in node["attrs"]:
        if k.startswith("hint-") or k == "data-v":
            continue
        name = camel(k)
        if tag in ("input", "textarea") and name == "value":
            name = "value"
        if raw is None or raw == "":
            if raw is None:
                parts.append(f"{name}" if name not in ("checked", "multiple", "draggable") else f"{name}={{true}}")
                continue
        if k == "style":
            parts.append(f"style={style_obj(raw, scope)}")
            continue
        whole = re.fullmatch(r"\s*\{\{\s*([^}]+?)\s*\}\}\s*", raw)
        if whole:
            e = expr(whole.group(1), scope)
            if name.startswith("on"):
                if name == "onChange" and tag in ("input", "textarea", "select"):
                    parts.append(f"onChange={{{e}}}")
                else:
                    parts.append(f"{name}={{{e}}}")
            elif name.startswith("aria-") or name.startswith("data-"):
                parts.append(f"{name}={{ar({e})}}")
            else:
                parts.append(f"{name}={{at({e})}}")
        elif HOLE.search(raw):
            parts.append(f"{name}={{{interp(raw, scope)}}}")
        else:
            parts.append(f"{name}={json.dumps(raw)}")
    if tag in ("input", "textarea") and any(k == "value" for k, _ in node["attrs"]):
        if not any(k.lower() in ("onchange", "oninput") for k, _ in node["attrs"]):
            parts.append("readOnly")
    open_ = "<" + " ".join(parts)
    if not node["kids"] or tag.lower() in VOID:
        return open_ + " />"
    inner = "".join(gen(k, scope, ind + 1) for k in node["kids"])
    return f"{open_}>{inner}</{tag}>"


def jsx_text(t):
    t = re.sub(r"\s+", " ", t)
    return t.replace("{", "{'{'}").replace("}", "{'}'}").replace("<", "&lt;").replace(">", "&gt;")


def main(frame):
    src = open(f"handoff/prototype/{frame}.dc.html").read()
    a = src.find("</helmet>") + len("</helmet>")
    tpl = src[a:src.find("</x-dc>")]
    tree = parse(tpl)
    body = "".join(gen(k, frozenset(), 2) for k in tree["kids"])
    out = f'''// Generated by scripts/dc2tsx.py from handoff/prototype/{frame}.dc.html. Do not edit by hand:
// screens wrap this view and pass the values the prototype's renderVals() produced.
/* eslint-disable */
// @ts-nocheck
import {{ Fragment }} from "react";

const s = (x: unknown) => (x == null || x === false ? "" : String(x));
const at = (x: unknown) => (x == null || x === false ? undefined : x === true ? "" : x);
const ar = (x: unknown) => (x == null ? undefined : String(x));

export default function {frame}View({{ v }}: {{ v: any }}) {{
  return (<>{body}</>);
}}
'''
    open(f"src/screens/views/{frame}.view.tsx", "w").write(out)


if __name__ == "__main__":
    for f in sys.argv[1:]:
        main(f)
        print("wrote", f)
