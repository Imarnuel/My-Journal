# THEME: the look-and-feel direction (claude/trading-journal-look-and-feel.md) applied to every frame.
# Tokens per theme, layered surfaces, glossy buttons, floating menus, frosted sidebar and sticky bars,
# card highlights, medallions, motion. Colours in markup and scripts become tokens, so light mode works.
import re as _tre, json as _tjson

TOKENS = {
 "dark": {
  "bg-app": "#0B0C0E", "bg-app-glow": "linear-gradient(#0B0C0E, #0B0C0E)",
  "surface-1": "#121418", "surface-2": "#181B20", "surface-3": "#1E2127", "surface-inset": "#0E1013",
  "surface-hover": "rgba(255,255,255,0.05)", "surface-pressed": "rgba(255,255,255,0.08)",
  "border-subtle": "rgba(255,255,255,0.06)", "border": "rgba(255,255,255,0.09)", "border-strong": "rgba(255,255,255,0.14)",
  "highlight": "rgba(255,255,255,0.06)", "highlight-strong": "rgba(255,255,255,0.12)",
  "text-1": "#ECEEF1", "text-2": "#B0B6C0", "text-3": "#828995", "text-disabled": "#5F6672",
  "profit": "#5BA2FF", "loss": "#FF9A4D", "attention": "#E8C766", "voice": "#B9A6FF", "voice-border": "rgba(185,166,255,0.38)", "focus": "#ECEEF1",
  "inverse-bg": "#ECEEF1", "inverse-fg": "#0E1014", "inverse-border": "rgba(14,16,20,0.28)",
  "shadow-panel": "0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
  "shadow-card": "inset 0 1px 0 rgba(255,255,255,0.05)",
  "shadow-float": "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 8px -2px rgba(0,0,0,0.45), 0 16px 40px -8px rgba(0,0,0,0.65)",
  "shadow-dialog": "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px -12px rgba(0,0,0,0.7)",
  "card-edge": "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.03))",
  "card-edge-hover": "linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04))",
  "scrim": "rgba(8,9,11,0.45)", "sidebar-bg": "transparent", "sticky-bg": "rgba(18,20,24,0.80)",
  "btn-p-bg": "linear-gradient(180deg, #FFFFFF, #E4E7EB)", "btn-p-bg-hover": "linear-gradient(180deg, #FFFFFF, #EDEFF2)", "btn-p-fg": "#0E1014",
  "btn-p-shadow": "0 0 0 1px rgba(255,255,255,0.7), inset 0 -1px 0 rgba(15,17,21,0.12), 0 1px 2px rgba(0,0,0,0.5), 0 4px 10px -4px rgba(0,0,0,0.5)",
  "btn-g-bg": "linear-gradient(180deg, #2A2D33, #23262B)", "btn-g-bg-hover": "linear-gradient(180deg, #30333A, #272A30)",
  "btn-g-shadow": "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.4)",
  "btn-v-bg": "linear-gradient(180deg, #C9B9FF, #A893F5)", "btn-v-fg": "#0E1014",
  "medal-bg": "linear-gradient(180deg, #262A31, #1B1E23)", "medal-shadow": "0 8px 24px -8px rgba(0,0,0,0.6)", "medal-glyph": "#8C939F", "medal-glyph-2": "#3A3F48",
  "skeleton": "rgba(255,255,255,0.05)",
 },
 "light": {
  "bg-app": "#F2F2F4", "bg-app-glow": "linear-gradient(#F2F2F4, #F2F2F4)",
  "surface-1": "#FFFFFF", "surface-2": "#FFFFFF", "surface-3": "#FFFFFF", "surface-inset": "#F6F6F8",
  "surface-hover": "rgba(15,17,21,0.04)", "surface-pressed": "rgba(15,17,21,0.07)",
  "border-subtle": "rgba(15,17,21,0.06)", "border": "rgba(15,17,21,0.10)", "border-strong": "rgba(15,17,21,0.16)",
  "highlight": "rgba(255,255,255,0.9)", "highlight-strong": "#FFFFFF",
  "text-1": "#141519", "text-2": "#4A4E56", "text-3": "#6B6F77", "text-disabled": "#A2A6AE",
  "profit": "#1D63D6", "loss": "#C2410C", "attention": "#8F5A06", "voice": "#6D4FD8", "voice-border": "rgba(109,79,216,0.35)", "focus": "#141519",
  "inverse-bg": "#18191D", "inverse-fg": "#FFFFFF", "inverse-border": "rgba(255,255,255,0.30)",
  "shadow-panel": "0 0 0 1px rgba(15,17,21,0.05), 0 1px 2px rgba(15,17,21,0.04), 0 8px 24px -12px rgba(15,17,21,0.08)",
  "shadow-card": "0 0 0 1px rgba(15,17,21,0.08), 0 1px 2px rgba(15,17,21,0.04)",
  "shadow-float": "0 0 0 1px rgba(15,17,21,0.06), 0 4px 10px -4px rgba(15,17,21,0.08), 0 18px 44px -12px rgba(15,17,21,0.20)",
  "shadow-dialog": "0 0 0 1px rgba(15,17,21,0.06), 0 24px 64px -16px rgba(15,17,21,0.28)",
  "card-edge": "linear-gradient(transparent, transparent)", "card-edge-hover": "linear-gradient(transparent, transparent)",
  "scrim": "rgba(242,242,244,0.55)", "sidebar-bg": "transparent", "sticky-bg": "rgba(255,255,255,0.82)",
  "btn-p-bg": "linear-gradient(180deg, #2B2D33, #18191D)", "btn-p-bg-hover": "linear-gradient(180deg, #33363C, #1E1F24)", "btn-p-fg": "#FFFFFF",
  "btn-p-shadow": "0 0 0 1px #0B0C0E, inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(15,17,21,0.25), 0 4px 10px -4px rgba(15,17,21,0.35)",
  "btn-g-bg": "linear-gradient(180deg, #FFFFFF, #FAFAFB)", "btn-g-bg-hover": "linear-gradient(180deg, #FFFFFF, #F3F3F5)",
  "btn-g-shadow": "0 0 0 1px rgba(15,17,21,0.10), 0 1px 2px rgba(15,17,21,0.06)",
  "btn-v-bg": "linear-gradient(180deg, #7D62E6, #6247CF)", "btn-v-fg": "#FFFFFF",
  "medal-bg": "linear-gradient(180deg, #ECECEF, #DEDEE2)", "medal-shadow": "0 10px 24px -10px rgba(15,17,21,0.25)", "medal-glyph": "#FFFFFF", "medal-glyph-2": "#A2A6AE",
  "skeleton": "rgba(15,17,21,0.06)",
 },
}
def _tok(theme):
    return ";".join(f"--{k}:{v}" for k, v in TOKENS[theme].items())

