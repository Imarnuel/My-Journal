s = open('/home/claude/gen/gen2.py').read()

def rep(a, b, n=1):
    global s
    assert a in s, "MISSING: " + a[:100]
    s = s.replace(a, b, n)

# ---------- nav: Playbook home + Settings ----------
rep('items = [("Main.dc.html", "log", "Daily log"), ("Playbook.dc.html", "book", "Playbook"),',
    'items = [("Main.dc.html", "log", "Daily log"), ("PlaybookHome.dc.html", "book", "Playbook"),')
rep('("Accounts.dc.html", "acct", "Accounts")]', '("Accounts.dc.html", "acct", "Accounts"), ("Settings.dc.html", "gear", "Settings")]')
rep('    "plus": I(', '''    "gear": I('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>'),
    "plus": I(''')

# ---------- setup page: breadcrumb, edit, name-this-setup, lessons ----------
rep('<a href="Playbook.dc.html" style="display: inline-flex; align-items: center;', '<a href="PlaybookHome.dc.html" style="display: inline-flex; align-items: center;')
rep('''{h2('<span id="rules">Rules</span>', '<button type="button" class="btn btn-q" style="min-height: 32px; padding: 0 4px">Edit</button>')}''',
    '''{h2('<span id="rules">Rules</span>', '<a href="SetupEdit.dc.html" class="btn btn-q" style="min-height: 32px; padding: 0 4px">Edit</a>')}''')
rep('<button type="button" class="btn btn-g">Name this setup</button>', '<a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a>')
rep('''<section aria-labelledby="pat" style="display: flex; flex-direction: column; gap: 4px">''',
    '''<section aria-labelledby="les" style="display: flex; flex-direction: column">
{h2('<span id="les">Lessons</span>', '<span class="lbl">From your voice notes</span>')}
<ul style="margin: 8px 0 0; padding: 0">
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Same patience on Gold"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">GBPUSD · 16 Nov</a></li>
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Wait for the candle to close before entering"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">GBPJPY · 11 Nov</a></li>
<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">"Skip it when the zone has been tested twice"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">XAUUSD · 6 Nov</a></li>
</ul>
</section>
<section aria-labelledby="pat" style="display: flex; flex-direction: column; gap: 4px">''')

# ---------- first run: add setups goes to the editor ----------
rep('<a href="Playbook.dc.html" class="btn btn-p">Add setups</a>', '<a href="SetupEdit.dc.html" class="btn btn-p">Add setups</a>')

# ---------- daily log: past days + cross-day after charts ----------
rep('''{title_block("Daily log", "Monday 16 November · drop files, paste images or TradingView links anywhere on this page", '<button type="button" class="btn btn-g">' + IC["img"] + 'Add screenshots</button>')}''',
    '''{title_block("Daily log", "Monday 16 November · drop files, paste images or TradingView links anywhere on this page", DAYNAV + '<button type="button" class="btn btn-g">' + IC["img"] + 'Add screenshots</button>')}''')
rep('<span class="meta">From 5 MT5 trades and 21 screenshots. Sorted by pair, timeframe and when each screenshot was taken.</span>',
    '<span class="meta">From 5 MT5 trades and 21 screenshots. Sorted by pair, timeframe and when each screenshot was taken.</span>\n<span style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #C9CED6">' + "{dot(PROFIT, 7)}" + '2 more were after charts for earlier stories: USDCAD from Friday and the NZDUSD setup you watched Thursday.</span>')
DAYNAV = '''DAYNAV = '<div role="group" aria-label="Choose day" style="display: flex; align-items: center; border: 1px solid #353B46; border-radius: 10px"><button type="button" aria-label="Previous day" style="width: 40px; min-height: 42px; border: 0; background: transparent; color: #ECEEF1; cursor: pointer; display: flex; align-items: center; justify-content: center">' + IC["back"] + '</button><button type="button" aria-haspopup="dialog" style="font: inherit; font-size: 14px; font-weight: 500; color: #ECEEF1; background: transparent; border: 0; border-left: 1px solid #353B46; border-right: 1px solid #353B46; padding: 0 14px; min-height: 42px; cursor: pointer">Today</button><button type="button" aria-label="Next day" disabled style="width: 40px; min-height: 42px; border: 0; background: transparent; color: #4A515E; display: flex; align-items: center; justify-content: center">' + IC["right"] + '</button></div>'
'''
rep('\nREADING = ', '\n' + DAYNAV + 'READING = ')

