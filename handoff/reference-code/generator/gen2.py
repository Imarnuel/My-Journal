import json, os, sys
sys.path.insert(0, "/home/claude/gen")
from charts import GU, XA, EJ, RP, gallery, svg, ru_15, series
RP_ENTRY = svg(ru_15, "Sample 15 minute entry screenshot", upto=25, zone=(12, 17, "low"), pos=dict(i=24, side="long", rr=2.4, show_plan=True), total=42)

OUT = "/home/claude/journal/project"

# ---------- tokens ----------
# ground #0E1014 · surface #15181E · raised #1B1F27 · line #252A33 · strong line #353B46
# text #ECEEF1 · secondary #A3AAB5 · tertiary #8C939F
# profit #5BA2FF · loss #FF9A4D · attention #E8C766 · voice #B9A6FF
PROFIT = "#5BA2FF"; LOSS = "#FF9A4D"; ATTN = "#E8C766"; VOICE = "#B9A6FF"

FONTS = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&amp;display=swap" rel="stylesheet">'

CSS = """
*,*::before,*::after{font-family:Geist,system-ui,sans-serif}
button,input,textarea,select{font-family:Geist,system-ui,sans-serif}
body{margin:0;background:#0E1014}
a{color:#ECEEF1;text-underline-offset:3px}a:hover{color:#FFFFFF}
.btn{font:inherit;font-size:14px;font-weight:600;border-radius:10px;padding:0 16px;min-height:44px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;box-sizing:border-box;white-space:nowrap}
.btn-p{background:#ECEEF1;color:#0E1014;border:1px solid #ECEEF1}
.btn-p:hover{background:#FFFFFF;color:#0E1014}
.btn-g{background:transparent;color:#ECEEF1;border:1px solid #353B46}
.btn-g:hover{border-color:#4A515E;color:#FFFFFF}
.btn-q{background:transparent;color:#A3AAB5;border:1px solid transparent}
.btn-q:hover{color:#ECEEF1}
.num{font-family:Geist,sans-serif;font-variant-numeric:tabular-nums}
.nav a{display:flex;align-items:center;gap:12px;padding:0 12px;min-height:44px;border-radius:10px;color:#A3AAB5;text-decoration:none;font-size:14px;font-weight:500}
.nav a:hover{color:#ECEEF1;background:#15181E}
.nav a.on{color:#ECEEF1;background:#1B1F27}
.meta{font-size:13px;color:#A3AAB5}
.lbl{font-size:13px;color:#8C939F}
.chart{border-radius:8px;overflow:hidden;border:1px solid #252A33}
.ghost{font:inherit;font-size:14px;color:#ECEEF1;background:transparent;border:1px solid transparent;border-radius:8px;padding:0 10px;margin:0 -10px;min-height:34px;width:100%;box-sizing:border-box;text-align:left}
.ghost:hover{background:#1B1F27}
.ghost:focus{outline:none;border-color:#4A515E;background:#0E1014}
.ghost::placeholder{color:#8C939F}
.ghost-on{border-color:#4A515E;background:#0E1014}
.tagfield{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:5px 10px;cursor:pointer}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#ECEEF1;background:#232833;border-radius:6px;padding:3px 8px;line-height:1.4;white-space:nowrap}
.pill-x{display:inline-flex;color:#8C939F}
"""

def I(path, size=18, sw=1.8, fill="none"):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{path}</svg>'

IC = {
    "dash": I('<rect x="3" y="3" width="7" height="9" rx="1.5"></rect><rect x="14" y="3" width="7" height="5" rx="1.5"></rect><rect x="14" y="12" width="7" height="9" rx="1.5"></rect><rect x="3" y="16" width="7" height="5" rx="1.5"></rect>'),
    "log": I('<rect x="3" y="4" width="18" height="17" rx="2.5"></rect><path d="M3 9h18"></path><path d="M8 2v4"></path><path d="M16 2v4"></path>'),
    "book": I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"></path><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"></path>'),
    "review": I('<path d="M3 3v18h18"></path><path d="M7 15l4-4 3 3 5-6"></path>'),
    "replay": I('<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v5h5"></path>'),
    "lib": I('<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>'),
    "acct": I('<rect x="2" y="6" width="20" height="14" rx="2.5"></rect><path d="M2 10h20"></path>'),
    "mic": I('<rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10a7 7 0 0 0 14 0"></path><path d="M12 17v4"></path>', 16, 2),
    "check": I('<path d="M20 6L9 17l-5-5"></path>', 16, 2.4),
    "chev": I('<path d="M6 9l6 6 6-6"></path>', 16, 2),
    "right": I('<path d="M9 6l6 6-6 6"></path>', 16, 2),
    "back": I('<path d="M15 6l-6 6 6 6"></path>', 16, 2),
    "pen": I('<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>', 15, 1.8),
    "gear": I('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>'),
    "plus": I('<path d="M12 5v14"></path><path d="M5 12h14"></path>', 16, 2),
    "img": I('<rect x="3" y="3" width="18" height="18" rx="2.5"></rect><circle cx="9" cy="9" r="1.8"></circle><path d="M21 15l-5-5L5 21"></path>', 16, 1.8),
    "play": '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"></path></svg>',
}

def nav(active):
    items = [("Dashboard.dc.html", "dash", "Dashboard"), ("Main.dc.html", "log", "Trade log"), ("PlaybookHome.dc.html", "book", "Playbook"),
             ("Review.dc.html", "review", "Weekly review"),
             ("Accounts.dc.html", "acct", "Accounts"), ("Settings.dc.html", "gear", "Settings")]
    links = "".join(f'<a href="{h}" class="{"on" if l == active else ""}"{' aria-current="page"' if l == active else ''}>{IC[i]}<span>{l}</span></a>' for h, i, l in items)
    return f'''<aside style="flex: 1 1 216px; max-width: 100%; box-sizing: border-box; padding: 28px 16px; display: flex; flex-direction: column; gap: 32px">
<div style="display: flex; align-items: center; gap: 10px; padding: 0 12px">
<svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" rx="7" fill="#1B1F27"></rect><line x1="9" y1="7" x2="9" y2="19" stroke="#ECEEF1" stroke-width="1.5"></line><rect x="7" y="9" width="4" height="6" fill="#ECEEF1"></rect><line x1="17" y1="6" x2="17" y2="18" stroke="#6B7280" stroke-width="1.5"></line><rect x="15" y="10" width="4" height="5" fill="#6B7280"></rect></svg>
<span style="font-family: Geist, sans-serif; font-weight: 600; font-size: 16px">Journal</span>
</div>
<nav class="nav" aria-label="Main" style="display: flex; flex-direction: column; gap: 2px">{links}</nav>
</aside>'''

def page(title, h, body, active, script="renderVals() { return {}; }"):
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
<div style="min-height: {h}px; background: #0E1014; color: #ECEEF1; font-family: Geist, system-ui, sans-serif; font-size: 15px; line-height: 1.5; display: flex; flex-wrap: wrap">
{nav(active)}
<main style="flex: 999 1 560px; min-width: 0; box-sizing: border-box; padding: 40px 48px 72px; border-left: 1px solid #1B1F27">
<div style="max-width: 1040px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px">
{body}
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
</html>
'''

def title_block(h1, sub="", right=""):
    s = f'<p class="meta" style="margin: 0">{sub}</p>' if sub else ""
    return f'''<header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px 24px">
<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0">
<h1 style="margin: 0; font-family: Geist, sans-serif; font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em">{h1}</h1>{s}
</div>
<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">{right}</div>
</header>'''

def h2(t, right=""):
    return f'<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 style="margin: 0; font-size: 16px; font-weight: 600">{t}</h2>{right}</div>'

def dot(c, s=8):
    return f'<span aria-hidden="true" style="flex: none; width: {s}px; height: {s}px; border-radius: {s//2}px; background: {c}"></span>'

# ---------- account picker (scoped, flat checklist) ----------
ACCTS = [("Main account", "Live", False), ("Funded 100K", "Prop firm", False), ("Challenge 50K", "Prop firm", False),
         ("Demo account", "Demo", True), ("Backtesting", "Backtest", True)]

def picker(open_=False):
    btn = f'<button type="button" aria-haspopup="true" aria-expanded="{"true" if open_ else "false"}" class="btn btn-g" style="gap: 10px; font-weight: 500">{IC["acct"]}<span>3 accounts</span><span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>'
    if not open_:
        return f'<div style="position: relative; display: inline-flex">{btn}</div>'
    rows = []
    for i, (n, t, prac) in enumerate(ACCTS):
        on = not prac; hover = i == 1
        only = f'<button type="button" aria-label="Show only {n}" style="font: inherit; font-size: 12px; font-weight: 600; color: #ECEEF1; background: #252A33; border: 0; border-radius: 6px; padding: 0 10px; min-height: 28px; cursor: pointer">Only</button>' if hover else ""
        tag = '<span style="font-size: 12px; color: #8C939F">Practice</span>' if prac else ""
        rows.append(f'<div style="display: flex; align-items: center; gap: 8px; padding: 0 8px 0 10px; border-radius: 8px; background: {"#1B1F27" if hover else "transparent"}"><label style="flex: 1; display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer"><input type="checkbox" {"checked" if on else ""} style="width: 18px; height: 18px; margin: 0; accent-color: #ECEEF1"><span style="font-size: 14px">{n}</span>{tag}</label>{only}</div>')
    dd = f'''<fieldset style="position: absolute; z-index: 5; top: calc(100% + 8px); right: 0; width: 300px; margin: 0; box-sizing: border-box; background: #15181E; border: 1px solid #353B46; border-radius: 12px; padding: 6px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 1px; text-align: left">
