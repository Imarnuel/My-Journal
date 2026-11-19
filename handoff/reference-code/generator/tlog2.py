# TRADE LOG v2: computed from the one dataset. Every filter, sort, view, row menu and prompt works.
# Behaviour rules (kit): one menu open at a time; choosing closes it and updates the button; counts in every
# menu follow the other filters; Clear filters when any is set; destructive actions show a toast with Undo.
import json as _tj, datetime as _tdt

def _when(e):
    d = _tdt.date.fromisoformat(e["date"]); return f'{d.strftime("%a")} {d.day} {d.strftime("%b")}, {e["time"]}'
def _keys(e):
    k = chart_key(e); alt = k[:-1] + str((int(k[-1]) + 1) % 3)
    return [alt, k]
TL_DATA = [dict(id=e["id"], d=e["date"], t=e["time"], when=_when(e), w=week_of(e["date"]), p=e["pair"], dir=e["dir"], st=e["status"], a=e["account"], also=e["also"],
                r=e["r"], s=e["setup"], f=e["followed"], tags=e["tags"], n=e["charts"], k=_keys(e), note=e["note"], plan=e["plan"], mt5=e["mt5"])
           for e in ENTRIES]

_MB = MENU_BOX

def fmenu(key, icon, width=240, right=False):
    """A filter: button shows the name until a value is picked, then the value. Menu lists options with counts."""
    opts = (f'<sc-for list="{{{{ F.{key}.opts }}}}" as="o" hint-placeholder-count="5">'
            '<button type="button" role="option" aria-selected="{{ o.selS }}" onClick="{{ o.pick }}" class="kit-opt" style="' + OPT + '; background: {{ o.bg }}">'
            '<span style="color: {{ o.fc }}">{{ o.label }}</span><span style="display: flex; align-items: center; gap: 8px"><span style="color: #8C939F; font-size: 12px">{{ o.count }}</span>'
            f'<sc-if value="{{{{ o.sel }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="color: #ECEEF1; display: flex">{IC["check"]}</span></sc-if></span></button></sc-for>')
    extra = DATE_PICK if key == "date" else ""
    side = "right: 0" if right else "left: 0"
    return (f'<span style="position: relative; display: inline-flex">'
            f'<button type="button" aria-haspopup="listbox" aria-expanded="{{{{ F.{key}.exp }}}}" aria-label="{{{{ F.{key}.aria }}}}" onClick="{{{{ F.{key}.toggle }}}}" '
            f'style="font: inherit; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #ECEEF1; background: {{{{ F.{key}.bg }}}}; border: 1px solid {{{{ F.{key}.bd }}}}; border-radius: 10px; padding: 0 12px; min-height: 40px; cursor: pointer; position: relative; z-index: 5">'
            f'<span style="color: #A3AAB5; display: flex">{FI[icon]}</span>{{{{ F.{key}.label }}}}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>'
            f'<sc-if value="{{{{ F.{key}.open }}}}" hint-placeholder-val="{{{{ false }}}}">{backdrop()}<div role="listbox" aria-label="{key}" style="{_MB}; {side}; width: {width}px">{opts}{extra}</div></sc-if></span>')

DATE_PICK = ('<sc-if value="{{ picking }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; gap: 8px; padding: 10px 8px 6px; border-top: 1px solid #252A33; margin-top: 4px">'
             '<label style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; color: #A3AAB5">From<input type="date" value="{{ pickFrom }}" onChange="{{ setFrom }}" style="font: inherit; font-size: 13px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 6px 8px; color-scheme: dark"></label>'
             '<label style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; color: #A3AAB5">To<input type="date" value="{{ pickTo }}" onChange="{{ setTo }}" style="font: inherit; font-size: 13px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 6px 8px; color-scheme: dark"></label>'
             '<button type="button" class="btn btn-p" onClick="{{ applyDates }}" style="min-height: 36px">Apply</button></div></sc-if>')

