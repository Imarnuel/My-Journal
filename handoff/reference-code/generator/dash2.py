# DASHBOARD v2: computed from the one dataset. Period and accounts change every number.
# Rules: R only; running, watched, not filled and analysis stay out; win rate and expectancy need 5 trades in a row
# (else "Too few to rate"); under 5 trades in the period the numbers give way to a short message and the stories.
# "R by day" becomes "R by week" for 3 months. Recent chart stories and the no-charts card ignore period and accounts.
import json as _dj
_BG = "grid-template-columns: minmax(0, 1.7fr) 64px 72px 92px minmax(90px, 1fr) 64px"
def _bhead(first, g):
    cells = [first, "Trades", "Win rate", "Expectancy", "", "Net"]; al = ["left", "right", "right", "right", "left", "right"]
    return f'<div style="display: grid; {g}; gap: 14px; padding: 0 0 8px; align-items: end">' + "".join(f'<span class="lbl" style="text-align: {a}">{c}</span>' for c, a in zip(cells, al)) + '</div>'

DASH_DATA = [dict(id=e["id"], d=e["date"], t=e["time"], p=e["pair"], dir=e["dir"], st=e["status"], a=e["account"], r=e["r"], s=e["setup"],
                  se=e["session"], f=e["followed"], m=e["mistakes"], n=e["charts"], c=chart_key(e), mt5=e["mt5"]) for e in ENTRIES]
SETUP_THUMB = {SU: "sw0", LB: "lw1", AR: "sw2"}
_latest_take = TAKES["2026-11-09"]

_TILE = lambda lab, v, sub, col=None: (f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 18px 18px 16px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">'
                                       f'<span class="lbl">{lab}</span><span class="num" style="font-size: 28px; font-weight: 600; line-height: 1.15; color: {col or "#ECEEF1"}">{v}</span><span class="lbl">{sub}</span></div>')
TILES2 = ('<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px">'
          + _TILE("Net R", "{{ net }}", "{{ ddTxt }}", "{{ netCol }}") + _TILE("Expectancy", "{{ expR }}", "What an average trade made")
          + _TILE("Win rate", "{{ wr }}", "{{ wrSub }}") + _TILE("Plan followed", "{{ fol }}", "{{ folSub }}") + _TILE("Trades taken", "{{ nT }}", "{{ nSub }}") + '</div>')

EQ = ('<div class="keq" style="position: relative">'
      '<svg width="100%" viewBox="0 0 600 248" role="img" aria-label="{{ eqAria }}" style="display: block; overflow: visible; font-family: inherit">'
      '<defs><linearGradient id="keqFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--text-1); stop-opacity: 0.07"></stop><stop offset="1" style="stop-color: var(--text-1); stop-opacity: 0"></stop></linearGradient>'
      '<linearGradient id="keqDd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--loss); stop-opacity: 0.14"></stop><stop offset="1" style="stop-color: var(--loss); stop-opacity: 0.05"></stop></linearGradient></defs>'
      '<sc-for list="{{ grid }}" as="g" hint-placeholder-count="3"><line x1="40" y1="{{ g.y }}" x2="600" y2="{{ g.y }}" style="stroke: {{ g.stroke }}; stroke-dasharray: {{ g.dash }}"></line>'
      '<text x="0" y="{{ g.ty }}" font-size="12" style="fill: var(--text-3)">{{ g.label }}</text></sc-for>'
      '<path d="{{ eqArea }}" style="fill: url(#keqFill)"></path>'
      '<path d="{{ ddPath }}" style="fill: url(#keqDd)"></path>'
      '<path class="kdraw" pathLength="1" d="{{ eqPath }}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke: var(--text-1)"></path>'
      '<circle cx="{{ endX }}" cy="{{ endY }}" r="9" style="fill: var(--text-1); fill-opacity: 0.08"></circle>'
      '<circle cx="{{ endX }}" cy="{{ endY }}" r="4" stroke-width="2" style="fill: var(--surface-2); stroke: var(--text-1)"></circle>'
      '<sc-for list="{{ ticks }}" as="k" hint-placeholder-count="3"><text x="{{ k.x }}" y="244" text-anchor="{{ k.anchor }}" font-size="12" style="fill: var(--text-3)">{{ k.label }}</text></sc-for>'
      '</svg>'
      '<sc-for list="{{ eqPts }}" as="q" hint-placeholder-count="12"><div class="kpt" style="left: {{ q.hl }}%; width: {{ q.hw }}%">'
      '<div class="kpt-on" aria-hidden="true"><span class="kpt-line" style="left: {{ q.cx }}%"></span><span class="kpt-dot" style="left: {{ q.cx }}%; top: {{ q.cy }}%"></span>'
      '<span class="ktip" data-a="{{ q.ta }}" style="left: {{ q.cx }}%"><span class="ktip-k">{{ q.when }}</span><span class="ktip-v"><span class="num">{{ q.tot }}</span><span class="num" style="color: {{ q.col }}">{{ q.r }}</span></span></span></div></div></sc-for>'
      '</div>')