# ---------- story: position + pin as textbook ----------
rep('''<a href="Main.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; align-self: flex-start; min-height: 32px">{IC["back"]}Daily log</a>
{title_block("GBPUSD short"''',
    '''<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px"><a href="Main.dc.html" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #A3AAB5; text-decoration: none; min-height: 32px">{IC["back"]}Daily log</a><span class="meta">Story 3 of 6</span></div>
{title_block("GBPUSD short"''')
rep('''<button type="button" class="btn btn-q" style="padding: 0 8px">Edit details</button>''',
    '''<button type="button" class="btn btn-q" style="padding: 0 8px" aria-pressed="false">Pin as textbook</button><button type="button" class="btn btn-q" style="padding: 0 8px">Edit details</button>''')

# ---------- weekly review: notes step, self-check, 6 steps ----------
rep('About 10 minutes · 5 steps', 'About 10 minutes · 6 steps')
rep('{step(4, "Last week\'s rule",', '{step(4, "Notes you made", NOTES)}\n{step(5, "Last week\'s rule",')
rep('{step(5, "Next week\'s rule",', '{step(6, "Next week\'s rule",')
rep('rule_opt("Write my own", "Say it or type it")', 'rule_opt("Write my own", "We\\\'ll ask if you kept it next week")')
NOTES = '''NOTES = '<ul style="margin: 0; padding: 0; max-width: 640px">' + "".join(f'<li style="list-style: none; display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid #1B1F27"><span style="font-size: 15px">"{t}"</span><a href="Story.dc.html" class="lbl" style="color: #8C939F; white-space: nowrap">{m}</a></li>' for t, m in (("Same patience on Gold", "GBPUSD · 16 Nov"), ("Wait for the candle to close before entering", "GBPJPY · 11 Nov"))) + '</ul>'
'''
rep('\nWEEK = ', '\n' + NOTES + 'WEEK = ')

# ---------- accounts: edit link, reconnect status, archived ----------
rep('<a href="#edit" style="display: grid;', '<a href="EditAccount.dc.html" style="display: grid;')
rep('{arow("Demo account", "Demo", True, "MT5 · last synced yesterday", "warn")}', '{arow("Demo account", "Demo", True, "MT5 · reconnect needed", "warn")}')
rep('''</ul>
</section>
<p class="meta" style="margin: 0">Practice accounts never mix''', '''</ul>
<button type="button" aria-expanded="false" style="font: inherit; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 16px; min-height: 56px; border: 0; border-top: 1px solid #1B1F27; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px"><span>Archived <span style="color: #8C939F">(2)</span> · Challenge 25K, Funded 50K</span><span style="display: flex">{IC["chev"]}</span></button>
</section>
<p class="meta" style="margin: 0">Practice accounts never mix''')

