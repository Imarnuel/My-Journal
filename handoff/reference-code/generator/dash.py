# Dashboard (home). Executed inside gen2.py's namespace after parts.py.
# Every number is in R or %, never money. Shows what happened; the weekly review explains it.

# One record per taken, closed trade this month: (date, R, setup, session, plan followed, mistake tags)
SU, LB, AR, UN = "4H supply pullback", "London breakout", "Asian range fade", "Unsorted"
TR = [
    ("2 Nov", 1.8, SU, "London", True, []),
    ("2 Nov", -1.0, LB, "London", False, ["Entered before close"]),
    ("3 Nov", -1.0, AR, "Asia", True, []),
    ("4 Nov", 2.2, SU, "New York", True, []),
    ("5 Nov", -1.0, SU, "London", False, ["Moved stop"]),
    ("5 Nov", -1.0, UN, "New York", False, ["Chased entry"]),
    ("6 Nov", 1.5, LB, "London", True, []),
    ("9 Nov", 2.1, SU, "London", True, []),
    ("10 Nov", 2.6, SU, "New York", True, []),
    ("10 Nov", -1.0, LB, "London", True, []),
    ("11 Nov", 1.0, AR, "Asia", True, []),
    ("11 Nov", -1.0, SU, "London", False, ["Moved stop"]),
    ("11 Nov", -1.0, AR, "Asia", True, []),
    ("12 Nov", 1.7, LB, "London", True, []),
    ("12 Nov", 2.0, SU, "New York", True, []),
    ("12 Nov", -1.0, UN, "London", False, ["Entered before close"]),
    ("13 Nov", -1.0, SU, "New York", True, []),
    ("13 Nov", -1.0, LB, "London", False, ["Moved stop", "Chased entry"]),
    ("16 Nov", 0.6, UN, "London", True, []),
    ("16 Nov", 2.1, SU, "London", True, []),
]
WATCHED, NOTFILLED = 9, 3
MINUS = "−"

def fr(v, d=1):
    s = f"{abs(v):.{d}f}R"
    return ("+" if v > 0 else MINUS if v < 0 else "") + s

def rcol(v):
    return PROFIT if v > 0 else LOSS if v < 0 else "#A3AAB5"

rs = [t[1] for t in TR]
n = len(rs); net = sum(rs); wins = [r for r in rs if r > 0]; losses = [r for r in rs if r <= 0]
exp_r = net / n; winrate = len(wins) / n
avg_w = sum(wins) / len(wins); avg_l = sum(losses) / len(losses)
followed = sum(1 for t in TR if t[4])
# equity and drawdown
eq = []; c = 0
for r in rs:
    c += r; eq.append(c)
peak = 0; dd = 0
for v in eq:
    peak = max(peak, v); dd = min(dd, v - peak)

def tile(label, value, sub, col="#ECEEF1"):
    return f'''<div style="display: flex; flex-direction: column; gap: 6px; padding: 18px 18px 16px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<span class="lbl">{label}</span>
<span class="num" style="font-size: 28px; font-weight: 600; line-height: 1.15; color: {col}">{value}</span>
<span class="lbl">{sub}</span></div>'''

TILES = ('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px">'
         + tile("Net R", fr(net), f"Worst drawdown {fr(dd)}", rcol(net))
         + tile("Expectancy", fr(exp_r, 2), "What an average trade made")
         + tile("Win rate", f"{winrate * 100:.0f}%", f"Wins avg {fr(avg_w)}, losses {fr(avg_l)}")
         + tile("Plan followed", f"{followed / n * 100:.0f}%", f"{followed} of {n} trades")
         + tile("Trades taken", f"{n}", f"{WATCHED} watched · {NOTFILLED} not filled")
         + '</div>')