CSS = f"""
*,*::before,*::after{{font-family:Inter,system-ui,sans-serif;font-optical-sizing:auto}}
button,input,textarea,select{{font-family:Inter,system-ui,sans-serif}}
body{{margin:0;background:#F2F2F4}}
[data-theme="dark"]{{{_tok("dark")};color-scheme:dark}}
[data-theme="light"]{{{_tok("light")};color-scheme:light}}
.app{{--r-xs:6px;--r-sm:8px;--r-md:10px;--r-card:14px;--r-menu:14px;--r-panel:16px;--r-dialog:20px;--d-instant:80ms;--d-fast:140ms;--d-base:220ms;--d-slow:320ms;--ease-out:cubic-bezier(0.16,1,0.3,1);--ease-in:cubic-bezier(0.4,0,1,1);--ease-standard:cubic-bezier(0.2,0,0,1)}}
.app{{background:var(--bg-app-glow),var(--bg-app);color:var(--text-1)}}
.app a{{color:var(--text-1);text-underline-offset:3px;text-decoration-color:var(--border-strong);transition:color var(--d-instant),text-decoration-color var(--d-instant)}}
.app a:hover{{text-decoration-color:var(--text-1)}}
.app ::selection{{background:var(--surface-pressed)}}
.app :focus{{outline:none}}
.app :focus-visible{{outline:2px solid var(--focus);outline-offset:2px;border-radius:6px}}
.sidebar{{background:transparent}}
.panel{{background:var(--surface-1);border-radius:var(--r-panel);box-shadow:var(--shadow-panel)}}
.ksticky{{position:sticky;top:0;z-index:7;margin:-12px -16px;padding:12px 16px;border-radius:12px;background:var(--surface-1)}}
.btn{{font:inherit;font-size:14px;font-weight:500;border-radius:var(--r-md);padding:0 14px;min-height:40px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none!important;box-sizing:border-box;white-space:nowrap;border:0!important;transition:background var(--d-instant),box-shadow var(--d-instant),color var(--d-instant),transform var(--d-instant)}}
.btn:active{{transform:translateY(0.5px)}}
.btn-p{{background:var(--btn-p-bg)!important;color:var(--btn-p-fg)!important;box-shadow:var(--btn-p-shadow);font-weight:600}}
.btn-p:hover{{background:var(--btn-p-bg-hover)!important}}
.btn-p:active{{box-shadow:0 0 0 1px var(--border-strong)}}
.btn-g{{background:var(--btn-g-bg)!important;color:var(--text-1)!important;box-shadow:var(--btn-g-shadow)}}
.btn-g:hover{{background:var(--btn-g-bg-hover)!important}}
.btn-g:active{{box-shadow:0 0 0 1px var(--border)}}
.btn-q{{background:transparent!important;color:var(--text-2)!important}}
.btn-q:hover{{background:var(--surface-hover)!important;color:var(--text-1)!important}}
.kvoice{{background:var(--btn-v-bg)!important;color:var(--btn-v-fg)!important;box-shadow:var(--btn-p-shadow)!important}}
.num{{font-family:Inter,sans-serif;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}}
.nav a{{display:flex;align-items:center;gap:12px;padding:0 12px;min-height:38px;border-radius:var(--r-sm);color:var(--text-2);text-decoration:none;font-size:14px;font-weight:500;transition:background var(--d-instant),color var(--d-instant)}}
.nav a:hover{{color:var(--text-1);background:var(--surface-hover)}}
.nav a.on{{color:var(--text-1);background:var(--surface-pressed);box-shadow:inset 0 1px 0 var(--highlight)}}
.meta{{font-size:13px;color:var(--text-2)}}
.lbl{{font-size:13px;color:var(--text-3)}}
.chart{{border-radius:8px;overflow:hidden;border:1px solid var(--border-subtle);background:var(--surface-inset)}}
.ghost{{font:inherit;font-size:14px;color:var(--text-1);background:transparent;border:1px solid transparent;border-radius:var(--r-sm);padding:0 10px;margin:0 -10px;min-height:34px;width:100%;box-sizing:border-box;text-align:left;transition:background var(--d-instant),border-color var(--d-instant)}}
.ghost:hover{{background:var(--surface-hover)}}
.ghost:focus{{outline:none;border-color:var(--border-strong);background:var(--surface-inset)}}
.ghost::placeholder{{color:var(--text-3)}}
.tagfield{{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:5px 10px;cursor:pointer}}
.pill{{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--text-1);background:var(--surface-inset);box-shadow:inset 0 0 0 1px var(--border);border-radius:var(--r-xs);padding:3px 8px;line-height:1.4;white-space:nowrap}}
.pill-x{{display:inline-flex;color:var(--text-3)}}
.card{{background:linear-gradient(var(--card-fill,var(--surface-2)),var(--card-fill,var(--surface-2))) padding-box,var(--card-edge) border-box!important;border:1px solid transparent!important;box-shadow:var(--shadow-card);border-radius:var(--r-card);transition:transform var(--d-fast) var(--ease-out)}}
a.card:hover,button.card:hover{{background:linear-gradient(var(--card-fill,var(--surface-2)),var(--card-fill,var(--surface-2))) padding-box,var(--card-edge-hover) border-box!important;transform:translateY(-1px)}}
.kit-opt{{transition:background var(--d-instant)}}
.kit-opt:hover{{background:var(--surface-hover)!important}}
.kit-row .kit-only{{opacity:0;transition:opacity var(--d-instant)}}.kit-row:hover .kit-only,.kit-row:focus-within .kit-only{{opacity:1}}
.kmenu{{background:var(--surface-3)!important;border:0!important;border-radius:var(--r-menu)!important;box-shadow:var(--shadow-float)!important;animation:kpop var(--d-fast) var(--ease-out);transform-origin:top center}}
.kseg-track{{background:var(--surface-inset)!important;border:1px solid var(--border-subtle)!important;border-radius:10px!important;padding:3px!important;gap:2px}}
.kseg-track button[aria-pressed]{{transition:background var(--d-fast) var(--ease-standard),color var(--d-fast),box-shadow var(--d-fast)}}
.kseg-track button[aria-pressed="true"]{{background:var(--surface-3)!important;color:var(--text-1)!important;font-weight:600!important;box-shadow:inset 0 1px 0 var(--highlight),0 0 0 1px var(--border-subtle),0 1px 2px rgba(0,0,0,0.25)!important}}
.kseg-track button[aria-pressed="false"]{{background:transparent!important;color:var(--text-2)!important;font-weight:500!important}}
.kseg-track button[aria-pressed="false"]:hover{{color:var(--text-1)!important}}
.kchip{{background:transparent!important;color:var(--text-1)!important;border-color:var(--border)!important;font-weight:500!important;transition:background var(--d-fast),color var(--d-fast)}}
.kchip[aria-pressed="true"]{{background:var(--inverse-bg)!important;color:var(--inverse-fg)!important;border-color:var(--inverse-bg)!important;font-weight:600!important}}
.kstatus{{animation:krise var(--d-base) var(--ease-out)}}
.kscrim{{position:fixed;inset:0;z-index:30;border:0;padding:0;background:var(--scrim);-webkit-backdrop-filter:blur(10px) saturate(120%);backdrop-filter:blur(10px) saturate(120%);animation:kfade var(--d-base) var(--ease-out);cursor:default}}
.kdialog{{background:var(--surface-1);border-radius:var(--r-dialog);box-shadow:var(--shadow-dialog);animation:kdlg var(--d-base) var(--ease-out) 40ms both}}
.medal{{flex:none;width:80px;height:80px;border-radius:999px;background:var(--medal-bg);box-shadow:0 0 0 4px var(--surface-1),var(--medal-shadow);display:flex;align-items:center;justify-content:center;position:relative}}
.kbreathe{{animation:kbreathe 1.6s ease-in-out infinite}}
.kdraw{{stroke-dasharray:1;stroke-dashoffset:1;animation:kdraw 600ms var(--ease-out) forwards}}
.krow{{transition:background var(--d-instant)}}
.krow:hover{{background:var(--surface-hover)}}
@keyframes kpop{{from{{opacity:0;transform:translateY(-4px) scale(0.97)}}to{{opacity:1;transform:none}}}}
@keyframes krise{{from{{opacity:0;transform:translate(-50%,12px)}}to{{opacity:1;transform:translate(-50%,0)}}}}
@keyframes kfade{{from{{opacity:0}}to{{opacity:1}}}}
@keyframes kdlg{{from{{opacity:0;transform:translateY(8px) scale(0.98)}}to{{opacity:1;transform:none}}}}
@keyframes kbreathe{{0%,100%{{transform:scale(1)}}50%{{transform:scale(1.25);opacity:0.75}}}}
@keyframes kdraw{{to{{stroke-dashoffset:0}}}}
@keyframes kin{{from{{opacity:0;transform:translateY(4px)}}to{{opacity:1;transform:none}}}}
@media (prefers-reduced-motion: reduce){{.kmenu,.kstatus,.kscrim,.kdialog{{animation:kfade 120ms linear}}.kbreathe{{animation:none}}.kdraw{{animation:none;stroke-dashoffset:0}}.card,.btn{{transition:none}}}}
@media (prefers-reduced-transparency: reduce){{.ksticky,.kscrim{{-webkit-backdrop-filter:none;backdrop-filter:none}}.ksticky{{background:var(--surface-1)}}}}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){{.ksticky{{background:var(--surface-1)}}}}
"""

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'
CSS = CSS.replace("Geist", "Inter")

# ---------------- colours in markup -> tokens ----------------
_BG = {"#0E1014": "var(--surface-inset)", "#15181E": "var(--surface-2)", "#1B1F27": "var(--surface-pressed)", "#252A33": "var(--surface-pressed)",
       "#353B46": "var(--border-strong)", "#ECEEF1": "var(--inverse-bg)", "#5BA2FF": "var(--profit)", "#FF9A4D": "var(--loss)", "#B9A6FF": "var(--voice)",
       "#E8C766": "var(--attention)", "#8C939F": "var(--text-3)", "#6B7280": "var(--text-disabled)", "#232833": "var(--surface-inset)"}
_BD = {"#1B1F27": "var(--border-subtle)", "#252A33": "var(--border-subtle)", "#2E343E": "var(--border)", "#353B46": "var(--border)", "#4A515E": "var(--border-strong)",
       "#A3AAB5": "var(--inverse-border)", "#4A3F75": "var(--voice-border)", "#ECEEF1": "var(--text-1)", "#5BA2FF": "var(--profit)", "#FF9A4D": "var(--loss)"}
