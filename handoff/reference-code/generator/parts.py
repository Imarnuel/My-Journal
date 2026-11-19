# Executed inside gen2.py's namespace (has IC, dot, page, title_block, h2, gallery, GU, XA, EJ, ATTN, VOICE, PROFIT, LOSS, INP, field, TYPE, TYPES, statline)

BACK = lambda href, label: f'<a href="{href}" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; align-self: flex-start; min-height: 32px">{IC["back"]}{label}</a>'

def card_link(href, inner, extra=""):
    return f'<a href="{href}" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 14px; border: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1{extra}">{inner}</a>'

def switch(on, label):
    if on:
        return f'<button type="button" role="switch" aria-checked="true" aria-label="{label}" style="flex: none; width: 46px; height: 28px; border-radius: 14px; border: 0; background: #ECEEF1; position: relative; cursor: pointer"><span style="position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 11px; background: #0E1014"></span></button>'
    return f'<button type="button" role="switch" aria-checked="false" aria-label="{label}" style="flex: none; width: 46px; height: 28px; border-radius: 14px; border: 1px solid #353B46; background: #0E1014; position: relative; cursor: pointer"><span style="position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 10px; background: #8C939F"></span></button>'

def select(value, label):
    return f'<button type="button" aria-haspopup="listbox" aria-label="{label}: {value}" class="btn btn-g" style="font-weight: 500; gap: 10px">{value}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>'

def setting_row(title, sub, control):
    s = f'<div class="lbl">{sub}</div>' if sub else ""
    return f'<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 24px; padding: 16px 0; border-top: 1px solid #1B1F27"><div style="flex: 1 1 320px; min-width: 0"><div style="font-size: 14px; font-weight: 600">{title}</div>{s}</div><div style="display: flex; gap: 8px; align-items: center">{control}</div></div>'

def section(title, body, sub=""):
    sb = f'<p class="meta" style="margin: 4px 0 0">{sub}</p>' if sub else ""
    return f'<section style="display: flex; flex-direction: column"><h2 style="margin: 0; font-size: 16px; font-weight: 600">{title}</h2>{sb}<div style="margin-top: 12px">{body}</div></section>'

def lesson(text, meta):
    return f'<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 12px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"{text}"</span><span class="lbl">{meta}</span></li>'

# ================= PLAYBOOK HOME =================
SETUP_MENU = ('<div role="menu" style="position: absolute; z-index: 5; top: 52px; right: 12px; width: 190px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
              + "".join(f'<{tag} {attr} role="menuitem" style="font: inherit; font-size: 14px; text-align: left; color: {c}; background: transparent; border: 0; border-radius: 6px; padding: 0 10px; min-height: 38px; display: flex; align-items: center; cursor: pointer; text-decoration: none">{t}</{tag}>'
                        for tag, attr, t, c in (("button", 'type="button"', "Rename", "#ECEEF1"), ("a", 'href="SetupEdit.dc.html"', "Edit rules", "#ECEEF1"), ("button", 'type="button"', "Archive setup", "#ECEEF1"), ("button", 'type="button"', "Delete setup", "#FF9A4D")))
              + '<span style="font-size: 12px; color: #8C939F; padding: 6px 10px 4px">Archiving keeps its stories and examples.</span></div>')

def setup_card(href, chart, name, line, figure, flag="", rs=None, menu_open=False):
    f = f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #A3AAB5">{dot(ATTN, 7)}{flag}</span>' if flag else ""
    trend = (f'<div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">{spark(rs, 150, 30)}<span class="lbl">Last {len(rs)} trades</span></div>' if rs
             else '<div style="display: flex; align-items: center; height: 30px"><span class="lbl">Trend appears after 10 trades</span></div>')
    more = (f'<button type="button" aria-label="Setup actions" aria-expanded="{"true" if menu_open else "false"}" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border: 0; border-radius: 8px; background: {"#1B1F27" if menu_open else "rgba(14,16,20,0.75)"}; color: #ECEEF1; cursor: pointer; font-size: 16px; letter-spacing: 1px">···</button>'
            + (SETUP_MENU if menu_open else ""))
    inner = f'<div class="chart">{chart}</div><div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><span style="font-size: 16px; font-weight: 600">{name}</span><span class="num" style="font-size: 15px; font-weight: 600">{figure}</span></div>{trend}<div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap"><span class="lbl">{line}</span>{f}</div>'
    return f'<div style="position: relative">{card_link(href, inner)}{more}</div>'

UNSORTED_THUMBS = "".join(f'<div class="chart" style="flex: 1; min-width: 0">{gallery(sd, "long", True)}</div>' for sd in (301, 302, 303, 304))
playbook_home = f'''
{title_block("Playbook", "Your setups, built from your chart stories. Example setups shown.", picker() + '<a href="SetupEdit.dc.html" class="btn btn-p">' + IC["plus"] + 'New setup</a>')}
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px">
{setup_card("Playbook.dc.html", gallery(101, "short", True), "4H supply pullback", "34 taken · 9 watched", "+0.5R", rs=R_SUPPLY)}
{setup_card("Playbook.dc.html", gallery(121, "long", True), "London breakout", "12 taken · 3 watched", "+0.3R", "Early signal", rs=R_LONDON, menu_open=True)}
{setup_card("Playbook.dc.html", gallery(131, "short", False), "Asian range fade", "6 taken · 1 watched", "", "Too few trades for numbers")}
</div>
<section style="display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 14px; border: 1px dashed #353B46">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 style="margin: 0; font-size: 16px; font-weight: 600">Unsorted <span style="font-weight: 500; color: #8C939F">(7)</span></h2><span class="lbl">Chart stories that don't fit a setup yet</span></div>
<div style="display: flex; gap: 10px">{UNSORTED_THUMBS}</div>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px"><span style="display: flex; align-items: center; gap: 10px; font-size: 14px">{dot(VOICE)}4 of them look alike: daily bullish, Asian low swept, then a 15m break of structure.</span><a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a></div>
</section>
<button type="button" aria-expanded="false" style="font: inherit; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 4px; min-height: 48px; border: 0; border-top: 1px solid #1B1F27; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px; text-align: left"><span>Archived setups <span style="color: #8C939F">(1)</span> · Asia breakout</span><span style="display: flex">{IC["chev"]}</span></button>
'''