# ---- R over time: equity curve with drawdowns shaded ----
def equity_svg(w=600, h=230):
    pl, pr, pt, pb = 44, 10, 14, 30
    pts = [0] + eq
    lo = min(0, min(pts)); hi = max(pts); hi = (int(hi // 4) + 1) * 4
    X = lambda i: pl + i * (w - pl - pr) / (len(pts) - 1)
    Y = lambda v: pt + (hi - v) / (hi - lo) * (h - pt - pb)
    out = [f'<svg width="100%" viewBox="0 0 {w} {h}" role="img" aria-label="Cumulative R this month, trade by trade, ending at {fr(net)}. Deepest drawdown {fr(dd)}.">']
    for g in range(int(lo), int(hi) + 1, 4):
        out.append(f'<line x1="{pl}" y1="{Y(g):.1f}" x2="{w - pr}" y2="{Y(g):.1f}" stroke="{"#353B46" if g == 0 else "#1B1F27"}"{" stroke-dasharray=\"3 4\"" if g == 0 else ""}></line>')
        out.append(f'<text x="{pl - 10}" y="{Y(g) + 4:.1f}" text-anchor="end" font-size="11" fill="#8C939F" font-family="Geist, sans-serif">{fr(g, 0) if g else "0"}</text>')
    # drawdown fill: area between running peak and equity
    pk = 0; top = []; bot = []
    for i, v in enumerate(pts):
        pk = max(pk, v); top.append((X(i), Y(pk))); bot.append((X(i), Y(v)))
    poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in top) + " " + " ".join(f"{x:.1f},{y:.1f}" for x, y in reversed(bot))
    out.append(f'<polygon points="{poly}" fill="{LOSS}" fill-opacity="0.16"></polygon>')
    line = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(pts))
    out.append(f'<polyline points="{line}" fill="none" stroke="#ECEEF1" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>')
    out.append(f'<circle cx="{X(len(pts) - 1):.1f}" cy="{Y(pts[-1]):.1f}" r="4" fill="#ECEEF1"></circle>')
    # date ticks at the first trade of each week
    seen = set()
    for i, t in enumerate(TR, start=1):
        if t[0] in ("2 Nov", "9 Nov", "16 Nov") and t[0] not in seen:
            seen.add(t[0])
            out.append(f'<text x="{X(i):.1f}" y="{h - 8}" text-anchor="middle" font-size="11" fill="#8C939F" font-family="Geist, sans-serif">{t[0]}</text>')
    out.append('</svg>')
    return "".join(out)

# ---- R by day ----
DAYS = []
for t in TR:
    if not DAYS or DAYS[-1][0] != t[0]:
        DAYS.append([t[0], 0.0, 0])
    DAYS[-1][1] += t[1]; DAYS[-1][2] += 1

def day_bars():
    mx = max(abs(d[1]) for d in DAYS); H2 = 78
    cols = []
    for d, v, k in DAYS:
        hp = max(3, round(abs(v) / mx * H2)); up = v >= 0
        bar = f'<div style="height: {hp}px; width: 100%; max-width: 26px; border-radius: 3px; background: {rcol(v)}"></div>'
        cols.append(f'''<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center">
<div style="height: {H2}px; width: 100%; display: flex; align-items: flex-end; justify-content: center">{bar if up else ""}</div>
<div style="height: 1px; width: 100%; background: #353B46"></div>
<div style="height: {H2}px; width: 100%; display: flex; align-items: flex-start; justify-content: center">{"" if up else bar}</div>
<span class="lbl" style="font-size: 11px; margin-top: 6px; white-space: nowrap">{d.split()[0]}</span></div>''')
    aria = ", ".join(f"{d} {fr(v)}" for d, v, _ in DAYS)
    return f'<div role="img" aria-label="R by trading day: {aria}" style="display: flex; gap: 6px; margin-top: 8px">' + "".join(cols) + '</div>'

best = max(DAYS, key=lambda d: d[1]); worst = min(DAYS, key=lambda d: d[1])
green_days = sum(1 for d in DAYS if d[1] > 0)

TREND = f'''<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 20px">
<section aria-labelledby="eqh" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 id="eqh" style="margin: 0; font-size: 16px; font-weight: 600">R over time</h2>
<span style="display: inline-flex; align-items: center; gap: 8px" class="lbl"><span aria-hidden="true" style="width: 12px; height: 10px; border-radius: 2px; background: rgba(255,154,77,0.3)"></span>Drawdown</span></div>
{equity_svg()}
</section>
<section aria-labelledby="dayh" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 id="dayh" style="margin: 0; font-size: 16px; font-weight: 600">R by day</h2>
<span class="lbl">{green_days} of {len(DAYS)} days up</span></div>
{day_bars()}
<div style="display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid #1B1F27">
<span class="lbl">Best <span class="num" style="color: {PROFIT}; font-weight: 600">{fr(best[1])}</span> · {best[0]}</span>
<span class="lbl">Worst <span class="num" style="color: {LOSS}; font-weight: 600">{fr(worst[1])}</span> · {worst[0]}</span></div>
</section>
</div>'''

# ---- breakdowns ----
def group(key):
    g = {}
    for t in TR:
        g.setdefault(t[key], []).append(t[1])
    return g

def rbar(v, mx):
    pct = abs(v) / mx * 50
    side = f"left: 50%; width: {pct:.1f}%" if v >= 0 else f"right: 50%; width: {pct:.1f}%"
    return (f'<div aria-hidden="true" style="position: relative; height: 8px; border-radius: 4px; background: #15181E">'
            f'<div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #353B46"></div>'
            f'<div style="position: absolute; top: 0; bottom: 0; {side}; border-radius: 4px; background: {rcol(v)}"></div></div>')

