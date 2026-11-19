// Prototype logic from handoff/prototype/EditAccount.dc.html, kept as the behaviour reference.
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

  const etype = g('etype', "Prop firm");
  const eprac = g('eprac', false);
  return Object.assign(kit, {
    etype0p: etype === "Live" ? 'true' : 'false', etype0: () => this.setState({ etype: "Live" }),
    etype1p: etype === "Prop firm" ? 'true' : 'false', etype1: () => this.setState({ etype: "Prop firm" }),
    etype2p: etype === "Demo" ? 'true' : 'false', etype2: () => this.setState({ etype: "Demo" }),
    etype3p: etype === "Backtest" ? 'true' : 'false', etype3: () => this.setState({ etype: "Backtest" }),
    epracOn: eprac, epracOff: !eprac, epracFlip: () => this.setState({ eprac: !eprac }),
    ownOn: !!st.own, ownOff: !st.own, ownOpen: () => this.setState({ own: true }),
    reconnect: () => this.toast('Reconnected. Synced just now.', null),
    alive: !st.gone, gone: !!st.gone, arch: !!st.arch, unarch: () => this.setState({ arch: false }), undel: () => this.setState({ gone: false }),
    archAcct: () => { this.setState({ arch: true }); this.toast('Funded 100K archived', { arch: false }); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {} },
    delAcct: () => this.setState({ gone: true }),
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
