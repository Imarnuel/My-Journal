# PLAYBOOK v2: setups and the setup page computed from the one dataset.
# Numbers follow the account picker; examples come from every account (practice included), as the picker says.
# Small samples: under 5 trades no numbers ("Too few trades for numbers"); 5 to 19 trades numbers plus "Early signal";
# the R line from 10 trades; patterns need 20 trades in the setup and flag any split side under 10 trades.
import json as _pj

_tb = set()
for e in ENTRIES:
    if e["setup"] == SU and e["status"] == "Taken" and (e["r"] or 0) > 1.9 and len(_tb) < 3:
        _tb.add(e["id"])
PB_DATA = [dict(id=e["id"], d=e["date"], p=e["pair"], dir=e["dir"], st=e["status"], a=e["account"], r=e["r"], s=e["setup"] or "Unsorted", se=e["session"],
                f=e["followed"], m=e["mistakes"], x=e["refl"], c=chart_key(e), tb=e["id"] in _tb) for e in ENTRIES if e["status"] != "Analysis" and e["status"] != "Running"]

PB_COMMON = """
  const E = %s;
  const fr = (v, d) => (v > 0 ? '+' : v < 0 ? '\\u2212' : '') + Math.abs(v).toFixed(d == null ? 1 : d) + 'R';
  const col = (v) => v > 0 ? '#5BA2FF' : (v < 0 ? '#FF9A4D' : '#A3AAB5');
  const SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dl = (s) => { const [y, m, d] = s.split('-').map(Number); return d + ' ' + SM[m - 1]; };
  const stats = (setup, accts) => {
    const T = E.filter((e) => e.s === setup && e.st === 'Taken' && accts.includes(e.a)).sort((a, b) => (a.d > b.d ? 1 : -1));
    const W = E.filter((e) => e.s === setup && e.st === 'Watched' && accts.includes(e.a)).length;
    const n = T.length, net = T.reduce((a, e) => a + e.r, 0), wins = T.filter((e) => e.r > 0);
    const last = T.slice(-20); let c = 0; const pts = last.map((e) => (c += e.r));
    const lo = Math.min(0, ...pts), hi = Math.max(0, ...pts), rng = (hi - lo) || 1;
    const spark = (w, h) => pts.map((v, i) => (i * (w - 4) / Math.max(1, pts.length - 1) + 2).toFixed(1) + ',' + (h - 3 - (v - lo) / rng * (h - 6)).toFixed(1)).join(' ');
    const zero = (h) => (h - 3 - (0 - lo) / rng * (h - 6)).toFixed(1);
    return { T: T, n: n, watched: W, rated: n >= 5, early: n >= 5 && n < 20, hasLine: n >= 10, exp: n ? fr(net / n, 2) : '',
             wr: n ? Math.round(wins.length / n * 100) + '%%' : '', avgW: wins.length ? fr(wins.reduce((a, e) => a + e.r, 0) / wins.length) : '\\u2013',
             spark: spark, zero: zero, lastN: last.length, end: fr(c) };
  };
"""

# ---------------- PLAYBOOK HOME ----------------
_SP = lambda w, h, pts, zero, aria: (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{aria}">'
                                     f'<line x1="2" y1="{zero}" x2="{w - 2}" y2="{zero}" stroke="#353B46" stroke-dasharray="2 3"></line>'
                                     f'<polyline points="{pts}" fill="none" stroke="#ECEEF1" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></polyline></svg>')
