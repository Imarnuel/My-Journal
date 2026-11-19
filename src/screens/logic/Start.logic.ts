// Prototype logic from handoff/prototype/Start.dc.html, kept as the behaviour reference.
// Screens port this into hooks over the shared store; until then it drives the view as-is.
/* eslint-disable */
// @ts-nocheck
export default function make(DCLogic) {

class Component extends DCLogic {
baseVals() { return {}; }
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
