import random, json, os

OUT = "/home/claude/journal/project"

# ---------- palette ----------
BG = "#0F1115"; S1 = "#171A21"; S2 = "#1E222B"; BD = "#2A2F3A"
TX = "#E8EAED"; MU = "#9AA1AD"; DIM = "#8A919D"
WIN = "#5BA2FF"; LOSS = "#FFA552"; VOICE = "#B9A6FF"

# ---------- charts ----------
def series(seed, segs, start=100.0, vol=0.55):
    r = random.Random(seed); p = start; cs = []
    for count, drift in segs:
        for _ in range(count):
            o = p; c = o + drift + r.gauss(0, vol)
            hi = max(o, c) + abs(r.gauss(0, vol)) * 0.7
            lo = min(o, c) - abs(r.gauss(0, vol)) * 0.7
            cs.append((o, hi, lo, c)); p = c
    return cs

def svg(cs, label, upto=None, w=320, h=180, zone=None, pos=None, hidden_from=None, total=None):
    """zone=(i1,i2,'high'|'low'); pos=dict(i=, side=, risk_pad=, rr=, end=)"""
    n = total or len(cs)
    shown = cs if upto is None else cs[:upto]
    allp = [x for c in cs for x in (c[1], c[2])]
    extra = []
    zp = None
    if zone:
        i1, i2, kind = zone
        seg = cs[i1:i2 + 1]
        if kind == "high":
            top = max(c[1] for c in seg); zp = (top + 0.6, top - 1.6)
        else:
            bot = min(c[2] for c in seg); zp = (bot + 1.6, bot - 0.6)
        extra += list(zp)
    pp = None
    if pos:
        e = cs[pos["i"]][3]
        if pos["side"] == "short":
            sl = (zp[0] if zp else e + 2) + 0.3; risk = sl - e; tp = e - risk * pos["rr"]
        else:
            sl = (zp[1] if zp else e - 2) - 0.3; risk = e - sl; tp = e + risk * pos["rr"]
        pp = (e, sl, tp); extra += [sl, tp]
    pmin = min(allp + extra); pmax = max(allp + extra)
    pad = (pmax - pmin) * 0.08; pmin -= pad; pmax += pad
    y = lambda p: h - (p - pmin) / (pmax - pmin) * h
    cw = w / n
    out = [f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{label}" style="display: block; width: 100%; height: auto">']
    out.append(f'<rect x="0" y="0" width="{w}" height="{h}" fill="#12151B"></rect>')
    for gy in range(1, 4):
        out.append(f'<line x1="0" y1="{h*gy/4:.1f}" x2="{w}" y2="{h*gy/4:.1f}" stroke="#1F242D" stroke-width="1"></line>')
    if zp:
        x1 = zone[0] * cw
        col = "rgba(255,165,82,0.14)" if zone[2] == "high" else "rgba(91,162,255,0.14)"
        st = "rgba(255,165,82,0.55)" if zone[2] == "high" else "rgba(91,162,255,0.55)"
        out.append(f'<rect x="{x1:.1f}" y="{y(zp[0]):.1f}" width="{w-x1:.1f}" height="{y(zp[1])-y(zp[0]):.1f}" fill="{col}" stroke="{st}" stroke-width="1"></rect>')
    if pp and upto is None:
        e, sl, tp = pp
        x1 = pos["i"] * cw; x2 = min(w, (pos.get("end", n - 1) + 1) * cw)
        out.append(f'<rect x="{x1:.1f}" y="{min(y(e),y(sl)):.1f}" width="{x2-x1:.1f}" height="{abs(y(sl)-y(e)):.1f}" fill="rgba(255,165,82,0.22)"></rect>')
        out.append(f'<rect x="{x1:.1f}" y="{min(y(e),y(tp)):.1f}" width="{x2-x1:.1f}" height="{abs(y(tp)-y(e)):.1f}" fill="rgba(91,162,255,0.22)"></rect>')
        out.append(f'<line x1="{x1:.1f}" y1="{y(e):.1f}" x2="{x2:.1f}" y2="{y(e):.1f}" stroke="#E8EAED" stroke-width="1" stroke-dasharray="3 3"></line>')
    elif pp and upto is not None and pos.get("show_plan"):
        e, sl, tp = pp
        x1 = pos["i"] * cw; x2 = w
        out.append(f'<rect x="{x1:.1f}" y="{min(y(e),y(sl)):.1f}" width="{x2-x1:.1f}" height="{abs(y(sl)-y(e)):.1f}" fill="rgba(255,165,82,0.22)"></rect>')
        out.append(f'<rect x="{x1:.1f}" y="{min(y(e),y(tp)):.1f}" width="{x2-x1:.1f}" height="{abs(y(tp)-y(e)):.1f}" fill="rgba(91,162,255,0.22)"></rect>')
        out.append(f'<line x1="{x1:.1f}" y1="{y(e):.1f}" x2="{x2:.1f}" y2="{y(e):.1f}" stroke="#E8EAED" stroke-width="1" stroke-dasharray="3 3"></line>')
    for i, (o, hi, lo, c) in enumerate(shown):
        cx = i * cw + cw / 2; bw = max(1.2, cw * 0.62)
        up = c >= o; col = "#C9CED6" if up else "#5F6672"
        out.append(f'<line x1="{cx:.1f}" y1="{y(hi):.1f}" x2="{cx:.1f}" y2="{y(lo):.1f}" stroke="{col}" stroke-width="1"></line>')
        top = y(max(o, c)); bh = max(1.0, abs(y(o) - y(c)))
        out.append(f'<rect x="{cx-bw/2:.1f}" y="{top:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="{col}"></rect>')
    if hidden_from is not None:
        x1 = hidden_from * cw
        out.append(f'<rect x="{x1:.1f}" y="0" width="{w-x1:.1f}" height="{h}" fill="#171A21"></rect>')
        out.append(f'<line x1="{x1:.1f}" y1="0" x2="{x1:.1f}" y2="{h}" stroke="#2A2F3A" stroke-width="1"></line>')
        out.append(f'<text x="{(x1+w)/2:.1f}" y="{h/2+4:.1f}" fill="#8A919D" font-size="12" font-family="Inter, sans-serif" text-anchor="middle">Hidden</text>')
    out.append("</svg>")
    return "".join(out)

# GBPUSD short story
gu_w = series(11, [(26, -0.45), (8, 0.55), (6, -0.35)])
gu_d = series(12, [(18, -0.5), (12, 0.6), (6, 0.1), (4, -0.6)])
gu_4 = series(13, [(14, -0.55), (14, 0.65), (4, 0.0), (8, -0.7)])
gu_15 = series(14, [(14, 0.45), (6, 0.05), (5, -0.75), (3, 0.35), (16, -0.85)])
GU = {
    "W": svg(gu_w, "Sample weekly chart, downtrend"),
    "D": svg(gu_d, "Sample daily chart, bearish with pullback", zone=(28, 33, "high")),
    "4H": svg(gu_4, "Sample 4H chart pulling back into supply", zone=(24, 31, "high")),
    "E": svg(gu_15, "Sample 15 minute entry chart with position tool", upto=29, zone=(14, 19, "high"), pos=dict(i=28, side="short", rr=2.1, show_plan=True), total=44),
    "A": svg(gu_15, "Sample 15 minute chart after the trade", zone=(14, 19, "high"), pos=dict(i=28, side="short", rr=2.1, end=43)),
}
# XAUUSD long (loss) and EURJPY watched thumbnails
xa_4 = series(21, [(14, 0.6), (10, -0.6), (6, 0.3), (10, -0.5)])
xa_15 = series(22, [(10, -0.5), (6, 0.1), (4, 0.6), (14, -0.6)])
XA = {
    "W": svg(series(23, [(30, 0.4), (10, -0.2)]), "Sample weekly chart"),
    "D": svg(series(24, [(20, 0.5), (12, -0.4), (8, 0.2)]), "Sample daily chart"),
    "4H": svg(xa_4, "Sample 4H chart", zone=(22, 29, "low")),
    "E": svg(xa_15, "Sample entry chart", upto=21, pos=dict(i=20, side="long", rr=2.0, show_plan=True), zone=(10, 16, "low"), total=34),
    "A": svg(xa_15, "Sample after chart, stopped out", pos=dict(i=20, side="long", rr=2.0, end=33), zone=(10, 16, "low")),
}
ej_4 = series(31, [(16, 0.55), (10, -0.5), (6, 0.1), (8, 0.6)])
EJ = {
    "D": svg(series(32, [(24, 0.5), (10, -0.3), (6, 0.4)]), "Sample daily chart"),
    "4H": svg(ej_4, "Sample 4H chart", zone=(26, 31, "low")),
    "E": svg(series(33, [(12, -0.4), (6, 0.05), (6, 0.5), (8, 0.3)]), "Sample entry chart, setup watched not taken"),
}

def gallery(seed, side, win):
    if side == "short":
        segs = [(10, 0.5), (5, 0.0), (4, -0.6)] + ([(11, -0.7)] if win else [(4, -0.3), (7, 0.8)])
    else:
        segs = [(10, -0.5), (5, 0.0), (4, 0.6)] + ([(11, 0.7)] if win else [(4, 0.3), (7, -0.8)])
    cs = series(seed, segs)
    return svg(cs, "Sample playbook example chart", zone=(9, 14, "high" if side == "short" else "low"), pos=dict(i=18, side=side, rr=2.0, end=29))

# blind replay EURUSD long
ru_d = series(41, [(20, 0.45), (10, -0.45), (8, 0.1)])
ru_15 = series(42, [(12, -0.45), (6, 0.05), (4, 0.55), (3, -0.2), (17, 0.7)])
RP = {
    "D": svg(ru_d, "Sample daily chart for replay", zone=(28, 37, "low")),
    "Ehidden": svg(ru_15, "Sample 15 minute chart, outcome hidden", zone=(12, 17, "low"), pos=dict(i=24, side="long", rr=2.4, show_plan=False), hidden_from=25),
    "Eshown": svg(ru_15, "Sample 15 minute chart, outcome revealed", zone=(12, 17, "low"), pos=dict(i=24, side="long", rr=2.4, end=41)),
}

# ---------- shared ----------
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600;700&amp;display=swap" rel="stylesheet">'

CSS = """
body{margin:0;background:#0F1115}
a{color:#C9CED6}a:hover{color:#FFFFFF}
.card{background:#171A21;border:1px solid #2A2F3A;border-radius:14px}
.btn{font:inherit;font-weight:600;font-size:14px;border-radius:10px;padding:0 18px;min-height:44px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;text-decoration:none;box-sizing:border-box}
.btn-p{background:#E8EAED;color:#0F1115;border:1px solid #E8EAED}
.btn-p:hover{background:#FFFFFF;color:#0F1115}
.btn-g{background:transparent;color:#E8EAED;border:1px solid #2A2F3A}
.btn-g:hover{border-color:#5F6672;color:#FFFFFF}
.chip{font:inherit;font-size:13px;font-weight:500;color:#E8EAED;background:#1E222B;border:1px solid #2A2F3A;border-radius:999px;padding:0 12px;min-height:34px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.chip-on{background:#262B36;border-color:#5F6672}
.chip-voice{border-color:rgba(185,166,255,0.55);background:rgba(185,166,255,0.10)}
.chip-check{border-color:rgba(255,165,82,0.7);background:rgba(255,165,82,0.10)}
.chip-empty{color:#9AA1AD;border-style:dashed;background:transparent}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#9AA1AD}
.num{font-family:'Space Grotesk',Inter,sans-serif;font-variant-numeric:tabular-nums}
.nav a{display:flex;align-items:center;gap:10px;padding:0 12px;min-height:44px;border-radius:10px;color:#9AA1AD;text-decoration:none;font-size:14px;font-weight:500}
.nav a:hover{background:#171A21;color:#E8EAED}
.nav a.on{background:#1E222B;color:#E8EAED}
.tf{font-size:12px;font-weight:600;color:#9AA1AD}
"""

ICON = {
 "log": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2.5"></rect><path d="M3 9h18"></path><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M12 13v5"></path><path d="M9.5 15.5h5"></path></svg>',
 "acct": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="14" rx="2.5"></rect><path d="M2 10h20"></path><path d="M16 15h2"></path></svg>',
 "chev": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>',
 "plus": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',
 "book": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"></path><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"></path></svg>',
 "review": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"></path><path d="M7 15l4-4 3 3 5-6"></path></svg>',
 "replay": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v5h5"></path></svg>',
 "lib": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>',
 "mic": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><path d="M12 17v4"></path></svg>',
 "check": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>',
 "upload": '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"></path></svg>',
 "link": '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1 1"></path><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1-1"></path></svg>',
}

def dd_item(label, sub, on=False, hover=False):
    bg = "#1E222B" if hover else "transparent"
    only = f'<button type="button" aria-label="Show only {label}" style="font: inherit; font-size: 12px; font-weight: 600; color: #E8EAED; background: #262B36; border: 1px solid #3A404C; border-radius: 6px; padding: 0 10px; min-height: 28px; cursor: pointer">Only</button>' if hover else ''
    return f'<div style="display: flex; align-items: center; gap: 8px; padding: 0 8px 0 10px; border-radius: 8px; background: {bg}"><label style="flex: 1; display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer"><input type="checkbox" {"checked" if on else ""} style="width: 18px; height: 18px; accent-color: #E8EAED; margin: 0"><span style="font-size: 14px; font-weight: 500; color: #E8EAED">{label}</span></label>{only}</div>'

def dd_head(t, note=""):
    n = f'<span style="font-size: 12px; color: #9AA1AD; font-weight: 400; text-transform: none; letter-spacing: 0">{note}</span>' if note else ""
    return f'<div style="display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 4px"><span style="font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9AA1AD">{t}</span>{n}</div>'

DROPDOWN = f"""<fieldset style="position: absolute; z-index: 5; top: 156px; left: 18px; right: 18px; margin: 0; box-sizing: border-box; background: #171A21; border: 1px solid #3A404C; border-radius: 12px; padding: 6px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 1px">
<legend style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Accounts to view</legend>
{dd_head("Real money")}
{dd_item("Main account", "Live", True)}
{dd_item("Funded 100K", "Prop firm", True, hover=True)}
{dd_item("Challenge 50K", "Prop firm", True)}
{dd_head("Practice", "Mixes practice trades into your numbers")}
{dd_item("Practice", "Demo")}
{dd_item("Bar replay sessions", "Backtest")}
<div style="height: 1px; background: #2A2F3A; margin: 6px 4px"></div>
<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px">
<button type="button" style="font: inherit; font-size: 13px; color: #C9CED6; background: transparent; border: 0; min-height: 40px; padding: 0 6px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px">Reset to real money</button>
<a href="Accounts.dc.html" style="display: flex; align-items: center; min-height: 40px; padding: 0 6px; font-size: 13px; color: #C9CED6">Manage</a>
</div>
</fieldset>"""


def scope_picker(open_=False):
    btn = f'<button type="button" aria-haspopup="true" aria-expanded="{"true" if open_ else "false"}" class="btn btn-g" style="gap: 10px">{ICON["acct"]}<span>3 accounts</span><span style="color: #9AA1AD; display: flex">{ICON["chev"]}</span></button>'
    dd = DROPDOWN.replace("top: 156px; left: 18px; right: 18px;", "top: calc(100% + 8px); right: 0; width: 280px; text-align: left;") if open_ else ""
    return f'<div style="position: relative; display: inline-flex">{btn}{dd}</div>'

def nav(active, picker_open=False):
    items = [("Main.dc.html", "log", "Daily log"), ("Playbook.dc.html", "book", "Playbook"),
             ("Review.dc.html", "review", "Weekly review"), ("Replay.dc.html", "replay", "Blind replay"),
             ("Main.dc.html", "lib", "All chart stories"), ("Accounts.dc.html", "acct", "Accounts")]
    links = "".join(
        f'<a href="{h}" class="{"on" if lbl == active else ""}">{ICON[ic]}<span>{lbl}</span></a>'
        for h, ic, lbl in items)
    return f'''<aside style="position: relative; flex: 1 1 220px; max-width: 100%; box-sizing: border-box; padding: 28px 18px; border-right: 1px solid #1F242D; display: flex; flex-direction: column; gap: 28px">
<div style="display: flex; align-items: center; gap: 10px; padding: 0 12px">
<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="7" fill="#1E222B" stroke="#2A2F3A"></rect><line x1="9" y1="7" x2="9" y2="19" stroke="#C9CED6" stroke-width="1.5"></line><rect x="7" y="9" width="4" height="6" fill="#C9CED6"></rect><line x1="17" y1="6" x2="17" y2="18" stroke="#5F6672" stroke-width="1.5"></line><rect x="15" y="10" width="4" height="5" fill="#5F6672"></rect></svg>
<span style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 17px; color: #E8EAED">Journal</span>
</div>

<nav class="nav" aria-label="Main" style="display: flex; flex-direction: column; gap: 2px">{links}</nav>
<div style="margin-top: auto; padding: 0 12px; display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9AA1AD"><span style="width: 8px; height: 8px; border-radius: 4px; background: #5BA2FF"></span>2 accounts syncing from MT5</div>
<div style="font-size: 12px; color: #8A919D">1 logged from screenshots only</div>
</div>
</aside>'''

def page(title, h, body, active, script_body="renderVals() { return {}; }", picker_open=False):
    props = json.dumps({"$preview": {"width": 1440, "height": h}})
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
<div style="min-height: {h}px; background: #0F1115; color: #E8EAED; font-family: Inter, system-ui, sans-serif; font-size: 15px; line-height: 1.5; display: flex; flex-wrap: wrap">
{nav(active, picker_open)}
<main style="flex: 999 1 560px; min-width: 0; box-sizing: border-box; padding: 36px 40px 64px">
<div style="max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px">
{body}
</div>
</main>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
{script_body}
}}
</script>
</body>
</html>
'''

def stackthumbs(charts, labels, big=None):
    cells = []
    for k, lbl in labels:
        cells.append(f'<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0"><div style="border-radius: 6px; overflow: hidden; border: 1px solid #2A2F3A">{charts[k]}</div><span class="tf">{lbl}</span></div>')
    return f'<div style="display: grid; grid-template-columns: repeat({len(labels)}, minmax(0, 1fr)); gap: 10px">{"".join(cells)}</div>'

# ---------- 1. Tonight ----------
def story_row(pair, side, status, match, result, result_col, thumbs, state_html, href):
    return f'''<div class="card" style="padding: 20px; display: flex; flex-wrap: wrap; gap: 24px; align-items: center">