BARS = ('<div class="kbars" role="img" aria-label="{{ barAria }}" style="display: flex; gap: 4px; margin-top: 0; flex: 1">'
        '<sc-for list="{{ bars }}" as="b" hint-placeholder-count="8">'
        '<div class="kbar" style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; position: relative; padding-top: 52px">'
        '<div style="height: 84px; width: 100%; display: flex; align-items: flex-end; justify-content: center"><div class="kbar-fill" style="height: {{ b.up }}px; width: 50%; max-width: 14px; border-radius: 3px 3px 1px 1px; background: {{ b.col }}"></div></div>'
        '<div style="height: 1px; width: 100%; background: #353B46"></div>'
        '<div style="height: 84px; width: 100%; display: flex; align-items: flex-start; justify-content: center"><div class="kbar-fill" style="height: {{ b.down }}px; width: 50%; max-width: 14px; border-radius: 1px 1px 3px 3px; background: {{ b.col }}"></div></div>'
        '<span class="lbl" style="font-size: 12px; margin-top: 8px; white-space: nowrap">{{ b.label }}</span>'
        '<div class="ktip ktip-bar" role="presentation"><span class="ktip-k">{{ b.when }}</span><span class="ktip-v"><span class="num" style="color: {{ b.col }}">{{ b.r }}</span><span>{{ b.n }}</span></span></div>'
        '</div></sc-for></div>')

TREND2 = f'''<div style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 20px">
<section aria-labelledby="eqh" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 id="eqh" style="margin: 0; font-size: 16px; font-weight: 600">R over time</h2>
<span style="display: inline-flex; align-items: center; gap: 12px"><sc-if value="{{{{ eqChart }}}}" hint-placeholder-val="{{{{ true }}}}"><span style="display: inline-flex; align-items: center; gap: 6px" class="lbl"><span aria-hidden="true" style="width: 8px; height: 8px; border-radius: 2px; background: #FF9A4D; opacity: 0.35"></span>Drawdown from peak</span></sc-if>
<button type="button" class="btn btn-q ktab-tog" aria-pressed="{{{{ eqTab }}}}" onClick="{{{{ eqTabFlip }}}}">{{{{ eqTabLbl }}}}</button></span></div>
<sc-if value="{{{{ eqChart }}}}" hint-placeholder-val="{{{{ true }}}}">{EQ}</sc-if>
<sc-if value="{{{{ eqTab }}}}" hint-placeholder-val="{{{{ false }}}}"><div class="ktable-wrap"><div class="ktable" role="table" aria-label="Each trade in the period, oldest first"><div role="row" class="ktr kth"><span role="columnheader">Trade</span><span role="columnheader" class="r">Result</span><span role="columnheader" class="r">Running total</span></div><sc-for list="{{{{ eqRows }}}}" as="q" hint-placeholder-count="8"><div role="row" class="ktr"><span role="cell">{{{{ q.when }}}}</span><span role="cell" class="r num" style="color: {{{{ q.col }}}}">{{{{ q.r }}}}</span><span role="cell" class="r num">{{{{ q.totN }}}}</span></div></sc-for></div></div></sc-if>
</section>
<section aria-labelledby="dayh" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap"><h2 id="dayh" style="margin: 0; font-size: 16px; font-weight: 600">{{{{ barTitle }}}}</h2>
<span style="display: inline-flex; align-items: center; gap: 12px"><span class="lbl">{{{{ barUp }}}}</span><button type="button" class="btn btn-q ktab-tog" aria-pressed="{{{{ barTab }}}}" onClick="{{{{ barTabFlip }}}}">{{{{ barTabLbl }}}}</button></span></div>
<sc-if value="{{{{ barChart }}}}" hint-placeholder-val="{{{{ true }}}}">{BARS}</sc-if>
<sc-if value="{{{{ barTab }}}}" hint-placeholder-val="{{{{ false }}}}"><div class="ktable-wrap"><div class="ktable" role="table" aria-label="{{{{ barTitle }}}}"><div role="row" class="ktr kth"><span role="columnheader">{{{{ barCol }}}}</span><span role="columnheader" class="r">Trades</span><span role="columnheader" class="r">Result</span></div><sc-for list="{{{{ bars }}}}" as="b" hint-placeholder-count="8"><div role="row" class="ktr"><span role="cell">{{{{ b.when }}}}</span><span role="cell" class="r num">{{{{ b.cnt }}}}</span><span role="cell" class="r num" style="color: {{{{ b.col }}}}">{{{{ b.r }}}}</span></div></sc-for></div></div></sc-if>
<div style="display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: auto; padding-top: 10px; border-top: 1px solid #1B1F27">
<span class="lbl">Best <span class="num" style="color: #5BA2FF; font-weight: 600">{{{{ bestR }}}}</span> · {{{{ bestL }}}}</span>
<span class="lbl">Worst <span class="num" style="color: #FF9A4D; font-weight: 600">{{{{ worstR }}}}</span> · {{{{ worstL }}}}</span></div>
</section>
</div>'''