PB_CARD = ('<sc-for list="{{ cards }}" as="s" hint-placeholder-count="3"><div style="position: relative">'
           '<sc-if value="{{ s.renaming }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 14px; border: 1px solid #4A515E">'
           '<span class="chart" style="display: block"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="{{ s.thumb }}"></use></svg></span>'
           '<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #A3AAB5">Setup name<input id="rename" type="text" value="{{ s.draft }}" onChange="{{ s.setDraft }}" style="font: inherit; font-size: 16px; font-weight: 600; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 8px 10px"></label>'
           '<span class="lbl" style="font-size: 12px">Every story in this setup keeps it under the new name.</span>'
           '<div style="display: flex; gap: 8px; justify-content: flex-end"><button type="button" class="btn btn-g" onClick="{{ s.cancelRename }}">Cancel</button><button type="button" class="btn btn-p" onClick="{{ s.saveRename }}">Save</button></div></div></sc-if>'
           '<sc-if value="{{ s.notRenaming }}" hint-placeholder-val="{{ true }}"><a href="Playbook.dc.html" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: 14px; border: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1">'
           '<span class="chart" style="display: block"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="{{ s.thumb }}"></use></svg></span>'
           '<span style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px"><span style="font-size: 16px; font-weight: 600">{{ s.name }}</span><span class="num" style="font-size: 15px; font-weight: 600">{{ s.exp }}</span></span>'
           '<sc-if value="{{ s.hasLine }}" hint-placeholder-val="{{ true }}"><span style="display: flex; align-items: center; justify-content: space-between; gap: 10px">' + _SP(150, 30, "{{ s.pts }}", "{{ s.zero }}", "{{ s.sparkAria }}") + '<span class="lbl">{{ s.lastTxt }}</span></span></sc-if>'
           '<sc-if value="{{ s.noLine }}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; height: 30px"><span class="lbl">Trend appears after 10 trades</span></span></sc-if>'
           '<span style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap"><span class="lbl">{{ s.line }}</span>'
           f'<sc-if value="{{{{ s.hasFlag }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #A3AAB5">{dot(ATTN, 7)}{{{{ s.flag }}}}</span></sc-if></span></a>'
           '<button type="button" aria-label="{{ s.menuLabel }}" aria-expanded="{{ s.mExp }}" onClick="{{ s.mToggle }}" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border: 0; border-radius: 8px; background: {{ s.mBg }}; color: #ECEEF1; cursor: pointer; font-size: 16px; letter-spacing: 1px; z-index: 5">···</button>'
           '<sc-if value="{{ s.mOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() + f'<div role="menu" style="{MENU_BOX}; top: 52px; right: 12px; width: 210px">'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ s.rename }}" style="' + OPT + '">Rename</button>'
           '<a href="SetupEdit.dc.html" role="menuitem" class="kit-opt" style="' + OPT + '; text-decoration: none">Edit rules</a>'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ s.archive }}" style="' + OPT + '">Archive setup</button>'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ s.del }}" style="' + OPT + '; color: #FF9A4D">Delete setup</button>'
           '<span style="font-size: 12px; color: #8C939F; padding: 6px 12px 4px">Archiving keeps its stories and examples. Deleting moves its stories to Unsorted.</span></div></sc-if>'
           '</sc-if></div></sc-for>')

_i0 = playbook_home.index('<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px">')
_i1 = playbook_home.index('</div>\n<section style="display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 14px; border: 1px dashed #353B46">')
playbook_home = (playbook_home[:_i0] + '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px">' + PB_CARD + playbook_home[_i1:])
playbook_home = playbook_home.replace(picker(), acct_picker(), 1)
playbook_home = SYMBOLS + playbook_home
playbook_home = playbook_home.replace('<h2 style="margin: 0; font-size: 16px; font-weight: 600">Unsorted <span style="font-weight: 500; color: #8C939F">(7)</span></h2>',
                                      '<h2 style="margin: 0; font-size: 16px; font-weight: 600">Unsorted <span style="font-weight: 500; color: #8C939F">({{ unsortedN }})</span></h2>')
# archived group: collapsed, opens on click
_a = playbook_home.index('<button type="button" aria-expanded="false" style="font: inherit; display: flex; justify-content: space-between')
_b = playbook_home.index('</button>', _a) + len('</button>')
playbook_home = (playbook_home[:_a]
                 + '<button type="button" aria-expanded="{{ arcExp }}" onClick="{{ arcToggle }}" style="font: inherit; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 4px; min-height: 48px; border: 0; border-top: 1px solid #1B1F27; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 14px">'
                 + '<span>{{ arcLabel }}</span><span style="display: flex">' + IC["chev"] + '</span></button>'
                 + '<sc-if value="{{ arcOpen }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column"><sc-for list="{{ archived }}" as="a" hint-placeholder-count="1">'
                 + '<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 4px; border-top: 1px solid #1B1F27"><span style="font-size: 14px">{{ a.name }}</span><span class="lbl">{{ a.line }}</span>'
                 + '<button type="button" class="btn btn-q" onClick="{{ a.restore }}">Restore</button></div></sc-for>'
                 + '<sc-if value="{{ noArchived }}" hint-placeholder-val="{{ true }}"><span class="lbl" style="padding: 10px 4px">Nothing archived. Archive a setup you\'ve stopped trading; its stories and examples stay.</span></sc-if></div></sc-if>'
                 + playbook_home[_b:] + TOAST)
