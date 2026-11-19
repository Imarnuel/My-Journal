// Prototype logic from handoff/prototype/SetupEdit.dc.html, kept as the behaviour reference.
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
  const R0 = {"Context": ["Daily trend is bullish", "Price sweeps the Asian session low"], "Entry": ["15m breaks structure after the sweep", "Enter on the retest"], "Exit": ["Stop below the sweep", "Target the previous high"]};
  const R = st.rules || R0;
  const mk = (grp) => R[grp].map((t, i) => ({ t: t, set: (e) => { const n = Object.assign({}, R); n[grp] = R[grp].slice(); n[grp][i] = e.target.value; this.setState({ rules: n }); }, rm: () => { const n = Object.assign({}, R); n[grp] = R[grp].filter((_, j) => j !== i); this.setState({ rules: n }); this.toast('Rule removed', { rules: R }); } }));
  const add = (grp) => () => { const n = Object.assign({}, R); n[grp] = R[grp].concat(['']); this.setState({ rules: n }); };
  return Object.assign(kit, {
    
    rContext: mk('Context'), rEntry: mk('Entry'), rExit: mk('Exit'), addContext: add('Context'), addEntry: add('Entry'), addExit: add('Exit'),
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