def _brows(lst, grid, thumb=False):
    th = ('<sc-if value="{{ x.hasThumb }}" hint-placeholder-val="{{ true }}"><span class="chart" style="flex: none; width: 64px; display: block"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="{{ x.thumb }}"></use></svg></span></sc-if>'
          '<sc-if value="{{ x.noThumb }}" hint-placeholder-val="{{ false }}"><span aria-hidden="true" style="flex: none; width: 64px; height: 36px; border-radius: 8px; border: 1px dashed #353B46; box-sizing: border-box"></span></sc-if>') if thumb else ""
    cells = (f'<span style="display: flex; align-items: center; gap: 12px; min-width: 0">{th}<span style="font-size: 14px; font-weight: 500">{{{{ x.name }}}}</span></span>'
             '<span class="num" style="font-size: 14px; text-align: right">{{ x.n }}</span>'
             '<sc-if value="{{ x.rated }}" hint-placeholder-val="{{ true }}"><span class="num" style="font-size: 14px; text-align: right">{{ x.wr }}</span><span class="num" style="font-size: 14px; text-align: right">{{ x.ex }}</span></sc-if>'
             '<sc-if value="{{ x.unrated }}" hint-placeholder-val="{{ false }}"><span class="lbl" style="grid-column: span 2; text-align: right">Too few to rate</span></sc-if>'
             '<div aria-hidden="true" style="position: relative; height: 8px; border-radius: 4px; background: #15181E"><div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #353B46"></div>'
             '<div style="position: absolute; top: 0; bottom: 0; {{ x.barPos }}; border-radius: 4px; background: {{ x.col }}"></div></div>'
             '<span class="num" style="font-size: 14px; font-weight: 600; text-align: right; color: {{ x.col }}">{{ x.net }}</span>')
    st = f'display: grid; {grid}; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1; min-height: 44px'
    if thumb:
        return f'<sc-for list="{{{{ {lst} }}}}" as="x" hint-placeholder-count="4"><a href="{{{{ x.href }}}}" style="{st}">{cells}</a></sc-for>'
    return f'<sc-for list="{{{{ {lst} }}}}" as="x" hint-placeholder-count="3"><div style="{st}">{cells}</div></sc-for>'

_SG = "grid-template-columns: minmax(0, 1fr) 50px 64px 82px minmax(60px, 1fr) 56px"
MROWS = ('<sc-for list="{{ mist }}" as="x" hint-placeholder-count="3"><div style="display: grid; grid-template-columns: minmax(0, 1.4fr) 70px minmax(60px, 1fr) 60px; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid #1B1F27; min-height: 44px">'
         f'<span>{pill("{{ x.tag }}")}</span><span class="lbl" style="text-align: right">{{{{ x.nTxt }}}}</span>'
         '<div aria-hidden="true" style="height: 8px; border-radius: 4px; background: #15181E; overflow: hidden"><div style="width: {{ x.pct }}%; height: 100%; background: #FF9A4D; border-radius: 4px"></div></div>'
         '<span class="num" style="font-size: 14px; font-weight: 600; text-align: right; color: {{ x.col }}">{{ x.net }}</span></div></sc-for>')