GRID = "grid-template-columns: minmax(0, 1.7fr) 64px 72px 92px minmax(90px, 1fr) 64px"
def bhead(first):
    cells = [first, "Trades", "Win rate", "Expectancy", "", "Net"]
    al = ["left", "right", "right", "right", "left", "right"]
    return f'<div style="display: grid; {GRID}; gap: 14px; padding: 0 0 8px; align-items: end">' + "".join(f'<span class="lbl" style="text-align: {a}">{c}</span>' for c, a in zip(cells, al)) + '</div>'

def brow(name_html, vals, mx, href=None):
    k = len(vals); net_ = sum(vals)
    if k >= 5:
        wr = f'{sum(1 for v in vals if v > 0) / k * 100:.0f}%'; ex_ = fr(net_ / k, 2)
        rate = f'<span class="num" style="font-size: 14px; text-align: right">{wr}</span><span class="num" style="font-size: 14px; text-align: right">{ex_}</span>'
    else:
        rate = '<span class="lbl" style="grid-column: span 2; text-align: right">Too few to rate</span>'
    inner = (f'{name_html}<span class="num" style="font-size: 14px; text-align: right">{k}</span>{rate}'
             f'{rbar(net_, mx)}<span class="num" style="font-size: 14px; font-weight: 600; text-align: right; color: {rcol(net_)}">{fr(net_)}</span>')
    st = f'display: grid; {GRID}; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1; min-height: 44px'
    return f'<a href="{href}" style="{st}">{inner}</a>' if href else f'<div style="{st}">{inner}</div>'

SETUP_META = {SU: (101, "short", "Playbook.dc.html"), LB: (121, "long", "Playbook.dc.html"), AR: (131, "short", "Playbook.dc.html"), UN: (None, None, "PlaybookHome.dc.html")}
gs = group(2)
mx_s = max(abs(sum(v)) for v in gs.values())
def setup_name(s):
    sd, side, _ = SETUP_META[s]
    th = (f'<span class="chart" style="flex: none; width: 64px; display: block">{gallery(sd, side, True)}</span>' if sd
          else '<span aria-hidden="true" style="flex: none; width: 64px; height: 36px; border-radius: 8px; border: 1px dashed #353B46; box-sizing: border-box"></span>')
    return f'<span style="display: flex; align-items: center; gap: 12px; min-width: 0">{th}<span style="font-size: 14px; font-weight: 500">{s}</span></span>'
SETUP_ROWS = "".join(brow(setup_name(s), gs[s], mx_s, SETUP_META[s][2]) for s in (SU, LB, AR, UN))

gse = group(3)
mx_se = max(abs(sum(v)) for v in gse.values())
SESS_ROWS = "".join(brow(f'<span style="font-size: 14px; font-weight: 500">{s}</span>', gse[s], mx_se) for s in ("Asia", "London", "New York"))

mist = {}
for t in TR:
    for m in t[5]:
        mist.setdefault(m, []).append(t[1])
MIST = sorted(mist.items(), key=lambda kv: sum(kv[1]))
mx_m = max(abs(sum(v)) for _, v in MIST)
untagged = [t[1] for t in TR if not t[5]]
def mrow(tag, vals):
    c = sum(vals); pct = abs(c) / mx_m * 100
    return f'''<div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 70px minmax(60px, 1fr) 60px; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid #1B1F27; min-height: 44px">
<span>{pill(tag)}</span><span class="lbl" style="text-align: right">{len(vals)} trade{"s" if len(vals) != 1 else ""}</span>
<div aria-hidden="true" style="height: 8px; border-radius: 4px; background: #15181E; overflow: hidden"><div style="width: {pct:.0f}%; height: 100%; background: {LOSS}; border-radius: 4px"></div></div>
<span class="num" style="font-size: 14px; font-weight: 600; text-align: right; color: {rcol(c)}">{fr(c)}</span></div>'''
MIST_ROWS = "".join(mrow(k, v) for k, v in MIST)

BREAK = f'''
<section aria-labelledby="bsh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="bsh" style="margin: 0; font-size: 16px; font-weight: 600">By setup</h2><a href="PlaybookHome.dc.html" class="lbl" style="color: #A3AAB5">Open playbook</a></div>
{bhead("Setup")}{SETUP_ROWS}
</section>
<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px">
<section aria-labelledby="ssh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="ssh" style="margin: 0; font-size: 16px; font-weight: 600">By session</h2><span class="lbl">From each trade's open time</span></div>
{bhead("Session").replace(GRID, "grid-template-columns: minmax(0, 1fr) 50px 64px 82px minmax(60px, 1fr) 56px")}{SESS_ROWS.replace(GRID, "grid-template-columns: minmax(0, 1fr) 50px 64px 82px minmax(60px, 1fr) 56px")}
</section>
<section aria-labelledby="msh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="msh" style="margin: 0; font-size: 16px; font-weight: 600">Costliest mistakes</h2><span class="lbl">R from trades with each mistake tag</span></div>
{MIST_ROWS}
<p class="lbl" style="margin: 12px 0 0">A trade with two tags counts under both. {len(untagged)} of {n} trades had no mistake tagged.</p>
</section>
</div>'''

