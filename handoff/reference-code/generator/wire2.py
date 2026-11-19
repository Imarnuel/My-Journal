# WIRE v2: the remaining screens get the same kit behaviours, applied by kind of control.
#  choice chips -> one pressed at a time;  switches -> flip;  selects -> kit menu;  actions -> state + toast with Undo.
import json as _wj

CSS += (".kchip{background:transparent!important;color:#ECEEF1!important;border-color:#353B46!important;font-weight:500!important}"
        ".kchip[aria-pressed=\"true\"]{background:#ECEEF1!important;color:#0E1014!important;border-color:#ECEEF1!important;font-weight:600!important}")

def _sw_html(key, label, extra_style=""):
    on = switch(True, label).replace('<button type="button"', f'<button type="button" onClick="{{{{ {key}Flip }}}}"', 1)
    off = switch(False, label).replace('<button type="button"', f'<button type="button" onClick="{{{{ {key}Flip }}}}"', 1)
    return f'<sc-if value="{{{{ {key}On }}}}" hint-placeholder-val="{{{{ true }}}}">{on}</sc-if><sc-if value="{{{{ {key}Off }}}}" hint-placeholder-val="{{{{ false }}}}">{off}</sc-if>'

def w_switch(h, label, key):
    for on in (True, False):
        s = switch(on, label)
        if s in h:
            return h.replace(s, _sw_html(key, label), 1)
    raise AssertionError("switch not found: " + label)

def _sel_html(key, label, width=240, right=False):
    btn = (f'<button type="button" aria-haspopup="listbox" aria-expanded="{{{{ {key}Exp }}}}" aria-label="{label}: {{{{ {key}Val }}}}" onClick="{{{{ {key}Toggle }}}}" class="btn btn-g" style="font-weight: 500; gap: 10px; position: relative; z-index: 5">'
           f'{{{{ {key}Val }}}}<span style="color: #8C939F; display: flex">{IC["chev"]}</span></button>')
    side = "right: 0" if right else "left: 0"
    menu = (f'<div role="listbox" aria-label="{label}" style="{MENU_BOX}; {side}; width: {width}px"><sc-for list="{{{{ {key}Opts }}}}" as="o" hint-placeholder-count="4">'
            f'<button type="button" role="option" aria-selected="{{{{ o.selS }}}}" onClick="{{{{ o.pick }}}}" class="kit-opt" style="{OPT}; background: {{{{ o.bg }}}}"><span>{{{{ o.label }}}}</span>'
            f'<sc-if value="{{{{ o.sel }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display: flex">{IC["check"]}</span></sc-if></button></sc-for></div>')
    return f'<span style="position: relative; display: inline-flex">{btn}<sc-if value="{{{{ {key}Open }}}}" hint-placeholder-val="{{{{ false }}}}">{backdrop()}{menu}</sc-if></span>'

def w_select(h, exact, key, label, right=True):
    assert exact in h, exact[:80]
    return h.replace(exact, _sel_html(key, label, right=right), 1)

def w_chips(h, labels, key):
    for i, lab in enumerate(labels):
        pat = None
        for pressed in ("true", "false"):
            a = h.find(f'<button type="button" aria-pressed="{pressed}" style="font: inherit; font-size: 14px; font-weight: {600 if pressed == "true" else 500};')
            while a != -1:
                e = h.index("</button>", a)
                if h[h.index(">", a) + 1:e] == lab:
                    pat = (a, e); break
                a = h.find(f'<button type="button" aria-pressed="{pressed}"', a + 10)
            if pat: break
        assert pat, lab
        a, e = pat
        tag = h[a:h.index(">", a) + 1]
        import re as _wre
        new = _wre.sub(r'aria-pressed="(true|false)"', f'aria-pressed="{{{{ {key}{i}p }}}}" onClick="{{{{ {key}{i} }}}}" class="kchip"', tag)
        h = h[:a] + new + h[a + len(tag):]
    return h

def w_btn(h, exact_text, hole, cls_hint=None, nth=0):
    import re as _wre
    ms = [m for m in _wre.finditer(r'<button type="button"([^>]*)>' + _wre.escape(exact_text) + r'</button>', h)]
    assert len(ms) > nth, exact_text
    m = ms[nth]
    return h[:m.start()] + f'<button type="button" onClick="{{{{ {hole} }}}}"{m.group(1)}>{exact_text}</button>' + h[m.end():]