BREAK2 = f'''
<section aria-labelledby="bsh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="bsh" style="margin: 0; font-size: 16px; font-weight: 600">By setup</h2><a href="PlaybookHome.dc.html" class="lbl" style="color: #A3AAB5">Open playbook</a></div>
{_bhead("Setup", _BG)}{_brows("bySetup", _BG, True)}
</section>
<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px">
<section aria-labelledby="ssh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="ssh" style="margin: 0; font-size: 16px; font-weight: 600">By session</h2><span class="lbl">From each trade's open time</span></div>
{_bhead("Session", _SG)}{_brows("bySess", _SG)}
</section>
<section aria-labelledby="msh" style="display: flex; flex-direction: column; gap: 4px; padding: 20px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 12px"><h2 id="msh" style="margin: 0; font-size: 16px; font-weight: 600">Costliest mistakes</h2><span class="lbl">R from trades with each mistake tag</span></div>
<sc-if value="{{{{ hasMist }}}}" hint-placeholder-val="{{{{ true }}}}">{MROWS}<p class="lbl" style="margin: 12px 0 0">A trade with two tags counts under both. {{{{ untagged }}}}</p></sc-if>
<sc-if value="{{{{ noMist }}}}" hint-placeholder-val="{{{{ false }}}}"><p class="lbl" style="margin: 0; padding: 10px 0; border-top: 1px solid #1B1F27">No mistakes tagged in this period.</p></sc-if>
</section>
</div>'''

RECENT2 = ('<section aria-labelledby="rch" style="display: flex; flex-direction: column; gap: 14px">'
           + h2('<span id="rch">Recent chart stories</span>', '<a href="Main.dc.html" class="meta" style="color: #ECEEF1">Trade log</a>')
           + '<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px"><sc-for list="{{ recent }}" as="c" hint-placeholder-count="6">'
           '<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1; min-width: 0">'
           '<span class="chart" style="display: block"><svg viewBox="0 0 320 180" role="img" aria-label="{{ c.alt }}" style="display: block; width: 100%; height: auto"><use href="{{ c.chart }}"></use></svg></span>'
           '<span style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px"><span style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{{ c.pair }}'
           '<span style="font-size: 11px; font-weight: 600; color: #C9CED6; border: 1px solid #353B46; border-radius: 5px; padding: 0 6px; line-height: 1.6">{{ c.dir }}</span></span>'
           '<span class="num" style="font-size: 13px; font-weight: 600; color: {{ c.col }}">{{ c.res }}</span></span>'
           '<span class="lbl" style="font-size: 12px">{{ c.line }}</span></a></sc-for></div></section>')

NOCHART = ('<sc-for list="{{ noCharts }}" as="x" hint-placeholder-count="1"><section aria-label="Trade without charts" style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding: 18px 20px; border-radius: 14px; border: 1px solid #353B46; background: #15181E">'
           '<div style="flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 4px">'
           '<h2 style="margin: 0; font-size: 16px; font-weight: 600">{{ x.title }}</h2>'
           '<span class="meta">{{ x.line }} <span class="num" style="color: {{ x.col }}; font-weight: 600">{{ x.res }}</span> from MT5. No screenshot? Scroll back on your chart and take one now. It still counts.</span></div>'
           '<div style="display: flex; gap: 8px; align-items: center"><label style="position: relative; font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #ECEEF1; border: 1.5px dashed #4A515E; border-radius: 10px; padding: 0 16px; min-height: 44px; cursor: copy">'
           + IC["img"] + 'Drop, paste or choose charts<input type="file" accept="image/*" multiple onChange="{{ x.upload }}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>'
           '<a href="Main.dc.html" class="btn btn-q">Trade log</a></div></section></sc-for>')