ROWMENU = ('<span style="position: relative; display: inline-flex">'
           '<button type="button" aria-label="More actions" aria-expanded="{{ r.mExp }}" onClick="{{ r.mToggle }}" style="width: 40px; height: 40px; border: 0; border-radius: 10px; background: {{ r.mBg }}; color: #ECEEF1; cursor: pointer; font-size: 18px; letter-spacing: 1px; position: relative; z-index: 5">···</button>'
           '<sc-if value="{{ r.mOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() +
           f'<div role="menu" style="{MENU_BOX}; right: 0; width: 220px">'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ r.dateOpen }}" style="' + OPT + '">Change date</button>'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ r.excl }}" style="' + OPT + '">{{ r.exclLabel }}</button>'
           '<button type="button" role="menuitem" class="kit-opt" onClick="{{ r.del }}" style="' + OPT + '; color: #FF9A4D">Delete</button></div></sc-if>'
           '<sc-if value="{{ r.dOpen }}" hint-placeholder-val="{{ false }}">' + backdrop() +
           f'<div role="dialog" aria-label="Change date" style="{MENU_BOX}; right: 0; width: 260px; padding: 12px; gap: 10px">'
           '<label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #A3AAB5">Date and time<input type="datetime-local" value="{{ r.dtVal }}" onChange="{{ r.dtSet }}" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 8px 10px; color-scheme: dark"></label>'
           '<div style="display: flex; gap: 8px; justify-content: flex-end"><button type="button" class="btn btn-g" onClick="{{ kClose }}" style="min-height: 36px">Cancel</button><button type="button" class="btn btn-p" onClick="{{ r.dtSave }}" style="min-height: 36px">Save</button></div></div></sc-if>'
           '</span>')

DROP = ('<label style="flex: 2; min-width: 0; border: 1.5px dashed #4A515E; border-radius: 8px; color: #ECEEF1; cursor: copy; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 500; aspect-ratio: 32 / 9">'
        + IC["img"] + '<span>Drop, paste or choose charts</span><input type="file" accept="image/*" multiple onChange="{{ r.upload }}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>')
THUMB = lambda h: f'<svg viewBox="0 0 320 180" aria-hidden="true" style="display: block; width: 100%; height: auto"><use href="{{{{ {h} }}}}"></use></svg>'


_FICON = dict(FI)
_FICON["acct"] = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="14" rx="2.5"></rect><path d="M2.5 10h19"></path></svg>'
_FICON["plan"] = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4V3h6v1"></path><path d="M9 12.5l2 2 4-4.5"></path></svg>'
_FICON["excl"] = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M6 6l12 12"></path></svg>'
_FNAME = {"date": "Date", "status": "Status", "acct": "Account", "setup": "Setup", "plan": "Plan", "tag": "Tags", "excl": ""}
def _fact(icon, text, small=False):
    svg = _FICON[icon].replace('width="16" height="16"', 'width="14" height="14"')
    cls = "kfact kfact-s" if small else "kfact"
    lab = _FNAME[icon]
    sr = f'<span class="ksr">{lab}: </span>' if lab else ""
    return f'<span class="{cls}"><span class="kfact-ic">{svg}</span>{sr}<span class="kfact-t" title="{text}">{text}</span></span>'