# ================= SETUP EDITOR =================
RULE = lambda t: f'<div style="display: flex; align-items: center; gap: 10px; border-top: 1px solid #1B1F27; padding: 6px 0"><span aria-hidden="true" style="color: #8C939F; cursor: grab; font-size: 14px">⋮⋮</span><input class="ghost" type="text" aria-label="Rule" value="{t}" style="flex: 1; margin: 0"><button type="button" aria-label="Remove rule" style="width: 32px; height: 32px; border: 0; background: transparent; color: #8C939F; cursor: pointer; font-size: 18px">×</button></div>'
ADD_RULE = '<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 0; border-top: 1px solid #1B1F27; text-align: left; padding: 10px 0; cursor: pointer">+ Add a rule</button>'
def EGROUP(name, sub, rules):
    sb = f'<span class="lbl">{sub}</span>' if sub else ""
    return f'<div style="display: flex; flex-direction: column; margin-bottom: 14px"><div style="display: flex; justify-content: space-between; gap: 8px; padding: 6px 0"><span style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #A3AAB5">{name}</span>{sb}</div>' + "".join(RULE(r) for r in rules) + ADD_RULE + '</div>'
SETUP_THUMBS = "".join(f'<figure style="margin: 0; display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0"><div class="chart">{gallery(sd, "long", True)}</div><figcaption class="lbl">{lbl}</figcaption></figure>' for sd, lbl in ((301, "GBPUSD · 13 Nov"), (302, "EURUSD · 9 Nov"), (303, "AUDUSD · 6 Nov"), (304, "XAUUSD · 3 Nov")))
setup_edit = f'''
<div style="max-width: 760px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">
{BACK("PlaybookHome.dc.html", "Playbook")}
{title_block("New setup", "Drafted from 4 unsorted chart stories that look alike. Change anything.")}
<section style="display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap"><span style="font-size: 13px; font-weight: 600; color: #C9CED6">These stories move into this setup</span><span class="lbl">Click a chart to leave it out</span></div>
<div style="display: flex; gap: 10px">{SETUP_THUMBS}</div>
</section>
{field("Name", f'<input type="text" placeholder="e.g. Asian low sweep" style="{INP}">')}
<section style="display: flex; flex-direction: column">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 8px"><span style="font-size: 13px; font-weight: 600; color: #C9CED6">Rules</span><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #8C939F">{dot(VOICE, 7)}Drafted from your voice notes on these stories</span></div>
{EGROUP("Context", "Higher timeframes", ["Daily trend is bullish", "Price sweeps the Asian session low"])}
{EGROUP("Entry", "Lower timeframe", ["15m breaks structure after the sweep", "Enter on the retest"])}
{EGROUP("Exit", "", ["Stop below the sweep", "Target the previous high"])}
</section>
<p class="lbl" style="margin: 0">You can pin textbook examples from any chart story in this setup later.</p>
<div style="display: flex; gap: 10px"><a href="PlaybookHome.dc.html" class="btn btn-q">Cancel</a><a href="Playbook.dc.html" class="btn btn-p" style="flex: 1">Save setup</a></div>
</div>
'''

# ================= FIRST-WEEK REVIEW =================
EARLY_THUMBS = "".join(f'<a href="Story.dc.html" class="chart" style="display: block; width: 150px">{gallery(sd, side, w)}</a>' for sd, side, w in ((401, "short", True), (402, "long", False), (403, "short", True), (404, "long", True), (405, "short", False), (406, "long", True)))
review_early = f'''
{title_block("Week of 2 to 6 November", "Your first week · about 3 minutes", picker())}
<section style="display: flex; flex-direction: column; gap: 8px; padding: 22px 24px; border-radius: 14px; background: #15181E; border: 1px solid #252A33">
<p style="margin: 0; font-size: 21px; font-weight: 600; line-height: 1.35">4 trades and 2 watched setups logged. Nice start.</p>
<p class="meta" style="margin: 0">It's too early for leaks and patterns. They appear once a setup has about 20 trades. Until then, the review just shows you your week.</p>
</section>
{section("Your charts this week", '<div style="display: flex; gap: 10px; flex-wrap: wrap">' + EARLY_THUMBS + '</div>')}
{section("Notes you made", '<ul style="margin: 0; padding: 0">' + lesson("Wait for the candle to close before entering", "GBPJPY · 4 Nov") + lesson("Don't take the third touch of a zone", "EURUSD · 5 Nov") + '</ul>')}
{section("A first rule to test", '<div style="display: flex; flex-wrap: wrap; gap: 10px">' + rule_opt("Wait for the candle to close", "From your own note", True) + rule_opt("Write my own", "We'll ask if you kept it next week") + '</div>', "Optional. Skip it if nothing stands out yet.")}
<div style="display: flex; gap: 10px"><button type="button" class="btn btn-q">Skip the rule</button><button type="button" class="btn btn-p">Finish review</button></div>
'''