<div style="flex: 1 1 220px; min-width: 0; display: flex; flex-direction: column; gap: 6px">
<div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap"><span class="num" style="font-size: 20px; font-weight: 600">{pair}</span><span style="font-size: 14px; color: #9AA1AD">{side} · {status}</span></div>
<div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9AA1AD">{match}</div>
<div class="num" style="font-size: 18px; font-weight: 600; color: {result_col}">{result}</div>
</div>
<div style="flex: 3 1 420px; min-width: 0">{thumbs}</div>
<div style="flex: 1 1 200px; min-width: 0; display: flex; flex-direction: column; gap: 10px; align-items: flex-start">{state_html}<a href="{href}" style="font-size: 13px">Open chart story</a></div>
</div>'''

L5 = [("W", "Weekly"), ("D", "Daily"), ("4H", "4H"), ("E", "15m entry"), ("A", "After")]
tonight = f'''
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<span class="eyebrow">Monday 16 November</span>
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 600; line-height: 1.15">Daily log</h1>
<p style="margin: 0; color: #9AA1AD">Drop, talk, confirm. About 3 minutes, whenever suits you.</p>
</div>
<ol aria-label="Daily log steps" style="list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; flex-wrap: wrap">
<li style="display: flex; align-items: center; gap: 8px; padding: 0 14px; min-height: 36px; border-radius: 999px; background: #1E222B; font-size: 13px; color: #E8EAED"><span style="color: #5BA2FF">{ICON["check"]}</span>1 Drop screenshots</li>
<li style="display: flex; align-items: center; gap: 8px; padding: 0 14px; min-height: 36px; border-radius: 999px; background: #262B36; border: 1px solid #5F6672; font-size: 13px; font-weight: 600">2 Talk through each</li>
<li style="display: flex; align-items: center; gap: 8px; padding: 0 14px; min-height: 36px; border-radius: 999px; border: 1px solid #2A2F3A; font-size: 13px; color: #9AA1AD">3 Confirm</li>
</ol>
</header>