# "Not now" on the look-alike suggestion
playbook_home = playbook_home.replace('<button type="button" class="btn btn-q">Not now</button>', '<button type="button" class="btn btn-q" onClick="{{ notNow }}">Not now</button>')
_s0 = playbook_home.index('<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px"><span style="display: flex; align-items: center; gap: 10px; font-size: 14px">')
_s1 = playbook_home.index('</div>', playbook_home.index('</a>', _s0)) + len('</div>')
playbook_home = playbook_home[:_s0] + '<sc-if value="{{ suggest }}" hint-placeholder-val="{{ true }}">' + playbook_home[_s0:_s1] + '</sc-if>' + playbook_home[_s1:]

PBH_SCRIPT = """
renderVals() {
  const st = this.state || {};
%s
  const kit = this.kitVals();
  const on = st.accts || %s;
  const km = st.kmenu || null;
  const names = st.names || {}, arc = st.arc || {}, gone = st.gone || {};
  const SET = [['4H supply pullback', 'sw0'], ['London breakout', 'lw1'], ['Asian range fade', 'sx2']];
  const card = ([s, th], i) => { const x = stats(s, on), nm = names[s] || s, ren = st.renaming === s;
    return { name: nm, thumb: '#' + th, exp: x.rated ? x.exp : '', hasLine: x.hasLine, noLine: !x.hasLine, pts: x.spark(150, 30), zero: x.zero(30),
      sparkAria: 'Cumulative R, last ' + x.lastN + ' trades, ending at ' + x.end, lastTxt: 'Last ' + x.lastN + ' trades',
      line: x.n + ' taken \\u00b7 ' + x.watched + ' watched', hasFlag: !x.rated || x.early, flag: !x.rated ? 'Too few trades for numbers' : 'Early signal',
      renaming: ren, notRenaming: !ren, draft: st.draft == null ? nm : st.draft, setDraft: (e) => this.setState({ draft: e.target.value }),
      cancelRename: () => this.setState({ renaming: null, draft: null }),
      saveRename: () => { const v = (st.draft || '').trim(); if (!v) return; this.setState({ names: Object.assign({}, names, { [s]: v }), renaming: null, draft: null }); this.toast('Renamed to ' + v, { names: names }); },
      menuLabel: 'Actions for ' + nm, mOpen: km === 's' + i, mExp: km === 's' + i ? 'true' : 'false', mBg: km === 's' + i ? '#1B1F27' : 'rgba(14,16,20,0.7)',
      mToggle: () => this.setState({ kmenu: km === 's' + i ? null : 's' + i }),
      rename: () => this.setState({ renaming: s, draft: nm, kmenu: null }),
      archive: () => { this.setState({ arc: Object.assign({}, arc, { [s]: true }) }); this.toast(nm + ' archived', { arc: arc }); },
      del: () => { this.setState({ gone: Object.assign({}, gone, { [s]: true }) }); this.toast(nm + ' deleted. Its ' + x.n + ' stories moved to Unsorted', { gone: gone }); } }; };
  const live = SET.filter(([s]) => !arc[s] && !gone[s]);
  const archived = SET.filter(([s]) => arc[s] && !gone[s]).map(([s]) => ({ name: names[s] || s, line: stats(s, on).n + ' stories kept', restore: () => this.setState({ arc: Object.assign({}, arc, { [s]: false }) }) }));
  const unsorted = E.filter((e) => (e.s === 'Unsorted' || gone[e.s]) && e.st !== 'Analysis').length;
  return Object.assign(kit, { cards: live.map(card), archived: archived, noArchived: !archived.length,
    arcOpen: !!st.arcOpen, arcExp: st.arcOpen ? 'true' : 'false', arcToggle: () => this.setState({ arcOpen: !st.arcOpen }),
    arcLabel: 'Archived setups (' + archived.length + ')', unsortedN: String(unsorted),
    suggest: !st.notNow, notNow: () => { this.setState({ notNow: true }); this.toast('Hidden. It comes back if more stories look alike.', { notNow: false }); } });
}
%s
""" % (PB_COMMON % _pj.dumps(PB_DATA, separators=(",", ":")), DEF_ACCTS_JS, KIT_METHODS)