# ================= EDIT ACCOUNT =================
edit_acct = f'''
<div style="max-width: 620px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">
{BACK("Accounts.dc.html", "Accounts")}
{title_block("Funded 100K", "Prop firm · added 2 October · 46 chart stories")}
<section style="display: flex; flex-direction: column; gap: 20px">
{field("Name", f'<input type="text" value="Funded 100K" style="{INP}">')}
{field("Type", TYPES("Prop firm"))}
<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0; border-top: 1px solid #1B1F27"><div><div style="font-size: 14px; font-weight: 600">Practice account</div><div class="lbl">Kept out of your numbers by default</div></div>{switch(False, "Practice account")}</div>
</section>
<section style="display: flex; flex-direction: column; gap: 12px; padding: 20px; border-radius: 14px; border: 1px solid #252A33; background: #15181E">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap"><h2 style="margin: 0; font-size: 15px; font-weight: 600">MT5</h2><span style="display: flex; align-items: center; gap: 8px; font-size: 14px">{dot(PROFIT, 7)}Synced 2 min ago · FTMO-Demo2</span></div>
<p class="meta" style="margin: 0">Prop firms often issue a new investor password when an account resets. If syncing stops, reconnect here.</p>
<button type="button" class="btn btn-g" style="align-self: flex-start">Reconnect</button>
</section>
<button type="button" class="btn btn-p" style="width: 100%">Save changes</button>
<section style="display: flex; flex-direction: column; gap: 4px">
{setting_row("Archive account", "Passed, failed or reset? Archive it. Its chart stories stay in your playbook; it just leaves your lists.", '<button type="button" class="btn btn-g">Archive</button>')}
{setting_row("Delete account", "Removes the account and all 46 of its chart stories. This can't be undone.", '<button type="button" class="btn btn-q" style="color: #FF9A4D">Delete</button>')}
</section>
</div>
'''

# ================= SETTINGS =================
def tag_group(name, count, kind):
    return f'<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">{name} <span style="color: #8C939F">({count})</span></span><span class="lbl">{kind}</span></div>'
SESS = lambda n, t: f'<div style="display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #1B1F27; font-size: 14px"><span>{n}</span><span class="num">{t}</span></div>'
settings = f'''
<div style="max-width: 760px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 44px">
{title_block("Settings")}
{section("Weekly review", setting_row("Review day", "It's ready that morning, covering the 5 trading days before.", select("Saturday", "Review day")))}
{section("Reminders", setting_row("One gentle reminder", "Only when a trade from MT5 has no charts yet. Never more than one, and nothing piles up.", select("8:00 pm", "Reminder time") + switch(True, "Reminder")))}
{section("Time and sessions", setting_row("Time zone", "Detected from your computer. Sessions and days are worked out from it.", select("Lagos (UTC+1)", "Time zone")) + '<div style="margin-top: 8px">' + SESS("Asia", "01:00 to 10:00") + SESS("London", "09:00 to 17:30") + SESS("New York", "14:00 to 23:00") + '</div><button type="button" class="btn btn-q" style="padding: 0 4px; margin-top: 4px">Edit session times</button>', "Shown in your time zone. They shift automatically when clocks change.")}
{section("Your tags", '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid #353B46; margin-bottom: 8px"><span style="display: flex; align-items: center; gap: 10px; font-size: 14px">' + dot(ATTN) + '"BOS" and "Break of structure" look like the same tag</span><button type="button" class="btn btn-g">Merge</button></div>' + tag_group("Tags", 18, "8 good · 7 mistakes · 3 neutral. Each tag\'s kind is set once, when you add it. Every tag is a filter.") + tag_group("Headspace", 5, "Fixed list, so stats stay comparable") + tag_group("Plan", 2, "Fixed: Followed, Not followed") + '<button type="button" class="btn btn-q" style="padding: 0 4px; margin-top: 4px">Manage tags</button>', "Rename, merge or remove tags. Old stories update with them.")}
{section("Voice notes", setting_row("Language", "", select("English", "Voice note language")) + setting_row("Keep recordings", "Turn off to keep only the written transcript.", switch(True, "Keep recordings")))}
</div>
'''

# ================= STATES =================
def state(label, body):
    return f'<section style="display: flex; flex-direction: column; gap: 12px"><span class="lbl">{label}</span><div style="padding: 22px; border-radius: 14px; border: 1px solid #252A33; background: #15181E; display: flex; flex-direction: column; gap: 12px; min-height: 150px; box-sizing: border-box">{body}</div></section>'
T = lambda t: f'<div style="font-size: 16px; font-weight: 600">{t}</div>'
M = lambda t: f'<p class="meta" style="margin: 0">{t}</p>'
B = lambda *bs: '<div style="display: flex; gap: 8px; flex-wrap: wrap">' + "".join(bs) + '</div>'
states = f'''
{title_block("Empty and problem states", "Each of these appears inside the screen named above it, at the moment it happens.")}
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 24px">
{state("Daily log · no trades today", T("Sunday 15 November") + M("Nothing logged today. If you watched a setup, it's still worth adding.") + B('<a href="NewStory.dc.html" class="btn btn-g">' + IC["plus"] + 'New chart story</a>'))}
{state("Playbook · no setups yet", T("No setups yet") + M("Add the setups you trade, or keep logging. When a few similar charts show up, you'll be asked to name them.") + B('<a href="SetupEdit.dc.html" class="btn btn-g">' + IC["plus"] + 'New setup</a>'))}
{state("Chart story · voice note not understood", '<div style="display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600">' + dot(ATTN) + "Couldn't make out your note</div>" + M("Too much background noise. Nothing was filled in, so nothing wrong was saved.") + B('<button type="button" class="btn btn-g">' + IC["mic"] + 'Record again</button>', '<button type="button" class="btn btn-q">Type instead</button>'))}
{state("New chart story · screenshot can't be read", '<div style="display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600">' + dot(ATTN) + "Prices on this screenshot are too small to read</div>" + M("It's still in the story. Replace it with a sharper one, or type the entry, stop and target yourself.") + B('<button type="button" class="btn btn-g">Replace</button>', '<button type="button" class="btn btn-q">Type the numbers</button>'))}
{state("Daily log · MT5 stopped syncing", '<div style="display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600">' + dot(ATTN) + "Funded 100K stopped syncing yesterday</div>" + M("The investor password may have changed. Your screenshots still come in; only the trade numbers are waiting.") + B('<a href="EditAccount.dc.html" class="btn btn-g">Reconnect</a>'))}
{state("Weekly review · first week", T("Too early for patterns") + M("The first reviews show your charts and notes. Leaks and patterns appear once a setup has about 20 trades.") + B('<a href="ReviewEarly.dc.html" class="btn btn-g">See the first-week review</a>'))}
</div>
'''