<section aria-label="Drop screenshots" style="border: 1.5px dashed #3A404C; border-radius: 16px; padding: 28px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; background: #12151B">
<div style="display: flex; gap: 16px; align-items: center">
<span style="color: #9AA1AD">{ICON["upload"]}</span>
<div><div style="font-weight: 600">Drop today's screenshots here</div><div style="font-size: 14px; color: #9AA1AD">Any order, any timeframe, no renaming. Watched setups too.</div></div>
</div>
<div style="display: flex; gap: 10px; flex-wrap: wrap"><button type="button" class="btn btn-g">Paste from clipboard</button><button type="button" class="btn btn-g">Choose files</button></div>
</section>

<section aria-labelledby="found" style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px">
<h2 id="found" style="margin: 0; font-size: 17px; font-weight: 600">13 screenshots sorted into 3 chart stories</h2>
<span style="font-size: 13px; color: #9AA1AD">2 MT5 trades today across your accounts, both matched</span>
</div>
{story_row("GBPUSD", "Short", "Taken", ICON["link"] + "Matched to MT5 #48213", "+2.1R", WIN, stackthumbs(GU, L5),
 '<button type="button" class="btn btn-p">' + ICON["mic"] + 'Record voice note</button>', "Story.dc.html")}
{story_row("XAUUSD", "Long", "Taken", ICON["link"] + "Matched to MT5 #48227", "−1.0R", LOSS, stackthumbs(XA, L5),
 '<div style="display: flex; align-items: center; gap: 8px; font-size: 14px"><span style="color: #5BA2FF">' + ICON["check"] + '</span>Voice note done</div><span style="font-size: 13px; color: #FFA552">2 tags to check</span>', "Story.dc.html")}
{story_row("EURJPY", "Long", "Watched", "No MT5 trade expected", "Open", MU, stackthumbs(EJ, [("D", "Daily"), ("4H", "4H"), ("E", "30m")]),
 '<button type="button" class="btn btn-g">' + ICON["mic"] + 'Say why you passed</button><span style="font-size: 13px; color: #9AA1AD">No after chart yet, stays open</span>', "Story.dc.html")}
