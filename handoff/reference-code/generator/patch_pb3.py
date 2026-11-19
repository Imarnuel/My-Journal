s = open('/home/claude/gen/gen2.py').read()
p = open('/home/claude/gen/parts.py').read()

def rep(src, a, b):
    assert a in src, "MISSING: " + a[:90]
    return src.replace(a, b, 1)

# ---------- shared: cumulative R sparkline ----------
SPARK = '''
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
'''
s = rep(s, '\ndef RULE_GROUP(', SPARK + '\ndef RULE_GROUP(')

# ---------- setup page: trend in the stat line ----------
s = rep(s, '{statline("9", "Watched")}\n</div>',
        '{statline("9", "Watched")}\n<div style="display: flex; flex-direction: column; gap: 2px">{spark(R_SUPPLY)}<span class="lbl">Last 20 trades, in R</span></div>\n</div>')

# ---------- setup page: lessons and patterns move into tabs ----------
les0 = s.index('<section aria-labelledby="les"'); les1 = s.index('</section>', les0) + len('</section>\n')
lessons = s[les0:les1]; s = s[:les0] + s[les1:]
pat0 = s.index('<section aria-labelledby="pat"'); pat1 = s.index('</section>', pat0) + len('</section>\n')
patterns = s[pat0:pat1]; s = s[:pat0] + s[pat1:]

lessons_panel = lessons.replace('''{h2('<span id="les">Lessons</span>', '<span class="lbl">From your voice notes</span>')}''', '<span class="lbl">From your voice notes on stories in this setup</span>').replace('aria-labelledby="les"', 'aria-label="Lessons"')
patterns_panel = patterns.replace('''{h2('<span id="pat">Patterns</span>', '<span class="lbl">Win rate</span>')}''', '<span class="lbl">Win rate, split by things recorded on every trade</span>').replace('aria-labelledby="pat"', 'aria-label="Patterns"')

# tab bar: one variant per active tab so styling never depends on a bound style string
def tabbar(active):
    out = []
    for key, label, n in (("Ex", "Examples", "45"), ("Pat", "Patterns", "3"), ("Les", "Lessons", "3")):
        on = key == active
        out.append(f'<button type="button" role="tab" aria-selected="{"true" if on else "false"}" onClick="{{{{{{{{ go{key} }}}}}}}}" style="font: inherit; font-size: 15px; font-weight: {600 if on else 500}; color: {"#ECEEF1" if on else "#A3AAB5"}; background: transparent; border: 0; border-bottom: 2px solid {"#ECEEF1" if on else "transparent"}; padding: 0 2px; min-height: 44px; cursor: pointer">{label} <span style="color: #8C939F; font-weight: 500">{n}</span></button>')
    return "".join(out)
bars = ('<sc-if value="{{{{ isEx }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; gap: 24px">' + tabbar("Ex") + '</div></sc-if>'
        '<sc-if value="{{{{ isPat }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; gap: 24px">' + tabbar("Pat") + '</div></sc-if>'
        '<sc-if value="{{{{ isLes }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; gap: 24px">' + tabbar("Les") + '</div></sc-if>')

h0 = s.index('<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid #1B1F27">\n<h2 id="ex"')
h1 = s.index('<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px">', h0)
old_head = s[h0:h1]
filters = old_head[old_head.index('<div role="group" aria-label="Filter examples"'):]
filters = filters[:filters.index('</div>') + len('</div>')]
new_head = ('<div role="tablist" aria-label="Setup sections" style="border-bottom: 1px solid #1B1F27">' + bars + '</div>\n'
            '<sc-if value="{{{{ isEx }}}}" hint-placeholder-val="{{{{ true }}}}">\n<div style="display: flex; flex-direction: column; gap: 20px">\n' + filters + '\n')
s = s[:h0] + new_head + s[h1:]

show_all = '<button type="button" class="btn btn-g" style="align-self: center">Show all 45</button>\n'
s = rep(s, show_all, show_all + '</div>\n</sc-if>\n<sc-if value="{{{{ isPat }}}}" hint-placeholder-val="{{{{ false }}}}">\n' + patterns_panel + '</sc-if>\n<sc-if value="{{{{ isLes }}}}" hint-placeholder-val="{{{{ false }}}}">\n' + lessons_panel + '</sc-if>\n')
s = rep(s, '<section aria-labelledby="ex" style="flex: 2 1 560px;', '<section aria-label="Examples, patterns and lessons" style="flex: 2 1 560px;')

s = rep(s, '    "Playbook.dc.html": page("Playbook: 4H supply pullback", H["Playbook"], playbook, "Playbook"),',
           '    "Playbook.dc.html": page("Playbook: 4H supply pullback", H["Playbook"], playbook, "Playbook", SETUP_TABS_SCRIPT),')
s = rep(s, '\ndef RULE_GROUP(', '''
SETUP_TABS_SCRIPT = """
renderVals() {
  const t = (this.state && this.state.tab) || 'ex';
  return { isEx: t === 'ex', isPat: t === 'pat', isLes: t === 'les',
    goEx: () => this.setState({ tab: 'ex' }), goPat: () => this.setState({ tab: 'pat' }), goLes: () => this.setState({ tab: 'les' }) };
}
"""
def RULE_GROUP(''')

# ---------- playbook home: menu, archive, trend ----------
p = rep(p, '''def setup_card(href, chart, name, line, figure, flag=""):
    f = f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #A3AAB5">{dot(ATTN, 7)}{flag}</span>' if flag else ""
    return card_link(href, f'<div class="chart">{chart}</div><div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><span style="font-size: 16px; font-weight: 600">{name}</span><span class="num" style="font-size: 15px; font-weight: 600">{figure}</span></div><div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap"><span class="lbl">{line}</span>{f}</div>')''',
'''SETUP_MENU = ('<div role="menu" style="position: absolute; z-index: 5; top: 52px; right: 12px; width: 190px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
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
    return f'<div style="position: relative">{card_link(href, inner)}{more}</div>\'''')
p = rep(p, '{setup_card("Playbook.dc.html", gallery(101, "short", True), "4H supply pullback", "34 taken · 9 watched", "+0.5R")}',
           '{setup_card("Playbook.dc.html", gallery(101, "short", True), "4H supply pullback", "34 taken · 9 watched", "+0.5R", rs=R_SUPPLY)}')
p = rep(p, '{setup_card("Playbook.dc.html", gallery(121, "long", True), "London breakout", "12 taken · 3 watched", "+0.3R", "Early signal")}',
           '{setup_card("Playbook.dc.html", gallery(121, "long", True), "London breakout", "12 taken · 3 watched", "+0.3R", "Early signal", rs=R_LONDON, menu_open=True)}')
p = rep(p, '''<a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a></div>
</section>
\'\'\'''', '''<a href="SetupEdit.dc.html" class="btn btn-g">Name this setup</a></div>
</section>
<button type="button" aria-expanded="false" style="font: inherit; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 4px; min-height: 48px; border: 0; border-top: 1px solid #1B1F27; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px; text-align: left"><span>Archived setups <span style="color: #8C939F">(1)</span> · Asia breakout</span><span style="display: flex">{IC["chev"]}</span></button>
\'\'\'''')

open('/home/claude/gen/gen2.py', 'w').write(s)
open('/home/claude/gen/parts.py', 'w').write(p)
print("patched")