LROW = ('<sc-for list="{{ rows }}" as="r" hint-placeholder-count="8"><li style="list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; padding: 16px 20px; border-top: 1px solid #1B1F27">'
        '<div style="flex: 1 1 280px; min-width: 0; display: flex; flex-direction: column; gap: 4px">'
        '<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap"><a href="Story.dc.html" class="num" style="font-size: 17px; font-weight: 600; text-decoration: none">{{ r.pair }}</a>'
        '<sc-if value="{{ r.hasDir }}" hint-placeholder-val="{{ true }}">' + dchip("{{ r.dir }}") + '</sc-if>'
        '<sc-if value="{{ r.isAnalysis }}" hint-placeholder-val="{{ false }}"><span style="font-size: 12px; font-weight: 600; color: #B9A6FF; border: 1px solid #4A3F75; border-radius: 6px; padding: 1px 8px; line-height: 1.5">Analysis</span></sc-if>'
        '<span class="num" style="font-size: 15px; font-weight: 600; color: {{ r.rc }}">{{ r.res }}</span></div>'
        '<span class="kfacts">' + _fact("date", "{{ r.when }}") + _fact("status", "{{ r.stl }}") + '<sc-if value="{{ r.hasAcct }}" hint-placeholder-val="{{ true }}">' + _fact("acct", "{{ r.acct }}") + '</sc-if><sc-if value="{{ r.isExcl }}" hint-placeholder-val="{{ false }}">' + _fact("excl", "Excluded from stats") + '</sc-if></span>'
        '<sc-if value="{{ r.hasFacts2 }}" hint-placeholder-val="{{ true }}"><span class="kfacts kfacts-2">' + _fact("setup", "{{ r.setup }}") + '<sc-if value="{{ r.hasPlan }}" hint-placeholder-val="{{ true }}">' + _fact("plan", "{{ r.plan }}") + '</sc-if><sc-if value="{{ r.hasTags }}" hint-placeholder-val="{{ true }}">' + _fact("tag", "{{ r.tags }}") + '</sc-if></span></sc-if>'
        '<sc-if value="{{ r.hasHint }}" hint-placeholder-val="{{ false }}"><span class="meta" style="color: #8C939F">{{ r.line }}</span></sc-if></div>'
        '<div style="flex: 1 1 300px; min-width: 0; display: flex; gap: 8px; align-items: center; position: relative">'
        '<sc-if value="{{ r.hasUpl }}" hint-placeholder-val="{{ false }}"><div class="chart" style="flex: 1; min-width: 0"><img src="{{ r.upl }}" alt="Your chart" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px"></div><div aria-hidden="true" style="flex: 1; min-width: 0"></div></sc-if>'
        '<sc-if value="{{ r.drop }}" hint-placeholder-val="{{ false }}">' + DROP + '</sc-if>'
        '<sc-if value="{{ r.has1 }}" hint-placeholder-val="{{ true }}"><div class="chart" style="flex: 1; min-width: 0">' + THUMB("r.k0") + '</div></sc-if>'
        '<sc-if value="{{ r.has2 }}" hint-placeholder-val="{{ true }}"><div class="chart" style="flex: 1; min-width: 0">' + THUMB("r.k1") + '</div></sc-if>'
        '<sc-if value="{{ r.only1 }}" hint-placeholder-val="{{ false }}"><div aria-hidden="true" style="flex: 1; min-width: 0"></div></sc-if>'
        '<span style="flex: none; font-size: 12px; color: #8C939F; width: 56px; text-align: center">{{ r.more }}</span></div>'
        '<div style="flex: 0 0 auto; display: flex; justify-content: flex-end; align-items: center; gap: 8px; min-width: 170px">'
        '<sc-if value="{{ r.noNote }}" hint-placeholder-val="{{ false }}"><a href="Story.dc.html" class="btn btn-q" style="padding: 0 10px; font-weight: 500">' + IC["mic"] + 'Add a note</a></sc-if>'
        + ROWMENU + '</div></li></sc-for>')

GCARD = ('<sc-for list="{{ rows }}" as="r" hint-placeholder-count="8"><li style="list-style: none; display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 14px; border: 1px solid #1B1F27; min-width: 0">'
         '<sc-if value="{{ r.hasUpl }}" hint-placeholder-val="{{ false }}"><img src="{{ r.upl }}" alt="Your chart" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px"></sc-if>'
         '<sc-if value="{{ r.drop }}" hint-placeholder-val="{{ false }}">' + DROP.replace("flex: 2; ", "position: relative; ").replace("aspect-ratio: 32 / 9", "aspect-ratio: 16 / 9; font-size: 13px") + '</sc-if>'
         '<sc-if value="{{ r.has1 }}" hint-placeholder-val="{{ true }}"><span class="chart" style="display: block">' + THUMB("r.k1") + '</span></sc-if>'
         '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="display: inline-flex; align-items: center; gap: 8px; min-width: 0">'
         '<a href="Story.dc.html" style="font-size: 15px; font-weight: 600; text-decoration: none; color: #ECEEF1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ r.pair }}</a>'
         '<sc-if value="{{ r.hasDir }}" hint-placeholder-val="{{ true }}">' + dchip("{{ r.dir }}") + '</sc-if>'
         '<sc-if value="{{ r.isAnalysis }}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; font-weight: 600; color: #B9A6FF; border: 1px solid #4A3F75; border-radius: 6px; padding: 0 6px; line-height: 1.5">Analysis</span></sc-if></span>'
         '<span class="num" style="font-size: 14px; font-weight: 600; color: {{ r.gc }}; white-space: nowrap">{{ r.gres }}</span></div>'
         '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px"><span style="display: flex; flex-direction: column; gap: 4px; min-width: 0">' + _fact("date", "{{ r.when }}", small=True) + '<sc-if value="{{ r.gSetup }}" hint-placeholder-val="{{ true }}">' + _fact("setup", "{{ r.gl }}", small=True) + '</sc-if><sc-if value="{{ r.gHint }}" hint-placeholder-val="{{ false }}"><span class="lbl" style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ r.gl }}</span></sc-if></span>' + ROWMENU + '</div>'
         '</li></sc-for>')