</section>

<section class="card" style="padding: 18px 20px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between">
<div style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 600">1 screenshot couldn't be placed</span><span style="font-size: 14px; color: #9AA1AD">Looks like a USDJPY 1H chart with no trade on it. Drag it onto a story or skip it.</span></div>
<button type="button" class="btn btn-g">Skip it</button>
</section>

<footer style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding-top: 4px">
<p style="margin: 0; font-size: 14px; color: #9AA1AD">Missed a few days? Drop whatever screenshots you still have. MT5 has already logged the trades.</p>
<button type="button" class="btn btn-p">Done for today</button>
</footer>
'''

# ---------- 2. Story ----------
def chips(group, items):
    return f'''<div style="display: flex; flex-direction: column; gap: 8px"><span class="eyebrow">{group}</span><div style="display: flex; flex-wrap: wrap; gap: 6px">{items}</div></div>'''

def chip(label, kind="on", src=None):
    cls = {"on": "chip chip-on", "voice": "chip chip-on chip-voice", "check": "chip chip-on chip-check", "empty": "chip chip-empty"}[kind]
    tail = ""
    if src: tail = f'<span style="font-size: 11px; color: {VOICE if kind=="voice" else (LOSS if kind=="check" else MU)}">{src}</span>'
    pressed = "false" if kind == "empty" else "true"
    return f'<button type="button" class="{cls}" aria-pressed="{pressed}">{label}{tail}</button>'

wave = "".join(f'<span style="width: 3px; border-radius: 2px; background: #B9A6FF; height: {h}px"></span>' for h in [6,10,16,22,14,9,18,26,20,12,8,14,24,18,10,6,12,20,16,8,5,10,18,12,7,4])
story = f'''
<nav aria-label="Breadcrumb" style="font-size: 13px; color: #9AA1AD"><a href="Main.dc.html">Daily log</a> <span aria-hidden="true">/</span> GBPUSD short</nav>
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 600; line-height: 1.15">GBPUSD short</h1>
<div style="display: flex; gap: 14px; flex-wrap: wrap; font-size: 14px; color: #9AA1AD"><span>Taken</span><span>Main account · Live</span><span>London session</span><span>Mon 16 Nov, 09:45 to 13:20</span><span style="display: inline-flex; align-items: center; gap: 6px">{ICON["link"]}MT5 #48213</span></div>
</div>
<div class="num" style="font-size: 32px; font-weight: 600; color: #5BA2FF">+2.1R</div>
</header>

