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
    out.append(f'<rect x="0" y="0" width="{w}" height="{h}" fill="#111419"></rect>')
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
        out.append(f'<rect x="{x1:.1f}" y="0" width="{w-x1:.1f}" height="{h}" fill="#15181E"></rect>')
        out.append(f'<line x1="{x1:.1f}" y1="0" x2="{x1:.1f}" y2="{h}" stroke="#2A2F3A" stroke-width="1"></line>')
        out.append(f'<text x="{(x1+w)/2:.1f}" y="{h/2+4:.1f}" fill="#8A919D" font-size="12" font-family="Geist, sans-serif" text-anchor="middle">Hidden</text>')
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

