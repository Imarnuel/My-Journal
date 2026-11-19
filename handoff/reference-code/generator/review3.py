# WEEKLY REVIEW v3: the same page as v2, now computed from the one dataset (data.py).
# Behaviour: pick any past week and the whole page shows that week; months fold; the account picker
# changes every number and which weeks appear; the takeaway saves as you type and marks the week reviewed.
import json as _rj, datetime as _rdt

# ---- chart thumbnails: drawn once as symbols, every card points at one ----
_SEEDS = {"sw": [201, 221, 311], "sx": [271, 251, 231], "lw": [301, 291, 241], "lx": [261, 281, 211]}
def _sym(key, seed):
    side = "short" if key[0] == "s" else "long"
    g = gallery(seed, side, key[1] == "w")
    inner = g[g.index(">") + 1: g.rindex("</svg>")]
    return f'<symbol id="{key}" viewBox="0 0 320 180">{inner}</symbol>'
SYMBOLS = ('<svg aria-hidden="true" width="0" height="0" style="position: absolute; width: 0; height: 0; overflow: hidden"><defs>'
           + "".join(_sym(f"{k}{i}", s) for k, ss in _SEEDS.items() for i, s in enumerate(ss)) + '</defs></svg>')

def chart_key(e):
    win = (e["r"] or 0) > 0
    return f'{"s" if e["dir"] == "Short" else "l"}{"w" if win else "x"}{int(e["id"][1:]) % 3}'

def _short(d):
    d = _rdt.date.fromisoformat(d); return f"{d.day} {d.strftime('%b')}"

REV_DATA = [dict(id=e["id"], d=e["date"], dl=_short(e["date"]), w=week_of(e["date"]), p=e["pair"], dir=e["dir"], r=e["r"], s=e["setup"],
                 f=e["followed"], m=e["mistakes"], a=e["account"], x=e["refl"], st=e["status"], c=chart_key(e)) for e in ENTRIES]
REV_TAKES = {k: v for k, v in TAKES.items() if v}