<section aria-label="Timeframe stack" class="card" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px"><h2 style="margin: 0; font-size: 15px; font-weight: 600">Top-down, as you saw it</h2><span style="font-size: 13px; color: #9AA1AD">5 screenshots, sorted automatically</span></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">
<div style="display: flex; flex-direction: column; gap: 6px"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{GU["W"]}</div><span class="tf">Weekly</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{GU["D"]}</div><span class="tf">Daily · your supply zone</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{GU["4H"]}</div><span class="tf">4H · pullback into supply</span></div>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
<div style="display: flex; flex-direction: column; gap: 6px"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{GU["E"]}</div><span class="tf">15m entry · position tool read</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{GU["A"]}</div><span class="tf">After · how price played out</span></div>
</div>
</section>

<div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start">
<section aria-labelledby="vn" class="card" style="flex: 1 1 420px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><h2 id="vn" style="margin: 0; font-size: 15px; font-weight: 600">Your voice note</h2><span class="num" style="font-size: 13px; color: #9AA1AD">0:24</span></div>
<div style="display: flex; align-items: center; gap: 14px">
<button type="button" aria-label="Play voice note" style="width: 44px; height: 44px; border-radius: 22px; border: 0; background: #B9A6FF; color: #0F1115; cursor: pointer; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"></path></svg></button>
<div aria-hidden="true" style="display: flex; align-items: center; gap: 3px; height: 30px; flex: 1; overflow: hidden">{wave}</div>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.65; color: #C9CED6">"Weekly and daily both bearish. 4H pulled back right into last week's <mark style="background: rgba(185,166,255,0.18); color: #E8EAED; border-radius: 4px; padding: 0 3px">supply zone</mark>. Waited for the fifteen minute <mark style="background: rgba(185,166,255,0.18); color: #E8EAED; border-radius: 4px; padding: 0 3px">break of structure</mark> and got in on the retest. Felt <mark style="background: rgba(185,166,255,0.18); color: #E8EAED; border-radius: 4px; padding: 0 3px">calm</mark>, didn't rush it. Left it alone and it hit target. Next time I'd like the same patience on Gold."</p>
<div style="border-top: 1px solid #2A2F3A; padding-top: 14px; display: flex; flex-direction: column; gap: 6px">
<span class="eyebrow">Lesson saved</span>
<span style="font-size: 14px">Same patience on Gold. Added to this story and to the 4H supply pullback page.</span>
</div>
<button type="button" class="btn btn-g" style="align-self: flex-start">{ICON["mic"]}Record again</button>
</section>

<section aria-labelledby="tg" class="card" style="flex: 1 1 420px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 18px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap"><h2 id="tg" style="margin: 0; font-size: 15px; font-weight: 600">Tags</h2>
<div style="display: flex; gap: 12px; font-size: 12px; color: #9AA1AD; flex-wrap: wrap"><span style="display: inline-flex; align-items: center; gap: 6px"><span style="width: 10px; height: 10px; border-radius: 5px; border: 1px solid #B9A6FF"></span>From voice</span><span style="display: inline-flex; align-items: center; gap: 6px"><span style="width: 10px; height: 10px; border-radius: 5px; border: 1px solid #FFA552"></span>Please check</span></div></div>
{chips("Setup", chip("4H supply pullback", "voice", "4 of 5 rules"))}
{chips("Bias", chip("Weekly: bear", "voice") + chip("Daily: bear", "voice") + chip("4H: not said", "empty"))}
{chips("Location", chip("Supply zone", "check", "read from your markup"))}
{chips("Trigger", chip("Break of structure", "voice"))}
{chips("Plan", chip("Followed", "voice"))}
{chips("Headspace", chip("Calm", "voice"))}
{chips("Mistakes", chip("None mentioned", "empty"))}
<div style="border-top: 1px solid #2A2F3A; padding-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">
<div><div class="eyebrow">Entry</div><div class="num" style="font-weight: 600">1.26840</div></div>
<div><div class="eyebrow">Stop</div><div class="num" style="font-weight: 600">1.27010</div></div>
<div><div class="eyebrow">Target</div><div class="num" style="font-weight: 600">1.26480</div></div>
<div><div class="eyebrow">Lots</div><div class="num" style="font-weight: 600">0.50</div></div>
<div><div class="eyebrow">Exit (MT5)</div><div class="num" style="font-weight: 600">1.26482</div></div>
<div><div class="eyebrow">Planned R:R</div><div class="num" style="font-weight: 600">1 : 2.1</div></div>
</div>
<div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9AA1AD"><span style="color: #5BA2FF">{ICON["check"]}</span>Stop is above entry and R:R matches your position tool</div>
<div style="display: flex; gap: 10px; flex-wrap: wrap"><button type="button" class="btn btn-p">{ICON["check"]}Looks right</button><button type="button" class="btn btn-g">Edit tags</button></div>
</section>
</div>
'''

# ---------- 3. Playbook ----------
def gcard(svgs, pair, date, r, col, tag=""):
    t = f'<span style="font-size: 11px; font-weight: 600; color: #0F1115; background: #C9CED6; border-radius: 999px; padding: 1px 8px">{tag}</span>' if tag else ""
    return f'''<a href="Story.dc.html" class="card" style="padding: 12px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: #E8EAED">