def gen_js(choices={}, switches={}, selects={}, body="", ret=""):
    js = ["renderVals() {", "  const st = this.state || {};", "  const kit = this.kitVals();", "  const km = st.kmenu || null;", "  const g = (k, d) => (k in st ? st[k] : d);"]
    js.append(body)
    out = []
    for k, (opts, d) in choices.items():
        js.append(f"  const {k} = g('{k}', {_wj.dumps(d)});")
        for i, o in enumerate(opts):
            out.append(f"{k}{i}p: {k} === {_wj.dumps(o)} ? 'true' : 'false', {k}{i}: () => this.setState({{ {k}: {_wj.dumps(o)} }}),")
    for k, d in switches.items():
        js.append(f"  const {k} = g('{k}', {'true' if d else 'false'});")
        out.append(f"{k}On: {k}, {k}Off: !{k}, {k}Flip: () => this.setState({{ {k}: !{k} }}),")
    for k, (opts, d) in selects.items():
        js.append(f"  const {k} = g('{k}', {_wj.dumps(d)});")
        out.append(f"{k}Val: {k}, {k}Open: km === '{k}', {k}Exp: km === '{k}' ? 'true' : 'false', {k}Toggle: () => this.setState({{ kmenu: km === '{k}' ? null : '{k}' }}),"
                   f" {k}Opts: {_wj.dumps(opts)}.map((o) => ({{ label: o, sel: o === {k}, selS: o === {k} ? 'true' : 'false', bg: o === {k} ? '#1B1F27' : 'transparent', pick: () => this.setState({{ {k}: o, kmenu: null }}) }})),")
    js.append("  return Object.assign(kit, {\n    " + "\n    ".join(out) + "\n" + ret + "\n  });\n}")
    return "\n".join(js) + "\n" + KIT_METHODS

# ---------------- SETTINGS ----------------
_s = settings
_s = w_select(_s, select("Saturday", "Review day"), "rday", "Review day")
_s = w_select(_s, select("8:00 pm", "Reminder time"), "rtime", "Reminder time")
_s = w_select(_s, select("Lagos (UTC+1)", "Time zone"), "tz", "Time zone")
_s = w_select(_s, select("English", "Voice note language"), "lang", "Voice note language")
for _lab, _k in (("Reminder", "remind"), ("Keep recordings", "keep")):
    _s = w_switch(_s, _lab, _k)
_s = w_btn(_s, "Merge", "merge")
_s = w_btn(_s, "Edit session times", "editSess")
_s = w_btn(_s, "Manage tags", "manageTags")
# the look-alike merge prompt hides once answered
_mp0 = _s.index('<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid #353B46; margin-bottom: 8px">')
_mp1 = _s.index('</div>', _s.index('onClick="{{ merge }}"')) + len('</div>')
_s = _s[:_mp0] + '<sc-if value="{{ mergeOn }}" hint-placeholder-val="{{ true }}">' + _s[_mp0:_mp1] + '</sc-if>' + _s[_mp1:]
# session times: read-only rows, or time inputs while editing
_SESS = [("Asia", "01:00", "10:00"), ("London", "09:00", "17:30"), ("New York", "14:00", "23:00")]
_ro = "".join(f'<div style="display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #1B1F27; font-size: 14px"><span>{n}</span><span class="num">{a} to {b}</span></div>' for n, a, b in _SESS)
assert _ro in _s
_s = _s.replace(_ro, ('<sc-for list="{{ sess }}" as="x" hint-placeholder-count="3"><div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #1B1F27; font-size: 14px; min-height: 44px"><span>{{ x.n }}</span>'
     '<sc-if value="{{ sessView }}" hint-placeholder-val="{{ true }}"><span class="num">{{ x.txt }}</span></sc-if>'
     '<sc-if value="{{ sessEdit }}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #A3AAB5">'
     '<input type="time" aria-label="{{ x.aLabel }}" value="{{ x.a }}" onChange="{{ x.setA }}" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 6px 8px; color-scheme: dark">to'
     '<input type="time" aria-label="{{ x.bLabel }}" value="{{ x.b }}" onChange="{{ x.setB }}" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #353B46; border-radius: 8px; padding: 6px 8px; color-scheme: dark"></span></sc-if></div></sc-for>'), 1)