REVIEW_SCRIPT = """
renderVals() {
  const st = this.state || {};
  const E = %s, TAKES0 = %s, NOW = '%s', ALLA = %s;
  const kit = this.kitVals();
  const on = st.accts || %s;
  const takes = Object.assign({}, TAKES0, st.takes || {});
  const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fr = (v) => (v > 0 ? '+' : v < 0 ? '\\u2212' : '') + Math.abs(v).toFixed(1) + 'R';
  const col = (v) => v > 0 ? '#5BA2FF' : (v < 0 ? '#FF9A4D' : '#ECEEF1');
  const dd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const add = (s, n) => { const x = dd(s); x.setUTCDate(x.getUTCDate() + n); return x; };
  const lab = (w) => { const a = dd(w), b = add(w, 4); return a.getUTCMonth() === b.getUTCMonth() ? a.getUTCDate() + ' to ' + b.getUTCDate() + ' ' + SM[b.getUTCMonth()] : a.getUTCDate() + ' ' + SM[a.getUTCMonth()] + ' to ' + b.getUTCDate() + ' ' + SM[b.getUTCMonth()]; };
  const longLab = (w) => { const a = dd(w), b = add(w, 4); return a.getUTCMonth() === b.getUTCMonth() ? a.getUTCDate() + ' to ' + b.getUTCDate() + ' ' + MON[b.getUTCMonth()] : a.getUTCDate() + ' ' + MON[a.getUTCMonth()] + ' to ' + b.getUTCDate() + ' ' + MON[b.getUTCMonth()]; };
  const mine = E.filter((e) => on.includes(e.a) && e.w < NOW);
  const byW = {};
  for (const e of mine) (byW[e.w] = byW[e.w] || []).push(e);
  const weeks = Object.keys(byW).filter((w) => byW[w].some((e) => e.st === 'Taken')).sort().reverse();
  const sum = (w) => { const t = byW[w].filter((e) => e.st === 'Taken'); return { n: t.length, r: Math.round(t.reduce((a, e) => a + e.r, 0) * 10) / 10 }; };
  const sel = weeks.includes(st.week) ? st.week : weeks[0];
  const pick = (w) => () => { this.setState({ week: w, kmenu: null }); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {} };
  // months: this month and last month open by default; older months fold to one row
  const mkey = (w) => { const f = add(w, 4); return f.getUTCFullYear() + '-' + String(f.getUTCMonth() + 1).padStart(2, '0'); };
  const nowM = mkey(NOW), lastM = (() => { const d = dd(NOW); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'); })();
  const openM = st.open || {};
  const months = []; let curY = NOW.slice(0, 4);
  for (const w of weeks) {
    const k = mkey(w);
    let m = months[months.length - 1];
    if (!m || m.key !== k) {
      const y = k.slice(0, 4), mi = Number(k.slice(5)) - 1;
      const isOpen = k in openM ? openM[k] : (k === nowM || k === lastM);
      m = { key: k, name: MON[mi], year: y, yearHead: y !== curY, weeksL: [], open: isOpen, folded: !isOpen,
            toggle: () => this.setState({ open: Object.assign({}, openM, { [k]: !isOpen }) }) };
      if (y !== curY) curY = y;
      months.push(m);
    }
    const s = sum(w), tk = takes[w] || '';
    m.weeksL.push({ label: lab(w), sub: s.n + (s.n === 1 ? ' trade · ' : ' trades · ') + fr(s.r), take: tk ? '\\u201c' + tk + '\\u201d' : '', reviewed: !!tk, notReviewed: !tk,
                    sel: w === sel, unsel: w !== sel, pick: pick(w), latest: w === weeks[0] });
  }
  for (const m of months) {
    const n = m.weeksL.length, t = m.weeksL.reduce((a, x) => a + Number(x.sub.split(' ')[0]), 0);
    const r = weeks.filter((w) => mkey(w) === m.key).reduce((a, w) => a + sum(w).r, 0);
    m.sub = n + (n === 1 ? ' week · ' : ' weeks · ') + t + ' trades · ' + fr(Math.round(r * 10) / 10);
    m.expanded = m.open ? 'true' : 'false';
  }
  // the selected week
  const all = (byW[sel] || []).slice().sort((a, b) => (a.d < b.d ? 1 : -1));
  const T = all.filter((e) => e.st === 'Taken');
  const net = Math.round(T.reduce((a, e) => a + e.r, 0) * 10) / 10;
  const fol = T.filter((e) => e.f).length;
  const wat = all.filter((e) => e.st === 'Watched').length, nf = all.filter((e) => e.st === 'Not filled').length;
  const mc = {};
  for (const e of T) for (const m of e.m) (mc[m] = mc[m] || []).push(e);
  const mist = Object.keys(mc).filter((k) => mc[k].length > 1).map((k) => { const r = mc[k].reduce((a, e) => a + e.r, 0);
    return { tag: k, where: mc[k].map((e) => e.p + ' ' + e.dl).join(', '), r: fr(Math.round(r * 10) / 10), col: col(r) }; });
  const prevW = weeks[weeks.indexOf(sel) + 1];
  const prevTake = prevW ? (takes[prevW] || '') : '';
  const tk = takes[sel] || '';
  const isLatest = sel === weeks[0];
  return Object.assign(kit, {
    wTitle: 'Week of ' + longLab(sel),
    hasPrev: !!prevTake, prevTake: '\\u201c' + prevTake + '\\u201d',
    net: fr(net), netCol: col(net), nTaken: String(T.length),
    nSub: [wat ? wat + ' watched' : '', nf ? nf + ' not filled' : ''].filter(Boolean).join(' · ') || 'Nothing watched or missed',
    fol: fol + ' of ' + T.length,
    hasMist: mist.length > 0, mist: mist,
    cards: T.map((e) => ({ pair: e.p, dir: e.dir, r: fr(e.r), rc: col(e.r), chart: '#' + e.c, alt: e.p + ' ' + e.dir.toLowerCase() + ', ' + fr(e.r),
                           meta: e.dl + ' · ' + e.s + (e.f ? '' : ' · Not followed') })),
    nCards: T.length + (T.length === 1 ? ' trade' : ' trades'),
    refl: T.filter((e) => e.x).map((e) => ({ t: '\\u201c' + e.x + '\\u201d', meta: e.p + ' · ' + e.dl })),
    hasRefl: T.some((e) => e.x), noRefl: !T.some((e) => e.x),
    take: tk,
    onTake: (ev) => this.setState({ takes: Object.assign({}, st.takes || {}, { [sel]: ev.target.value }) }),
    takeNote: isLatest ? (tk ? 'Saved. It shows on your dashboard all next week.' : 'Write one thing. It saves as you type and shows on your dashboard all next week.')
                       : (tk ? 'Saved.' : 'You can still write one. Only your latest week shows on the dashboard.'),
    months: months, noWeeks: weeks.length === 0
  });
}
%s
""" % (_rj.dumps(REV_DATA, separators=(",", ":")), _rj.dumps(REV_TAKES), THIS_WEEK, ACCTS_JS, DEF_ACCTS_JS, KIT_METHODS)

