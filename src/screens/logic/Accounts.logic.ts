// Prototype logic from handoff/prototype/Accounts.dc.html, kept as the behaviour reference.
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
  const AR0 = [['Challenge 25K', 'Prop firm \u00b7 failed in September \u00b7 31 chart stories'], ['Funded 50K', 'Prop firm \u00b7 reset in July \u00b7 22 chart stories']];
  const AR = st.ar || AR0;
  const dflt = g('dflt', "Challenge 50K");
  const copy = g('copy', "Attach to both");
  return Object.assign(kit, {
    dfltVal: dflt, dfltOpen: km === 'dflt', dfltExp: km === 'dflt' ? 'true' : 'false', dfltToggle: () => this.setState({ kmenu: km === 'dflt' ? null : 'dflt' }), dfltOpts: ["Main account", "Funded 100K", "Challenge 50K", "Demo account", "Backtesting"].map((o) => ({ label: o, sel: o === dflt, selS: o === dflt ? 'true' : 'false', bg: o === dflt ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ dflt: o, kmenu: null }) })),
    copyVal: copy, copyOpen: km === 'copy', copyExp: km === 'copy' ? 'true' : 'false', copyToggle: () => this.setState({ kmenu: km === 'copy' ? null : 'copy' }), copyOpts: ["Attach to both", "Only the first account", "Ask me each time"].map((o) => ({ label: o, sel: o === copy, selS: o === copy ? 'true' : 'false', bg: o === copy ? 'var(--surface-pressed)' : 'transparent', pick: () => this.setState({ copy: o, kmenu: null }) })),
    arcOpen: !!st.arcOpen, arcExp: st.arcOpen ? 'true' : 'false', arcToggle: () => this.setState({ arcOpen: !st.arcOpen }),
    arcLabel: 'Archived (' + AR.length + ')' + (AR.length ? ' \u00b7 ' + AR.map((x) => x[0]).join(', ') : ''),
    arcList: AR.map((x) => ({ n: x[0], sub: x[1], restore: () => { this.setState({ ar: AR.filter((y) => y !== x) }); this.toast(x[0] + ' is back in your lists', { ar: AR }); } })),
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