_s = _s.replace('<button type="button" onClick="{{ editSess }}" class="btn btn-q" style="padding: 0 4px; margin-top: 4px">Edit session times</button>',
                '<div style="display: flex; gap: 8px; margin-top: 4px"><button type="button" onClick="{{ editSess }}" class="btn btn-q" style="padding: 0 4px">{{ sessBtn }}</button><sc-if value="{{ sessEdit }}" hint-placeholder-val="{{ false }}"><button type="button" onClick="{{ sessReset }}" class="btn btn-q" style="padding: 0 4px; color: #8C939F">Reset to defaults</button></sc-if></div>')
# tags: counts come from the tags actually in use; Manage tags opens the full list
_s = _s.replace('<span style="font-size: 14px">Tags <span style="color: #8C939F">(18)</span></span><span class="lbl">8 good · 7 mistakes · 3 neutral.', '<span style="font-size: 14px">Tags <span style="color: #8C939F">({{ nTags }})</span></span><span class="lbl">{{ tagMix }}.')
assert "{{ tagMix }}" in _s
_s = _s.replace('<button type="button" onClick="{{ manageTags }}" class="btn btn-q" style="padding: 0 4px; margin-top: 4px">Manage tags</button>',
                '<button type="button" onClick="{{ manageTags }}" aria-expanded="{{ tagsExp }}" class="btn btn-q" style="padding: 0 4px; margin-top: 4px">{{ tagsBtn }}</button>'
                '<sc-if value="{{ tagsOpen }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; margin-top: 6px"><sc-for list="{{ tagList }}" as="t" hint-placeholder-count="5">'
                '<div style="display: grid; grid-template-columns: minmax(0, 1fr) 90px 110px 40px; gap: 12px; align-items: center; padding: 6px 0; border-top: 1px solid #1B1F27; min-height: 44px">'
                '<input class="ghost" type="text" aria-label="{{ t.renameLabel }}" value="{{ t.t }}" onChange="{{ t.rename }}" style="font-size: 14px">'
                '<span class="lbl">{{ t.k }}</span><span class="lbl" style="text-align: right">{{ t.used }}</span>'
                '<button type="button" aria-label="{{ t.rmLabel }}" onClick="{{ t.rm }}" style="width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #8C939F; cursor: pointer; font-size: 16px">×</button></div></sc-for></div></sc-if>', 1)