<legend style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Accounts to include</legend>
{"".join(rows)}
<div style="height: 1px; background: #252A33; margin: 6px 4px"></div>
<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px">
<button type="button" style="font: inherit; font-size: 13px; color: #A3AAB5; background: transparent; border: 0; min-height: 40px; padding: 0 6px; cursor: pointer">Reset</button>
<a href="Accounts.dc.html" style="font-size: 13px; color: #A3AAB5; min-height: 40px; display: flex; align-items: center; padding: 0 6px">Manage accounts</a>
</div>
<p style="margin: 0; padding: 6px 10px 8px; font-size: 12px; color: #8C939F">This only changes the numbers. Examples from every account stay in your playbook.</p>
</fieldset>'''
    return f'<div style="position: relative; display: inline-flex">{btn}{dd}</div>'

# ================= 1. DAILY LOG =================
def status_icon(kind):
    if kind == "done":
        return f'<span aria-label="Done" style="flex: none; width: 28px; height: 28px; border-radius: 14px; background: rgba(91,162,255,0.16); color: #5BA2FF; display: flex; align-items: center; justify-content: center">{IC["check"]}</span>'
    if kind == "next":
        return '<span aria-label="Up next" style="flex: none; width: 28px; height: 28px; border-radius: 14px; border: 2px solid #ECEEF1; box-sizing: border-box"></span>'
    return '<span aria-label="To do" style="flex: none; width: 28px; height: 28px; border-radius: 14px; border: 2px solid #353B46; box-sizing: border-box"></span>'

def story(kind, pair, side, status, acct, result, rcol, entry, after, more, action, note=""):
    raised = kind == "next"
    bg = "#15181E" if raised else "transparent"
    bd = "#353B46" if raised else "#1B1F27"
    nt = f'<span class="meta">{note}</span>' if note else ""
    ph = lambda t: f'<div style="flex: 1; min-width: 0; border: 1px dashed #353B46; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #8C939F; aspect-ratio: 16 / 9">{t}</div>'
    entry_html = f'<div class="chart" style="flex: 1; min-width: 0">{entry}</div>' if entry else ph("No entry chart")
    after_html = f'<div class="chart" style="flex: 1; min-width: 0">{after}</div>' if after else '<div aria-hidden="true" style="flex: 1; min-width: 0"></div>'
    if not entry and not after:
        entry_html = '<button type="button" style="flex: 2; min-width: 0; font: inherit; border: 1.5px dashed #4A515E; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: copy; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 500; aspect-ratio: 32 / 9">' + IC["img"] + '<span>Drop or paste charts here</span></button>'
        after_html = ""
    return f'''<li style="list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 20px 28px; padding: 20px; border-radius: 14px; background: {bg}; border: 1px solid {bd}">
<div style="flex: 1 1 260px; min-width: 0; display: flex; gap: 16px; align-items: flex-start">
{status_icon(kind)}
<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
<div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap"><a href="Story.dc.html" class="num" style="font-size: 19px; font-weight: 600; text-decoration: none">{pair} {side}</a><span class="num" style="font-size: 15px; font-weight: 600; color: {rcol}">{result}</span></div>
<span class="meta">{status} · {acct}</span>{nt}
</div>
</div>
<div style="flex: 1 1 300px; min-width: 0; display: flex; gap: 8px; align-items: center">
{entry_html}{after_html}
<span style="flex: none; font-size: 12px; color: #8C939F; width: 56px; text-align: center">{more}</span>
</div>
<div style="flex: 0 0 auto; display: flex; justify-content: flex-end; min-width: 180px">{action}</div>
</li>'''

DAYNAV = '<div role="group" aria-label="Choose day" style="display: flex; align-items: center; border: 1px solid #353B46; border-radius: 10px"><button type="button" aria-label="Previous day" style="width: 40px; min-height: 42px; border: 0; background: transparent; color: #ECEEF1; cursor: pointer; display: flex; align-items: center; justify-content: center">' + IC["back"] + '</button><button type="button" aria-haspopup="dialog" style="font: inherit; font-size: 14px; font-weight: 500; color: #ECEEF1; background: transparent; border: 0; border-left: 1px solid #353B46; border-right: 1px solid #353B46; padding: 0 14px; min-height: 42px; cursor: pointer">Today</button><button type="button" aria-label="Next day" disabled style="width: 40px; min-height: 42px; border: 0; background: transparent; color: #4A515E; display: flex; align-items: center; justify-content: center">' + IC["right"] + '</button></div>'
READING = '<div role="status" style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #C9CED6; min-height: 44px"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#252A33" stroke-width="3"></circle><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#B9A6FF" stroke-width="3" stroke-linecap="round"></path></svg>Reading your note…</div>'
daily = f'''
{title_block("Daily log", "Monday 16 November · drop files, paste images or TradingView links anywhere on this page", DAYNAV + '<button type="button" class="btn btn-g">' + IC["img"] + 'Add screenshots</button>')}

<div role="status" style="display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-radius: 12px; background: #15181E; border: 1px solid #252A33">
<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#252A33" stroke-width="3"></circle><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#ECEEF1" stroke-width="3" stroke-linecap="round"></path></svg>
<div style="flex: 1; min-width: 0"><div style="font-size: 14px; font-weight: 600">Sorting 3 more screenshots</div><div class="meta">Reading pairs and timeframes. You can keep going, they'll slot into their stories.</div></div>
</div>