_FG = {"#ECEEF1": "var(--text-1)", "#FFFFFF": "var(--text-1)", "#A3AAB5": "var(--text-2)", "#C9CED6": "var(--text-2)", "#8C939F": "var(--text-3)", "#4A515E": "var(--text-disabled)",
       "#5F6672": "var(--text-disabled)", "#0E1014": "var(--inverse-fg)", "#5BA2FF": "var(--profit)", "#FF9A4D": "var(--loss)", "#B9A6FF": "var(--voice)", "#E8C766": "var(--attention)"}
_SVGC = {"#ECEEF1": "var(--text-1)", "#8C939F": "var(--text-3)", "#353B46": "var(--border-strong)", "#1B1F27": "var(--border-subtle)", "#FF9A4D": "var(--loss)", "#5BA2FF": "var(--profit)", "#4A515E": "var(--border-strong)"}

def _map_style(st):
    out = []
    for d in st.split(";"):
        if ":" not in d:
            out.append(d); continue
        p, v = d.split(":", 1)
        pn = p.strip().lower()
        tbl = _BG if pn in ("background", "background-color") else _BD if (pn.startswith("border") or pn == "outline") else _FG if pn in ("color", "accent-color", "caret-color") else None
        if tbl:
            v = _tre.sub(r"#[0-9A-Fa-f]{6}\b", lambda m: tbl.get(m.group(0).upper(), m.group(0)), v)
        out.append(p + ":" + v)
    return ";".join(out)

def _svg_attrs_to_style(svg):
    def fix(m):
        tag = m.group(0)
        adds = []
        for a in ("fill", "stroke"):
            mm = _tre.search(r'\s%s="([^"]+)"' % a, tag)
            if mm:
                val = mm.group(1)
                if val.startswith("{{"):
                    adds.append(f"{a}: {val}")
                elif val.upper() in _SVGC:
                    adds.append(f"{a}: {_SVGC[val.upper()]}")
                else:
                    continue
                tag = tag.replace(mm.group(0), "", 1)
        if adds:
            if ' style="' in tag:
                tag = tag.replace(' style="', ' style="' + "; ".join(adds) + "; ", 1)
            else:
                tag = tag.replace(">", f' style="{"; ".join(adds)}">', 1) if not tag.endswith("/>") else tag[:-2] + f' style="{"; ".join(adds)}"/>'
        return tag
    return _tre.sub(r"<(?!svg\b)(?:line|polyline|polygon|circle|rect|path|text)\b[^>]*>", fix, svg)

_NEW_MENU = "position: absolute; z-index: 6; top: calc(100% + 6px); padding: 6px; display: flex; flex-direction: column; gap: 2px; box-sizing: border-box"
_CARD_RE = _tre.compile(r'<(section|div|aside|a|li|figure)\b([^>]*?)\sstyle="([^"]*)"')

def _cardify(html):
    def fix(m):
        tag, pre, st = m.group(1), m.group(2), m.group(3)
        if "dashed" in st or "border-top" in st and "border:" not in st:
            return m.group(0)
        mr = _tre.search(r"border-radius:\s*(12|14|16)px", st)
        mb = _tre.search(r"border:\s*1px solid var\(--border-subtle\)", st)
        if not (mr and mb):
            return m.group(0)
        bgm = _tre.search(r"background:\s*([^;]+)", st)
        fill = ""
        if bgm and "surface" in bgm.group(1):
            fill = "--card-fill: var(--surface-2); "
        st2 = _tre.sub(r"\s*border:\s*1px solid var\(--border-subtle\);?", "", st)
        st2 = _tre.sub(r"\s*background:\s*var\(--surface-[^;]+;?", "", st2)
        st2 = fill + st2.strip()
        if ' class="' in pre:
            pre = pre.replace(' class="', ' class="card ', 1)
            return f'<{tag}{pre} style="{st2}"'
        return f'<{tag}{pre} class="card" style="{st2}"'
    return _CARD_RE.sub(fix, html)

def themeify(html):
    html = html.replace('Geist', 'Inter')
    html = html.replace('style="' + MENU_BOX, 'class="kmenu" style="' + _NEW_MENU)
    html = html.replace('style="position: absolute; z-index: 6; top: calc(100% + 6px); left: 0; width: 240px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55);',
                        'class="kmenu" style="position: absolute; z-index: 6; top: calc(100% + 6px); left: 0; width: 240px; padding: 6px;')
    parts = _tre.split(r"(<symbol\b.*?</symbol>|<svg\b(?:(?!</svg>).)*?</svg>)", html, flags=_tre.S)
    out = []
    for p in parts:
        if p.startswith("<symbol"):
            out.append(p); continue
        if p.startswith("<svg"):
            if "{{" in p:
                out.append(_svg_attrs_to_style(p))
            else:
                out.append(p)
            continue
        out.append(_tre.sub(r'style="([^"]*)"', lambda m: 'style="' + _map_style(m.group(1)) + '"', p))
    html = "".join(out)
    html = _cardify(html)
    # segmented tracks
    html = _tre.sub(r'<div role="group" aria-label="(View|Period|Plan|Appearance)" style="', r'<div role="group" aria-label="\1" class="kseg-track" style="', html)
    html = html.replace('<div role="status" style="position: fixed;', '<div role="status" class="kstatus" style="position: fixed;')
    return html

_JS = [(r"bg: ([^,}]*?)'#ECEEF1'", r"bg: \1'var(--surface-3)'"), (r"fg: ([^,}]*?)'#0E1014'", r"fg: \1'var(--text-1)'"),
       (r"bd: active \? '#5F6672'", "bd: active ? 'var(--border-strong)'")]
_JSMAP = {"#ECEEF1": "var(--text-1)", "#0E1014": "var(--inverse-fg)", "#1B1F27": "var(--surface-pressed)", "#A3AAB5": "var(--text-2)", "#5BA2FF": "var(--profit)",
          "#FF9A4D": "var(--loss)", "#353B46": "var(--border)", "#5F6672": "var(--text-disabled)", "#4A515E": "var(--border-strong)", "#8C939F": "var(--text-3)"}
def themeify_js(js):
    for a, b in _JS:
        js = _tre.sub(a, b, js)
    return _tre.sub(r"#[0-9A-Fa-f]{6}\b", lambda m: _JSMAP.get(m.group(0).upper(), m.group(0)), js)

THEME_WRAP = """
renderVals() {
  const v = this.baseVals();
  const st = this.state || {};
  const ap = st.appearance || 'Default';
  v.theme = ap === 'Dark' ? 'dark' : ap === 'Light' ? 'light' : (this.props.darkPreview === true ? 'dark' : 'light');
  v.appearance = ['Default', 'Dark', 'Light'].map((o) => ({ label: o === 'Default' ? 'System' : o, pressed: o === ap ? 'true' : 'false', pick: () => this.setState({ appearance: o }) }));
  return v;
}
"""