FOCUS = ('<sc-if value="{{ hasFocus }}" hint-placeholder-val="{{ true }}"><section aria-label="This week\'s focus" style="display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; padding: 14px 18px; border-radius: 12px; border: 1px solid #1B1F27">'
         '<span class="lbl" style="font-size: 12px">This week\'s focus</span><span style="font-size: 15px; color: #ECEEF1">{{ focus }}</span>'
         '<a href="Review.dc.html" class="lbl" style="font-size: 12px; color: #A3AAB5; margin-left: auto">{{ focusFrom }}</a></section></sc-if>')

PERIOD = ('<div role="group" aria-label="Period" style="display: flex; gap: 2px; padding: 3px; border: 1px solid #353B46; border-radius: 11px"><sc-for list="{{ periods }}" as="o" hint-placeholder-count="3">'
          '<button type="button" aria-pressed="{{ o.pressed }}" onClick="{{ o.pick }}" style="font: inherit; font-size: 14px; font-weight: {{ o.fw }}; color: {{ o.fg }}; background: {{ o.bg }}; border: 0; border-radius: 8px; padding: 0 14px; min-height: 38px; cursor: pointer; white-space: nowrap">{{ o.label }}</button></sc-for></div>')

EARLY = ('<section style="display: flex; flex-direction: column; gap: 8px; padding: 28px; border-radius: 14px; border: 1px solid #1B1F27; align-items: flex-start">'
         '<h2 style="margin: 0; font-size: 18px; font-weight: 600">Too few trades to read yet</h2>'
         '<p class="meta" style="margin: 0">{{ earlyTxt }}</p>'
         '<button type="button" class="btn btn-g" onClick="{{ toMonth }}" style="margin-top: 6px">{{ earlyBtn }}</button></section>')

dashboard = f'''
{SYMBOLS}
{title_block("Dashboard", "{{ sub }}", PERIOD + acct_picker() + '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}
{NOCHART}
{FOCUS}
<sc-if value="{{{{ enough }}}}" hint-placeholder-val="{{{{ true }}}}">
{TILES2}
{TREND2}
{BREAK2}
</sc-if>
<sc-if value="{{{{ early }}}}" hint-placeholder-val="{{{{ false }}}}">{EARLY}</sc-if>
{RECENT2}
<p class="meta" style="margin: 0; padding-top: 8px; border-top: 1px solid #1B1F27">This shows what happened. Your <a href="Review.dc.html">weekly review</a> is where you decide what to change. Running, watched and not-filled trades stay out of every number. Win rate and expectancy need 5 trades.</p>
{TOAST}
'''

