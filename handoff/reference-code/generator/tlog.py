# TRADE LOG: one list of everything you've recorded, any time. No day pattern.
# List view and grid view, filters, sort. Executed after log.py.

ICL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"></path><circle cx="3.5" cy="6" r="1"></circle><circle cx="3.5" cy="12" r="1"></circle><circle cx="3.5" cy="18" r="1"></circle></svg>'
ICG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"></rect><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"></rect><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"></rect><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"></rect></svg>'

def _svg(inner):
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'
FI = {
    "date": _svg('<rect x="3.5" y="5" width="17" height="15" rx="2"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path>'),
    "pair": _svg('<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"></path>'),
    "setup": _svg('<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"></path><path d="M5 17a3 3 0 0 1 3-3h11"></path>'),
    "dir": _svg('<path d="M8 20V4L4.5 7.5M16 4v16l3.5-3.5"></path>'),
    "tag": _svg('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.2 6.2a1.5 1.5 0 0 1-2.1 0z"></path><circle cx="8" cy="8" r="1.4"></circle>'),
    "status": _svg('<circle cx="12" cy="12" r="8.5"></circle><path d="M8.5 12.2l2.4 2.4 4.6-5"></path>'),
    "sort": _svg('<path d="M4 6h16M4 12h11M4 18h6"></path>'),
}
def fbtn2(icon, text, label):
    return (f'<button type="button" aria-haspopup="listbox" aria-label="{label}: {text}" style="font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #ECEEF1; background: transparent; border: 1px solid #353B46; border-radius: 10px; padding: 0 12px; min-height: 40px; cursor: pointer">'
            f'<span style="color: #A3AAB5; display: flex">{FI[icon]}</span>{text}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')

# (when, pair, direction or None, status, account, result, colour, charts, more, line, action)
ENTRIES = [
    ("Mon 16 Nov, 15:20", "AUDUSD", "Long", "Running", "Main account", "Open", "#A3AAB5", [gallery(211, "long", True)], "+1 chart", "Still open in MT5. When it closes you'll get one chance to add an after chart. Skipping is fine.", NONE()),
    ("Mon 16 Nov, 13:00", "EURJPY", "Long", "Watched", "No trade placed", "", "#A3AAB5", [EJ["E"]], "+1 chart", "Unsorted · Add an after chart any time if you want to see how it played out", NONE()),
    ("Mon 16 Nov, 11:10", "EURUSD", "Long", "Taken", "Main account", "+0.6R", PROFIT, [], "", "From MT5 #48231. No screenshot? Scroll back on your chart and take one now. It still counts.", NONE()),
    ("Mon 16 Nov, 09:45", "GBPUSD", "Short", "Taken", "Funded 100K", "+2.1R", PROFIT, [GU["E"], GU["A"]], "+3 charts", "4H supply pullback · Followed · Confident", NONE()),
    ("Mon 16 Nov, 07:30", "GBPUSD, XAUUSD", None, "Analysis", "Before trading", "", "#A3AAB5", [GU["D"], XA["4H"]], "", "“Dollar weak into New York. Only shorts on GBP below the weekly level.”", NONE()),
    ("Fri 13 Nov, 15:40", "GBPUSD", "Short", "Taken", "Funded 100K", "−1.0R", LOSS, [gallery(221, "short", False), gallery(222, "short", False)], "+2 charts", "4H supply pullback · Followed · Calm", NONE()),
    ("Fri 13 Nov, 10:05", "EURJPY", "Long", "Taken", "Challenge 50K", "−1.0R", LOSS, [gallery(241, "long", False), gallery(242, "long", False)], "+1 chart", "London breakout · Not followed · Moved stop, Chased entry", A(QNOTE)),
    ("Thu 12 Nov, 16:00", "NZDUSD", "Short", "Not filled", "Main account", "", "#A3AAB5", [gallery(231, "short", True)], "", "Your limit order never triggered · stays out of your results", A("", MORE_OPEN)),
    ("Thu 12 Nov, 14:30", "XAUUSD", "Long", "Taken", "Main account and Funded 100K", "+2.0R", PROFIT, [XA["E"], XA["A"]], "+3 charts", "4H supply pullback · Followed", NONE()),
    ("Thu 12 Nov, 11:00", "USDCAD", "Short", "Taken", "Main account", "−1.0R", LOSS, [gallery(251, "short", False), gallery(252, "short", False)], "+1 chart", "Unsorted · Not followed · Entered before close", NONE()),
    ("Thu 12 Nov, 09:20", "GBPJPY", "Short", "Taken", "Challenge 50K", "+1.7R", PROFIT, [gallery(201, "short", True), gallery(202, "short", True)], "+2 charts", "London breakout · Followed · numbers read from your chart", NONE()),
]
N_ALL = len(ENTRIES); N_LONG = sum(1 for e in ENTRIES if e[2] == "Long"); N_SHORT = sum(1 for e in ENTRIES if e[2] == "Short")