# ---- recent chart stories ----
RECENT = [  # (chart, pair, direction, result, col, line)
    (GU["E"], "GBPUSD", "Short", "+2.1R", PROFIT, "4H supply pullback"),
    (gallery(211, "long", True), "AUDUSD", "Long", "Running", "#A3AAB5", "London breakout"),
    (EJ["E"], "EURJPY", "Long", "Watched", "#A3AAB5", "Unsorted"),
    (gallery(221, "short", False), "GBPUSD", "Short", "\u22121.0R", LOSS, "4H supply pullback"),
    (gallery(241, "long", False), "EURJPY", "Long", "\u22121.0R", LOSS, "London breakout"),
    (XA["E"], "XAUUSD", "Long", "+2.0R", PROFIT, "4H supply pullback"),
]
def rcard(chart, pair, side, res, col, line):
    return f'''<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1; min-width: 0">
<span class="chart" style="display: block">{chart}</span>
<span style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px"><span style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{pair}<span style="font-size: 11px; font-weight: 600; color: #C9CED6; border: 1px solid #353B46; border-radius: 5px; padding: 0 6px; line-height: 1.6">{side}</span></span><span class="num" style="font-size: 13px; font-weight: 600; color: {col}">{res}</span></span>
<span class="lbl" style="font-size: 12px">{line}</span></a>'''
RECENT_HTML = f'''<section aria-labelledby="rch" style="display: flex; flex-direction: column; gap: 14px">
{h2('<span id="rch">Recent chart stories</span>', '<a href="Main.dc.html" class="meta" style="color: #ECEEF1">Trade log</a>')}
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px">{"".join(rcard(*r) for r in RECENT)}</div>
</section>'''

TODAY_CARD = f'''<section aria-labelledby="tdh" style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding: 18px 20px; border-radius: 14px; border: 1px solid #353B46; background: #15181E">
<div style="flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 4px">
<h2 id="tdh" style="margin: 0; font-size: 16px; font-weight: 600">1 trade has no charts yet</h2>
<span class="meta">EURUSD · Long · Mon 16 Nov · Main account · <span class="num" style="color: {PROFIT}; font-weight: 600">+0.6R</span> from MT5. No screenshot? Scroll back on your chart and take one now. It still counts.</span>
</div>
<div style="display: flex; gap: 8px; align-items: center">{DROP}<a href="Main.dc.html" class="btn btn-q">Daily log</a></div>
</section>'''

def period(sel):
    b = "".join(f'<button type="button" aria-pressed="{"true" if o == sel else "false"}" style="font: inherit; font-size: 14px; font-weight: {600 if o == sel else 500}; color: {"#0E1014" if o == sel else "#A3AAB5"}; background: {"#ECEEF1" if o == sel else "transparent"}; border: 0; border-radius: 8px; padding: 0 14px; min-height: 38px; cursor: pointer; white-space: nowrap">{o}</button>' for o in ("This week", "This month", "3 months"))
    return f'<div role="group" aria-label="Period" style="display: flex; gap: 2px; padding: 3px; border: 1px solid #353B46; border-radius: 11px">{b}</div>'

dashboard = f'''
{title_block("Dashboard", "November so far · 2 to 16 November · all figures in R", period("This month") + picker() + '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}
{TODAY_CARD}
{TILES}
{TREND}
{BREAK}
{RECENT_HTML}
<p class="meta" style="margin: 0; padding-top: 8px; border-top: 1px solid #1B1F27">This shows what happened. Your <a href="Review.dc.html">weekly review</a> on Saturday looks at why. Running, watched and not-filled trades stay out of every number. Win rate and expectancy appear once a row has 5 trades.</p>
'''

# Early state for the reference sheet
DASH_EARLY = state("Dashboard · fewer than 5 trades", T("Your numbers start after 5 trades") + M("2 trades logged so far. Until then this page shows your chart stories, and the numbers fill in as you go.") + B('<a href="NewStory.dc.html" class="btn btn-g">' + IC["plus"] + 'New chart story</a>'))

_g = '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 24px">\n'
assert states.count(_g) == 1
states = states.replace(_g, _g + DASH_EARLY + "\n")