# ================= reference sheet (not a product screen) =================
def page_plain(title, h, body):
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
<div style="min-height: {h}px; background: #0E1014; color: #ECEEF1; font-family: Geist, system-ui, sans-serif; font-size: 15px; line-height: 1.5; box-sizing: border-box; padding: 56px 64px 72px">
<div style="max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px">
<div style="display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #E8C766; border: 1px solid rgba(232,199,102,0.45); border-radius: 999px; padding: 4px 12px">Design reference · not a screen in the product</div>
{body}
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
states = states.replace('{title_block("Empty and problem states"', '{title_block("Empty and problem states"')

# ================= DAILY LOG v2: one chart story at a time =================
MORE = '<button type="button" aria-label="More actions" style="width: 40px; height: 40px; border: 0; border-radius: 10px; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 18px; letter-spacing: 1px">···</button>'
MORE_OPEN = ('<div style="position: relative; display: inline-flex">'
             '<button type="button" aria-label="More actions" aria-expanded="true" style="width: 40px; height: 40px; border: 0; border-radius: 10px; background: #1B1F27; color: #ECEEF1; cursor: pointer; font-size: 18px; letter-spacing: 1px">···</button>'
             '<div role="menu" style="position: absolute; z-index: 5; top: calc(100% + 6px); right: 0; width: 210px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
             + "".join(f'<button type="button" role="menuitem" style="font: inherit; font-size: 14px; text-align: left; color: {c}; background: transparent; border: 0; border-radius: 6px; padding: 0 10px; min-height: 38px; cursor: pointer">{t}</button>' for t, c in (("Change date", "#ECEEF1"), ("Exclude from stats", "#ECEEF1"), ("Delete story", "#FF9A4D")))
             + '</div></div>')
NOTE_BTNS = '<div style="display: flex; align-items: center; gap: 6px"><span class="lbl" style="margin-right: 4px">Add note</span><button type="button" class="btn btn-g">' + IC["mic"] + 'Record</button><button type="button" class="btn btn-q" style="padding: 0 10px">Type</button></div>'
A = lambda main, more=MORE: f'<div style="display: flex; align-items: center; gap: 6px">{main}{more}</div>'

ANALYSIS = f'''<section aria-labelledby="ana" style="display: flex; flex-wrap: wrap; gap: 16px 28px; align-items: center; padding: 18px 20px; border-radius: 14px; border: 1px solid #1B1F27">
<div style="flex: 1 1 300px; min-width: 0; display: flex; flex-direction: column; gap: 4px">
<h2 id="ana" style="margin: 0; font-size: 15px; font-weight: 600">Today's analysis</h2>
<span class="meta">Charts you marked up before trading. Not trades, so they never touch your stats. Stories on the same pair show them alongside.</span>
<span style="font-size: 14px; color: #C9CED6; margin-top: 4px">"Dollar weak into New York. Only shorts on GBP below the weekly level."</span>
</div>
<div style="display: flex; gap: 8px; align-items: center">
<figure style="margin: 0; width: 120px"><div class="chart">{GU["D"]}</div><figcaption class="lbl" style="margin-top: 4px">GBPUSD · Daily</figcaption></figure>
<figure style="margin: 0; width: 120px"><div class="chart">{XA["4H"]}</div><figcaption class="lbl" style="margin-top: 4px">XAUUSD · 4H</figcaption></figure>
<button type="button" class="btn btn-q" style="padding: 0 10px">+ Add</button>
</div>
</section>'''

daily = f'''
{title_block("Daily log", "Monday 16 November · MT5 synced 2 min ago", DAYNAV + '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}

{ANALYSIS}

<section aria-labelledby="today" style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-direction: column; gap: 10px">
{h2('<span id="today">8 chart stories today</span>', '<span class="meta">4 of 8 complete · charts and a note</span>')}
<div role="progressbar" aria-label="Stories done" aria-valuenow="4" aria-valuemin="0" aria-valuemax="8" style="height: 4px; border-radius: 2px; background: #1B1F27; overflow: hidden"><div style="width: 50%; height: 100%; background: #ECEEF1"></div></div>
</div>
<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
{story("todo", "EURUSD", "long", "Taken", "Main account", "+0.6R", PROFIT, None, None, "", A('<a href="NewStory.dc.html" class="btn btn-g">' + IC["img"] + 'Add charts</a>'), "Created from MT5 #48231 · you didn't screenshot this one")}
{story("done", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", A('<span class="meta">Complete</span>'), "4H supply pullback · Followed · Calm")}
{story("next", "GBPUSD", "short", "Taken", "Funded 100K", "+2.1R", PROFIT, GU["E"], GU["A"], "+3 charts", A('<a href="Story.dc.html" class="btn btn-p">' + dot(ATTN) + 'Check 1 item</a>'), "Location was read from your chart · confirm it")}
{story("todo", "GBPUSD", "short", "Taken", "Funded 100K", "−1.0R", LOSS, gallery(221, "short", False), gallery(222, "short", False), "+1 chart", A(NOTE_BTNS), "Second position from your GBPUSD upload, at 14:15 · needs its own note")}
{story("todo", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", A(READING), "Just saved · no MT5 on this account, numbers read from your chart")}
{story("done", "AUDUSD", "long", "Running", "Main account", "Open", "#A3AAB5", gallery(211, "long", True), None, "+2 charts", A('<span class="meta">Complete</span>'), "Still open in MT5 · the result fills in when it closes")}
{story("done", "NZDUSD", "short", "Not filled", "Main account", "Open", "#A3AAB5", gallery(231, "short", True), None, "+1 chart", A('<span class="meta">Complete</span>', MORE_OPEN), "Your limit order never triggered · stays out of your results")}
{story("done", "EURJPY", "long", "Watched", "No trade placed", "Open", "#A3AAB5", EJ["E"], None, "+2 charts", A('<span class="meta">Complete</span>'), "Add an after chart any time to give it a result")}
</ol>
</section>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #353B46">
<div style="display: flex; gap: 12px; align-items: flex-start; min-width: 0; flex: 1 1 360px">{dot(ATTN)}<div><div style="font-size: 14px; font-weight: 600">USDCHF closed 8 seconds after opening</div><div class="meta">MT5 #48240 · −0.1R. A mistake? Excluding it keeps it out of your stats.</div></div></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Keep it</button><button type="button" class="btn btn-g">Exclude from stats</button></div>
</section>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: 14px; font-weight: 600">3 stories still open from last week</span><span class="meta">Each is missing a note. Add one if you remember, or mark them complete as they are.</span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Mark complete</button><button type="button" class="btn btn-g">Open</button></div>
</section>

<p class="meta" style="margin: 0">Stop whenever you like. Unfinished stories stay open here. One gentle reminder, then nothing.</p>
'''