def nav(active):
    items = [("Dashboard.dc.html", "dash", "Dashboard"), ("Main.dc.html", "log", "Trade log"), ("PlaybookHome.dc.html", "book", "Playbook"),
             ("Review.dc.html", "review", "Weekly review"), ("Accounts.dc.html", "acct", "Accounts"), ("Settings.dc.html", "gear", "Settings")]
    links = "".join(f'<a href="{h}" class="{"on" if l == active else ""}"{" aria-current=\"page\"" if l == active else ""}>{IC[i]}<span>{l}</span></a>' for h, i, l in items)
    logo = ('<span aria-hidden="true" style="width: 26px; height: 26px; border-radius: 8px; background: var(--btn-p-bg); box-shadow: var(--btn-p-shadow); display: flex; align-items: center; justify-content: center; color: var(--btn-p-fg)">'
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 5v14M17 4v16"></path><rect x="5" y="8" width="4" height="7" rx="1" fill="currentColor"></rect><rect x="15" y="7" width="4" height="9" rx="1"></rect></svg></span>')
    return f'''<aside class="sidebar" style="flex: 1 1 232px; max-width: 100%; box-sizing: border-box; padding: 16px 10px; display: flex; flex-direction: column; gap: 20px">
<div style="display: flex; align-items: center; gap: 10px; padding: 0 12px">{logo}<span style="font-weight: 600; font-size: 15px; letter-spacing: -0.01em">Journal</span></div>
<nav class="nav" aria-label="Main" style="display: flex; flex-direction: column; gap: 2px">{links}</nav>
</aside>'''

def _page_geist(title, h, body, active, script="renderVals() { return {}; }"):
    props = _tjson.dumps({"darkPreview": {"editor": "boolean", "default": False}, "$preview": {"width": 1440, "height": h}})
    script = themeify_js(script).replace("renderVals()", "baseVals()", 1) + THEME_WRAP
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>{CSS}</style>
</helmet>
<div class="app" data-theme="{{{{ theme }}}}" style="min-height: {h}px; font-family: Inter, system-ui, sans-serif; font-size: 14px; line-height: 1.5; display: flex; flex-wrap: wrap">
{nav(active)}
<main style="flex: 999 1 560px; min-width: 0; box-sizing: border-box; padding: 8px 8px 8px 0; display: flex">
<div class="panel" style="flex: 1; min-width: 0; box-sizing: border-box; padding: 28px 32px 56px">
<div style="max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px">
{themeify(body)}
</div>
</div>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
{script}
}}
</script>
</body>
</html>'''

# ---------------- medallions (empty and finished states) ----------------
def medal(glyph):
    return f'<div class="medal" aria-hidden="true">{glyph}</div>'
G_FILTER = '<svg width="34" height="34" viewBox="0 0 32 32"><path d="M6 8h20l-8 9v6l-4 2v-8z" style="fill: var(--medal-glyph)"></path><circle cx="24" cy="23" r="4" style="fill: var(--medal-glyph-2)"></circle></svg>'
G_TRASH = '<svg width="34" height="34" viewBox="0 0 32 32"><rect x="9" y="11" width="14" height="15" rx="2.5" style="fill: var(--medal-glyph)"></rect><rect x="7" y="7" width="18" height="3" rx="1.5" style="fill: var(--medal-glyph-2)"></rect><rect x="13" y="5" width="6" height="3" rx="1.5" style="fill: var(--medal-glyph-2)"></rect></svg>'
G_CHART = '<svg width="34" height="34" viewBox="0 0 32 32"><rect x="5" y="7" width="22" height="18" rx="3" style="fill: var(--medal-glyph)"></rect><path d="M9 20l4-4 3 2 6-6" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--medal-glyph-2)"></path></svg>'
G_TAG = '<svg width="34" height="34" viewBox="0 0 32 32"><path d="M5 7a2 2 0 0 1 2-2h8l12 12-10 10L5 15z" style="fill: var(--medal-glyph)"></path><circle cx="10.5" cy="10.5" r="2" style="fill: var(--medal-glyph-2)"></circle></svg>'

for _v in ("daily", "daily_cal"):
    _s = globals()[_v]
    _s = _s.replace('<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0"><span style="font-size: 15px; font-weight: 600">No entries match these filters</span>',
                    '<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 56px 0">' + medal(G_FILTER) + '<span style="font-size: 16px; font-weight: 600; margin-top: 8px">No entries match these filters</span><span class="meta">Try a wider date range, or clear one of the filters.</span>')
    # the filter bar stays put while the list slides under it
    _s = _s.replace('<div style="display: flex; flex-direction: column; gap: 12px">\n<div role="group" aria-label="Filter"', '<div class="ksticky" style="display: flex; flex-direction: column; gap: 12px">\n<div role="group" aria-label="Filter"')
    globals()[_v] = _s
assert "ksticky" in daily and "medal" in daily

for _v in ("newstory", "newstory_typed", "storypage"):
    _s = globals()[_v]
    _s = _s.replace('<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0">\n<span style="font-size: 18px; font-weight: 600">Story deleted</span>',
                    '<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0">\n' + medal(G_TRASH) + '<span style="font-size: 18px; font-weight: 600; margin-top: 8px">Story deleted</span>')
    # the voice action is the one coloured button; the recording dot breathes
    _s = _s.replace('<span style="flex: none; width: 48px; height: 48px; border-radius: 24px; background: #B9A6FF; color: #0E1014;',
                    '<span class="kvoice" style="flex: none; width: 48px; height: 48px; border-radius: 24px;')
    _s = _s.replace('<span aria-hidden="true" style="flex: none; width: 12px; height: 12px; border-radius: 6px; background: #FF9A4D"></span>',
                    '<span aria-hidden="true" class="kbreathe" style="flex: none; width: 12px; height: 12px; border-radius: 6px; background: #FF9A4D"></span>')
    globals()[_v] = _s
assert "kvoice" in newstory and "kbreathe" in newstory

edit_acct = edit_acct.replace('<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0"><span style="font-size: 18px; font-weight: 600">Funded 100K deleted</span>',
                              '<div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0">' + medal(G_TRASH) + '<span style="font-size: 18px; font-weight: 600; margin-top: 8px">Funded 100K deleted</span>')
playbook = playbook.replace('<sc-if value="{{ noEx }}" hint-placeholder-val="{{ false }}"><p class="lbl" style="margin: 0; padding: 24px 0">{{ noExTxt }}</p></sc-if>',
                            '<sc-if value="{{ noEx }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0">' + medal(G_CHART) + '<p class="meta" style="margin: 8px 0 0">{{ noExTxt }}</p></div></sc-if>')
assert "medal" in edit_acct and "medal" in playbook

# the drawn-in equity line
pass
assert "kdraw" in dashboard

# Settings: Appearance
_APP = ('<section style="display: flex; flex-direction: column"><h2 style="margin: 0; font-size: 16px; font-weight: 600">Appearance</h2><div style="margin-top: 12px">'
        '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 24px; padding: 16px 0; border-top: 1px solid #1B1F27"><div style="flex: 1 1 320px; min-width: 0"><div style="font-size: 14px; font-weight: 600">Theme</div><div class="lbl">System follows your computer. Light is the default.</div></div>'
        '<div role="group" aria-label="Appearance" style="display: flex"><sc-for list="{{ appearance }}" as="o" hint-placeholder-count="3"><button type="button" aria-pressed="{{ o.pressed }}" onClick="{{ o.pick }}" style="font: inherit; font-size: 14px; border: 0; border-radius: 7px; padding: 0 14px; min-height: 34px; cursor: pointer">{{ o.label }}</button></sc-for></div></div></div></section>')
_i = settings.index('<section style="display: flex; flex-direction: column"><h2 style="margin: 0; font-size: 16px; font-weight: 600">Weekly review</h2>')
settings = settings[:_i] + _APP + settings[_i:]

# Playbook: name a new setup in a short dialog over the blurred page, then go on to its rules
playbook_home = playbook_home.replace('<a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a>', '<button type="button" class="btn btn-g" onClick="{{ openName }}">Name this setup</button>')
playbook_home = playbook_home + ('<sc-if value="{{ nameOpen }}" hint-placeholder-val="{{ false }}"><button type="button" class="kscrim" aria-label="Close" tabindex="-1" onClick="{{ closeName }}"></button>'
    '<div style="position: fixed; inset: 0; z-index: 31; display: flex; align-items: flex-start; justify-content: center; padding-top: 14vh; pointer-events: none">'
    '<div role="dialog" aria-modal="true" aria-labelledby="ndh" class="kdialog" style="pointer-events: auto; width: 480px; max-width: calc(100% - 32px); box-sizing: border-box; padding: 24px; display: flex; flex-direction: column; gap: 16px">'
    '<h2 id="ndh" style="margin: 0; font-size: 18px; font-weight: 600">Name this setup</h2>'
    '<p class="meta" style="margin: -8px 0 0">4 unsorted stories look alike: daily bullish, Asian low swept, then a 15m break of structure. They move into it.</p>'
    '<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #A3AAB5">Setup name<input id="setupname" type="text" value="{{ nameDraft }}" onChange="{{ setNameDraft }}" placeholder="e.g. Asian sweep reversal" style="font: inherit; font-size: 15px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 10px; padding: 0 12px; min-height: 42px"></label>'
    '<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px"><button type="button" class="btn btn-g" onClick="{{ closeName }}">Cancel</button><a href="SetupEdit.dc.html" class="btn btn-p">Create and add rules</a></div>'
    '</div></div></sc-if>')
PBH_SCRIPT = PBH_SCRIPT.replace("suggest: !st.notNow,", "suggest: !st.notNow, nameOpen: !!st.nameOpen, openName: () => this.setState({ nameOpen: true, kmenu: null }), closeName: () => this.setState({ nameOpen: false }), nameDraft: st.nameDraft || 'Asian sweep reversal', setNameDraft: (e) => this.setState({ nameDraft: e.target.value }),", 1)
assert "nameOpen" in PBH_SCRIPT

PLAIN_TAG = '<div style="display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #E8C766; border: 1px solid rgba(232,199,102,0.45); border-radius: 999px; padding: 4px 12px">Design reference · not a screen in the product</div>'
def _page_plain_geist(title, h, body):
    props = _tjson.dumps({"darkPreview": {"editor": "boolean", "default": False}, "$preview": {"width": 1440, "height": h}})
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>{CSS}</style>
</helmet>
<div class="app" data-theme="{{{{ theme }}}}" style="min-height: {h}px; font-family: Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.5; box-sizing: border-box; padding: 8px">
<div class="panel" style="box-sizing: border-box; padding: 48px 56px 72px; min-height: {h - 16}px">
<div style="max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px">
{themeify(PLAIN_TAG + body)}
</div>
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
baseVals() {{ return {{}}; }}
{THEME_WRAP}
}}
</script>
</body>
</html>
'''

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'