assert "{{ tagList }}" in _s
settings = _s + TOAST
settings_script = gen_js(
    switches={"remind": True, "keep": True},
    selects={"rday": (["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "Saturday"),
             "rtime": (["6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm"], "8:00 pm"),
             "tz": (["Lagos (UTC+1)", "London (UTC+0)", "New York (UTC−5)", "Dubai (UTC+4)", "Singapore (UTC+8)"], "Lagos (UTC+1)"),
             "lang": (["English", "French", "Spanish", "Portuguese", "Arabic"], "English")},
    body="  const V0 = %s, S0 = %s;\n  const V = st.vocab || V0, SS = st.sess || S0;" % (_wj.dumps(VOCAB), _wj.dumps([list(x) for x in _SESS])),
    ret="""    mergeOn: !st.merged, merge: () => { this.setState({ merged: true }); this.toast('Merged into Break of structure. Old stories updated.', { merged: false }); },
    sess: SS.map((x, i) => ({ n: x[0], a: x[1], b: x[2], txt: x[1] + ' to ' + x[2], aLabel: x[0] + ' starts', bLabel: x[0] + ' ends',
      setA: (e) => { const n = SS.map((y) => y.slice()); n[i][1] = e.target.value; this.setState({ sess: n }); }, setB: (e) => { const n = SS.map((y) => y.slice()); n[i][2] = e.target.value; this.setState({ sess: n }); } })),
    sessView: !st.sessEdit, sessEdit: !!st.sessEdit, sessBtn: st.sessEdit ? 'Done' : 'Edit session times', editSess: () => this.setState({ sessEdit: !st.sessEdit }),
    sessReset: () => this.setState({ sess: S0 }),
    nTags: String(V.length), tagMix: ['Good', 'Mistake', 'Neutral'].map((k) => { const n = V.filter((v) => v.k === k).length; return n + ' ' + (k === 'Good' ? 'good' : k === 'Mistake' ? (n === 1 ? 'mistake' : 'mistakes') : 'neutral'); }).join(' \\u00b7 '),
    tagsOpen: !!st.tagsOpen, tagsExp: st.tagsOpen ? 'true' : 'false', tagsBtn: st.tagsOpen ? 'Done' : 'Manage tags', manageTags: () => this.setState({ tagsOpen: !st.tagsOpen }),
    tagList: V.map((v, i) => ({ t: v.t, k: v.k, used: 'used ' + v.n + (v.n === 1 ? ' time' : ' times'), renameLabel: 'Rename ' + v.t, rmLabel: 'Remove ' + v.t,
      rename: (e) => { const n = V.slice(); n[i] = Object.assign({}, v, { t: e.target.value }); this.setState({ vocab: n }); },
      rm: () => { this.setState({ vocab: V.filter((_, j) => j !== i) }); this.toast('Removed ' + v.t + ' from ' + v.n + ' stories', { vocab: V }); } })),""")

# ---------------- ACCOUNTS ----------------
_a = accounts
_a = w_select(_a, '<button type="button" class="btn btn-g" aria-haspopup="listbox" style="font-weight: 500; gap: 10px">Challenge 50K<span style="color: #8C939F; display: flex">' + IC["chev"] + '</span></button>', "dflt", "Screenshots with no MT5 match go to")
_a = w_select(_a, '<button type="button" class="btn btn-g" aria-haspopup="listbox" style="font-weight: 500; gap: 10px">Attach to both<span style="color: #8C939F; display: flex">' + IC["chev"] + '</span></button>', "copy", "Copied trades")
_x0 = _a.index('<button type="button" aria-expanded="false" style="font: inherit; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 16px; min-height: 56px;')
_x1 = _a.index('</button>', _x0) + len('</button>')
_xb = _a[_x0:_x1].replace('aria-expanded="false"', 'aria-expanded="{{ arcExp }}" onClick="{{ arcToggle }}"', 1).replace('<span>Archived <span style="color: #8C939F">(2)</span> · Challenge 25K, Funded 50K</span>', '<span>{{ arcLabel }}</span>')
_a = _a[:_x0] + _xb + ('<sc-if value="{{ arcOpen }}" hint-placeholder-val="{{ false }}"><sc-for list="{{ arcList }}" as="x" hint-placeholder-count="2"><div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 16px; border-top: 1px solid #1B1F27; min-height: 44px">'
                         '<span style="font-size: 14px">{{ x.n }}</span><span class="lbl">{{ x.sub }}</span><button type="button" class="btn btn-q" onClick="{{ x.restore }}">Restore</button></div></sc-for></sc-if>') + _a[_x1:]
accounts = _a + TOAST
accounts_script = gen_js(body="  const AR0 = [['Challenge 25K', 'Prop firm \\u00b7 failed in September \\u00b7 31 chart stories'], ['Funded 50K', 'Prop firm \\u00b7 reset in July \\u00b7 22 chart stories']];\n  const AR = st.ar || AR0;",
    ret="""    arcOpen: !!st.arcOpen, arcExp: st.arcOpen ? 'true' : 'false', arcToggle: () => this.setState({ arcOpen: !st.arcOpen }),
    arcLabel: 'Archived (' + AR.length + ')' + (AR.length ? ' \\u00b7 ' + AR.map((x) => x[0]).join(', ') : ''),
    arcList: AR.map((x) => ({ n: x[0], sub: x[1], restore: () => { this.setState({ ar: AR.filter((y) => y !== x) }); this.toast(x[0] + ' is back in your lists', { ar: AR }); } })),""", selects={"dflt": (["Main account", "Funded 100K", "Challenge 50K", "Demo account", "Backtesting"], "Challenge 50K"),
                                  "copy": (["Attach to both", "Only the first account", "Ask me each time"], "Attach to both")})

# ---------------- ADD / EDIT ACCOUNT ----------------
TYPES4 = ["Live", "Prop firm", "Demo", "Backtest"]
addacct = w_chips(addacct, TYPES4, "atype")
addacct = w_switch(addacct, "Practice account", "prac") if switch(False, "Practice account") in addacct or switch(True, "Practice account") in addacct else addacct
addacct = addacct.replace('<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">+ Your own type</button>',
                          '<sc-if value="{{ ownOff }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ ownOpen }}" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">+ Your own type</button></sc-if>'
                          '<sc-if value="{{ ownOn }}" hint-placeholder-val="{{ false }}"><input type="text" aria-label="Your own type" placeholder="e.g. Swing account" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #4A515E; border-radius: 999px; padding: 0 14px; min-height: 38px"></sc-if>')
import re as _wr3
_m3 = list(_wr3.finditer(r'<button type="button"([^>]*)>Add account</button>', addacct))[-1]
addacct = addacct[:_m3.start()] + '<a href="Accounts.dc.html"' + _m3.group(1).replace('type="button"', '') + '>Add account</a>' + addacct[_m3.end():]
addacct = addacct + TOAST
_ab = addacct_script[addacct_script.index("return {") + len("return {"): addacct_script.rindex("};")]
addacct_script = gen_js(choices={"atype": (TYPES4, "Prop firm")}, switches={"prac": False},
                        body="  const on = st.mt5 !== false; const con = !!st.connected;",
                        ret=_ab.strip().rstrip(",") + """,
    ownOn: !!st.own, ownOff: !st.own, ownOpen: () => this.setState({ own: true }),
""")
# practice is ticked for you on Demo and Backtest
addacct_script = addacct_script.replace("  const prac = g('prac', false);", "  const prac = g('prac', ['Demo', 'Backtest'].includes(g('atype', 'Prop firm')));")
addacct_script = addacct_script.replace("atype{i}: () => this.setState({ atype:", "atype{i}: () => this.setState({ atype:")
import re as _wre2
addacct_script = _wre2.sub(r"atype(\d): \(\) => this\.setState\(\{ atype: (\"[^\"]+\") \}\)", r"atype\1: () => this.setState({ atype: \2, prac: ['Demo', 'Backtest'].includes(\2) })", addacct_script)

edit_acct = w_chips(edit_acct, TYPES4, "etype")
edit_acct = w_switch(edit_acct, "Practice account", "eprac")
edit_acct = edit_acct.replace('<button type="button" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">+ Your own type</button>',
                              '<sc-if value="{{ ownOff }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ ownOpen }}" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 1px dashed #353B46; border-radius: 999px; padding: 0 14px; min-height: 38px; cursor: pointer">+ Your own type</button></sc-if>'
                              '<sc-if value="{{ ownOn }}" hint-placeholder-val="{{ false }}"><input type="text" aria-label="Your own type" placeholder="e.g. Swing account" style="font: inherit; font-size: 14px; color: #ECEEF1; background: #0E1014; border: 1px solid #4A515E; border-radius: 999px; padding: 0 14px; min-height: 38px"></sc-if>')
import re as _wr4
_m4 = list(_wr4.finditer(r'<button type="button"([^>]*)>Save changes</button>', edit_acct))[-1]
edit_acct = edit_acct[:_m4.start()] + '<a href="Accounts.dc.html"' + _m4.group(1) + '>Save changes</a>' + edit_acct[_m4.end():]
for _t, _h in (("Reconnect", "reconnect"), ("Archive", "archAcct"), ("Delete", "delAcct")):
    edit_acct = w_btn(edit_acct, _t, _h)
edit_acct = ('<sc-if value="{{ alive }}" hint-placeholder-val="{{ true }}"><sc-if value="{{ arch }}" hint-placeholder-val="{{ false }}"><div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 1px solid #353B46"><span class="meta">Archived. It has left your account lists; its chart stories stay in your playbook.</span><button type="button" class="btn btn-q" onClick="{{ unarch }}" style="margin-left: auto">Restore</button></div></sc-if>'
             + edit_acct + '</sc-if><sc-if value="{{ gone }}" hint-placeholder-val="{{ false }}"><div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 120px 0"><span style="font-size: 18px; font-weight: 600">Funded 100K deleted</span><span class="meta">Its 46 chart stories are gone and your numbers no longer include them.</span><div style="display: flex; gap: 8px"><button type="button" class="btn btn-g" onClick="{{ undel }}">Undo</button><a href="Accounts.dc.html" class="btn btn-p">Back to accounts</a></div></div></sc-if>' + TOAST)
edit_acct_script = gen_js(choices={"etype": (TYPES4, "Prop firm")}, switches={"eprac": False},
                          ret="""    ownOn: !!st.own, ownOff: !st.own, ownOpen: () => this.setState({ own: true }),
    reconnect: () => this.toast('Reconnected. Synced just now.', null),
    alive: !st.gone, gone: !!st.gone, arch: !!st.arch, unarch: () => this.setState({ arch: false }), undel: () => this.setState({ gone: false }),
    archAcct: () => { this.setState({ arch: true }); this.toast('Funded 100K archived', { arch: false }); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {} },
    delAcct: () => this.setState({ gone: true }),""")

# ---------------- NEW SETUP (rules editor) ----------------
_se = setup_edit
_rules = {"Context": ["Daily trend is bullish", "Price sweeps the Asian session low"], "Entry": ["15m breaks structure after the sweep", "Enter on the retest"], "Exit": ["Stop below the sweep", "Target the previous high"]}
RULES_LIST = lambda grp: (f'<sc-for list="{{{{ r{grp} }}}}" as="x" hint-placeholder-count="2"><div style="display: flex; align-items: center; gap: 10px; border-top: 1px solid #1B1F27; padding: 6px 0">'
                          '<span aria-hidden="true" style="color: #8C939F; cursor: grab; font-size: 14px">⋮⋮</span>'
                          '<input class="ghost" type="text" aria-label="Rule" value="{{ x.t }}" onChange="{{ x.set }}" placeholder="Describe the rule" style="flex: 1">'
                          '<button type="button" aria-label="Remove rule" onClick="{{ x.rm }}" style="width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #8C939F; cursor: pointer; font-size: 16px">×</button></div></sc-for>'
                          f'<button type="button" onClick="{{{{ add{grp} }}}}" style="font: inherit; font-size: 14px; color: #A3AAB5; background: transparent; border: 0; border-top: 1px solid #1B1F27; text-align: left; padding: 10px 0; cursor: pointer">+ Add a rule</button>')
for _g, _rs in _rules.items():
    _blk = "".join(RULE(r) for r in _rs) + ADD_RULE
    assert _blk in _se, _g
    _se = _se.replace(_blk, RULES_LIST(_g), 1)
setup_edit = _se + TOAST
setup_edit_script = gen_js(
    body="  const R0 = %s;\n  const R = st.rules || R0;\n  const mk = (grp) => R[grp].map((t, i) => ({ t: t, set: (e) => { const n = Object.assign({}, R); n[grp] = R[grp].slice(); n[grp][i] = e.target.value; this.setState({ rules: n }); }, rm: () => { const n = Object.assign({}, R); n[grp] = R[grp].filter((_, j) => j !== i); this.setState({ rules: n }); this.toast('Rule removed', { rules: R }); } }));\n  const add = (grp) => () => { const n = Object.assign({}, R); n[grp] = R[grp].concat(['']); this.setState({ rules: n }); };" % _wj.dumps(_rules),
    ret="    rContext: mk('Context'), rEntry: mk('Entry'), rExit: mk('Exit'), addContext: add('Context'), addEntry: add('Entry'), addExit: add('Exit'),")

# ---------------- FIRST RUN and STATES ----------------
startpage = startpage.replace('<button type="button" class="btn btn-q">Skip for now</button>', '<a href="Dashboard.dc.html" class="btn btn-q">Skip for now</a>')
assert "Skip for now</a>" in startpage
states = states.replace('<button type="button" class="btn btn-q">Type instead</button>', '<a href="NewStory.dc.html" class="btn btn-q">Type instead</a>')
states = states.replace('<button type="button" class="btn btn-g">Replace</button>', '<a href="Story.dc.html" class="btn btn-g">Replace</a>')
import re as _wr5
states = _wr5.sub(r'<button type="button" class="btn btn-g">(<svg.*?</svg>)Record again</button>', r'<a href="NewStory.dc.html" class="btn btn-g">\1Record again</a>', states, flags=_wr5.S)
states = states.replace('<button type="button" class="btn btn-q">Type the numbers</button>', '<a href="Story.dc.html" class="btn btn-q">Type the numbers</a>')