# ================= NEW CHART STORY =================
def tf_tile(chart, label):
    return f'<figure style="margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0"><div class="chart">{chart}</div><figcaption style="display: flex; justify-content: space-between; gap: 6px"><span class="lbl">{label}</span><button type="button" aria-label="Remove {label} screenshot" style="border: 0; background: transparent; color: #8C939F; cursor: pointer; font-size: 15px; padding: 0">×</button></figcaption></figure>'

def dfield(label, value, src_html):
    return f'<label style="display: flex; flex-direction: column; gap: 6px"><span class="lbl">{label}</span><input class="ghost" type="text" value="{value}" style="margin: 0; border-color: #252A33; min-height: 42px; font-size: 15px"><span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8C939F">{src_html}</span></label>'

newstory = f'''
<div style="max-width: 880px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 32px">
{BACK("Main.dc.html", "Daily log")}
{title_block("New chart story", "One trade or setup at a time. Drop or paste its screenshots, then add your note.")}

<section aria-labelledby="ch" style="display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 id="ch" style="margin: 0; font-size: 15px; font-weight: 600">Charts</h2><span class="lbl">Read as GBPUSD · timeframes ordered for you</span></div>
<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px">
{tf_tile(GU["W"], "Weekly")}{tf_tile(GU["D"], "Daily")}{tf_tile(GU["4H"], "4H")}{tf_tile(GU["E"], "15m entry")}
<button type="button" style="font: inherit; border: 1.5px dashed #353B46; border-radius: 8px; background: transparent; color: #A3AAB5; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 13px; aspect-ratio: 16 / 9">{IC["plus"]}Add or paste</button>
</div>
<div role="status" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px 20px; padding: 14px 16px; border-radius: 12px; border: 1px solid #353B46">
<span style="display: flex; align-items: center; gap: 10px; font-size: 14px">{dot(VOICE)}Your 15m chart shows two positions, at 09:45 and 14:15. They'll be saved as two stories.</span>
<button type="button" class="btn btn-q" style="padding: 0 6px">That's wrong</button>
</div>
</section>

<section aria-labelledby="dt" style="display: flex; flex-direction: column; gap: 14px">
<h2 id="dt" style="margin: 0; font-size: 15px; font-weight: 600">Details</h2>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
{dfield("Date", "Mon 16 Nov", "From when the screenshots were taken")}
{dfield("Pair", "GBPUSD", dot("#8C939F", 6) + "Read from your chart")}
{dfield("Direction", "Short", dot("#8C939F", 6) + "From your position tool")}
{dfield("Account", "Funded 100K", dot(PROFIT, 6) + "From MT5 #48213")}
</div>
<div style="display: flex; flex-direction: column; gap: 6px; max-width: 460px">
<span class="lbl">Status</span>
{seg("Status", ["Taken", "Watched", "Not filled"], "Taken")}
<span style="font-size: 12px; color: #8C939F">Taken because MT5 has a trade at this time. Watched and Not filled stay out of your results.</span>
</div>
</section>

<section aria-labelledby="nt" style="display: flex; flex-direction: column; gap: 12px">
<h2 id="nt" style="margin: 0; font-size: 15px; font-weight: 600">Your note</h2>
<sc-if value="{{{{ talk }}}}" hint-placeholder-val="{{{{ true }}}}">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding: 18px 20px; border-radius: 14px; background: #15181E; border: 1px solid #252A33">
<button type="button" aria-label="Start recording" style="flex: none; width: 56px; height: 56px; border-radius: 28px; border: 0; background: #B9A6FF; color: #0E1014; cursor: pointer; display: flex; align-items: center; justify-content: center">{IC["mic"]}</button>
<div style="flex: 1 1 260px; min-width: 0"><div style="font-size: 15px; font-weight: 600">Talk it through</div><div class="meta">Why you took it, how you felt, what happened. Your tags fill themselves in.</div></div>
<button type="button" class="btn btn-q" onClick="{{{{ toType }}}}">Type instead</button>
</div>
</sc-if>
<sc-if value="{{{{ typing }}}}" hint-placeholder-val="{{{{ false }}}}">
<div style="display: flex; flex-direction: column; gap: 10px">
<textarea aria-label="Your note" rows="4" placeholder="Why you took it, how you felt, what happened" style="font: inherit; font-size: 15px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 12px; padding: 14px 16px; resize: vertical"></textarea>
<button type="button" class="btn btn-q" style="align-self: flex-start; padding: 0 6px" onClick="{{{{ toTalk }}}}">{IC["mic"]}Record instead</button>
</div>
</sc-if>
</section>

<div style="display: flex; gap: 10px"><a href="Main.dc.html" class="btn btn-q">Cancel</a><a href="Story.dc.html" class="btn btn-p" style="flex: 1">Save story</a></div>
<p class="lbl" style="margin: 0; text-align: center">You can save without a note and add it later.</p>
</div>
'''
newstory_script = """
renderVals() {
  const t = !!(this.state && this.state.typing);
  return { talk: !t, typing: t, toType: () => this.setState({ typing: true }), toTalk: () => this.setState({ typing: false }) };
}
"""

