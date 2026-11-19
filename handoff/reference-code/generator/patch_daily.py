s = open('/home/claude/gen/gen2.py').read()

def rep(a, b):
    global s
    assert a in s, "MISSING: " + a[:90]
    s = s.replace(a, b, 1)

# 5. remove manual entry; 4. say what can be added
rep('''{title_block("Daily log", "Monday 16 November", '<button type="button" class="btn btn-q">' + IC["plus"] + 'Log a trade manually</button><button type="button" class="btn btn-g">' + IC["img"] + 'Add screenshots</button>')}''',
    '''{title_block("Daily log", "Monday 16 November · drop files, paste images or TradingView links anywhere on this page", '<button type="button" class="btn btn-g">' + IC["img"] + 'Add screenshots</button>')}''')

# header counts
rep('''{h2('<span id="today">5 chart stories today</span>', '<span class="meta">1 of 5 done</span>')}
<span class="meta">From 4 MT5 trades and 18 screenshots. Sorted by pair, timeframe and when each screenshot was taken.</span>''',
    '''{h2('<span id="today">6 chart stories today</span>', '<span class="meta">1 of 6 done</span>')}
<span class="meta">From 5 MT5 trades and 20 screenshots. Sorted by pair, timeframe and when each screenshot was taken.</span>''')
rep('aria-valuemax="5"', 'aria-valuemax="6"')
rep('<div style="width: 20%; height: 100%; background: #ECEEF1"></div>', '<div style="width: 16.7%; height: 100%; background: #ECEEF1"></div>')

# rows: rebuild the list
i0 = s.index('{story("done", "EURUSD"')
i1 = s.index('</ol>', i0)
ROWS = '''{story("done", "EURUSD", "long", "Taken", "Main account", "+0.6R", PROFIT, None, None, "", '<span class="meta">Saved</span>', "MT5 #48231 · no screenshots. Add them any time.")}
{story("next", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", '<button type="button" class="btn btn-p">' + IC["check"] + 'Save</button>', "Voice note added · nothing to check")}
{story("todo", "GBPUSD", "short", "Taken", "Funded 100K", "+2.1R", PROFIT, GU["E"], GU["A"], "+3 charts", '<a href="Story.dc.html" class="btn btn-g">' + dot(ATTN) + 'Check 1 item</a>', "Voice note added · Location read from your chart")}
{story("todo", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", READING, "No MT5 match · went to your default account for screenshots")}
{story("todo", "AUDUSD", "long", "Running", "Main account", "Open", "#A3AAB5", gallery(211, "long", True), None, "+2 charts", '<button type="button" class="btn btn-g">' + IC["mic"] + 'Record</button>', "Still open in MT5 · the result fills in when it closes")}
{story("todo", "EURJPY", "long", "Watched", "No trade placed", "Open", "#A3AAB5", EJ["E"], None, "+2 charts", '<button type="button" class="btn btn-g">' + IC["mic"] + 'Record</button>', "Add an after chart any time to give it a result")}
'''
s = s[:i0] + ROWS + s[i1:]

# reading state helper (defined before daily page)
READ = '''READING = '<div role="status" style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #C9CED6; min-height: 44px"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#252A33" stroke-width="3"></circle><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#B9A6FF" stroke-width="3" stroke-linecap="round"></path></svg>Reading your note…</div>'
'''
rep('\ndaily = f\'\'\'', '\n' + READ + 'daily = f\'\'\'')

rep('"Main": 1540,', '"Main": 1700,')
open('/home/claude/gen/gen2.py', 'w').write(s)
print("patched")