<div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{svgs}</div>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="font-size: 14px; font-weight: 600">{pair}</span>{t}<span class="num" style="font-weight: 600; color: {col}">{r}</span></div>
<span style="font-size: 12px; color: #9AA1AD">{date}</span>
</a>'''

def stat(label, val, note=""):
    n = f'<div style="font-size: 12px; color: #9AA1AD">{note}</div>' if note else ""
    return f'<div class="card" style="padding: 16px 18px"><div class="eyebrow">{label}</div><div class="num" style="font-size: 26px; font-weight: 600; margin-top: 4px">{val}</div>{n}</div>'

def finding(head, body, n):
    return f'''<div style="padding: 16px 0; border-top: 1px solid #2A2F3A; display: flex; flex-wrap: wrap; gap: 8px 20px; justify-content: space-between">
<div style="flex: 1 1 360px; min-width: 0"><div style="font-weight: 600">{head}</div><div style="font-size: 14px; color: #9AA1AD">{body}</div></div>
<span style="font-size: 12px; color: #9AA1AD; align-self: center">{n}</span></div>'''

gal = "".join([
    gcard(gallery(101, "short", True), "GBPUSD", "Mon 16 Nov · London", "+2.1R", WIN, "Textbook"),
    gcard(gallery(102, "short", True), "EURUSD", "Thu 12 Nov · London", "+2.0R", WIN),
    gcard(gallery(103, "short", False), "GBPJPY", "Wed 11 Nov · Asia", "−1.0R", LOSS),
    gcard(gallery(104, "short", True), "AUDUSD", "Tue 10 Nov · New York", "+1.8R", WIN),
    gcard(gallery(105, "short", False), "XAUUSD", "Fri 6 Nov · London", "−1.0R", LOSS),
    gcard(gallery(106, "short", True), "EURJPY", "Thu 5 Nov · London", "Watched", MU, "Not taken"),
])
playbook = f'''
<nav aria-label="Breadcrumb" style="font-size: 13px; color: #9AA1AD"><a href="Playbook.dc.html">Playbook</a> <span aria-hidden="true">/</span> 4H supply pullback</nav>
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<span class="eyebrow">Example setup · rename to yours</span>
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 600; line-height: 1.15">4H supply pullback</h1>
<p style="margin: 0; color: #9AA1AD">34 taken · 9 watched</p>
</div>
<div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-start">{scope_picker(True)}<a href="Replay.dc.html" class="btn btn-g">{ICON["replay"]}Replay this setup</a><button type="button" class="btn btn-g">Edit rules</button></div>
</header>

<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px">
{stat("Expectancy", "+0.5R", "per trade, 34 trades")}
{stat("Win rate", "47%", "16 won, 18 lost")}
{stat("Avg winner", "+2.2R")}
{stat("Your replay accuracy", "69%", "up from 55% in October")}
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start">
<section aria-labelledby="rules" class="card" style="flex: 1 1 300px; min-width: 0; padding: 20px; display: flex; flex-direction: column; gap: 12px">
<h2 id="rules" style="margin: 0; font-size: 15px; font-weight: 600">Rules</h2>
<ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; color: #C9CED6; font-size: 14px">
<li>Daily trend is bearish</li><li>4H pulls back into a marked supply zone</li><li>15m breaks structure inside the zone</li><li>Enter on the retest</li><li>Stop above the zone, target at least 2R</li>
</ol>
<span style="font-size: 12px; color: #9AA1AD">Example rules. Yours replace these on day one.</span>
</section>

<section aria-labelledby="sep" class="card" style="flex: 2 1 480px; min-width: 0; padding: 20px">
<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 4px"><h2 id="sep" style="margin: 0; font-size: 15px; font-weight: 600">What separates your winners from your losers</h2><span style="font-size: 12px; color: #9AA1AD">Updated weekly</span></div>
{finding("Weekly agreed with the daily", "13 of your 16 winners. Against the weekly, only 3 of 12 worked.", "28 trades")}
{finding("London session", "+1.1R per trade in London. Asia session averages −0.4R.", "34 trades")}
{finding("You moved your stop", "1 of 7 trades where you moved the stop ended as a winner.", "Early signal · 7 trades")}
</section>
</div>

<section aria-labelledby="ex" style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px">
<h2 id="ex" style="margin: 0; font-size: 17px; font-weight: 600">Examples</h2>
<div role="group" aria-label="Filter examples" style="display: flex; gap: 6px; flex-wrap: wrap">
<button type="button" class="chip chip-on" aria-pressed="true">All 43</button><button type="button" class="chip" aria-pressed="false">Winners 16</button><button type="button" class="chip" aria-pressed="false">Losers 18</button><button type="button" class="chip" aria-pressed="false">Watched 9</button><button type="button" class="chip" aria-pressed="false">Textbook 3</button>
</div></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px">{gal}</div>
</section>

<section class="card" style="padding: 18px 20px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; border-color: rgba(185,166,255,0.45)">
<div style="flex: 1 1 360px; min-width: 0"><div style="font-weight: 600">4 unsorted chart stories look alike</div><div style="font-size: 14px; color: #9AA1AD">Daily bullish, price sweeps the Asian low, then a 15m break of structure. Want to name it as a setup?</div></div>
<div style="display: flex; gap: 10px; flex-wrap: wrap"><button type="button" class="btn btn-g">Not now</button><button type="button" class="btn btn-p">Name this setup</button></div>
</section>
'''

# ---------- 4. Weekly review ----------
def rule_opt(text, sub, on=False):
    return f'''<label style="display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 12px; border: 1px solid {"#5F6672" if on else "#2A2F3A"}; background: {"#1E222B" if on else "transparent"}; cursor: pointer">