def page(title, h, body, active, script="renderVals() { return {}; }"):
    return _page_geist(title, h, body, active, script).replace("Geist", "Inter")
def page_plain(title, h, body):
    return _page_plain_geist(title, h, body).replace("Geist", "Inter")

# ---------------- DENSITY: one size system for every control (from the Monny reference and refs 1 to 7) ----------------
# Controls 32px (sm 28, lg 36); menu rows 34; nav rows 32; radii 8 controls / 12 cards and panel; body 14;
# page title 24; stat numbers 24; panel padding 28/32. Applied to every frame through the same rules.
CSS = CSS.replace("--r-xs:6px;--r-sm:8px;--r-md:10px;--r-card:14px;--r-menu:14px;--r-panel:16px;--r-dialog:20px;",
                  "--r-xs:6px;--r-sm:6px;--r-md:8px;--r-card:12px;--r-menu:12px;--r-panel:14px;--r-dialog:16px;--h-sm:28px;--h-md:32px;--h-lg:36px;--h-row:34px;")
CSS += """
.btn{min-height:var(--h-md)!important;padding:0 12px!important;font-size:14px!important;gap:6px!important;border-radius:var(--r-md)!important}
.btn svg{width:16px;height:16px}
.nav a{min-height:32px;font-size:14px;gap:10px;padding:0 10px}
.nav a svg{width:17px;height:17px}
.kit-opt{min-height:var(--h-row)!important;font-size:14px!important;border-radius:var(--r-sm)!important}
.kmenu{padding:4px!important;border-radius:var(--r-menu)!important}
.kseg-track{padding:2px!important;border-radius:var(--r-md)!important}
.kseg-track button[aria-pressed]{min-height:28px!important;border-radius:6px!important;font-size:13px!important;padding:0 12px!important}
.card{border-radius:var(--r-card)!important}
.panel{border-radius:var(--r-panel)!important}
.pill{font-size:12px;padding:2px 8px}
.kstat{gap:0!important}
.kstat > div{border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:2px 20px!important;position:relative}
.kstat > div:first-child{padding-left:4px!important}
.kstat > div + div::before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:1px;background:var(--border-subtle)}
"""
_CTRL_TAGS = _tre.compile(r'<(button|a|input|select)\b[^>]*>')
def _densify_tag(m):
    t = m.group(0)
    if 'style="' not in t:
        return t
    def fix_style(sm):
        st = sm.group(1)
        st = _tre.sub(r"min-height:\s*(3[3-9]|4[0-6])px", "min-height: 32px", st)
        st = _tre.sub(r"(?<![-\w])height:\s*40px", "height: 32px", st)
        st = _tre.sub(r"(?<![-\w])width:\s*40px", "width: 32px", st)
        st = _tre.sub(r"border-radius:\s*10px", "border-radius: 8px", st)
        st = _tre.sub(r"font-size:\s*15px", "font-size: 14px", st)
        return 'style="' + st + '"'
    return _tre.sub(r'style="([^"]*)"', fix_style, t, count=1)

def _densify(html):
    html = _CTRL_TAGS.sub(_densify_tag, html)
    # type scale: page titles and hero numbers to 24, stat numbers to 24, list titles to 15
    html = html.replace("font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em", "font-size: 24px; font-weight: 600; line-height: 1.25; letter-spacing: -0.02em")
    html = _tre.sub(r"font-size:\s*30px", "font-size: 24px", html)
    html = _tre.sub(r"font-size:\s*2[678]px", "font-size: 24px", html)
    html = _tre.sub(r"font-size:\s*17px", "font-size: 15px", html)
    # card and panel radii
    html = _tre.sub(r"border-radius:\s*1[46]px", "border-radius: 12px", html)
    return html

_themeify_base = themeify
def themeify(html):
    return _densify(_themeify_base(html))

# stat groups are one card with dividers, not a row of separate tiles (dashboard top row, the review's week numbers)
dashboard = dashboard.replace('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px">',
                              '<div class="kstat" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); padding: 16px; border: 1px solid #1B1F27; border-radius: 14px">', 1)
review = review.replace('<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">',
                        '<div class="kstat" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 16px; border: 1px solid #1B1F27; border-radius: 14px">', 1)
assert 'class="kstat"' in dashboard and 'class="kstat"' in review

# ---------------- TEXT HIERARCHY AND ICONS: one rule per kind, applied to every frame ----------------
# Text: text-1 = what you read or act on; text-2 = supporting copy and labels that name a value; text-3 = hints and scaffolding.
# Icons: on controls, action-menu rows, notices, status and icon-only buttons. Never on headings, labels or body text.
_ICN = {
    "more": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg>',
    "cal": I('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"></rect><path d="M3 9.5h18"></path><path d="M8 2.5v4"></path><path d="M16 2.5v4"></path>', 16, 1.8),
    "stats": I('<path d="M3 3v18h18"></path><path d="M7 15l4-4 3 3 5-6"></path>', 16, 1.8),
    "trash": I('<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M6 6l1 14h10l1-14"></path>', 16, 1.8),
    "archive": I('<rect x="3" y="4" width="18" height="5" rx="1.5"></rect><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"></path><path d="M10 13h4"></path>', 16, 1.8),
    "pen": I('<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>', 16, 1.8),
    "left": I('<path d="M19 12H5"></path><path d="M11 6l-6 6 6 6"></path>', 16, 1.8),
    "right": I('<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>', 16, 1.8),
    "x": I('<path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>', 16, 1.8),
    "mark": I('<path d="M6 3h12v18l-6-4-6 4z"></path>', 16, 1.8),
    "link": I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"></path><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"></path>', 14, 1.9),
    "img": I('<rect x="3" y="3" width="18" height="18" rx="2.5"></rect><circle cx="9" cy="9" r="1.8"></circle><path d="M21 15l-5-5L5 21"></path>', 14, 1.9),
    "alert": I('<circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path>', 14, 2),
    "clock": I('<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>', 16, 1.8),
    "img16": I('<rect x="3" y="3" width="18" height="18" rx="2.5"></rect><circle cx="9" cy="9" r="1.8"></circle><path d="M21 15l-5-5L5 21"></path>', 16, 1.8),
}
_MI = {"Change date": "cal", "{{ r.exclLabel }}": "stats", "{{ exclLabel }}": "stats", "Delete": "trash", "Delete setup": "trash", "Delete story": "trash",
       "Archive setup": "archive", "Edit rules": "pen", "Rename": "pen", "Move left": "left", "Move right": "right", "Remove": "x", "{{ pinLabel }}": "mark"}
CSS += """
.lbl-k{color:var(--text-2)!important;font-weight:500!important}
.kstat > div > :first-child{color:var(--text-2)!important;font-weight:500!important}
.btn-g svg,.btn-q svg{color:var(--text-2);transition:color var(--d-instant)}
.btn-g:hover svg,.btn-q:hover svg{color:var(--text-1)}
.kit-opt .mi{display:flex;align-items:center;gap:10px;min-width:0}
.kit-opt .mi svg{flex:none;color:var(--text-2)}
.kit-opt[style*="--loss"] .mi svg{color:inherit}
.kmore{color:var(--text-2)!important;display:inline-flex!important;align-items:center;justify-content:center}
.kmore:hover{color:var(--text-1)!important}
.knote{position:relative;padding-left:44px!important}
.knote-ic{position:absolute;left:0;top:0;width:32px;height:32px;border-radius:8px;background:var(--surface-inset);box-shadow:0 0 0 1px var(--border-subtle);display:flex;align-items:center;justify-content:center;color:var(--text-2)}
.kstatus-ic{flex:none;display:inline-flex;color:var(--text-3)}
.kseg-track [role=tab]{min-height:28px!important;border-radius:6px!important;font-size:13px!important;padding:0 12px!important;transition:background var(--d-fast) var(--ease-standard),color var(--d-fast)}
.kseg-track [role=tab][aria-selected="true"]{background:var(--surface-3)!important;color:var(--text-1)!important;font-weight:600!important;box-shadow:inset 0 1px 0 var(--highlight),0 0 0 1px var(--border-subtle),0 1px 2px rgba(0,0,0,0.12)!important}
.kseg-track [role=tab][aria-selected="true"] span{color:var(--text-2)!important}
.kseg-track [role=tab][aria-selected="false"]{background:transparent!important;color:var(--text-2)!important}
.kseg-track [role=tab][aria-selected="false"]:hover{color:var(--text-1)!important}
"""

