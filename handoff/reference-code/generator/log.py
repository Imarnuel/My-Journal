# LOG (was Daily log): a running log, newest first, grouped by day. Only days with stories appear.
# Direction is a field, shown as a chip, never part of the name. Executed after dash.py.

def dchip(d):
    return f'<span style="font-size: 12px; font-weight: 600; color: #C9CED6; border: 1px solid #353B46; border-radius: 6px; padding: 1px 8px; line-height: 1.5">{d}</span>'

def lrow(pair, d, status, acct, result, rcol, charts, more, action, note, done=True):
    if charts:
        ch = "".join(f'<div class="chart" style="flex: 1; min-width: 0">{c}</div>' for c in charts)
        if len(charts) == 1:
            ch += '<div aria-hidden="true" style="flex: 1; min-width: 0"></div>'
    else:
        ch = ('<button type="button" style="flex: 2; min-width: 0; font: inherit; border: 1.5px dashed #4A515E; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: copy; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 500; aspect-ratio: 32 / 9">'
              + IC["img"] + '<span>Drop or paste charts here</span></button>')
    show = "showLong" if d == "Long" else "showShort"
    return f'''<sc-if value="{{{{ {show} }}}}" hint-placeholder-val="{{{{ true }}}}"><li style="list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 18px 28px; padding: 18px 20px; border-radius: 14px; border: 1px solid #1B1F27">
<div style="flex: 1 1 260px; min-width: 0; display: flex; gap: 16px; align-items: flex-start">
{status_icon("done" if done else "todo")}
<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap"><a href="Story.dc.html" class="num" style="font-size: 18px; font-weight: 600; text-decoration: none">{pair}</a>{dchip(d)}<span class="num" style="font-size: 15px; font-weight: 600; color: {rcol}">{result}</span></div>
<span class="meta">{status} · {acct}</span>{f'<span class="meta">{note}</span>' if note else ""}
</div></div>
<div style="flex: 1 1 300px; min-width: 0; display: flex; gap: 8px; align-items: center">{ch}<span style="flex: none; font-size: 12px; color: #8C939F; width: 56px; text-align: center">{more}</span></div>
<div style="flex: 0 0 auto; display: flex; justify-content: flex-end; min-width: 180px">{action}</div>
</li></sc-if>'''

def day(gid, title, rows, extra_top="", extra_bottom=""):
    return f'''<sc-if value="{{{{ {gid} }}}}" hint-placeholder-val="{{{{ true }}}}"><section aria-label="{title}" style="display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px"><h2 style="margin: 0; font-size: 16px; font-weight: 600">{title}</h2><span class="lbl">{{{{ {gid}n }}}}</span></div>
{extra_top}
<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">{"".join(rows)}</ol>
{extra_bottom}
</section></sc-if>'''

def week(label, right):
    return f'<div style="display: flex; align-items: center; gap: 14px; padding: 8px 0"><span class="lbl" style="white-space: nowrap; font-weight: 600; color: #A3AAB5">{label}</span><div aria-hidden="true" style="flex: 1; height: 1px; background: #252A33"></div>{right}</div>'

USDCHF = '''<sc-if value="{{ isAll }}" hint-placeholder-val="{{ true }}"><div style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 360px"><span style="font-size: 14px; font-weight: 600">USDCHF closed 8 seconds after opening</span><span class="meta">MT5 #48240 · −0.1R. Count it in your stats? If you leave this, it counts.</span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Count it</button><button type="button" class="btn btn-g">Leave it out</button></div></div></sc-if>'''

G16 = [
    lrow("EURUSD", "Long", "Taken", "Main account", "+0.6R", PROFIT, [], "", NONE(), "From MT5 #48231. No screenshot? Scroll back on your chart and take one now. It still counts.", done=False),
    lrow("GBPUSD", "Short", "Taken", "Funded 100K", "+2.1R", PROFIT, [GU["E"], GU["A"]], "+3 charts", NONE(), "4H supply pullback · Followed · Confident"),
    lrow("AUDUSD", "Long", "Running", "Main account", "Open", "#A3AAB5", [gallery(211, "long", True)], "+1 chart", NONE(), "Still open in MT5. When it closes you'll get one chance to add an after chart. Skipping is fine."),
    lrow("EURJPY", "Long", "Watched", "No trade placed", "Open", "#A3AAB5", [EJ["E"]], "+1 chart", NONE(), "Add an after chart any time if you want to see how it played out"),
]
G13 = [
    lrow("GBPUSD", "Short", "Taken", "Funded 100K", "−1.0R", LOSS, [gallery(221, "short", False), gallery(222, "short", False)], "+2 charts", NONE(), "4H supply pullback · Followed · Calm"),
    lrow("EURJPY", "Long", "Taken", "Challenge 50K", "−1.0R", LOSS, [gallery(241, "long", False), gallery(242, "long", False)], "+1 chart", A(QNOTE), "London breakout · Not followed · Moved stop, Chased entry"),
]
G12 = [
    lrow("XAUUSD", "Long", "Taken", "Main account and Funded 100K", "+2.0R", PROFIT, [XA["E"], XA["A"]], "+3 charts", NONE(), "4H supply pullback · Followed"),
    lrow("GBPJPY", "Short", "Taken", "Challenge 50K", "+1.7R", PROFIT, [gallery(201, "short", True), gallery(202, "short", True)], "+2 charts", NONE(), "London breakout · Followed · numbers read from your chart"),
    lrow("USDCAD", "Short", "Taken", "Main account", "−1.0R", LOSS, [gallery(251, "short", False), gallery(252, "short", False)], "+1 chart", NONE(), "Unsorted · Not followed · Entered before close"),
    lrow("NZDUSD", "Short", "Not filled", "Main account", "Open", "#A3AAB5", [gallery(231, "short", True)], "", A("", MORE_OPEN), "Your limit order never triggered · stays out of your results"),
]
GROUPS = {"g16": (G16, 3, 1), "g13": (G13, 1, 1), "g12": (G12, 1, 3)}  # rows, long count, short count