<input type="radio" name="rule" {"checked" if on else ""} style="margin-top: 4px; accent-color: #E8EAED; width: 18px; height: 18px">
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-weight: 600">{text}</span><span style="font-size: 13px; color: #9AA1AD">{sub}</span></span></label>'''

review = f'''
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<span class="eyebrow">Weekly review</span>
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 600; line-height: 1.15">Week of 9 to 13 November</h1>
<p style="margin: 0; color: #9AA1AD">11 trades · 4 watched setups · about 10 minutes</p>
</div>
<div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap">{scope_picker()}<div class="num" style="font-size: 32px; font-weight: 600; color: #5BA2FF">+3.4R</div></div>
</header>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<section aria-labelledby="leak" class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 10px; border-color: rgba(255,165,82,0.5)">
<span class="eyebrow" style="color: #FFA552">Biggest leak</span>
<h2 id="leak" style="margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3">Off-plan trades cost you 4.0R</h2>
<p style="margin: 0; color: #C9CED6">All 3 came within an hour of a loss on the same day. Your 8 on-plan trades made +7.4R.</p>
<a href="Story.dc.html" style="font-size: 14px">See the 3 trades</a>
<span style="font-size: 12px; color: #9AA1AD">Early signal · 3 trades. Worth watching, not acting on alone.</span>
</section>
<section aria-labelledby="str" class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 10px; border-color: rgba(91,162,255,0.5)">
<span class="eyebrow" style="color: #5BA2FF">Biggest strength</span>
<h2 id="str" style="margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3">Calm London entries: +6.2R</h2>
<p style="margin: 0; color: #C9CED6">5 trades where you said you felt calm and waited for the break of structure. 4 won.</p>
<a href="Playbook.dc.html" style="font-size: 14px">Open 4H supply pullback</a>
</section>
</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<section class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<span class="eyebrow">Hesitation check</span>
<div style="font-size: 18px; font-weight: 600">You passed on 4 setups that matched your rules. 3 hit target.</div>
<p style="margin: 0; font-size: 14px; color: #9AA1AD">Skipping good setups costs you too. Worth a look in blind replay.</p>
</section>
<section class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<span class="eyebrow">Last week's rule</span>
<div style="font-size: 18px; font-weight: 600">"No trades after 2pm on Friday." You kept it.</div>
<p style="margin: 0; font-size: 14px; color: #9AA1AD">0 late Friday trades this week. Before the rule, they averaged −1.5R a week.</p>
</section>
</div>

<section aria-labelledby="pick" class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<div><h2 id="pick" style="margin: 0; font-size: 17px; font-weight: 600">Pick one rule to test next week</h2><p style="margin: 4px 0 0; font-size: 14px; color: #9AA1AD">One rule. At your next review you'll see whether it helped.</p></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
{rule_opt("After a loss, wait an hour", "Targets this week's leak", True)}
{rule_opt("Keep the Friday rule", "It's working, make it permanent")}
{rule_opt("Write my own", "Say it or type it")}
</div>
</section>

<section class="card" style="padding: 22px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between">
<div style="flex: 1 1 360px; min-width: 0"><div style="font-weight: 600; font-size: 17px">Blind replay: 8 charts, about 6 minutes</div><div style="font-size: 14px; color: #9AA1AD">From your own library, outcomes hidden. Includes 2 of the setups you passed on.</div></div>
<a href="Replay.dc.html" class="btn btn-p">{ICON["replay"]}Start replay</a>
</section>
'''

# ---------- 5. Replay (interactive) ----------
replay = f'''
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<span class="eyebrow">Blind replay · chart 3 of 8</span>
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 600; line-height: 1.15">Would you take this?</h1>
<p style="margin: 0; color: #9AA1AD">From all your accounts, practice included · pair and outcome shown after you answer</p>
</div>
<div aria-label="Progress, 3 of 8" style="display: flex; gap: 6px">
<span style="width: 28px; height: 6px; border-radius: 3px; background: #E8EAED"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #E8EAED"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #9AA1AD"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #2A2F3A"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #2A2F3A"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #2A2F3A"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #2A2F3A"></span><span style="width: 28px; height: 6px; border-radius: 3px; background: #2A2F3A"></span>
</div>
</header>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
<div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px"><span class="tf">Daily</span><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{RP["D"]}</div></div>
<div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px"><span class="tf">15m · everything after this candle is hidden</span>
<sc-if value="{{{{ answered }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{RP["Eshown"]}</div></sc-if>
<sc-if value="{{{{ waiting }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="border-radius: 8px; overflow: hidden; border: 1px solid #2A2F3A">{RP["Ehidden"]}</div></sc-if>
</div>
</div>

<sc-if value="{{{{ waiting }}}}" hint-placeholder-val="{{{{ true }}}}">
<section aria-label="Your call" class="card" style="padding: 22px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between">
<div style="font-size: 15px; color: #C9CED6">Go with your gut. You can't get this wrong, it's practice.</div>
<div style="display: flex; gap: 10px; flex-wrap: wrap">
<button type="button" class="btn btn-g" onClick="{{{{ pickLong }}}}">Long</button>
<button type="button" class="btn btn-g" onClick="{{{{ pickShort }}}}">Short</button>
<button type="button" class="btn btn-g" onClick="{{{{ pickSkip }}}}">Skip it</button>
</div>
</section>
</sc-if>

<sc-if value="{{{{ answered }}}}" hint-placeholder-val="{{{{ false }}}}">
<section aria-live="polite" class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: baseline">
<div style="font-size: 20px; font-weight: 600">{{{{ verdict }}}}</div>
<div class="num" style="font-size: 22px; font-weight: 600; color: #5BA2FF">Long, hit target, +2.4R</div>
</div>
<p style="margin: 0; color: #C9CED6">EURUSD, Tue 3 Nov. This was a 4H demand pullback you took live. Your note then: "Daily bullish, waited for the 15m to break structure."</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; border-top: 1px solid #2A2F3A; padding-top: 14px">
<span style="font-size: 14px; color: #9AA1AD">This setup in replay: {{{{ accuracy }}}}</span>
<div style="display: flex; gap: 10px"><button type="button" class="btn btn-g" onClick="{{{{ reset }}}}">Try again</button><button type="button" class="btn btn-p">Next chart</button></div>
</div>
</section>
</sc-if>
'''
replay_script = """
renderVals() {
  const pick = this.state && this.state.pick;
  const set = (p) => () => this.setState({ pick: p });
  const right = pick === 'long';
  const verdict = pick === 'long' ? 'You said long. Right call.' : pick === 'short' ? 'You said short. Price went the other way.' : 'You skipped it. This one worked.';
  return {
    answered: !!pick,
    waiting: !pick,
    verdict: verdict,
    accuracy: right ? '10 of 14 right (71%)' : '9 of 14 right (64%)',
    pickLong: set('long'), pickShort: set('short'), pickSkip: set('skip'),
    reset: () => this.setState({ pick: null })
  };
}
"""