def showkey(d):
    return {"Long": "showLong", "Short": "showShort", None: "isAll"}[d]

def chip_or_type(d, status):
    return dchip(d) if d else f'<span style="font-size: 12px; font-weight: 600; color: #B9A6FF; border: 1px solid #4A3F75; border-radius: 6px; padding: 1px 8px; line-height: 1.5">Analysis</span>'

def lrow2(e):
    when, pair, d, status, acct, res, col, charts, more, line, action = e
    if charts:
        ch = "".join(f'<div class="chart" style="flex: 1; min-width: 0">{c}</div>' for c in charts)
        if len(charts) == 1:
            ch += '<div aria-hidden="true" style="flex: 1; min-width: 0"></div>'
    else:
        ch = ('<button type="button" style="flex: 2; min-width: 0; font: inherit; border: 1.5px dashed #4A515E; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: copy; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 500; aspect-ratio: 32 / 9">'
              + IC["img"] + '<span>Drop or paste charts here</span></button>')
    meta = f"{when} · {status} · {acct}" if status != "Analysis" else f"{when} · {acct}"
    return f'''<sc-if value="{{{{ {showkey(d)} }}}}" hint-placeholder-val="{{{{ true }}}}"><li style="list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; padding: 16px 20px; border-top: 1px solid #1B1F27">
<div style="flex: 1 1 280px; min-width: 0; display: flex; flex-direction: column; gap: 4px">
<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap"><a href="Story.dc.html" class="num" style="font-size: 17px; font-weight: 600; text-decoration: none">{pair}</a>{chip_or_type(d, status)}<span class="num" style="font-size: 15px; font-weight: 600; color: {col}">{res}</span></div>
<span class="meta">{meta}</span><span class="meta" style="color: #8C939F">{line}</span>
</div>
<div style="flex: 1 1 300px; min-width: 0; display: flex; gap: 8px; align-items: center">{ch}<span style="flex: none; font-size: 12px; color: #8C939F; width: 56px; text-align: center">{more}</span></div>
<div style="flex: 0 0 auto; display: flex; justify-content: flex-end; min-width: 170px">{action}</div>
</li></sc-if>'''

def gcard(e):
    when, pair, d, status, acct, res, col, charts, more, line, action = e
    top = (f'<span class="chart" style="display: block">{charts[-1]}</span>' if charts else
           '<button type="button" style="font: inherit; width: 100%; border: 1.5px dashed #4A515E; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: copy; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 500; aspect-ratio: 16 / 9">' + IC["img"] + '<span>Drop or paste charts</span></button>')
    tail = res if res else ("" if status == "Analysis" else status)
    tcol = col if res else "#A3AAB5"
    if status == "Analysis": gl = "Before trading"
    elif status == "Running": gl = "Running in MT5"
    elif status == "Not filled": gl = "Limit order never triggered"
    elif not charts: gl = "From MT5 · no charts yet"
    else: gl = line.split(" · ")[0]
    return f'''<sc-if value="{{{{ {showkey(d)} }}}}" hint-placeholder-val="{{{{ true }}}}"><li style="list-style: none; display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
{top}
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="display: inline-flex; align-items: center; gap: 8px; min-width: 0"><a href="Story.dc.html" style="font-size: 15px; font-weight: 600; text-decoration: none; color: #ECEEF1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{pair}</a>{chip_or_type(d, status)}</span><span class="num" style="font-size: 14px; font-weight: 600; color: {tcol}; white-space: nowrap">{tail}</span></div>
<span class="lbl" style="font-size: 12px">{when}</span>
<span class="lbl" style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{gl}</span>
</li></sc-if>'''