def fbtn(label, value):
    return (f'<button type="button" aria-haspopup="listbox" style="font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #ECEEF1; background: transparent; border: 1px solid #353B46; border-radius: 10px; padding: 0 12px; min-height: 40px; cursor: pointer">'
            f'<span style="color: #8C939F">{label}</span>{value}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

def dseg_opt(o):
    on = (f'<button type="button" aria-pressed="true" onClick="{{{{ set{o} }}}}" style="font: inherit; font-size: 14px; font-weight: 600; color: #0E1014; background: #ECEEF1; border: 0; border-radius: 7px; padding: 0 14px; min-height: 34px; cursor: pointer">{o}</button>')
    off = (f'<button type="button" aria-pressed="false" onClick="{{{{ set{o} }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 7px; padding: 0 14px; min-height: 34px; cursor: pointer">{o}</button>')
    return (f'<sc-if value="{{{{ is{o} }}}}" hint-placeholder-val="{{{{ {"true" if o == "All" else "false"} }}}}">{on}</sc-if>'
            f'<sc-if value="{{{{ not{o} }}}}" hint-placeholder-val="{{{{ {"false" if o == "All" else "true"} }}}}">{off}</sc-if>')

FILTERS = (f'<div role="group" aria-label="Filter stories" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">'
           + fbtn("Pair", "All") + fbtn("Setup", "All")
           + '<div role="group" aria-label="Direction" style="display: flex; gap: 2px; padding: 2px; border: 1px solid #353B46; border-radius: 10px">' + "".join(dseg_opt(o) for o in ("All", "Long", "Short")) + '</div>'
           + fbtn("Status", "All")
           + '</div>')

JUMP = '<button type="button" aria-haspopup="dialog" class="btn btn-g">' + IC["log"] + 'Jump to date</button>'

daily = f'''
{title_block("Log", "Newest first · MT5 synced 2 min ago", JUMP + '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}
{FILTERS}
{week("This week", '<span class="lbl" style="white-space: nowrap">Review on Saturday</span>')}
{day("g16", "Today · Mon 16 Nov", G16, ANALYSIS, USDCHF)}
{week("Week of 9 to 13 November", '<a href="Review.dc.html" class="meta" style="white-space: nowrap; color: #ECEEF1">Reviewed · Open review</a>')}
{day("g13", "Fri 13 Nov", G13)}
{day("g12", "Thu 12 Nov", G12)}
<p class="lbl" style="margin: 0; text-align: center">Earlier days load as you scroll</p>
'''

def _n(l, s):
    return f"(L ? {l} : 0) + (S ? {s} : 0)"
log_script = """
renderVals() {
  const d = (this.state && this.state.dir) || "All";
  const L = d !== "Short", S = d !== "Long";
  const word = (n) => n + (n === 1 ? " story" : " stories");
  const v = { showLong: L, showShort: S, isAll: d === "All", notAll: d !== "All", isLong: d === "Long", notLong: d !== "Long", isShort: d === "Short", notShort: d !== "Short",
    setAll: () => this.setState({ dir: "All" }), setLong: () => this.setState({ dir: "Long" }), setShort: () => this.setState({ dir: "Short" }) };
""" + "".join(f"  const n_{g} = {_n(l, s)}; v.{g} = n_{g} > 0; v.{g}n = word(n_{g});\n" for g, (_, l, s) in GROUPS.items()) + """  return v;
}
"""

# Jump to date: only days with stories are buttons
def cal_cell(d, n=0, missing=False, today=False, future=False):
    if d is None:
        return '<div></div>'
    if future or not n:
        col = "#4A515E" if future else "#8C939F"
        return f'<div style="min-height: 46px; border-radius: 8px; padding: 6px; box-sizing: border-box"><span style="font-size: 12px; color: {col}">{d}</span></div>'
    bg = "#ECEEF1" if today else "#1B1F27"; fg = "#0E1014" if today else "#ECEEF1"
    sub = f'<span class="num" style="font-size: 11px; color: {"#0E1014" if today else "#A3AAB5"}">{n} {"story" if n == 1 else "stories"}</span>'
    return f'<button type="button" aria-label="Jump to {d} November, {n} chart {"story" if n == 1 else "stories"}" style="font: inherit; text-align: left; display: flex; flex-direction: column; justify-content: space-between; min-height: 46px; border-radius: 8px; padding: 6px; box-sizing: border-box; border: 0; background: {bg}; color: {fg}; cursor: pointer"><span style="font-size: 12px; font-weight: 600">{d}</span>{sub}</button>'
NOVJ = {2: 3, 3: 1, 4: 2, 5: 2, 6: 1, 9: 1, 10: 2, 11: 3, 12: 4, 13: 2, 16: 4}
grid = "".join(cal_cell(d, NOVJ.get(d, 0) if d else 0, today=(d == 16), future=(d is not None and d > 16)) for d in cells)
JCAL = f"""<div role="dialog" aria-label="Jump to date" style="position: absolute; z-index: 6; top: calc(100% + 8px); right: 0; width: 380px; padding: 14px; box-sizing: border-box; background: #15181E; border: 1px solid #353B46; border-radius: 14px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 10px; text-align: left">
<div style="display: flex; justify-content: space-between; align-items: center"><button type="button" aria-label="Previous month" style="width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: pointer; display: flex; align-items: center; justify-content: center">{IC["back"]}</button><span style="font-size: 15px; font-weight: 600">November 2026</span><button type="button" aria-label="Next month" disabled style="width: 32px; height: 32px; border: 0; background: transparent; color: #4A515E; display: flex; align-items: center; justify-content: center">{IC["right"]}</button></div>
<div aria-hidden="true" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; font-size: 11px; color: #8C939F; text-align: center">{"".join(f"<span>{w}</span>" for w in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))}</div>
<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">{grid}</div>
<div style="font-size: 12px; color: #8C939F; padding-top: 8px; border-top: 1px solid #252A33">Shaded days have stories. Pick one to jump to it.</div>
</div>"""
JUMP_OPEN = '<div style="position: relative; display: inline-flex">' + JUMP.replace('class="btn btn-g">', 'aria-expanded="true" class="btn btn-g" style="background: #1B1F27">', 1) + JCAL + '</div>'
assert daily.count(JUMP) == 1
daily_cal = daily.replace(JUMP, JUMP_OPEN, 1)

# ---- Direction is a field, not part of the name ----
def dseg_field(label, opts, sel, src_html):
    return f'<div style="display: flex; flex-direction: column; gap: 6px"><span class="lbl">{label}</span><div style="min-height: 42px; display: flex; align-items: center">{seg(label, opts, sel)}</div><span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8C939F">{src_html}</span></div>'
_df = dfield("Direction", "Short", dot("#8C939F", 6) + "From your position tool")
_ds = dseg_field("Direction", ["Long", "Short"], "Short", dot("#8C939F", 6) + "From your position tool")
for _v in ("newstory", "newstory_typed"):
    assert globals()[_v].count(_df) == 1
    globals()[_v] = globals()[_v].replace(_df, _ds)

# ---- Rename Daily log to Log everywhere it is a destination ----
for _v in ("newstory", "newstory_typed", "dashboard", "startpage"):
    globals()[_v] = globals()[_v].replace("Daily log", "Log")
states = states.replace("Daily log · MT5 stopped syncing", "Log · MT5 stopped syncing")
_a = states.index('<section style="display: flex; flex-direction: column; gap: 12px"><span class="lbl">Daily log · no trades today</span>')
_b = states.index('</section>', _a) + len('</section>')
states = states[:_a] + state("Log · brand new", T("Your log starts here") + M("Your first chart story shows up here, newest first. Days you don't trade never appear, so there's nothing to fall behind on.") + B('<a href="NewStory.dc.html" class="btn btn-g">' + IC["plus"] + 'New chart story</a>')) + states[_b:]

# ---- Chart story page: name is the pair; direction is a chip and a field ----
def _rep(s, a, b):
    assert s.count(a) == 1, (a[:60], s.count(a)); return s.replace(a, b)
storypage = _rep(storypage, '{IC["back"]}Daily log</a><span class="meta">Story 3 of 8</span>'.replace('{IC["back"]}', IC["back"]), IC["back"] + 'Log</a><span class="meta">Mon 16 Nov · story 2 of 4</span>')
storypage = _rep(storypage, 'letter-spacing: -0.01em">GBPUSD short</h1>', 'letter-spacing: -0.01em; display: flex; align-items: center; gap: 12px">GBPUSD ' + dchip("Short") + '</h1>')
_firstrow = '<dl style="margin: 0; display: flex; flex-direction: column">'
storypage = _rep(storypage, _firstrow, _firstrow + row("Direction", seg("Direction", ["Long", "Short"], "Short"), "chart", raw=True))