def _wnum(label, value_hole, sub_hole, col_hole=None):
    c = f"color: {{{{ {col_hole} }}}}" if col_hole else "color: #ECEEF1"
    return (f'<div style="display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; border-radius: 12px; border: 1px solid #1B1F27; min-width: 0"><span class="lbl">{label}</span>'
            f'<span class="num" style="font-size: 26px; font-weight: 600; {c}">{value_hole}</span><span class="lbl" style="font-size: 12px">{sub_hole}</span></div>')

_CARD = ('<sc-for list="{{ cards }}" as="c" hint-placeholder-count="8"><li style="list-style: none; min-width: 0">'
         '<a href="Story.dc.html" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: #ECEEF1">'
         '<span class="chart" style="display: block"><svg viewBox="0 0 320 180" role="img" aria-label="{{ c.alt }}" style="display: block; width: 100%; height: auto"><use href="{{ c.chart }}"></use></svg></span>'
         '<span style="display: flex; justify-content: space-between; align-items: center; gap: 6px"><span style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600">{{ c.pair }}'
         '<span style="font-size: 11px; font-weight: 600; color: #C9CED6; border: 1px solid #353B46; border-radius: 5px; padding: 0 6px; line-height: 1.6">{{ c.dir }}</span></span>'
         '<span class="num" style="font-size: 14px; font-weight: 600; color: {{ c.rc }}">{{ c.r }}</span></span>'
         '<span class="lbl" style="font-size: 12px">{{ c.meta }}</span></a></li></sc-for>')

_WEEKROW = ('<sc-for list="{{ m.weeksL }}" as="w" hint-placeholder-count="2"><li style="list-style: none">'
            '<sc-if value="{{ w.sel }}" hint-placeholder-val="{{ false }}"><button type="button" aria-current="true" onClick="{{ w.pick }}" style="font: inherit; width: 100%; text-align: left; display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 10px; border: 0; background: #1B1F27; color: #ECEEF1; cursor: pointer">'
            '<span style="display: flex; justify-content: space-between; gap: 8px; width: 100%"><span style="font-size: 14px; font-weight: 600">{{ w.label }}</span><span class="lbl" style="font-size: 12px">{{ w.sub }}</span></span>'
            '<sc-if value="{{ w.reviewed }}" hint-placeholder-val="{{ true }}"><span style="font-size: 13px; color: #C9CED6">{{ w.take }}</span></sc-if>'
            '<sc-if value="{{ w.notReviewed }}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #8C939F">Not reviewed</span></sc-if></button></sc-if>'
            '<sc-if value="{{ w.unsel }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ w.pick }}" class="kit-opt" style="font: inherit; width: 100%; text-align: left; display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 10px; border: 0; background: transparent; color: #ECEEF1; cursor: pointer">'
            '<span style="display: flex; justify-content: space-between; gap: 8px; width: 100%"><span style="font-size: 14px; font-weight: 600">{{ w.label }}</span><span class="lbl" style="font-size: 12px">{{ w.sub }}</span></span>'
            '<sc-if value="{{ w.reviewed }}" hint-placeholder-val="{{ true }}"><span style="font-size: 13px; color: #C9CED6">{{ w.take }}</span></sc-if>'
            '<sc-if value="{{ w.notReviewed }}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #8C939F">Not reviewed</span></sc-if></button></sc-if>'
            '</li></sc-for>')

_MONTH_BTN = lambda ic: ('<button type="button" aria-expanded="{{ m.expanded }}" onClick="{{ m.toggle }}" class="kit-opt" style="font: inherit; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border: 0; border-radius: 10px; background: transparent; color: #ECEEF1; cursor: pointer; text-align: left">'
                         '<span style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; font-weight: 600">{{ m.name }}</span><span class="lbl" style="font-size: 12px">{{ m.sub }}</span></span>'
                         f'<span style="color: #8C939F; display: flex">{IC[ic]}</span></button>')

_PAST = ('<ol style="margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px">'
         '<sc-for list="{{ months }}" as="m" hint-placeholder-count="4">'
         '<sc-if value="{{ m.yearHead }}" hint-placeholder-val="{{ false }}"><li style="list-style: none; padding: 18px 14px 4px; margin-top: 6px; border-top: 1px solid #1B1F27"><span style="font-size: 13px; font-weight: 600; color: #A3AAB5">{{ m.year }}</span></li></sc-if>'
         '<li style="list-style: none">'
         f'<sc-if value="{{{{ m.folded }}}}" hint-placeholder-val="{{{{ false }}}}">{_MONTH_BTN("right")}</sc-if>'
         f'<sc-if value="{{{{ m.open }}}}" hint-placeholder-val="{{{{ true }}}}">{_MONTH_BTN("chev")}'
         f'<ol style="margin: 0 0 4px 14px; padding: 0 0 0 10px; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid #1B1F27">{_WEEKROW}</ol></sc-if>'
         '</li></sc-for></ol>')