# typing state shown as its own frame
newstory_typed = newstory.replace(
    '<textarea aria-label="Your note" rows="4" placeholder="Why you took it, how you felt, what happened" style="font: inherit; font-size: 15px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 12px; padding: 14px 16px; resize: vertical"></textarea>',
    '<textarea aria-label="Your note" rows="4" placeholder="Why you took it, how you felt, what happened" style="font: inherit; font-size: 15px; color: #ECEEF1; background: #0E1014; border: 1px solid #4A515E; border-radius: 12px; padding: 14px 16px; resize: vertical">Weekly and daily bearish. 4H pulled into supply, waited for the 15m break of structure and took the retest. Calm, no rush.</textarea><span style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8C939F">' + dot(VOICE, 7) + 'Your tags fill in from what you type, the same as from a voice note.</span>')
newstory_typed_script = newstory_script.replace("const t = !!(this.state && this.state.typing);", "const t = !(this.state && this.state.typing === false);")

# ================= DAY PICKER CALENDAR (no money, just stories) =================
def cal_cell(d, n=0, missing=False, today=False, future=False):
    if d is None:
        return '<div></div>'
    if future:
        return f'<div style="min-height: 46px; border-radius: 8px; padding: 6px; box-sizing: border-box"><span style="font-size: 12px; color: #4A515E">{d}</span></div>'
    bg = "#ECEEF1" if today else ("#1B1F27" if n else "transparent")
    fg = "#0E1014" if today else "#ECEEF1"
    sub = f'<span class="num" style="font-size: 11px; color: {"#0E1014" if today else "#A3AAB5"}">{n} {"story" if n == 1 else "stories"}</span>' if n else ""
    md = f'<span aria-label="Something missing" style="position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 3px; background: {ATTN}"></span>' if missing else ""
    label = f"{d} November, {n} chart {'story' if n == 1 else 'stories'}" + (", something missing" if missing else "") if n else f"{d} November, nothing logged"
    return f'<button type="button" aria-label="{label}" style="position: relative; font: inherit; text-align: left; display: flex; flex-direction: column; justify-content: space-between; min-height: 46px; border-radius: 8px; padding: 6px; box-sizing: border-box; border: 0; background: {bg}; color: {fg}; cursor: pointer"><span style="font-size: 12px; font-weight: 600">{d}</span>{sub}{md}</button>'

NOV = {2: (3, False), 3: (2, False), 4: (4, False), 5: (1, False), 6: (2, False), 9: (2, False), 10: (3, False), 11: (2, True), 12: (4, True), 13: (2, True), 16: (8, True)}
cells = [None] * 6  # 1 November 2026 is a Sunday; the grid starts on Monday
for d in range(1, 31):
    cells.append(d)
grid = "".join(cal_cell(d, *(NOV.get(d, (0, False)) if d else (0, False)), today=(d == 16), future=(d is not None and d > 16)) for d in cells)
CAL = f"""<div role="dialog" aria-label="Choose a day" style="position: absolute; z-index: 6; top: calc(100% + 8px); right: 0; width: 380px; padding: 14px; box-sizing: border-box; background: #15181E; border: 1px solid #353B46; border-radius: 14px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 10px; text-align: left">
<div style="display: flex; justify-content: space-between; align-items: center"><button type="button" aria-label="Previous month" style="width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #ECEEF1; cursor: pointer; display: flex; align-items: center; justify-content: center">{IC["back"]}</button><span style="font-size: 15px; font-weight: 600">November 2026</span><button type="button" aria-label="Next month" disabled style="width: 32px; height: 32px; border: 0; background: transparent; color: #4A515E; display: flex; align-items: center; justify-content: center">{IC["right"]}</button></div>
<div aria-hidden="true" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; font-size: 11px; color: #8C939F; text-align: center">{"".join(f"<span>{w}</span>" for w in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))}</div>
<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">{grid}</div>
<div style="display: flex; gap: 14px; font-size: 12px; color: #8C939F; padding-top: 4px; border-top: 1px solid #252A33"><span style="display: inline-flex; align-items: center; gap: 6px; padding-top: 8px">{dot(ATTN, 6)}Something missing</span><span style="padding-top: 8px">No results shown here, by design</span></div>
</div>"""
DAYNAV_OPEN = '<div style="position: relative; display: inline-flex">' + DAYNAV.replace('aria-haspopup="dialog" style="', 'aria-haspopup="dialog" aria-expanded="true" style="background: #1B1F27; ', 1) + CAL + '</div>'
daily_cal = daily.replace(DAYNAV, DAYNAV_OPEN, 1)
assert daily_cal != daily