# ---------- 6. Accounts ----------
def acct_row(name, typ, conn, note=""):
    n = f' · {note}' if note else ""
    return f"""<button type="button" style="font: inherit; color: #E8EAED; text-align: left; width: 100%; background: transparent; border: 0; border-top: 1px solid #2A2F3A; padding: 14px 4px; min-height: 64px; cursor: pointer; display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr) 24px; gap: 16px; align-items: center">
<span style="font-weight: 600; font-size: 15px">{name}</span>
<span style="font-size: 14px; color: #C9CED6">{typ}</span>
<span style="font-size: 14px; color: #9AA1AD">{conn}{n}</span>
<span style="color: #9AA1AD; transform: rotate(-90deg); display: flex">{ICON["chev"]}</span>
</button>"""

def acct_group(title, sub, rows):
    return f"""<section style="display: flex; flex-direction: column">
<h2 style="margin: 0; padding: 0 4px 10px; font-size: 15px; font-weight: 600">{title}</h2>{sub}
{rows}
</section>"""

accounts = f"""
<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 6px">
<h1 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 600; line-height: 1.15">Accounts <span style="font-weight: 500; color: #8A919D">(5)</span></h1>
</div>
<button type="button" class="btn btn-p">{ICON["plus"]}Add account</button>
</header>

<div class="card" style="padding: 20px 20px 8px; display: flex; flex-direction: column; gap: 28px">
<div aria-hidden="true" style="display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr) 24px; gap: 16px; padding: 0 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9AA1AD"><span>Name</span><span>Type</span><span>Trades come from</span><span></span></div>
{acct_group("Real money", "", acct_row("Main account", "Live", "MT5", "synced 2 min ago") + acct_row("Funded 100K", "Prop firm", "MT5", "synced 2 min ago") + acct_row("Challenge 50K", "Prop firm", "Screenshots"))}
{acct_group("Practice", '<p style="margin: -6px 0 10px; padding: 0 4px; font-size: 13px; color: #9AA1AD">Not ticked by default when you view stats. Always used in your playbook and replay.</p>', acct_row("Practice", "Demo", "MT5", "synced yesterday") + acct_row("Bar replay sessions", "Backtest", "Screenshots"))}
</div>

"""

H = {"Main": 1180, "Story": 1500, "Playbook": 1500, "Review": 1240, "Replay": 980, "Accounts": 900}
files = {
    "Main.dc.html": page("Daily log", H["Main"], tonight, "Daily log"),
    "Story.dc.html": page("Chart story: GBPUSD short", H["Story"], story, "Daily log"),
    "Playbook.dc.html": page("Playbook: 4H supply pullback", H["Playbook"], playbook, "Playbook"),
    "Review.dc.html": page("Weekly review", H["Review"], review, "Weekly review"),
    "Replay.dc.html": page("Blind replay", H["Replay"], replay, "Blind replay", replay_script),
    "Accounts.dc.html": page("Accounts", H["Accounts"], accounts, "Accounts"),
}
for k, v in files.items():
    assert "—" not in v, k
    open(os.path.join(OUT, k), "w").write(v)

order = ["Main.dc.html", "Story.dc.html", "Playbook.dc.html", "Review.dc.html", "Replay.dc.html", "Accounts.dc.html"]
titles = {"Main.dc.html": "1 · Daily log: drop screenshots", "Story.dc.html": "2 · Chart story: voice fills the tags",
          "Playbook.dc.html": "3 · Playbook setup page, account picker open", "Review.dc.html": "4 · Weekly review", "Replay.dc.html": "5 · Blind replay (clickable)", "Accounts.dc.html": "6 · Accounts"}
boards = {}; x = 0
for f in order:
    stem = f.split(".")[0]
    boards[f] = {"x": x, "y": 0, "w": 1440, "h": H[stem], "title": titles[f], "expand": "fill", "is_interactive": True}
    x += 1440 + 80
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-11-16T00:05:06Z"}, "title": "Trading Journal Concept",
          "launch": {"view": "canvas"}, "pages": [], "boards": boards, "order": order,
          "notes": {
              "t1": {"x": 0, "y": -320, "text": "Trading journal concept: log daily, learn weekly", "kind": "title1", "maxW": x - 80},
              "s1": {"x": -480, "y": 0, "w": 380, "text": "Sample data throughout. Setups, rules, trades and numbers are examples to swap for yours.\n\nDaily log: drop screenshots, one voice note per chart story, confirm. Any time of day. Insights only arrive in the weekly review, on the day you choose.\n\nAccounts: add as many as you like, name them, pick a type (or make your own) and mark it real money or practice. The account picker on Playbook and Weekly review starts with real-money accounts ticked.", "fill": "gray", "size": "m"},
          },
          "designSystems": []}
open(os.path.join(OUT, "canvas.json"), "w").write(json.dumps(canvas, indent=1))
print("ok", [len(v) for v in files.values()])
