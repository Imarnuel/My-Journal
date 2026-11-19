// Prototype logic from handoff/prototype/Settings.dc.html, kept as the behaviour reference.
// Screens port this into hooks over the shared store; until then it drives the view as-is.
/* eslint-disable */
// @ts-nocheck
export default function make(DCLogic) {

class Component extends DCLogic {
baseVals() {
  const st = this.state || {};
  const kit = this.kitVals();
  const km = st.kmenu || null;
  const g = (k, d) => (k in st ? st[k] : d);
  const V0 = [{"t": "Break of structure", "n": 18, "k": "Good"}, {"t": "Trend continuation", "n": 16, "k": "Good"}, {"t": "Liquidity sweep", "n": 12, "k": "Good"}, {"t": "Entered before close", "n": 10, "k": "Mistake"}, {"t": "Supply zone", "n": 7, "k": "Good"}, {"t": "Retest", "n": 7, "k": "Good"}, {"t": "Chased entry", "n": 7, "k": "Mistake"}, {"t": "Asia range", "n": 7, "k": "Neutral"}, {"t": "Moved stop", "n": 6, "k": "Mistake"}, {"t": "Demand zone", "n": 6, "k": "Good"}, {"t": "Low volume", "n": 6, "k": "Neutral"}, {"t": "News day", "n": 6, "k": "Neutral"}, {"t": "Liquidity grab", "n": 3, "k": "Good"}], S0 = [["Asia", "01:00", "10:00"], ["London", "09:00", "17:30"], ["New York", "14:00", "23:00"]];
  const V = st.vocab || V0, SS = st.sess || S0;
  const remind = g('remind', true);
  const keep = g('keep', true);
  const rday = g('rday', "Saturday");
  const rtime = g('rtime', "8:00 pm");
  const tz = g('tz', "Lagos (UTC+1)");
  const lang = g('lang', "English");
  return Object.assign(kit, {
    remindOn: remind, remindOff: !remind, remindFlip: () => this.setState({ remind: !remind }),
    keepOn: keep, keepOff: !keep, keepFlip: () => this.setState({ keep: !keep }),
    rdayVal: rday, rdayOpen: km === 'rday', rdayExp: km === 'rday' ? 'true' : 'false', rdayToggle: () => this.setState({ kmenu: km === 'rday' ? null : 'rday' }), rdayOpts: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((o) => ({ label: o, sel: o === rday, selS: o === rday ? 'true' : 'false', bg: o === rday ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ rday: o, kmenu: null }) })),
    rtimeVal: rtime, rtimeOpen: km === 'rtime', rtimeExp: km === 'rtime' ? 'true' : 'false', rtimeToggle: () => this.setState({ kmenu: km === 'rtime' ? null : 'rtime' }), rtimeOpts: ["6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm"].map((o) => ({ label: o, sel: o === rtime, selS: o === rtime ? 'true' : 'false', bg: o === rtime ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ rtime: o, kmenu: null }) })),
    tzVal: tz, tzOpen: km === 'tz', tzExp: km === 'tz' ? 'true' : 'false', tzToggle: () => this.setState({ kmenu: km === 'tz' ? null : 'tz' }), tzOpts: ["Lagos (UTC+1)", "London (UTC+0)", "New York (UTC\u22125)", "Dubai (UTC+4)", "Singapore (UTC+8)"].map((o) => ({ label: o, sel: o === tz, selS: o === tz ? 'true' : 'false', bg: o === tz ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ tz: o, kmenu: null }) })),
    langVal: lang, langOpen: km === 'lang', langExp: km === 'lang' ? 'true' : 'false', langToggle: () => this.setState({ kmenu: km === 'lang' ? null : 'lang' }), langOpts: ["English", "French", "Spanish", "Portuguese", "Arabic"].map((o) => ({ label: o, sel: o === lang, selS: o === lang ? 'true' : 'false', bg: o === lang ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ lang: o, kmenu: null }) })),
    mergeOn: !st.merged, merge: () => { this.setState({ merged: true }); this.toast('Merged into Break of structure. Old stories updated.', { merged: false }); },
    sess: SS.map((x, i) => ({ n: x[0], a: x[1], b: x[2], txt: x[1] + ' to ' + x[2], aLabel: x[0] + ' starts', bLabel: x[0] + ' ends',
      setA: (e) => { const n = SS.map((y) => y.slice()); n[i][1] = e.target.value; this.setState({ sess: n }); }, setB: (e) => { const n = SS.map((y) => y.slice()); n[i][2] = e.target.value; this.setState({ sess: n }); } })),
    sessView: !st.sessEdit, sessEdit: !!st.sessEdit, sessBtn: st.sessEdit ? 'Done' : 'Edit session times', editSess: () => this.setState({ sessEdit: !st.sessEdit }),
    sessReset: () => this.setState({ sess: S0 }),
    nTags: String(V.length), tagMix: ['Good', 'Mistake', 'Neutral'].map((k) => { const n = V.filter((v) => v.k === k).length; return n + ' ' + (k === 'Good' ? 'good' : k === 'Mistake' ? (n === 1 ? 'mistake' : 'mistakes') : 'neutral'); }).join(' \u00b7 '),
    tagsOpen: !!st.tagsOpen, tagsExp: st.tagsOpen ? 'true' : 'false', tagsBtn: st.tagsOpen ? 'Done' : 'Manage tags', manageTags: () => this.setState({ tagsOpen: !st.tagsOpen }),
    tagList: V.map((v, i) => ({ t: v.t, k: v.k, used: 'used ' + v.n + (v.n === 1 ? ' time' : ' times'), renameLabel: 'Rename ' + v.t, rmLabel: 'Remove ' + v.t,
      rename: (e) => { const n = V.slice(); n[i] = Object.assign({}, v, { t: e.target.value }); this.setState({ vocab: n }); },
      rm: () => { this.setState({ vocab: V.filter((_, j) => j !== i) }); this.toast('Removed ' + v.t + ' from ' + v.n + ' stories', { vocab: V }); } })),
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