# ================= CHART STRIP v2: order sets the roles, one Entry badge =================
GRIP = '<span aria-hidden="true" style="position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 6px; background: rgba(14,16,20,0.8); color: #A3AAB5; font-size: 12px; display: flex; align-items: center; justify-content: center; letter-spacing: -1px; cursor: grab">⋮⋮</span>'
ENTRY_BADGE = '<span style="position: absolute; top: 6px; left: 6px; font-size: 11px; font-weight: 600; color: #0E1014; background: #ECEEF1; border-radius: 5px; padding: 1px 7px; line-height: 1.6">Entry</span>'
def CHART_MENU(name):
    items = [("Move left", "#ECEEF1"), ("Move right", "#ECEEF1"), ("Make this the entry", "#ECEEF1"), ("Remove", LOSS)]
    return ('<div role="menu" aria-label="' + name + ' chart actions" style="position: absolute; z-index: 6; top: calc(100% + 4px); right: 0; width: 196px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
            + "".join(f'<button type="button" role="menuitem" style="font: inherit; font-size: 14px; text-align: left; color: {c}; background: transparent; border: 0; border-radius: 6px; padding: 0 10px; min-height: 38px; cursor: pointer">{t}</button>' for t, c in items)
            + '</div>')

def strip_tile(chart, caption, name, entry=False, menu=False):
    cap = f'<span class="lbl">{caption}</span>' if caption else '<span></span>'
    more = (f'<span style="position: relative; display: inline-flex"><button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" aria-expanded="{"true" if menu else "false"}" '
            f'style="width: 28px; height: 24px; border: 0; border-radius: 6px; background: {"#1B1F27" if menu else "transparent"}; color: #A3AAB5; cursor: pointer; font-size: 14px; letter-spacing: 1px; padding: 0">···</button>{CHART_MENU(name) if menu else ""}</span>')
    ring = "box-shadow: 0 0 0 2px #ECEEF1;" if entry else ""
    return (f'<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0">'
            f'<div class="chart" style="position: relative; {ring}">{chart}{ENTRY_BADGE if entry else ""}{GRIP}</div>'
            f'<figcaption style="display: flex; justify-content: space-between; align-items: center; gap: 6px; min-height: 24px">{cap}{more}</figcaption></figure>')

ADD_TILE = f'<button type="button" style="font: inherit; border: 1.5px dashed #353B46; border-radius: 8px; background: transparent; color: #A3AAB5; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 13px; aspect-ratio: 16 / 9">{IC["plus"]}Add or paste</button>'
def STRIP(menu):
    return ('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px">'
            + strip_tile(GU["W"], "Weekly", "Weekly") + strip_tile(GU["D"], "", "second")
            + strip_tile(GU["4H"], "4H", "4H", menu=menu) + strip_tile(GU["E"], "15m", "15m", entry=True)
            + ADD_TILE + '</div>'
            + '<p class="lbl" style="margin: 0">Drag to reorder. Charts before the entry are its context; charts after it show what happened. The entry is the chart with your position on it.</p>')

_old_hdr = '<span class="lbl">Read as GBPUSD · timeframes ordered for you</span>'
_new_hdr = '<span class="lbl">Read as GBPUSD · higher timeframes first where the chart shows them</span>'
_i = newstory.index('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px">')
_j = newstory.index('</div>', newstory.index('Add or paste</button>', _i)) + len('</div>')
_old_grid = newstory[_i:_j]
assert newstory.count(_old_hdr) == 1 and newstory_typed.count(_old_grid) == 1
newstory = newstory.replace(_old_grid, STRIP(True)).replace(_old_hdr, _new_hdr)
newstory_typed = newstory_typed.replace(_old_grid, STRIP(False)).replace(_old_hdr, _new_hdr)

# ================= DAILY LOG v3: charts finish a story, nothing piles up =================
GRIP = ""  # whole tile is draggable; no grip over the chart
def strip_tile(chart, caption, name, entry=False, menu=False):
    cap = f'<span class="lbl">{caption}</span>' if caption else '<span></span>'
    if menu:  # interactive: closed by default, opens on click
        btn = (f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" onClick="{{{{ toggleMenu }}}}" '
               f'style="width: 28px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px; letter-spacing: 1px; padding: 0">···</button>')
        more = f'<span style="position: relative; display: inline-flex">{btn}<sc-if value="{{{{ menuOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{CHART_MENU(name)}</sc-if></span>'
    else:
        more = f'<button type="button" aria-label="Actions for {name} chart" aria-haspopup="menu" style="width: 28px; height: 24px; border: 0; border-radius: 6px; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px; letter-spacing: 1px; padding: 0">···</button>'
    ring = "box-shadow: 0 0 0 2px #ECEEF1;" if entry else ""
    return (f'<figure draggable="true" aria-roledescription="Draggable chart" style="margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; cursor: grab">'
            f'<div class="chart" style="position: relative; {ring}">{chart}{ENTRY_BADGE if entry else ""}</div>'
            f'<figcaption style="display: flex; justify-content: space-between; align-items: center; gap: 6px; min-height: 24px">{cap}{more}</figcaption></figure>')

_i = newstory.index('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px">')
_j = newstory.index('</p>', _i) + 4
newstory = newstory[:_i] + STRIP(True) + newstory[_j:]
_i = newstory_typed.index('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px">')
_j = newstory_typed.index('</p>', _i) + 4
newstory_typed = newstory_typed[:_i] + STRIP(False) + newstory_typed[_j:]
for _v in ("newstory", "newstory_typed"):
    globals()[_v] = globals()[_v].replace("Drop or paste its screenshots, then add your note.", "Drop or paste its screenshots. A note is optional.")
newstory_script = """
renderVals() {
  const st = this.state || {};
  const t = !!st.typing;
  return { talk: !t, typing: t, toType: () => this.setState({ typing: true }), toTalk: () => this.setState({ typing: false }),
           menuOpen: !!st.menu, toggleMenu: () => this.setState({ menu: !st.menu }) };
}
"""
newstory_typed_script = newstory_script.replace("const t = !!st.typing;", "const t = st.typing !== false;")