def opt2(key, label, inner, default_on):
    on = f'<button type="button" aria-pressed="true" aria-label="{label}" onClick="{{{{ set{key} }}}}" style="font: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 600; color: #0E1014; background: #ECEEF1; border: 0; border-radius: 7px; padding: 0 12px; min-height: 34px; cursor: pointer">{inner}</button>'
    off = f'<button type="button" aria-pressed="false" aria-label="{label}" onClick="{{{{ set{key} }}}}" style="font: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 7px; padding: 0 12px; min-height: 34px; cursor: pointer">{inner}</button>'
    return (f'<sc-if value="{{{{ is{key} }}}}" hint-placeholder-val="{{{{ {"true" if default_on else "false"} }}}}">{on}</sc-if>'
            f'<sc-if value="{{{{ not{key} }}}}" hint-placeholder-val="{{{{ {"false" if default_on else "true"} }}}}">{off}</sc-if>')

def seggroup(label, items):
    return f'<div role="group" aria-label="{label}" style="display: flex; gap: 2px; padding: 2px; border: 1px solid #353B46; border-radius: 10px">{"".join(items)}</div>'

def _dopt(o):
    return (f'<button type="button" role="option" onClick="{{{{ set{o} }}}}" style="font: inherit; font-size: 14px; text-align: left; display: flex; justify-content: space-between; align-items: center; color: #ECEEF1; background: transparent; border: 0; border-radius: 8px; padding: 0 12px; min-height: 38px; cursor: pointer">{o}'
            f'<sc-if value="{{{{ is{o} }}}}" hint-placeholder-val="{{{{ {"true" if o == "All" else "false"} }}}}"><span style="color: #ECEEF1; display: flex">{IC["check"]}</span></sc-if></button>')
DIRSEG = ('<span style="position: relative; display: inline-flex">'
          '<button type="button" aria-haspopup="listbox" aria-label="Direction" onClick="{{ toggleDir }}" style="font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #ECEEF1; background: transparent; border: 1px solid #353B46; border-radius: 10px; padding: 0 12px; min-height: 40px; cursor: pointer">'
          '<span style="color: #A3AAB5; display: flex">' + FI["dir"] + '</span>{{ dirLabel }}<span style="color: #8C939F; display: flex">' + IC["chev"] + '</span></button>'
          '<sc-if value="{{ dirOpen }}" hint-placeholder-val="{{ false }}"><div role="listbox" aria-label="Direction" style="position: absolute; z-index: 6; top: calc(100% + 6px); left: 0; width: 180px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px">'
          + "".join(_dopt(o) for o in ("All", "Long", "Short")) + '</div></sc-if></span>')
def VIEWSEG(grid_default):
    return seggroup("View", [opt2("List", "List view", ICL + "List", not grid_default), opt2("Grid", "Grid view", ICG + "Grid", grid_default)])

DATE_OPEN = '''<div role="listbox" aria-label="Date range" style="position: absolute; z-index: 6; top: calc(100% + 6px); left: 0; width: 240px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px">''' + "".join(
    f'<button type="button" role="option" aria-selected="{"true" if o == "All time" else "false"}" style="font: inherit; font-size: 14px; text-align: left; display: flex; justify-content: space-between; align-items: center; color: #ECEEF1; background: {"#1B1F27" if o == "All time" else "transparent"}; border: 0; border-radius: 8px; padding: 0 12px; min-height: 38px; cursor: pointer">{o}<span style="color: #8C939F; font-size: 12px">{h}</span></button>'
    for o, h in (("All time", "97"), ("This week", "5"), ("Last week", "6"), ("This month", "20"), ("Last 3 months", "51"), ("Pick dates…", ""))) + '</div>'

def filters(date_open=False):
    date = fbtn2("date", "All time", "Date")
    if date_open:
        date = '<span style="position: relative; display: inline-flex">' + date.replace('aria-haspopup="listbox" style="', 'aria-haspopup="listbox" aria-expanded="true" style="background: #1B1F27; ', 1) + DATE_OPEN + '</span>'
    return (f'<div role="group" aria-label="Filter" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">'
            + date + fbtn2("pair", "Pair", "Pair") + fbtn2("setup", "Setup", "Setup") + fbtn2("tag", "Tags", "Tags") + DIRSEG + fbtn2("status", "Status", "Status") + '</div>')