PROMPT = ('<sc-if value="{{ promptOn }}" hint-placeholder-val="{{ true }}"><div style="display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 12px; border: 1px solid #1B1F27">'
          '<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 360px"><span style="font-size: 14px; font-weight: 600">USDCHF closed 8 seconds after opening</span><span class="meta">MT5 #48240 · −0.1R. Count it in your stats? If you leave this, it counts.</span></div>'
          '<div style="display: flex; gap: 8px"><button type="button" class="btn btn-q" onClick="{{ countIt }}">Count it</button><button type="button" class="btn btn-g" onClick="{{ leaveOut }}">Leave it out</button></div></div></sc-if>')

def tradelog2(grid=False):
    return f'''
{SYMBOLS}
{title_block("Trade log", "Everything you've recorded, whenever you recorded it · MT5 synced 2 min ago", '<a href="NewStory.dc.html" class="btn btn-p">' + IC["plus"] + 'New chart story</a>')}
<div style="display: flex; flex-direction: column; gap: 12px">
<div role="group" aria-label="Filter" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
{fmenu("date", "date")}{fmenu("pair", "pair", 220)}{fmenu("setup", "setup", 260)}{fmenu("tag", "tag", 260)}{fmenu("dir", "dir", 180)}{fmenu("status", "status", 220)}
<sc-if value="{{{{ anyF }}}}" hint-placeholder-val="{{{{ false }}}}"><button type="button" class="btn btn-q" onClick="{{{{ clearF }}}}" style="min-height: 40px">Clear filters</button></sc-if>
</div>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap">
<span class="meta">{{{{ countText }}}}</span>
<div style="display: flex; gap: 8px; align-items: center">{fmenu("sort", "sort", 200, right=True)}{VIEWSEG(grid)}</div>
</div></div>
{PROMPT}
<sc-if value="{{{{ isList }}}}" hint-placeholder-val="{{{{ LV }}}}"><ol aria-label="Trade log" style="margin: 0; padding: 0; display: flex; flex-direction: column; border-bottom: 1px solid #1B1F27">{LROW}</ol></sc-if>
<sc-if value="{{{{ isGrid }}}}" hint-placeholder-val="{{{{ GV }}}}"><ol aria-label="Trade log" style="margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px">{GCARD}</ol></sc-if>
<sc-if value="{{{{ none }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0"><span style="font-size: 15px; font-weight: 600">No entries match these filters</span><button type="button" class="btn btn-g" onClick="{{{{ clearF }}}}">Clear filters</button></div></sc-if>
<sc-if value="{{{{ hasMore }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; flex-direction: column; align-items: center; gap: 8px"><span class="lbl">{{{{ shownText }}}}</span><button type="button" class="btn btn-g" onClick="{{{{ more }}}}">Show older entries</button></div></sc-if>
{TOAST}
'''

