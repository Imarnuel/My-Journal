s = open('/home/claude/gen/gen2.py').read()
p = open('/home/claude/gen/parts.py').read()

def rep(src, a, b):
    assert a in src, "MISSING: " + a[:90]
    return src.replace(a, b, 1)

# ---------- imports for higher-timeframe strips ----------
s = rep(s, 'from charts import GU, XA, EJ, RP, gallery, svg, ru_15', 'from charts import GU, XA, EJ, RP, gallery, svg, ru_15, series')

# ---------- example card: full chart story (HTF strip + entry/after) ----------
old_ex = s[s.index('def ex(svgs, pair, meta, r, col, tag=""):'):s.index("</a>'''", s.index('def ex(svgs')) + len("</a>'''")]
new_ex = '''def htf_strip(seed, bear):
    d = -1 if bear else 1
    mini = lambda k, segs: f'<figure style="margin: 0; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px"><div class="chart">{svg(series(seed * 10 + k, segs), "Higher timeframe chart")}</div><figcaption style="font-size: 11px; color: #8C939F">{("Weekly", "Daily", "4H")[k]}</figcaption></figure>'
    return ('<div style="display: flex; gap: 6px">' + mini(0, [(24, 0.45 * d), (8, -0.3 * d)]) + mini(1, [(18, 0.5 * d), (10, -0.5 * d), (4, 0.2 * d)])
            + mini(2, [(14, 0.55 * d), (14, -0.6 * d), (6, 0.1 * d)]) + '</div>')

def ex(svgs, pair, meta, r, col, tag="", seed=1, bear=True):
    t = f'<span style="font-size: 12px; color: #A3AAB5">{tag}</span>' if tag else ""
    return f\'\'\'<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1; padding: 12px; border: 1px solid #1B1F27; border-radius: 12px">
{htf_strip(seed, bear)}
<div class="chart">{svgs}</div>
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-top: 2px"><span style="font-size: 14px; font-weight: 600">{pair}</span><span class="num" style="font-size: 14px; font-weight: 600; color: {col}">{r}</span></div>
<div style="display: flex; justify-content: space-between; gap: 8px"><span class="lbl">{meta}</span>{t}</div>
</a>\'\'\''''
s = s.replace(old_ex, new_ex, 1)

# pass seeds so each example gets its own context charts
lines = s.split("\n")
for k, ln in enumerate(lines):
    if ln.startswith('{ex(gallery(') and ln.endswith(')}'):
        sd = ln[len('{ex(gallery('):].split(',')[0]
        lines[k] = ln[:-2] + ', seed=' + sd + ')}'
s = "\n".join(lines)

# ---------- rules grouped: Context / Entry / Exit ----------
s = rep(s, '''<ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; color: #C9CED6; font-size: 14px">
<li>Daily trend is bearish</li><li>4H pulls back into a marked supply zone</li><li>15m breaks structure inside the zone</li><li>Enter on the retest</li><li>Stop above the zone, target 2R or more</li>
</ol>''', '''{RULE_GROUP("Context", "Higher timeframes", ["Daily trend is bearish", "4H pulls back into a marked supply zone"])}
{RULE_GROUP("Entry", "Lower timeframe", ["15m breaks structure inside the zone", "Enter on the retest"])}
{RULE_GROUP("Exit", "", ["Stop above the zone", "Target 2R or more"])}''')
s = rep(s, '\ndef htf_strip(', '''
def RULE_GROUP(name, sub, rules):
    sb = f'<span class="lbl">{sub}</span>' if sub else ""
    items = "".join(f'<li>{r}</li>' for r in rules)
    return f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 10px 0; border-top: 1px solid #1B1F27"><div style="display: flex; justify-content: space-between; gap: 8px"><span style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #A3AAB5">{name}</span>{sb}</div><ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; color: #C9CED6; font-size: 14px">{items}</ul></div>'

def htf_strip(''')

# ---------- setup editor: same grouping ----------
old_rules = p[p.index('{RULE("Daily trend is bullish")}'):p.index('<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 0; border-top: 1px solid #1B1F27; text-align: left; padding: 12px 0; cursor: pointer">+ Add a rule</button>') + len('<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 0; border-top: 1px solid #1B1F27; text-align: left; padding: 12px 0; cursor: pointer">+ Add a rule</button>')]
new_rules = '''{EGROUP("Context", "Higher timeframes", ["Daily trend is bullish", "Price sweeps the Asian session low"])}
{EGROUP("Entry", "Lower timeframe", ["15m breaks structure after the sweep", "Enter on the retest"])}
{EGROUP("Exit", "", ["Stop below the sweep", "Target the previous high"])}'''
p = p.replace(old_rules, new_rules, 1)
p = rep(p, 'SETUP_THUMBS = ', '''ADD_RULE = '<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 0; border-top: 1px solid #1B1F27; text-align: left; padding: 10px 0; cursor: pointer">+ Add a rule</button>'
def EGROUP(name, sub, rules):
    sb = f'<span class="lbl">{sub}</span>' if sub else ""
    return f'<div style="display: flex; flex-direction: column; margin-bottom: 14px"><div style="display: flex; justify-content: space-between; gap: 8px; padding: 6px 0"><span style="font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #A3AAB5">{name}</span>{sb}</div>' + "".join(RULE(r) for r in rules) + ADD_RULE + '</div>'
SETUP_THUMBS = ''')

open('/home/claude/gen/gen2.py', 'w').write(s)
open('/home/claude/gen/parts.py', 'w').write(p)
print("patched")