def _hier(html):
    # 1. "···" text glyphs become the more icon, in text-2
    def more(m):
        tag = m.group(1)
        tag = tag.replace('class="', 'class="kmore ', 1) if 'class="' in tag else tag.replace('<button', '<button class="kmore"', 1)
        return tag + '>' + _ICN["more"] + '</button>'
    html = _tre.sub(r'(<button\b[^>]*)>\s*···\s*</button>', more, html)
    # 2. action-menu rows carry a leading icon (choice menus keep only the check on the right)
    def mi(m):
        lab = m.group(2); ic = _MI.get(lab)
        if not ic: return m.group(0)
        return f'{m.group(1)}><span class="mi">{_ICN[ic]}<span>{lab}</span></span></button>'
    html = _tre.sub(r'(<(?:button type="button"|a href="[^"]*") role="menuitem" class="kit-opt"[^>]*)>([^<]+)</(button|a)>', lambda m: mi(m).replace('</button>', '</' + m.group(3) + '>') if _MI.get(m.group(2)) else m.group(0), html)
    # 3. notices that ask for something start with a 32px icon tile
    html = html.replace('<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 360px"><span style="font-size: 14px; font-weight: 600">',
                        '<div class="knote" style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 360px"><span class="knote-ic">' + _ICN["clock"] + '</span><span style="font-size: 14px; font-weight: 600">')
    html = html.replace('<div style="flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 4px"><h2 style="margin: 0; font-size: 16px; font-weight: 600">{{ x.title }}',
                        '<div class="knote" style="flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 4px"><span class="knote-ic">' + _ICN["img16"] + '</span><h2 style="margin: 0; font-size: 14px; font-weight: 500; line-height: 20px">{{ x.title }}')
    # 4. connection status is an icon, not a coloured dot (blue means profit)
    D = '<span aria-hidden="true" style="flex: none; width: 7px; height: 7px; border-radius: 3px; background: var(--%s)"></span>'
    html = html.replace(D % "profit", '<span class="kstatus-ic">' + _ICN["link"] + '</span>')
    html = html.replace(D % "text-disabled", '<span class="kstatus-ic">' + _ICN["img"] + '</span>')
    html = html.replace(D % "attention" + "MT5 · reconnect", '<span class="kstatus-ic" style="color: var(--attention)">' + _ICN["alert"] + '</span>MT5 · reconnect')
    # 5. labels that name a value read text-2; hints stay text-3
    html = _tre.sub(r'class="lbl"((?:\s+style="[^"]*")?\s*)>(Setup|Tags|Plan|Headspace)<', r'class="lbl lbl-k"\1>\2<', html)
    # 6. a stat is always label above value (the playbook header used value above label)
    html = _tre.sub(r'<div style="display: flex; flex-direction: column; gap: 2px"><span class="num" style="font-size: 2[24]px; font-weight: 600">([^<]+)</span><span class="lbl">([^<]+)</span></div>',
                    r'<div style="display: flex; flex-direction: column; gap: 4px"><span class="lbl lbl-k">\2</span><span class="num" style="font-size: 24px; font-weight: 600; line-height: 1.2">\1</span></div>', html)
    # 7. top-level tabs use the same segmented control as every other switch
    html = html.replace('<div style="display: inline-flex; gap: 2px; padding: 3px; background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 11px">',
                        '<div class="kseg-track" style="display: inline-flex; gap: 2px; padding: 3px; background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 11px">')
    return html

# bordered labels (drop targets styled as controls) follow the control height too
_CTRL_TAGS = _tre.compile(r'<(button|a|input|select|label)\b[^>]*>')
_densify_tag_base = _densify_tag
def _densify_tag(m):
    if m.group(1) == "label" and "border" not in m.group(0):
        return m.group(0)
    return _densify_tag_base(m)

_themeify_dens = themeify
def themeify(html):
    return _hier(_themeify_dens(html))

# ---------------- TYPE SCALE: five sizes, three weights, applied to every frame ----------------
# 24/600 display (page titles, stat values, hero result) · 16/500 headings (card, section, dialog titles)
# 15/500 list row titles · 14/400 body, 14/500 names and emphasis · 13 details and labels · 12 captions, chips, axis labels.
# 600 only at 24px, on the primary button and on a selected segment or tab. No 11px, no 18px.
CSS += """
.app{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-feature-settings:"calt" 1}
"""
def _type_style(sm):
    st = sm.group(1)
    if "font-size" not in st and "font-weight" not in st:
        return sm.group(0)
    st = _tre.sub(r"font-size:\s*11px", "font-size: 12px", st)
    st = _tre.sub(r"font-size:\s*18px", "font-size: 16px", st)
    m = _tre.search(r"font-size:\s*(\d+)px", st)
    size = int(m.group(1)) if m else 0
    if size < 20:
        st = _tre.sub(r"font-weight:\s*[67]00", "font-weight: 500", st)
    if size == 15 and "font-weight: 500" not in st:
        st = _tre.sub(r"font-size:\s*15px", "font-size: 14px", st)
    if size == 24 and "letter-spacing" not in st:
        st += "; letter-spacing: -0.02em"
    if size == 16 and "letter-spacing" not in st:
        st += "; letter-spacing: -0.01em"
    return 'style="' + st + '"'

_hier_base = _hier
def _hier(html):
    html = _hier_base(html)
    html = _tre.sub(r'style="([^"]*)"', _type_style, html)
    html = html.replace('font-size="11"', 'font-size="12"')
    return html

# ---------------- CHARTS: hover readouts and focus (dashboard R over time and R by day) ----------------
CSS += """
.keq{position:relative}
.kpt{position:absolute;top:0;bottom:0}
.kpt-on{position:absolute;inset:0;opacity:0;transition:opacity 80ms linear;pointer-events:none}
.kpt:hover .kpt-on{opacity:1}
.kpt-line{position:absolute;top:13.7%;bottom:8.9%;width:1px;background:var(--border-strong);transform:translateX(-0.5px)}
.kpt-dot{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--surface-2);box-shadow:0 0 0 2px var(--text-1);transform:translate(-50%,-50%)}
.ktip{position:absolute;top:0;z-index:3;display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:8px;background:var(--surface-3);box-shadow:var(--shadow-float);white-space:nowrap;pointer-events:none}
.ktip[data-a="mid"]{transform:translateX(-50%)}
.ktip[data-a="end"]{transform:translateX(-100%)}
.ktip-k{font-size:12px;color:var(--text-3)}
.ktip-v{display:flex;gap:8px;font-size:13px;font-weight:500;color:var(--text-1)}
.ktip-v > span:last-child:not(.num){color:var(--text-3);font-weight:400}
.ktip-bar{opacity:0;left:50%;top:0;transform:translateX(-50%);transition:opacity 80ms linear}
.kbar:first-child .ktip-bar{left:0;transform:none}
.kbar:last-child .ktip-bar{left:auto;right:0;transform:none}
.kbar:hover .ktip-bar{opacity:1}
.kbar-fill{transition:opacity 140ms var(--ease-standard)}
.kbars:hover .kbar:not(:hover) .kbar-fill{opacity:0.3}
.keq:hover .kdraw{transition:opacity 140ms}
@media (hover:none){.kpt,.ktip-bar{display:none}}
"""