TL_SCRIPT = """
renderVals() {
  const st = this.state || {};
  const E0 = %s;
  const kit = this.kitVals();
  const view = st.view || '%s';
  const km = st.kmenu === undefined ? %s : st.kmenu;
  const del = st.del || {}, excl = st.excl || {}, dts = st.dts || {}, upl = st.upl || {};
  const fr = (v) => (v > 0 ? '+' : v < 0 ? '\\u2212' : '') + Math.abs(v).toFixed(1) + 'R';
  const col = (v) => v > 0 ? '#5BA2FF' : (v < 0 ? '#FF9A4D' : '#ECEEF1');
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const when = (d, t) => { const [y, m, dd] = d.split('-').map(Number); const x = new Date(Date.UTC(y, m - 1, dd)); return DAYS[x.getUTCDay()] + ' ' + dd + ' ' + SM[m - 1] + ', ' + t; };
  const E = E0.filter((e) => !del[e.id]).map((e) => { if (!dts[e.id]) return e; const [d, t] = dts[e.id].split('T'); return Object.assign({}, e, { d: d, t: t, when: when(d, t) }); });
  const f = Object.assign({ date: 'All time', pair: null, setup: null, tag: null, dir: null, status: null }, st.f || {});
  const sort = st.sort || 'Newest first';
  const DR = { 'All time': ['0000', '9999'], 'This week': ['2026-11-16', '9999'], 'Last week': ['2026-11-09', '2026-11-15'], 'This month': ['2026-11-01', '9999'], 'Last 3 months': ['2026-08-17', '9999'] };
  const range = f.date === 'Custom' ? [f.from || '0000', f.to || '9999'] : DR[f.date];
  const test = {
    date: (e, v) => { const r = v === 'Custom' ? range : DR[v]; return e.d >= r[0] && e.d <= r[1]; },
    pair: (e, v) => e.p.split(', ').includes(v), setup: (e, v) => (e.s || 'No setup') === v,
    tag: (e, v) => e.tags.includes(v), dir: (e, v) => e.dir === v, status: (e, v) => e.st === v };
  const pass = (e, skip) => Object.keys(test).every((k) => k === skip || f[k] == null || (k === 'date' && f[k] === 'All time') || test[k](e, f[k]));
  let rows = E.filter((e) => pass(e, null));
  const by = { 'Newest first': (a, b) => (a.d + a.t < b.d + b.t ? 1 : -1), 'Oldest first': (a, b) => (a.d + a.t > b.d + b.t ? 1 : -1),
               'Best R first': (a, b) => (b.r == null ? -99 : b.r) - (a.r == null ? -99 : a.r), 'Worst R first': (a, b) => (a.r == null ? 99 : a.r) - (b.r == null ? 99 : b.r) };
  rows = rows.slice().sort(by[sort]);
  const setF = (k, v) => this.setState({ f: Object.assign({}, f, { [k]: v }), kmenu: null, limit: null });
  const count = (k, v) => E.filter((e) => pass(e, k) && (v == null || (k === 'date' && v === 'All time') || test[k](e, v))).length;
  const uniq = (fn) => { const c = {}; for (const e of E) for (const v of [].concat(fn(e))) if (v != null) c[v] = (c[v] || 0) + 1; return Object.keys(c).sort((a, b) => c[b] - c[a]); };
  const menu = (k, name, values, allLabel, labelOf) => {
    const cur = f[k];
    const opts = [{ v: k === 'date' ? 'All time' : null, label: allLabel }].concat(values.map((v) => ({ v: v, label: v })));
    const isOpen = km === k;
    const active = k === 'date' ? cur !== 'All time' : cur != null;
    return { open: isOpen, exp: isOpen ? 'true' : 'false', toggle: () => this.setState({ kmenu: isOpen ? null : k, picking: false }),
      label: active ? (labelOf ? labelOf(cur) : cur) : name, aria: name + ': ' + (active ? cur : allLabel),
      bg: active || isOpen ? '#1B1F27' : 'transparent', bd: active ? '#5F6672' : '#353B46',
      opts: opts.map((o) => { const c = count(k, o.v); return { label: o.label, count: String(c), fc: c || o.v === cur ? '#ECEEF1' : '#5F6672', sel: o.v === cur, selS: o.v === cur ? 'true' : 'false', bg: o.v === cur ? '#1B1F27' : 'transparent',
                               pick: () => setF(k, o.v) }; }) };
  };
  const dateMenu = menu('date', 'Date', ['This week', 'Last week', 'This month', 'Last 3 months'], 'All time', (v) => { if (v !== 'Custom') return v; const fm = (x) => { if (!x) return '\\u2026'; const [y, m, d] = x.split('-').map(Number); return d + ' ' + SM[m - 1] + (y !== 2026 ? ' ' + y : ''); }; return fm(f.from) + ' to ' + fm(f.to); });
  dateMenu.label = f.date === 'All time' ? 'All time' : dateMenu.label;
  dateMenu.opts.push({ label: 'Pick dates\\u2026', count: '', fc: '#ECEEF1', sel: f.date === 'Custom', selS: f.date === 'Custom' ? 'true' : 'false', bg: f.date === 'Custom' ? '#1B1F27' : 'transparent',
                       pick: () => this.setState({ picking: true, pFrom: f.from || '2026-11-01', pTo: f.to || '2026-11-16' }) });
  const F = {
    date: dateMenu,
    pair: menu('pair', 'Pair', uniq((e) => e.p.split(', ')), 'Any pair'),
    setup: menu('setup', 'Setup', uniq((e) => e.s || 'No setup'), 'Any setup'),
    tag: menu('tag', 'Tags', uniq((e) => e.tags), 'Any tag'),
    dir: menu('dir', 'Direction', ['Long', 'Short'], 'Long and short'),
    status: menu('status', 'Status', ['Taken', 'Running', 'Watched', 'Not filled', 'Analysis'], 'Any status'),
  };
  const sk = km === 'sort';
  F.sort = { open: sk, exp: sk ? 'true' : 'false', toggle: () => this.setState({ kmenu: sk ? null : 'sort' }), label: sort, aria: 'Sort: ' + sort, bg: sk ? '#1B1F27' : 'transparent', bd: '#353B46',
    opts: Object.keys(by).map((o) => ({ label: o, count: '', fc: '#ECEEF1', sel: o === sort, selS: o === sort ? 'true' : 'false', bg: o === sort ? '#1B1F27' : 'transparent', pick: () => this.setState({ sort: o, kmenu: null }) })) };
  const anyF = Object.keys(test).some((k) => (k === 'date' ? f.date !== 'All time' : f[k] != null));
  const lim = st.limit || 12;
  const shown = rows.slice(0, lim);
  const mk = (e) => {
    const n = e.n, u = upl[e.id];
    const res = e.st === 'Taken' ? fr(e.r) : (e.st === 'Running' ? 'Open' : '');
    const plan = e.f === true ? 'Followed' : (e.f === false ? 'Not followed' : '');
    let line;
    if (e.st === 'Taken' && n === 0 && !u) line = 'From MT5 ' + e.mt5 + '. No screenshot? Scroll back on your chart and take one now. It still counts.';
    else if (e.st === 'Taken') line = [e.s, plan].concat(e.tags.length ? [e.tags.join(', ')] : []).join(' \\u00b7 ');
    else if (e.st === 'Running') line = "Still open in MT5. When it closes you'll get one chance to add an after chart. Skipping is fine.";
    else if (e.st === 'Watched') line = e.s + ' \\u00b7 Add an after chart any time if you want to see how it played out';
    else if (e.st === 'Not filled') line = 'Your limit order never triggered \\u00b7 stays out of your results';
    else line = '\\u201c' + e.plan + '\\u201d';
    const acct = e.also ? e.a + ' and ' + e.also : e.a;
    const meta = e.st === 'Analysis' ? e.when + ' \\u00b7 Before trading' : e.when + ' \\u00b7 ' + e.st + ' \\u00b7 ' + acct + (excl[e.id] ? ' \\u00b7 Excluded from stats' : '');
    const mOpen = km === 'm' + e.id, dOpen = km === 'd' + e.id;
    const gl = e.st === 'Analysis' ? 'Before trading' : e.st === 'Running' ? 'Running in MT5' : e.st === 'Not filled' ? 'Limit order never triggered' : (n === 0 && !u ? 'From MT5 \\u00b7 no charts yet' : (e.s || ''));
    return { pair: e.p, dir: e.dir || '', hasDir: !!e.dir, isAnalysis: e.st === 'Analysis', res: res, rc: e.st === 'Taken' ? col(e.r) : '#A3AAB5',
      gres: res || (e.st === 'Analysis' ? '' : e.st), gc: e.st === 'Taken' ? col(e.r) : '#A3AAB5', when: e.when, gl: gl,
      meta: meta, line: line, stl: e.st === 'Analysis' ? 'Before trading' : e.st, acct: acct, hasAcct: e.st !== 'Analysis', isExcl: !!excl[e.id],
      hasFacts2: e.st === 'Taken' && !(n === 0 && !u), hasHint: !(e.st === 'Taken' && !(n === 0 && !u)), setup: e.s || 'Unsorted', plan: plan, hasPlan: !!plan, tags: e.tags.join(', '), hasTags: e.tags.length > 0,
      gSetup: e.st === 'Taken' && !(n === 0 && !u) && !!e.s, gHint: !(e.st === 'Taken' && !(n === 0 && !u) && !!e.s), hasUpl: !!u, upl: u || '', drop: n === 0 && !u, has1: n >= 1 && !u, has2: n >= 2 && !u, only1: n === 1 && !u,
      k0: '#' + e.k[0], k1: '#' + e.k[1], more: n > 2 && !u ? '+' + (n - 2) + (n - 2 === 1 ? ' chart' : ' charts') : '',
      noNote: !e.note && e.st === 'Taken',
      mOpen: mOpen, mExp: mOpen ? 'true' : 'false', mBg: mOpen ? '#1B1F27' : 'transparent', mToggle: () => this.setState({ kmenu: mOpen ? null : 'm' + e.id }),
      exclLabel: excl[e.id] ? 'Include in stats' : 'Exclude from stats',
      excl: () => { const was = !!excl[e.id]; this.setState({ excl: Object.assign({}, excl, { [e.id]: !was }) }); this.toast(was ? 'Back in your stats' : 'Excluded from stats', { excl: excl }); },
      del: () => { this.setState({ del: Object.assign({}, del, { [e.id]: true }) }); this.toast('Entry deleted', { del: del }); },
      dOpen: dOpen, dateOpen: () => this.setState({ kmenu: 'd' + e.id, dtDraft: e.d + 'T' + e.t }),
      dtVal: st.dtDraft || (e.d + 'T' + e.t), dtSet: (ev) => this.setState({ dtDraft: ev.target.value }),
      dtSave: () => { const v = st.dtDraft; if (!v) return; this.setState({ dts: Object.assign({}, dts, { [e.id]: v }) }); this.toast('Date changed', { dts: dts }); },
      upload: (ev) => { const file = ev.target.files && ev.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); this.setState({ upl: Object.assign({}, upl, { [e.id]: url }) }); this.toast('Chart added'); }
    };
  };
  const promptOn = !st.prompt && !anyF;
  return Object.assign(kit, {
    F: F, anyF: anyF, clearF: () => this.setState({ f: {}, kmenu: null, limit: null }),
    picking: km === 'date' && !!st.picking, pickFrom: st.pFrom || '', pickTo: st.pTo || '',
    setFrom: (ev) => this.setState({ pFrom: ev.target.value }), setTo: (ev) => this.setState({ pTo: ev.target.value }),
    applyDates: () => this.setState({ f: Object.assign({}, f, { date: 'Custom', from: st.pFrom, to: st.pTo }), kmenu: null, picking: false, limit: null }),
    countText: rows.length + (rows.length === 1 ? ' entry' : ' entries'),
    rows: shown.map(mk), none: rows.length === 0, hasMore: rows.length > lim,
    shownText: 'Showing ' + shown.length + ' of ' + rows.length, more: () => this.setState({ limit: lim + 12 }),
    isList: view === 'list', notList: view !== 'list', isGrid: view === 'grid', notGrid: view !== 'grid',
    setList: () => this.setState({ view: 'list' }), setGrid: () => this.setState({ view: 'grid' }),
    promptOn: promptOn,
    countIt: () => { this.setState({ prompt: 'count' }); this.toast('USDCHF counts in your stats', { prompt: null }); },
    leaveOut: () => { this.setState({ prompt: 'out' }); this.toast('USDCHF left out of your stats', { prompt: null }); }
  });
}
%s
"""
def tl2_script(view, menu):
    return TL_SCRIPT % (_tj.dumps(TL_DATA, separators=(",", ":"), ensure_ascii=False), view, menu, KIT_METHODS)

daily = tradelog2(False).replace("{{ LV }}", "true").replace("{{ GV }}", "false")
daily_cal = tradelog2(True).replace("{{ LV }}", "false").replace("{{ GV }}", "true")
log_script = tl2_script("list", "undefined")
grid_script = tl2_script("grid", "'date'")