# ---------- write section: new pages + two-row layout ----------
w0 = s.index('# ---------- write ----------')
s = s[:w0] + '''# ---------- write ----------
exec(open("/home/claude/gen/parts.py").read())
H = {"Start": 860, "Main": 1760, "Story": 1300, "PlaybookHome": 980, "Playbook": 1760, "SetupEdit": 1180, "Review": 1640, "ReviewEarly": 1180,
     "Accounts": 1000, "AddAccount": 1180, "EditAccount": 1220, "Settings": 1560, "States": 1000}
files = {
    "Start.dc.html": page("Welcome", H["Start"], startpage, "Daily log"),
    "Main.dc.html": page("Daily log", H["Main"], daily, "Daily log"),
    "Story.dc.html": page("Chart story: GBPUSD short", H["Story"], storypage, "Daily log"),
    "PlaybookHome.dc.html": page("Playbook", H["PlaybookHome"], playbook_home, "Playbook"),
    "Playbook.dc.html": page("Playbook: 4H supply pullback", H["Playbook"], playbook, "Playbook"),
    "SetupEdit.dc.html": page("New setup", H["SetupEdit"], setup_edit, "Playbook"),
    "Review.dc.html": page("Weekly review", H["Review"], review, "Weekly review"),
    "ReviewEarly.dc.html": page("Weekly review, first week", H["ReviewEarly"], review_early, "Weekly review"),
    "Accounts.dc.html": page("Accounts", H["Accounts"], accounts, "Accounts"),
    "AddAccount.dc.html": page("Add an account", H["AddAccount"], addacct, "Accounts", addacct_script),
    "EditAccount.dc.html": page("Edit account", H["EditAccount"], edit_acct, "Accounts"),
    "Settings.dc.html": page("Settings", H["Settings"], settings, "Settings"),
    "States.dc.html": page("Empty and problem states", H["States"], states, ""),
}
for k, v in files.items():
    assert "\\u2014" not in v, k
    open(os.path.join(OUT, k), "w").write(v)

rows = [["Start.dc.html", "Main.dc.html", "Story.dc.html", "PlaybookHome.dc.html", "Playbook.dc.html", "SetupEdit.dc.html", "Review.dc.html", "ReviewEarly.dc.html"],
        ["Accounts.dc.html", "AddAccount.dc.html", "EditAccount.dc.html", "Settings.dc.html", "States.dc.html"]]
titles = {"Start.dc.html": "0 · First run", "Main.dc.html": "1 · Daily log", "Story.dc.html": "2 · Chart story",
          "PlaybookHome.dc.html": "3 · Playbook", "Playbook.dc.html": "4 · Setup page, account picker open", "SetupEdit.dc.html": "5 · New setup (from unsorted stories)",
          "Review.dc.html": "6 · Weekly review", "ReviewEarly.dc.html": "7 · Weekly review, first week",
          "Accounts.dc.html": "8 · Accounts", "AddAccount.dc.html": "9 · Add an account (clickable)", "EditAccount.dc.html": "10 · Edit account",
          "Settings.dc.html": "11 · Settings", "States.dc.html": "12 · Empty and problem states"}
boards = {}; order = []; y = 0; maxw = 0
row_tops = []
for r in rows:
    x = 0; row_tops.append(y)
    for f in r:
        boards[f] = {"x": x, "y": y, "w": 1440, "h": H[f.split(".")[0]], "title": titles[f], "expand": "fill", "is_interactive": True}
        order.append(f); x += 1520
    maxw = max(maxw, x - 80)
    y += max(H[f.split(".")[0]] for f in r) + 420
canvas = json.load(open(os.path.join(OUT, "canvas.json")))
canvas["boards"] = boards; canvas["order"] = order
canvas["notes"]["t1"]["maxW"] = 8 * 1520 - 80
canvas["notes"]["t1"]["text"] = "Trading journal concept: log daily, learn weekly"
canvas["notes"]["t2"] = {"x": 0, "y": row_tops[1] - 320, "text": "Accounts, settings and states", "kind": "title1", "maxW": 5 * 1520 - 80}
canvas["notes"]["s1"]["text"] = ("Sample data throughout. Setups, rules, trades, accounts and numbers are examples to swap for yours.\\n\\n"
    "Charts are the record. Everything else (tags, numbers, patterns) exists to help you read them.\\n\\n"
    "Daily log: screenshots, one voice note per chart story, save. Insights only arrive in the weekly review, on the day you choose.")
json.dump(canvas, open(os.path.join(OUT, "canvas.json"), "w"), indent=1)
print("ok", {k: len(v) for k, v in files.items()})
'''
open('/home/claude/gen/gen2.py', 'w').write(s)
print("patched")