# ---------------- ICONS, SECOND PASS: glyphs become icons, plus a few places where an icon helps you recognise something ----------------
_ICN.update({
    "grip": '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"></circle><circle cx="15" cy="6" r="1.5"></circle><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><circle cx="9" cy="18" r="1.5"></circle><circle cx="15" cy="18" r="1.5"></circle></svg>',
    "plus": I('<path d="M12 5v14"></path><path d="M5 12h14"></path>', 16, 1.8),
    "arrow": I('<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>', 14, 1.9),
    "target": I('<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>', 14, 1.8),
    "spark": I('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"></path><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"></path>', 16, 1.6),
    "mic": I('<rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><path d="M12 17v4"></path>', 14, 1.9),
    "x16": I('<path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>', 16, 1.8),
})
_IR = '<span style="display: inline-flex; align-items: center; gap: 6px">'
_hier_icons_base = _hier
def _hier(html):
    html = _hier_icons_base(html)
    # text glyphs standing in for icons
    html = _tre.sub(r'(<button type="button" aria-label="[^"]*"[^>]*>)×</button>', lambda m: m.group(1).replace('<button ', '<button class="kmore" ', 1) + _ICN["x16"] + '</button>', html)
    html = html.replace('<span aria-hidden="true" style="color: var(--text-3); cursor: grab; font-size: 14px">⋮⋮</span>',
                        '<span aria-hidden="true" style="color: var(--text-3); cursor: grab; display: inline-flex">' + _ICN["grip"] + '</span>')
    html = html.replace('>+ Add a rule</button>', '>' + _IR + _ICN["plus"] + 'Add a rule</span></button>')
    html = html.replace('>+ Your own type</button>', '>' + _IR + _ICN["plus"] + 'Your own type</span></button>')
    # links that take you to another page end with an arrow
    for lab in ["Open playbook", "Open in trade log"]:
        html = _tre.sub(r'(<a href="[^"]+" class="(?:lbl|meta)" style="color: var\(--text-2\))">' + lab + '</a>',
                        r'\1; display: inline-flex; align-items: center; gap: 4px">' + lab + _ICN["arrow"] + '</a>', html)
    html = html.replace('<a href="Main.dc.html" class="meta" style="color: var(--text-1)">Trade log</a>',
                        '<a href="Main.dc.html" class="meta" style="color: var(--text-2); display: inline-flex; align-items: center; gap: 4px">Trade log' + _ICN["arrow"] + '</a>')
    # the one thing to work on this week is recognisable wherever it appears
    for lab in ["This week's focus", "The week before, you said"]:
        html = html.replace(f'<span class="lbl" style="font-size: 12px">{lab}</span>',
                            f'<span class="lbl" style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap">{_ICN["target"]}{lab}</span>')
    # Edit on a page section
    html = html.replace('<a href="SetupEdit.dc.html" class="btn btn-q" style="min-height: 32px; padding: 0 4px">Edit</a>',
                        '<a href="SetupEdit.dc.html" class="btn btn-q" style="min-height: 32px; padding: 0 8px">' + _ICN["pen"] + 'Edit</a>')
    # suggestions the journal makes, and drafts from voice notes, carry their source as an icon
    html = html.replace('<span aria-hidden="true" style="flex: none; width: 7px; height: 7px; border-radius: 3px; background: var(--voice)"></span>Drafted from your voice notes',
                        '<span aria-hidden="true" style="flex: none; display: inline-flex; color: var(--voice)">' + _ICN["mic"] + '</span>Drafted from your voice notes')
    html = html.replace('<span aria-hidden="true" style="flex: none; width: 8px; height: 8px; border-radius: 4px; background: var(--voice)"></span>4 of them look alike',
                        '<span aria-hidden="true" style="flex: none; display: inline-flex; color: var(--voice)">' + _ICN["spark"] + '</span>4 of them look alike')
    html = html.replace('<div style="display: flex; gap: 12px; align-items: flex-start; flex: 1 1 400px; min-width: 0"><span aria-hidden="true" style="flex: none; width: 8px; height: 8px; border-radius: 4px; background: var(--voice)"></span>',
                        '<div style="display: flex; gap: 12px; align-items: flex-start; flex: 1 1 400px; min-width: 0"><span aria-hidden="true" class="knote-ic" style="position: static; flex: none; color: var(--voice)">' + _ICN["spark"] + '</span>')
    # archived groups
    html = html.replace('<span>{{ arcLabel }}</span>', _IR.replace('gap: 6px', 'gap: 8px') + _ICN["archive"] + '{{ arcLabel }}</span>')
    return html

# ---------------- REVIEW FIXES (UI/UX Pro Max pass): accessibility, bugs, typography ----------------
# Practice account is a switch on both Add and Edit account (it changes a setting at once)
addacct = addacct.replace('<input type="checkbox" aria-label="Practice account" style="width: 20px; height: 20px; accent-color: #ECEEF1">', switch(False, "Practice account"))
if switch(False, "Practice account") in addacct:
    addacct = w_switch(addacct, "Practice account", "prac")

CSS += """
.app{font-variant-numeric:tabular-nums;overflow-wrap:break-word}
.app h1,.app h2,.app h3{text-wrap:balance}
.app :is(h1,h2,h3) span,.app .lbl,.app .meta{letter-spacing:0}
.app p,.app .lbl,.app .meta{text-wrap:pretty}
.app input:not([type=checkbox]):not([type=radio]):not([type=file]),.app select,.app textarea{font-size:14px!important}
.app textarea{line-height:1.6!important}
.btn-q[style*="--loss"],.btn-g[style*="--loss"]{color:var(--loss)!important}
.btn-q[style*="--loss"]:hover,.btn-g[style*="--loss"]:hover{color:var(--loss)!important}
.kskip{position:absolute;left:12px;top:-60px;z-index:60;padding:8px 14px;border-radius:8px;background:var(--inverse-bg)!important;color:var(--inverse-fg)!important;font-size:14px;font-weight:500;text-decoration:none;transition:top var(--d-fast) var(--ease-out)}
.kskip:focus{top:12px}
.panel:focus{outline:none}
.ktab-tog{min-height:28px!important;padding:0 8px!important;font-size:13px!important}
.ktable-wrap{max-height:260px;overflow:auto;margin-top:4px}
.ktable{font-size:13px}
.ktr{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr);gap:12px;padding:7px 0;border-top:1px solid var(--border-subtle);color:var(--text-1)}
.kth{border-top:0;padding:0 0 8px;color:var(--text-3);position:sticky;top:0;background:var(--surface-2);z-index:1}
.ktable .r{text-align:right}
"""
CSS = CSS.replace("@media (hover:none){.kpt,.ktip-bar{display:none}}", "")

def _fix_tag(m):
    tag = m.group(0)
    if 'width: 26px; height: 22px' in tag:   # chart menus under thumbnails
        tag = tag.replace('width: 26px; height: 22px', 'width: 32px; height: 32px; margin: -5px -3px')
    if 'width: 22px; height: 22px' in tag:   # remove buttons inside tag pills
        tag = tag.replace('width: 22px; height: 22px', 'width: 24px; height: 24px; margin: -2px -4px -2px -2px')
    return tag

_hier_review_base = _hier
def _hier(html):
    html = _hier_review_base(html)
    # 1. targets of at least 24px (32px for icon buttons)
    html = _tre.sub(r'<button\b[^>]*>', _fix_tag, html)
    # 2. visible labels are tied to their fields
    def lab(m):
        txt = m.group(2); fid = "fld-" + _tre.sub(r'[^a-z]+', '-', txt.lower()).strip('-')
        ac = {'Login': ' autocomplete="username"', 'Investor password': ' autocomplete="current-password"'}.get(txt, '')
        return f'<label for="{fid}" style="{m.group(1)}">{txt}</label><input id="{fid}"{ac} '
    html = _tre.sub(r'<span style="(font-size: 13px; font-weight: 500; color: var\(--text-2\))">([^<]{2,30})</span><input ', lab, html)
    # 4. skip link to the main card
    html = html.replace('<div class="panel" style=', '<div class="panel" id="main" tabindex="-1" style=', 1)
    html = _tre.sub(r'(<div[^>]*class="app"[^>]*>)', r'\1<a class="kskip" href="#main">Skip to main content</a>', html, count=1)
    # 6. the delete copy matches the behaviour (deleted state with Undo)
    html = html.replace("Removes the account and all 46 of its chart stories. This can't be undone.",
                        "Removes the account and all 46 of its chart stories. You can undo it straight after.")
    # 8. long notes keep a readable measure
    html = _tre.sub(r'(<p class="meta" style="margin: 0; padding-top: 8px; border-top: 1px solid var\(--border-subtle\)">)(This shows what happened.*?)</p>',
                    r'\1<span style="display: block; max-width: 480px">\2</span></p>', html, flags=_tre.S)
    # 10. no tightened tracking below 16px
    def track(m):
        st = m.group(1); fs = _tre.search(r'font-size:\s*(\d+)px', st)
        if fs and int(fs.group(1)) < 16:
            st = _tre.sub(r';?\s*letter-spacing:\s*-[0-9.]+(em|px)', '', st)
        return 'style="' + st + '"'
    html = _tre.sub(r'style="([^"]*letter-spacing:\s*-[^"]*)"', track, html)
    # 12. curly quotes for quoted notes
    html = _tre.sub(r'>"([^"<>{}]{8,240})"<', r'>“\1”<', html)
    # 14. the count beside a page title is quiet
    html = html.replace('Accounts <span style="font-weight: 500; color: var(--text-3)">(5)</span>',
                        'Accounts <span style="font-weight: 400; color: var(--text-3)">(5)</span>')
    return html

# skip link sits before the sidebar (the .app wrapper is added outside this pass)
CSS += """
.app{position:relative}
[aria-pressed="true"],[aria-selected="true"],[aria-current="page"],[style*="background: var(--surface-pressed)"]{--text-3:var(--text-2)}
"""
_hier_skip_base = _hier
def _hier(html):
    html = _hier_skip_base(html)
    if 'class="kskip"' not in html:
        html = html.replace('<nav', '<a class="kskip" href="#main">Skip to main content</a><nav', 1)
    return html

_page_skip_base = page
def page(title, h, body, active, script="renderVals() { return {}; }"):
    out = _page_skip_base(title, h, body, active, script)
    out = out.replace('<div class="panel" style=', '<div class="panel" id="main" tabindex="-1" style=', 1)
    out = _tre.sub(r'(<div class="app" data-theme="\{\{ theme \}\}"[^>]*>)', r'\1\n<a class="kskip" href="#main">Skip to main content</a>', out, count=1)
    return out