DASH_SCRIPT = """
renderVals() {
  const st = this.state || {};
  const E = %s, THUMB = %s, FOCUS = %s;
  const kit = this.kitVals();
  const on = st.accts || %s;
  const per = st.per || 'This month';
  const START = { 'This week': '2026-11-16', 'This month': '2026-11-01', '3 months': '2026-08-17' }[per];
  const SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const fr = (v, d) => (v > 0 ? '+' : v < 0 ? '\\u2212' : '') + Math.abs(v).toFixed(d == null ? 1 : d) + 'R';
  const col = (v) => v > 0 ? '#5BA2FF' : (v < 0 ? '#FF9A4D' : '#A3AAB5');
  const dl = (s) => { const [y, m, d] = s.split('-').map(Number); return d + ' ' + SM[m - 1]; };
  const inP = E.filter((e) => e.d >= START && on.includes(e.a));
  const T = inP.filter((e) => e.st === 'Taken').sort((a, b) => (a.d + a.t > b.d + b.t ? 1 : -1));
  const n = T.length, enough = n >= 5;
  const sum = (xs) => Math.round(xs.reduce((a, e) => a + e.r, 0) * 100) / 100;
  const net = sum(T), wins = T.filter((e) => e.r > 0), losses = T.filter((e) => e.r <= 0);
  const fol = T.filter((e) => e.f).length;
  // equity, drawdown
  const pts = [0]; let c = 0; for (const e of T) { c += e.r; pts.push(Math.round(c * 100) / 100); }
  let pk = 0, dd = 0; for (const v of pts) { pk = Math.max(pk, v); dd = Math.min(dd, v - pk); }
  const W = 600, H = 248, pl = 40, pr = 10, pt = 40, pb = 24;
  const lo = Math.min(0, ...pts), hi = (Math.floor(Math.max(...pts) / 4) + 1) * 4;
  const step = hi - lo > 24 ? 8 : 4;
  const X = (i) => pl + i * (W - pl - pr) / Math.max(1, pts.length - 1), Y = (v) => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const grid = []; for (let g = Math.ceil(lo / step) * step; g <= hi; g += step) grid.push({ y: Y(g).toFixed(1), ty: (Y(g) + 4).toFixed(1), label: g ? fr(g, 0) : '0', stroke: g === 0 ? '#353B46' : '#1B1F27', dash: g === 0 ? '2 4' : '2 4' });
  let p2 = 0; const top = [], bot = [];
  pts.forEach((v, i) => { p2 = Math.max(p2, v); top.push(X(i).toFixed(1) + ',' + Y(p2).toFixed(1)); bot.push(X(i).toFixed(1) + ',' + Y(v).toFixed(1)); });
  const ticks = []; const seen = {};
  const wkOf = (s) => { const [y, m, d] = s.split('-').map(Number); const x = new Date(Date.UTC(y, m - 1, d)); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) %% 7)); return x.toISOString().slice(0, 10); };
  T.forEach((e, i) => { const key = per === '3 months' ? e.d.slice(0, 7) : (per === 'This week' ? e.d : wkOf(e.d));
    if (!seen[key]) { seen[key] = 1; const m = Number(e.d.slice(5, 7)); ticks.push({ x: X(i + 1).toFixed(1), label: per === '3 months' ? SM[m - 1] : dl(e.d), anchor: 'middle' }); } });
  if (ticks.length) { ticks[0].anchor = Number(ticks[0].x) < 40 ? 'start' : 'middle'; const lt = ticks[ticks.length - 1]; if (Number(lt.x) > W - 40) lt.anchor = 'end'; }
  // straight segments: exact values, no invented curves between trades
  const P = pts.map((v, i) => [X(i), Y(v)]);
  const f1 = (v) => v.toFixed(1), pp = (q) => f1(q[0]) + ' ' + f1(q[1]);
  const fwd = 'M' + P.map(pp).join(' L');
  const back = P.slice(0, -1).reverse().map((q) => ' L' + pp(q)).join('');
  const base = Y(lo);
  const eqArea = fwd + ' L' + f1(P[P.length - 1][0]) + ' ' + f1(base) + ' L' + f1(P[0][0]) + ' ' + f1(base) + ' Z';
  let pk2 = -1e9; const peakLine = P.map((q, i) => { pk2 = Math.max(pk2, pts[i]); return (i ? ' L' : 'M') + f1(q[0]) + ' ' + f1(Y(pk2)); }).join('');
  const ddPath = peakLine + ' L' + pp(P[P.length - 1]) + back + ' Z';
  // hover readout for every point
  const eqPts = P.map((q, i) => { const prev = i ? P[i - 1][0] : q[0], next = i < P.length - 1 ? P[i + 1][0] : q[0];
    const hx = i ? (prev + q[0]) / 2 : 0, hr = i < P.length - 1 ? (q[0] + next) / 2 : W; const e = i ? T[i - 1] : null;
    return { hl: (hx / W * 100).toFixed(2), hw: ((hr - hx) / W * 100).toFixed(2), cx: ((q[0] - hx) / (hr - hx) * 100).toFixed(1), cy: (q[1] / H * 100).toFixed(1), ta: q[0] < 90 ? 'start' : (q[0] > W - 90 ? 'end' : 'mid'),
      when: e ? dl(e.d) + ' \u00b7 ' + e.p : 'Start of period', tot: fr(pts[i]) + ' total', totN: fr(pts[i]), r: e ? fr(e.r) : '', col: e ? col(e.r) : '#A3AAB5' }; });
  // R by day (by week for 3 months)
  const byWeek = per === '3 months';
  const wk = wkOf;
  const grp = []; for (const e of T) { const k = byWeek ? wk(e.d) : e.d; let g = grp[grp.length - 1]; if (!g || g.k !== k) { g = { k: k, r: 0, n: 0 }; grp.push(g); } g.r += e.r; g.n += 1; }
  grp.forEach((g, i) => { g.first = i === 0 || g.k.slice(0, 7) !== grp[i - 1].k.slice(0, 7); });
  const mx = Math.max(0.01, ...grp.map((g) => Math.abs(g.r)));
  const bars = grp.map((g) => { const h = Math.max(3, Math.round(Math.abs(g.r) / mx * 84)); return { up: g.r >= 0 ? h : 0, down: g.r < 0 ? h : 0, col: col(g.r), label: byWeek ? (g.first ? SM[Number(g.k.slice(5, 7)) - 1] : '') : dl(g.k).split(' ')[0],
    when: (byWeek ? 'Week of ' : '') + dl(g.k), r: fr(g.r), n: g.n + (g.n === 1 ? ' trade' : ' trades'), cnt: g.n }; });
  const best = grp.reduce((a, g) => (g.r > a.r ? g : a), grp[0] || { r: 0, k: START }), worst = grp.reduce((a, g) => (g.r < a.r ? g : a), grp[0] || { r: 0, k: START });
  // breakdown rows
  const row = (name, xs, extra) => { const k = xs.length, s = sum(xs), w = xs.filter((e) => e.r > 0).length;
    return Object.assign({ name: name, n: String(k), rated: k >= 5, unrated: k < 5, wr: k ? Math.round(w / k * 100) + '%%' : '', ex: k ? fr(s / k, 2) : '', net: fr(s), col: col(s), s: s }, extra || {}); };
  const scale = (rows) => { const m = Math.max(0.01, ...rows.map((r) => Math.abs(r.s))); rows.forEach((r) => { const p = (Math.abs(r.s) / m * 50).toFixed(1); r.barPos = r.s >= 0 ? 'left: 50%%; width: ' + p + '%%' : 'right: 50%%; width: ' + p + '%%'; }); return rows; };
  const SETUPS = ['4H supply pullback', 'London breakout', 'Asian range fade', 'Unsorted'];
  const bySetup = scale(SETUPS.map((s) => row(s, T.filter((e) => e.s === s), { hasThumb: !!THUMB[s], noThumb: !THUMB[s], thumb: '#' + (THUMB[s] || ''), href: s === 'Unsorted' ? 'PlaybookHome.dc.html' : 'Playbook.dc.html' })).filter((r) => r.n !== '0'));
  const bySess = scale(['Asia', 'London', 'New York'].map((s) => row(s, T.filter((e) => e.se === s))).filter((r) => r.n !== '0'));
  const mc = {}; for (const e of T) for (const m of e.m) (mc[m] = mc[m] || []).push(e);
  const mist = Object.keys(mc).map((k) => ({ tag: k, xs: mc[k], s: sum(mc[k]) })).sort((a, b) => a.s - b.s);
  const mm = Math.max(0.01, ...mist.map((m) => Math.abs(m.s)));
  const untag = T.filter((e) => !e.m.length).length;
  // recency: the last 6 stories with charts, whatever the period or account
  const recent = E.filter((e) => e.n > 0 && e.st !== 'Analysis' && !(st.upl || {})[e.id]).slice().sort((a, b) => (a.d + a.t < b.d + b.t ? 1 : -1)).slice(0, 6)
    .map((e) => ({ pair: e.p, dir: e.dir, chart: '#' + e.c, alt: e.p + ' ' + (e.dir || '').toLowerCase() + ' chart', res: e.st === 'Taken' ? fr(e.r) : e.st, col: e.st === 'Taken' ? col(e.r) : '#A3AAB5', line: e.s }));
  const noCh = E.filter((e) => e.st === 'Taken' && e.n === 0 && e.mt5 && !(st.upl || {})[e.id]);
  const SUBS = { 'This week': 'This week so far · 16 November', 'This month': 'November so far · 2 to 16 November', '3 months': 'Last 3 months · 17 August to 16 November' };
  const firstD = T.length ? T[0].d : START;
  return Object.assign(kit, {
    sub: SUBS[per] + ' · all figures in R',
    periods: ['This week', 'This month', '3 months'].map((o) => ({ label: o, pressed: o === per ? 'true' : 'false', fw: o === per ? 600 : 500, fg: o === per ? '#0E1014' : '#A3AAB5', bg: o === per ? '#ECEEF1' : 'transparent', pick: () => this.setState({ per: o }) })),
    enough: enough, early: !enough,
    earlyTxt: n + (n === 1 ? ' trade' : ' trades') + ' in this period. Numbers show from 5 trades, so a couple of trades never look like a pattern. Your chart stories are below.',
    earlyBtn: per === 'This week' ? 'Show this month' : 'Show 3 months', toMonth: () => this.setState({ per: per === 'This week' ? 'This month' : '3 months' }),
    net: fr(net), netCol: col(net), ddTxt: 'Worst drawdown ' + fr(dd), expR: n ? fr(net / n, 2) : '',
    wr: n ? Math.round(wins.length / n * 100) + '%%' : '', wrSub: 'Wins avg ' + (wins.length ? fr(sum(wins) / wins.length) : '\\u2013') + ', losses ' + (losses.length ? fr(sum(losses) / losses.length) : '\\u2013'),
    fol: n ? Math.round(fol / n * 100) + '%%' : '', folSub: fol + ' of ' + n + ' trades', nT: String(n),
    nSub: inP.filter((e) => e.st === 'Watched').length + ' watched \\u00b7 ' + inP.filter((e) => e.st === 'Not filled').length + ' not filled',
    eqTab: !!this.state.eqTab, eqChart: !this.state.eqTab, eqTabFlip: () => this.setState({ eqTab: !this.state.eqTab }), eqTabLbl: this.state.eqTab ? 'Show chart' : 'View as table', eqRows: eqPts.slice(1),
    barTab: !!this.state.barTab, barChart: !this.state.barTab, barTabFlip: () => this.setState({ barTab: !this.state.barTab }), barTabLbl: this.state.barTab ? 'Show chart' : 'View as table', barCol: byWeek ? 'Week' : 'Day',
    eqAria: 'Cumulative R, trade by trade, ending at ' + fr(net) + '. Deepest drawdown ' + fr(dd) + '.', grid: grid, eqArea: eqArea, ddPath: ddPath, eqPath: fwd, eqPts: eqPts, endX: X(pts.length - 1).toFixed(1), endY: Y(pts[pts.length - 1]).toFixed(1), ticks: ticks,
    barTitle: byWeek ? 'R by week' : 'R by day', barUp: grp.filter((g) => g.r > 0).length + ' of ' + grp.length + (byWeek ? ' weeks up' : ' days up'), bars: bars,
    barAria: (byWeek ? 'R by week: ' : 'R by trading day: ') + grp.map((g) => dl(g.k) + ' ' + fr(g.r)).join(', '),
    bestR: fr(best.r), bestL: (byWeek ? 'week of ' : '') + dl(best.k), worstR: fr(worst.r), worstL: (byWeek ? 'week of ' : '') + dl(worst.k),
    bySetup: bySetup, bySess: bySess, hasMist: mist.length > 0, noMist: mist.length === 0,
    mist: mist.map((m) => ({ tag: m.tag, nTxt: m.xs.length + (m.xs.length === 1 ? ' trade' : ' trades'), pct: Math.round(Math.abs(m.s) / mm * 100), net: fr(m.s), col: col(m.s) })),
    untagged: untag + ' of ' + n + ' trades had no mistake tagged.',
    recent: recent,
    noCharts: noCh.length ? [{ title: noCh.length === 1 ? '1 trade has no charts yet' : noCh.length + ' trades have no charts yet',
      line: noCh[0].p + ' \\u00b7 ' + noCh[0].dir + ' \\u00b7 ' + dl(noCh[0].d) + ' \\u00b7 ' + noCh[0].a + ' \\u00b7', res: fr(noCh[0].r), col: col(noCh[0].r),
      upload: (ev) => { const f = ev.target.files && ev.target.files[0]; if (!f) return; this.setState({ upl: Object.assign({}, st.upl || {}, { [noCh[0].id]: true }) }); this.toast('Chart added to ' + noCh[0].p, { upl: st.upl || {} }); } }] : [],
    hasFocus: !!FOCUS, focus: '\\u201c' + FOCUS + '\\u201d', focusFrom: 'From your review of 9 to 13 Nov'
  });
}
%s
""" % (_dj.dumps(DASH_DATA, separators=(",", ":")), _dj.dumps(SETUP_THUMB), _dj.dumps(_latest_take), DEF_ACCTS_JS, KIT_METHODS)