# ---------------- SETUP PAGE ----------------
_stl = lambda v, l: f'<div style="display: flex; flex-direction: column; gap: 2px"><span class="num" style="font-size: 22px; font-weight: 600">{v}</span><span class="lbl">{l}</span></div>'
STATS = ('<div style="display: flex; flex-wrap: wrap; gap: 20px 48px; padding-bottom: 28px; border-bottom: 1px solid #1B1F27">'
         '<sc-if value="{{ rated }}" hint-placeholder-val="{{ true }}">' + _stl("{{ exp }}", "Expectancy per trade") + _stl("{{ wr }}", "Win rate") + _stl("{{ avgW }}", "Average winner") + '</sc-if>'
         + _stl("{{ nT }}", "Trades taken") + _stl("{{ nW }}", "Watched")
         + '<sc-if value="{{ hasLine }}" hint-placeholder-val="{{ true }}"><div style="display: flex; flex-direction: column; gap: 2px">' + _SP(140, 34, "{{ pts }}", "{{ zero }}", "{{ sparkAria }}") + '<span class="lbl">{{ lastTxt }}</span></div></sc-if>'
         f'<sc-if value="{{{{ hasFlag }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #A3AAB5; align-self: center">{dot(ATTN, 7)}{{{{ flag }}}}</span></sc-if>'
         '</div>')
FTABS = ('<div role="group" aria-label="Filter examples" style="display: flex; gap: 20px; flex-wrap: wrap"><sc-for list="{{ ftabs }}" as="t" hint-placeholder-count="6">'
         '<button type="button" aria-pressed="{{ t.pressed }}" onClick="{{ t.pick }}" style="font: inherit; font-size: 14px; font-weight: {{ t.fw }}; color: {{ t.fg }}; background: transparent; border: 0; border-bottom: 2px solid {{ t.bd }}; padding: 0 0 8px; cursor: pointer">{{ t.label }} <span style="color: #8C939F; font-weight: 500">{{ t.n }}</span></button></sc-for></div>')
_mini = lambda k: f'<figure style="margin: 0; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px"><div class="chart"><svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="#g{k}"></use></svg></div><figcaption style="font-size: 11px; color: #8C939F">{ {"W": "Weekly", "D": "Daily", "4H": "4H"}[k] }</figcaption></figure>'
EXCARDS = ('<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px"><sc-for list="{{ exs }}" as="x" hint-placeholder-count="6">'
           '<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1; padding: 12px; border: 1px solid #1B1F27; border-radius: 12px">'
           '<div style="display: flex; gap: 6px">' + _mini("W") + _mini("D") + _mini("4H") + '</div>'
           '<div class="chart"><svg viewBox="0 0 320 180" role="img" aria-label="{{ x.alt }}" style="display: block; width: 100%; height: auto"><use href="{{ x.chart }}"></use></svg></div>'
           '<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-top: 2px"><span style="font-size: 14px; font-weight: 600">{{ x.pair }}</span><span class="num" style="font-size: 14px; font-weight: 600; color: {{ x.col }}">{{ x.res }}</span></div>'
           '<div style="display: flex; justify-content: space-between; gap: 8px"><span class="lbl">{{ x.meta }}</span><span style="font-size: 12px; color: #A3AAB5">{{ x.tag }}</span></div></a></sc-for></div>'
           '<sc-if value="{{ noEx }}" hint-placeholder-val="{{ false }}"><p class="lbl" style="margin: 0; padding: 24px 0">{{ noExTxt }}</p></sc-if>'
           '<sc-if value="{{ moreEx }}" hint-placeholder-val="{{ true }}"><button type="button" class="btn btn-g" onClick="{{ showMore }}" style="align-self: center">{{ moreTxt }}</button></sc-if>')