review = f'''
{SYMBOLS}
{title_block("Weekly review", "{{ wTitle }}", acct_picker())}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
<div style="flex: 999 1 640px; min-width: 0; display: flex; flex-direction: column; gap: 28px">

<sc-if value="{{{{ hasPrev }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; align-items: baseline; gap: 10px; padding: 14px 16px; border-radius: 12px; border: 1px solid #1B1F27; flex-wrap: wrap">
<span class="lbl" style="font-size: 12px">The week before, you said</span><span style="font-size: 14px; color: #ECEEF1">{{{{ prevTake }}}}</span>
</div></sc-if>

<section aria-labelledby="wn" style="display: flex; flex-direction: column; gap: 12px">
<h2 id="wn" style="margin: 0; font-size: 16px; font-weight: 600">The week</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">
{_wnum("Net", "{{ net }}", "In R", "netCol")}{_wnum("Trades taken", "{{ nTaken }}", "{{ nSub }}")}{_wnum("Plan followed", "{{ fol }}", "Trades where you stuck to it")}
</div>
</section>

<sc-if value="{{{{ hasMist }}}}" hint-placeholder-val="{{{{ true }}}}"><section aria-labelledby="wm" style="display: flex; flex-direction: column; gap: 10px">
<h2 id="wm" style="margin: 0; font-size: 16px; font-weight: 600">Mistakes you tagged more than once</h2>
<sc-for list="{{{{ mist }}}}" as="m" hint-placeholder-count="1"><div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid #1B1F27">
<span style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">{pill("{{ m.tag }}")}<span class="lbl">{{{{ m.where }}}}</span></span>
<span class="num" style="font-size: 15px; font-weight: 600; color: {{{{ m.col }}}}">{{{{ m.r }}}}</span>
</div></sc-for>
</section></sc-if>

<section aria-labelledby="wc" style="display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; justify-content: space-between; align-items: baseline"><h2 id="wc" style="margin: 0; font-size: 16px; font-weight: 600">Your trades <span class="lbl" style="font-weight: 500">{{{{ nCards }}}}</span></h2><a href="Main.dc.html" class="meta" style="color: #A3AAB5">Open in trade log</a></div>
<ol style="margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px 14px">{_CARD}</ol>
</section>

<section aria-labelledby="wr" style="display: flex; flex-direction: column; gap: 10px">
<h2 id="wr" style="margin: 0; font-size: 16px; font-weight: 600">Your reflections</h2>
<sc-if value="{{{{ hasRefl }}}}" hint-placeholder-val="{{{{ true }}}}"><ul style="margin: 0; padding: 0; display: flex; flex-direction: column"><sc-for list="{{{{ refl }}}}" as="x" hint-placeholder-count="3"><li style="list-style: none; padding: 12px 0; border-top: 1px solid #1B1F27; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; color: #ECEEF1">{{{{ x.t }}}}</span><span class="lbl" style="font-size: 12px">{{{{ x.meta }}}}</span></li></sc-for></ul></sc-if>
<sc-if value="{{{{ noRefl }}}}" hint-placeholder-val="{{{{ false }}}}"><p class="lbl" style="margin: 0">No reflections on this week's stories.</p></sc-if>
</section>

<section aria-labelledby="wt" style="display: flex; flex-direction: column; gap: 10px; padding: 18px 20px; border-radius: 14px; background: #15181E; border: 1px solid #252A33">
<label for="takeaway" id="wt" style="font-size: 16px; font-weight: 600">What I'll do differently next week</label>
<textarea id="takeaway" rows="2" placeholder="One thing, in your own words" value="{{{{ take }}}}" onChange="{{{{ onTake }}}}" style="font: inherit; font-size: 15px; line-height: 1.5; color: #ECEEF1; background: #0E1014; border: 1px solid #2E343E; border-radius: 10px; padding: 10px 12px; resize: vertical"></textarea>
<span class="lbl" style="font-size: 12px">{{{{ takeNote }}}}</span>
</section>
</div>

<aside aria-labelledby="pw" style="flex: 1 1 260px; min-width: 0; display: flex; flex-direction: column; gap: 8px">
<h2 id="pw" style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #A3AAB5">Past weeks</h2>
{_PAST}
<p class="lbl" style="margin: 4px 0 0; font-size: 12px">Every week you traded is here. Weeks you didn't trade don't appear.</p>
</aside>
</div>
{TOAST}
'''