def toolbar(grid_default, date_open=False):
    return f'''<div style="display: flex; flex-direction: column; gap: 12px">
{filters(date_open)}
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap">
<span class="meta">{{{{ countText }}}}</span>
<div style="display: flex; gap: 8px; align-items: center">{fbtn2("sort", "Newest first", "Sort")}{VIEWSEG(grid_default)}</div>
</div></div>'''

USDCHF2 = USDCHF  # the one prompt that needs an answer sits above the list

LIST = f'<sc-if value="{{{{ isList }}}}" hint-placeholder-val="{{{{ LISTDEF }}}}"><ol aria-label="Trade log" style="margin: 0; padding: 0; display: flex; flex-direction: column; border-bottom: 1px solid #1B1F27">{"".join(lrow2(e) for e in ENTRIES)}</ol></sc-if>'
GRID = f'<sc-if value="{{{{ isGrid }}}}" hint-placeholder-val="{{{{ GRIDDEF }}}}"><ol aria-label="Trade log" style="margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px">{"".join(gcard(e) for e in ENTRIES)}</ol></sc-if>'

def tradelog(grid_default, date_open=False):
    return f'''
{title_block("Trade log", "Everything you've recorded, whenever you recorded it · MT5 synced 2 min ago", '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}
{toolbar(grid_default, date_open)}
{USDCHF2}
{LIST.replace("LISTDEF", "false" if grid_default else "true")}
{GRID.replace("GRIDDEF", "true" if grid_default else "false")}
<p class="lbl" style="margin: 0; text-align: center">Older entries load as you scroll</p>
'''

daily = tradelog(False)
daily_cal = tradelog(True, date_open=True)

def tl_script(default_view):
    return """
renderVals() {
  const st = this.state || {};
  const d = st.dir || "All", v = st.view || "%s";
  const L = d !== "Short", S = d !== "Long";
  const n = d === "All" ? %d : (d === "Long" ? %d : %d);
  return { showLong: L, showShort: S,
    isAll: d === "All", notAll: d !== "All", isLong: d === "Long", notLong: d !== "Long", isShort: d === "Short", notShort: d !== "Short",
    setAll: () => this.setState({ dir: "All", dirOpen: false }), setLong: () => this.setState({ dir: "Long", dirOpen: false }), setShort: () => this.setState({ dir: "Short", dirOpen: false }),
    dirLabel: d === "All" ? "Direction" : d, dirOpen: !!st.dirOpen, toggleDir: () => this.setState({ dirOpen: !st.dirOpen }),
    isList: v === "list", notList: v !== "list", isGrid: v === "grid", notGrid: v !== "grid",
    setList: () => this.setState({ view: "list" }), setGrid: () => this.setState({ view: "grid" }),
    countText: n + (n === 1 ? " entry" : " entries") + (d === "All" ? "" : " · " + d.toLowerCase() + " only") };
}
""" % (default_view, N_ALL, N_LONG, N_SHORT)
log_script = tl_script("list")
grid_script = tl_script("grid")

# New chart story: Analysis is a status, so pre-trade charts live in the same log
_sa = '{seg("Status", ["Taken", "Watched", "Not filled"], "Taken")}'
_old = seg("Status", ["Taken", "Watched", "Not filled"], "Taken")
_new = seg("Status", ["Taken", "Watched", "Not filled", "Analysis"], "Taken")
for _v in ("newstory", "newstory_typed"):
    assert globals()[_v].count(_old) == 1
    globals()[_v] = globals()[_v].replace(_old, _new).replace("Watched and Not filled stay out of your results.", "Watched, Not filled and Analysis stay out of your results.")

# Rename Log to Trade log wherever it is a destination
for _v in ("newstory", "newstory_typed", "dashboard", "startpage", "storypage"):
    globals()[_v] = globals()[_v].replace("Log</a>", "Trade log</a>")
storypage = storypage.replace('<span class="meta">Mon 16 Nov · story 2 of 4</span>', '<span class="meta">Mon 16 Nov, 09:45</span>')
states = states.replace("Log · MT5 stopped syncing", "Trade log · MT5 stopped syncing").replace("Log · brand new", "Trade log · brand new").replace(
    "Your first chart story shows up here, newest first. Days you don't trade never appear, so there's nothing to fall behind on.",
    "Record a trade, a watched setup or your analysis whenever it suits you. It all lands here, newest first.")
