// Prototype logic from handoff/prototype/Story.dc.html, kept as the behaviour reference.
// Screens port this into hooks over the shared store; until then it drives the view as-is.
/* eslint-disable */
// @ts-nocheck
export default function make(DCLogic) {

class Component extends DCLogic {

baseVals() {
  const st = this.state || {};
  const INIT = {"new": {"pair": "GBPUSD", "dir": "Short", "status": "Taken", "acct": "Funded 100K", "dt": "2026-11-16T09:45", "nums": {"Entry": "1.26840", "Stop": "1.27010", "Target": "1.26480", "Exit": "1.26482", "Size": "0.50 lots", "Result": "+2.1R"}, "charts": [{"k": "W", "cap": "Weekly"}, {"k": "D", "cap": ""}, {"k": "4H", "cap": "4H"}, {"k": "E", "cap": "15m"}], "before": "", "refl": "", "sugg": false, "setup": null, "tags": [], "plan": null, "head": null, "rec": false, "len": "0:24"}, "newfilled": {"pair": "GBPUSD", "dir": "Short", "status": "Taken", "acct": "Funded 100K", "dt": "2026-11-16T09:45", "nums": {"Entry": "1.26840", "Stop": "1.27010", "Target": "1.26480", "Exit": "1.26482", "Size": "0.50 lots", "Result": "+2.1R"}, "charts": [{"k": "W", "cap": "Weekly"}, {"k": "D", "cap": ""}, {"k": "4H", "cap": "4H"}, {"k": "E", "cap": "15m"}], "rec": true, "len": "0:24", "before": "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.", "refl": "Waiting for the candle to close kept the entry calm and on plan. Worth repeating.", "sugg": true, "setup": "4H supply pullback", "tags": [{"t": "Supply zone", "k": "Good"}, {"t": "Break of structure", "k": "Good"}, {"t": "Retest", "k": "Good"}], "plan": "Followed", "head": "Calm"}, "saved": {"pair": "GBPUSD", "dir": "Short", "status": "Taken", "acct": "Funded 100K", "dt": "2026-11-16T09:45", "nums": {"Entry": "1.26840", "Stop": "1.27010", "Target": "1.26480", "Exit": "1.26482", "Size": "0.50 lots", "Result": "+2.1R"}, "charts": [{"k": "W", "cap": "Weekly"}, {"k": "D", "cap": ""}, {"k": "4H", "cap": "4H"}, {"k": "E", "cap": "15m"}, {"k": "A", "cap": "15m"}], "rec": true, "len": "0:24", "before": "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.", "refl": "Patience paid off: no rushing, held to target. Bring the same patience to Gold.", "sugg": false, "setup": "4H supply pullback", "tags": [{"t": "Supply zone", "k": "Good"}, {"t": "Break of structure", "k": "Good"}, {"t": "Retest", "k": "Good"}], "plan": "Followed", "head": "Calm"}}, MODE = 'saved', VOCAB = [{"t": "Break of structure", "n": 18, "k": "Good"}, {"t": "Trend continuation", "n": 16, "k": "Good"}, {"t": "Liquidity sweep", "n": 12, "k": "Good"}, {"t": "Entered before close", "n": 10, "k": "Mistake"}, {"t": "Supply zone", "n": 7, "k": "Good"}, {"t": "Retest", "n": 7, "k": "Good"}, {"t": "Chased entry", "n": 7, "k": "Mistake"}, {"t": "Asia range", "n": 7, "k": "Neutral"}, {"t": "Moved stop", "n": 6, "k": "Mistake"}, {"t": "Demand zone", "n": 6, "k": "Good"}, {"t": "Low volume", "n": 6, "k": "Neutral"}, {"t": "News day", "n": 6, "k": "Neutral"}, {"t": "Liquidity grab", "n": 3, "k": "Good"}], SETUPS = ["4H supply pullback", "London breakout", "Asian range fade"], HEADS = ["Calm", "Confident", "Focused", "Rushed", "Tired", "Frustrated"], PAIRS = ["GBPUSD", "EURUSD", "XAUUSD", "GBPJPY", "USDJPY", "AUDUSD", "EURJPY", "USDCAD", "NZDUSD"], STATUS = [["Taken", "Counts in your results"], ["Watched", "You saw it, didn't take it"], ["Not filled", "Order never triggered"], ["Analysis", "Charts before trading"]], ACCTS = ["Main account", "Funded 100K", "Challenge 50K", "Demo account", "Backtesting"], FILL = {"before": "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.", "refl": "Waiting for the candle to close kept the entry calm and on plan. Worth repeating.", "sugg": true, "setup": "4H supply pullback", "tags": [{"t": "Supply zone", "k": "Good"}, {"t": "Break of structure", "k": "Good"}, {"t": "Retest", "k": "Good"}], "plan": "Followed", "head": "Calm"};
  const kit = this.kitVals();
  const I = INIT[MODE];
  const g = (k) => (k in st ? st[k] : I[k]);
  const set = (o) => this.setState(o);
  const km = st.kmenu || null;
  const choice = (k, list, val, toastMsg) => list.map((o) => { const v = Array.isArray(o) ? o[0] : o, h = Array.isArray(o) ? o[1] : '';
    return { label: v, hint: h, hasHint: !!h, sel: v === val, selS: v === val ? 'true' : 'false', bg: v === val ? 'var(--surface-pressed)' : 'transparent', pick: () => set({ [k]: v, kmenu: null }) }; });
  // charts
  const charts = g('charts');
  const selI = Math.min(st.sel == null ? charts.length - 1 : st.sel, charts.length - 1);
  const move = (i, j) => { const c = charts.slice(); const [x] = c.splice(i, 1); c.splice(j, 0, x); set({ charts: c, sel: j, kmenu: null }); };
  const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
  const big = charts[selI];
  // voice
  const rec = g('rec'), recording = !!st.recording, playing = !!st.playing;
  const fillNow = () => {
    const upd = { rec: true, recording: false, recSec: 0, said: false };
    const filled = [];
    if (!g('before')) { upd.before = FILL.before; }
    if (!g('refl')) { upd.refl = FILL.refl; upd.sugg = true; }
    if (!g('setup')) { upd.setup = FILL.setup; filled.push('setup'); }
    const have = g('tags').map((t) => t.t); const add = FILL.tags.filter((t) => !have.includes(t.t));
    if (add.length) { upd.tags = g('tags').concat(add); filled.push(add.length + (add.length === 1 ? ' tag' : ' tags')); }
    if (!g('plan')) { upd.plan = FILL.plan; filled.push('plan'); }
    if (!g('head')) { upd.head = FILL.head; filled.push('headspace'); }
    const prev = {}; for (const k of Object.keys(upd)) prev[k] = k in st ? st[k] : I[k];
    prev.recording = false; prev.recSec = 0;
    clearInterval(this._rt); set(upd);
    this.toast(filled.length ? 'From your note: notes, ' + filled.join(', ') : 'Notes filled from your note', prev);
  };
  const stopPlay = () => { clearInterval(this._pt); };
  // tags
  const tags = g('tags');
  const q = st.tagQ || '';
  const ql = q.trim().toLowerCase();
  const have = tags.map((t) => t.t.toLowerCase());
  const sug = ql ? VOCAB.filter((v) => v.t.toLowerCase().includes(ql) && !have.includes(v.t.toLowerCase())).slice(0, 6) : VOCAB.filter((v) => !have.includes(v.t.toLowerCase())).slice(0, 5);
  const exact = VOCAB.some((v) => v.t.toLowerCase() === ql) || have.includes(ql);
  const addTag = (t, k) => { set({ tags: tags.concat([{ t: t, k: k }]), tagQ: '', kmenu: null, kindFor: null }); };
  const nice = (s) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
  // numbers
  const nums = g('nums');
  const res = nums.Result || '';
  const rv = parseFloat(res.replace('\u2212', '-'));
  // date
  const dt = g('dt');
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], SM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [dpart, tpart] = dt.split('T'); const [yy, mm, dd] = dpart.split('-').map(Number);
  const dtLabel = DAYS[new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay()] + ' ' + dd + ' ' + SM[mm - 1] + ', ' + tpart;
  const hr = Number(tpart.slice(0, 2)); const sess = hr < 7 ? 'Asia' : (hr < 13 ? 'London' : 'New York');
  const pinned = !!st.pinned, excluded = !!st.excluded;
  return Object.assign(kit, {
    setupOpen: km === 'setup', setupExp: km === 'setup' ? 'true' : 'false', setupToggle: () => set({ kmenu: km === 'setup' ? null : 'setup' }), headOpen: km === 'head', headExp: km === 'head' ? 'true' : 'false', headToggle: () => set({ kmenu: km === 'head' ? null : 'head' }), pairOpen: km === 'pair', pairExp: km === 'pair' ? 'true' : 'false', pairToggle: () => set({ kmenu: km === 'pair' ? null : 'pair' }), dirOpen: km === 'dir', dirExp: km === 'dir' ? 'true' : 'false', dirToggle: () => set({ kmenu: km === 'dir' ? null : 'dir' }), statusOpen: km === 'status', statusExp: km === 'status' ? 'true' : 'false', statusToggle: () => set({ kmenu: km === 'status' ? null : 'status' }), acctOpen: km === 'acct', acctExp: km === 'acct' ? 'true' : 'false', acctToggle: () => set({ kmenu: km === 'acct' ? null : 'acct' }), dtOpen: km === 'dt', dtExp: km === 'dt' ? 'true' : 'false', dtToggle: () => set({ kmenu: km === 'dt' ? null : 'dt' }), smOpen: km === 'sm', smExp: km === 'sm' ? 'true' : 'false', smToggle: () => set({ kmenu: km === 'sm' ? null : 'sm' }),
    alive: !st.deleted, gone: !!st.deleted, undoDel: () => set({ deleted: false }),
    // charts
    bigSym: !big.src, bigImg: !!big.src, bigHref: '#g' + big.k, bigSrc: big.src || '', bigAlt: (big.cap || 'Chart') + ', chart ' + (selI + 1) + ' of ' + charts.length,
    bigCap: big.cap || '', bigPos: (selI + 1) + ' of ' + charts.length,
    charts: charts.map((c, i) => ({ isSym: !c.src, isImg: !!c.src, href: '#g' + c.k, src: c.src || '', cap: c.cap || '', pressed: i === selI ? 'true' : 'false', ring: i === selI ? '0 0 0 2px var(--text-1)' : 'none',
      showLabel: 'Show ' + ORD[i] + ' chart', menuLabel: 'Actions for ' + ORD[i] + ' chart', show: () => set({ sel: i }),
      mOpen: km === 'c' + i, mExp: km === 'c' + i ? 'true' : 'false', mToggle: () => set({ kmenu: km === 'c' + i ? null : 'c' + i }),
      canLeft: i > 0, canRight: i < charts.length - 1, canRemove: charts.length > 1, onlyOne: charts.length === 1,
      left: () => move(i, i - 1), right: () => move(i, i + 1),
      remove: () => { const c = charts.slice(); c.splice(i, 1); set({ charts: c, sel: Math.min(selI, c.length - 1), kmenu: null }); this.toast('Chart removed', { charts: charts, sel: selI }); },
      drag: (e) => { this._drag = i; try { e.dataTransfer.effectAllowed = 'move'; } catch (_) {} },
      drop: (e) => { e.preventDefault(); if (this._drag != null && this._drag !== i) move(this._drag, i); this._drag = null; } })),
    dragOver: (e) => e.preventDefault(),
    addChart: (ev) => { const fs = Array.from(ev.target.files || []); if (!fs.length) return; const add = fs.map((f) => ({ src: URL.createObjectURL(f), cap: '' })); set({ charts: charts.concat(add), sel: charts.length + add.length - 1 }); this.toast(add.length === 1 ? 'Chart added' : add.length + ' charts added'); },
    // notes
    talkBtn: !rec && !recording, recording: recording, hasRec: rec && !recording,
    recTime: '0:' + String(st.recSec || 0).padStart(2, '0'),
    startRec: () => { stopPlay(); clearInterval(this._rt); set({ recording: true, recSec: 0, playing: false }); this._rt = setInterval(() => this.setState((s) => ({ recSec: (s.recSec || 0) + 1 })), 1000); },
    cancelRec: () => { clearInterval(this._rt); set({ recording: false, recSec: 0 }); },
    stopRec: fillNow,
    before: g('before'), refl: g('refl'), sugg: !!g('sugg') && !!g('refl'),
    setBefore: (e) => set({ before: e.target.value }), setRefl: (e) => set({ refl: e.target.value, sugg: false }),
    keepRefl: () => set({ sugg: false }), dropRefl: () => { const r = g('refl'); set({ refl: '', sugg: false }); this.toast('Reflection deleted', { refl: r, sugg: true }); },
    playing: playing, paused: !playing, playLabel: playing ? 'Pause your voice note' : 'Play your voice note',
    playText: playing || st.pSec ? 'Playing 0:' + String(st.pSec || 0).padStart(2, '0') + ' of ' + g('len') : 'From your ' + g('len') + ' voice note',
    togglePlay: () => { if (playing) { stopPlay(); set({ playing: false }); return; } set({ playing: true }); this._pt = setInterval(() => this.setState((s) => { const n = (s.pSec || 0) + 1; if (n > 24) { clearInterval(this._pt); return { playing: false, pSec: 0 }; } return { pSec: n }; }), 1000); },
    said: !!st.said, saidExp: st.said ? 'true' : 'false', toggleSaid: () => set({ said: !st.said }),
    // details
    detailsHint: rec ? 'From your note \u00b7 tap any to change' : 'From your note, or set them yourself',
    setupSet: !!g('setup'), setupUnset: !g('setup'), setupVal: g('setup') || '', setupOpts: choice('setup', SETUPS, g('setup')),
    headSet: !!g('head'), headUnset: !g('head'), headVal: g('head') || '', headOpts: choice('head', HEADS, g('head')),
    tagPills: tags.map((t, i) => ({ t: t.t, rmLabel: 'Remove ' + t.t, rm: () => { const n = tags.slice(); n.splice(i, 1); set({ tags: n }); this.toast('Removed ' + t.t, { tags: tags }); } })),
    tagPh: tags.length ? '' : 'Add a tag', tagQ: q, tagExp: km === 'tag' ? 'true' : 'false',
    tagType: (e) => set({ tagQ: e.target.value, kmenu: 'tag' }), tagFocus: () => { if (km !== 'tag') set({ kmenu: 'tag' }); },
    tagKey: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (sug.length && ql) addTag(sug[0].t, sug[0].k); else if (ql && !exact) set({ kmenu: 'kind', kindFor: nice(q) }); }
                     if (e.key === 'Backspace' && !q && tags.length) { set({ tags: tags.slice(0, -1) }); } if (e.key === 'Escape') set({ kmenu: null }); },
    tagMenu: km === 'tag', tagSug: sug.map((v) => ({ t: v.t, used: 'used ' + v.n + (v.n === 1 ? ' time' : ' times'), pick: () => addTag(v.t, v.k) })),
    tagCanAdd: !!ql && !exact, tagAddLabel: 'Add \u201c' + nice(q) + '\u201d as a new tag', tagNone: !ql && !sug.length,
    tagAskKind: () => set({ kmenu: 'kind', kindFor: nice(q) }),
    kindAsk: km === 'kind', kindTag: st.kindFor || '',
    kinds: [['Good', 'Something to repeat'], ['Mistake', 'Counts in costliest mistakes'], ['Neutral', 'Just context']].map(([k, h]) => ({ label: k, hint: h, pick: () => { addTag(st.kindFor, k); this.toast('New tag \u201c' + st.kindFor + '\u201d (' + k.toLowerCase() + ')'); } })),
    planOpts: ['Followed', 'Not followed'].map((o) => { const s = g('plan') === o; return { label: o, pressed: s ? 'true' : 'false', fw: s ? 600 : 500, fg: s ? 'var(--text-1)' : 'var(--text-2)', bg: s ? 'var(--surface-3)' : 'transparent', pick: () => set({ plan: s ? null : o }) }; }),
    // facts
    pairVal: g('pair'), pairOpts: choice('pair', PAIRS, g('pair')),
    dirVal: g('dir'), dirOpts: choice('dir', ['Long', 'Short'], g('dir')),
    statusVal: g('status'), statusOpts: choice('status', STATUS, g('status')),
    acctVal: g('acct'), acctOpts: choice('acct', ACCTS, g('acct')),
    dtLabel: dtLabel, dtDraft: st.dtDraft || dt, dtSetDraft: (e) => set({ dtDraft: e.target.value }),
    dtSave: () => { const v = st.dtDraft; if (v) { set({ dt: v, kmenu: null, dtDraft: null }); this.toast('Date changed', { dt: dt }); } else set({ kmenu: null }); },
    numOpen: !!st.numOpen, numExp: st.numOpen ? 'true' : 'false', numBtn: st.numOpen ? 'Done' : 'Edit numbers', toggleNums: () => set({ numOpen: !st.numOpen }),
    numLine: ['Entry', 'Stop', 'Target', 'Exit'].filter((k) => nums[k]).map((k) => k + ' ' + nums[k]),
    numFields: ['Entry', 'Stop', 'Target', 'Exit', 'Size', 'Result'].map((k) => ({ label: k, v: nums[k] || '', set: (e) => set({ nums: Object.assign({}, nums, { [k]: e.target.value }) }) })),
    resVal: g('status') === 'Taken' ? (res || 'No result yet') : g('status'), resCol: g('status') !== 'Taken' || isNaN(rv) ? 'var(--text-2)' : (rv > 0 ? 'var(--profit)' : (rv < 0 ? 'var(--loss)' : 'var(--text-1)')),
    // saved story
    subLine: g('status') + ' \u00b7 ' + g('acct') + ' \u00b7 ' + dtLabel + ' to 13:20 \u00b7 ' + sess,
    pinned: pinned, pinLabel: pinned ? 'Unpin textbook example' : 'Pin as textbook',
    pinT: () => { set({ pinned: !pinned, kmenu: null }); this.toast(pinned ? 'Unpinned' : 'Pinned as a textbook example in ' + (g('setup') || 'your playbook'), { pinned: pinned }); },
    excluded: excluded, exclLabel: excluded ? 'Include in stats' : 'Exclude from stats',
    exclT: () => { set({ excluded: !excluded, kmenu: null }); this.toast(excluded ? 'Back in your stats' : 'Excluded from stats', { excluded: excluded }); },
    delStory: () => { set({ deleted: true, kmenu: null }); }
  });
}

