# BEHAVIOUR KIT. One behaviour per kind of control, used on every screen.
#  - Menus: one open at a time (state.kmenu). The trigger toggles; choosing an option sets it and closes;
#    a click anywhere outside closes (a transparent backdrop behind the menu).
#  - Account picker: tick accounts in or out, "Only" on hover, Reset. At least one stays ticked. Changes the numbers only.
#  - Toast: every destructive or hiding action shows one line with Undo, for 6 seconds. No confirm dialogs.
import json as _kj

KIT_CSS = ".kit-row .kit-only{opacity:0}.kit-row:hover .kit-only,.kit-row:focus-within .kit-only{opacity:1}.kit-opt:hover{background:#1B1F27}"

def backdrop(close="kClose"):
    return (f'<button type="button" aria-label="Close menu" tabindex="-1" onClick="{{{{ {close} }}}}" '
            'style="position: fixed; inset: 0; z-index: 4; background: transparent; border: 0; padding: 0; cursor: default"></button>')

MENU_BOX = "position: absolute; z-index: 6; top: calc(100% + 6px); padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px; box-sizing: border-box"
OPT = "font: inherit; font-size: 14px; text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 10px; color: #ECEEF1; background: transparent; border: 0; border-radius: 8px; padding: 0 12px; min-height: 40px; cursor: pointer; width: 100%"

def acct_picker():
    rows = ('<sc-for list="{{ apRows }}" as="a" hint-placeholder-count="5">'
            '<div class="kit-row" style="display: flex; align-items: center; gap: 8px; padding: 0 8px 0 10px; border-radius: 8px">'
            '<label style="flex: 1; display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer">'
            '<input type="checkbox" checked="{{ a.on }}" onChange="{{ a.toggle }}" style="width: 18px; height: 18px; margin: 0; accent-color: #ECEEF1">'
            '<span style="font-size: 14px; color: #ECEEF1">{{ a.name }}</span>'
            '<sc-if value="{{ a.practice }}" hint-placeholder-val="{{ false }}"><span style="font-size: 12px; color: #8C939F">Practice</span></sc-if></label>'
            '<button type="button" class="kit-only" aria-label="{{ a.onlyLabel }}" onClick="{{ a.only }}" style="font: inherit; font-size: 12px; font-weight: 600; color: #ECEEF1; background: #252A33; border: 0; border-radius: 6px; padding: 0 10px; min-height: 28px; cursor: pointer">Only</button>'
            '</div></sc-for>')
    box = (f'<fieldset style="{MENU_BOX}; right: 0; width: 300px; margin: 0; text-align: left">'
           '<legend style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">Accounts to include</legend>'
           + rows +
           '<div style="height: 1px; background: #252A33; margin: 6px 4px"></div>'
           '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 4px">'
           '<button type="button" onClick="{{ apReset }}" style="font: inherit; font-size: 13px; color: #A3AAB5; background: transparent; border: 0; min-height: 40px; padding: 0 6px; cursor: pointer">Reset</button>'
           '<a href="Accounts.dc.html" style="font-size: 13px; color: #A3AAB5; min-height: 40px; display: flex; align-items: center; padding: 0 6px">Manage accounts</a></div>'
           '<p style="margin: 0; padding: 6px 10px 8px; font-size: 12px; color: #8C939F">This only changes the numbers. Examples from every account stay in your playbook.</p>'
           '</fieldset>')
    btn = (f'<button type="button" aria-haspopup="true" aria-expanded="{{{{ apOpen }}}}" onClick="{{{{ apToggle }}}}" class="btn btn-g" style="gap: 10px; font-weight: 500; position: relative; z-index: 5">'
           f'{IC["acct"]}<span>{{{{ apLabel }}}}</span><span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')
    return (f'<div style="position: relative; display: inline-flex">{btn}'
            f'<sc-if value="{{{{ apOpen }}}}" hint-placeholder-val="{{{{ false }}}}">{backdrop()}{box}</sc-if></div>')

TOAST = ('<sc-if value="{{ toastOn }}" hint-placeholder-val="{{ false }}"><div role="status" style="position: fixed; z-index: 20; left: 50%; bottom: 28px; transform: translateX(-50%); '
         'display: flex; align-items: center; gap: 16px; padding: 10px 10px 10px 18px; background: #ECEEF1; color: #0E1014; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-size: 14px; white-space: nowrap">'
         '<span>{{ toastMsg }}</span>'
         '<sc-if value="{{ toastCanUndo }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ toastUndo }}" style="font: inherit; font-size: 14px; font-weight: 600; color: #0E1014; background: transparent; border: 1px solid #A3AAB5; border-radius: 8px; padding: 0 12px; min-height: 34px; cursor: pointer">Undo</button></sc-if>'
         '</div></sc-if>')

ACCTS_JS = _kj.dumps([[n, p] for n, t, p in ACCTS])
DEF_ACCTS_JS = _kj.dumps([n for n, t, p in ACCTS if not p])

# Shared methods, pasted into any frame's Component class that uses the kit.
KIT_METHODS = """
kitVals() {
  const st = this.state || {};
  const ALL = %s, DEF = %s;
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
""" % (ACCTS_JS, DEF_ACCTS_JS)
