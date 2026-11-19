// Minimal runtime that renders the .dc.html frames in a normal browser (the canvas used its own runtime).
// Add ?theme=dark to any frame URL to see it in dark mode. Serve this folder over http (see README).
(function () {
  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function look(path, scope) {
    path = path.trim();
    if (path === "true") return true; if (path === "false") return false; if (path === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$|^".*"$/.test(path)) return path.slice(1, -1);
    let v = scope; for (const k of path.split(".")) { if (v == null) return undefined; v = v[k]; } return v;
  }
  window.__dcErrors = [];
  function attrVal(raw, scope) {
    const m = raw.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
    if (m) { const v = look(m[1], scope); if (v === undefined) window.__dcErrors.push("missing hole " + m[1]); return v; }
    return raw.replace(HOLE, (_, p) => { const v = look(p, scope); if (v === undefined) window.__dcErrors.push("missing hole " + p); return v == null ? "" : String(v); });
  }
  const EVT = { onclick: "click", onchange: "input", oninput: "input", onkeydown: "keydown", onfocus: "focus", onblur: "blur", ondragstart: "dragstart", ondragover: "dragover", ondrop: "drop" };
  function render(node, scope, out) {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) { out.appendChild(document.createTextNode(attrValText(ch.nodeValue, scope))); continue; }
      if (ch.nodeType !== 1) continue;
      const tag = ch.localName;
      if (tag === "sc-if") { if (attrVal(ch.getAttribute("value"), scope)) render(ch, scope, out); continue; }
      if (tag === "sc-for") {
        const list = attrVal(ch.getAttribute("list"), scope) || []; const as = ch.getAttribute("as") || "item";
        list.forEach((it, i) => { const s = Object.assign(Object.create(scope), { [as]: it, $index: i }); render(ch, s, out); });
        continue;
      }
      const el = ch.namespaceURI === "http://www.w3.org/1999/xhtml" ? document.createElement(tag) : document.createElementNS(ch.namespaceURI, ch.tagName);
      for (const a of ch.attributes) {
        const n = a.name.toLowerCase();
        if (EVT[n]) { const f = attrVal(a.value, scope); if (typeof f === "function") el.addEventListener(EVT[n], (e) => { if (EVT[n] === "click") e.preventDefault(); f(e); }); else window.__dcErrors.push("handler not a function " + a.value); continue; }
        const v = attrVal(a.value, scope);
        if (n === "value" && (tag === "textarea" || tag === "input")) { el.value = v == null ? "" : v; el.setAttribute("data-v", el.value); continue; }
        if (v === false || v == null) continue;
        el.setAttribute(a.name, v === true ? "" : v);
      }
      render(ch.localName === "template" ? ch.content : ch, scope, el);
      out.appendChild(el);
    }
  }
  function attrValText(t, scope) { return t.replace(HOLE, (_, p) => { const v = look(p, scope); if (v === undefined) window.__dcErrors.push("missing hole " + p); return v == null ? "" : String(v); }); }
  document.addEventListener("DOMContentLoaded", () => {
    const x = document.querySelector("x-dc"); const helmet = x.querySelector("helmet");
    if (helmet) { for (const c of [...helmet.childNodes]) document.head.appendChild(c); helmet.remove(); }
    const tpl = x.cloneNode(true); x.remove();
    const root = document.createElement("div"); root.id = "dcroot"; document.body.prepend(root);
    const code = document.querySelector('script[type="text/x-dc"]').textContent;
    class DCLogic { constructor() { this.state = {}; this.props = { darkPreview: new URLSearchParams(location.search).get('theme') === 'dark' }; } setState(o) { this.state = Object.assign({}, this.state, typeof o === "function" ? o(this.state) : o); draw(); } forceUpdate() { draw(); } }
    const Component = new Function("DCLogic", code + "\nreturn Component;")(DCLogic);
    const c = new Component(); window.__dc = c;
    function draw() {
      const act = document.activeElement, actId = act && act.id, sel = act && act.selectionStart;
      const vals = c.renderVals(); const frag = document.createDocumentFragment(); render(tpl, vals, frag);
      root.replaceChildren(frag);
      if (actId) { const e = document.getElementById(actId); if (e) { e.focus(); try { e.setSelectionRange(sel, sel); } catch (_) {} } }
    }
    window.__draw = draw; draw();
  });
})();
