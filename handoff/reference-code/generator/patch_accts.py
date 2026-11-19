s = open('/home/claude/gen/gen2.py').read()
VN = "'<a href=\"Story.dc.html\" class=\"btn btn-g\">' + IC[\"mic\"] + 'Add voice note</a>'"

def rep(a, b):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b)

# --- daily log: no account questions ---
i0 = s.index('{story("todo", "XAUUSD"'); i1 = s.index('\n', i0)
s = s[:i0] + '{story("todo", "XAUUSD", "long", "Taken", "Main account and Funded 100K", "−1.0R", LOSS, XA["E"], XA["A"], "+3 charts", ' + VN + ', "MT5 #48227 and #11902 · same trade, attached to both")}' + s[i1:]
i0 = s.index('{story("todo", "GBPJPY"'); i1 = s.index('\n', i0)
s = s[:i0] + '{story("todo", "GBPJPY", "short", "Taken", "Challenge 50K", "+1.4R", PROFIT, gallery(201, "short", True), gallery(202, "short", True), "+2 charts", ' + VN + ', "No MT5 match · went to your default account for screenshots")}' + s[i1:]

# --- accounts: default badge ---
rep('def arow(name, typ, prac, conn, health):', 'def arow(name, typ, prac, conn, health, badge=""):')
TAGLINE = "    tag = '<span style=\"font-size: 12px; color: #A3AAB5; border: 1px solid #353B46; border-radius: 999px; padding: 1px 8px; margin-left: 10px\">Practice</span>' if prac else \"\""
rep(TAGLINE, TAGLINE + "\n    if badge: tag += '<span style=\"font-size: 12px; color: #A3AAB5; border: 1px solid #353B46; border-radius: 999px; padding: 1px 8px; margin-left: 10px\">' + badge + '</span>'")
rep('{arow("Challenge 50K", "Prop firm", False, "Screenshots", "none")}',
    '{arow("Challenge 50K", "Prop firm", False, "Screenshots", "none", "Default for screenshots")}')

# --- accounts: set-once rules ---
RULES = '''
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
P = '<p class="meta" style="margin: 0">Practice accounts never mix into your numbers unless you tick them. They always feed your playbook and blind replay.</p>'
rep(P, P + RULES)
rep('"Accounts": 720}', '"Accounts": 940}')
open('/home/claude/gen/gen2.py', 'w').write(s)
print("patched")