# ---------------- TYPE SCALE v2: Tailwind's scale, four sizes ----------------
# text-xs 12/16 · text-sm 14/20 · text-base 16/24 · text-2xl 24/32 (tracking-tight -0.025em).
# Weights: normal 400, medium 500, semibold 600 (semibold only at 24px, the primary button and a selected option).
_TW_LH = {12: "16px", 14: "20px", 16: "24px", 24: "32px"}
for a, b in [(".meta{font-size:13px;color:var(--text-2)}", ".meta{font-size:14px;line-height:20px;color:var(--text-2)}"),
             (".lbl{font-size:13px;color:var(--text-3)}", ".lbl{font-size:14px;line-height:20px;color:var(--text-3)}"),
             ("gap:6px;font-size:13px;font-weight:500;color:var(--text-1);background:var(--surface-inset)", "gap:6px;font-size:12px;line-height:16px;font-weight:500;color:var(--text-1);background:var(--surface-inset)"),
             (".kseg-track button[aria-pressed]{min-height:28px!important;border-radius:6px!important;font-size:13px!important", ".kseg-track button[aria-pressed]{min-height:28px!important;border-radius:6px!important;font-size:14px!important"),
             (".kseg-track [role=tab]{min-height:28px!important;border-radius:6px!important;font-size:13px!important", ".kseg-track [role=tab]{min-height:28px!important;border-radius:6px!important;font-size:14px!important"),
             (".ktip-v{display:flex;gap:8px;font-size:13px;", ".ktip-v{display:flex;gap:8px;font-size:14px;line-height:20px;"),
             (".ktab-tog{min-height:28px!important;padding:0 8px!important;font-size:13px!important}", ".ktab-tog{min-height:28px!important;padding:0 8px!important;font-size:14px!important}"),
             (".ktable{font-size:13px}", ".ktable{font-size:14px;line-height:20px}")]:
    assert a in CSS, a[:50]
    CSS = CSS.replace(a, b)
CSS += """
.app{font-size:14px;line-height:20px}
/* captions, context lines under stats, thumbnail captions: text-xs */
.app span.lbl:not(.lbl-k),.app figcaption.lbl{font-size:12px;line-height:16px}
/* labels that name a value stay text-sm medium */
.app .lbl-k,.app dt.lbl,.app .kstat > div > :first-child{font-size:14px!important;line-height:20px;font-weight:500}
.app .ktip-k{font-size:12px;line-height:16px}
.app textarea{line-height:1.625!important}
"""

def _tw_style(m):
    st = m.group(1)
    _all = list(_tre.finditer(r";?\s*font-size:\s*\d+px", st))
    if len(_all) > 1:   # duplicate declarations: the last one wins in CSS, keep only it
        for d in reversed(_all[:-1]):
            st = st[:d.start()] + st[d.end():]
    fm = _tre.search(r"font-size:\s*(\d+)px", st)
    if not fm:
        return m.group(0)
    size = int(fm.group(1))
    if size in (13, 15):
        third = "var(--text-3)" in st
        new = 12 if (size == 13 and third) else (16 if size == 15 and "font-weight: 600" in st and "Journal" == "" else 14)
        st = st.replace(fm.group(0), f"font-size: {new}px"); size = new
    if size == 24:
        st = _tre.sub(r"letter-spacing:\s*-?[0-9.]+em", "letter-spacing: -0.025em", st)
    if size == 16:
        st = _tre.sub(r";?\s*letter-spacing:\s*-0\.01em", "", st)
    if size in _TW_LH:
        if "line-height" in st:
            st = _tre.sub(r"line-height:\s*[0-9.]+(px)?", f"line-height: {_TW_LH[size]}", st)
        elif size in (12, 16, 24):
            st += f"; line-height: {_TW_LH[size]}"
    return 'style="' + st + '"'

_hier_tw_base = _hier
def _hier(html):
    html = _hier_tw_base(html)
    html = _tre.sub(r'style="([^"]*)"', _tw_style, html)
    # the wordmark is text-base semibold
    html = html.replace('font-weight: 600; font-size: 14px; letter-spacing: -0.01em">Journal', 'font-weight: 600; font-size: 16px; letter-spacing: -0.01em">Journal')
    return html

_page_tw_base = page
def page(title, h, body, active, script="renderVals() { return {}; }"):
    out = _page_tw_base(title, h, body, active, script)
    out = out.replace("font-size: 14px; line-height: 1.5; display: flex; flex-wrap: wrap", "font-size: 14px; line-height: 20px; display: flex; flex-wrap: wrap")
    out = _tre.sub(r'(<span style="font-weight: 600; font-size: )15(px; letter-spacing: -0.01em">Journal)', r'\g<1>16\2', out)
    return out

_page_plain_tw_base = page_plain
def page_plain(title, h, body):
    return _page_plain_tw_base(title, h, body).replace("font-family: Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.5;", "font-family: Inter, system-ui, sans-serif; font-size: 14px; line-height: 20px;")

# ---------------- SPACING: Tailwind's 4px scale, eight steps ----------------
# 2 (0.5) · 4 (1) · 8 (2) · 12 (3) · 16 (4) · 24 (6) · 32 (8) · 48 (12)
_SP_GAP = {3: 4, 5: 4, 6: 8, 10: 8, 14: 12, 18: 16, 20: 24, 22: 24, 28: 32, 36: 32, 40: 32, 44: 48, 52: 48, 56: 48, 64: 48, 72: 48}
_SP_PAD = {3: 4, 5: 4, 6: 8, 10: 12, 14: 16, 18: 16, 20: 24, 22: 24, 28: 32, 36: 32, 40: 32, 44: 48, 52: 48, 56: 48, 64: 48, 72: 48}
_SP_RE = _tre.compile(r'(?<![\w-])(gap|row-gap|column-gap|padding(?:-top|-right|-bottom|-left)?|margin(?:-top|-right|-bottom|-left)?)(\s*:\s*)([^;"}!]+)')
def _sp_val(prop, val):
    table = _SP_GAP if "gap" in prop else _SP_PAD
    def one(m):
        sign, n = m.group(1), int(m.group(2))
        return f"{sign}{table.get(n, n)}px"
    return _tre.sub(r'(-?)\b(\d+)px', one, val)
def _space(text):
    return _SP_RE.sub(lambda m: m.group(1) + m.group(2) + _sp_val(m.group(1), m.group(3)), text)

CSS = _space(CSS)
_hier_sp_base = _hier
def _hier(html):
    html = _hier_sp_base(html)
    return _tre.sub(r'style="([^"]*)"', lambda m: 'style="' + _space(m.group(1)) + '"', html)

_page_sp_base = page
def page(title, h, body, active, script="renderVals() { return {}; }"):
    out = _page_sp_base(title, h, body, active, script)
    # the page shell (main inset, panel padding, sidebar) is outside the body pass
    head, sep, rest = out.partition('<div class="app"')
    shell_end = rest.find('<div style="max-width: 1080px')
    if shell_end > 0:
        shell = _tre.sub(r'style="([^"]*)"', lambda m: 'style="' + _space(m.group(1)) + '"', rest[:shell_end])
        rest = shell + rest[shell_end:]
    out = head + sep + rest
    out = out.replace('<div style="max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px">',
                      '<div style="max-width: 1080px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">')
    return out

CSS += """
.app button.kmore,.app button[role=switch]{padding:0}
"""
_hier_sp2_base = _hier
def _hier(html):
    html = _hier_sp2_base(html)
    # chips and badges: py-0.5 px-2
    return _tre.sub(r"(border-radius: (?:999|6)px; )padding: 1px 8px", r"\1padding: 2px 8px", html)

_page_plain_sp_base = page_plain
def page_plain(title, h, body):
    out = _page_plain_sp_base(title, h, body)
    out = out.replace("padding: 48px 56px 72px", "padding: 48px 48px 48px").replace("max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px", "max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px")
    return out

# ---------------- TRADE LOG FACTS: icon + text items ----------------
CSS += """
.kfacts{display:flex;flex-wrap:wrap;align-items:center;gap:4px 16px;font-size:14px;line-height:20px;color:var(--text-2);min-width:0}
.kfacts-2{color:var(--text-3)}
.kfact{display:inline-flex;align-items:center;gap:8px;min-width:0}
.kfact-ic{display:inline-flex;flex:none;color:var(--text-3)}
.kfact-t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px}
.kfact-s{font-size:12px;line-height:16px;color:var(--text-3);gap:4px}
.kfact-s .kfact-t{max-width:200px}
.ksr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
"""