PATS = ('<sc-if value="{{ patsOn }}" hint-placeholder-val="{{ true }}"><span class="lbl">Win rate, split by things recorded on every trade</span>'
        '<sc-for list="{{ pats }}" as="p" hint-placeholder-count="3"><div style="display: flex; flex-direction: column; gap: 8px; padding: 14px 0; border-top: 1px solid #1B1F27">'
        f'<div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{{{{ p.h }}}}<sc-if value="{{{{ p.early }}}}" hint-placeholder-val="{{{{ false }}}}"><span title="Early signal: few trades so far" style="display: inline-flex">{dot(ATTN, 7)}</span></sc-if></div>'
        '<sc-for list="{{ p.rows }}" as="b" hint-placeholder-count="2"><div style="display: grid; grid-template-columns: 112px minmax(0, 1fr) 70px; gap: 10px; align-items: center"><span style="font-size: 12px; color: #A3AAB5">{{ b.l }}</span>'
        '<div style="height: 6px; border-radius: 3px; background: #1B1F27"><div style="width: {{ b.v }}%; height: 100%; border-radius: 3px; background: {{ b.c }}"></div></div><span class="num" style="font-size: 12px; text-align: right">{{ b.txt }}</span></div></sc-for></div></sc-for>'
        f'<span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8C939F; padding-top: 6px">{dot(ATTN, 7)}Early signal: one side has fewer than 10 trades</span></sc-if>'
        '<sc-if value="{{ patsOff }}" hint-placeholder-val="{{ false }}"><p class="meta" style="margin: 0">{{ patsWait }}</p></sc-if>')
LESS = ('<span class="lbl">From your reflections on stories in this setup</span><ul style="margin: 8px 0 0; padding: 0"><sc-for list="{{ lessons }}" as="l" hint-placeholder-count="3">'
        '<li style="list-style: none; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid #1B1F27"><span style="font-size: 14px">{{ l.t }}</span><a href="Story.dc.html" class="lbl" style="color: #8C939F">{{ l.meta }}</a></li></sc-for></ul>')

_p = playbook
_p = _p.replace(picker(True), acct_picker(), 1)
_a = _p.index('<div style="display: flex; flex-wrap: wrap; gap: 20px 48px; padding-bottom: 8px; border-bottom: 1px solid #1B1F27; padding-bottom: 28px">')
_b = _p.index('<div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start">')
_p = _p[:_a] + STATS + "\n" + _p[_b:]
_a = _p.index('<div role="group" aria-label="Filter examples"')
_b = _p.index('<button type="button" class="btn btn-g" style="align-self: center">Show all 45</button>') + len('<button type="button" class="btn btn-g" style="align-self: center">Show all 45</button>')
_p = _p[:_a] + FTABS + EXCARDS + _p[_b:]
_a = _p.index('<span class="lbl">Win rate, split by things recorded on every trade</span>')
_b = _p.index('</section>', _a)
_p = _p[:_a] + PATS + _p[_b:]
_a = _p.index('<span class="lbl">From your reflections on stories in this setup</span>')
_b = _p.index('</ul>', _a) + len('</ul>')
_p = _p[:_a] + LESS + _p[_b:]
_p = _p.replace('<button type="button" class="btn btn-q">Not now</button>', '<button type="button" class="btn btn-q" onClick="{{ notNow }}">Not now</button>')
_a = _p.rindex('<section style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 16px 20px; border-radius: 12px; border: 1px solid #1B1F27">')
_b = _p.index('</section>', _a) + len('</section>')
_p = _p[:_a] + '<sc-if value="{{ suggest }}" hint-placeholder-val="{{ true }}">' + _p[_a:_b] + '</sc-if>' + _p[_b:]
import re as _pre
_p = _pre.sub(r'Examples<span style="([^"]*)">45</span>', r'Examples<span style="\1">{{ nEx }}</span>', _p)
_p = _pre.sub(r'Patterns<span style="([^"]*)">3</span>', r'Patterns<span style="\1">{{ nPat }}</span>', _p)
_p = _pre.sub(r'Lessons<span style="([^"]*)">3</span>', r'Lessons<span style="\1">{{ nLes }}</span>', _p)
assert "{{ nEx }}" in _p and "{{ nLes }}" in _p
playbook = SYMBOLS + GSYMS + _p + TOAST