<section aria-labelledby="today" style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 10px">
{h2('<span id="today">6 chart stories today</span>', '<span class="meta">1 of 6 done</span>')}
<span class="meta">From 5 MT5 trades and 21 screenshots. Sorted by pair, timeframe and when each screenshot was taken.</span>
<span style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #C9CED6">{dot(PROFIT, 7)}2 more were after charts for earlier stories: USDCAD from Friday and the NZDUSD setup you watched Thursday.</span>
<div role="progressbar" aria-label="Stories done" aria-valuenow="1" aria-valuemin="0" aria-valuemax="6" style="height: 4px; border-radius: 2px; background: #1B1F27; overflow: hidden"><div style="width: 16.7%; height: 100%; background: #ECEEF1"></div></div>
</div>
<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
{story("done", "EURUSD", "long", "Taken", "Main account", "+0.6R", PROFIT, None, None, "", '<span class="meta">Saved</span>', "MT5 #48231 · no screenshots. Add them any time.")}
{story("next", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", '<button type="button" class="btn btn-p">' + IC["check"] + 'Save</button>', "Voice note added · 4H supply pullback · Followed · Calm")}
{story("todo", "GBPUSD", "short", "Taken", "Funded 100K", "+2.1R", PROFIT, GU["E"], GU["A"], "+3 charts", '<a href="Story.dc.html" class="btn btn-g">' + dot(ATTN) + 'Check 1 item</a>', "Voice note added · Location read from your chart")}
{story("todo", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", READING, "No MT5 match · went to your default account for screenshots")}
{story("todo", "AUDUSD", "long", "Running", "Main account", "Open", "#A3AAB5", gallery(211, "long", True), None, "+2 charts", '<button type="button" class="btn btn-g">' + IC["mic"] + 'Record</button>', "Still open in MT5 · the result fills in when it closes")}
{story("todo", "EURJPY", "long", "Watched", "No trade placed", "Open", "#A3AAB5", EJ["E"], None, "+2 charts", '<button type="button" class="btn btn-g">' + IC["mic"] + 'Record</button>', "Add an after chart any time to give it a result")}
</ol>
</section>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: 14px; font-weight: 600">3 stories still open from last week</span><span class="meta">Their charts and numbers are already in. Add a voice note if you remember, or save them as they are.</span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Save as they are</button><button type="button" class="btn btn-g">Open</button></div>
</section>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; gap: 12px; align-items: center; min-width: 0">{dot(ATTN)}<span style="font-size: 14px">1 screenshot didn't fit a story <span class="meta">· USDJPY 1H, taken 11:02, no trade or position tool on it</span></span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Skip</button><button type="button" class="btn btn-g">Place it</button></div>
</section>

<p class="meta" style="margin: 0">Stop whenever you like. Unfinished stories stay open here. One gentle reminder, then nothing.</p>
'''

# ================= 2. CHART STORY =================
def row(label, value, src=None, action=None, ph="", raw=False):
    mark = ''
    pass  # source marks removed: where a value came from isn't shown
    pass  # source marks removed: where a value came from isn't shown
    pass  # source marks removed: where a value came from isn't shown
    field = value if raw else f'<input class="ghost" type="text" aria-label="{label}" value="{value}" placeholder="{ph}">'
    act = action or ""
    return f'''<div style="display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; gap: 12px; align-items: center; min-height: 48px; border-top: 1px solid #1B1F27">
<dt class="lbl" style="margin: 0">{label}</dt><dd style="margin: 0; display: flex; align-items: center; gap: 10px; min-width: 0">{mark}<div style="flex: 1; min-width: 0; padding-left: 10px">{field}</div></dd><div>{act}</div></div>'''

CHECK = f'<button type="button" style="font: inherit; font-size: 13px; font-weight: 600; color: #0E1014; background: {ATTN}; border: 0; border-radius: 8px; padding: 0 12px; min-height: 32px; cursor: pointer">Check</button>'
ADD = '<button type="button" style="font: inherit; font-size: 13px; font-weight: 500; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 8px; padding: 0 12px; min-height: 32px; cursor: pointer">Add</button>'
mk = lambda t: f'<mark style="background: rgba(185,166,255,0.16); color: #ECEEF1; border-radius: 4px; padding: 0 2px">{t}</mark>'

XS = '<span class="pill-x" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12"></path><path d="M18 6L6 18"></path></svg></span>'
def pill(t, x=False, pre=""):
    p = f'<span style="color: #8C939F; font-weight: 500">{pre}</span>' if pre else ""
    return f'<span class="pill">{p}{t}{XS if x else ""}</span>'
def tags(label, pills, ph="Add"):
    inner = "".join(pills) if pills else f'<span style="font-size: 13px; color: #8C939F">{ph}</span>'
    return f'<button type="button" class="ghost tagfield" aria-label="{label}: edit tags">{inner}</button>'

def seg(label, opts, sel):
    b = "".join(f'<button type="button" aria-pressed="{"true" if o == sel else "false"}" style="flex: 1; font: inherit; font-size: 13px; font-weight: {600 if o == sel else 500}; color: {"#0E1014" if o == sel else "#A3AAB5"}; background: {"#ECEEF1" if o == sel else "transparent"}; border: 0; border-radius: 6px; padding: 0 10px; min-height: 30px; cursor: pointer; white-space: nowrap">{o}</button>' for o in opts)
    return f'<div role="group" aria-label="{label}" style="display: flex; gap: 2px; padding: 2px; background: #0E1014; border: 1px solid #252A33; border-radius: 8px">{b}</div>'
def pick(label, value):
    return f'<button type="button" class="ghost tagfield" aria-haspopup="listbox" aria-label="{label}: {value}" style="justify-content: space-between">{pill(value)}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>'
ARW = {"Bull": '<path d="M7 17L17 7"></path><path d="M9 7h8v8"></path>', "Bear": '<path d="M7 7l10 10"></path><path d="M17 9v8H9"></path>', "Range": '<path d="M5 12h14"></path><path d="M15 8l4 4-4 4"></path>'}
def arrow(d):
    return f'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ARW[d]}</svg>'
def bchip(tf, d):
    if d is None:
        return f'<button type="button" aria-label="{tf} bias: not set" aria-expanded="true" style="font: inherit; font-size: 13px; color: #A3AAB5; background: transparent; border: 1px dashed #4A515E; border-radius: 6px; padding: 0 9px; min-height: 30px; cursor: pointer; white-space: nowrap">{tf}<span style="color: #8C939F"> · set</span></button>'
    return f'<button type="button" aria-label="{tf} bias: {d}" style="font: inherit; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #ECEEF1; background: #232833; border: 0; border-radius: 6px; padding: 0 9px; min-height: 30px; cursor: pointer; white-space: nowrap"><span style="color: #8C939F">{tf}</span>{arrow(d)}<span style="font-weight: 500">{d}</span></button>'
BMENU = '<div role="menu" aria-label="4H bias" style="position: absolute; z-index: 4; top: calc(100% + 6px); left: 0; display: flex; gap: 2px; padding: 4px; background: #15181E; border: 1px solid #353B46; border-radius: 8px; box-shadow: 0 12px 28px rgba(0,0,0,0.45)">' + "".join(f'<button type="button" role="menuitem" style="font: inherit; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; border-radius: 6px; padding: 0 10px; min-height: 32px; cursor: pointer">{arrow(d)}{d}</button>' for d in ("Bull", "Bear", "Range")) + '</div>'
BIAS = ('<div style="display: flex; flex-direction: column; gap: 6px; padding: 7px 0">'
        '<div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center">' + bchip("Weekly", "Bear") + bchip("Daily", "Bear")
        + '<div style="position: relative; display: inline-flex">' + bchip("4H", None) + BMENU + '</div>'
        + '<button type="button" aria-label="Add a timeframe" style="font: inherit; font-size: 13px; color: #8C939F; background: transparent; border: 0; min-height: 30px; padding: 0 4px; cursor: pointer">+</button></div>'
        + '<span style="font-size: 12px; color: #8C939F">Weekly and Daily agree</span></div>')

TAGC = lambda t, on=False: f'<button type="button" aria-pressed="{"true" if on else "false"}" style="font: inherit; font-size: 13px; font-weight: 500; color: #ECEEF1; background: {"#2A303B" if on else "transparent"}; border: 1px solid {"#4A515E" if on else "#353B46"}; border-radius: 999px; padding: 0 12px; min-height: 34px; cursor: pointer">{t}</button>'
TRIG_EDIT = f'''<div style="border-top: 1px solid #1B1F27; padding: 7px 0 12px; display: flex; flex-direction: column; gap: 8px">
<div style="display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; gap: 12px; align-items: center"><span class="lbl">Tags</span><div style="display: flex; align-items: center; gap: 10px"><div style="flex: 1; padding-left: 10px"><div class="ghost ghost-on tagfield" style="cursor: text">{pill("Supply zone", x=True)}{pill("Break of structure", x=True)}<input type="text" aria-label="Add a tag" value="liq" style="flex: 1; min-width: 40px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 3px 0"></div></div></div><div></div></div>
<div role="listbox" aria-label="Matching tags" style="margin-left: 125px; display: flex; flex-direction: column; gap: 2px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,0.45)">
<button type="button" role="option" aria-selected="true" style="font: inherit; font-size: 13px; text-align: left; color: #ECEEF1; background: #1B1F27; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: space-between">{pill("Liquidity sweep")}<span style="font-size: 12px; color: #8C939F">used 14 times</span></button>
<button type="button" role="option" aria-selected="false" style="font: inherit; font-size: 13px; text-align: left; color: #A3AAB5; background: transparent; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer">Create {pill("liq")}</button>
</div>
</div>'''

storypage = f'''
<div style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px"><a href="Main.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; min-height: 32px">{IC["back"]}Daily log</a><span class="meta">Story 3 of 8</span></div>
{title_block("GBPUSD short", "Taken · Funded 100K · Mon 16 Nov, 09:45 to 13:20 · London · MT5 #48213", '<button type="button" class="btn btn-q" style="padding: 0 8px" aria-pressed="false">Pin as textbook</button><button type="button" class="btn btn-q" style="padding: 0 8px">Edit details</button><span class="num" style="font-size: 30px; font-weight: 600; color: #5BA2FF">+2.1R</span>')}
</div>

<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
<section aria-label="Charts" style="flex: 3 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><span class="lbl">5 charts, in your order</span><span class="lbl">Drag to reorder</span></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; cursor: grab"><div class="chart">{GU["W"]}</div><figcaption class="lbl" style="min-height: 20px">Weekly</figcaption></figure><figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; cursor: grab"><div class="chart">{GU["D"]}</div><figcaption class="lbl" style="min-height: 20px"></figcaption></figure><figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; cursor: grab"><div class="chart">{GU["4H"]}</div><figcaption class="lbl" style="min-height: 20px">4H</figcaption></figure>
</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 8px; cursor: grab"><div class="chart">{GU["E"]}</div><figcaption class="lbl" style="min-height: 20px">15m</figcaption></figure><figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 8px; cursor: grab"><div class="chart">{GU["A"]}</div><figcaption class="lbl" style="min-height: 20px">15m</figcaption></figure>
</div>
<div style="display: flex; flex-direction: column; gap: 12px; padding-top: 8px">
<div style="display: flex; align-items: center; gap: 12px">
<button type="button" aria-label="Play voice note" style="flex: none; width: 40px; height: 40px; border-radius: 20px; border: 0; background: #ECEEF1; color: #0E1014; display: flex; align-items: center; justify-content: center; cursor: pointer">{IC["play"]}</button>
<div><div style="font-size: 14px; font-weight: 600">Your voice note</div><div class="lbl">0:24 · recorded 21:10</div></div>
<button type="button" class="btn btn-q" style="margin-left: auto; min-height: 36px; padding: 0 8px; font-size: 13px">{IC["mic"]}Re-record</button>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.7; color: #C9CED6; max-width: 640px">"Weekly and daily both {mk("bearish")}. 4H pulled back into last week's {mk("supply zone")}. Waited for the fifteen minute {mk("break of structure")} and got in on the retest. Felt {mk("calm")}, didn't rush it. Left it alone and it hit target. Next time I want the same patience on Gold."</p>
</div>
<div style="display: flex; gap: 14px; align-items: center; padding: 14px 16px; border-radius: 12px; border: 1px solid #1B1F27"><div class="chart" style="flex: none; width: 120px">{GU["D"]}</div><div style="min-width: 0"><div class="lbl">Your analysis before this trade · Mon 16 Nov, 07:30</div><div style="font-size: 14px; color: #C9CED6">"Dollar weak into New York. Only shorts on GBP below the weekly level."</div></div></div>
<div style="display: flex; flex-direction: column; gap: 10px"><div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap"><span class="lbl">Trade details · from MT5 and your position tool</span></div><div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px 20px; padding: 16px 20px; border: 1px solid #1B1F27; border-radius: 12px"><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Entry</span><input class="ghost num" type="text" value="1.26840" style="font-weight: 600; font-size: 15px"></label><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Stop</span><input class="ghost num" type="text" value="1.27010" style="font-weight: 600; font-size: 15px"></label><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Target</span><input class="ghost num" type="text" value="1.26480" style="font-weight: 600; font-size: 15px"></label><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Exit</span><input class="ghost num" type="text" value="1.26482" style="font-weight: 600; font-size: 15px"></label><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Size</span><input class="ghost num" type="text" value="0.50 lots" style="font-weight: 600; font-size: 15px"></label><label style="display: flex; flex-direction: column; gap: 4px"><span class="lbl">Planned</span><input class="ghost num" type="text" value="1 : 2.1" style="font-weight: 600; font-size: 15px"></label></div></div>
</section>

<aside aria-labelledby="cap" style="flex: 2 1 340px; min-width: 0; position: sticky; top: 24px; background: #15181E; border: 1px solid #252A33; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap"><h2 id="cap" style="margin: 0; font-size: 16px; font-weight: 600">What we captured</h2><span class="lbl">Change anything that looks off</span></div>
<dl style="margin: 0; display: flex; flex-direction: column">
{row("Setup", pick("Setup", "4H supply pullback"), "voice", raw=True)}
{TRIG_EDIT}
{row("Plan", seg("Plan", ["Followed", "Not followed"], "Followed"), "voice", raw=True)}
{row("Headspace", pick("Headspace", "Confident"), "you", raw=True)}
{row("Mistakes", tags("Mistakes", [], "None mentioned · add any"), None, raw=True)}
{row("Lesson", "Same patience on Gold", "voice")}
</dl>
<a href="Main.dc.html" class="btn btn-p" style="width: 100%; margin-top: 4px">Done</a>
<span class="lbl" style="text-align: center">Changes save as you make them</span>
</aside>
</div>
'''

# ================= 3. PLAYBOOK =================
def bars(title, a_lbl, a_val, a_pct, b_lbl, b_val, b_pct, n, early=False):
    flag = f'<span style="font-size: 12px; color: {ATTN}">Early signal</span>' if early else f'<span class="lbl">{n}</span>'
    def bar(lbl, val, pct, col):
        return f'''<div style="display: grid; grid-template-columns: 180px minmax(0, 1fr) 72px; gap: 14px; align-items: center">
<span class="meta">{lbl}</span>
<div style="height: 10px; border-radius: 5px; background: #1B1F27; overflow: hidden"><div style="width: {pct}%; height: 100%; border-radius: 5px; background: {col}"></div></div>
<span class="num" style="font-size: 14px; font-weight: 600; text-align: right">{val}</span></div>'''
    return f'''<div style="display: flex; flex-direction: column; gap: 12px; padding: 20px 0; border-top: 1px solid #1B1F27">
<div style="display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: baseline"><span style="font-weight: 600">{title}</span>{flag}</div>
{bar(a_lbl, a_val, a_pct, "#ECEEF1")}
{bar(b_lbl, b_val, b_pct, "#4A515E")}
</div>'''

def spark(rs, w=140, h=34, label="Cumulative R"):
    pts = []; c = 0
    for r in rs:
        c += r; pts.append(c)
    lo = min(0, min(pts)); hi = max(0, max(pts)); rng = (hi - lo) or 1
    xy = " ".join(f"{i * (w - 4) / (len(pts) - 1) + 2:.1f},{h - 3 - (v - lo) / rng * (h - 6):.1f}" for i, v in enumerate(pts))
    zero = h - 3 - (0 - lo) / rng * (h - 6)
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{label}, last {len(rs)} trades, ending at {c:+.1f}R">'
            f'<line x1="2" y1="{zero:.1f}" x2="{w - 2}" y2="{zero:.1f}" stroke="#353B46" stroke-dasharray="2 3"></line>'
            f'<polyline points="{xy}" fill="none" stroke="#ECEEF1" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></polyline></svg>')

R_SUPPLY = [2.1, -1, 2.0, -1, -1, 1.8, 2.2, -1, 2.4, -1, -1, 2.0, -1, 1.9, -1, 2.3, -1, -1, 2.1, -1]
R_LONDON = [1.5, -1, -1, 1.2, 1.8, -1, -1, 1.6, -1, 1.4, -1, 0.9]

SETUP_TABS_SCRIPT = """
renderVals() {
  const t = (this.state && this.state.tab) || 'ex';
  return { isEx: t === 'ex', isPat: t === 'pat', isLes: t === 'les',
    goEx: () => this.setState({ tab: 'ex' }), goPat: () => this.setState({ tab: 'pat' }), goLes: () => this.setState({ tab: 'les' }) };
}
"""
def RULE_GROUP(name, sub, rules):
    sb = f'<span class="lbl">{sub}</span>' if sub else ""
    items = "".join(f'<li>{r}</li>' for r in rules)
    return f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 10px 0; border-top: 1px solid #1B1F27"><div style="display: flex; justify-content: space-between; gap: 8px"><span style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #A3AAB5">{name}</span>{sb}</div><ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; color: #C9CED6; font-size: 14px">{items}</ul></div>'

def htf_strip(seed, bear):
    d = -1 if bear else 1
    mini = lambda k, segs: f'<figure style="margin: 0; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px"><div class="chart">{svg(series(seed * 10 + k, segs), "Higher timeframe chart")}</div><figcaption style="font-size: 11px; color: #8C939F">{("Weekly", "Daily", "4H")[k]}</figcaption></figure>'
    return ('<div style="display: flex; gap: 6px">' + mini(0, [(24, 0.45 * d), (8, -0.3 * d)]) + mini(1, [(18, 0.5 * d), (10, -0.5 * d), (4, 0.2 * d)])
            + mini(2, [(14, 0.55 * d), (14, -0.6 * d), (6, 0.1 * d)]) + '</div>')

def ex(svgs, pair, meta, r, col, tag="", seed=1, bear=True):
    t = f'<span style="font-size: 12px; color: #A3AAB5">{tag}</span>' if tag else ""
    return f'''<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1; padding: 12px; border: 1px solid #1B1F27; border-radius: 12px">
{htf_strip(seed, bear)}
<div class="chart">{svgs}</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-top: 2px"><span style="font-size: 14px; font-weight: 600">{pair}</span><span class="num" style="font-size: 14px; font-weight: 600; color: {col}">{r}</span></div>
<div style="display: flex; justify-content: space-between; gap: 8px"><span class="lbl">{meta}</span>{t}</div>
</a>'''

def tab(t, n, on=False):
    return f'<button type="button" aria-pressed="{"true" if on else "false"}" style="font: inherit; font-size: 14px; font-weight: {600 if on else 500}; color: {"#ECEEF1" if on else "#A3AAB5"}; background: transparent; border: 0; border-bottom: 2px solid {"#ECEEF1" if on else "transparent"}; padding: 0 2px; min-height: 40px; cursor: pointer">{t} <span style="color: #8C939F; font-weight: 500">{n}</span></button>'

def PAT(h, a, av, b, bv, early=False):
    flag = f'<span title="Early signal: few trades so far" style="display: inline-flex">{dot(ATTN, 7)}</span>' if early else ""
    def br(l, v, c):
        return f'<div style="display: grid; grid-template-columns: 112px minmax(0, 1fr) 36px; gap: 10px; align-items: center"><span style="font-size: 12px; color: #A3AAB5">{l}</span><div style="height: 6px; border-radius: 3px; background: #1B1F27"><div style="width: {v}%; height: 100%; border-radius: 3px; background: {c}"></div></div><span class="num" style="font-size: 13px; font-weight: 600; text-align: right">{v}%</span></div>'
    return f'<div style="display: flex; flex-direction: column; gap: 8px; padding: 14px 0; border-top: 1px solid #1B1F27"><div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{h}{flag}</div>{br(a, av, "#ECEEF1")}{br(b, bv, "#4A515E")}</div>'
statline = lambda v, l: f'<div style="display: flex; flex-direction: column; gap: 2px"><span class="num" style="font-size: 22px; font-weight: 600">{v}</span><span class="lbl">{l}</span></div>'

playbook = f'''
<div style="display: flex; flex-direction: column; gap: 16px">
<a href="PlaybookHome.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; align-self: flex-start; min-height: 32px">{IC["back"]}Playbook</a>
{title_block("4H supply pullback", "Example setup. Yours replace it on day one.", picker(True))}
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px 48px; padding-bottom: 8px; border-bottom: 1px solid #1B1F27; padding-bottom: 28px">
{statline("+0.5R", "Expectancy per trade")}
{statline("47%", "Win rate")}
{statline("+2.2R", "Average winner")}
{statline("34", "Trades taken")}
{statline("9", "Watched")}
<div style="display: flex; flex-direction: column; gap: 2px">{spark(R_SUPPLY)}<span class="lbl">Last 20 trades, in R</span></div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start">
<section aria-label="Examples, patterns and lessons" style="flex: 2 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 20px">
<div role="tablist" aria-label="Setup sections"><sc-if value="{{{{ isEx }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: inline-flex; gap: 2px; padding: 3px; background: #15181E; border: 1px solid #252A33; border-radius: 11px"><button type="button" role="tab" aria-selected="true" onClick="{{{{ goEx }}}}" style="font: inherit; font-size: 14px; font-weight: 600; color: #0E1014; background: #ECEEF1; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Examples<span style="font-weight: 500; color: #4A515E">45</span></button><button type="button" role="tab" aria-selected="false" onClick="{{{{ goPat }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Patterns<span style="font-weight: 500; color: #8C939F">3</span></button><button type="button" role="tab" aria-selected="false" onClick="{{{{ goLes }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Lessons<span style="font-weight: 500; color: #8C939F">3</span></button></div></sc-if><sc-if value="{{{{ isPat }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: inline-flex; gap: 2px; padding: 3px; background: #15181E; border: 1px solid #252A33; border-radius: 11px"><button type="button" role="tab" aria-selected="false" onClick="{{{{ goEx }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Examples<span style="font-weight: 500; color: #8C939F">45</span></button><button type="button" role="tab" aria-selected="true" onClick="{{{{ goPat }}}}" style="font: inherit; font-size: 14px; font-weight: 600; color: #0E1014; background: #ECEEF1; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Patterns<span style="font-weight: 500; color: #4A515E">3</span></button><button type="button" role="tab" aria-selected="false" onClick="{{{{ goLes }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Lessons<span style="font-weight: 500; color: #8C939F">3</span></button></div></sc-if><sc-if value="{{{{ isLes }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: inline-flex; gap: 2px; padding: 3px; background: #15181E; border: 1px solid #252A33; border-radius: 11px"><button type="button" role="tab" aria-selected="false" onClick="{{{{ goEx }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Examples<span style="font-weight: 500; color: #8C939F">45</span></button><button type="button" role="tab" aria-selected="false" onClick="{{{{ goPat }}}}" style="font: inherit; font-size: 14px; font-weight: 500; color: #A3AAB5; background: transparent; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Patterns<span style="font-weight: 500; color: #8C939F">3</span></button><button type="button" role="tab" aria-selected="true" onClick="{{{{ goLes }}}}" style="font: inherit; font-size: 14px; font-weight: 600; color: #0E1014; background: #ECEEF1; border: 0; border-radius: 8px; padding: 0 16px; min-height: 38px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px">Lessons<span style="font-weight: 500; color: #4A515E">3</span></button></div></sc-if></div>
<sc-if value="{{{{ isEx }}}}" hint-placeholder-val="{{{{ true }}}}">
<div style="display: flex; flex-direction: column; gap: 20px">
<div role="group" aria-label="Filter examples" style="display: flex; gap: 20px; flex-wrap: wrap">{tab("All", 45, True)}{tab("Winners", 16)}{tab("Losers", 18)}{tab("Watched", 9)}{tab("Not filled", 2)}{tab("Textbook", 3)}</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px">
{ex(gallery(101, "short", True), "GBPUSD", "16 Nov · London", "+2.1R", PROFIT, "Textbook", seed=101)}
{ex(gallery(102, "short", True), "EURUSD", "12 Nov · London", "+2.0R", PROFIT, seed=102)}
{ex(gallery(103, "short", False), "GBPJPY", "11 Nov · Asia", "−1.0R", LOSS, seed=103)}
{ex(gallery(104, "short", True), "AUDUSD", "10 Nov · New York", "+1.8R", PROFIT, seed=104)}
{ex(gallery(105, "short", False), "XAUUSD", "6 Nov · London", "−1.0R", LOSS, seed=105)}
{ex(gallery(106, "short", True), "EURJPY", "5 Nov · London", "Watched", "#A3AAB5", "Not taken", seed=106)}
</div>
<button type="button" class="btn btn-g" style="align-self: center">Show all 45</button>
</div>
</sc-if>
<sc-if value="{{{{ isPat }}}}" hint-placeholder-val="{{{{ false }}}}">
<section aria-label="Patterns" style="display: flex; flex-direction: column; gap: 4px">
<span class="lbl">Win rate, split by things recorded on every trade</span>
{PAT("Session", "London", 63, "Asia", 22)}
{PAT("Plan", "Followed", 54, "Not followed", 17, True)}
{PAT("Stop", "Kept or tightened", 56, "Widened", 14, True)}
<span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8C939F; padding-top: 6px">{dot(ATTN, 7)}Early signal, few trades</span>
</section>
</sc-if>
<sc-if value="{{{{ isLes }}}}" hint-placeholder-val="{{{{ false }}}}">
<section aria-label="Lessons" style="display: flex; flex-direction: column">
<span class="lbl">From your reflections on stories in this setup</span>
<ul style="margin: 8px 0 0; padding: 0">
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Same patience on Gold"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">GBPUSD · 16 Nov</a></li>
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Wait for the candle to close before entering"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">GBPJPY · 11 Nov</a></li>
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Skip it when the zone has been tested twice"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">XAUUSD · 6 Nov</a></li>
</ul>
</section>
</sc-if>
</section>

<aside style="flex: 1 1 280px; min-width: 0; display: flex; flex-direction: column; gap: 36px">
<section aria-labelledby="rules" style="display: flex; flex-direction: column; gap: 14px">
{h2('<span id="rules">Rules</span>', '<a href="SetupEdit.dc.html" class="btn btn-q" style="min-height: 32px; padding: 0 4px">Edit</a>')}
{RULE_GROUP("Context", "Higher timeframes", ["Daily trend is bearish", "4H pulls back into a marked supply zone"])}
{RULE_GROUP("Entry", "Lower timeframe", ["15m breaks structure inside the zone", "Enter on the retest"])}
{RULE_GROUP("Exit", "", ["Stop above the zone", "Target 2R or more"])}
</section>
</aside>
</div>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; gap: 12px; align-items: flex-start; flex: 1 1 400px; min-width: 0">{dot(VOICE)}<div><div style="font-size: 14px; font-weight: 600">4 unsorted chart stories look alike</div><div class="meta">Daily bullish, Asian low swept, then a 15m break of structure.</div></div></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Not now</button><a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a></div>
</section>
'''

# ================= 4. WEEKLY REVIEW =================
def step(n, title, body, last=False, done=False):
    circ = (f'<span style="width: 28px; height: 28px; border-radius: 14px; background: rgba(91,162,255,0.16); color: #5BA2FF; display: flex; align-items: center; justify-content: center">{IC["check"]}</span>' if done
            else f'<span class="num" style="width: 28px; height: 28px; border-radius: 14px; border: 1px solid #353B46; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #A3AAB5">{n}</span>')
    line = "" if last else '<span aria-hidden="true" style="flex: 1; width: 1px; background: #252A33; margin-top: 8px"></span>'
    return f'''<li style="list-style: none; display: flex; gap: 20px">
<div style="flex: none; display: flex; flex-direction: column; align-items: center">{circ}{line}</div>
<div style="flex: 1; min-width: 0; padding: 2px 0 40px; display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 13px; font-weight: 600; color: #A3AAB5">{title}</h2>
{body}
</div></li>'''

def rule_opt(t, sub, on=False):
    return f'''<label style="flex: 1 1 220px; display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 12px; border: 1px solid {"#4A515E" if on else "#252A33"}; background: {"#15181E" if on else "transparent"}; cursor: pointer">
<input type="radio" name="rule" {"checked" if on else ""} style="margin: 3px 0 0; width: 18px; height: 18px; accent-color: #ECEEF1">
<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 600">{t}</span><span class="meta">{sub}</span></span></label>'''

big = lambda t: f'<p style="margin: 0; font-size: 21px; font-weight: 600; line-height: 1.35; letter-spacing: -0.005em">{t}</p>'
WORK_THUMBS = '<div style="display: flex; gap: 10px; flex-wrap: wrap">' + "".join(f'<a href="Story.dc.html" class="chart" style="display: block; width: 140px">{gallery(sd, "short", w)}</a>' for sd, w in ((101, True), (102, True), (104, True), (108, True), (109, False))) + '</div>'
thumbs3 = "".join(f'<a href="Story.dc.html" class="chart" style="display: block; width: 140px">{gallery(s, "short", False)}</a>' for s in (103, 105, 107))

NOTES = '<ul style="margin: 0; padding: 0; max-width: 640px">' + "".join(f'<li style="list-style: none; display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid #1B1F27"><span style="font-size: 15px">"{t}"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F; white-space: nowrap">{m}</a></li>' for t, m in (("Same patience on Gold", "GBPUSD · 16 Nov"), ("Wait for the candle to close before entering", "GBPJPY · 11 Nov"))) + '</ul>'
DAYS_R = (("Mon", 2.1), ("Tue", 1.6), ("Wed", -1.0), ("Thu", 2.7), ("Fri", -2.0))
def week_bars():
    mx = max(abs(v) for _, v in DAYS_R)
    cols = []
    for d, v in DAYS_R:
        hpx = round(abs(v) / mx * 56)
        up = v >= 0
        bar = f'<div style="height: {hpx}px; width: 100%; max-width: 44px; border-radius: 4px; background: {PROFIT if up else LOSS}"></div>'
        top = f'<div style="height: 56px; display: flex; align-items: flex-end; justify-content: center">{bar if up else ""}</div>'
        bot = f'<div style="height: 56px; display: flex; align-items: flex-start; justify-content: center">{"" if up else bar}</div>'
        cols.append(f'<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0"><span class="num" style="font-size: 12px; font-weight: 600; color: {PROFIT if up else LOSS}; height: 18px">{v:+.1f}R</span>{top}<div style="height: 1px; width: 100%; background: #353B46"></div>{bot}<span class="lbl" style="margin-top: 4px">{d}</span></div>')
    return f'<div role="img" aria-label="R by day: ' + ", ".join(f"{d} {v:+.1f}R" for d, v in DAYS_R) + f'" style="display: flex; gap: 10px; max-width: 420px; margin-top: 8px">' + "".join(cols) + '</div>'
WEEK = '<div style="display: flex; flex-wrap: wrap; gap: 20px 44px">' + statline('<span style="color: #5BA2FF">+3.4R</span>', "Net") + statline("11", "Trades") + statline("8 of 11", "On plan") + statline("4", "Watched setups") + '</div>' + week_bars()
review = f'''
{title_block("Week of 9 to 13 November", "About 10 minutes · 6 steps", picker())}

<ol style="margin: 0; padding: 0">
{step(1, "Your week", WEEK, done=True)}
{step(2, "Biggest leak", big("Off-plan trades cost you 4.0R. All 3 came within an hour of a loss.") + f'<p class="meta" style="margin: 0">Your 8 on-plan trades made +7.4R. You also watched 4 setups without taking them. In your notes, you said 3 of them would have hit target.</p><div style="display: flex; gap: 10px; flex-wrap: wrap">{thumbs3}</div><span style="font-size: 12px; color: {ATTN}">Early signal · 3 trades. Worth watching before acting on it.</span>')}
{step(3, "What's working", big("Calm London entries made +6.2R across 5 trades.") + '<p class="meta" style="margin: 0">4 of the 5 won. All were your 4H supply pullback, entered after the 15m break of structure.</p>' + WORK_THUMBS)}
{step(4, "Notes you made", NOTES)}
{step(5, "Last week's rule", big("\"No trades after 2pm on Friday.\" You kept it.") + '<p class="meta" style="margin: 0">No late Friday trades this week. Before the rule, they averaged −1.5R a week. Keep it, or let it go?</p><div style="display: flex; gap: 8px; flex-wrap: wrap"><button type="button" class="btn btn-g">Make it permanent</button><button type="button" class="btn btn-q">Let it go</button></div>')}
{step(6, "Next week's rule", '<p style="margin: 0; font-size: 15px">Pick one. At your next review you\'ll see whether it helped.</p><div style="display: flex; flex-wrap: wrap; gap: 10px">' + rule_opt("After a loss, wait an hour", "Targets this week's leak", True) + rule_opt("Take every setup that meets the rules", "Targets the 4 setups you watched but didn\'t take") + rule_opt("Write my own", "We\'ll ask if you kept it next week") + '</div>' + '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin-top: 8px"><button type="button" class="btn btn-p">Finish review</button><span class="lbl">Anything from this week still without charts closes as it is. Its numbers stay.</span></div>', last=True)}
</ol>

'''

# ================= 5. REPLAY =================
replay_seg = "".join(f'<span style="flex: 1; height: 4px; border-radius: 2px; background: {c}"></span>' for c in ["#ECEEF1", "#ECEEF1", "#8C939F"] + ["#252A33"] * 5)
replay = f'''
<div style="display: flex; flex-direction: column; gap: 20px">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px">
<a href="Review.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; min-height: 32px">{IC["back"]}End replay</a>
<span class="meta">3 of 8</span>
</div>
<div aria-hidden="true" style="display: flex; gap: 4px">{replay_seg}</div>
</div>

{title_block("Would you take this?", "From all your accounts, practice included. Pair and outcome are shown after you answer.")}

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<figure style="margin: 0; display: flex; flex-direction: column; gap: 8px"><div class="chart">{RP["D"]}</div><figcaption class="lbl">Daily</figcaption></figure>
<figure style="margin: 0; display: flex; flex-direction: column; gap: 8px">
<sc-if value="{{{{ answered }}}}" hint-placeholder-val="{{{{ false }}}}"><div class="chart">{RP["Eshown"]}</div></sc-if>
<sc-if value="{{{{ waiting }}}}" hint-placeholder-val="{{{{ true }}}}"><div class="chart">{RP_ENTRY}</div></sc-if>
<figcaption class="lbl">15m · your entry screenshot. Your after chart is shown once you answer.</figcaption></figure>
</div>

<sc-if value="{{{{ waiting }}}}" hint-placeholder-val="{{{{ true }}}}">
<div style="display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 8px 0">
<div role="group" aria-label="Your call" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center">
<button type="button" class="btn btn-g" style="min-width: 140px; min-height: 52px; font-size: 15px" onClick="{{{{ pickLong }}}}">Long</button>
<button type="button" class="btn btn-g" style="min-width: 140px; min-height: 52px; font-size: 15px" onClick="{{{{ pickShort }}}}">Short</button>
<button type="button" class="btn btn-g" style="min-width: 140px; min-height: 52px; font-size: 15px" onClick="{{{{ pickSkip }}}}">Skip it</button>
</div>
<span class="meta">It's practice. Go with your first read.</span>
</div>
</sc-if>

<sc-if value="{{{{ answered }}}}" hint-placeholder-val="{{{{ false }}}}">
<section aria-live="polite" style="display: flex; flex-direction: column; gap: 16px; padding: 22px 24px; border-radius: 14px; background: #15181E; border: 1px solid #252A33">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: baseline">
<span style="font-size: 20px; font-weight: 600">{{{{ verdict }}}}</span>
<span class="num" style="font-size: 20px; font-weight: 600; color: #5BA2FF">Long · hit target · +2.4R</span>
</div>
<p style="margin: 0; color: #C9CED6">EURUSD, 3 November. A 4H demand pullback you took live. Your note then: "Daily bullish, waited for the 15m to break structure."</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; border-top: 1px solid #252A33; padding-top: 16px">
<span class="meta">This setup: {{{{ accuracy }}}}. One chart proves nothing; the trend over weeks does.</span>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q" onClick="{{{{ reset }}}}">Try again</button><button type="button" class="btn btn-p">Next chart{IC["right"]}</button></div>
</div>
</section>
</sc-if>
'''
replay_script = """
renderVals() {
  const pick = this.state && this.state.pick;
  const set = (p) => () => this.setState({ pick: p });
  const verdict = pick === 'long' ? 'You said long. It played out in your favour.' : pick === 'short' ? 'You said short. Price went the other way.' : 'You skipped it. This one went on to work.';
  return {
    answered: !!pick, waiting: !pick, verdict: verdict,
    accuracy: pick === 'long' ? 'your read matched the outcome on 10 of 14 charts' : 'your read matched the outcome on 9 of 14 charts',
    pickLong: set('long'), pickShort: set('short'), pickSkip: set('skip'),
    reset: () => this.setState({ pick: null })
  };
}
"""

# ================= 6. ACCOUNTS =================
def arow(name, typ, prac, conn, health, badge=""):
    tag = '<span style="font-size: 12px; color: #A3AAB5; border: 1px solid #353B46; border-radius: 999px; padding: 1px 8px; margin-left: 10px">Practice</span>' if prac else ""
    if badge: tag += '<span style="font-size: 12px; color: #A3AAB5; border: 1px solid #353B46; border-radius: 999px; padding: 1px 8px; margin-left: 10px">' + badge + '</span>'
    h = dot(PROFIT, 7) if health == "ok" else (dot("#6B7280", 7) if health == "none" else dot(ATTN, 7))
    return f'''<li style="list-style: none"><a href="EditAccount.dc.html" style="display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) 20px; gap: 16px; align-items: center; min-height: 60px; padding: 0 16px; border-top: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1">
<span style="font-size: 15px; font-weight: 600; display: flex; align-items: center">{name}{tag}</span>
<span style="font-size: 14px; color: #C9CED6">{typ}</span>
<span style="font-size: 14px; color: #A3AAB5; display: flex; align-items: center; gap: 8px">{h}{conn}</span>
<span style="color: #8C939F; display: flex">{IC["right"]}</span></a></li>'''

accounts = f'''
{title_block('Accounts <span style="font-weight: 500; color: #8C939F">(5)</span>', "", '<a href="AddAccount.dc.html" class="btn btn-p">' + IC["plus"] + 'Add account</a>')}

<section aria-label="Your accounts" style="border: 1px solid #1B1F27; border-radius: 14px; overflow: hidden">
<div aria-hidden="true" style="display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.5fr) 20px; gap: 16px; padding: 12px 16px; font-size: 13px; color: #8C939F"><span>Name</span><span>Type</span><span>Trade numbers from</span><span></span></div>
<ul style="margin: 0; padding: 0">
{arow("Main account", "Live", False, "MT5 · synced 2 min ago", "ok")}
{arow("Funded 100K", "Prop firm", False, "MT5 · synced 2 min ago", "ok")}
{arow("Challenge 50K", "Prop firm", False, "Your screenshots", "none", "Default for screenshots")}
{arow("Demo account", "Demo", True, "MT5 · reconnect needed", "warn")}
{arow("Backtesting", "Backtest", True, "Your screenshots", "none")}
</ul>
<button type="button" aria-expanded="false" style="font: inherit; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 16px; min-height: 56px; border: 0; border-top: 1px solid #1B1F27; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px"><span>Archived <span style="color: #8C939F">(2)</span> · Challenge 25K, Funded 50K</span><span style="display: flex">{IC["chev"]}</span></button>
</section>
<p class="meta" style="margin: 0">Practice accounts never mix into your numbers unless you tick them. They always feed your playbook.</p>
<section aria-labelledby="auto" style="display: flex; flex-direction: column">
{h2('<span id="auto">When logging</span>', '<span class="lbl">Set once, never asked again</span>')}
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 24px; padding: 14px 0; border-top: 1px solid #1B1F27; margin-top: 12px">
<span style="font-size: 14px">Screenshots with no MT5 match go to</span>
<button type="button" class="btn btn-g" aria-haspopup="listbox" style="font-weight: 500; gap: 10px">Challenge 50K<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>
</div>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 24px; padding: 14px 0; border-top: 1px solid #1B1F27">
<span style="font-size: 14px">When one trade shows up on two accounts</span>
<button type="button" class="btn btn-g" aria-haspopup="listbox" style="font-weight: 500; gap: 10px">Attach to both<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>
</div>
</section>

'''

# ================= 0. FIRST RUN =================
def ob(n, title, body, state, action=""):
    if state == "done":
        circ = f'<span style="flex: none; width: 28px; height: 28px; border-radius: 14px; background: rgba(91,162,255,0.16); color: #5BA2FF; display: flex; align-items: center; justify-content: center">{IC["check"]}</span>'
    else:
        circ = f'<span class="num" style="flex: none; width: 28px; height: 28px; border-radius: 14px; border: 1px solid {"#ECEEF1" if state == "next" else "#353B46"}; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #A3AAB5">{n}</span>'
    bg = "#15181E" if state == "next" else "transparent"
    bd = "#353B46" if state == "next" else "#1B1F27"
    return f"""<li style="list-style: none; display: flex; flex-wrap: wrap; gap: 16px 24px; align-items: center; padding: 20px; border-radius: 14px; background: {bg}; border: 1px solid {bd}">
<div style="flex: 1 1 360px; min-width: 0; display: flex; gap: 16px; align-items: flex-start">{circ}<div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 16px; font-weight: 600">{title}</span><span class="meta">{body}</span></div></div>
<div style="display: flex; gap: 8px; flex-wrap: wrap">{action}</div></li>"""

def expect(when, what):
    return f'<div style="display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 16px; padding: 14px 0; border-top: 1px solid #1B1F27"><span class="lbl">{when}</span><span style="font-size: 14px">{what}</span></div>'

startpage = f"""
{title_block("Let's get your first trade in", "About 5 minutes. Skip anything you like.")}

<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
{ob(1, "Connect an account", "Main account added. MT5 connected to fill in trade numbers.", "done", '<a href="Accounts.dc.html" class="btn btn-q">Add another</a>')}
{ob(2, "Add your setups", "Name the setups you trade and their rules. Or skip, and the journal will suggest setups once it sees a few similar charts.", "next", '<button type="button" class="btn btn-q">Skip for now</button><a href="SetupEdit.dc.html" class="btn btn-p">Add setups</a>')}
{ob(3, "Log your first trade", "Add the screenshots from one recent trade and say a sentence about it.", "todo", '<a href="NewStory.dc.html" class="btn btn-g">' + IC["plus"] + 'New chart story</a>')}
</ol>

<section aria-labelledby="exp" style="display: flex; flex-direction: column">
{h2('<span id="exp">What to expect</span>')}
<div style="margin-top: 12px">
{expect("Every trading day", "One chart story per trade or setup: its screenshots, and a note if you like.")}
{expect("Every week", "A 10-minute review: your biggest leak, what's working, one rule to test.")}
{expect("After about 20 trades", "Your first setup patterns, marked as early signals until there's enough data to trust.")}
</div>
</section>
"""

# ================= 7. ADD ACCOUNT (interactive) =================
def field(label, inner, hint=""):
    h = f'<span class="lbl">{hint}</span>' if hint else ""
    return f'<div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600; color: #C9CED6">{label}</span>{inner}{h}</div>'
INP = 'font: inherit; font-size: 15px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 10px; padding: 0 14px; min-height: 46px; width: 100%; box-sizing: border-box'
def method_card(key, title, sub, other):
    def card(on):
        return f'<button type="button" aria-pressed="{"true" if on else "false"}" onClick="{{{{ pick_{key} }}}}" style="font: inherit; width: 100%; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 16px; min-height: 76px; border-radius: 12px; cursor: pointer; background: {"#15181E" if on else "transparent"}; border: 1px solid {"#ECEEF1" if on else "#353B46"}"><span style="font-size: 15px; font-weight: 600; color: #ECEEF1">{title}</span><span style="font-size: 13px; color: #A3AAB5">{sub}</span></button>'
    isk = "isMt5" if key == "mt5" else "isShots"
    iso = "isShots" if key == "mt5" else "isMt5"
    return f'<div><sc-if value="{{{{ {isk} }}}}" hint-placeholder-val="{{{{ {"true" if key == "mt5" else "false"} }}}}">{card(True)}</sc-if><sc-if value="{{{{ {iso} }}}}" hint-placeholder-val="{{{{ {"false" if key == "mt5" else "true"} }}}}">{card(False)}</sc-if></div>'
TYPE = lambda t, on=False: f'<button type="button" aria-pressed="{"true" if on else "false"}" style="font: inherit; font-size: 14px; font-weight: {600 if on else 500}; color: {"#0E1014" if on else "#ECEEF1"}; background: {"#ECEEF1" if on else "transparent"}; border: 1px solid {"#ECEEF1" if on else "#353B46"}; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">{t}</button>'
TYPES = lambda sel: '<div style="display: flex; flex-wrap: wrap; gap: 8px">' + "".join(TYPE(t, t == sel) for t in ("Live", "Prop firm", "Demo", "Backtest")) + '<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">+ Your own type</button></div>'

addacct = f"""
<div style="max-width: 620px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">
<a href="Accounts.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; align-self: flex-start; min-height: 32px">{IC["back"]}Accounts</a>
{title_block("Add an account")}

<section aria-label="Account details" style="display: flex; flex-direction: column; gap: 20px">
{field("Name", f'<input type="text" placeholder="e.g. Funded 100K" style="{INP}">')}
{field("Type", TYPES("Prop firm"))}
<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0; border-top: 1px solid #1B1F27">
<div><div style="font-size: 14px; font-weight: 600">Practice account</div><div class="lbl">Kept out of your numbers by default. Ticked for you on Demo and Backtest.</div></div>
<input type="checkbox" aria-label="Practice account" style="width: 20px; height: 20px; accent-color: #ECEEF1">
</div>
</section>

<section aria-labelledby="mt5h" style="display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: 14px; border: 1px solid #252A33; background: #15181E">
<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px">
<div><h2 id="mt5h" style="margin: 0; font-size: 15px; font-weight: 600">Connect MT5 <span style="font-weight: 500; color: #8C939F">· optional</span></h2>
<p class="meta" style="margin: 4px 0 0">Your charts always come from your screenshots. MT5 just fills in each trade's numbers: entry, exit, size and result.</p></div>
<sc-if value="{{{{ mt5 }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" role="switch" aria-checked="true" aria-label="Connect MT5" onClick="{{{{ toggle }}}}" style="flex: none; width: 46px; height: 28px; border-radius: 14px; border: 0; background: #ECEEF1; position: relative; cursor: pointer"><span style="position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 11px; background: #0E1014"></span></button></sc-if>
<sc-if value="{{{{ noMt5 }}}}" hint-placeholder-val="{{{{ false }}}}"><button type="button" role="switch" aria-checked="false" aria-label="Connect MT5" onClick="{{{{ toggle }}}}" style="flex: none; width: 46px; height: 28px; border-radius: 14px; border: 1px solid #353B46; background: #0E1014; position: relative; cursor: pointer"><span style="position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 10px; background: #8C939F"></span></button></sc-if>
</div>
<sc-if value="{{{{ mt5 }}}}" hint-placeholder-val="{{{{ true }}}}">
<div style="display: flex; flex-direction: column; gap: 16px">
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
{field("Login", f'<input type="text" inputmode="numeric" value="51234567" style="{INP}">')}
{field("Server", f'<input type="text" value="FTMO-Demo2" style="{INP}">', "Start typing your broker's name")}
</div>
{field("Investor password", f'<input type="password" value="readonly" style="{INP}">', "Read-only: it can see your trades but can never place or close one. It's in your broker's welcome email.")}
<sc-if value="{{{{ notConnected }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" class="btn btn-g" style="align-self: flex-start" onClick="{{{{ connect }}}}">Test connection</button></sc-if>
<sc-if value="{{{{ connected }}}}" hint-placeholder-val="{{{{ false }}}}"><div role="status" style="display: flex; align-items: center; gap: 10px; font-size: 14px"><span style="color: #5BA2FF; display: flex">{IC["check"]}</span>Connected · FTMO-Demo2 · 100,000 USD</div></sc-if>
</div>
</sc-if>
<sc-if value="{{{{ noMt5 }}}}" hint-placeholder-val="{{{{ false }}}}">
<label style="display: flex; align-items: center; gap: 12px; font-size: 14px; cursor: pointer; min-height: 44px"><input type="checkbox" checked style="width: 20px; height: 20px; accent-color: #ECEEF1">Make this the default for screenshots with no MT5 match</label>
<p class="lbl" style="margin: 0">You'll confirm each trade's numbers from your screenshot instead.</p>
</sc-if>
</section>

<button type="button" class="btn btn-p" style="width: 100%">Add account</button>
</div>
"""
addacct_script = """
renderVals() {
  const st = this.state || {};
  const on = st.mt5 !== false;
  const con = !!st.connected;
  return {
    mt5: on, noMt5: !on,
    toggle: () => this.setState({ mt5: !on }),
    connected: con, notConnected: !con,
    connect: () => this.setState({ connected: true })
  };
}
"""

# ---------- write ----------
exec(open("/home/claude/gen/parts.py").read())
exec(open("/home/claude/gen/dash.py").read())
exec(open("/home/claude/gen/log.py").read())
exec(open("/home/claude/gen/tlog.py").read())
exec(open("/home/claude/gen/ns2.py").read())
exec(open("/home/claude/gen/ns3.py").read())
exec(open("/home/claude/gen/ns4.py").read())
exec(open("/home/claude/gen/ns5.py").read())
exec(open("/home/claude/gen/review2.py").read())
exec(open("/home/claude/gen/data.py").read())
exec(open("/home/claude/gen/kit.py").read())
CSS += KIT_CSS
exec(open("/home/claude/gen/review3.py").read())
exec(open("/home/claude/gen/tlog2.py").read())
exec(open("/home/claude/gen/dash2.py").read())
exec(open("/home/claude/gen/story2.py").read())
exec(open("/home/claude/gen/pb2.py").read())
exec(open("/home/claude/gen/wire2.py").read())
exec(open("/home/claude/gen/theme.py").read())
H = {"Start": 740, "Dashboard": 2090, "Main": 2070, "MainCal": 1220, "NewStory": 1160, "NewStoryTyped": 1100, "Story": 1210, "PlaybookHome": 890, "Playbook": 1720, "SetupEdit": 1280, "Review": 1670, "ReviewEarly": 1180,
     "Accounts": 820, "AddAccount": 940, "EditAccount": 980, "Settings": 1630, "States": 920}
files = {
    "Start.dc.html": page("Welcome", H["Start"], startpage, "Trade log"),
    "Dashboard.dc.html": page("Dashboard", H["Dashboard"], dashboard, "Dashboard", DASH_SCRIPT),
    "Main.dc.html": page("Trade log", H["Main"], daily, "Trade log", log_script),
    "MainCal.dc.html": page("Trade log, grid view", H["MainCal"], daily_cal, "Trade log", grid_script),
    "NewStory.dc.html": page("New chart story", H["NewStory"], newstory, "Trade log", newstory_script),
    "NewStoryTyped.dc.html": page("New chart story, after your note", H["NewStoryTyped"], newstory_typed, "Trade log", newstory_typed_script),
    "Story.dc.html": page("Chart story: GBPUSD", H["Story"], storypage, "Trade log", story_script),
    "PlaybookHome.dc.html": page("Playbook", H["PlaybookHome"], playbook_home, "Playbook", PBH_SCRIPT),
    "Playbook.dc.html": page("Playbook: 4H supply pullback", H["Playbook"], playbook, "Playbook", SETUP_TABS_SCRIPT),
    "SetupEdit.dc.html": page("New setup", H["SetupEdit"], setup_edit, "Playbook", setup_edit_script),
    "Review.dc.html": page("Weekly review", H["Review"], review, "Weekly review", REVIEW_SCRIPT),
    "Accounts.dc.html": page("Accounts", H["Accounts"], accounts, "Accounts", accounts_script),
    "AddAccount.dc.html": page("Add an account", H["AddAccount"], addacct, "Accounts", addacct_script),
    "EditAccount.dc.html": page("Edit account", H["EditAccount"], edit_acct, "Accounts", edit_acct_script),
    "Settings.dc.html": page("Settings", H["Settings"], settings, "Settings", settings_script),
    "States.dc.html": page_plain("Empty and problem states", H["States"], states),
}
for k, v in files.items():
    assert "\u2014" not in v, k
    open(os.path.join(OUT, k), "w").write(v)

rows = [["Start.dc.html", "Dashboard.dc.html", "Main.dc.html", "MainCal.dc.html", "NewStory.dc.html", "NewStoryTyped.dc.html", "Story.dc.html", "PlaybookHome.dc.html", "Playbook.dc.html", "SetupEdit.dc.html", "Review.dc.html"],
        ["Accounts.dc.html", "AddAccount.dc.html", "EditAccount.dc.html", "Settings.dc.html"]]
titles = {"Start.dc.html": "0 · First run", "Dashboard.dc.html": "1 · Dashboard (home)", "Main.dc.html": "2 · Trade log, list view", "MainCal.dc.html": "2b · Trade log, grid view, date menu open", "NewStory.dc.html": "3 · New chart story, before your note", "NewStoryTyped.dc.html": "3b · New chart story, after your note", "Story.dc.html": "4 · Chart story",
          "PlaybookHome.dc.html": "5 · Playbook", "Playbook.dc.html": "6 · Setup page", "SetupEdit.dc.html": "7 · New setup (from unsorted stories)",
          "Review.dc.html": "8 · Weekly review",
          "Accounts.dc.html": "9 · Accounts", "AddAccount.dc.html": "10 · Add an account", "EditAccount.dc.html": "11 · Edit account",
          "Settings.dc.html": "12 · Settings", "States.dc.html": "Reference · empty and problem states"}
boards = {}; order = []; y = 0; maxw = 0
row_tops = []
for r in rows:
    x = 0; row_tops.append(y)
    for f in r:
        boards[f] = {"x": x, "y": y, "w": 1440, "h": H[f.split(".")[0]], "title": titles[f], "expand": "fill", "is_interactive": True}
        order.append(f); x += 1520
    maxw = max(maxw, x - 80)
    y += max(H[f.split(".")[0]] for f in r) + 420
boards["States.dc.html"] = {"x": 4 * 1520 + 560, "y": row_tops[1], "w": 1440, "h": H["States"], "title": titles["States.dc.html"], "expand": "fill", "is_interactive": True}
order.append("States.dc.html")
canvas = json.load(open(os.path.join(OUT, "canvas.json")))
canvas["boards"] = boards; canvas["order"] = order
canvas["notes"]["t1"]["maxW"] = 11 * 1520 - 80
canvas["notes"]["t1"]["text"] = "Trading journal concept: drop the charts, talk it through, learn weekly"
canvas["notes"]["t2"] = {"x": 0, "y": row_tops[1] - 320, "text": "Accounts and settings", "kind": "title1", "maxW": 4 * 1520 - 80}
canvas["notes"]["s1"]["text"] = ("Sample data throughout: one set of 134 entries going back a year, so every screen's numbers agree. Swap in yours.\n\n"
    "Every frame works. Press Play and click anything: filters, menus, the voice note, tags, charts, the account picker.\n\n"
    "Charts are the record. Everything else (tags, numbers, patterns) exists to help you read them.\n\n"
    "Dashboard (home): what happened, in R and %, never money.\n\n"
    "Trade log: everything you record, any time, newest first, as a list or a grid. One chart story at a time: drop its charts, talk it through, and your note fills what you haven't set.\n\n"
    "Weekly review: one page per week, built from what you recorded, and one thing to do differently.")
json.dump(canvas, open(os.path.join(OUT, "canvas.json"), "w"), indent=1)
print("ok", {k: len(v) for k, v in files.items()})
