s = open('/home/claude/gen/gen2.py').read()

def rep(a, b, count=1):
    global s
    assert a in s, "MISSING: " + a[:80]
    s = s.replace(a, b, count)

def line_replace(prefix, new):
    global s
    i0 = s.index(prefix); i1 = s.index('\n', i0)
    s = s[:i0] + new + s[i1:]

REC = "'<button type=\"button\" class=\"btn btn-g\">' + IC[\"mic\"] + '{t}</button>'"
rec = lambda t: REC.replace("{t}", t)

# ---------- 1. Daily log: consistent voice-note states, record inline ----------
line_replace('{story("next", "GBPUSD"',
  '{story("next", "GBPUSD", "short", "Taken", "Funded 100K", "+2.1R", PROFIT, GU["E"], GU["A"], "+3 charts", \'<a href="Story.dc.html" class="btn btn-p">Review and save</a>\', "MT5 #48213 · voice note added")}')
line_replace('{story("todo", "XAUUSD"',
  '{story("todo", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", ' + rec("Record") + ', "MT5 #48227 and #11902 · same trade, attached to both")}')
line_replace('{story("todo", "GBPJPY"',
  '{story("todo", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", ' + rec("Record") + ', "No MT5 match · went to your default account for screenshots")}')
line_replace('{story("todo", "EURJPY"',
  '{story("todo", "EURJPY", "long", "Watched", "No trade placed", "Open", "#A3AAB5", EJ["E"], None, "+2 charts", ' + rec("Record") + ', "Outcome is checked against price data as it plays out")}')

# ---------- 2. Daily log: coming back after time away ----------
EARLIER = '''
<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-size: 14px; font-weight: 600">3 stories still open from last week</span><span class="meta">Their trades are already logged from MT5. Add a voice note if you remember, or save them as they are.</span></div>
<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q">Save as they are</button><button type="button" class="btn btn-g">Open</button></div>
</section>
'''
anchor = '<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">\n<div style="display: flex; gap: 12px; align-items: center; min-width: 0">{dot(ATTN)}'
rep(anchor, EARLIER.strip() + '\n\n' + anchor)

# ---------- 3. Weekly review: only claim what the data can support ----------
rep('You also passed on 4 setups that matched your rules, and 3 of them hit target.',
    'You also watched 4 setups without taking them. Price data shows 3 would have hit target.')
rep('Includes 2 of the setups you passed on.', 'Includes 2 of the setups you watched.')

# ---------- 4. Blind replay: no "right call" for an outcome ----------
rep("'You said long. Right call.'", "'You said long. It played out in your favour.'")
rep("'You skipped it. This one worked.'", "'You skipped it. This one went on to work.'")
rep("accuracy: pick === 'long' ? '10 of 14 right (71%)' : '9 of 14 right (64%)',",
    "accuracy: pick === 'long' ? 'your read matched the outcome on 10 of 14 charts' : 'your read matched the outcome on 9 of 14 charts',")
rep('<figcaption class="lbl">15m · everything after your entry candle is hidden</figcaption>',
    '<figcaption class="lbl">15m · redrawn from price data, so nothing after the entry exists on screen</figcaption>')
rep('''<span class="meta">This setup in replay: {{{{ accuracy }}}}</span>''',
    '''<span class="meta">This setup: {{{{ accuracy }}}}. One chart proves nothing; the trend over weeks does.</span>''')
rep('{statline("69%", "Your replay accuracy")}', '{statline("69%", "Replay: read matched outcome")}')

open('/home/claude/gen/gen2.py', 'w').write(s)
print("patched")