SETUP_TABS_SCRIPT = """
renderVals() {
  const st = this.state || {};
%s
  const kit = this.kitVals();
  const on = st.accts || %s;
  const S = '4H supply pullback';
  const t = st.tab || 'ex';
  const x = stats(S, on);
  const ALLX = E.filter((e) => e.s === S && ['Taken', 'Watched', 'Not filled'].includes(e.st)).sort((a, b) => (a.d < b.d ? 1 : -1));
  const F = { All: () => true, Winners: (e) => e.st === 'Taken' && e.r > 0, Losers: (e) => e.st === 'Taken' && e.r <= 0, Watched: (e) => e.st === 'Watched', 'Not filled': (e) => e.st === 'Not filled', Textbook: (e) => e.tb };
  const f = st.f || 'All';
  const list = ALLX.filter(F[f]);
  const lim = st.lim || 6;
  // patterns: need 20 trades; each split flags itself when a side has fewer than 10
  const T = x.T;
  const wrOf = (xs) => xs.length ? Math.round(xs.filter((e) => e.r > 0).length / xs.length * 100) : 0;
  const split = (h, a, A, b, B) => ({ h: h, early: A.length < 10 || B.length < 10, rows: [[a, A], [b, B]].map(([l, xs]) => { const w = wrOf(xs); return { l: l, v: w, c: l === a ? '#ECEEF1' : '#4A515E', txt: w + '%% \\u00b7 ' + xs.length }; }) });
  const bySess = ['London', 'New York', 'Asia'].map((s) => [s, T.filter((e) => e.se === s)]).filter((p) => p[1].length).sort((p, q) => wrOf(q[1]) - wrOf(p[1]));
  const pats = T.length >= 20 ? [
    split('Session', bySess[0][0], bySess[0][1], bySess[bySess.length - 1][0], bySess[bySess.length - 1][1]),
    split('Plan', 'Followed', T.filter((e) => e.f), 'Not followed', T.filter((e) => !e.f)),
    split('Stop', 'Kept where planned', T.filter((e) => !e.m.includes('Moved stop')), 'Moved', T.filter((e) => e.m.includes('Moved stop')))] : [];
  const lessons = E.filter((e) => e.s === S && e.x).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 5).map((e) => ({ t: '\\u201c' + e.x + '\\u201d', meta: e.p + ' \\u00b7 ' + dl(e.d) }));
  return Object.assign(kit, {
    isEx: t === 'ex', isPat: t === 'pat', isLes: t === 'les', goEx: () => this.setState({ tab: 'ex' }), goPat: () => this.setState({ tab: 'pat' }), goLes: () => this.setState({ tab: 'les' }),
    rated: x.rated, exp: x.exp, wr: x.wr, avgW: x.avgW, nT: String(x.n), nW: String(x.watched), hasLine: x.hasLine, pts: x.spark(140, 34), zero: x.zero(34),
    sparkAria: 'Cumulative R, last ' + x.lastN + ' trades, ending at ' + x.end, lastTxt: 'Last ' + x.lastN + ' trades, in R',
    hasFlag: !x.rated || x.early, flag: !x.rated ? 'Too few trades for numbers' : 'Early signal: fewer than 20 trades',
    ftabs: Object.keys(F).map((k) => ({ label: k, n: String(ALLX.filter(F[k]).length), pressed: k === f ? 'true' : 'false', fw: k === f ? 600 : 500, fg: k === f ? '#ECEEF1' : '#A3AAB5', bd: k === f ? '#ECEEF1' : 'transparent', pick: () => this.setState({ f: k, lim: 6 }) })),
    exs: list.slice(0, lim).map((e) => ({ pair: e.p, chart: '#' + e.c, alt: e.p + ' ' + (e.dir || '').toLowerCase() + ' chart', res: e.st === 'Taken' ? fr(e.r) : e.st, col: e.st === 'Taken' ? col(e.r) : '#A3AAB5',
      meta: dl(e.d) + ' \\u00b7 ' + e.se + (on.includes(e.a) ? '' : ' \\u00b7 ' + e.a), tag: e.tb ? 'Textbook' : (e.st === 'Watched' ? 'Not taken' : '') })),
    noEx: !list.length, noExTxt: f === 'Textbook' ? 'Pin a story as a textbook example from its \\u00b7\\u00b7\\u00b7 menu.' : 'Nothing here yet.',
    moreEx: list.length > lim, moreTxt: 'Show ' + Math.min(6, list.length - lim) + ' more of ' + (list.length - lim), showMore: () => this.setState({ lim: lim + 6 }),
    patsOn: pats.length > 0, patsOff: !pats.length, pats: pats, patsWait: 'Patterns appear once this setup has 20 trades on these accounts. ' + T.length + ' so far.',
    lessons: lessons, nEx: String(ALLX.length), nPat: String(pats.length), nLes: String(lessons.length),
    suggest: !st.notNow, notNow: () => { this.setState({ notNow: true }); this.toast('Hidden. It comes back if more stories look alike.', { notNow: false }); }
  });
}
%s
""" % (PB_COMMON % _pj.dumps(PB_DATA, separators=(",", ":")), DEF_ACCTS_JS, KIT_METHODS)