DROP = ('<button type="button" style="font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #ECEEF1; '
        'background: transparent; border: 1.5px dashed #4A515E; border-radius: 10px; padding: 0 16px; min-height: 44px; cursor: copy">' + IC["img"] + 'Drop or paste charts</button>')
QNOTE = '<button type="button" class="btn btn-q" style="padding: 0 10px; font-weight: 500">' + IC["mic"] + 'Add a note</button>'
NONE = lambda: A("")

daily = f'''
{title_block("Daily log", "Monday 16 November · MT5 synced 2 min ago", DAYNAV + '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}

{ANALYSIS}

<section aria-labelledby="today" style="display: flex; flex-direction: column; gap: 16px">
{h2('<span id="today">8 chart stories today</span>', '<span class="meta">Charts are enough. Notes and after charts are extras.</span>')}
<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px">
{story("todo", "EURUSD", "long", "Taken", "Main account", "+0.6R", PROFIT, None, None, "", NONE(), "From MT5 #48231. No screenshot? Scroll back on your chart and take one now. It still counts.")}
{story("done", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", NONE(), "4H supply pullback · Followed · Calm")}
{story("done", "GBPUSD", "short", "Taken", "Funded 100K", "+2.1R", PROFIT, GU["E"], GU["A"], "+3 charts", NONE(), "4H supply pullback · Followed · Confident")}
{story("done", "GBPUSD", "short", "Taken", "Funded 100K", "−1.0R", LOSS, gallery(221, "short", False), gallery(222, "short", False), "+1 chart", A(QNOTE), "4H supply pullback · Not followed")}
{story("done", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", A(READING), "No MT5 on this account, numbers read from your chart")}
{story("done", "AUDUSD", "long", "Running", "Main account", "Open", "#A3AAB5", gallery(211, "long", True), None, "+2 charts", NONE(), "Still open in MT5. When it closes you'll get one chance to add an after chart. Skipping is fine.")}
{story("done", "NZDUSD", "short", "Not filled", "Main account", "Open", "#A3AAB5", gallery(231, "short", True), None, "+1 chart", A("", MORE_OPEN), "Your limit order never triggered · stays out of your results")}
{story("done", "EURJPY", "long", "Watched", "No trade placed", "Open", "#A3AAB5", EJ["E"], None, "+2 charts", NONE(), "Add an after chart any time if you want to see how it played out")}
</ol>
</section>

<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 360px"><span style="font-size: 14px; font-weight: 600">USDCHF closed 8 seconds after opening</span><span class="meta">MT5 #48240 · −0.1R. Count it in your stats? If you leave this, it counts.</span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Count it</button><button type="button" class="btn btn-g">Leave it out</button></div>
</section>

<p class="meta" style="margin: 0">Nothing here carries over. Anything still without charts closes at your weekly review, with its numbers kept.</p>
'''

NOV = {d: (n, False) for d, n in NOV.items() for n in [n[0]]}
grid = "".join(cal_cell(d, *(NOV.get(d, (0, False)) if d else (0, False)), today=(d == 16), future=(d is not None and d > 16)) for d in cells)
CAL = CAL[:CAL.index('<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">')] + \
      f'<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px">{grid}</div>' + \
      f'<div style="display: flex; gap: 14px; font-size: 12px; color: #8C939F; padding-top: 8px; border-top: 1px solid #252A33"><span style="display: inline-flex; align-items: center; gap: 6px"><span aria-hidden="true" style="width: 12px; height: 12px; border-radius: 3px; background: #1B1F27"></span>Days you logged</span><span>No results shown here, by design</span></div></div>'
DAYNAV_OPEN = '<div style="position: relative; display: inline-flex">' + DAYNAV.replace('aria-haspopup="dialog" style="', 'aria-haspopup="dialog" aria-expanded="true" style="background: #1B1F27; ', 1) + CAL + '</div>'
daily_cal = daily.replace(DAYNAV, DAYNAV_OPEN, 1)
assert daily_cal != daily


# ================= CHART STRIP v3: your order, no roles =================
def CHART_MENU(name):
    items = [("Move left", "#ECEEF1"), ("Move right", "#ECEEF1"), ("Remove", LOSS)]
    return ('<div role="menu" aria-label="' + name + ' chart actions" style="position: absolute; z-index: 6; top: calc(100% + 4px); right: 0; width: 170px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
            + "".join(f'<button type="button" role="menuitem" style="font: inherit; font-size: 14px; text-align: left; color: {c}; background: transparent; border: 0; border-radius: 6px; padding: 0 10px; min-height: 38px; cursor: pointer">{t}</button>' for t, c in items)
            + '</div>')
def STRIP(menu):
    return ('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px">'
            + strip_tile(GU["W"], "Weekly", "first") + strip_tile(GU["D"], "", "second")
            + strip_tile(GU["4H"], "4H", "third", menu=menu) + strip_tile(GU["E"], "15m", "fourth")
            + ADD_TILE + '</div>'
            + '<p class="lbl" style="margin: 0">In the order you added them. Drag to reorder; they show in this order everywhere.</p>')
def _swap_strip(s, menu):
    i = s.index('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px">')
    j = s.index('</p>', i) + 4
    s = s[:i] + STRIP(menu) + s[j:]
    k = s.index('<div role="status" style="display: flex; flex-wrap: wrap; justify-content: space-between')
    m = s.index("That's wrong</button>", k); m = s.index('</div>', m) + 6
    s = s[:k] + s[m:]
    return s.replace('<span class="lbl">Read as GBPUSD · higher timeframes first where the chart shows them</span>', '<span class="lbl">Read as GBPUSD</span>')
newstory = _swap_strip(newstory, True)
newstory_typed = _swap_strip(newstory_typed, False)
assert "two positions" not in newstory + newstory_typed and "Entry</span>" not in newstory