kitVals() {
  const st = this.state || {};
  const ALL = [["Main account", false], ["Funded 100K", false], ["Challenge 50K", false], ["Demo account", true], ["Backtesting", true]], DEF = ["Main account", "Funded 100K", "Challenge 50K"];
  const on = st.accts || DEF;
  const setA = (a) => this.setState({ accts: a });
  const t = st.toast;
  return {
    kClose: () => this.setState({ kmenu: null }),
    apOpen: st.kmenu === 'ap', apToggle: () => this.setState({ kmenu: st.kmenu === 'ap' ? null : 'ap' }),
    apLabel: on.length === 1 ? on[0] : (on.length === ALL.length ? 'All accounts' : on.length + ' accounts'),
    apRows: ALL.map(([n, p]) => ({ name: n, practice: p, on: on.includes(n), onlyLabel: 'Show only ' + n,
      toggle: () => { const nx = on.includes(n) ? on.filter((x) => x !== n) : on.concat([n]); if (nx.length) setA(nx); },
      only: () => setA([n]) })),
    apReset: () => setA(DEF),
    toastOn: !!t, toastMsg: t ? t.msg : '', toastCanUndo: !!(t && t.undo),
    toastUndo: () => { const u = t && t.undo; this.setState(Object.assign({ toast: null }, u || {})); }
  };
}
toast(msg, undo) {
  clearTimeout(this._tt);
  this.setState({ toast: { msg: msg, undo: undo || null }, kmenu: null });
  this._tt = setTimeout(() => this.setState({ toast: null }), 6000);
}


renderVals() {
  const v = this.baseVals();
  const st = this.state || {};
  const ap = st.appearance || 'Default';
  v.theme = ap === 'Dark' ? 'dark' : ap === 'Light' ? 'light' : (this.props.darkPreview === true ? 'dark' : 'light');
  v.appearance = ['Default', 'Dark', 'Light'].map((o) => ({ label: o === 'Default' ? 'System' : o, pressed: o === ap ? 'true' : 'false', pick: () => this.setState({ appearance: o }) }));
  return v;
}

}

return Component;
}
